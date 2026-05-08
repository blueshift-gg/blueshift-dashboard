export interface TestResult {
  success: boolean;
  instruction: string;
  compute_units_consumed: number;
  execution_time?: number;
  program_logs?: string[];
  account?: string;
  message?: string;
}

export interface Certificate {
  pubkey: string;
  signature: string;
  message: string;
}
