"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";
import { usePersistentStore } from "@/stores/store";
import { decodeJwt } from "jose";

export interface AuthState {
  loading: boolean;
  error: Error | null;
  status: "loading" | "signing-in" | "signed-in" | "signing-out" | "signed-out";
}

interface AuthResponse {
  token: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

function prepareSignInMessage(pubkey: string) {
  const timestampInMillisecs = Date.now();
  const timestamp = Math.floor(timestampInMillisecs / 1000) * 1000;
  const message = `Welcome to Blueshift. Please sign with your Solana wallet to prove you own this account: ${pubkey}\n\nTimestamp: ${timestamp}`;
  return { pubkey, timestamp, message };
}

/**
 * Checks if a JWT token is expired.
 * @param token The JWT token string.
 * @returns True if the token is expired or invalid, false otherwise.
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true; // No token, considered expired/invalid
  }

  try {
    const decodedJwt = decodeJwt(token);
    const expirationTime = decodedJwt.exp;

    if (typeof expirationTime === "undefined") {
      // No expiration claim, treat as invalid or handle as per your app's policy
      console.warn("JWT token does not have an expiration (exp) claim.");
      return true;
    }

    const nowInSeconds = Date.now() / 1000;
    return expirationTime <= nowInSeconds;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return true; // Error decoding, treat as expired/invalid
  }
}

export function useAuth() {
  const { publicKey, signMessage, disconnect, connected, connecting } =
    useWallet();
  const { setVisible: setModalVisible, visible: isModalVisible } =
    useWalletModal();
  const { authToken, setAuthToken, clearAuthToken } = usePersistentStore();

  const authExpiry = useMemo(() => {
    if (!authToken) return null;
    const decodedJwt = decodeJwt(authToken);
    return decodedJwt.exp;
  }, [authToken]);

  const [authState, setAuthState] = useState<AuthState>({
    loading: false,
    error: null,
    status: "signed-out",
  });

  /**
   * Checks if the current authentication token has an 'exp' claim and if that time is in the past.
   * @returns True if the token has an 'exp' claim and is expired.
   *          False if the token is not expired, or if the 'exp' claim is missing (treated as non-expiring by this check).
   */
  const checkTokenExpired = useCallback((): boolean => {
    if (!authToken) {
      return true; // No token, considered expired/invalid for practical purposes
    }
    try {
      const decodedJwt = decodeJwt(authToken);
      const expirationTime = decodedJwt.exp;
      if (typeof expirationTime === "undefined") {
        // No expiration claim, treat as non-expiring for the purpose of this specific check.
        console.warn(
          "JWT token does not have an expiration (exp) claim. Treating as non-expiring."
        );
        return false;
      }
      const nowInSeconds = Date.now() / 1000;
      const isExpired = expirationTime <= nowInSeconds;
      const isWalletMismatch =
        !!publicKey && decodedJwt.sub !== publicKey.toBase58();
      return isExpired || isWalletMismatch;
    } catch (error) {
      console.error("Error decoding JWT token during expiry check:", error);
      return true; // Error decoding, treat as expired/invalid
    }
  }, [authToken]);

  const _performSignInSequence = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setAuthState({
        loading: false,
        error: new Error(
          "Wallet not ready for signing: publicKey or signMessage missing."
        ),
        status: "signed-out",
      });
      return;
    }

    // Ensure status reflects the current operation, even if re-entrant or called from different paths
    setAuthState({ loading: true, error: null, status: "signing-in" });

    try {
      const { pubkey, timestamp, message } = prepareSignInMessage(
        publicKey.toBase58()
      );
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      const serializedSignature = bs58.encode(signature);

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
        const errorBody = await response
          .text()
          .catch(() => "Failed to read error response body.");
        throw new Error(
          `Authentication API request failed with status ${response.status}: ${errorBody || response.statusText}`
        );
      }
      const data: AuthResponse = await response.json();

      const decodedJwt = decodeJwt(data.token);

      setAuthToken(data.token);
      // Explicitly set signed-in state and clear loading on success
      setAuthState({
        loading: false,
        error: null,
        status: "signed-in",
      });
    } catch (err) {
      console.error("Error during sign-in sequence:", err);
      setAuthState({
        loading: false,
        status: "signed-out",
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, [publicKey, signMessage, API_BASE_URL, setAuthToken, setAuthState]);

  const login = useCallback(async () => {
    if (connected && publicKey && signMessage) {
      // Wallet is already connected and ready, perform sign-in sequence directly.
      await _performSignInSequence();
    } else if (!connecting) {
      // Not connected and not currently attempting to connect:
      // Set status to "signing-in" to indicate intent, then open the modal.
      // The useEffect hook will handle calling _performSignInSequence once connected.
      setAuthState({ loading: true, error: null, status: "signing-in" });
      setModalVisible(true);
    } else if (connecting) {
      // Currently attempting to connect (e.g., auto-connect or previous modal interaction):
      // Set status to "signing-in". The useEffect will handle it once connection completes.
      setAuthState({ loading: true, error: null, status: "signing-in" });
    } else {
      // Fallback for any other unusual states.
      setAuthState({
        loading: false,
        error: new Error(
          "Cannot initiate login: wallet state is not conducive to signing."
        ),
        status: "signed-out",
      });
    }
  }, [
    connected,
    connecting,
    publicKey,
    signMessage,
    setModalVisible,
    _performSignInSequence,
    setAuthState,
  ]);

  // Effect to handle automatic sign-in when the wallet is connected and ready.
  useEffect(() => {
    // This effect transitions to "signed-in" state when conditions are met.
    if (authToken && connected) {
      // Only transition to "signed-in" if not already signed-in and not in the process of signing out.
      if (
        authState.status !== "signed-in" &&
        authState.status !== "signing-out"
      ) {
        setAuthState({ loading: false, error: null, status: "signed-in" });
      }
    } else if (!authToken && authState.status === "signed-in") {
      // If token is lost (e.g. cleared, expired) while status is "signed-in", revert to "signed-out".
      setAuthState({ loading: false, error: null, status: "signed-out" });
    }
    // Note: If !connected and status is "signed-in", we generally let explicit logout handle it,
    // as transient disconnections shouldn't always force a sign-out.
    // The `logout` function explicitly handles disconnection.
  }, [authToken, connected, authState.status, setAuthState]);

  // useEffect to handle signing after modal connection or if connection was pending.
  useEffect(() => {
    // This effect triggers if status is "signing-in" AND the wallet is connected and ready.
    // If login() called _performSignInSequence directly, the status would have already transitioned
    // from "signing-in" by the time _performSignInSequence completes, preventing a redundant call here.
    if (
      authState.status === "signing-in" &&
      connected &&
      publicKey &&
      signMessage
    ) {
      _performSignInSequence();
    }
  }, [
    authState.status,
    connected,
    publicKey,
    signMessage,
    _performSignInSequence,
  ]);

  // Effect to handle cancellation of sign-in (e.g. modal closed before connection)
  useEffect(() => {
    if (
      authState.status === "signing-in" &&
      !isModalVisible &&
      !connected &&
      !connecting
    ) {
      setAuthState({
        loading: false,
        error: null, // User cancelled, not necessarily an error
        status: "signed-out",
      });
    }
  }, [authState.status, isModalVisible, connected, connecting, setAuthState]);

  const logout = useCallback(async () => {
    setAuthState({
      loading: true,
      error: null, // Clear previous errors
      status: "signing-out",
    });
    try {
      clearAuthToken();
      // Wallet disconnect should be attempted regardless of its current state,
      // and errors during disconnect are caught.
      if (connected) {
        await disconnect(); // Ensure disconnect is awaited
      }
      setAuthState({
        loading: false,
        error: null,
        status: "signed-out",
      });
    } catch (err) {
      console.error("Error during logout:", err);
      // Even if disconnect fails, app state is signed-out.
      setAuthState({
        loading: false,
        error: err instanceof Error ? err : new Error(String(err)),
        status: "signed-out",
      });
    }
  }, [clearAuthToken, disconnect, connected, setAuthState]);

  return {
    login,
    logout,
    publicKey,
    authToken,
    authExpiry,
    checkTokenExpired,
    connected,
    ...authState,
  };
}
