"use client";
import { BRAND_COLOURS } from "@blueshift-gg/ui-components";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const ASCII_BACKGROUND_ROWS = Array.from(
  { length: 50 },
  (_, rowNumber) => `ascii-row-${rowNumber + 1}`,
);

interface AsciiAnimationProps {
  textPath: string;
  color: keyof typeof BRAND_COLOURS;
}

const AsciiAnimation = ({ textPath, color }: AsciiAnimationProps) => {
  const preRef = useRef<HTMLPreElement>(null);
  const [text, setText] = useState<string>("");

  useEffect(() => {
    fetch(`/ascii/${textPath}.txt`)
      .then((res) => res.text())
      .then((text) => {
        setText(text);
      });
  }, [textPath]);

  return (
    <motion.div
      style={{ color: BRAND_COLOURS[color] }}
      className="absolute inset-0 flex w-full items-center justify-center overflow-hidden mask-[linear-gradient(60deg,transparent_10%,black_40%,black_60%,transparent_100%)]"
    >
      <pre
        ref={preRef}
        className="absolute left-0 text-[8px] tracking-wider text-current md:-left-1/5 xl:left-[25px]"
      >
        {text}
      </pre>

      <div className="absolute left-0 flex max-w-[700px] flex-col text-[8px] tracking-wider break-all text-current opacity-20">
        {ASCII_BACKGROUND_ROWS.map((rowKey) => (
          <span key={rowKey}>{".".repeat(500)}</span>
        ))}
      </div>
    </motion.div>
  );
};

export default AsciiAnimation;
