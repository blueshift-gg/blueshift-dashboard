"use client"

import { memo, useCallback } from "react"
import { getResearchForCourse, type CourseId } from "@/lib/cross-linking"
import { CrosshairCorners, Button } from "@blueshift-gg/ui-components"
import Link from "next/link"

interface Props {
  courseId: CourseId
  className?: string
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
  "research-crateless-program": "crateless programs"
}

export const FurtherReading = memo<Props>(({ courseId, className }) => {
  const articles = getResearchForCourse(courseId)

  const handleClick = useCallback(
    (articleId: string) => {
      if (typeof window !== "undefined" && (window as any).analytics) {
        ; (window as any).analytics.track("research_link_clicked", {
          source: "course_conclusion",
          course: courseId,
          article: articleId,
        })
      }
    },
    [courseId]
  )

  if (articles.length === 0) {
    return null
  }

  const topic = COURSE_TOPICS[courseId] || "advanced Solana topics"

  return (
    <aside
      className={`-mx-5 lg:-mx-6 mt-16 md:mt-24 bg-card-solid/50 border-y border-border relative ${className || ''}`}
      aria-labelledby="further-reading-heading"
    >
      <CrosshairCorners
        variant="corners"
        corners={["top-left", "bottom-right"]}
        size={8}
      />

      <div className="max-w-[1000px] mx-auto px-5 lg:px-6 py-8 md:py-12 md:px-12">
        <h2
          id="further-reading-heading"
          className="text-2xl leading-[120%] font-medium text-shade-primary mb-3"
        >
          Dive Deeper
        </h2>
        <p className="text-shade-secondary mb-8">
          Learn how these concepts are applied in production with research on {topic}:
        </p>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <a
              key={article.id}
              href={article.url}
              onClick={() => handleClick(article.id)}
              className="group border border-border bg-card-solid hover:border-brand-primary/50 transition-colors flex flex-col p-4.5 sm:p-6"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-brand-primary mt-0.5">→</span>
                <h3 className="text-[18px] leading-[130%] text-shade-primary font-medium group-hover:text-brand-primary transition-colors">
                  {article.title}
                </h3>
              </div>
              <p className="text-sm text-shade-secondary pl-6">
                {article.description}
              </p>
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
  )
})

FurtherReading.displayName = "FurtherReading"
