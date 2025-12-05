"use client";

import { useTranslations } from "next-intl";
import {
  Avatar,
  Button,
  CrosshairCorners,
  IconName,
  Tabs,
} from "@blueshift-gg/ui-components";
import { useState } from "react";

export default function Perks() {
  type Perk = {
    productName: string;
    perk: string;
    icon: string;
    brandColor: string;
    perkType: "airdrop" | "discount" | "free_gift";
  };

  const perks: Perk[] = [
    {
      productName: "$SOL",
      perk: "50 Devnet SOL",
      icon: "Solana",
      brandColor: "#9945FF",
      perkType: "airdrop",
    },
  ];

  const [activeTab, setActiveTab] = useState<"unlocked" | "claimed">(
    "unlocked"
  );

  const t = useTranslations();
  return (
    <div className="relative content-wrapper border-x border-border-light">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 divide-x divide-border-light">
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
          <div className="p-5 flex flex-col gap-y-5">
            <Tabs
              variant="segmented"
              theme="secondary"
              className="w-full!"
              title="Rewards"
              size="lg"
              items={[
                {
                  label: "Unlocked",
                  value: "unlocked",
                  selected: activeTab === "unlocked",
                  onClick: () => setActiveTab("unlocked"),
                },
                {
                  label: "Claimed",
                  value: "claimed",
                  selected: activeTab === "claimed",
                  onClick: () => setActiveTab("claimed"),
                },
              ]}
            />

            {activeTab === "unlocked" ? (
              perks.map((perk) => (
                <div
                  key={perk.productName}
                  className="flex flex-col gap-y-7 p-px border border-current/15 w-full bg-current/5"
                  style={{ color: perk.brandColor }}
                >
                  <div className="flex items-center gap-x-5 px-5 py-6">
                    <Avatar
                      icon={{ name: perk.icon as IconName, size: 32 }}
                      thickness={1.5}
                      crosshair={{
                        variant: "bordered",
                        animationDelay: 0,
                        animationDuration: 0,
                      }}
                      className="text-current!"
                    />
                    <div className="flex flex-col gap-y-1.5">
                      <span className="text-current leading-[125%] font-medium text-lg">
                        {perk.productName}
                      </span>
                      <span className="text-shade-primary font-mono text-2xl md:text-[28px] leading-none font-medium">
                        {perk.perk}
                      </span>
                    </div>
                  </div>

                  <div className="bg-background/40 p-3 w-full flex items-center justify-center">
                    <Button variant="secondary" size="lg" className="w-full">
                      Claim {perk.perkType === "airdrop" ? "Airdrop" : "Perk"}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center gap-y-3 mx-auto w-[300px] py-24">
                <div className="flex items-center gap-x-2">
                  <img
                    src="/graphics/sad-face.svg"
                    alt="Sad Face"
                    className="w-[30px] h-[30px]"
                  />
                  <span className="text-lg font-mono font-medium text-brand-primary leading-none text-center">
                    {t("perks.empty_title")}
                  </span>
                </div>
                <span className="text-shade-secondary leading-[140%] text-center">
                  {t("perks.empty_description")}
                </span>
              </div>
            )}
          </div>
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
