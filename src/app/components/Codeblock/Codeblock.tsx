"use client";

import { useRef, useState } from "react";
import Icon from "../Icon/Icon";
import { motion } from "motion/react";
import classNames from "classnames";
import { anticipate } from "motion";

interface CodeblockProps {
  children: React.ReactNode;
  "data-language"?: string;
}

export function Codeblock(props: CodeblockProps) {
  const preRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const children = props.children;
  const lang = props["data-language"];

  const handleClickCopy = async () => {
    const code = preRef.current?.textContent;

    if (!code) return;

    await navigator.clipboard.writeText(code);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col w-full border border-border rounded-xl overflow-hidden !my-8 code-block">
      <div className="text-sm font-medium text-brand-secondary flex items-center justify-between px-6 py-3 border-b-border bg-card-solid-foreground rounded-t-xl">
        {lang || "\u00A0"}
        {children && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: anticipate }}
            key={isCopied ? "success" : "copy"}
            onClick={() => {
              if (isCopied) return;
              handleClickCopy();
            }}
          >
            <Icon
              name={isCopied ? "Success" : "Copy"}
              size={16 as 18 | 14 | 12}
              className={classNames(
                "text-mute hover:text-shade-secondary transition cursor-pointer",
                {
                  "!text-brand-primary !cursor-default": isCopied,
                }
              )}
            />
          </motion.div>
        )}
      </div>
      <div className="bg-card-solid" ref={preRef}>
        {children}
      </div>
    </div>
  );
}

export default Codeblock;
