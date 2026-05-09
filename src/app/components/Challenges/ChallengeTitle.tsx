import type { ReactNode } from "react";

interface ChallengeTitleProps {
  children: ReactNode;
}

export function ChallengeTitle({ children }: ChallengeTitleProps) {
  return <div className="text-2xl font-medium text-shade-primary">{children}</div>;
}
