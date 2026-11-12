#!/usr/bin/env node
// Checks public build variables before a build.

const required = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_CHALLENGE_SECRET",
  "NEXT_PUBLIC_CHALLENGE_RPC_ENDPOINT",
  "NEXT_PUBLIC_MAINNET_RPC_ENDPOINT",
];
const recommended = ["NEXT_PUBLIC_DEVNET_RPC_ENDPOINT"];

function isSet(key) {
  const value = process.env[key];
  return Boolean(value) && value === value.trim();
}

const missingRequired = required.filter((key) => !isSet(key));
const missingRecommended = recommended.filter((key) => !isSet(key));

if (missingRecommended.length > 0) {
  console.warn(
    `Warning: recommended build variables are not set: ${missingRecommended.join(", ")}`,
  );
}

if (missingRequired.length > 0) {
  console.error(`Missing required build variables: ${missingRequired.join(", ")}`);
  console.error(
    "Set these build variables, or export them as environment variables locally.",
  );
  process.exit(1);
}

console.log("Build environment OK.");
