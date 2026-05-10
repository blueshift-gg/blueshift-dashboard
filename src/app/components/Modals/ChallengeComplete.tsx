"use client";

import { Button } from "@blueshift-gg/ui-components";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { ChallengeMetadata } from "@/app/utils/challenges";
import useMintNFT from "@/hooks/useMintNFT";
import { useShareChallengeOnX } from "@/hooks/useShareChallengeOnX";
import { Link } from "@/i18n/navigation";
import { usePersistentStore } from "@/stores/store";
import DecryptedText from "../HeadingReveal/DecryptText";
import Modal from "./Modal";

interface ChallengeCompletedProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: ChallengeMetadata;
}

export default function ChallengeCompleted({
  isOpen,
  onClose,
  challenge,
}: ChallengeCompletedProps) {
  const t = useTranslations();
  const [_isAnimating, setIsAnimating] = useState(false);
  const { mint, isLoading } = useMintNFT();
  const { challengeStatuses } = usePersistentStore();
  const currentCourseStatus = challengeStatuses[challenge.slug];
  const challengeShareUrl = useShareChallengeOnX(challenge);

  useEffect(() => {
    setTimeout(() => {
      setIsAnimating(true);
    }, 100);
  }, []);

  const [isHovering, setIsHovering] = useState(false);
  const closeModal = () => {
    onClose();
  };

  const handleMint = async () => {
    mint(challenge).catch((error) => {
      console.error("Error minting NFT:", error);
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showBackdrop={true}
      width={450}
      closeOnClickOutside={false}
      isResponsive={false}
      cardClassName="!pt-0 !px-0 before:z-10 !relative !overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.75, delay: 0.5 }}
        className="relative z-10 mt-6 w-[175px]"
      >
        <img
          src={`/graphics/nft-${challenge.slug}.png`}
          alt={`${challenge.slug} NFT preview`}
          className="animate-nft w-full"
        ></img>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.75 }}
        className="absolute top-0 h-full overflow-hidden"
      >
        <img src="/graphics/nft-stage.png" alt=""></img>
      </motion.div>
      <div className="relative z-10 flex flex-col gap-y-8 px-6 pt-16">
        <div className="flex flex-col gap-y-2 text-center">
          <div className="text-xl font-medium">{t("ChallengePage.mint_modal_title")}</div>
          <span className="text-balance text-shade-secondary">
            {t("ChallengePage.mint_modal_description")}
          </span>
        </div>

        <div className="flex flex-col gap-y-4">
          {currentCourseStatus === "completed" ? (
            <>
              <Button
                label={
                  isLoading ? t("ChallengePage.minting") : t("ChallengePage.mint_modal_button")
                }
                variant="primary"
                size="lg"
                icon={{ name: "Claimed" }}
                className="!w-full !flex-shrink"
                onClick={handleMint}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={closeModal}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="text-mute mx-auto w-2/3 cursor-pointer text-center text-sm font-medium transition hover:text-shade-primary"
              >
                <DecryptedText text={t("ChallengePage.mint_modal_skip")} isHovering={isHovering} />
              </button>
            </>
          ) : (
            <>
              <Link href={challengeShareUrl} target="_blank">
                <Button
                  label={t("ChallengePage.mint_modal_tweet")}
                  variant="primary"
                  size="lg"
                  icon={{ name: "X" }}
                  className="!w-full !flex-shrink"
                />
              </Link>
              <button
                type="button"
                onClick={closeModal}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="text-mute mx-auto w-2/3 cursor-pointer text-center text-sm font-medium transition hover:text-shade-primary"
              >
                <DecryptedText text={t("ChallengePage.mint_modal_skip")} isHovering={isHovering} />
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
