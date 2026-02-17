import { animate, anticipate, stagger } from "motion";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import {
  segmentText,
  type SegmentedTextToken,
  type TextSplitBy,
} from "@/lib/text/segmentText";

type UseTokenRevealAnimationProps = {
  text: string;
  splitBy: TextSplitBy;
  locale?: string | string[];
  color: string;
  cursorColor: string;
  baseDelay: number;
  speed: number;
};

type UseTokenRevealAnimationResult = {
  containerRef: RefObject<HTMLDivElement | null>;
  tokens: SegmentedTextToken[];
  getTokenRef: (index: number) => (element: HTMLSpanElement | null) => void;
};

export function useTokenRevealAnimation({
  text,
  splitBy,
  locale,
  color,
  cursorColor,
  baseDelay,
  speed,
}: UseTokenRevealAnimationProps): UseTokenRevealAnimationResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const tokenRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tokens = useMemo(
    () => segmentText(text, splitBy, locale),
    [text, splitBy, locale]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let controls: ReturnType<typeof animate> | undefined;
    const fontsReady =
      "fonts" in document ? document.fonts.ready : Promise.resolve();

    fontsReady.then(() => {
      if (cancelled || !containerRef.current) return;

      containerRef.current.style.visibility = "visible";

      const targets = tokens
        .map((token, index) =>
          token.shouldAnimate ? tokenRefs.current[index] : null
        )
        .filter((element): element is HTMLSpanElement => Boolean(element));

      if (targets.length === 0) return;

      controls = animate(
        targets,
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
        }
      );
    });

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [tokens, baseDelay, speed, cursorColor, color]);

  const getTokenRef = (index: number) => (element: HTMLSpanElement | null) => {
    tokenRefs.current[index] = element;
  };

  return {
    containerRef,
    tokens,
    getTokenRef,
  };
}