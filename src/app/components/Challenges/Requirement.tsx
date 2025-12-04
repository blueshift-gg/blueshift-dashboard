import React from "react";

interface RequirementProps {
  title: string;
  children: React.ReactNode;
}

export function Requirement({ title, children }: RequirementProps) {
  return (
    <div className="flex flex-col">
      <span className="font-medium text-shade-primary">{title}</span>
      <div className="text-shade-secondary leading-[160%]">{children}</div>
    </div>
  );
}
