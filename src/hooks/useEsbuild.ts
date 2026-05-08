"use client";

import * as esbuild from "esbuild-wasm";
import { useSyncExternalStore } from "react";

type EsbuildInitializationState =
  | "uninitialized"
  | "initializing"
  | "initialized"
  | "failed";

let listeners: (() => void)[] = [];

let state: {
  esbuild: typeof esbuild;
  initState: EsbuildInitializationState;
  initError: Error | null;
} = {
  esbuild: esbuild,
  initState: "uninitialized",
  initError: null,
};

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

function updateInitState(newState: EsbuildInitializationState) {
  state = {
    ...state,
    initState: newState,
  };
  notifyListeners();
}

if (typeof window !== "undefined") {
  esbuild
    .initialize({
      wasmURL: "/esbuild.wasm",
      worker: true,
    })
    .then(() => {
      updateInitState("initialized");
    })
    .catch((error) => {
      console.error("Error initializing esbuild:", error);
      updateInitState("failed");

      state = {
        ...state,
        initError: error,
      };
    });
}

function esbuildSubscribe(listener: () => void): () => void {
  listeners = [...listeners, listener];

  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function useEsbuild() {
  return useSyncExternalStore(
    esbuildSubscribe,
    () => state,
    () => state,
  );
}
