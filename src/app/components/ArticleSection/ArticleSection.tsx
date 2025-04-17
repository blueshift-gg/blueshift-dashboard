"use client";

import Icon from "../Icon/Icon";
import { usePathname } from "next/navigation";

export function ArticleSection({
  name,
  id,
}: {
  name: string;
  id: string;
}) {
  const pathname = usePathname();
  return (
    <h3 id={id} className="scroll-mt-24 flex items-center gap-x-2">
      {name}
      <div
        className="cursor-pointer"
        onClick={() => {
          const fullUrl = `${window.location.origin}${pathname}#${id}`;
          navigator.clipboard.writeText(fullUrl);
        }}
      >
        <Icon
          name="Link"
          className="transition text-mute hover:text-tertiary"
        />
      </div>
    </h3>
  );
}

export default ArticleSection;