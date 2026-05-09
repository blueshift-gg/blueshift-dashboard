#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { glob } = require("glob");

// Mapping of course banner filenames to improved alt text
const altTextMapping = {
  "anchor-for-dummies.png":
    "Anchor framework course - Learn Solana smart contract development with Anchor",
  "introduction-to-anchor.png":
    "Anchor framework course - Learn Solana smart contract development with Anchor",
  "pinocchio-for-dummies.png":
    "Pinocchio course - Build native Solana programs with zero-copy framework",
  "introduction-to-pinocchio.png":
    "Pinocchio course - Build native Solana programs with zero-copy framework",
  "create-your-sdk-with-codama.png":
    "Codama SDK course - Generate TypeScript SDKs for Solana programs",
  "testing-with-mollusk.png": "Mollusk testing course - Unit testing framework for Solana programs",
  "testing-with-litesvm.png": "LiteSVM testing course - Lightweight Solana VM for program testing",
  "testing-with-surfpool.png":
    "Surfpool testing course - Advanced testing strategies for Solana programs",
  "instruction-introspection.png":
    "Instruction introspection course - Debug and analyze Solana program instructions",
  "introduction-to-blockchain-and-solana.png":
    "Blockchain fundamentals course - Learn blockchain concepts and Solana basics",
  "spl-token-with-anchor.png":
    "SPL Token with Anchor course - Create and manage tokens using Anchor framework",
  "spl-token-with-web3js.png":
    "SPL Token with Web3.js course - Build token programs with Solana Web3.js library",
  "introduction-to-assembly.png":
    "Assembly programming course - Low-level Solana program development",
  "nfts-on-solana.png": "NFTs on Solana course - Create and manage NFTs with Metaplex",
  "solana-pay.png": "Solana Pay course - Build payment solutions on Solana blockchain",
  "token-2022-program.png":
    "Token-2022 Program course - Learn advanced token extensions and features",
  "token-2022-with-anchor.png":
    "Token-2022 with Anchor course - Implement token extensions using Anchor",
  "token-2022-with-web3js.png":
    "Token-2022 with Web3.js course - Use token extensions with Web3.js",
  "tokens-on-solana.png":
    "Tokens on Solana course - Understand token standards and implementations",
  "program-security.png":
    "Program security course - Secure Solana smart contracts against vulnerabilities",
  "secp256r1-on-solana.png":
    "Secp256r1 course - Implement secp256r1 signature verification on Solana",
  "winternitz-signatures-on-solana.png":
    "Winternitz signatures course - Post-quantum cryptography on Solana",
};

// Extract banner filename from full path
function getBannerFilename(imagePath) {
  return path.basename(imagePath);
}

// Update a single MDX file
function updateMdxFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let updated = false;

  // Match banner image pattern: ![any text](/graphics/course-banners/filename.png)
  const bannerRegex = /!\[([^\]]*)\]\((\/graphics\/course-banners\/[^)]+)\)/g;

  content = content.replace(bannerRegex, (match, currentAltText, imagePath) => {
    const bannerFilename = getBannerFilename(imagePath);
    const newAltText = altTextMapping[bannerFilename];

    // Only update if we have improved alt text and it's different
    if (newAltText && currentAltText !== newAltText) {
      updated = true;

      // For English files, use the full improved alt text
      if (filePath.includes("/en.mdx") || filePath.includes("/en/")) {
        return `![${newAltText}](${imagePath})`;
      }

      // For non-English files, keep the translated course name but add "course"
      // This is a simpler approach - you can enhance this later with full translations
      return `![${currentAltText}](${imagePath})`;
    }

    return match;
  });

  if (updated) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✓ Updated: ${filePath}`);
    return true;
  }

  return false;
}

// Main execution
async function main() {
  const contentDir = path.join(__dirname, "../src/app/content");

  // Find all MDX files that contain course banners
  const mdxFiles = await glob("**/*.mdx", { cwd: contentDir, absolute: true });

  let updatedCount = 0;
  let skippedCount = 0;

  for (const filePath of mdxFiles) {
    const content = fs.readFileSync(filePath, "utf8");

    // Only process files that have course banner images
    if (content.includes("/graphics/course-banners/")) {
      if (updateMdxFile(filePath)) {
        updatedCount++;
      } else {
        skippedCount++;
      }
    }
  }

  console.log("\n========================================");
  console.log(`Total files updated: ${updatedCount}`);
  console.log(`Total files skipped (no changes): ${skippedCount}`);
  console.log("========================================\n");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
