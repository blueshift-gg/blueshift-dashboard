"use client";

import React, { useRef, useState } from "react";
import classNames from "classnames";
import { Link } from "@/i18n/navigation";
import { useDirectionalHover } from "@/app/hooks/useDirectionalHover";
import {
  anticipate,
  Badge,
  breeze,
  Button,
  CrosshairCorners,
  Difficulty,
  Divider,
  glide,
  IconName,
} from "@blueshift-gg/ui-components";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { BRAND_COLOURS } from "@blueshift-gg/ui-components";
import { Icon } from "@blueshift-gg/ui-components";
import { ChallengeMetadata } from "@/app/utils/challenges";
import { difficulty as difficultyMap } from "@/app/utils/common";
import { usePersistentStore } from "@/stores/store";
import useMintNFT from "@/hooks/useMintNFT";
import { useShareChallengeOnX } from "@/hooks/useShareChallengeOnX";
import { useAuth } from "@/hooks/useAuth";

type ChallengeCardProps = {
  challenge: ChallengeMetadata;
  setIsNFTViewerOpen: (isOpen: boolean) => void;
  setSelectedChallenge: (challenge: ChallengeMetadata) => void;
  className?: string;
};

export default function ChallengeCard({
  challenge,
  setIsNFTViewerOpen,
  setSelectedChallenge,
  className,
}: ChallengeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasHovered, setHasHovered] = useState(false);
  const [isHoveredFooter, setIsHoveredFooter] = useState(false);

  const {
    isHovered,
    direction,
    swooshAngle,
    handleMouseEnter,
    handleMouseLeave,
  } = useDirectionalHover(cardRef);

  const t = useTranslations();
  const { challengeStatuses } = usePersistentStore();
  const status = challengeStatuses[challenge.slug] || "open";
  const { mint, isLoading } = useMintNFT();
  const auth = useAuth();
  const challengeShareUrl = useShareChallengeOnX(challenge);

  const handleMint = async () => {
    mint(challenge).catch((error) => {
      console.error("Error minting NFT:", error);
    });
  };

  const badgeDifficulty = difficultyMap[challenge.difficulty ?? 1];

  return (
    <div
      ref={cardRef}
      onMouseEnter={(e) => {
        handleMouseEnter(e);
        setHasHovered(true);
      }}
      onMouseLeave={handleMouseLeave}
      style={
        {
          "--swoosh-angle": `${swooshAngle}deg`,
          willChange: "opacity",
        } as React.CSSProperties
      }
      className={classNames(
        "max-w-[330px] aspect-3/4 transform-gpu group transition-transform justify-end animate-card-swoosh duration-300 flex flex-col overflow-hidden p-1 bg-card-solid relative border-border-light border",
        isHovered && `swoosh-${direction}`,
        className
      )}
    >
      <Link
        href={`/challenges/${challenge.slug}`}
        className="absolute inset-0 z-1 w-full h-full"
      ></Link>

      <div
        style={{
          color:
            BRAND_COLOURS[challenge.language as keyof typeof BRAND_COLOURS],
        }}
        className={classNames(
          "justify-between items-center !absolute bg-card-foreground left-[-1px] top-4 w-[calc(100%+2px)] flex px-4 py-2 shadow-[inset_0px_0px_32px] gradient-border before:bg-current/15 shadow-current/20"
        )}
      >
        <CrosshairCorners
          corners={["top-left", "bottom-right"]}
          size={4}
          spacingX={-1}
          animationDelay={0}
          animationDuration={0}
        />
        <span className="text-xs font-medium font-mono text-shade-primary">
          {t("ChallengeCenter.complete_to_earn")}
        </span>
        <div className="flex items-center gap-x-1.5">
          <span className="text-xs font-medium font-mono bg-nft-gradient bg-clip-text text-transparent">
            1 NFT
          </span>
          <Divider direction="vertical" className="!h-[12px] !w-[2px]" />
          <span className="text-xs font-medium font-mono bg-xp-gradient bg-clip-text text-transparent">
            50 XP
          </span>
        </div>
      </div>

      <div className={classNames("flex flex-col gap-y-6 px-4 py-5")}>
        <div className="flex flex-col gap-y-2 min-h-[90px]">
          <div className="flex items-center gap-x-3 overflow-hidden">
            <span
              style={{
                color:
                  BRAND_COLOURS[
                    challenge.language as keyof typeof BRAND_COLOURS
                  ],
              }}
              className={classNames("font-mono leading-[100%]")}
            >
              {challenge.language}
            </span>
            <Divider direction="vertical" className="h-[20px]" />
            <Badge
              size="sm"
              variant={
                badgeDifficulty as
                  | "Beginner"
                  | "Intermediate"
                  | "Advanced"
                  | "Expert"
              }
              label={badgeDifficulty}
              className="leading-[100%] min-h-[20px]!"
              crosshair={{ size: 4, corners: ["top-left", "bottom-right"] }}
              icon={
                <Difficulty
                  size={12}
                  difficulties={[challenge.difficulty]}
                />
              }
            />
          </div>
          <span
            className={classNames("text-xl font-medium text-shade-primary")}
          >
            {t(`challenges.${challenge.slug}.title`)}
          </span>
        </div>

        {/* Footer Logic Moved Here */}
        <div className="relative z-20 flex flex-col gap-y-4">
          {status === "open" && (
            <>
              <Link
                href={`/challenges/${challenge.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="z-20 relative"
              >
                <Button
                  variant="primary"
                  size="md"
                  label={t("lessons.take_challenge")}
                  icon={{ name: "Challenge" as IconName }}
                  className="!w-full"
                />
              </Link>
              <div className="flex items-center justify-center gap-x-2">
                <button
                  className="font-mono flex items-center justify-center gap-x-1.5 text-xs text-shade-tertiary/50 cursor-not-allowed w-full flex-shrink uppercase"
                  onMouseEnter={() => setIsHoveredFooter(true)}
                  onMouseLeave={() => setIsHoveredFooter(false)}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isHoveredFooter ? "complete" : "share"}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.1 }}
                      className="flex items-center gap-x-1.5"
                    >
                      <Icon name={isHoveredFooter ? "Locked" : "X"} size={12} />
                      <span>
                        {isHoveredFooter
                          ? t("ChallengeCenter.complete_to_share")
                          : t("ChallengePage.share_on_x")}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
            </>
          )}
          {status === "completed" && !auth.isLoggedIn && (
            <span className="text-shade-tertiary font-medium gap-x-1.5 flex items-center">
              <Icon name="Locked" />
              {t("ChallengeCenter.locked_description")}
            </span>
          )}
          {status === "completed" && auth.isLoggedIn && (
            <Button
              variant="primary"
              size="md"
              label={
                isLoading
                  ? t("ChallengePage.minting")
                  : t("ChallengeCenter.claim")
              }
              icon={{ name: "Claim" as IconName }}
              className="!w-full"
              onClick={() => {
                handleMint();
              }}
              disabled={isLoading}
            />
          )}
          {status === "claimed" && (
            <div className="flex flex-col items-center gap-4 w-full">
              <Button
                variant="primary"
                size="md"
                label={t("ChallengeCenter.view_nft")}
                icon={{ name: "Link" as IconName }}
                className="!w-full"
                onClick={() => {
                  setIsNFTViewerOpen(true);
                  setSelectedChallenge(challenge);
                }}
              />
              <Link
                href={challengeShareUrl}
                target="_blank"
                className="w-full flex justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  label={t("ChallengePage.share_on_x")}
                  variant="secondary"
                  size="sm"
                  icon={{ name: "X" as IconName }}
                  className="!w-full !flex-shrink !text-xs !text-shade-tertiary !gap-x-3"
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
