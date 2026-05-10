"use client";

import { Faucet, type FaucetConfig } from "@blueshift-gg/faucet-react";
import { CrosshairCorners, Tabs } from "@blueshift-gg/ui-components";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import WalletMultiButton from "@/app/components/Wallet/WalletMultiButton";
import { useAuth } from "@/hooks/useAuth";
import PerksCard from "./PerksCard";
import PerksSkeletonCard from "./PerksSkeletonCard";

export type Perk = {
  productName: string;
  perk: string;
  icon: string;
  brandColor: string;
  perkType: "airdrop" | "discount" | "free_gift";
};

const FAUCET_API_CONFIG = {
  baseUrl: "https://faucet-api.blueshift.gg",
  devnetRpc: process.env.NEXT_PUBLIC_DEVNET_RPC_ENDPOINT ?? "https://api.devnet.solana.com",
  testnetRpc: "https://api.testnet.solana.com",
};

const FAUCET_CLAIM_AMOUNTS: number[] = [1, 2, 5, 10];

const PERKS_SKELETON_KEYS = ["perk-skeleton-1", "perk-skeleton-2"] as const;

export default function Perks() {
  const perks: Perk[] = [
    // {
    //   productName: "$SOL",
    //   perk: "50 Devnet SOL",
    //   icon: "Solana",
    //   brandColor: "#9945FF",
    //   perkType: "airdrop",
    // },
  ];

  const auth = useAuth();
  const isUserConnected = auth.status === "signed-in";
  const { publicKey, signMessage } = useWallet();

  const faucetProgramId = process.env.NEXT_PUBLIC_FAUCET_PROGRAM_ID;
  const faucetConfig: FaucetConfig = {
    faucetProgramId: faucetProgramId ?? "",
    claimAmounts: FAUCET_CLAIM_AMOUNTS,
  };
  const userAddress = publicKey?.toBase58();
  const [faucetNetwork, setFaucetNetwork] = useState<"devnet" | "testnet">("devnet");

  const [activeTab, setActiveTab] = useState<"unlocked" | "claimed">("unlocked");

  // Fake loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const t = useTranslations();
  return (
    <div className="content-wrapper relative border-x border-border-light">
      {!isUserConnected ? (
        <div className="z-10 flex min-h-[60vh] w-full flex-col items-center justify-center gap-y-8 py-12">
          <div className="flex max-w-[90dvw] flex-col gap-y-0">
            <img
              src="/graphics/connect-wallet.svg"
              className="mx-auto w-full max-w-[80dvw] sm:w-[360px]"
              alt="Connect wallet"
            />
            <div className="flex max-w-[90dvw] flex-col gap-y-3">
              <div className="text-center font-mono text-lg leading-none font-medium text-shade-primary sm:text-xl">
                {t("perks.connect_wallet")}
              </div>
              <div className="mx-auto w-full text-center text-shade-secondary sm:w-2/3">
                {t("perks.connect_wallet_description")}
              </div>
            </div>
          </div>
          <WalletMultiButton />
        </div>
      ) : (
        <div className="grid w-full grid-cols-1 divide-x divide-border-light lg:grid-cols-2">
          <div className="flex w-full flex-col">
            <div className="p-5">
              <span className="font-mono text-shade-primary">{t("perks.faucet_title")}</span>
            </div>
            <div className="h-px w-full bg-border-light"></div>
            <div className="p-5">
              <Faucet
                config={faucetConfig}
                apiConfig={FAUCET_API_CONFIG}
                network={faucetNetwork}
                onNetworkChange={setFaucetNetwork}
                address={userAddress}
                signMessage={signMessage}
              />
            </div>
          </div>
          <div className="w-full">
            <div className="p-5">
              <span className="font-mono text-shade-primary">{t("perks.rewards_title")}</span>
            </div>
            <div className="h-px w-full bg-border-light"></div>
            <div className="flex flex-col gap-y-5 p-5">
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
              {isLoading ? (
                PERKS_SKELETON_KEYS.map((skeletonKey) => <PerksSkeletonCard key={skeletonKey} />)
              ) : activeTab === "unlocked" ? (
                perks.length > 0 ? (
                  perks.map((perk) => <PerksCard key={perk.productName} perk={perk} />)
                ) : (
                  <div className="mx-auto flex w-[300px] flex-col items-center justify-center gap-y-3 py-24">
                    <div className="flex items-center gap-x-2">
                      <img
                        src="/graphics/sad-face.svg"
                        alt="Sad Face"
                        className="h-[30px] w-[30px]"
                      />
                      <span className="text-center font-mono text-lg leading-none font-medium text-brand-primary">
                        {t("perks.empty_title")}
                      </span>
                    </div>
                    <span className="text-center leading-[140%] text-shade-secondary">
                      {t("perks.empty_description")}
                    </span>
                  </div>
                )
              ) : (
                <div className="mx-auto flex w-[300px] flex-col items-center justify-center gap-y-3 py-24">
                  <div className="flex items-center gap-x-2">
                    <img
                      src="/graphics/sad-face.svg"
                      alt="Sad Face"
                      className="h-[30px] w-[30px]"
                    />
                    <span className="text-center font-mono text-lg leading-none font-medium text-brand-primary">
                      {t("perks.empty_title")}
                    </span>
                  </div>
                  <span className="text-center leading-[140%] text-shade-secondary">
                    {t("perks.empty_description")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CrosshairCorners
        corners={["top-left", "bottom-right"]}
        size={6}
        variant="cross"
        animationDelay={0}
        className="z-10"
      />
      <div className="absolute left-1/2 h-px w-screen -translate-x-1/2 bg-border-light"></div>
    </div>
  );
}
