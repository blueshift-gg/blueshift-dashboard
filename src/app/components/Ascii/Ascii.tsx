"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BRAND_COLOURS } from "@blueshift-gg/ui-components";
import { anticipate } from "motion";

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
  }, []);

  return (
    <motion.div
      style={{ color: BRAND_COLOURS[color] }}
      className="flex justify-center items-center absolute inset-0 w-full mask-[linear-gradient(60deg,transparent_10%,black_40%,black_60%,transparent_100%)] overflow-hidden"
    >
      <pre
        ref={preRef}
        className="absolute left-0 md:-left-1/5 xl:left-[25px] text-[8px] tracking-wider text-current"
        dangerouslySetInnerHTML={{ __html: text || "" }}
      />

      <div className="flex flex-col max-w-[700px] break-all opacity-20 absolute left-0 text-current text-[8px] tracking-wider">
        {Array.from({ length: 50 }).map((_, index) => (
          <span key={index}>{`.`.repeat(500)}</span>
        ))}
      </div>
    </motion.div>
  );
};

export default AsciiAnimation;
