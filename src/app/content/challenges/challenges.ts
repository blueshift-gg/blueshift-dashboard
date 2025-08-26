import { ChallengeMetadata } from "@/app/utils/challenges";

const allChallenges: ChallengeMetadata[] = [
  {
    slug: "anchor-vault",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    unitName: "Anchor Vault",
    apiPath: "/v1/verify/anchor/vault",
    requirements: [
      { instructionKey: "deposit" },
      { instructionKey: "withdraw" },
    ],
    collectionMintAddress: "53tiK9zY67DuyA1tgQ6rfNgixMB1LiCP9D67RgfbCrpz",
  },
  {
    slug: "anchor-escrow",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    unitName: "Anchor Escrow",
    apiPath: "/v1/verify/anchor/escrow",
    pages: [{ slug: "make" }, { slug: "take" }, { slug: "refund" }],
    requirements: [
      { instructionKey: "make" },
      { instructionKey: "take" },
      { instructionKey: "refund" },
    ],
    collectionMintAddress: "2E5K7FxDWGXkbRpFEAkhR8yQwiUBGggVyng2vaAhah5L",
  },
  {
    slug: "anchor-flash-loan",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 2,
    isFeatured: true,
    unitName: "Anchor Flash Loan",
    apiPath: "/v1/verify/anchor/flash-loan",
    pages: [{ slug: "borrow" }, { slug: "repay" }],
    requirements: [
      { instructionKey: "flash_loan" },
    ],
    collectionMintAddress: "4HJoxVtwKsLNKx3QsxG34FW39ENQZSZHmXi7wsuEVrAy",
  },
  {
    slug: "pinocchio-vault",
    language: "Rust",
    color: "255,173,102",
    difficulty: 2,
    isFeatured: true,
    unitName: "Pinocchio Vault",
    apiPath: "/v1/verify/pinocchio/vault",
    requirements: [
      { instructionKey: "deposit" },
      { instructionKey: "withdraw" },
    ],
    collectionMintAddress: "AL38QM96SDu4Jpx7UGcTcaLtwvWPVgRUzg9PqC787djK",
  },
  {
    slug: "pinocchio-escrow",
    language: "Rust",
    color: "255,173,102",
    difficulty: 2,
    isFeatured: true,
    unitName: "Pinocchio Escrow",
    apiPath: "/v1/verify/pinocchio/escrow",
    pages: [
      { slug: "make" },
      { slug: "take" },
      { slug: "refund" },
      { slug: "conclusion" },
    ],
    requirements: [
      { instructionKey: "make" },
      { instructionKey: "take" },
      { instructionKey: "refund" },
    ],
    collectionMintAddress: "HTXVJ8DD6eSxkVyDwgddxGw8cC8j6kXda3BUipA43Wvs",
  },
  {
    slug: "pinocchio-amm",
    language: "Rust",
    color: "255,173,102",
    difficulty: 3,
    isFeatured: true,
    unitName: "Pinocchio AMM",
    apiPath: "/v1/verify/pinocchio/amm",
    pages: [
      { slug: "initialize" },
      { slug: "deposit" },
      { slug: "withdraw" },
      { slug: "swap" },
      { slug: "conclusion" },
    ],
    requirements: [
      { instructionKey: "initialize" },
      { instructionKey: "deposit" },
      { instructionKey: "withdraw" },
      { instructionKey: "swap" },
    ],
    collectionMintAddress: "9Lz67dYmMG8JzkkvfWQuVgGR12JdjV54p9e8TViKiqQz",
  },
  {
    slug: "pinocchio-secp256r1-vault",
    language: "Rust",
    color: "255,173,102",
    difficulty: 2,
    isFeatured: true,
    unitName: "Pinocchio Secp256r1 Vault",
    apiPath: "/v1/verify/pinocchio/secp256r1-vault",
    requirements: [
      { instructionKey: "deposit" },
      { instructionKey: "withdraw" },
    ],
    collectionMintAddress: "4NKZ2B5zeG9TGZifzfnG7Zw28P3ZetjaS6xPVKW5MHrp",
  },
  {
    slug: "pinocchio-flash-loan",
    language: "Rust",
    color: "255,173,102",
    difficulty: 2,
    isFeatured: true,
    unitName: "Pinocchio Flash Loan",
    apiPath: "/v1/verify/pinocchio/flash-loan",
    pages: [{ slug: "borrow" }, { slug: "repay" }],
    requirements: [
      { instructionKey: "flash_loan" },
    ],
    collectionMintAddress: "9L975Y5Y6Gub2RHNFECyP3cJh3aiE1eVgo2A6mVV8YQu",
  },
  {
    slug: "typescript-mint-an-spl-token",
    language: "Typescript",
    color: "105,162,241",
    difficulty: 1,
    isFeatured: true,
    unitName: "Mint an SPL Token",
    apiPath: "/v1/verify/typescript/mint-an-spl-token",
    requirements: [
      { instructionKey: "create_mint_account" },
      { instructionKey: "initialize_mint" },
      { instructionKey: "create_token_account" },
      { instructionKey: "mint_to" },
    ],
    collectionMintAddress: "2NVDhSXZck9AX2aUdPSxMemLN2wtqEd5sNEcwuZVCbHW",
  },
  {
    slug: "assembly-memo",
    language: "Assembly",
    color: "140,255,102",
    difficulty: 2,
    isFeatured: true,
    unitName: "Assembly Memo",
    apiPath: "/v1/verify/assembly/memo",
    requirements: [
      { instructionKey: "log" },
      { instructionKey: "log_different" },
    ],
    collectionMintAddress: "J4TtfoyvksdNjLAqs1yXbZwe8wjVCX6TSjYyGMhU6BU7",
  },
  {
    slug: "assembly-slippage",
    language: "Assembly",
    color: "140,255,102",
    difficulty: 3,
    isFeatured: true,
    unitName: "Assembly Slippage",
    apiPath: "/v1/verify/assembly/slippage",
    requirements: [
      { instructionKey: "slippage" },
      { instructionKey: "slippage_failure" },
      { instructionKey: "slippage_token2022" },

    ],
    collectionMintAddress: "EEzodaKLa7KKbWdUAtjTJxjQXgrfQkkDEnQWzGTYFBBf",
  },
  {
    slug: "assembly-timeout",
    language: "Assembly",
    color: "140,255,102",
    difficulty: 2,
    isFeatured: true,
    unitName: "Assembly Timeout",
    apiPath: "/v1/verify/assembly/timeout",
    requirements: [
      { instructionKey: "timeout" },
      { instructionKey: "timeout_failure" },
    ],
    collectionMintAddress: "FW9LJEjJwGL1fkAjfM9HxuJuftTU9KrRvPBgP5ZzJx3D",
  },
  {
    slug: "anchor-merkle-airdrop-claimer",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 3,
    isFeatured: true,
    unitName: "Anchor Merkle Airdrop Claimer",
    apiPath: "/v1/verify/anchor/merkle-airdrop-claimer",
    pages: [{ slug: "create" }, { slug: "update" }, { slug: "claim" }],
    requirements: [
      { instructionKey: "create" },
      { instructionKey: "claim" },
    ],
    collectionMintAddress: "2NVDhSXZck9AX2aUdPSxMemLN2wtqEd5sNEcwuZVCbHW",
  },
];

const releasedChallengesSetting =
  process.env.NEXT_PUBLIC_RELEASED_CHALLENGES?.trim();

export const challenges = allChallenges.filter((challenge) => {
  // If the setting is undefined, null, or an empty string, release no challenges.
  if (!releasedChallengesSetting) {
    return false;
  }

  // If the setting is "*", release all challenges.
  if (releasedChallengesSetting === "*") {
    return true;
  }

  // Otherwise, treat the setting as a comma-separated list of challenge slugs.
  const releasedSlugs = releasedChallengesSetting
    .split(",")
    .map((slug) => slug.trim())
    .filter((slug) => slug.length > 0); // Ensure empty strings from trailing/multiple commas are ignored

  return releasedSlugs.includes(challenge.slug);
});
