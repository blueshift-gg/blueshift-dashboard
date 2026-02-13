"use client";

import { ChallengeMetadata } from "@/app/utils/challenges";
import { CourseMetadata } from "@/app/utils/course";
import { Icon, Button, CrosshairCorners, Badge } from "@blueshift-gg/ui-components";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathContent } from "@/app/hooks/usePathContent";
import { getResearchForCourse, type CourseId } from "@/lib/cross-linking";
import { useCallback } from "react";

interface CourseFooterProps {
  nextLesson: boolean;
  courseMetadata: CourseMetadata;
  nextLessonSlug: string;
  challenge: ChallengeMetadata;
}

const COURSE_TOPICS: Record<string, string> = {
  "introduction-to-assembly": "sBPF assembly optimization and JIT compilation",
  "pinocchio-for-dummies": "low-level Solana optimization techniques",
  "introduction-to-blockchain-and-solana": "Solana development",
  "anchor-for-dummies": "Anchor framework internals",
  "program-security": "Solana security",
  "secp256r1-on-solana": "cryptography on Solana",
  "tokens-on-solana": "token development",
  "nfts-on-solana": "NFT development",
  "spl-token-with-web3js": "SPL token development",
  "spl-token-with-anchor": "SPL token development",
  "token-2022-program": "Token-2022 development",
  "token-2022-with-web3js": "Token-2022 development",
  "token-2022-with-anchor": "Token-2022 development",
  "instruction-introspection": "advanced Solana patterns",
  "testing-with-mollusk": "Solana testing",
  "solana-pay": "Solana payments",
  "create-your-sdk-with-codama": "SDK development",
  "winternitz-signatures-on-solana": "cryptography on Solana",
  "testing-with-litesvm": "Solana testing",
  "testing-with-surfpool": "Solana testing",
}

export default function CourseFooter({
  nextLesson,
  courseMetadata,
  nextLessonSlug,
  challenge,
}: CourseFooterProps) {
  const t = useTranslations();
  const { pathSlug } = usePathContent();

  const articles = getResearchForCourse(courseMetadata.slug as CourseId);
  const topic = COURSE_TOPICS[courseMetadata.slug] || "advanced Solana topics";

  const handleArticleClick = useCallback(
    (articleId: string) => {
      if (typeof window !== "undefined" && (window as any).analytics) {
        ; (window as any).analytics.track("research_link_clicked", {
          source: "course_conclusion",
          course: courseMetadata.slug,
          article: articleId,
        })
      }
    },
    [courseMetadata.slug]
  )

  const getLessonHref = (lessonSlug: string) =>
    pathSlug
      ? `/paths/${pathSlug}/courses/${courseMetadata.slug}/${lessonSlug}`
      : `/courses/${courseMetadata.slug}/${lessonSlug}`;

  const getChallengeHref = () =>
    pathSlug
      ? `/paths/${pathSlug}/challenges/${challenge.slug}`
      : `/challenges/${challenge.slug}`;

  return (
    <div className="flex flex-col w-[calc(100%+42px)] -ml-[21px] lg:w-[calc(100%+50px)] lg:-ml-[25px]">
      <div className="flex flex-col gap-y-6 bg-background relative">
        <div className="h-px w-full bg-border"></div>
        <div className="h-px w-full bg-border"></div>
        <CrosshairCorners
          corners={["top-left", "top-right"]}
          className="z-10 hidden xl:block"
          animationDelay={0}
          size={8}
          thickness={1}
          spacingY={-24}
          spacingX={0}
        />
      </div>
      <div className="w-full flex items-center flex-col gap-y-10">
        {nextLesson && (
          <>
            <Link
              href={getLessonHref(nextLessonSlug)}
              className="flex justify-between items-center w-full bg-card-solid border-x border-border-light group py-5 px-5"
            >
              <div className="flex items-center gap-x-2">
                <span className="text-mute text-sm font-mono text-shade-tertiary">
                  Next Lesson
                </span>
                <span className="font-medium text-shade-primary">
                  {t(
                    `courses.${courseMetadata.slug}.lessons.${nextLessonSlug}.title`
                  )}
                </span>
              </div>
              <Icon
                name="ArrowRight"
                className="text-mute text-sm group-hover:text-shade-primary group-hover:translate-x-1 transition"
              />
            </Link>
          </>
        )}

        {!nextLesson && challenge && (
          <div className="px-0 lg:px-0 w-full">
          <div className="w-full bg-card-solid border-x border-border-light relative py-8 px-8">
            <div className="max-w-[800px] mx-auto">
              <div className="gap-y-6 md:gap-y-0 flex flex-col md:flex-row justify-between items-center gap-x-12">
                <span className="text-shade-primary w-auto flex-shrink-0 font-mono">
                  {t("lessons.take_challenge_cta")}
                </span>
                <Link href={`${getChallengeHref()}?fromCourse=${courseMetadata.slug}`} className="w-max">
                  <Button
                    variant="primary"
                    size="md"
                    label={t("lessons.take_challenge")}
                    icon={{ name: "Challenge" }}
                  />
                </Link>
              </div>
            </div>
          </div>
          </div>
        )}
        {!nextLesson && !challenge && (
          <div className="px-0 lg:px-0 w-full">
            <div className="w-full bg-card-solid border-x border-border-light relative py-8 px-8">
              <div className="max-w-[800px] mx-auto">
                <div className="gap-y-6 md:gap-y-0 flex flex-col md:flex-row justify-between items-center gap-x-12">
                  <span className="text-shade-primary w-auto flex-shrink-0 font-mono">
                    {t("lessons.lesson_completed")}
                  </span>
                  <Link href={`/courses`} className="w-max">
                    <Button
                      variant="primary"
                      size="md"
                      label="Explore More Courses"
                      icon={{ name: "Lessons" }}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-y-6 bg-background relative">
        <CrosshairCorners
          corners={["bottom-left", "bottom-right"]}
          className="z-10 hidden xl:block"
          animationDelay={0}
          size={8}
          thickness={1}
          spacingY={-24}
          spacingX={0}
        />
        <div className="h-px w-full bg-border"></div>
        <div className="h-px w-full bg-border"></div>
      </div>

      {articles.length > 0 && !nextLesson && !challenge && (
        <div className="flex flex-col gap-y-6 px-5 py-8 lg:px-8 lg:py-10">
          <div className="flex items-center justify-between">
            <div className="relative w-max px-3 hidden md:block">
              <CrosshairCorners
                className="text-shade-mute"
                animationDelay={0}
                size={6}
                thickness={1}
                spacingX={0}
                variant="bordered"
              />
              <h3 className="font-medium font-mono text-shade-secondary">
                Want more?
              </h3>
            </div>
            <Badge label="Research" variant="brand" className="text-[15px]!" />
          </div>
          <div className="mx-auto w-full">
            <div className="grid gap-4 lg:gap-4 grid-cols-1 mb-6 w-full">
              {articles.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  onClick={() => handleArticleClick(article.id)}
                  className="group w-full border relative overflow-hidden border-border bg-card-solid hover:border-border-light transition-colors flex flex-col py-5 px-5"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CrosshairCorners
                    corners={["bottom-right"]}
                    className="z-10 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:text-brand-primary transition-transform duration-300"
                    animationDelay={0}
                    size={8}
                    thickness={1.5}
                    spacingX={-4}
                    spacingY={-4}
                  />

                  <div className="flex items-center">
                    <div className="flex flex-col items-start gap-2">
                      <h4 className="leading-[130%] text-shade-primary font-medium transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-shade-tertiary leading-[160%] text-sm">
                        {article.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

