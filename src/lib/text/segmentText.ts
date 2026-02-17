export type TextSplitBy = "words" | "chars";

export type SegmentedTextToken = {
  text: string;
  shouldAnimate: boolean;
};

function segmentWithIntl(
  text: string,
  splitBy: TextSplitBy,
  locale?: string | string[]
): SegmentedTextToken[] {
  const segmenter = new Intl.Segmenter(locale, {
    granularity: splitBy === "words" ? "word" : "grapheme",
  });

  return Array.from(segmenter.segment(text)).map((segment) => ({
    text: segment.segment,
    shouldAnimate:
      splitBy === "words"
        ? (segment.isWordLike ?? /\S/.test(segment.segment))
        : /\S/.test(segment.segment),
  }));
}

function segmentWithFallback(
  text: string,
  splitBy: TextSplitBy
): SegmentedTextToken[] {
  if (splitBy === "words") {
    return text.split(/(\s+)/).map((part) => ({
      text: part,
      shouldAnimate: /\S/.test(part),
    }));
  }

  return Array.from(text).map((part) => ({
    text: part,
    shouldAnimate: /\S/.test(part),
  }));
}

export function segmentText(
  text: string,
  splitBy: TextSplitBy,
  locale?: string | string[]
): SegmentedTextToken[] {
  const hasSegmenter = typeof Intl !== "undefined" && "Segmenter" in Intl;

  if (hasSegmenter) {
    return segmentWithIntl(text, splitBy, locale);
  }

  return segmentWithFallback(text, splitBy);
}
