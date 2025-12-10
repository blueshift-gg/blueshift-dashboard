"use client";

import { createContext, ReactNode } from "react";

export type PathNavigationStep = {
  type: "course" | "challenge";
  slug: string;
  defaultLessonSlug?: string;
};

export type PathContentContextValue = {
  pathSlug?: string;
  steps?: PathNavigationStep[];
};

export const PathContentContext = createContext<PathContentContextValue>({});

interface PathContentProviderProps extends PathContentContextValue {
  children: ReactNode;
}

export function PathContentProvider({ pathSlug, steps, children }: PathContentProviderProps) {
  return (
    <PathContentContext.Provider value={{ pathSlug, steps }}>
      {children}
    </PathContentContext.Provider>
  );
}
