"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import type { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { toast } from "react-hot-toast";
import { type AuthResponse, performSignIn } from "@/lib/auth/api";
import {
  AuthError,
  AuthenticationAPIError,
  NetworkError,
  UserRejectedSignatureError,
  WalletDisconnectError,
} from "@/lib/auth/errors";
import {
  getPublicKeyFromToken,
  isTokenExpired as isTokenExpiredUtil,
} from "@/lib/auth/utils";
import { usePersistentStore } from "@/stores/store";

export type AuthStatus =
  | "signed-out"
  | "signing-in"
  | "signed-in"
  | "signing-out";

interface AuthContextType {
  login: () => void;
  logout: () => void;
  publicKey: PublicKey | null;
  authToken: string | null;
  isTokenExpired: () => boolean;
  status: AuthStatus;
  error: AuthError | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

// --- Reducer-based State Management ---

interface AuthState {
  status: AuthStatus;
  error: AuthError | null;
}

type AuthAction =
  | { type: "SIGN_IN_STARTED" }
  | { type: "SIGN_IN_SUCCESS" }
  | { type: "SIGN_OUT_STARTED" }
  | { type: "SIGN_OUT_SUCCESS" }
  | { type: "SESSION_RESTORED" }
  | { type: "SET_ERROR"; payload: AuthError }
  | { type: "CLEAR_ERROR" };

const initialState: AuthState = {
  status: "signed-out",
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SIGN_IN_STARTED":
      return { ...state, status: "signing-in", error: null };
    case "SIGN_IN_SUCCESS":
    case "SESSION_RESTORED":
      return { ...initialState, status: "signed-in" };
    case "SIGN_OUT_STARTED":
      return { ...state, status: "signing-out", error: null };
    case "SIGN_OUT_SUCCESS":
      return initialState;
    case "SET_ERROR":
      return { ...state, status: "signed-out", error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

// --- AuthProvider Component ---

export function AuthProvider({ children }: { children: ReactNode }) {
  const { publicKey, signMessage, disconnect, connected } = useWallet();
  const { setVisible: setModalVisible } = useWalletModal();
  const { authToken, setAuthToken, clearAuthToken } = usePersistentStore();
  const t = useTranslations();

  const [state, dispatch] = useReducer(authReducer, initialState);
  const { status, error } = state;

  // --- Derived State and Memoized Calculations ---

  const isTokenExpired = useCallback(
    () => isTokenExpiredUtil(authToken),
    [authToken],
  );

  const tokenPublicKey = useMemo(
    () => getPublicKeyFromToken(authToken),
    [authToken],
  );

  const currentPublicKey = useMemo(
    () => publicKey?.toBase58() || null,
    [publicKey],
  );

  const sessionState = useMemo(() => {
    if (!currentPublicKey || !tokenPublicKey) {
      return null;
    }
    if (currentPublicKey !== tokenPublicKey) {
      return "WALLET_MISMATCH";
    }
    return "MATCH";
  }, [currentPublicKey, tokenPublicKey]);

  const isWalletMismatched = sessionState === "WALLET_MISMATCH";
  const isAuthenticated = useMemo(
    () => sessionState === "MATCH" && !isTokenExpired(),
    [sessionState, isTokenExpired],
  );

  // --- Mutations ---

  const handleSignInError = useCallback(
    (error: unknown) => {
      const authError =
        error instanceof AuthError
          ? error
          : new AuthError("An unknown error occurred during sign-in.");

      dispatch({ type: "SET_ERROR", payload: authError });

      if (authError instanceof UserRejectedSignatureError) {
        toast.error(t("notifications.errors.user_rejected_signature"));
      } else if (authError instanceof NetworkError) {
        toast.error(t("notifications.errors.network_error"));
      } else if (authError instanceof AuthenticationAPIError) {
        toast.error(t("notifications.errors.auth_unauthorized"));
      } else {
        toast.error(t("notifications.errors.auth_generic"));
      }

      if (connected) {
        disconnect().catch(() => {
          toast.error(t("notifications.errors.auth_generic"));
        });
      }
    },
    [t, connected, disconnect],
  );

  const signInMutation = useMutation<AuthResponse, Error>({
    mutationFn: () => {
      if (!publicKey || !currentPublicKey || !signMessage) {
        throw new WalletDisconnectError();
      }
      return performSignIn(
        currentPublicKey,
        signMessage as (message: Uint8Array) => Promise<Uint8Array>,
      );
    },
    onMutate: () => dispatch({ type: "SIGN_IN_STARTED" }),
    onSuccess: (data) => {
      setAuthToken(data.token);
      dispatch({ type: "SIGN_IN_SUCCESS" });
    },
    onError: handleSignInError,
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      clearAuthToken();
      if (connected) {
        await disconnect().catch(() => {
          throw new WalletDisconnectError();
        });
      }
    },
    onMutate: () => dispatch({ type: "SIGN_OUT_STARTED" }),
    onSuccess: () => dispatch({ type: "SIGN_OUT_SUCCESS" }),
    onError: (error: unknown) => {
      const authError =
        error instanceof AuthError
          ? error
          : new AuthError("An unknown error occurred during sign-out.");
      dispatch({ type: "SET_ERROR", payload: authError });
      toast.error(t("notifications.errors.auth_generic"));
    },
  });

  const { mutate: doSignIn } = signInMutation;
  const { mutate: doSignOut } = signOutMutation;

  // --- User-Facing Callbacks ---

  const login = useCallback(() => {
    if (status === "signed-out") {
      dispatch({ type: "CLEAR_ERROR" });
      setModalVisible(true);
    }
  }, [status, setModalVisible]);

  const logout = useCallback(() => {
    if (status === "signing-out") return;
    doSignOut();
  }, [status, doSignOut]);

  // --- State Synchronization Effect ---

  useEffect(() => {
    if (status === "signing-in" || status === "signing-out") {
      return;
    }

    if (isWalletMismatched) {
      clearAuthToken();
      doSignIn();
      return;
    }

    switch (status) {
      case "signed-out":
        if (isAuthenticated) {
          dispatch({ type: "SESSION_RESTORED" });
        } else if (connected && !error) {
          doSignIn();
        }
        break;
      case "signed-in":
        if (!isAuthenticated) {
          dispatch({ type: "SIGN_OUT_SUCCESS" });
        }
        break;
    }
  }, [
    status,
    connected,
    isAuthenticated,
    isWalletMismatched,
    error,
    doSignIn,
    clearAuthToken,
  ]);

  // --- Context Value ---

  const value = {
    login,
    logout,
    publicKey,
    authToken,
    isTokenExpired,
    status,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
