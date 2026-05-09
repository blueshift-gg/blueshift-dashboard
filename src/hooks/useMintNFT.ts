import { useCallback, useState } from "react";
import type { ChallengeMetadata } from "@/app/utils/challenges";
import useMinter from "@/hooks/useMinter";
import { findUnitPda } from "@/lib/nft/sdk";
import { usePersistentStore } from "@/stores/store";

export default function useMintNFT() {
  const { program: minter, error: minterError } = useMinter();
  const { certificates, setChallengeStatus } = usePersistentStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mint = useCallback(
    async (challenge: ChallengeMetadata) => {
      setIsLoading(true);
      setError(null);

      try {
        if (minterError) {
          throw new Error(`Minter setup failed: ${minterError.message}`);
        }

        if (!minter) {
          throw new Error(
            "Minter is not available (possibly due to wallet not being connected or a setup issue).",
          );
        }

        const unit = findUnitPda(challenge.unitName);
        const user = minter.provider.wallet?.publicKey;
        const certificate = certificates[challenge.slug];

        if (!certificate) {
          throw new Error(`Certificate not found for challenge: ${challenge.slug}`);
        }

        if (!user) {
          throw new Error("User public key is not available. Please connect your wallet.");
        }

        const signature = Buffer.from(certificate.signature, "hex");

        const tx = await minter.methods.mintCredential(signature).accounts({ unit }).rpc({
          commitment: "processed",
          skipPreflight: true,
        });

        setIsLoading(false);
        setChallengeStatus(challenge.slug, "claimed");

        return tx;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        console.error("Error minting NFT:", err.message, err);
        setError(err);
        setIsLoading(false);
        throw err;
      }
    },
    [minterError, minter, certificates, setChallengeStatus],
  );

  return { mint, isLoading, error };
}
