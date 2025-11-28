"use client";

import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import ChallengeRequirements from "./ProgramChallengeRequirements";
import ChallengeTable from "./ProgramChallengeTable";
import { useChallengeVerifier } from "@/hooks/useChallengeVerifier";
import { motion } from "motion/react";
import { anticipate } from "motion";
import { useAuth } from "@/hooks/useAuth";
import WalletMultiButton from "@/app/components/Wallet/WalletMultiButton";
import { ChallengeMetadata } from "@/app/utils/challenges";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

interface ChallengeContentProps {
  currentChallenge: ChallengeMetadata;
  content: ReactNode;
}

export default function ChallengesContent({
  currentChallenge,
  content,
}: ChallengeContentProps) {
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
    <div className="relative w-full h-full">
      {!isUserConnected ? (
        <div className="z-10 flex-col gap-y-8 flex items-center justify-center top-0 left-0 w-full h-full bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col gap-y-4 mt-24 max-w-[90dvw]">
            <img
              src="/graphics/connect-wallet.svg"
              className="sm:w-[360px] max-w-[80dvw] w-full mx-auto"
            />
            <div className="text-center text-lg sm:text-xl font-medium leading-none">
              {t("ChallengePage.connect_wallet")}
            </div>
            <div className="text-center text-shade-secondary mx-auto sm:w-2/3 w-full">
              {t("ChallengePage.connect_wallet_description")}
            </div>
          </div>
          <WalletMultiButton />
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.4, ease: anticipate },
            }}
            exit={{ opacity: 0 }}
            className="px-4 py-14 relative max-w-app md:px-8 lg:px-14 mx-auto w-full min-h-[calc(100dvh-250px)] grid grid-cols-1 lg:grid-cols-2 gap-y-12 lg:gap-x-24"
          >
            <div className="hidden lg:block absolute top-0 right-0 w-1/2 h-full"></div>
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
        </>
      )}
    </div>
  );
}
