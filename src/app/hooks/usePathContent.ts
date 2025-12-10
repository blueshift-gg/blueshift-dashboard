'use client';

import { useContext } from "react";
import { PathContentContext } from "@/app/contexts/PathContentContext";

export function usePathContent() {
  return useContext(PathContentContext);
}
