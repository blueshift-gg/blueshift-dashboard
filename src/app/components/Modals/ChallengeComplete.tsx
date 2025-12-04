"use client";

import Modal from "./Modal";
import { useTranslations } from "next-intl";
import { Button } from "@blueshift-gg/ui-components";
import DecryptedText from "../HeadingReveal/DecryptText";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { anticipate } from "motion";
import useMintNFT from "@/hooks/useMintNFT";
import { usePersistentStore } from "@/stores/store";
import { Link } from "@/i18n/navigation";
import { ChallengeMetadata } from "@/app/utils/challenges";
import { useShareChallengeOnX } from "@/hooks/useShareChallengeOnX";

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
  const [isAnimating, setIsAnimating] = useState(false);
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
        className="w-[175px] relative z-10 mt-6"
      >
        <img
          src={`/graphics/nft-${challenge.slug}.png`}
          className="w-full animate-nft"
        ></img>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.75 }}
        className="overflow-hidden h-full absolute top-0"
      >
        <img src="/graphics/nft-stage.png"></img>
      </motion.div>
      <div className="flex flex-col gap-y-8 px-6 pt-16 relative z-10">
        <div className="flex flex-col gap-y-2 text-center">
          <div className="text-xl font-medium">
            {t("ChallengePage.mint_modal_title")}
          </div>
          <span className="text-shade-secondary text-balance">
            {t("ChallengePage.mint_modal_description")}
          </span>
        </div>

        <div className="flex flex-col gap-y-4">
          {currentCourseStatus === "completed" ? (
            <>
              <Button
                label={
                  isLoading
                    ? t("ChallengePage.minting")
                    : t("ChallengePage.mint_modal_button")
                }
                variant="primary"
                size="lg"
                icon={{ name: "Claimed" }}
                className="!w-full !flex-shrink"
                onClick={handleMint}
                disabled={isLoading}
              />
              <div
                onClick={closeModal}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="hover:text-shade-primary text-mute transition w-2/3 text-center text-sm font-medium mx-auto cursor-pointer"
              >
                <DecryptedText
                  text={t("ChallengePage.mint_modal_skip")}
                  isHovering={isHovering}
                />
              </div>
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
              <div
                onClick={closeModal}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="hover:text-shade-primary text-mute transition w-2/3 text-center text-sm font-medium mx-auto cursor-pointer"
              >
                <DecryptedText
                  text={t("ChallengePage.mint_modal_skip")}
                  isHovering={isHovering}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
