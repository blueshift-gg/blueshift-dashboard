"use client";

import { Codeblock } from "@blueshift-gg/ui-components";
import { PathLanguages } from "@/app/utils/path";
import { useRef, useState, useEffect } from "react";

interface CodeblockWrapperProps {
  children: React.ReactNode;
  "data-language"?: string;
}

export function CodeblockWrapper(props: CodeblockWrapperProps) {
  const children = props.children;
  const lang = props["data-language"];
  const preRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    if (preRef.current) {
      setText(preRef.current.textContent ?? "");
    }
  }, [children]);

  return (
    <Codeblock
      language={lang ? (lang as PathLanguages) : ("\u00A0" as PathLanguages)}
      clipboardText={text}
    >
      <div ref={preRef}>{children}</div>
    </Codeblock>
  );
}

export default CodeblockWrapper;
