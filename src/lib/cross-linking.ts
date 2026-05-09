// Cross-linking configuration between courses and research articles
// Single source of truth for all cross-site linking

export type CourseId =
  | "introduction-to-blockchain-and-solana"
  | "anchor-for-dummies"
  | "pinocchio-for-dummies"
  | "introduction-to-assembly"
  | "program-security"
  | "secp256r1-on-solana"
  | "tokens-on-solana"
  | "nfts-on-solana"
  | "spl-token-with-web3js"
  | "spl-token-with-anchor"
  | "token-2022-program"
  | "token-2022-with-web3js"
  | "token-2022-with-anchor"
  | "instruction-introspection"
  | "testing-with-mollusk"
  | "solana-pay"
  | "create-your-sdk-with-codama"
  | "winternitz-signatures-on-solana"
  | "testing-with-litesvm"
  | "testing-with-surfpool"
  | "introduction-to-low-level-solana"
  | "quantum-vault"
  | "research-crateless-program";

export type ResearchId =
  | "accelerating-svm-with-jit-intrinsics"
  | "accelerating-u128-math-with-libcalls-and-jit-intrinsics"
  | "sbpf-linker-breakpoint-2025";

export interface CourseMetadata {
  id: CourseId;
  title: string;
  description: string;
  url: string;
}

export interface ResearchMetadata {
  id: ResearchId;
  title: string;
  description: string;
  url: string;
}

// Course to research article mapping
export const COURSE_TO_RESEARCH: Record<CourseId, ResearchId[]> = {
  "introduction-to-assembly": [
    "accelerating-svm-with-jit-intrinsics",
    "accelerating-u128-math-with-libcalls-and-jit-intrinsics",
    "sbpf-linker-breakpoint-2025",
  ],
  "pinocchio-for-dummies": ["accelerating-u128-math-with-libcalls-and-jit-intrinsics"],
  // Other courses don't have research articles yet
  "introduction-to-blockchain-and-solana": [],
  "anchor-for-dummies": [],
  "program-security": [],
  "secp256r1-on-solana": [],
  "tokens-on-solana": [],
  "nfts-on-solana": [],
  "spl-token-with-web3js": [],
  "spl-token-with-anchor": [],
  "token-2022-program": [],
  "token-2022-with-web3js": [],
  "token-2022-with-anchor": [],
  "instruction-introspection": [],
  "testing-with-mollusk": [],
  "solana-pay": [],
  "create-your-sdk-with-codama": [],
  "winternitz-signatures-on-solana": [],
  "testing-with-litesvm": [],
  "testing-with-surfpool": [],
  "introduction-to-low-level-solana": [],
  "quantum-vault": [],
  "research-crateless-program": [],
} as const;

// Research article metadata
const RESEARCH: Record<ResearchId, ResearchMetadata> = {
  "accelerating-svm-with-jit-intrinsics": {
    id: "accelerating-svm-with-jit-intrinsics",
    title: "Accelerating the SVM with JIT Intrinsics",
    description:
      "See how the SVM JIT compiler optimizes BPF bytecode with hardware-accelerated intrinsics",
    url: "https://blueshift.gg/research/accelerating-svm-with-jit-intrinsics",
  },
  "accelerating-u128-math-with-libcalls-and-jit-intrinsics": {
    id: "accelerating-u128-math-with-libcalls-and-jit-intrinsics",
    title: "Accelerating u128 Math with Libcalls and JIT Intrinsics",
    description:
      "Deep dive into wide multiplication optimization using custom libcalls and JIT intrinsics",
    url: "https://blueshift.gg/research/accelerating-u128-math-with-libcalls-and-jit-intrinsics",
  },
  "sbpf-linker-breakpoint-2025": {
    id: "sbpf-linker-breakpoint-2025",
    title: "sBPF Linker Deep Dive",
    description: "How the sBPF linker works - ELF format, program headers, and linking concepts",
    url: "https://blueshift.gg/research/sbpf-linker-breakpoint-2025",
  },
};

/**
 * Get research articles for a course
 * @param courseId - The course ID
 * @returns Array of research metadata
 */
export function getResearchForCourse(courseId: CourseId): ResearchMetadata[] {
  const researchIds = COURSE_TO_RESEARCH[courseId] ?? [];
  return researchIds.map((id) => RESEARCH[id]).filter(Boolean);
}

/**
 * Check if a course has research articles
 * @param courseId - The course ID
 * @returns True if research articles are configured
 */
export function hasResearchForCourse(courseId: CourseId): boolean {
  return (COURSE_TO_RESEARCH[courseId]?.length ?? 0) > 0;
}
