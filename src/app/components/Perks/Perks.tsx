"use client";

import { useTranslations } from "next-intl";
import { CrosshairCorners } from "@blueshift-gg/ui-components";

export default function Perks() {
  const t = useTranslations();
  return (
    <div className="relative content-wrapper border-x border-border-light">
      <div className="w-full grid grid-cols-12 divide-x divide-border-light">
        <div className="col-span-7 w-full flex flex-col">
          <div className="p-5">
            <span className="font-mono text-shade-primary">
              {t("perks.faucet_title")}
            </span>
          </div>
          <div className="w-full h-px bg-border-light"></div>
          <div className="p-5"></div>
        </div>
        <div className="col-span-5">
          <div className="p-5">
            <span className="font-mono text-shade-primary">
              {t("perks.rewards_title")}
            </span>
          </div>
          <div className="w-full h-px bg-border-light"></div>
          <div className="p-5"></div>
        </div>
      </div>

      <CrosshairCorners
        corners={["top-left", "bottom-right"]}
        size={6}
        variant="cross"
        animationDelay={0}
        className="z-10"
      />
      <div className="w-screen left-1/2 -translate-x-1/2 absolute h-px bg-border-light"></div>
    </div>
  );
}
