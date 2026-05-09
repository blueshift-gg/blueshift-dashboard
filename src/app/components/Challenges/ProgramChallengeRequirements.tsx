"use client";

import { Icon } from "@blueshift-gg/ui-components";
import { useTranslations } from "next-intl";
import type React from "react";

interface ChallengeRequirementsProps {
  content: React.ReactNode;
}

export default function ChallengeRequirements({ content }: ChallengeRequirementsProps) {
  const t = useTranslations();

  return (
    <div className="col-span-2 flex flex-col gap-y-12">
      <div className="flex flex-col gap-y-2">
        <div className="mb-2 flex items-center gap-x-2 text-brand-secondary">
          <Icon name="Challenge" />
          <div className="font-mono font-medium">
            {t("ChallengePage.requirements_title").toUpperCase()}
          </div>
        </div>

        {content}
      </div>
    </div>
  );
}
