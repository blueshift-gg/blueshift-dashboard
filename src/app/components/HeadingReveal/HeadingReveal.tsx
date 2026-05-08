"use client";

import { animate, stagger, anticipate } from "motion";
import { splitText } from "motion-plus";
import { useEffect, useRef } from "react";
import classNames from "classnames";
import { useSplitLocaleBy } from "@/i18n/hooks";

export default function HeadingReveal({
  text,
  headingLevel,
  className,
  color = "#EFF1F6",
  cursorColor = "#00FFFF",
  baseDelay = 0,
  splitBy,
  speed = 0.25,
}: {
  text: string;
  headingLevel: "h1" | "h2" | "h3";
  className?: string;
  color?: string;
  cursorColor?: string;
  baseDelay?: number;
  splitBy?: "words" | "chars";
  speed?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const localeSegmentation = useSplitLocaleBy();
  splitBy ??= localeSegmentation;

  useEffect(() => {
    document.fonts.ready.then(() => {
      if (!containerRef.current) return;

      // Hide the container until the fonts are loaded
      containerRef.current.style.visibility = "visible";

      const { words, chars } = splitText(
        containerRef.current.querySelector(headingLevel)!,
      );

      // Animate the words in the h1
      animate(
        splitBy === "words" ? words : chars,
        {
          backgroundColor: [
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0)",
            cursorColor,
            cursorColor,
            cursorColor,
            "rgba(255,255,255,0)",
          ],
          color: [
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0)",
            cursorColor,
            cursorColor,
            cursorColor,
            color,
          ],
        },
        {
          ease: anticipate,
          duration: speed,
          delay: stagger(speed / 2, { startDelay: baseDelay }),
        },
      );
    });
  }, []);

  return (
    <div ref={containerRef}>
      {headingLevel === "h1" && (
        <h1 className={classNames("h1", className)}>{text}</h1>
      )}
      {headingLevel === "h2" && (
        <h2 className={classNames("h2", className)}>{text}</h2>
      )}
      {headingLevel === "h3" && (
        <h3 className={classNames("h3", className)}>{text}</h3>
      )}
    </div>
  );
}
