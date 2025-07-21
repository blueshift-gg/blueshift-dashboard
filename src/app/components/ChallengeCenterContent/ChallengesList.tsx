"use client";

import { usePersistentStore } from "@/stores/store";
import classNames from "classnames";
import Icon from "../Icon/Icon";
import { useTranslations } from "next-intl";
import Divider from "../Divider/Divider";
import ChallengesEmpty from "./ChallengesEmpty";
import ChallengesFooter from "./ChallengesFooter";
import { motion } from "motion/react";
import { anticipate } from "motion";
import { useEffect, useState, useMemo } from "react";
import { challengeColors, ChallengeMetadata } from "@/app/utils/challenges";
import ChallengeCard from "../ChallengeCard/ChallengeCard";
import NFTViewer from "../NFTViewer/NFTViewer";
import { useNftOwnership } from "@/hooks/useNftOwnership";

const challengeSections = {
  Anchor: {
    icon: "Anchor",
    title: "languages.anchor",
  },
  Rust: {
    icon: "Rust",
    title: "languages.rust",
  },
  Typescript: {
    icon: "Typescript",
    title: "languages.typescript",
  },
  Assembly: {
    icon: "Assembly",
    title: "languages.assembly",
  },
  General: {
    icon: "General",
    title: "languages.general",
  },
} as const;

type ChallengesListProps = {
  initialChallenges: ChallengeMetadata[];
};

export default function ChallengesList({
  initialChallenges,
}: ChallengesListProps) {
  const t = useTranslations();

  const { selectedChallengeStatus, challengeStatuses, claimChallenges } =
    usePersistentStore();

  const { ownership, error: ownershipError } =
    useNftOwnership(initialChallenges);

  useEffect(() => {
    if (ownershipError) {
      console.error("Error checking NFT ownership:", ownershipError);
      return;
    }

    const challengesToUpdate = initialChallenges
      .filter(
        (challenge) =>
          ownership[challenge.slug] &&
          challengeStatuses[challenge.slug] !== "claimed",
      )
      .map((challenge) => challenge.slug);

    if (challengesToUpdate.length > 0) {
      claimChallenges(challengesToUpdate);
    }
  }, [
    ownership,
    ownershipError,
    initialChallenges,
    claimChallenges,
    challengeStatuses,
  ]);

  const filteredChallenges = useMemo(
    () =>
      initialChallenges.filter((challenge) =>
        selectedChallengeStatus.includes(challengeStatuses[challenge.slug]),
      ),
    [initialChallenges, selectedChallengeStatus, challengeStatuses],
  );

  const hasNoResults = filteredChallenges.length === 0;
  const hasNoFilters = selectedChallengeStatus.length === 0;

  const [isNFTViewerOpen, setIsNFTViewerOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeMetadata>(
    {
      unitName: "",
      language: "Typescript",
      difficulty: 1,
      slug: "",
      color: "",
      isFeatured: false,
      apiPath: "",
      requirements: [],
    },
  );

  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: anticipate }}
    >
      <NFTViewer
        isOpen={isNFTViewerOpen}
        onClose={() => setIsNFTViewerOpen(false)}
        challengeName={selectedChallenge.unitName}
        challengeLanguage={selectedChallenge.language}
        challengeDifficulty={selectedChallenge.difficulty}
      />
      {hasNoFilters ? (
        <ChallengesEmpty />
      ) : hasNoResults ? (
        <ChallengesEmpty />
      ) : (
        <>
          {Object.entries(challengeSections).map(([language, section]) => {
            const languageChallenges = filteredChallenges.filter(
              (challenge) => challenge.language === language,
            );
            if (languageChallenges.length === 0) return null;

            return (
              <div key={language} className="flex flex-col group">
                <div className="flex flex-col gap-y-8">
                  <div className="flex items-center gap-x-3">
                    <div
                      className="w-[24px] h-[24px] rounded-sm flex items-center justify-center"
                      style={{
                        backgroundColor: `rgb(${challengeColors[section.icon]},0.10)`,
                      }}
                    >
                      <Icon
                        name={section.icon}
                        className="text-brand-secondary"
                      />
                    </div>
                    <span className="text-lg leading-none font-medium text-secondary">
                      {t(section.title)}
                    </span>
                  </div>
                  <div
                    className={classNames(
                      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5",
                    )}
                  >
                    {languageChallenges.map((challenge) => (
                      <ChallengeCard
                        key={challenge.slug}
                        name={t(`challenges.${challenge.slug}.title`)}
                        language={challenge.language}
                        difficulty={challenge.difficulty}
                        color={challenge.color}
                        link={`/challenges/${challenge.slug}`}
                        footer={
                          <ChallengesFooter
                            challenge={challenge}
                            setIsNFTViewerOpen={setIsNFTViewerOpen}
                            setSelectedChallenge={setSelectedChallenge}
                          />
                        }
                      />
                    ))}
                  </div>
                  <Divider className="my-12 group-last:hidden" />
                </div>
              </div>
            );
          })}
        </>
      )}
    </motion.div>
  );
}
