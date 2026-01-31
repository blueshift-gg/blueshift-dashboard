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
      { type: "course", slug: "nfts-on-solana" }
    ],
  },
];
