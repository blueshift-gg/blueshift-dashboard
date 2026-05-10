import type React from "react";

interface RequirementProps {
  title: string;
  children: React.ReactNode;
}

export function Requirement({ title, children }: RequirementProps) {
  return (
    <div className="flex flex-col">
      <span className="font-medium text-shade-primary">{title}</span>
      <div className="leading-[160%] text-shade-secondary">{children}</div>
    </div>
  );
}
