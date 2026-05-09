"use client";

import { anticipate } from "motion";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import WalletMultiButton from "@/app/components/Wallet/WalletMultiButton";
import type { ChallengeMetadata } from "@/app/utils/challenges";
import { useAuth } from "@/hooks/useAuth";
import { useChallengeVerifier } from "@/hooks/useChallengeVerifier";
import ChallengeRequirements from "./ProgramChallengeRequirements";
import ChallengeTable from "./ProgramChallengeTable";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

interface ChallengeContentProps {
  currentChallenge: ChallengeMetadata;
  content: ReactNode;
}

export default function ChallengesContent({ currentChallenge, content }: ChallengeContentProps) {
  const auth = useAuth();
  const isUserConnected = auth.status === "signed-in";
  // const { courseProgress } = usePersistentStore();
  const t = useTranslations();
  // const isCourseCompleted =
  //   courseProgress[currentCourse.slug] === currentCourse.lessons.length;
  // const lastLessonSlug = useCurrentLessonSlug(currentCourse);

  if (!apiBaseUrl) {
    console.error("API Base URL is not defined in the environment variables.");
  }

  const {
    isLoading,
    error,
    uploadProgram,
    requirements,
    completedRequirementsCount,
    allIncomplete,
    verificationData,
    setVerificationData,
    setRequirements,
    initialRequirements,
  } = useChallengeVerifier({ challenge: currentChallenge });

  const handleRedoChallenge = () => {
    setVerificationData(null);
    setRequirements(initialRequirements);
  };

  return (
    <div className="h-full w-full">
      {!isUserConnected ? (
        <div className="z-10 flex min-h-[60vh] w-full flex-col items-center justify-center gap-y-8 py-12">
          <div className="flex max-w-[90dvw] flex-col gap-y-0">
            <img
              src="/graphics/connect-wallet.svg"
              alt="Connect wallet"
              className="mx-auto w-full max-w-[80dvw] sm:w-[360px]"
            />
            <div className="flex flex-col gap-y-3">
              <div className="text-center font-mono text-lg leading-none font-medium text-shade-primary sm:text-xl">
                {t("ChallengePage.connect_wallet")}
              </div>
              <div className="mx-auto w-full text-center text-shade-secondary sm:w-2/3">
                {t("ChallengePage.connect_wallet_description")}
              </div>
            </div>
          </div>
          <WalletMultiButton />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { duration: 0.4, ease: anticipate },
          }}
          exit={{ opacity: 0 }}
          className="mx-auto grid min-h-[calc(100dvh-250px)] w-full max-w-app grid-cols-1 lg:grid-cols-5 lg:gap-x-10"
        >
          <div className="absolute top-0 left-2/5 hidden h-full w-px -translate-x-1/2 bg-border-light lg:block"></div>
          <ChallengeRequirements content={content} />
          <ChallengeTable
            isLoading={isLoading}
            error={error}
            onUploadClick={uploadProgram}
            requirements={requirements}
            completedRequirementsCount={completedRequirementsCount}
            allIncomplete={allIncomplete}
            verificationData={verificationData}
            challenge={currentChallenge}
            onRedoChallenge={handleRedoChallenge}
          />
        </motion.div>
      )}
    </div>
  );
}
