"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import { Button } from "@blueshift-gg/ui-components";
import { Icon } from "@blueshift-gg/ui-components";
import { useTranslations } from "next-intl";
import ClientChallengeTable from "./ClientChallengeTable";
import { motion, useDragControls } from "motion/react";
import { anticipate } from "motion";
import {
  useEsbuildRunner,
  FetchDecision,
  InterceptedRpcCallData,
  InterceptedWsSendData,
  WsSendDecision,
  InterceptedWsReceiveData,
  WsReceiveDecision,
} from "@/hooks/useEsbuildRunner";
import { useChallengeVerifier } from "@/hooks/useChallengeVerifier";
import { Transaction } from "@solana/web3.js";
import bs58 from "bs58";
import BlueshiftEditor from "@/app/components/TSChallengeEnv/BlueshiftEditor";
import LogoGlyph from "../Logo/LogoGlyph";
import { useAuth } from "@/hooks/useAuth";
import WalletMultiButton from "@/app/components/Wallet/WalletMultiButton";
import { ChallengeMetadata } from "@/app/utils/challenges";
import { useAutoSave } from "@/hooks/useAutoSave";
import classNames from "classnames";
import { useWindowSize } from "usehooks-ts";
import ChallengeCompleted from "../Modals/ChallengeComplete";
import { usePersistentStore } from "@/stores/store";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
const rpcEndpoint = process.env.NEXT_PUBLIC_MAINNET_RPC_ENDPOINT;

/**
 * Props for the ChallengesContent component
 */
interface ChallengesContentProps {
  /** Current challenge metadata */
  currentChallenge: ChallengeMetadata;
  /** Challenge content (currently unused) */
  content: ReactNode;
}

/**
 * Main component for displaying and interacting with coding challenges
 * Includes code editor, auto-save functionality, and challenge verification
 */
export default function ChallengesContent({
  currentChallenge,
}: ChallengesContentProps) {
  const auth = useAuth();
  const isUserConnected = auth.status === "signed-in";
  const t = useTranslations();

  const [editorCode, setEditorCode] = useState<string>("");
  const [initialEditorCode, setInitialEditorCode] = useState<string>("");
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [wasSendTransactionIntercepted, setWasSendTransactionIntercepted] =
    useState(false);
  const [
    verificationFailureMessageLogged,
    setVerificationFailureMessageLogged,
  ] = useState(false);

  // Modal state
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [allowRedo, setAllowRedo] = useState(false);
  const { setChallengeStatus, challengeStatuses } = usePersistentStore();

  // Auto-save functionality
  const {
    getAutoSavedCode,
    clearSavedCode,
    saveState,
    justSaved,
    loadedFromAutoSave,
    markAsLoadedFromAutoSave,
    clearLoadedFromAutoSave,
  } = useAutoSave({
    challengeSlug: currentChallenge.slug,
    code: editorCode,
    delay: 2000, // Auto-save after 2 seconds of inactivity
  });

  const handleRpcCallForDecision = async (
    rpcData: InterceptedRpcCallData
  ): Promise<FetchDecision> => {
    if (rpcData.rpcMethod === "sendTransaction") {
      setWasSendTransactionIntercepted(true);
      const base64EncodedTx = rpcData.body?.params?.[0];

      if (uploadTransaction && base64EncodedTx) {
        // Upload transaction for verification in background
        uploadTransaction(base64EncodedTx).catch((err) => {
          console.error("Error uploading transaction:", err);
        });
      }

      const tx = Transaction.from(Buffer.from(base64EncodedTx, "base64"));
      const mockSignature = bs58.encode(tx?.signature ?? []);

      return {
        decision: "MOCK_SUCCESS",
        responseData: {
          body: {
            jsonrpc: "2.0",
            result: mockSignature,
            id: rpcData.body?.id || "mocked-id",
          },
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        },
      };
    }

    return { decision: "PROCEED" };
  };

  const handleWsSendForDecision = async (
    wsSendData: InterceptedWsSendData
  ): Promise<WsSendDecision> => {
    const targetHost = new URL(rpcEndpoint!).host;

    if (wsSendData.url.includes(targetHost)) {
      if (
        typeof wsSendData.data === "string" &&
        wsSendData.data.includes("signatureSubscribe")
      ) {
        const data = JSON.parse(wsSendData.data);

        // Generate random subscription id and slot
        const subscriptionId = Math.floor(Math.random() * 1000000);
        const slot = Math.floor(Math.random() * 1000000);

        const subscriptionConfirmation = {
          jsonrpc: "2.0",
          result: subscriptionId,
          id: data.id,
        };

        const signatureNotification = {
          jsonrpc: "2.0",
          method: "signatureNotification",
          params: {
            result: {
              context: { slot },
              value: { err: null },
            },
            subscription: subscriptionId,
          },
        };

        return {
          decision: "BLOCK",
          mockedReceives: [
            JSON.stringify(subscriptionConfirmation),
            JSON.stringify(signatureNotification),
          ],
        };
      }
    }

    return { decision: "PROCEED" };
  };

  const handleWsReceiveForDecision = async (
    _wsReceiveData: InterceptedWsReceiveData
  ): Promise<WsReceiveDecision> => {
    return { decision: "PROCEED" };
  };

  const {
    esBuildInitializationState,
    isRunning: isCodeRunning,
    logs: runnerLogs,
    error: runnerError,
    addLog,
    runCode,
    clearLogs,
  } = useEsbuildRunner({
    onRpcCallInterceptedForDecision: handleRpcCallForDecision,
    onWsSendInterceptedForDecision: handleWsSendForDecision,
    onWsReceiveInterceptedForDecision: handleWsReceiveForDecision,
  });

  useEffect(() => {
    if (!apiBaseUrl) {
      console.error(
        "API Base URL is not defined in the environment variables."
      );
    }
  }, []);

  useEffect(() => {
    const fetchSolutionsTemplate = async () => {
      try {
        const codeModule = await import(
          `@/app/content/challenges/${currentChallenge.slug}/challenge.ts.template?raw`
        );
        const template = codeModule.default;

        setInitialEditorCode(template);

        // Only check for auto-saved code on initial load, not on subsequent auto-save updates
        if (!hasInitiallyLoaded) {
          const autoSaved = getAutoSavedCode();
          if (autoSaved && autoSaved.trim() !== "" && autoSaved !== template) {
            setEditorCode(autoSaved);
            markAsLoadedFromAutoSave();
          } else {
            setEditorCode(template);
          }
          setHasInitiallyLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load challenge template:", err);
        const errorTemplate =
          "// Failed to load challenge template. Please check console.";
        setEditorCode(errorTemplate);
        setInitialEditorCode(errorTemplate);
        if (!hasInitiallyLoaded) {
          setHasInitiallyLoaded(true);
        }
      }
    };

    if (currentChallenge.slug) {
      fetchSolutionsTemplate();
    }
  }, [
    currentChallenge.slug,
    hasInitiallyLoaded,
    getAutoSavedCode,
    markAsLoadedFromAutoSave,
  ]);

  // Reset initial load flag when challenge changes
  useEffect(() => {
    setHasInitiallyLoaded(false);
    clearLoadedFromAutoSave();
  }, [currentChallenge.slug, clearLoadedFromAutoSave]);

  // Effect to check for missing sendTransaction after code execution
  useEffect(() => {
    // Check specifically when isCodeRunning transitions from true to false
    // and if there's a system log indicating successful completion.
    const executionCompletedLog = runnerLogs.find(
      (log) =>
        log.type === "SYSTEM" &&
        Array.isArray(log.payload) &&
        log.payload[0] === "Execution complete."
    );

    if (
      !isCodeRunning &&
      executionCompletedLog &&
      !runnerError &&
      !wasSendTransactionIntercepted &&
      !verificationFailureMessageLogged
    ) {
      const errorMessage = "No transaction was sent by the solution code.";
      addLog("VERIFICATION_ERROR", errorMessage);
      setVerificationFailureMessageLogged(true);
    }
  }, [
    isCodeRunning,
    runnerLogs,
    runnerError,
    wasSendTransactionIntercepted,
    verificationFailureMessageLogged,
    addLog,
  ]);

  const {
    isLoading: isVerificationLoading,
    error: verificationHookError,
    uploadTransaction,
    requirements,
    completedRequirementsCount,
    allIncomplete: allIncompleteVerification,
    verificationData,
    setRequirements,
    initialRequirements,
    setVerificationData,
  } = useChallengeVerifier({ challenge: currentChallenge });

  // Effect to handle challenge completion modal
  useEffect(() => {
    if (verificationData) {
      const allRequirementsPassed = requirements.every(
        (req) => req.status === "passed"
      );
      if (allRequirementsPassed) {
        setTimeout(() => {
          if (challengeStatuses[currentChallenge.slug] === "open") {
            setChallengeStatus(currentChallenge.slug, "completed");
          }
          setIsCompletedModalOpen(true);
          setAllowRedo(false);
        }, 1000);
      }
    }
  }, [
    verificationData,
    requirements,
    setChallengeStatus,
    currentChallenge.slug,
    challengeStatuses,
  ]);

  const handleRunCode = () => {
    if (esBuildInitializationState !== "initialized") {
      // Show user-friendly error without blocking alert
      addLog(
        "SYSTEM",
        "Code runner is still initializing. Please wait a moment and try again."
      );
      return;
    }
    clearLogs();
    setWasSendTransactionIntercepted(false);
    setVerificationFailureMessageLogged(false);

    runCode(editorCode).catch((error) => {
      console.error("Error running code:", error);
      addLog(
        "SYSTEM",
        "An error occurred while running your code. Please try again."
      );
    });
  };

  const handleRedoChallenge = () => {
    setVerificationData(null);
    setRequirements(initialRequirements);
    clearLogs();
    setWasSendTransactionIntercepted(false);
    setVerificationFailureMessageLogged(false);
    clearSavedCode();
    clearLoadedFromAutoSave();
    setHasInitiallyLoaded(false);
    setEditorCode(initialEditorCode);
    setAllowRedo(true);
    setIsCompletedModalOpen(false);
  };

  const [tab, setTab] = useState<"logs" | "editor">("editor");

  const { width } = useWindowSize();
  const isMobile = width < 1024;
  const [editorHeight, setEditorHeight] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragControls = useDragControls();
  const editorRef = useRef<HTMLDivElement>(null);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (_event: any, info: any) => {
    if (!isMobile || !editorRef.current) return;

    // Calculate height constraints in dvh
    const minHeight = window.innerHeight * 0.6;
    const maxHeight = window.innerHeight * 0.9;

    const currentHeight = editorHeight;
    const dragDelta = -info.delta.y; // Invert because dragging up should increase height
    const newHeight = Math.min(
      Math.max(currentHeight + dragDelta, minHeight),
      maxHeight
    );

    setEditorHeight(newHeight);
  };

  const handleDragEnd = () => {
    setIsDragging(false);

    if (!isMobile) return;

    // Define snap points in dvh
    const snapPoints = [
      window.innerHeight * 0.6, // 60dvh (minimum)
      window.innerHeight * 0.75, // 75dvh
      window.innerHeight * 0.9, // 90dvh (maximum)
    ];

    // Find the closest snap point
    const snapThreshold = window.innerHeight * 0.05; // 5dvh threshold
    let closestSnap = editorHeight;
    let minDistance = Infinity;

    snapPoints.forEach((snapPoint) => {
      const distance = Math.abs(editorHeight - snapPoint);
      if (distance < snapThreshold && distance < minDistance) {
        minDistance = distance;
        closestSnap = snapPoint;
      }
    });

    // Apply snap if we found a close snap point
    if (closestSnap !== editorHeight) {
      // Smooth animation to snap point
      const animateToSnap = () => {
        const startHeight = editorHeight;
        const targetHeight = closestSnap;
        const startTime = Date.now();
        const duration = 200; // 200ms animation

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Ease out cubic function for smooth animation
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentHeight =
            startHeight + (targetHeight - startHeight) * easeOut;

          setEditorHeight(currentHeight);

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      };

      animateToSnap();
    }
  };

  // Handle window resize for mobile editor height
  useEffect(() => {
    if (isMobile) {
      const handleResize = () => {
        const newMinHeight = window.innerHeight * 0.6; // 60dvh
        const newMaxHeight = window.innerHeight * 0.9; // 90dvh

        // Adjust current height proportionally if needed
        if (editorHeight < newMinHeight) {
          setEditorHeight(newMinHeight);
        } else if (editorHeight > newMaxHeight) {
          setEditorHeight(newMaxHeight);
        }
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isMobile, editorHeight]);

  // Initialize editor height when switching to mobile
  useEffect(() => {
    if (isMobile && editorHeight === 0) {
      setEditorHeight(window.innerHeight * 0.6); // 60dvh default
    } else if (!isMobile) {
      setEditorHeight(0);
    }
  }, [isMobile, editorHeight]);

  return (
    <div className="relative w-full h-full">
      <ChallengeCompleted
        isOpen={isCompletedModalOpen && !allowRedo}
        onClose={() => setIsCompletedModalOpen(false)}
        challenge={currentChallenge}
      />
      {!isUserConnected ? (
        <div className="z-10 flex-col gap-y-8 flex py-12 items-center justify-center w-full min-h-[60vh]">
          <div className="flex flex-col gap-y-0 max-w-[90dvw]">
            <img
              src="/graphics/connect-wallet.svg"
              className="sm:w-[360px] max-w-[80dvw] w-full mx-auto"
            />
            <div className="flex flex-col gap-y-3">
              <div className="text-center text-lg sm:text-xl font-medium leading-none font-mono text-shade-primary">
                {t("ChallengePage.connect_wallet")}
              </div>
              <div className="text-center text-shade-secondary mx-auto sm:w-2/3 w-full">
                {t("ChallengePage.connect_wallet_description")}
              </div>
            </div>
          </div>
          <WalletMultiButton disabled={isVerificationLoading} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { duration: 0.4, ease: anticipate },
          }}
          exit={{ opacity: 0 }}
          className="lg:pb-20 max-w-app grid grid-cols-1 mx-auto w-full gap-y-12 lg:gap-x-12"
        >
          <div className="flex flex-col relative w-full h-full">
            <motion.div
              ref={editorRef}
              style={{
                height: isMobile ? `${editorHeight}px` : undefined,
                cursor: isDragging ? "grabbing" : undefined,
              }}
              className={classNames(
                "flex flex-col w-full z-10 fixed left-0 bottom-0",
                "lg:relative lg:h-full lg:min-h-[65dvh]",
                isDragging && "select-none"
              )}
            >
              <div className="w-full h-full flex flex-col overflow-hidden border border-border">
                <motion.div
                  drag={isMobile ? "y" : false}
                  dragControls={dragControls}
                  onDragStart={handleDragStart}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  dragMomentum={true}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0}
                  className="z-10 w-full py-3 relative px-4 bg-card-solid flex gap-y-4 lg:gap-y-0 flex-col lg:flex-row items-center justify-center lg:justify-start border-b border-border"
                >
                  {/* Mobile Thumb */}
                  <div className="h-[8px] w-[72px]  bg-card-solid-foreground mx-auto flex lg:hidden" />
                  <div className="items-center gap-x-2 hidden lg:flex">
                    <div className="w-[12px] h-[12px] bg-card-solid-foreground"></div>
                    <div className="w-[12px] h-[12px] bg-card-solid-foreground"></div>
                    <div className="w-[12px] h-[12px] bg-card-solid-foreground"></div>
                  </div>
                  <div className="text-sm font-medium text-shade-secondary lg:absolute lg:left-1/2 lg:-translate-x-1/2 flex items-center gap-x-1.5">
                    <Icon name="Challenge" size={12} />
                    <span className="flex-shrink-0">
                      {t(`challenges.${currentChallenge.slug}.title`)}
                    </span>
                  </div>
                </motion.div>
                <div className="lg:left-[1px] w-full lg:w-[calc(100%-2px)] py-2 bg-card-solid/20 backdrop-blur-xl border-b border-border z-20 justify-between px-4 flex items-center">
                  <LogoGlyph width={16} />
                  <div className="flex items-center gap-x-2.5">
                    <Button
                      variant="link"
                      icon={{ name: "Play", size: 12 }}
                      size="sm"
                      label={
                        isCodeRunning
                          ? t("ChallengePage.running_program_btn")
                          : t("ChallengePage.run_program_btn")
                      }
                      className="w-max !text-brand-primary"
                      onClick={() => {
                        handleRunCode();
                      }}
                      disabled={isVerificationLoading}
                    />
                    <Button
                      variant="link"
                      icon={{ name: "Logs", size: 12 }}
                      size="sm"
                      label={t("ChallengePage.view_logs_btn")}
                      className={classNames(
                        "w-max !text-brand-primary lg:hidden flex",
                        tab === "logs" && "hidden"
                      )}
                      onClick={() => {
                        setTab("logs");
                      }}
                      disabled={isVerificationLoading}
                    />

                    <Button
                      variant="link"
                      icon={{ name: "ArrowLeft", size: 12 }}
                      size="sm"
                      label={t("ChallengePage.back_to_editor_btn")}
                      className={classNames(
                        "w-max !text-brand-primary lg:hidden flex",
                        tab === "editor" && "hidden"
                      )}
                      onClick={() => {
                        setTab("editor");
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col lg:grid lg:grid-cols-3 w-full h-full">
                  <BlueshiftEditor
                    initialCode={editorCode}
                    onCodeChange={setEditorCode}
                    className="col-span-2 lg:max-h-full"
                    title={t(`challenges.${currentChallenge.slug}.title`)}
                    fileName="mint-an-spl-token.ts"
                    onRefresh={() => setEditorCode(initialEditorCode)}
                    saveState={saveState}
                    justSaved={justSaved}
                    loadedFromAutoSave={loadedFromAutoSave}
                  />
                  <ClientChallengeTable
                    isOpen={tab === "logs"}
                    onRunCodeClick={handleRunCode}
                    requirements={requirements}
                    completedRequirementsCount={completedRequirementsCount}
                    allIncomplete={allIncompleteVerification}
                    isLoading={isVerificationLoading}
                    error={verificationHookError}
                    verificationData={verificationData}
                    challenge={currentChallenge}
                    isCodeRunning={isCodeRunning}
                    runnerLogs={runnerLogs}
                    isEsbuildReady={
                      esBuildInitializationState === "initialized"
                    }
                    onRedoChallenge={handleRedoChallenge}
                    allowRedo={allowRedo}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
