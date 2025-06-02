"use client";

import Modal from "./Modal";
import { useTranslations } from "next-intl";
import Button from "../Button/Button";
import DecryptedText from "../HeadingReveal/DecryptText";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { anticipate } from "motion";
import { CourseMetadata } from "@/app/utils/course";
import useMintNFT from "@/hooks/useMintNFT";
import { usePersistentStore } from "@/stores/store";
import { Link } from "@/i18n/navigation";

interface ChallengeCompletedProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseMetadata;
}

export default function ChallengeCompleted({
  isOpen,
  onClose,
  course,
}: ChallengeCompletedProps) {
  const t = useTranslations();
  const [isAnimating, setIsAnimating] = useState(false);
  const { mint, isLoading } = useMintNFT();
  const { courseStatus } = usePersistentStore();
  const currentCourseStatus = courseStatus[course.slug];

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
    mint(course)
      .catch((error) => {
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
        <img src={`/graphics/nft-${course.slug}.png`} className="w-full animate-nft"></img>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.75 }}
        className="rounded-2xl overflow-hidden h-full absolute top-0"
      >
        <img src="/graphics/nft-stage.png"></img>
      </motion.div>
      <div className="flex flex-col gap-y-8 px-6 pt-16 relative z-10">
        <div className="flex flex-col gap-y-2 text-center">
          <div className="text-xl font-medium">
            {t("challenges.challenge_completed")}
          </div>
          <span className="text-secondary text-balance">
            {t("challenges.challenge_completed_description")}
          </span>
        </div>

        <div className="flex flex-col gap-y-4">
          {currentCourseStatus === "Unlocked" ? (
            <>
              <Button
                label={t("challenges.challenge_completed_button")}
                variant="primary"
                size="lg"
                icon="Claimed"
                className="!w-full !flex-shrink"
                onClick={handleMint}
                disabled={isLoading}
              />
              <div
                onClick={closeModal}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="hover:text-primary text-mute transition w-2/3 text-center text-sm font-medium mx-auto cursor-pointer"
              >
                <DecryptedText
                  text={t("challenges.challenge_completed_skip")}
                  isHovering={isHovering}
                />
              </div>
            </>
          ) : (
            <>
              <Link href={`https://x.com/intent/tweet?text=${encodeURIComponent(`I just completed the Anchor Vault challenge from @blueshift_gg.\n\nTry it out here: https://learn.blueshift.gg/en/courses/${course.slug}/lesson\n\nMake the shift. Build on @solana.`)}`} target="_blank">
                <Button
                  label={t("challenges.challenge_completed_tweet")}
                  variant="primary"
                  size="lg"
                  icon="X"
                  className="!w-full !flex-shrink"
                />
              </Link>
              <div
                onClick={closeModal}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="hover:text-primary text-mute transition w-2/3 text-center text-sm font-medium mx-auto cursor-pointer"
              >
                <DecryptedText
                  text={t("challenges.challenge_completed_skip")}
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
