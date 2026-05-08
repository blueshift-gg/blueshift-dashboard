import bs58 from "bs58";
import {
  AuthError,
  AuthenticationAPIError,
  NetworkError,
  UnknownAuthError,
  UserRejectedSignatureError,
} from "@/lib/auth/errors";
import { WalletSignMessageError } from "@solana/wallet-adapter-base";

type SignMessage = (message: Uint8Array) => Promise<Uint8Array>;

export interface AuthResponse {
  token: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

function prepareSignInMessage(pubkey: string) {
  const timestampInMillisecs = Date.now();
  const timestamp = Math.floor(timestampInMillisecs / 1000) * 1000;
  const message = `Welcome to Blueshift. Please sign with your Solana wallet to prove you own this account: ${pubkey}\n\nTimestamp: ${timestamp}`;
  return { pubkey, timestamp, message };
}

export async function performSignIn(
  publicKey: string,
  signMessage: SignMessage,
): Promise<AuthResponse> {
  const { pubkey, timestamp, message } = prepareSignInMessage(publicKey);
  const encodedMessage = new TextEncoder().encode(message);

  let signature: Uint8Array;
  try {
    signature = await signMessage(encodedMessage);
  } catch (err) {
    if (err instanceof WalletSignMessageError) {
      throw new UserRejectedSignatureError();
    }

    throw err;
  }

  const serializedSignature = bs58.encode(signature);

  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pubkey: pubkey,
        timestamp,
        signature: serializedSignature,
      }),
    });

    if (!response.ok) {
      throw new AuthenticationAPIError(
        `API request failed with status ${response.status}`,
      );
    }
    return response.json();
  } catch (err) {
    if (err instanceof AuthError) {
      throw err;
    }

    // Check for network errors (e.g., failed to fetch)
    if (err instanceof TypeError) {
      throw new NetworkError();
    }
    // Fallback for any other unexpected error
    throw new UnknownAuthError();
  }
}
