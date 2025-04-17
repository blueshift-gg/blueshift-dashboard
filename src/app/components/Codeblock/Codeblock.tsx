"use client";

import Icon from "../Icon/Icon";

export function Codeblock({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: string;
}) {
  const getCodeText = () => {
    if (!children) return "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const code = (children as any)?.props?.children?.props?.children?.props
      ?.children;

    if (Array.isArray(code)) {
      return code
        .map((line) => {
          if (typeof line === "string") return line;
          return (
            line.props.children
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((span: any) => span.props.children)
              .join("")
          );
        })
        .join("");
    }

    return "";
  };

  return (
    <div className="flex flex-col w-full border border-border rounded-xl overflow-hidden !my-8">
      <div className="text-sm font-medium text-brand-secondary flex items-center justify-between px-6 py-3 border-b-border bg-background-card-foreground rounded-t-xl">
        {lang}
        {children && (
          <div
            onClick={() => {
              navigator.clipboard.writeText(getCodeText());
            }}
          >
            <Icon
              name="Copy"
              size={16 as 18 | 14 | 12}
              className="text-mute hover:text-secondary transition cursor-pointer"
            />
          </div>
        )}
      </div>
      <div className="bg-background-card">{children}</div>
    </div>
  );
}

export default Codeblock;
