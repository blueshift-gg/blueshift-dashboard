import { useLocale, useTranslations } from "next-intl";
import { ChallengeMetadata } from "@/app/utils/challenges";
import { URLS } from "@/constants/urls";

/**
 * Custom hook that generates a Twitter share URL for a completed challenge
 * Handles all locale and translation logic internally
 * @param challenge - The challenge metadata
 * @returns The complete Twitter share URL
 */
export function useShareChallengeOnX(challenge: ChallengeMetadata): string {
  const locale = useLocale();
  const t = useTranslations();

  const challengeTitle = t(`challenges.${challenge.slug}.title`);
  const challengeUrl = `${URLS.BLUESHIFT_EDUCATION}/${locale}/challenges/${challenge.slug}`;

  const tweetText = t("ChallengePage.challenge_share_tweet", {
    challengeTitle,
    challengeUrl,
  });

  return `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
}
