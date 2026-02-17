import { AnchorProvider, Program } from "@anchor-lang/core";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import type { BlueshiftCredentials } from "@/lib/nft/blueshift_credentials_idl";
import idl from "@/lib/nft/blueshift_credentials_idl.json";
import { useMemo, useState } from "react";

export default function useMinter() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [error, setError] = useState<Error | null>(null);

  const program = useMemo(() => {
    setError(null);
    if (!wallet) {
      return null;
    }
    try {
      const provider = new AnchorProvider(connection, wallet, {
        commitment: "processed",
        skipPreflight: true,
      });
      return new Program(idl as BlueshiftCredentials, provider);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error("Error initializing Minter program:", err);
      setError(err);
      return null;
    }
  }, [connection, wallet]);

  return { program, error };
}
