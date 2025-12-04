"use client";

import classNames from "classnames";
import { anticipate } from "motion";
import BlueshiftEditor from "@/app/components/TSChallengeEnv/BlueshiftEditor";
import { motion } from "motion/react";
import {
  FetchDecision,
  InterceptedRpcCallData,
  InterceptedWsReceiveData,
  InterceptedWsSendData,
  useEsbuildRunner,
  WsReceiveDecision,
  WsSendDecision,
} from "@/hooks/useEsbuildRunner";
import { TestRequirement } from "@/app/components/TSChallengeEnv/types/test-requirements";
import { useEffect, useState } from "react";
import { Icon } from "@blueshift-gg/ui-components";
import { Button } from "@blueshift-gg/ui-components";
import LogoGlyph from "../Logo/LogoGlyph";
import { useTranslations } from "next-intl";

import { Transaction } from "@solana/web3.js";
import bs58 from "bs58";

const rpcEndpoint = process.env.NEXT_PUBLIC_CHALLENGE_RPC_ENDPOINT;

interface IDEProps {
  initialCode: string;
  fileName?: string;
  title: string;
}

export default function IDE({ initialCode, title, fileName }: IDEProps) {
  const [ideView, setIdeView] = useState<"minified" | "expanded">("minified");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [editorCode, setEditorCode] = useState<string>(initialCode);
  const [wasSendTransactionIntercepted, setWasSendTransactionIntercepted] =
    useState(false);
  const [
    verificationFailureMessageLogged,
    setVerificationFailureMessageLogged,
  ] = useState(false);

  const handleRpcCallForDecision = async (
    rpcData: InterceptedRpcCallData
  ): Promise<FetchDecision> => {
    console.log(
      "[ClientChallengesContent] Intercepted RPC Call, Awaiting Decision:",
      rpcData
    );

    if (rpcData.rpcMethod === "sendTransaction") {
      setWasSendTransactionIntercepted(true); // Keep this if useful for UI feedback
      const base64EncodedTx = rpcData.body?.params?.[0];

      console.log("got tx");

      const tx = Transaction.from(Buffer.from(base64EncodedTx, "base64"));
      const mockSignature = bs58.encode(tx?.signature ?? []);

      console.debug(
        `[ClientChallengesContent] Mocking successful response for sendTransaction. Signature: ${mockSignature}`
      );

      return {
        decision: "MOCK_SUCCESS",
        responseData: {
          body: {
            jsonrpc: "2.0",
            result: mockSignature, // The fake transaction signature
            id: rpcData.body?.id || "mocked-id", // Try to use original id or a placeholder
          },
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        },
      };
    }

    console.debug(
      `RPC call (${rpcData.rpcMethod}) to ${rpcData.url} will proceed.`
    );

    // For all other calls, or if rpcMethod is null, proceed as normal
    return { decision: "PROCEED" };
  };

  const handleWsSendForDecision = async (
    wsSendData: InterceptedWsSendData
  ): Promise<WsSendDecision> => {
    console.log(
      "[ClientChallengesContent] Intercepted WebSocket Send, Awaiting Decision:",
      wsSendData
    );

    const targetHost = new URL(rpcEndpoint!).host;

    if (wsSendData.url.includes(targetHost)) {
      if (
        typeof wsSendData.data === "string" &&
        wsSendData.data.includes("signatureSubscribe")
      ) {
        console.log(
          "[ClientChallengesContent] Intercepted WebSocket send for signatureSubscribe"
        );

        const data = JSON.parse(wsSendData.data);

        // random subscription id as integer
        const subscriptionId = Math.floor(Math.random() * 1000000);
        // random slot number as integer
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
              context: {
                slot: slot,
              },
              value: {
                err: null,
              },
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

    console.log(
      "[ClientChallengesContent] WebSocket send allowed to PROCEED:",
      wsSendData
    );
    return { decision: "PROCEED" };
  };

  const handleWsReceiveForDecision = async (
    wsReceiveData: InterceptedWsReceiveData
  ): Promise<WsReceiveDecision> => {
    console.log(
      "[ClientChallengesContent] Intercepted WebSocket Receive, Awaiting Decision:",
      wsReceiveData
    );

    return { decision: "PROCEED" };
  };

  const {
    esBuildInitializationState,
    isRunning: isCodeRunning,
    logs: runnerLogs,
    error: runnerError,
    addLog,
    runCode,
    clearLogs: clearRunnerLogs,
  } = useEsbuildRunner({
    onRpcCallInterceptedForDecision: handleRpcCallForDecision,
    onWsSendInterceptedForDecision: handleWsSendForDecision,
    onWsReceiveInterceptedForDecision: handleWsReceiveForDecision,
  });

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

  const handleRunCode = () => {
    if (esBuildInitializationState !== "initialized") {
      // TODO Consider using a toast notification or inline message instead of alert
      alert("Code runner is not ready yet. Please wait a moment.");
      return;
    }
    clearRunnerLogs();
    setWasSendTransactionIntercepted(false); // Reset flag before new run
    setVerificationFailureMessageLogged(false); // Reset verification failure flag
    runCode(editorCode).catch(console.error);
  };

  // Test requirements
  const requirements: TestRequirement[] = [
    {
      status: "incomplete",
      instructionKey: "test_1",
      title: "Test 1",
    },
  ];

  // Test verification data received from the backend
  const verificationData = {
    success: true,
    results: [
      {
        success: true,
        instruction: "test_1",
        compute_units_consumed: 1000,
        execution_time: 200,
        program_logs: ["Program log 1", "Program log 2"],
      },
    ],
  };

  // Used to indicate if there is some kind of error in the verification process
  const verificationError = null;
  // Indicate if the verification is in progress
  // TODO rename this to isVerifying
  const isVerificationLoading = false;

  const t = useTranslations();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { duration: 0.4, ease: anticipate },
      }}
      layoutId="ide-container"
      exit={{ opacity: 0 }}
      className={classNames(
        "py-4 max-w-app grid grid-cols-1 mx-auto w-full gap-y-12 min-h-[400px]",
        ideView === "expanded" &&
          "left-1/2 -translate-x-1/2 fixed !max-w-[90dvw] !bottom-0 !min-h-[300px] !py-0 backdrop-blur-xl z-50"
      )}
    >
      <div className="w-full h-full flex flex-col overflow-hidden border border-border">
        <div className="flex flex-col relative w-full h-full">
          <div className="w-full py-2.5 h-[36px] flex-shrink-0 z-30 relative px-4 bg-card-solid flex items-center border-b border-border">
            <div className="flex items-center gap-x-2">
              <div className="w-[12px] h-[12px] bg-card-solid-foreground"></div>
              <button
                className={classNames(
                  "w-[12px] h-[12px] bg-card-solid-foreground flex items-center justify-center group/minimize",
                  ideView === "expanded" && "!bg-[#FFBD2D]"
                )}
                onClick={() => setIdeView("minified")}
              >
                <Icon
                  className={classNames(
                    "opacity-0 transition-opacity duration-100",
                    ideView === "expanded" && "group-hover/minimize:opacity-100"
                  )}
                  name="Minimize"
                  size={8}
                />
              </button>
              <button
                className={classNames(
                  "w-[12px] h-[12px] bg-card-solid-foreground flex items-center justify-center group/expand",
                  ideView === "minified" && "!bg-[#28C840]"
                )}
                onClick={() => setIdeView("expanded")}
              >
                <Icon
                  className={classNames(
                    "opacity-0 transition-opacity duration-100",
                    ideView === "minified" && "group-hover/expand:opacity-100"
                  )}
                  name="Expand"
                  size={8}
                />
              </button>
            </div>
            <div className="text-sm font-medium text-shade-secondary absolute left-1/2 -translate-x-1/2 flex items-center gap-x-1.5">
              <Icon name="Challenge" size={12} className="hidden sm:block" />
              <span className="flex-shrink-0">{title}</span>
            </div>
          </div>
          <div className="w-[calc(100%-2px)] py-2 bg-card-solid/20 backdrop-blur-xl border-b border-border z-20 justify-between px-4 flex items-center">
            <LogoGlyph width={16} />
            <div className="flex items-center gap-x-2.5">
              {!isPanelOpen ? (
                <>
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
                    disabled={isVerificationLoading}
                    onClick={() => setIsPanelOpen(true)}
                  />
                  <Button
                    variant="link"
                    size="sm"
                    label={t("ChallengePage.view_logs_btn")}
                    className="w-max"
                    onClick={() => setIsPanelOpen(true)}
                  />
                </>
              ) : (
                <Button
                  variant="link"
                  size="sm"
                  label={t("ChallengePage.back_to_editor_btn")}
                  className="w-max"
                  onClick={() => setIsPanelOpen(false)}
                />
              )}
            </div>
          </div>
          <BlueshiftEditor
            initialCode={initialCode}
            onCodeChange={setEditorCode}
            fileName={fileName}
          />
          {/* TODO: Extract execution logs and execution components out of Right Panel */}
          {/* <RightPanel
            isPanelOpen={isPanelOpen}
            onRunCodeClick={handleRunCode}
            requirements={requirements}
            course={course}
            isLoading={isVerificationLoading}
            error={verificationError}
            verificationData={verificationData}
            isCodeRunning={isCodeRunning}
            runnerLogs={runnerLogs}
            isEsbuildReady={esBuildInitializationState === "initialized"}
          /> */}
        </div>
      </div>
    </motion.div>
  );
}
