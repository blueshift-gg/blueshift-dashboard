"use client";

import { useTranslations } from "next-intl";
import { anticipate } from "motion";
import { Button } from "@blueshift-gg/ui-components";
import { motion } from "motion/react";
import classNames from "classnames";
import ChallengeBadge from "../ChallengeBadge/ChallengeBadge";
import React, { useState, useEffect } from "react";
import {
  ChallengeRequirement,
  VerificationApiResponse,
} from "@/hooks/useChallengeVerifier";
import { Icon } from "@blueshift-gg/ui-components";
import Divider from "../Divider/Divider";
import { HeadingReveal } from "@blueshift-gg/ui-components";
import { usePersistentStore } from "@/stores/store";
import ChallengeCompleted from "../Modals/ChallengeComplete";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ChallengeMetadata } from "@/app/utils/challenges";
import { useSearchParams } from "next/navigation";
import { URLS } from "@/constants/urls";

// Copy feedback timeout duration
const COPY_FEEDBACK_TIMEOUT_MS = 3000; // 3 seconds

interface ChallengeTableProps {
  onUploadClick: () => void;
  requirements: ChallengeRequirement[];
  completedRequirementsCount: number;
  allIncomplete: boolean;
  isLoading: boolean;
  error: string | null;
  verificationData: VerificationApiResponse | null;
  challenge: ChallengeMetadata;
  onRedoChallenge: () => void;
  /**
   * Number of failed attempts before showing Discord prompt.
   * Includes upload errors, verification failures, and test failures.
   * @default 2
   */
  failedAttemptsThreshold?: number;
}

export default function ChallengeTable({
  onUploadClick,
  requirements,
  completedRequirementsCount,
  allIncomplete,
  isLoading,
  error,
  verificationData,
  challenge,
  onRedoChallenge,
  failedAttemptsThreshold = 2,
}: ChallengeTableProps) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const fromCourse = searchParams.get("fromCourse");
  const [selectedRequirement, setSelectedRequirement] =
    useState<ChallengeRequirement | null>(null);

  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [allowRedo, setAllowRedo] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const { challengeStatuses, setChallengeStatus } = usePersistentStore();
  const auth = useAuth();

  const challengeSlug = challenge.slug;

  useEffect(() => {
    if (verificationData) {
      const firstFailedRequirement = requirements.find(
        (req) => req.status === "failed"
      );
      if (firstFailedRequirement) {
        setSelectedRequirement(firstFailedRequirement);
      }

      // Check if all requirements are successful
      const allRequirementsPassed = requirements.every(
        (req) => req.status === "passed"
      );
      if (allRequirementsPassed) {
        setTimeout(() => {
          if (challengeStatuses[challengeSlug] === "open") {
            setChallengeStatus(challengeSlug, "completed");
          }
          setIsCompletedModalOpen(true);
          setAllowRedo(false);
        }, 1000);
        // Reset failed attempts on successful completion
        setFailedAttempts(0);
      }
    }
  }, [
    verificationData,
    requirements,
    setChallengeStatus,
    challengeSlug,
    challengeStatuses,
  ]);

  /**
   * Track failed attempts for upload/network errors
   */
  useEffect(() => {
    if (error) {
      setFailedAttempts((prev) => prev + 1);
    }
  }, [error]);

  /**
   * Track failed attempts for verification/test failures
   */
  useEffect(() => {
    if (verificationData && !verificationData.success) {
      setFailedAttempts((prev) => prev + 1);
      return;
    }
  }, [verificationData]);

  /**
   * Reset failed attempts only when explicitly redoing challenge
   */
  const handleRedoChallenge = () => {
    setFailedAttempts(0);
    onRedoChallenge();
  };

  /**
   * Handle copying program logs content
   */
  const handleCopyLogs = async (requirement: ChallengeRequirement) => {
    if (!verificationData) return;

    const result = verificationData.results.find(
      (result) => result.instruction === requirement.instructionKey
    );

    if (!result) return;

    let logContent = "";

    // Add error message if present
    if (result.message) {
      logContent += `ERROR: ${result.message}\n`;
    }

    // Add program logs if present
    if (result.program_logs && result.program_logs.length > 0) {
      if (logContent) logContent += "\n";
      logContent += "PROGRAM LOGS:\n";
      result.program_logs.forEach((log) => {
        logContent += `${log.slice(7)}\n`;
      });
    }

    if (!logContent) return;

    await navigator.clipboard.writeText(logContent.trim());
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, COPY_FEEDBACK_TIMEOUT_MS);
  };

  /**
   * Renders the assistance prompt when failed attempts threshold is reached
   */
  const renderAssistancePrompt = () => {
    if (failedAttempts < failedAttemptsThreshold) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="mx-4 p-4 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 border border-brand-primary/20"
      >
        <div className="flex items-start gap-x-2">
          <Icon
            name="Flag"
            size={18}
            className="text-brand-primary mt-0.5 flex-shrink-0"
          />
          <div className="flex-1">
            <h4 className="text-base font-medium text-shade-primary mb-1">
              {t("ChallengePage.assistance_prompt.title")}
            </h4>
            <p className="text-sm text-shade-secondary leading-relaxed">
              {t("ChallengePage.assistance_prompt.body")}
            </p>
            <Link
              href={URLS.BLUESHIFT_DISCORD}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-x-1 mt-2 text-sm font-medium text-brand-secondary hover:text-brand-primary"
            >
              {t("ChallengePage.assistance_prompt.link_text")}
              <Icon name="Link" size={14} />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="col-span-3">
      <ChallengeCompleted
        isOpen={isCompletedModalOpen && !allowRedo}
        onClose={() => setIsCompletedModalOpen(false)}
        challenge={challenge}
      />
      <div className="relative flex flex-col gap-y-4 w-full overflow-hidden px-1.5 pt-1.5 pb-6 border border-border bg-card-solid">
        {(challengeStatuses[challengeSlug] === "completed" ||
          challengeStatuses[challengeSlug] === "claimed") &&
          !allowRedo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute z-10 inset-0 w-full h-full bg-background/80 backdrop-blur gap-y-5 flex flex-col items-center justify-center"
            >
              <div className="flex flex-col items-center justify-center gap-y-1">
                <span className="text-lg font-medium text-shade-primary">
                  {t("ChallengePage.challenge_completed.title")}
                </span>
                <span className="text-shade-tertiary">
                  {t("ChallengePage.challenge_completed.body")}
                </span>
              </div>
              <Link href={fromCourse ? "/courses" : "/challenges"}>
                <Button
                  variant="primary"
                  size="md"
                  icon={{ name: "Lessons" }}
                  label={t(
                    fromCourse
                      ? "ChallengePage.challenge_completed.view_other_courses"
                      : "ChallengePage.challenge_completed.view_other_challenges"
                  )}
                />
              </Link>
              <div className="relative w-full">
                <div className="font-mono absolute text-xs text-mute top-1/2 z-10 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 bg-background">
                  {t(
                    `ChallengePage.challenge_completed.divider_label`
                  ).toUpperCase()}
                </div>
                <div className="w-full h-[1px] bg-border absolute"></div>
              </div>
              <Button
                variant="secondary"
                size="md"
                icon={{ name: "Refresh" }}
                label={t("ChallengePage.challenge_completed.redo")}
                onClick={() => {
                  handleRedoChallenge();
                  setAllowRedo(true);
                  setIsCompletedModalOpen(false);
                }}
              />
            </motion.div>
          )}
        <div
          className={classNames(
            "gap-y-6 sm:gap-y-0 flex sm:flex-row flex-col items-center justify-between px-4 sm:px-6 py-4 sm:py-5 bg-card-solid-foreground"
          )}
        >
          <div className="flex flex-col gap-y-4 w-full sm:w-1/2">
            <span className="font-medium">
              {completedRequirementsCount}/{requirements.length}{" "}
              {t("ChallengePage.num_tests_passed")}
            </span>
            <div
              className={classNames(
                "h-[8px] w-full flex items-center gap-x-0.5 justify-start relative p-px bg-background"
              )}
            >
              {!allIncomplete ? (
                <>
                  {requirements.map((requirement, index) => (
                    <motion.div
                      key={requirement.instructionKey}
                      className={classNames(
                        "left-[1px]",
                        requirement.status === "passed" &&
                          "[background:linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_100%),#00E66B]",
                        requirement.status === "failed" &&
                          "[background:linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_100%),#FF285A]",
                        // Make incomplete segments transparent to show the parent background
                        requirement.status === "incomplete" && "bg-transparent"
                      )}
                      initial={{
                        width: `0%`,
                        height: 6,
                      }}
                      animate={{
                        // Use derived requirements length for width calculation
                        width: `${100 / requirements.length}%`,
                        height: 6,
                      }}
                      transition={{
                        duration: 0.4,
                        ease: anticipate,
                        delay: 0.2 * index,
                      }}
                    />
                  ))}
                </>
              ) : (
                // Initial state when all are incomplete
                <div className="w-4 h-1.5 [background:linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_100%),#ADB9D2]" />
              )}
            </div>
          </div>

          <Button
            variant="primary"
            icon={{ name: "Upload" }}
            size="lg"
            label={t("ChallengePage.upload_program_btn")}
            className="w-full sm:w-auto"
            onClick={() => {
              if (auth.isTokenExpired()) {
                alert(t("notifications.session_expired_logout"));
                auth.logout();
              } else {
                onUploadClick();
              }
            }}
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mx-4 p-4 bg-red-50 border border-red-200"
          >
            <div className="flex items-start gap-x-3">
              <Icon
                name="Warning"
                size={18}
                className="text-red-500 mt-0.5 flex-shrink-0"
              />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  Upload Error
                </h4>
                <p className="text-sm text-red-700 leading-relaxed">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {renderAssistancePrompt()}

        <div className="flex flex-col gap-y-2 px-2">
          {requirements.map((requirement) => (
            <motion.button
              onClick={() => {
                if (selectedRequirement === requirement) {
                  setSelectedRequirement(null);
                } else {
                  setSelectedRequirement(requirement);
                }
              }}
              disabled={requirement.status === "incomplete"}
              type="button"
              className={classNames(
                "flex flex-col gap-y-4 group sm:px-4 enabled:hover:cursor-pointer py-3 transition duration-200 enabled:hover:bg-card-solid-foreground/50",
                selectedRequirement === requirement &&
                  "pb-6 bg-card-solid-foreground/50",
                selectedRequirement !== null &&
                  selectedRequirement !== requirement &&
                  "opacity-40"
              )}
              key={requirement.instructionKey}
            >
              <div
                className="flex items-center justify-between"
                key={requirement.instructionKey}
              >
                <span className="font-medium text-sm sm:text-base truncate max-w-[60%]">
                  {t(
                    `challenges.${challengeSlug}.requirements.${requirement.instructionKey}.title`
                  )}
                </span>
                {isLoading ? (
                  <ChallengeBadge label="Loading" variant="loading" />
                ) : error ? (
                  <ChallengeBadge label="Error" variant="failed" />
                ) : (
                  <div className="flex items-center gap-x-4">
                    <ChallengeBadge
                      label={t(
                        `ChallengePage.test_results.${requirement.status}`
                      )}
                      variant={requirement.status}
                    />
                    <Icon
                      name="Chevron"
                      className={classNames(
                        "transition-transform",
                        requirement.status === "incomplete" && "opacity-40",
                        selectedRequirement === requirement && "rotate-180"
                      )}
                      size={14}
                    />
                  </div>
                )}
              </div>

              {selectedRequirement === requirement && (
                // Show logs
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.1, ease: "linear" }}
                  className="flex flex-col gap-y-4"
                >
                  <Divider />
                  {verificationData?.results?.find(
                    (result) =>
                      result.instruction === requirement.instructionKey
                  ) && (
                    <div className="flex flex-col gap-y-2 text-sm">
                      <div className="flex flex-col gap-y-4 items-start overflow-hidden bg-background pt-4 px-1 pb-1">
                        <div className="flex items-center justify-between w-full px-3">
                          <HeadingReveal
                            baseDelay={0.1}
                            text="PROGRAM LOGS"
                            headingLevel="h3"
                            className="font-mono"
                            color="#00ffff"
                          />
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: anticipate }}
                            key={isCopied ? "success" : "copy"}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent event bubbling
                              if (isCopied) return;
                              handleCopyLogs(requirement);
                            }}
                          >
                            <Icon
                              name={isCopied ? "Success" : "Copy"}
                              size={16 as 18 | 14 | 12}
                              className={classNames(
                                "text-mute hover:text-shade-secondary transition cursor-pointer",
                                {
                                  "!text-brand-primary !cursor-default":
                                    isCopied,
                                }
                              )}
                            />
                          </motion.div>
                        </div>
                        <div className="px-2 w-full">
                          <Divider />
                        </div>
                        <div className="flex gap-x-2 items-center w-full">
                          <div className="flex flex-col gap-y-2 pt-1 pb-2">
                            {verificationData.results.find(
                              (result) =>
                                result.instruction ===
                                requirement.instructionKey
                            )?.message && (
                              <HeadingReveal
                                baseDelay={0}
                                text="ERROR"
                                headingLevel="h3"
                                splitBy="chars"
                                speed={0.1}
                                color="#FF5555"
                                className="font-mono px-3 flex-shrink-0 w-max sticky left-0"
                              />
                            )}
                            {verificationData.results
                              .find(
                                (result) =>
                                  result.instruction ===
                                  requirement.instructionKey
                              )
                              ?.program_logs?.map((log, index) => (
                                <HeadingReveal
                                  baseDelay={index * 0.1}
                                  text="PROGRAM"
                                  headingLevel="h3"
                                  key={index}
                                  splitBy="chars"
                                  speed={0.1}
                                  className="font-mono px-3 flex-shrink-0 w-max sticky left-0"
                                />
                              ))}
                          </div>
                          <div className="flex flex-col gap-y-2 items-start px-1 overflow-x-auto pr-5 pb-2">
                            {verificationData.results.find(
                              (result) =>
                                result.instruction ===
                                requirement.instructionKey
                            )?.message && (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{
                                  duration: 0.4,
                                  ease: anticipate,
                                  delay: 0.8,
                                }}
                                className="text-start w-full font-fira-code font-medium text-nowrap text-[#FF5555]"
                              >
                                {
                                  verificationData.results.find(
                                    (result) =>
                                      result.instruction ===
                                      requirement.instructionKey
                                  )?.message
                                }
                              </motion.span>
                            )}
                            {verificationData.results
                              .find(
                                (result) =>
                                  result.instruction ===
                                  requirement.instructionKey
                              )
                              ?.program_logs?.map((log, index) => (
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{
                                    duration: 0.4,
                                    ease: anticipate,
                                    delay: 1 + index * 0.1,
                                  }}
                                  key={index}
                                  className="text-start font-fira-code font-medium text-nowrap text-shade-secondary"
                                >
                                  {log.slice(7, log.length)}
                                </motion.span>
                              ))}
                          </div>
                        </div>

                        <div className="bg-card-solid/80 px-4 py-2 flex gap-x-4 text-sm font-medium w-full justify-between items-center">
                          <Icon
                            name="General"
                            size={14}
                            className="text-brand-primary"
                          />
                          <div className="flex items-center gap-x-2">
                            <div>
                              <span className="text-text-shade-tertiary">
                                Compute Units:{" "}
                              </span>
                              <span className="font-medium text-brand-secondary">
                                {
                                  verificationData.results.find(
                                    (result) =>
                                      result.instruction ===
                                      requirement.instructionKey
                                  )?.compute_units_consumed
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-text-shade-tertiary">
                                Execution Time:{" "}
                              </span>
                              <span className="font-medium text-brand-secondary">
                                {
                                  verificationData.results.find(
                                    (result) =>
                                      result.instruction ===
                                      requirement.instructionKey
                                  )?.execution_time
                                }
                                ms
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
