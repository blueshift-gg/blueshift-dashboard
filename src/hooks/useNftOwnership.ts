import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { ChallengeMetadata } from "@/app/utils/challenges";
import { findCertificationPda, findUnitPda } from "@/lib/nft/sdk";
import { useQuery } from "@tanstack/react-query";
import { Connection, PublicKey } from "@solana/web3.js";

const EMPTY_OWNERSHIP: Record<string, boolean> = {};

const fetchNftOwnership = async (
  publicKey: PublicKey,
  challenges: { slug: string; unitName: string }[],
  connection: Connection,
) => {
  const pdaList = challenges.map((challenge) => {
    const unitPda = findUnitPda(challenge.unitName);
    return findCertificationPda(unitPda, publicKey);
  });

  const accounts = await connection.getMultipleAccountsInfo(pdaList);

  const newOwnership: Record<string, boolean> = {};
  accounts.forEach((account, index) => {
    const challenge = challenges[index];
    newOwnership[challenge.slug] = account !== null;
  });

  return newOwnership;
};

export const useNftOwnership = (challenges: ChallengeMetadata[]) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const challengeDeps = useMemo(
    () => challenges.map(({ slug, unitName }) => ({ slug, unitName })),
    [challenges],
  );

  const canonicalQueryKey = useMemo(() => {
    return challengeDeps
      .map((c) => `${c.slug}:${c.unitName}`)
      .join(",");
  }, [challengeDeps]);

  const {
    data: ownership,
    error,
    isLoading: loading,
  } = useQuery({
    queryKey: ["nftOwnership", publicKey?.toBase58(), canonicalQueryKey],
    queryFn: async () => {
      if (!publicKey) {
        return EMPTY_OWNERSHIP;
      }
      
      return fetchNftOwnership(publicKey, challengeDeps, connection);
    },
    enabled: !!publicKey,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { loading, ownership: ownership ?? EMPTY_OWNERSHIP, error };
};
