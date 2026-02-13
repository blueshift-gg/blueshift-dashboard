import { PathMetadata } from "@/app/utils/path";
import { BRAND_COLOURS } from "@blueshift-gg/ui-components";

export const paths: PathMetadata[] = [
  {
    slug: "introduction-to-blockchain-and-solana",
    language: "General",
    color: BRAND_COLOURS.general,
    difficulty: 1,
    isFeatured: true,
    estimatedHours: 15,
    steps: [
      { type: "course", slug: "blockchain-fundamentals" },
      { type: "course", slug: "evolution-programmable-blockchains" },
      { type: "course", slug: "understanding-solana" },
      { type: "course", slug: "tokens-on-solana" },
      { type: "course", slug: "nfts-on-solana" },
    ],
  },
  {
    slug: "solana-mobile-mastery",
    language: "Mobile",
    color: BRAND_COLOURS.mobile,
    difficulty: 2,
    isFeatured: true,
    estimatedHours: 18,
    steps: [
      { type: "course", slug: "mobile-dapp-fundamentals" },
      { type: "course", slug: "mwa-deep-dive" },
      { type: "course", slug: "embedded-wallets" },
      { type: "course", slug: "solana-mobile-client" },
      { type: "course", slug: "dapp-store-publishing" },
    ],
  },
];
