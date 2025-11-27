"use client";

import CopyClipboard from "../CopyClipboard/CopyClipboard";
import { HeadingReveal } from "@blueshift-gg/ui-components";
import { usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";

export default function LessonTitle({ title }: { title: string }) {
  const pathname = usePathname();
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(`${window.location.origin}${pathname}`);
    }
  }, [pathname]);

  return (
    <div className="flex items-center gap-x-4">
      <HeadingReveal
        text={title}
        headingLevel="h1"
        className="text-3xl font-semibold"
      />
      <CopyClipboard value={url} iconSize={20} />
    </div>
  );
}
