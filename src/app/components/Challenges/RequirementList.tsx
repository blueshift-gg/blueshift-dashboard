import type React from "react";

interface ChallengeRequirementListProps {
  children: React.ReactNode;
}

export function RequirementList({ children }: ChallengeRequirementListProps) {
  return (
    <div className="custom-scrollbar mt-4 flex max-h-[350px] flex-col gap-y-4 overflow-y-scroll [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_80%,transparent)] pt-4 pr-2 pb-6 sm:pr-10">
      {children}
    </div>
  );
}
