"use client";

import { Button, HeadingReveal, Icon } from "@blueshift-gg/ui-components";
import classNames from "classnames";
import { anticipate } from "motion";
import { motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { ChallengeMetadata } from "@/app/utils/challenges";
import type { ChallengeRequirement, VerificationApiResponse } from "@/hooks/useChallengeVerifier";
import type { LogMessage } from "@/hooks/useEsbuildRunner";
import { Link } from "@/i18n/navigation";
import { usePersistentStore } from "@/stores/store";
import ChallengeBadge from "../ChallengeBadge/ChallengeBadge";
import Divider from "../Divider/Divider";

interface ChallengeTableProps {
  onRunCodeClick: () => void;
  requirements: ChallengeRequirement[];
  completedRequirementsCount: number;
  allIncomplete: boolean;
  isLoading: boolean;
  error: string | null;
  verificationData: VerificationApiResponse | null;
  challenge: ChallengeMetadata;
  isCodeRunning: boolean;
  runnerLogs: LogMessage[];
  isEsbuildReady: boolean;
  onRedoChallenge: () => void;
  isOpen: boolean;
  allowRedo: boolean;
}

export default function ChallengeTable({
  requirements,
  isLoading,
  error,
  verificationData,
  challenge,
  isCodeRunning,
  runnerLogs,
  isEsbuildReady,
  onRedoChallenge,
  isOpen,
  allowRedo,
}: ChallengeTableProps) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const fromCourse = searchParams.get("fromCourse");
  const [selectedRequirement, setSelectedRequirement] = useState<ChallengeRequirement | null>(null);

  const { challengeStatuses } = usePersistentStore();
  const courseSlug = challenge.slug;

  useEffect(() => {
    if (verificationData) {
      const firstFailedRequirement = requirements.find((req) => req.status === "failed");
      if (firstFailedRequirement) {
        setSelectedRequirement(firstFailedRequirement);
      }
    }
  }, [verificationData, requirements]);

  const _overallIsLoading = isCodeRunning || !isEsbuildReady;

  return (
    <motion.div
      className={classNames(
        "w-[calc(100%-2px)] transition opacity-0 lg:opacity-100 mx-auto flex absolute lg:relative bg-background lg:bg-transparent h-[calc(100%-81px)] lg:h-full lg:w-full",
        isOpen && "opacity-100 z-10 lg:z-1",
        !isOpen && "pointer-events-none lg:pointer-events-auto",
      )}
    >
      <div className="flex w-full min-w-full flex-col justify-between overflow-hidden overflow-y-auto bg-card-solid/50 px-2 pb-24 [mask:linear-gradient(to_bottom,black_85%,transparent_100%)] lg:right-4 lg:gap-y-8 lg:border-l lg:border-l-border lg:px-4 lg:pt-6 lg:pb-6 xl:min-w-[400px]">
        {(challengeStatuses[courseSlug] === "completed" ||
          challengeStatuses[courseSlug] === "claimed") &&
          !allowRedo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex h-[20dvh] w-full flex-col items-center justify-center gap-y-5 bg-background/80 backdrop-blur lg:h-full"
            >
              <div className="flex flex-col items-center justify-center gap-y-1">
                <span className="text-lg font-medium text-shade-primary">
                  {t("ChallengePage.challenge_completed.title")}
                </span>
                <span className="text-shade-tertiary">
                  {t("ChallengePage.challenge_completed.body")}
                </span>
              </div>

              <Link href={`/${fromCourse ? "courses" : "challenges"}`}>
                <Button
                  variant="primary"
                  size="md"
                  icon={{ name: "Lessons" }}
                  label={t(
                    fromCourse
                      ? "ChallengePage.challenge_completed.view_other_courses"
                      : "ChallengePage.challenge_completed.view_other_challenges",
                  )}
                />
              </Link>
              <div className="relative w-full">
                <div className="text-mute absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 bg-background px-4 font-mono text-xs">
                  {t(`ChallengePage.challenge_completed.divider_label`).toUpperCase()}
                </div>
                <div className="absolute h-[1px] w-full bg-border"></div>
              </div>
              <Button
                variant="secondary"
                size="md"
                icon={{ name: "Refresh" }}
                label={t("ChallengePage.challenge_completed.redo")}
                onClick={onRedoChallenge}
              />
            </motion.div>
          )}

        <div className="order-2 flex flex-col gap-y-4 pt-4 lg:order-1 lg:border-t-0 lg:pt-0">
          {runnerLogs.length > 0 && (
            <div className="flex flex-col gap-y-2">
              <div className="flex flex-col items-start gap-y-4 overflow-hidden border border-border bg-background px-1 pt-4 pb-1">
                <HeadingReveal
                  baseDelay={0.1}
                  text="EXECUTION LOGS"
                  headingLevel="h3"
                  className="px-3 font-mono text-sm"
                  color="#FFFFFF"
                />
                <div className="w-full px-2">
                  <Divider />
                </div>
                <div className="custom-scrollbar flex max-h-80 w-max max-w-full flex-col items-start gap-y-1 overflow-x-scroll px-3 pr-5 pb-2 font-fira-code text-xs sm:max-w-[450px]">
                  {runnerLogs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className={classNames("text-start text-nowrap py-0.5", {
                        "text-[#ff5555] font-bold":
                          log.type === "ERROR" ||
                          log.type === "EXECUTION_ERROR" ||
                          log.type === "WORKER_ERROR" ||
                          log.type === "VERIFICATION_ERROR",
                        "text-[#f1fa8c]": log.type === "WARN",
                        "text-[#8be9fd]": log.type === "INFO" || log.type === "SYSTEM",
                        "text-[#6272a4]": log.type === "DEBUG",
                        "text-[#f8f8f2]": log.type === "LOG",
                      })}
                    >
                      <span className="mr-1.5 font-semibold text-[#f8f8f2]">{`[${log.timestamp.toLocaleTimeString()}]`}</span>
                      <span
                        className={`font-bold ${
                          log.type === "SYSTEM"
                            ? "text-[#bd93f9]"
                            : log.type === "LOG"
                              ? "text-[#50fa7b]"
                              : ""
                        }`}
                      >{`[${log.type}]`}</span>
                      <span className="ml-1.5">
                        {Array.isArray(log.payload)
                          ? log.payload
                              .map((p) => (typeof p === "object" ? JSON.stringify(p) : String(p)))
                              .join(" ")
                          : String(log.payload)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-y-2">
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
                  "flex flex-col gap-y-4 group enabled:hover:cursor-pointer py-3 transition duration-200 enabled:hover:bg-card-solid-foreground/50",
                  selectedRequirement === requirement && "pb-6 bg-card-solid-foreground/50",
                  selectedRequirement !== null &&
                    selectedRequirement !== requirement &&
                    "opacity-40",
                )}
                key={requirement.instructionKey}
              >
                <div
                  className="flex w-full items-center justify-between px-4 text-left"
                  key={requirement.instructionKey}
                >
                  <span className="max-w-[60%] text-xs font-medium xs:text-sm">
                    {t(`challenges.${courseSlug}.requirements.${requirement.instructionKey}.title`)}
                  </span>
                  {!isLoading && !error ? (
                    <div className="flex items-center gap-x-4">
                      <ChallengeBadge
                        label={t(`ChallengePage.test_results.${requirement.status}`)}
                        variant={requirement.status}
                      />
                      <Icon
                        name="Chevron"
                        className={classNames(
                          "transition-transform",
                          requirement.status === "incomplete" && "opacity-40",
                          selectedRequirement === requirement && "rotate-180",
                        )}
                        size={14}
                      />
                    </div>
                  ) : (
                    <ChallengeBadge label="Loading" variant="loading" />
                  )}

                  {!isLoading && error && (
                    <div className="text-xs font-medium">An error occurred. Please try again.</div>
                  )}
                </div>

                {selectedRequirement === requirement && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.1, ease: "linear" }}
                    className="flex flex-col gap-y-4 px-4"
                  >
                    <Divider />
                    {verificationData?.results?.find(
                      (result) => result.instruction === requirement.instructionKey,
                    ) && (
                      <div className="flex flex-col gap-y-2 text-sm">
                        <div className="flex flex-col items-start gap-y-4 overflow-hidden bg-background px-1 pt-4 pb-1">
                          <HeadingReveal
                            baseDelay={0.1}
                            text="VERIFICATION LOGS"
                            headingLevel="h3"
                            className="px-3 font-mono"
                            color="#FFA726"
                          />
                          <div className="w-full px-2">
                            <Divider />
                          </div>
                          <div className="flex w-full items-center gap-x-2">
                            <div className="flex flex-col gap-y-2 pt-1 pb-2">
                              {verificationData.results.find(
                                (result) => result.instruction === requirement.instructionKey,
                              )?.message && (
                                <HeadingReveal
                                  baseDelay={0}
                                  text="ERROR"
                                  headingLevel="h3"
                                  splitBy="chars"
                                  speed={0.1}
                                  color="#FF5555"
                                  className="sticky left-0 w-max flex-shrink-0 px-3 font-mono"
                                />
                              )}
                              {verificationData.results
                                .find((result) => result.instruction === requirement.instructionKey)
                                ?.program_logs?.map((_log, index) => (
                                  <HeadingReveal
                                    baseDelay={index * 0.1}
                                    text="PROGRAM"
                                    headingLevel="h3"
                                    key={`${requirement.instructionKey}-program-label-${_log}`}
                                    splitBy="chars"
                                    speed={0.1}
                                    className="sticky left-0 w-max flex-shrink-0 px-3 font-mono"
                                  />
                                ))}
                            </div>
                            <div className="flex flex-col items-start gap-y-2 overflow-x-auto px-1 pr-5 pb-2">
                              {verificationData.results.find(
                                (result) => result.instruction === requirement.instructionKey,
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
                                  className="w-full text-start font-fira-code font-medium text-nowrap text-[#FF5555]"
                                >
                                  {
                                    verificationData.results.find(
                                      (result) => result.instruction === requirement.instructionKey,
                                    )?.message
                                  }
                                </motion.span>
                              )}
                              {verificationData.results
                                .find((result) => result.instruction === requirement.instructionKey)
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
                                    key={`${requirement.instructionKey}-program-log-${log}`}
                                    className="text-start font-fira-code font-medium text-nowrap text-shade-secondary"
                                  >
                                    {log.slice(7, log.length)}
                                  </motion.span>
                                ))}
                            </div>
                          </div>

                          <div className="flex w-full items-center justify-between gap-x-4 bg-card-solid/80 px-4 py-2 text-sm font-medium">
                            <Icon name="General" size={14} className="text-brand-primary" />
                            <div className="flex items-center gap-x-2">
                              <div>
                                <span className="text-text-shade-tertiary">Compute Units: </span>
                                <span className="font-medium text-brand-secondary">
                                  {
                                    verificationData.results.find(
                                      (result) => result.instruction === requirement.instructionKey,
                                    )?.compute_units_consumed
                                  }
                                </span>
                              </div>
                              <div className="hidden lg:block">
                                <span className="text-text-shade-tertiary">Execution Time: </span>
                                <span className="font-medium text-brand-secondary">
                                  {
                                    verificationData.results.find(
                                      (result) => result.instruction === requirement.instructionKey,
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
    </motion.div>
  );
}
