"use client";

import { useEffect } from "react";
import { useIsClient } from "usehooks-ts";
import { challenges } from "@/app/content/challenges/challenges";
import { usePersistentStore, useStore } from "@/stores/store";
import ConnectWalletRecommended from "./ConnectWalletRecommended";
import ShiftGoal from "./ShiftGoal";

export default function GlobalModals() {
  const { connectionRecommendedViewed, challengeStatuses, setChallengeStatus } =
    usePersistentStore();
  const { setOpenedModal } = useStore();
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;

    // Initialize challenge statuses
    challenges.forEach((challenge) => {
      if (!challengeStatuses[challenge.slug]) {
        setChallengeStatus(challenge.slug, "open");
      }
    });

    setTimeout(() => {
      if (!connectionRecommendedViewed) {
        setOpenedModal("connect-wallet-recommended");
      }
    }, 1000);
  }, [
    connectionRecommendedViewed,
    setOpenedModal,
    isClient,
    challengeStatuses,
    setChallengeStatus,
  ]);

  return (
    <>
      <ShiftGoal />
      <ConnectWalletRecommended />
    </>
  );
}
