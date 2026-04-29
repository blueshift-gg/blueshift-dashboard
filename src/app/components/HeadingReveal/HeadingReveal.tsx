"use client";

import classNames from "classnames";
import { useTokenRevealAnimation } from "@/hooks/useTokenRevealAnimation";
import { type TextSplitBy } from "@/lib/text/segmentText";

export default function HeadingReveal({
  text,
  headingLevel,
  className,
  color = "#EFF1F6",
  cursorColor = "#00FFFF",
  baseDelay = 0,
  splitBy,
  locale,
  speed = 0.25,
}: {
  text: string;
  headingLevel: "h1" | "h2" | "h3";
  className?: string;
  color?: string;
  cursorColor?: string;
  baseDelay?: number;
  splitBy?: TextSplitBy;
  locale?: string | string[];
  speed?: number;
}) {
  const resolvedSplitBy = splitBy ?? "words";

  const { containerRef, tokens, getTokenRef } = useTokenRevealAnimation({
    text,
    splitBy: resolvedSplitBy,
    locale,
    color,
    cursorColor,
    baseDelay,
    speed,
  });

  const HeadingTag = headingLevel;

  const headingContent = tokens.map((token, index) => (
    <span
      key={`${index}-${token.text}`}
      aria-hidden="true"
      ref={getTokenRef(index)}
    >
      {token.text}
    </span>
  ));

  return (
    <div ref={containerRef}>
      <HeadingTag className={classNames(headingLevel, className)} aria-label={text}>
        {headingContent}
      </HeadingTag>
    </div>
  );
}
