"use client";

import { Icon } from "@blueshift-gg/ui-components";
import { anticipate } from "motion";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import DecryptedText from "../HeadingReveal/DecryptText";

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
    <button
      type="button"
      className="relative z-10 flex cursor-pointer flex-col items-center justify-center"
      onClick={handleCopy}
    >
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: -36, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: anticipate }}
            className="absolute border border-border bg-card-solid/50 px-3 py-2 text-sm backdrop-blur"
          >
            <DecryptedText
              speed={100}
              parentClassName="!text-brand-secondary"
              className="!font-mono text-sm font-normal tracking-normal !text-brand-secondary"
              text="Copied"
              isHovering={true}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Icon
        name="Link"
        className="text-mute transition hover:text-shade-tertiary"
        size={iconSize as 18 | 14 | 12}
      />
    </button>
  );
}
