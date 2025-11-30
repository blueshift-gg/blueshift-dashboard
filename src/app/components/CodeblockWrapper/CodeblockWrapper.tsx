"use client";

import { Codeblock } from "@blueshift-gg/ui-components";
import { PathLanguages } from "@/app/utils/path";

interface CodeblockWrapperProps {
  children: React.ReactNode;
  "data-language"?: string;
}

export function CodeblockWrapper(props: CodeblockWrapperProps) {
  const children = props.children;
  const lang = props["data-language"];

  return (
    <Codeblock
      language={lang ? (lang as PathLanguages) : ("\u00A0" as PathLanguages)}
      clipboardText={children as string}
    >
      {children}
    </Codeblock>
  );
}

export default CodeblockWrapper;
