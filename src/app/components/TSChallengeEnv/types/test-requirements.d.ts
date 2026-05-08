export interface TestRequirement {
  status: "passed" | "failed" | "incomplete";
  instructionKey: string;
  title: string;
}
