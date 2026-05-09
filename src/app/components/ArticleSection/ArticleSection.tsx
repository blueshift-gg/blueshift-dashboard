"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import CopyClipboard from "../CopyClipboard/CopyClipboard";

export function ArticleSection({
  name,
  id,
  level = "h2",
  isCode = false,
}: {
  name: string;
  id: string;
  level?: "h2" | "h3" | "h4";
  isCode?: boolean;
}) {
  const pathname = usePathname();
  const Heading = level;
  const [value, setValue] = useState("");
  useEffect(() => {
    const value = `${window.location.origin}${pathname}#${id}`;
    setValue(value);
  }, [id, pathname]);

  return (
    <Heading id={id} className="prose flex scroll-mt-24 items-center gap-x-2">
      {!isCode ? (
        <span>{name}</span>
      ) : (
        <div className="heading-code gradient-border flex items-center justify-center">
          <code>{name}</code>
        </div>
      )}
      <CopyClipboard value={value} />
    </Heading>
  );
}

export default ArticleSection;
