"use client";

import { Icon } from "@blueshift-gg/ui-components";
import DecryptedText from "../HeadingReveal/DecryptText";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { anticipate } from "motion";

export default function CopyClipboard({
  value,
  iconSize = 18,
}: {
  value: string;
  iconSize?: 20 | 18 | 14 | 12;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div
      className="relative z-10 cursor-pointer items-center justify-center flex flex-col"
      onClick={handleCopy}
    >
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: -36, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: anticipate }}
            className="absolute bg-card-solid/50 backdrop-blur border border-border px-3 py-2 text-sm"
          >
            <DecryptedText
              speed={100}
              parentClassName="!text-brand-secondary"
              className="text-sm !font-mono tracking-normal font-normal !text-brand-secondary"
              text="Copied"
              isHovering={true}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Icon
        name="Link"
        className="transition text-mute hover:text-shade-tertiary"
        size={iconSize as 18 | 14 | 12}
      />
    </div>
  );
}
