"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@blueshift-gg/ui-components";
import React from "react";

interface ChallengeRequirementsProps {
  content: React.ReactNode;
}

export default function ChallengeRequirements({
  content,
}: ChallengeRequirementsProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-y-12 col-span-2">
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-x-2 text-brand-secondary mb-2">
          <Icon name="Challenge" />
          <div className="font-medium font-mono">
            {t("ChallengePage.requirements_title").toUpperCase()}
          </div>
        </div>

        {content}
      </div>
    </div>
  );
}
