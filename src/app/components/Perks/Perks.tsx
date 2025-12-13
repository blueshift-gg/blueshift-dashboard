"use client";

import { useTranslations } from "next-intl";
import {
  Avatar,
  Button,
  CrosshairCorners,
  IconName,
  Tabs,
} from "@blueshift-gg/ui-components";
import { Faucet, type FaucetConfig } from "@blueshift-gg/faucet-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import PerksCard from "./PerksCard";
import PerksSkeletonCard from "./PerksSkeletonCard";
import { useAuth } from "@/hooks/useAuth";
import WalletMultiButton from "@/app/components/Wallet/WalletMultiButton";

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
  const [faucetNetwork, setFaucetNetwork] = useState<"devnet" | "testnet">(
    "devnet"
  );

  const [activeTab, setActiveTab] = useState<"unlocked" | "claimed">(
    "unlocked"
  );

  // Fake loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const t = useTranslations();
  return (
    <div className="relative content-wrapper border-x border-border-light">
      {!isUserConnected ? (
        <div className="z-10 flex-col gap-y-8 flex py-12 items-center justify-center w-full min-h-[60vh]">
          <div className="flex flex-col gap-y-0 max-w-[90dvw]">
            <img
              src="/graphics/connect-wallet.svg"
              className="sm:w-[360px] max-w-[80dvw] w-full mx-auto"
            />
            <div className="flex flex-col gap-y-3 max-w-[90dvw]">
              <div className="text-center text-lg sm:text-xl font-medium leading-none font-mono text-shade-primary">
                {t("perks.connect_wallet")}
              </div>
              <div className="text-center text-shade-secondary mx-auto sm:w-2/3 w-full">
                {t("perks.connect_wallet_description")}
              </div>
            </div>
          </div>
          <WalletMultiButton />
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 divide-x divide-border-light">
          <div className="col-span-7 w-full flex flex-col">
            <div className="p-5">
              <span className="font-mono text-shade-primary">
                {t("perks.faucet_title")}
              </span>
            </div>
            <div className="w-full h-px bg-border-light"></div>
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
              {isLoading ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <PerksSkeletonCard key={`list-skeleton-${index}`} />
                ))
              ) : activeTab === "unlocked" ? (
                perks.length > 0 ? (
                  perks.map((perk) => (
                    <PerksCard key={perk.productName} perk={perk} />
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
                )
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
      )}

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
