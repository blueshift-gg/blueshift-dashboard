"use client";

import { Button, CrosshairCorners } from "@blueshift-gg/ui-components";
import Link from "next/link";
import { memo, useCallback } from "react";
import { type CourseId, getResearchForCourse } from "@/lib/cross-linking";

type AnalyticsClient = {
  track: (event: string, properties: Record<string, string>) => void;
};

type AnalyticsWindow = Window & {
  analytics?: AnalyticsClient;
};

interface Props {
  courseId: CourseId;
  className?: string;
}

// Map course IDs to contextual topic descriptions
const COURSE_TOPICS: Record<CourseId, string> = {
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
  "introduction-to-low-level-solana": "low-level Solana",
  "quantum-vault": "quantum-resistant cryptography",
  "research-crateless-program": "crateless programs",
};

export const FurtherReading = memo<Props>(({ courseId, className }) => {
  const articles = getResearchForCourse(courseId);

  const handleClick = useCallback(
    (articleId: string) => {
      const analytics =
        typeof window !== "undefined" ? (window as AnalyticsWindow).analytics : undefined;

      if (analytics) {
        analytics.track("research_link_clicked", {
          source: "course_conclusion",
          course: courseId,
          article: articleId,
        });
      }
    },
    [courseId],
  );

  if (articles.length === 0) {
    return null;
  }

  const topic = COURSE_TOPICS[courseId] || "advanced Solana topics";

  return (
    <aside
      className={`relative -mx-5 mt-16 border-y border-border bg-card-solid/50 md:mt-24 lg:-mx-6 ${className || ""}`}
      aria-labelledby="further-reading-heading"
    >
      <CrosshairCorners variant="corners" corners={["top-left", "bottom-right"]} size={8} />

      <div className="mx-auto max-w-[1000px] px-5 py-8 md:px-12 md:py-12 lg:px-6">
        <h2
          id="further-reading-heading"
          className="mb-3 text-2xl leading-[120%] font-medium text-shade-primary"
        >
          Dive Deeper
        </h2>
        <p className="mb-8 text-shade-secondary">
          Learn how these concepts are applied in production with research on {topic}:
        </p>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {articles.map((article) => (
            <a
              key={article.id}
              href={article.url}
              onClick={() => handleClick(article.id)}
              className="group flex flex-col border border-border bg-card-solid p-4.5 transition-colors hover:border-brand-primary/50 sm:p-6"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="mb-2 flex items-start gap-2">
                <span className="mt-0.5 text-brand-primary">→</span>
                <h3 className="text-[18px] leading-[130%] font-medium text-shade-primary transition-colors group-hover:text-brand-primary">
                  {article.title}
                </h3>
              </div>
              <p className="pl-6 text-sm text-shade-secondary">{article.description}</p>
            </a>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="https://blueshift.gg/research" target="_blank">
            <Button
              label="Explore All Research"
              variant="secondary"
              size="md"
              icon={{ name: "External", size: 18 }}
              iconPosition="right"
            />
          </Link>
        </div>
      </div>
    </aside>
  );
});

FurtherReading.displayName = "FurtherReading";
