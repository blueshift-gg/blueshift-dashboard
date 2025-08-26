import { CourseMetadata, withCourseNumber } from "@/app/utils/course";

const allCourses: CourseMetadata[] = withCourseNumber([
  {
    slug: "introduction-to-blockchain-and-solana",
    language: "General",
    color: "0,255,255",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "introduction" },
      { slug: "blockchain-fundamentals" },
      { slug: "blockchain-evolution" },
      { slug: "introduction-to-solana" },
      { slug: "conclusion" },
    ],
  },
  {
    slug: "anchor-for-dummies",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "anchor-101" },
      { slug: "anchor-accounts" },
      { slug: "anchor-instructions" },
      { slug: "testing-your-program" },
      { slug: "program-deployment" },
      { slug: "client-side-development" },
      { slug: "advanced-anchor" },
      { slug: "conclusion" },
    ],
  },
  {
    slug: "introduction-to-pinocchio",
    language: "Rust",
    color: "255,173,102",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "pinocchio-101" },
      { slug: "pinocchio-accounts" },
      { slug: "pinocchio-instructions" },
      { slug: "pinocchio-errors" },
      { slug: "reading-and-writing-data" },
      { slug: "performance" },
      { slug: "conclusion" },
    ],
  },
  {
    slug: "introduction-to-assembly",
    language: "Assembly",
    color: "140,255,102",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "assembly-101" },
      { slug: "registers-and-memory" },
      { slug: "instructions" },
      { slug: "tooling" },
      { slug: "program-example" },
      { slug: "conclusion" },
    ],
  },
  {
    slug: "program-security",
    language: "General",
    color: "0,255,255",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "introduction" },
      { slug: "signer-checks" },
      { slug: "owner-checks" },
      { slug: "data-matching" },
      { slug: "duplicate-mutable-accounts" },
      { slug: "reinitialization-attacks" },
      { slug: "revival-attacks" },
      { slug: "arbitrary-cpi" },
      { slug: "type-cosplay" },
      { slug: "pda-sharing" },
      { slug: "conclusion" },
    ],
  },
  {
    slug: "secp256r1-on-solana",
    language: "Rust",
    color: "255,173,102",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "introduction" },
      { slug: "secp256r1-with-anchor" },
      { slug: "secp256r1-with-pinocchio" },
      { slug: "conclusion" },
    ],
  },
  {
    slug: "tokens-on-solana",
    language: "General",
    color: "0,255,255",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "introduction" },
      { slug: "mint-and-token-accounts" },
      { slug: "functionalities" },
      { slug: "metaplex-token-metadata" },
      { slug: "conclusion" },
    ],
  },
  {
    slug: "nfts-on-solana",
    language: "General",
    color: "0,255,255",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "introduction" },
      { slug: "metaplex-token-metadata" },
      { slug: "metaplex-core" },
      { slug: "conclusion" },
    ],
  },
  {
    slug: "spl-token-with-web3js",
    language: "Typescript",
    color: "105,162,241",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "introduction" },
      { slug: "mint-to" },
      { slug: "transfer" },
      { slug: "burn" },
      { slug: "close-account" },
      { slug: "approve-and-revoke" },
      { slug: "freeze-and-thaw" },
      { slug: "set-authority" },
      { slug: "conclusion" },
    ],
  },
  {
    slug: "spl-token-with-anchor",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "introduction" },
      { slug: "mint-to" },
      { slug: "transfer" },
      { slug: "burn" },
      { slug: "close-account" },
      { slug: "approve-and-revoke" },
      { slug: "freeze-and-thaw" },
      { slug: "set-authority" },
      { slug: "conclusion" },
    ],
  },
  {
    slug: "token-2022-program",
    language: "Rust",
    color: "255,173,102",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "introduction" },
      { slug: "token-extensions" },
      { slug: "conclusion" },
    ],
  },
  {
    slug: "token-2022-with-web3js",
    language: "Typescript",
    color: "105,162,241",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "introduction" },
      { slug: "transfer-fee-extension" },
      { slug: "mint-close-authority-extension" },
      { slug: "default-account-state-extension" },
      { slug: "immutable-owner-extension" },
      { slug: "memo-transfer-extension" },
      { slug: "non-transferable-extension" },
      { slug: "interest-bearing-extension" },
      { slug: "cpi-guard-extension" },
      { slug: "permanent-delegate-extension" },
      { slug: "metadata-extension" },
      { slug: "group-and-member-extension" },
      { slug: "conclusion" },
    ],
  },
  {
    slug: "token-2022-with-anchor",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "introduction" },
      { slug: "transfer-fee-extension" },
      { slug: "mint-close-authority-extension" },
      { slug: "default-account-state-extension" },
      { slug: "immutable-owner-extension" },
      { slug: "memo-transfer-extension" },
      { slug: "non-transferable-extension" },
      { slug: "interest-bearing-extension" },
      { slug: "cpi-guard-extension" },
      { slug: "permanent-delegate-extension" },
      { slug: "metadata-extension" },
      { slug: "group-and-member-extension" },
      { slug: "conclusion" },
    ],
  },
  {
    slug: "instruction-introspection",
    language: "General",
    color: "0,255,255",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "introduction" },
      { slug: "introspection-with-anchor" },
      { slug: "introspection-with-pinocchio" },
      { slug: "conclusion" },
    ],
  },
  {
    slug: "testing-with-mollusk",
    language: "Rust",
    color: "255,173,102",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "mollusk-101" },
      { slug: "advanced-functionalities" },
      { slug: "conclusion" },
    ],
  },
  {
    slug: "solana-pay",
    language: "General",
    color: "0,255,255",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "introduction" },
      { slug: "transfer-request" },
      { slug: "transaction-request" },
      { slug: "conclusion" },
     ],
  },
  {
    slug: "create-your-sdk-with-codama",
    language: "General",
    color: "0,255,255",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "introduction" },
      { slug: "codama-from-scratch" },
      { slug: "codama-with-anchor" },
      { slug: "updating-codama-idl" },
      { slug: "conclusion" },
    ],
  },
  {
    slug: "merkle-trees-on-solana",
    language: "General",
    color: "0,255,255",
    difficulty: 1,
    isFeatured: true,
    lessons: [
      { slug: "introduction" },
      { slug: "merkle-trees-with-anchor" },
      { slug: "merkle-trees-with-pinocchio" },
      { slug: "conclusion" },
    ],
  },
]);

const releasedCoursesSetting = process.env.NEXT_PUBLIC_RELEASED_COURSES?.trim();

export const courses = allCourses.filter((course) => {
  // If the setting is undefined, null, or an empty string, release no courses.
  if (!releasedCoursesSetting) {
    return false;
  }

  // If the setting is "*", release all courses.
  if (releasedCoursesSetting === "*") {
    return true;
  }

  // Otherwise, treat the setting as a comma-separated list of course slugs.
  const releasedSlugs = releasedCoursesSetting
    .split(",")
    .map((slug) => slug.trim())
    .filter((slug) => slug.length > 0); // Ensure empty strings from trailing/multiple commas are ignored

  return releasedSlugs.includes(course.slug);
});
