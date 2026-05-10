"use client";

import { Codeblock } from "@blueshift-gg/ui-components";
import type { PathLanguages } from "@/app/utils/path";

interface CodeblockWrapperProps {
  children: React.ReactNode;
  clipboardText: string;
  "data-language"?: string;
}

export function CodeblockWrapper(props: CodeblockWrapperProps) {
  const children = props.children;
  const clipboardText = props.clipboardText;
  const lang = props["data-language"];

  return (
    <Codeblock
      language={lang ? (lang as PathLanguages) : ("\u00A0" as PathLanguages)}
      clipboardText={clipboardText}
    >
      <div>{children}</div>
    </Codeblock>
  );
}

export default CodeblockWrapper;
