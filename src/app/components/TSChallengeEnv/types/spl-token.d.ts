// This vendored declaration file mirrors upstream SPL Token extension marker types.
import type { Layout } from "@solana/buffer-layout";
import { Structure } from "@solana/buffer-layout";
import {
  createInitializeGroupInstruction,
  createInitializeMemberInstruction,
  createUpdateGroupAuthorityInstruction,
  createUpdateGroupMaxSizeInstruction,
  TOKEN_GROUP_MEMBER_SIZE,
  TOKEN_GROUP_SIZE,
  TokenGroup,
  TokenGroupMember,
} from "@solana/spl-token-group";
import type { TokenMetadata } from "@solana/spl-token-metadata";
import {
  createEmitInstruction,
  createInitializeInstruction,
  createRemoveKeyInstruction,
  createUpdateAuthorityInstruction,
  createUpdateFieldInstruction,
  Field,
} from "@solana/spl-token-metadata";
import type {
  AccountInfo,
  AccountMeta,
  Commitment,
  ConfirmOptions,
  Connection,
  Signer,
  TransactionError,
  TransactionSignature,
} from "@solana/web3.js";
import { Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js";

/** Information about a token account */
export declare interface Account {
  /** Address of the account */
  address: PublicKey;
  /** Mint associated with the account */
  mint: PublicKey;
  /** Owner of the account */
  owner: PublicKey;
  /** Number of tokens the account holds */
  amount: bigint;
  /** Authority that can transfer tokens from the account */
  delegate: PublicKey | null;
  /** Number of tokens the delegate is authorized to transfer */
  delegatedAmount: bigint;
  /** True if the account is initialized */
  isInitialized: boolean;
  /** True if the account is frozen */
  isFrozen: boolean;
  /** True if the account is a native token account */
  isNative: boolean;
  /**
   * If the account is a native token account, it must be rent-exempt. The rent-exempt reserve is the amount that must
   * remain in the balance until the account is closed.
   */
  rentExemptReserve: bigint | null;
  /** Optional authority to close the account */
  closeAuthority: PublicKey | null;
  tlvData: Buffer;
}

/** Byte length of a token account */
export declare const ACCOUNT_SIZE: number;

export declare const ACCOUNT_TYPE_SIZE = 1;

/** Buffer layout for de/serializing a token account */
export declare const AccountLayout: Structure<RawAccount>;

/** Token account state as stored by the program */
export declare enum AccountState {
  Uninitialized = 0,
  Initialized = 1,
  Frozen = 2,
}

export declare enum AccountType {
  Uninitialized = 0,
  Mint = 1,
  Account = 2,
}

/**
 * Adds all the extra accounts needed for a transfer hook to an instruction.
 *
 * Note this will modify the instruction passed in.
 *
 * @param connection            Connection to use
 * @param instruction           The instruction to add accounts to
 * @param programId             Transfer hook program ID
 * @param source                The source account
 * @param mint                  The mint account
 * @param destination           The destination account
 * @param owner                 Owner of the source account
 * @param amount                The amount of tokens to transfer
 * @param commitment            Commitment to use
 */
export declare function addExtraAccountMetasForExecute(
  connection: Connection,
  instruction: TransactionInstruction,
  programId: PublicKey,
  source: PublicKey,
  mint: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  amount: number | bigint,
  commitment?: Commitment,
): Promise<TransactionInstruction | undefined>;

/**
 * Amount as a string using mint-prescribed decimals
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param mint           Mint for the account
 * @param amount         Amount of tokens to be converted to Ui Amount
 * @param programId      SPL Token program account
 *
 * @return Ui Amount generated
 */
export declare function amountToUiAmount(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  amount: number | bigint,
  programId?: PublicKey,
): Promise<string | TransactionError | null>;

/**
 * Convert amount to UiAmount for a mint without simulating a transaction
 * This implements the same logic as `process_amount_to_ui_amount` in /token/program-2022/src/processor.rs
 * and `process_amount_to_ui_amount` in /token/program/src/processor.rs
 *
 * @param connection     Connection to use
 * @param mint           Mint to use for calculations
 * @param amount         Amount of tokens to be converted to Ui Amount
 *
 * @return Ui Amount generated
 */
export declare function amountToUiAmountForMintWithoutSimulation(
  connection: Connection,
  mint: PublicKey,
  amount: bigint,
): Promise<string>;

/** TODO: docs */
export declare interface AmountToUiAmountInstructionData {
  instruction: TokenInstruction.AmountToUiAmount;
  amount: bigint;
}

/** TODO: docs */
export declare const amountToUiAmountInstructionData: Structure<AmountToUiAmountInstructionData>;

/**
 * Convert amount to UiAmount for a mint with interest bearing extension without simulating a transaction
 * This implements the same logic as the CPI instruction available in /token/program-2022/src/extension/interest_bearing_mint/mod.rs
 * In general to calculate compounding interest over a period of time, the formula is:
 * A = P * e^(r * t) where
 * A = final amount after interest
 * P = principal amount (initial investment)
 * r = annual interest rate (as a decimal, e.g., 5% = 0.05)
 * t = time in years
 * e = mathematical constant (~2.718)
 *
 * In this case, we are calculating the total scale factor for the interest bearing extension which is the product of two exponential functions:
 * totalScale = e^(r1 * t1) * e^(r2 * t2)
 * where r1 and r2 are the interest rates before and after the last update, and t1 and t2 are the times in years between
 * the initialization timestamp and the last update timestamp, and between the last update timestamp and the current timestamp.
 *
 * @param amount                   Amount of tokens to be converted
 * @param decimals                 Number of decimals of the mint
 * @param currentTimestamp         Current timestamp in seconds
 * @param lastUpdateTimestamp      Last time the interest rate was updated in seconds
 * @param initializationTimestamp  Time the interest bearing extension was initialized in seconds
 * @param preUpdateAverageRate     Interest rate in basis points (1 basis point = 0.01%) before last update
 * @param currentRate              Current interest rate in basis points
 *
 * @return Amount scaled by accrued interest as a string with appropriate decimal places
 */
export declare function amountToUiAmountWithoutSimulation(
  amount: bigint,
  decimals: number,
  currentTimestamp: number, // in seconds
  lastUpdateTimestamp: number,
  initializationTimestamp: number,
  preUpdateAverageRate: number,
  currentRate: number,
): string;

/**
 * Approve a delegate to transfer up to a maximum number of tokens from an account
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param account        Address of the token account
 * @param delegate       Account authorized to transfer tokens from the account
 * @param owner          Owner of the account
 * @param amount         Maximum number of tokens the delegate may transfer
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function approve(
  connection: Connection,
  payer: Signer,
  account: PublicKey,
  delegate: PublicKey,
  owner: Signer | PublicKey,
  amount: number | bigint,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/**
 * Approve a delegate to transfer up to a maximum number of tokens from an account, asserting the token mint and
 * decimals
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param mint           Address of the mint
 * @param account        Address of the account
 * @param delegate       Account authorized to perform a transfer tokens from the source account
 * @param owner          Owner of the source account
 * @param amount         Maximum number of tokens the delegate may transfer
 * @param decimals       Number of decimals in approve amount
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function approveChecked(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  account: PublicKey,
  delegate: PublicKey,
  owner: Signer | PublicKey,
  amount: number | bigint,
  decimals: number,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/** TODO: docs */
export declare interface ApproveCheckedInstructionData {
  instruction: TokenInstruction.ApproveChecked;
  amount: bigint;
  decimals: number;
}

/** TODO: docs */
export declare const approveCheckedInstructionData: Structure<ApproveCheckedInstructionData>;

/** TODO: docs */
export declare interface ApproveInstructionData {
  instruction: TokenInstruction.Approve;
  amount: bigint;
}

/** TODO: docs */
export declare const approveInstructionData: Structure<ApproveInstructionData>;

/** Address of the SPL Associated Token Account program */
export declare const ASSOCIATED_TOKEN_PROGRAM_ID: PublicKey;

/** Authority types defined by the program */
export declare enum AuthorityType {
  MintTokens = 0,
  FreezeAccount = 1,
  AccountOwner = 2,
  CloseAccount = 3,
  TransferFeeConfig = 4,
  WithheldWithdraw = 5,
  CloseMint = 6,
  InterestRate = 7,
  PermanentDelegate = 8,
  ConfidentialTransferMint = 9,
  TransferHookProgramId = 10,
  ConfidentialTransferFeeConfig = 11,
  MetadataPointer = 12,
  GroupPointer = 13,
  GroupMemberPointer = 14,
  ScaledUiAmountConfig = 15,
  PausableConfig = 16,
}

/**
 * Burn tokens from an account
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param account        Account to burn tokens from
 * @param mint           Mint for the account
 * @param owner          Account owner
 * @param amount         Amount to burn
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function burn(
  connection: Connection,
  payer: Signer,
  account: PublicKey,
  mint: PublicKey,
  owner: Signer | PublicKey,
  amount: number | bigint,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/**
 * Burn tokens from an account, asserting the token mint and decimals
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param account        Account to burn tokens from
 * @param mint           Mint for the account
 * @param owner          Account owner
 * @param amount         Amount to burn
 * @param decimals       Number of decimals in amount to burn
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function burnChecked(
  connection: Connection,
  payer: Signer,
  account: PublicKey,
  mint: PublicKey,
  owner: Signer | PublicKey,
  amount: number | bigint,
  decimals: number,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/** TODO: docs */
export declare interface BurnCheckedInstructionData {
  instruction: TokenInstruction.BurnChecked;
  amount: bigint;
  decimals: number;
}

/** TODO: docs */
export declare const burnCheckedInstructionData: Structure<BurnCheckedInstructionData>;

/** TODO: docs */
export declare interface BurnInstructionData {
  instruction: TokenInstruction.Burn;
  amount: bigint;
}

/** TODO: docs */
export declare const burnInstructionData: Structure<BurnInstructionData>;

/** Calculate the fee for the given epoch and input amount */
export declare function calculateEpochFee(
  transferFeeConfig: TransferFeeConfig,
  epoch: bigint,
  preFeeAmount: bigint,
): bigint;

/** Calculate the transfer fee */
export declare function calculateFee(transferFee: TransferFee, preFeeAmount: bigint): bigint;

/**
 * Close a token account
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param account        Account to close
 * @param destination    Account to receive the remaining balance of the closed account
 * @param authority      Authority which is allowed to close the account
 * @param multiSigners   Signing accounts if `authority` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function closeAccount(
  connection: Connection,
  payer: Signer,
  account: PublicKey,
  destination: PublicKey,
  authority: Signer | PublicKey,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/** TODO: docs */
export declare interface CloseAccountInstructionData {
  instruction: TokenInstruction.CloseAccount;
}

/** TODO: docs */
export declare const closeAccountInstructionData: Structure<CloseAccountInstructionData>;

export declare const CPI_GUARD_SIZE: number;

/** CpiGuard as stored by the program */
export declare interface CpiGuard {
  /** Lock certain token operations from taking place within CPI for this account */
  lockCpi: boolean;
}

export declare enum CpiGuardInstruction {
  Enable = 0,
  Disable = 1,
}

/** TODO: docs */
export declare interface CpiGuardInstructionData {
  instruction: TokenInstruction.CpiGuardExtension;
  cpiGuardInstruction: CpiGuardInstruction;
}

/** TODO: docs */
export declare const cpiGuardInstructionData: Structure<CpiGuardInstructionData>;

/** Buffer layout for de/serializing a CPI Guard extension */
export declare const CpiGuardLayout: Structure<CpiGuard>;

/**
 * Create and initialize a new token account
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction and initialization fees
 * @param mint           Mint for the account
 * @param owner          Owner of the new account
 * @param keypair        Optional keypair, defaulting to the associated token account for the `mint` and `owner`
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Address of the new token account
 */
export declare function createAccount(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  owner: PublicKey,
  keypair?: Keypair,
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<PublicKey>;

/**
 * Construct a AmountToUiAmount instruction
 *
 * @param mint         Public key of the mint
 * @param amount       Amount of tokens to be converted to UiAmount
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createAmountToUiAmountInstruction(
  mint: PublicKey,
  amount: number | bigint,
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an ApproveChecked instruction
 *
 * @param account      Account to set the delegate for
 * @param mint         Mint account
 * @param delegate     Account authorized to transfer of tokens from the account
 * @param owner        Owner of the account
 * @param amount       Maximum number of tokens the delegate may transfer
 * @param decimals     Number of decimals in approve amount
 * @param multiSigners Signing accounts if `owner` is a multisig
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createApproveCheckedInstruction(
  account: PublicKey,
  mint: PublicKey,
  delegate: PublicKey,
  owner: PublicKey,
  amount: number | bigint,
  decimals: number,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an Approve instruction
 *
 * @param account      Account to set the delegate for
 * @param delegate     Account authorized to transfer tokens from the account
 * @param owner        Owner of the account
 * @param amount       Maximum number of tokens the delegate may transfer
 * @param multiSigners Signing accounts if `owner` is a multisig
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createApproveInstruction(
  account: PublicKey,
  delegate: PublicKey,
  owner: PublicKey,
  amount: number | bigint,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Create and initialize a new associated token account
 *
 * @param connection               Connection to use
 * @param payer                    Payer of the transaction and initialization fees
 * @param mint                     Mint for the account
 * @param owner                    Owner of the new account
 * @param confirmOptions           Options for confirming the transaction
 * @param programId                SPL Token program account
 * @param associatedTokenProgramId SPL Associated Token program account
 * @param allowOwnerOffCurve       Allow the owner account to be a PDA (Program Derived Address)
 *
 * @return Address of the new associated token account
 */
export declare function createAssociatedTokenAccount(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  owner: PublicKey,
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
  associatedTokenProgramId?: PublicKey,
  allowOwnerOffCurve?: boolean,
): Promise<PublicKey>;

/**
 * Create and initialize a new associated token account
 * The instruction will succeed even if the associated token account already exists
 *
 * @param connection               Connection to use
 * @param payer                    Payer of the transaction and initialization fees
 * @param mint                     Mint for the account
 * @param owner                    Owner of the new account
 * @param confirmOptions           Options for confirming the transaction
 * @param programId                SPL Token program account
 * @param associatedTokenProgramId SPL Associated Token program account
 * @param allowOwnerOffCurve       Allow the owner account to be a PDA (Program Derived Address)
 *
 * @return Address of the new or existing associated token account
 */
export declare function createAssociatedTokenAccountIdempotent(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  owner: PublicKey,
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
  associatedTokenProgramId?: PublicKey,
  allowOwnerOffCurve?: boolean,
): Promise<PublicKey>;

/**
 * Construct a CreateAssociatedTokenAccountIdempotent instruction
 *
 * @param payer                    Payer of the initialization fees
 * @param associatedToken          New associated token account
 * @param owner                    Owner of the new account
 * @param mint                     Token mint account
 * @param programId                SPL Token program account
 * @param associatedTokenProgramId SPL Associated Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createAssociatedTokenAccountIdempotentInstruction(
  payer: PublicKey,
  associatedToken: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  programId?: PublicKey,
  associatedTokenProgramId?: PublicKey,
): TransactionInstruction;

/**
 * Derive the associated token account and construct a CreateAssociatedTokenAccountIdempotent instruction
 *
 * @param payer                    Payer of the initialization fees
 * @param owner                    Owner of the new account
 * @param mint                     Token mint account
 * @param allowOwnerOffCurve       Allow the owner account to be a PDA (Program Derived Address)
 * @param programId                SPL Token program account
 * @param associatedTokenProgramId SPL Associated Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createAssociatedTokenAccountIdempotentInstructionWithDerivation(
  payer: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  allowOwnerOffCurve?: boolean,
  programId?: PublicKey,
  associatedTokenProgramId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a CreateAssociatedTokenAccount instruction
 *
 * @param payer                    Payer of the initialization fees
 * @param associatedToken          New associated token account
 * @param owner                    Owner of the new account
 * @param mint                     Token mint account
 * @param programId                SPL Token program account
 * @param associatedTokenProgramId SPL Associated Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createAssociatedTokenAccountInstruction(
  payer: PublicKey,
  associatedToken: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  programId?: PublicKey,
  associatedTokenProgramId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a BurnChecked instruction
 *
 * @param mint         Mint for the account
 * @param account      Account to burn tokens from
 * @param owner        Owner of the account
 * @param amount       Number of tokens to burn
 * @param decimals     Number of decimals in burn amount
 * @param multiSigners Signing accounts if `owner` is a multisig
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createBurnCheckedInstruction(
  account: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  amount: number | bigint,
  decimals: number,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a Burn instruction
 *
 * @param account      Account to burn tokens from
 * @param mint         Mint for the account
 * @param owner        Owner of the account
 * @param amount       Number of tokens to burn
 * @param multiSigners Signing accounts if `owner` is a multisig
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createBurnInstruction(
  account: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  amount: number | bigint,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a CloseAccount instruction
 *
 * @param account      Account to close
 * @param destination  Account to receive the remaining balance of the closed account
 * @param authority    Account close authority
 * @param multiSigners Signing accounts if `authority` is a multisig
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createCloseAccountInstruction(
  account: PublicKey,
  destination: PublicKey,
  authority: PublicKey,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a CreateNativeMint instruction
 *
 * @param account   New token account
 * @param mint      Mint account
 * @param owner     Owner of the new account
 * @param programId SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createCreateNativeMintInstruction(
  payer: PublicKey,
  nativeMintId?: PublicKey,
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a DisableCpiGuard instruction
 *
 * @param account         Token account to update
 * @param authority       The account's owner/delegate
 * @param signers         The signer account(s)
 * @param programId       SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createDisableCpiGuardInstruction(
  account: PublicKey,
  authority: PublicKey,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a DisableMemoTransfer instruction
 *
 * @param account         Token account to update
 * @param authority       The account's owner/delegate
 * @param signers         The signer account(s)
 * @param programId       SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createDisableRequiredMemoTransfersInstruction(
  account: PublicKey,
  authority: PublicKey,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

export { createEmitInstruction };

/**
 * Construct an EnableCpiGuard instruction
 *
 * @param account         Token account to update
 * @param authority       The account's owner/delegate
 * @param signers         The signer account(s)
 * @param programId       SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createEnableCpiGuardInstruction(
  account: PublicKey,
  authority: PublicKey,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an EnableRequiredMemoTransfers instruction
 *
 * @param account         Token account to update
 * @param authority       The account's owner/delegate
 * @param signers         The signer account(s)
 * @param programId       SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createEnableRequiredMemoTransfersInstruction(
  account: PublicKey,
  authority: PublicKey,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an `ExecuteInstruction` for a transfer hook program, without the
 * additional accounts
 *
 * @param programId             The program ID of the transfer hook program
 * @param source                The source account
 * @param mint                  The mint account
 * @param destination           The destination account
 * @param owner                 Owner of the source account
 * @param validateStatePubkey   The validate state pubkey
 * @param amount                The amount of tokens to transfer
 * @returns Instruction to add to a transaction
 */
export declare function createExecuteInstruction(
  programId: PublicKey,
  source: PublicKey,
  mint: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  validateStatePubkey: PublicKey,
  amount: bigint,
): TransactionInstruction;

/**
 * Construct a FreezeAccount instruction
 *
 * @param account      Account to freeze
 * @param mint         Mint account
 * @param authority    Mint freeze authority
 * @param multiSigners Signing accounts if `authority` is a multisig
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createFreezeAccountInstruction(
  account: PublicKey,
  mint: PublicKey,
  authority: PublicKey,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a HarvestWithheldTokensToMint instruction
 *
 * @param mint              The token mint
 * @param sources           The source accounts to withdraw from
 * @param programID         SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createHarvestWithheldTokensToMintInstruction(
  mint: PublicKey,
  sources: PublicKey[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an InitializeAccount2 instruction
 *
 * @param account   New token account
 * @param mint      Mint account
 * @param owner     New account's owner/multisignature
 * @param programId SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createInitializeAccount2Instruction(
  account: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an InitializeAccount3 instruction
 *
 * @param account   New token account
 * @param mint      Mint account
 * @param owner     New account's owner/multisignature
 * @param programId SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createInitializeAccount3Instruction(
  account: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an InitializeAccount instruction
 *
 * @param account   New token account
 * @param mint      Mint account
 * @param owner     Owner of the new account
 * @param programId SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createInitializeAccountInstruction(
  account: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an InitializeDefaultAccountState instruction
 *
 * @param mint         Mint to initialize
 * @param accountState Default account state to set on all new accounts
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createInitializeDefaultAccountStateInstruction(
  mint: PublicKey,
  accountState: AccountState,
  programId?: PublicKey,
): TransactionInstruction;

export { createInitializeGroupInstruction };

/**
 * Construct an Initialize GroupMemberPointer instruction
 *
 * @param mint            Token mint account
 * @param authority       Optional Authority that can set the member address
 * @param memberAddress   Optional Account address that holds the member
 * @param programId       SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createInitializeGroupMemberPointerInstruction(
  mint: PublicKey,
  authority: PublicKey | null,
  memberAddress: PublicKey | null,
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an Initialize GroupPointer instruction
 *
 * @param mint            Token mint account
 * @param authority       Optional Authority that can set the group address
 * @param groupAddress    Optional Account address that holds the group
 * @param programId       SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createInitializeGroupPointerInstruction(
  mint: PublicKey,
  authority: PublicKey | null,
  groupAddress: PublicKey | null,
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an InitializeImmutableOwner instruction
 *
 * @param account           Immutable Owner Account
 * @param programId         SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createInitializeImmutableOwnerInstruction(
  account: PublicKey,
  programId: PublicKey,
): TransactionInstruction;

export { createInitializeInstruction };

/**
 * Construct an InitializeInterestBearingMint instruction
 *
 * @param mint           Mint to initialize
 * @param rateAuthority  The public key for the account that can update the rate
 * @param rate           The initial interest rate
 * @param programId      SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createInitializeInterestBearingMintInstruction(
  mint: PublicKey,
  rateAuthority: PublicKey,
  rate: number,
  programId?: PublicKey,
): TransactionInstruction;

export { createInitializeMemberInstruction };

/**
 * Construct an Initialize MetadataPointer instruction
 *
 * @param mint            Token mint account
 * @param authority       Optional Authority that can set the metadata address
 * @param metadataAddress Optional Account address that holds the metadata
 * @param programId       SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createInitializeMetadataPointerInstruction(
  mint: PublicKey,
  authority: PublicKey | null,
  metadataAddress: PublicKey | null,
  programId: PublicKey,
): TransactionInstruction;

/**
 * Construct an InitializeMint2 instruction
 *
 * @param mint            Token mint account
 * @param decimals        Number of decimals in token account amounts
 * @param mintAuthority   Minting authority
 * @param freezeAuthority Optional authority that can freeze token accounts
 * @param programId       SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createInitializeMint2Instruction(
  mint: PublicKey,
  decimals: number,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null,
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an InitializeMintCloseAuthority instruction
 *
 * @param mint            Token mint account
 * @param closeAuthority  Optional authority that can close the mint
 * @param programId       SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createInitializeMintCloseAuthorityInstruction(
  mint: PublicKey,
  closeAuthority: PublicKey | null,
  programId: PublicKey,
): TransactionInstruction;

/**
 * Construct an InitializeMint instruction
 *
 * @param mint            Token mint account
 * @param decimals        Number of decimals in token account amounts
 * @param mintAuthority   Minting authority
 * @param freezeAuthority Optional authority that can freeze token accounts
 * @param programId       SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createInitializeMintInstruction(
  mint: PublicKey,
  decimals: number,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null,
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an InitializeMultisig instruction
 *
 * @param account   Multisig account
 * @param signers   Full set of signers
 * @param m         Number of required signatures
 * @param programId SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createInitializeMultisigInstruction(
  account: PublicKey,
  signers: (Signer | PublicKey)[],
  m: number,
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an InitializeNonTransferableMint instruction
 *
 * @param mint           Mint Account to make non-transferable
 * @param programId         SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createInitializeNonTransferableMintInstruction(
  mint: PublicKey,
  programId: PublicKey,
): TransactionInstruction;

/**
 * Construct a InitializePausableConfig instruction
 *
 * @param mint          Token mint account
 * @param authority     Optional authority that can pause or resume mint
 * @param programId     SPL Token program account
 */
export declare function createInitializePausableConfigInstruction(
  mint: PublicKey,
  authority: PublicKey | null,
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an InitializePermanentDelegate instruction
 *
 * @param mint               Token mint account
 * @param permanentDelegate  Authority that may sign for `Transfer`s and `Burn`s on any account
 * @param programId          SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createInitializePermanentDelegateInstruction(
  mint: PublicKey,
  permanentDelegate: PublicKey | null,
  programId: PublicKey,
): TransactionInstruction;

/**
 * Construct an InitializeScaledUiAmountConfig instruction
 *
 * @param mint         Token mint account
 * @param authority    Optional authority that can update the multipliers
 * @param signers      The signer account(s)
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createInitializeScaledUiAmountConfigInstruction(
  mint: PublicKey,
  authority: PublicKey | null,
  multiplier: number,
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an InitializeTransferFeeConfig instruction
 *
 * @param mint            Token mint account
 * @param transferFeeConfigAuthority  Optional authority that can update the fees
 * @param withdrawWithheldAuthority Optional authority that can withdraw fees
 * @param transferFeeBasisPoints Amount of transfer collected as fees, expressed as basis points of the transfer amount
 * @param maximumFee        Maximum fee assessed on transfers
 * @param programId       SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createInitializeTransferFeeConfigInstruction(
  mint: PublicKey,
  transferFeeConfigAuthority: PublicKey | null,
  withdrawWithheldAuthority: PublicKey | null,
  transferFeeBasisPoints: number,
  maximumFee: bigint,
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an InitializeTransferHook instruction
 *
 * @param mint                  Token mint account
 * @param authority             Transfer hook authority account
 * @param transferHookProgramId Transfer hook program account
 * @param programId             SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createInitializeTransferHookInstruction(
  mint: PublicKey,
  authority: PublicKey,
  transferHookProgramId: PublicKey,
  programId: PublicKey,
): TransactionInstruction;

/**
 * Initialize an interest bearing account on a mint
 *
 * @param connection      Connection to use
 * @param payer           Payer of the transaction fees
 * @param mintAuthority   Account or multisig that will control minting
 * @param freezeAuthority Optional account or multisig that can freeze token accounts
 * @param rateAuthority   The public key for the account that can update the rate
 * @param rate            The initial interest rate
 * @param decimals        Location of the decimal place
 * @param keypair         Optional keypair, defaulting to a new random one
 * @param confirmOptions  Options for confirming the transaction
 * @param programId       SPL Token program account
 *
 * @return Public key of the mint
 */
export declare function createInterestBearingMint(
  connection: Connection,
  payer: Signer,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey,
  rateAuthority: PublicKey,
  rate: number,
  decimals: number,
  keypair?: Keypair,
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<PublicKey>;

/**
 * Create and initialize a new mint
 *
 * @param connection      Connection to use
 * @param payer           Payer of the transaction and initialization fees
 * @param mintAuthority   Account or multisig that will control minting
 * @param freezeAuthority Optional account or multisig that can freeze token accounts
 * @param decimals        Location of the decimal place
 * @param keypair         Optional keypair, defaulting to a new random one
 * @param confirmOptions  Options for confirming the transaction
 * @param programId       SPL Token program account
 *
 * @return Address of the new mint
 */
export declare function createMint(
  connection: Connection,
  payer: Signer,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null,
  decimals: number,
  keypair?: Keypair,
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<PublicKey>;

/**
 * Construct a MintToChecked instruction
 *
 * @param mint         Public key of the mint
 * @param destination  Address of the token account to mint to
 * @param authority    The mint authority
 * @param amount       Amount to mint
 * @param decimals     Number of decimals in amount to mint
 * @param multiSigners Signing accounts if `authority` is a multisig
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createMintToCheckedInstruction(
  mint: PublicKey,
  destination: PublicKey,
  authority: PublicKey,
  amount: number | bigint,
  decimals: number,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a MintTo instruction
 *
 * @param mint         Public key of the mint
 * @param destination  Address of the token account to mint to
 * @param authority    The mint authority
 * @param amount       Amount to mint
 * @param multiSigners Signing accounts if `authority` is a multisig
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createMintToInstruction(
  mint: PublicKey,
  destination: PublicKey,
  authority: PublicKey,
  amount: number | bigint,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Create and initialize a new multisig
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction and initialization fees
 * @param signers        Full set of signers
 * @param m              Number of required signatures
 * @param keypair        Optional keypair, defaulting to a new random one
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Address of the new multisig
 */
export declare function createMultisig(
  connection: Connection,
  payer: Signer,
  signers: PublicKey[],
  m: number,
  keypair?: Keypair,
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<PublicKey>;

/**
 * Create native mint
 *
 * @param connection               Connection to use
 * @param payer                    Payer of the transaction and initialization fees
 * @param confirmOptions           Options for confirming the transaction
 * @param programId                SPL Token program account
 * @param nativeMint               Native mint id associated with program
 */
export declare function createNativeMint(
  connection: Connection,
  payer: Signer,
  confirmOptions?: ConfirmOptions,
  nativeMint?: PublicKey,
  programId?: PublicKey,
): Promise<void>;

/** TODO: docs */
export declare interface CreateNativeMintInstructionData {
  instruction: TokenInstruction.CreateNativeMint;
}

/** TODO: docs */
export declare const createNativeMintInstructionData: Structure<CreateNativeMintInstructionData>;

/**
 * Construct a Pause instruction
 *
 * @param mint          Token mint account
 * @param authority     The pausable mint's authority
 * @param multiSigners  Signing accounts if authority is a multisig
 * @param programId     SPL Token program account
 */
export declare function createPauseInstruction(
  mint: PublicKey,
  authority: PublicKey,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a Reallocate instruction
 *
 * @param account        Address of the token account
 * @param payer          Address paying for the reallocation
 * @param extensionTypes Extensions to reallocate for
 * @param owner          Owner of the account
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param programId      SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createReallocateInstruction(
  account: PublicKey,
  payer: PublicKey,
  extensionTypes: ExtensionType[],
  owner: PublicKey,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a RecoverNested instruction
 *
 * @param nestedAssociatedToken             Nested associated token account (must be owned by `ownerAssociatedToken`)
 * @param nestedMint                        Token mint for the nested associated token account
 * @param destinationAssociatedToken        Wallet's associated token account
 * @param ownerAssociatedToken              Owner associated token account address (must be owned by `owner`)
 * @param ownerMint                         Token mint for the owner associated token account
 * @param owner                             Wallet address for the owner associated token account
 * @param programId                         SPL Token program account
 * @param associatedTokenProgramId          SPL Associated Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createRecoverNestedInstruction(
  nestedAssociatedToken: PublicKey,
  nestedMint: PublicKey,
  destinationAssociatedToken: PublicKey,
  ownerAssociatedToken: PublicKey,
  ownerMint: PublicKey,
  owner: PublicKey,
  programId?: PublicKey,
  associatedTokenProgramId?: PublicKey,
): TransactionInstruction;

export { createRemoveKeyInstruction };

/**
 * Construct a Resume instruction
 *
 * @param mint          Token mint account
 * @param authority     The pausable mint's authority
 * @param multiSigners  Signing accounts if authority is a multisig
 * @param programId     SPL Token program account
 */
export declare function createResumeInstruction(
  mint: PublicKey,
  authority: PublicKey,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a Revoke instruction
 *
 * @param account      Address of the token account
 * @param owner        Owner of the account
 * @param multiSigners Signing accounts if `owner` is a multisig
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createRevokeInstruction(
  account: PublicKey,
  owner: PublicKey,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a SetAuthority instruction
 *
 * @param account          Address of the token account
 * @param currentAuthority Current authority of the specified type
 * @param authorityType    Type of authority to set
 * @param newAuthority     New authority of the account
 * @param multiSigners     Signing accounts if `currentAuthority` is a multisig
 * @param programId        SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createSetAuthorityInstruction(
  account: PublicKey,
  currentAuthority: PublicKey,
  authorityType: AuthorityType,
  newAuthority: PublicKey | null,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a SetTransferFeeInstruction instruction
 *
 * @param mint                      The token mint
 * @param authority                 The authority of the transfer fee
 * @param signers                   The signer account(s)
 * @param transferFeeBasisPoints    Amount of transfer collected as fees, expressed as basis points of the transfer amount
 * @param maximumFee                Maximum fee assessed on transfers
 * @param programID                 SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createSetTransferFeeInstruction(
  mint: PublicKey,
  authority: PublicKey,
  signers: (Signer | PublicKey)[],
  transferFeeBasisPoints: number,
  maximumFee: bigint,
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a SyncNative instruction
 *
 * @param account   Native account to sync lamports from
 * @param programId SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createSyncNativeInstruction(
  account: PublicKey,
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a ThawAccount instruction
 *
 * @param account      Account to thaw
 * @param mint         Mint account
 * @param authority    Mint freeze authority
 * @param multiSigners Signing accounts if `authority` is a multisig
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createThawAccountInstruction(
  account: PublicKey,
  mint: PublicKey,
  authority: PublicKey,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a TransferChecked instruction
 *
 * @param source       Source account
 * @param mint         Mint account
 * @param destination  Destination account
 * @param owner        Owner of the source account
 * @param amount       Number of tokens to transfer
 * @param decimals     Number of decimals in transfer amount
 * @param multiSigners Signing accounts if `owner` is a multisig
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createTransferCheckedInstruction(
  source: PublicKey,
  mint: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  amount: number | bigint,
  decimals: number,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an transferChecked instruction with extra accounts for transfer hook
 *
 * @param connection            Connection to use
 * @param source                Source account
 * @param mint                  Mint to update
 * @param destination           Destination account
 * @param owner                 Owner of the source account
 * @param amount                The amount of tokens to transfer
 * @param decimals              Number of decimals in transfer amount
 * @param fee                   The calculated fee for the transfer fee extension
 * @param multiSigners          The signer account(s) for a multisig
 * @param commitment            Commitment to use
 * @param programId             SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createTransferCheckedWithFeeAndTransferHookInstruction(
  connection: Connection,
  source: PublicKey,
  mint: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  amount: bigint,
  decimals: number,
  fee: bigint,
  multiSigners?: (Signer | PublicKey)[],
  commitment?: Commitment,
  programId?: PublicKey,
): Promise<TransactionInstruction>;

/**
 * Construct an TransferCheckedWithFee instruction
 *
 * @param source          The source account
 * @param mint            The token mint
 * @param destination     The destination account
 * @param authority       The source account's owner/delegate
 * @param signers         The signer account(s)
 * @param amount          The amount of tokens to transfer
 * @param decimals        The expected number of base 10 digits to the right of the decimal place
 * @param fee             The expected fee assesed on this transfer, calculated off-chain based on the transferFeeBasisPoints and maximumFee of the mint.
 * @param programId       SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createTransferCheckedWithFeeInstruction(
  source: PublicKey,
  mint: PublicKey,
  destination: PublicKey,
  authority: PublicKey,
  amount: bigint,
  decimals: number,
  fee: bigint,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an transferChecked instruction with extra accounts for transfer hook
 *
 * @param connection            Connection to use
 * @param source                Source account
 * @param mint                  Mint to update
 * @param destination           Destination account
 * @param owner                 Owner of the source account
 * @param amount                The amount of tokens to transfer
 * @param decimals              Number of decimals in transfer amount
 * @param multiSigners          The signer account(s) for a multisig
 * @param commitment            Commitment to use
 * @param programId             SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createTransferCheckedWithTransferHookInstruction(
  connection: Connection,
  source: PublicKey,
  mint: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  amount: bigint,
  decimals: number,
  multiSigners?: (Signer | PublicKey)[],
  commitment?: Commitment,
  programId?: PublicKey,
): Promise<TransactionInstruction>;

/**
 * Construct a Transfer instruction
 *
 * @param source       Source account
 * @param destination  Destination account
 * @param owner        Owner of the source account
 * @param amount       Number of tokens to transfer
 * @param multiSigners Signing accounts if `owner` is a multisig
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createTransferInstruction(
  source: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  amount: number | bigint,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/** TODO: docs */
/**
 * Construct a UiAmountToAmount instruction
 *
 * @param mint         Public key of the mint
 * @param amount       UiAmount of tokens to be converted to Amount
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createUiAmountToAmountInstruction(
  mint: PublicKey,
  amount: string,
  programId?: PublicKey,
): TransactionInstruction;

export { createUpdateAuthorityInstruction };

/**
 * Construct an UpdateDefaultAccountState instruction
 *
 * @param mint         Mint to update
 * @param accountState    Default account state to set on all accounts
 * @param freezeAuthority       The mint's freeze authority
 * @param signers         The signer account(s) for a multisig
 * @param programId       SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createUpdateDefaultAccountStateInstruction(
  mint: PublicKey,
  accountState: AccountState,
  freezeAuthority: PublicKey,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

export {
  createUpdateFieldInstruction,
  createUpdateGroupAuthorityInstruction,
  createUpdateGroupMaxSizeInstruction,
};

export declare function createUpdateGroupMemberPointerInstruction(
  mint: PublicKey,
  authority: PublicKey,
  memberAddress: PublicKey | null,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

export declare function createUpdateGroupPointerInstruction(
  mint: PublicKey,
  authority: PublicKey,
  groupAddress: PublicKey | null,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

export declare function createUpdateMetadataPointerInstruction(
  mint: PublicKey,
  authority: PublicKey,
  metadataAddress: PublicKey | null,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an UpdateMultiplierData instruction
 *
 * @param mint                  Token mint account
 * @param authority             Optional authority that can update the multipliers
 * @param multiplier            New multiplier
 * @param effectiveTimestamp    Effective time stamp for the new multiplier
 * @param multiSigners          Signing accounts if `owner` is a multisig
 * @param programId             SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createUpdateMultiplierDataInstruction(
  mint: PublicKey,
  authority: PublicKey,
  multiplier: number,
  effectiveTimestamp: bigint,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an UpdateRateInterestBearingMint instruction
 *
 * @param mint           Mint to initialize
 * @param rateAuthority  The public key for the account that can update the rate
 * @param rate           The updated interest rate
 * @param multiSigners   Signing accounts if `rateAuthority` is a multisig
 * @param programId      SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createUpdateRateInterestBearingMintInstruction(
  mint: PublicKey,
  rateAuthority: PublicKey,
  rate: number,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct an UpdateTransferHook instruction
 *
 * @param mint                  Mint to update
 * @param authority             The mint's transfer hook authority
 * @param transferHookProgramId The new transfer hook program account
 * @param signers               The signer account(s) for a multisig
 * @param tokenProgramId        SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createUpdateTransferHookInstruction(
  mint: PublicKey,
  authority: PublicKey,
  transferHookProgramId: PublicKey,
  multiSigners?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a WithdrawWithheldTokensFromAccounts instruction
 *
 * @param mint              The token mint
 * @param destination       The destination account
 * @param authority         The source account's owner/delegate
 * @param signers           The signer account(s)
 * @param sources           The source accounts to withdraw from
 * @param programID         SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createWithdrawWithheldTokensFromAccountsInstruction(
  mint: PublicKey,
  destination: PublicKey,
  authority: PublicKey,
  signers: (Signer | PublicKey)[],
  sources: PublicKey[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Construct a WithdrawWithheldTokensFromMint instruction
 *
 * @param mint              The token mint
 * @param destination       The destination account
 * @param authority         The source account's owner/delegate
 * @param signers           The signer account(s)
 * @param programID         SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createWithdrawWithheldTokensFromMintInstruction(
  mint: PublicKey,
  destination: PublicKey,
  authority: PublicKey,
  signers?: (Signer | PublicKey)[],
  programId?: PublicKey,
): TransactionInstruction;

/**
 * Create, initialize, and fund a new wrapped native SOL account
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction and initialization fees
 * @param owner          Owner of the new token account
 * @param amount         Number of lamports to wrap
 * @param keypair        Optional keypair, defaulting to the associated token account for the native mint and `owner`
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Address of the new wrapped native SOL account
 */
export declare function createWrappedNativeAccount(
  connection: Connection,
  payer: Signer,
  owner: PublicKey,
  amount: number,
  keypair?: Keypair,
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
  nativeMint?: PublicKey,
): Promise<PublicKey>;

/**
 * Decode a AmountToUiAmount instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeAmountToUiAmountInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedAmountToUiAmountInstruction;

/**
 * Decode a AmountToUiAmount instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeAmountToUiAmountInstructionUnchecked({
  programId,
  keys: [mint],
  data,
}: TransactionInstruction): DecodedAmountToUiAmountInstructionUnchecked;

/**
 * Decode an ApproveChecked instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeApproveCheckedInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedApproveCheckedInstruction;

/**
 * Decode an ApproveChecked instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeApproveCheckedInstructionUnchecked({
  programId,
  keys: [account, mint, delegate, owner, ...multiSigners],
  data,
}: TransactionInstruction): DecodedApproveCheckedInstructionUnchecked;

/**
 * Decode an Approve instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeApproveInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedApproveInstruction;

/**
 * Decode an Approve instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeApproveInstructionUnchecked({
  programId,
  keys: [account, delegate, owner, ...multiSigners],
  data,
}: TransactionInstruction): DecodedApproveInstructionUnchecked;

/**
 * Decode a BurnChecked instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeBurnCheckedInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedBurnCheckedInstruction;

/**
 * Decode a BurnChecked instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeBurnCheckedInstructionUnchecked({
  programId,
  keys: [account, mint, owner, ...multiSigners],
  data,
}: TransactionInstruction): DecodedBurnCheckedInstructionUnchecked;

/**
 * Decode a Burn instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeBurnInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedBurnInstruction;

/**
 * Decode a Burn instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeBurnInstructionUnchecked({
  programId,
  keys: [account, mint, owner, ...multiSigners],
  data,
}: TransactionInstruction): DecodedBurnInstructionUnchecked;

/**
 * Decode a CloseAccount instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeCloseAccountInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedCloseAccountInstruction;

/**
 * Decode a CloseAccount instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeCloseAccountInstructionUnchecked({
  programId,
  keys: [account, destination, authority, ...multiSigners],
  data,
}: TransactionInstruction): DecodedCloseAccountInstructionUnchecked;

/** A decoded, valid AmountToUiAmount instruction */
export declare interface DecodedAmountToUiAmountInstruction {
  programId: PublicKey;
  keys: {
    mint: AccountMeta;
  };
  data: {
    instruction: TokenInstruction.AmountToUiAmount;
    amount: bigint;
  };
}

/** A decoded, non-validated AmountToUiAmount instruction */
export declare interface DecodedAmountToUiAmountInstructionUnchecked {
  programId: PublicKey;
  keys: {
    mint: AccountMeta | undefined;
  };
  data: {
    instruction: number;
    amount: bigint;
  };
}

/** A decoded, valid ApproveChecked instruction */
export declare interface DecodedApproveCheckedInstruction {
  programId: PublicKey;
  keys: {
    account: AccountMeta;
    mint: AccountMeta;
    delegate: AccountMeta;
    owner: AccountMeta;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: TokenInstruction.ApproveChecked;
    amount: bigint;
    decimals: number;
  };
}

/** A decoded, non-validated ApproveChecked instruction */
export declare interface DecodedApproveCheckedInstructionUnchecked {
  programId: PublicKey;
  keys: {
    account: AccountMeta | undefined;
    mint: AccountMeta | undefined;
    delegate: AccountMeta | undefined;
    owner: AccountMeta | undefined;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: number;
    amount: bigint;
    decimals: number;
  };
}

/** A decoded, valid Approve instruction */
export declare interface DecodedApproveInstruction {
  programId: PublicKey;
  keys: {
    account: AccountMeta;
    delegate: AccountMeta;
    owner: AccountMeta;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: TokenInstruction.Approve;
    amount: bigint;
  };
}

/** A decoded, non-validated Approve instruction */
export declare interface DecodedApproveInstructionUnchecked {
  programId: PublicKey;
  keys: {
    account: AccountMeta | undefined;
    delegate: AccountMeta | undefined;
    owner: AccountMeta | undefined;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: number;
    amount: bigint;
  };
}

/** A decoded, valid BurnChecked instruction */
export declare interface DecodedBurnCheckedInstruction {
  programId: PublicKey;
  keys: {
    account: AccountMeta;
    mint: AccountMeta;
    owner: AccountMeta;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: TokenInstruction.BurnChecked;
    amount: bigint;
    decimals: number;
  };
}

/** A decoded, non-validated BurnChecked instruction */
export declare interface DecodedBurnCheckedInstructionUnchecked {
  programId: PublicKey;
  keys: {
    account: AccountMeta | undefined;
    mint: AccountMeta | undefined;
    owner: AccountMeta | undefined;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: number;
    amount: bigint;
    decimals: number;
  };
}

/** A decoded, valid Burn instruction */
export declare interface DecodedBurnInstruction {
  programId: PublicKey;
  keys: {
    account: AccountMeta;
    mint: AccountMeta;
    owner: AccountMeta;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: TokenInstruction.Burn;
    amount: bigint;
  };
}

/** A decoded, non-validated Burn instruction */
export declare interface DecodedBurnInstructionUnchecked {
  programId: PublicKey;
  keys: {
    account: AccountMeta | undefined;
    mint: AccountMeta | undefined;
    owner: AccountMeta | undefined;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: number;
    amount: bigint;
  };
}

/** A decoded, valid CloseAccount instruction */
export declare interface DecodedCloseAccountInstruction {
  programId: PublicKey;
  keys: {
    account: AccountMeta;
    destination: AccountMeta;
    authority: AccountMeta;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: TokenInstruction.CloseAccount;
  };
}

/** A decoded, non-validated CloseAccount instruction */
export declare interface DecodedCloseAccountInstructionUnchecked {
  programId: PublicKey;
  keys: {
    account: AccountMeta | undefined;
    destination: AccountMeta | undefined;
    authority: AccountMeta | undefined;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: number;
  };
}

/** A decoded, valid FreezeAccount instruction */
export declare interface DecodedFreezeAccountInstruction {
  programId: PublicKey;
  keys: {
    account: AccountMeta;
    mint: AccountMeta;
    authority: AccountMeta;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: TokenInstruction.FreezeAccount;
  };
}

/** A decoded, non-validated FreezeAccount instruction */
export declare interface DecodedFreezeAccountInstructionUnchecked {
  programId: PublicKey;
  keys: {
    account: AccountMeta | undefined;
    mint: AccountMeta | undefined;
    authority: AccountMeta | undefined;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: number;
  };
}

/** A decoded, valid HarvestWithheldTokensToMint instruction */
export declare interface DecodedHarvestWithheldTokensToMintInstruction {
  programId: PublicKey;
  keys: {
    mint: AccountMeta;
    sources: AccountMeta[] | null;
  };
  data: {
    instruction: TokenInstruction.TransferFeeExtension;
    transferFeeInstruction: TransferFeeInstruction.HarvestWithheldTokensToMint;
  };
}

/** A decoded, valid HarvestWithheldTokensToMint instruction */
export declare interface DecodedHarvestWithheldTokensToMintInstructionUnchecked {
  programId: PublicKey;
  keys: {
    mint: AccountMeta;
    sources: AccountMeta[] | null;
  };
  data: {
    instruction: TokenInstruction.TransferFeeExtension;
    transferFeeInstruction: TransferFeeInstruction.HarvestWithheldTokensToMint;
  };
}

/** A decoded, valid InitializeAccount2 instruction */
export declare interface DecodedInitializeAccount2Instruction {
  programId: PublicKey;
  keys: {
    account: AccountMeta;
    mint: AccountMeta;
    rent: AccountMeta;
  };
  data: {
    instruction: TokenInstruction.InitializeAccount2;
    owner: PublicKey;
  };
}

/** A decoded, non-validated InitializeAccount2 instruction */
export declare interface DecodedInitializeAccount2InstructionUnchecked {
  programId: PublicKey;
  keys: {
    account: AccountMeta | undefined;
    mint: AccountMeta | undefined;
    rent: AccountMeta | undefined;
  };
  data: {
    instruction: number;
    owner: PublicKey;
  };
}

/** A decoded, valid InitializeAccount3 instruction */
export declare interface DecodedInitializeAccount3Instruction {
  programId: PublicKey;
  keys: {
    account: AccountMeta;
    mint: AccountMeta;
  };
  data: {
    instruction: TokenInstruction.InitializeAccount3;
    owner: PublicKey;
  };
}

/** A decoded, non-validated InitializeAccount3 instruction */
export declare interface DecodedInitializeAccount3InstructionUnchecked {
  programId: PublicKey;
  keys: {
    account: AccountMeta | undefined;
    mint: AccountMeta | undefined;
  };
  data: {
    instruction: number;
    owner: PublicKey;
  };
}

/** A decoded, valid InitializeAccount instruction */
export declare interface DecodedInitializeAccountInstruction {
  programId: PublicKey;
  keys: {
    account: AccountMeta;
    mint: AccountMeta;
    owner: AccountMeta;
    rent: AccountMeta;
  };
  data: {
    instruction: TokenInstruction.InitializeAccount;
  };
}

/** A decoded, non-validated InitializeAccount instruction */
export declare interface DecodedInitializeAccountInstructionUnchecked {
  programId: PublicKey;
  keys: {
    account: AccountMeta | undefined;
    mint: AccountMeta | undefined;
    owner: AccountMeta | undefined;
    rent: AccountMeta | undefined;
  };
  data: {
    instruction: number;
  };
}

/** A decoded, valid InitializeImmutableOwner instruction */
export declare interface DecodedInitializeImmutableOwnerInstruction {
  programId: PublicKey;
  keys: {
    account: AccountMeta;
  };
  data: {
    instruction: TokenInstruction.InitializeImmutableOwner;
  };
}

/** A decoded, non-validated InitializeImmutableOwner instruction */
export declare interface DecodedInitializeImmutableOwnerInstructionUnchecked {
  programId: PublicKey;
  keys: {
    account: AccountMeta | undefined;
  };
  data: {
    instruction: number;
  };
}

/** A decoded, valid InitializeMint2 instruction */
export declare interface DecodedInitializeMint2Instruction {
  programId: PublicKey;
  keys: {
    mint: AccountMeta;
  };
  data: {
    instruction: TokenInstruction.InitializeMint2;
    decimals: number;
    mintAuthority: PublicKey;
    freezeAuthority: PublicKey | null;
  };
}

/** A decoded, non-validated InitializeMint2 instruction */
export declare interface DecodedInitializeMint2InstructionUnchecked {
  programId: PublicKey;
  keys: {
    mint: AccountMeta | undefined;
  };
  data: {
    instruction: number;
    decimals: number;
    mintAuthority: PublicKey;
    freezeAuthority: PublicKey | null;
  };
}

/** A decoded, valid InitializeMintCloseAuthority instruction */
export declare interface DecodedInitializeMintCloseAuthorityInstruction {
  programId: PublicKey;
  keys: {
    mint: AccountMeta;
  };
  data: {
    instruction: TokenInstruction.InitializeMintCloseAuthority;
    closeAuthority: PublicKey | null;
  };
}

/** A decoded, non-validated InitializeMintCloseAuthority instruction */
export declare interface DecodedInitializeMintCloseAuthorityInstructionUnchecked {
  programId: PublicKey;
  keys: {
    mint: AccountMeta | undefined;
  };
  data: {
    instruction: number;
    closeAuthority: PublicKey | null;
  };
}

/** A decoded, valid InitializeMint instruction */
export declare interface DecodedInitializeMintInstruction {
  programId: PublicKey;
  keys: {
    mint: AccountMeta;
    rent: AccountMeta;
  };
  data: {
    instruction: TokenInstruction.InitializeMint;
    decimals: number;
    mintAuthority: PublicKey;
    freezeAuthority: PublicKey | null;
  };
}

/** A decoded, non-validated InitializeMint instruction */
export declare interface DecodedInitializeMintInstructionUnchecked {
  programId: PublicKey;
  keys: {
    mint: AccountMeta | undefined;
    rent: AccountMeta | undefined;
  };
  data: {
    instruction: number;
    decimals: number;
    mintAuthority: PublicKey;
    freezeAuthority: PublicKey | null;
  };
}

/** A decoded, valid InitializeMultisig instruction */
export declare interface DecodedInitializeMultisigInstruction {
  programId: PublicKey;
  keys: {
    account: AccountMeta;
    rent: AccountMeta;
    signers: AccountMeta[];
  };
  data: {
    instruction: TokenInstruction.InitializeMultisig;
    m: number;
  };
}

/** A decoded, non-validated InitializeMultisig instruction */
export declare interface DecodedInitializeMultisigInstructionUnchecked {
  programId: PublicKey;
  keys: {
    account: AccountMeta | undefined;
    rent: AccountMeta | undefined;
    signers: AccountMeta[];
  };
  data: {
    instruction: number;
    m: number;
  };
}

/** A decoded, valid InitializePermanentDelegate instruction */
export declare interface DecodedInitializePermanentDelegateInstruction {
  programId: PublicKey;
  keys: {
    mint: AccountMeta;
  };
  data: {
    instruction: TokenInstruction.InitializePermanentDelegate;
    delegate: PublicKey | null;
  };
}

/** A decoded, non-validated InitializePermanentDelegate instruction */
export declare interface DecodedInitializePermanentDelegateInstructionUnchecked {
  programId: PublicKey;
  keys: {
    mint: AccountMeta | undefined;
  };
  data: {
    instruction: number;
    delegate: PublicKey | null;
  };
}

/** A decoded, valid InitializeTransferFeeConfig instruction */
export declare interface DecodedInitializeTransferFeeConfigInstruction {
  programId: PublicKey;
  keys: {
    mint: AccountMeta;
  };
  data: {
    instruction: TokenInstruction.TransferFeeExtension;
    transferFeeInstruction: TransferFeeInstruction.InitializeTransferFeeConfig;
    transferFeeConfigAuthority: PublicKey | null;
    withdrawWithheldAuthority: PublicKey | null;
    transferFeeBasisPoints: number;
    maximumFee: bigint;
  };
}

/** A decoded, non-validated InitializeTransferFeeConfig instruction */
export declare interface DecodedInitializeTransferFeeConfigInstructionUnchecked {
  programId: PublicKey;
  keys: {
    mint: AccountMeta | undefined;
  };
  data: {
    instruction: TokenInstruction.TransferFeeExtension;
    transferFeeInstruction: TransferFeeInstruction.InitializeTransferFeeConfig;
    transferFeeConfigAuthority: PublicKey | null;
    withdrawWithheldAuthority: PublicKey | null;
    transferFeeBasisPoints: number;
    maximumFee: bigint;
  };
}

/** TODO: docs */
export declare type DecodedInstruction =
  | DecodedInitializeMintInstruction
  | DecodedInitializeAccountInstruction
  | DecodedInitializeMultisigInstruction
  | DecodedTransferInstruction
  | DecodedApproveInstruction
  | DecodedRevokeInstruction
  | DecodedSetAuthorityInstruction
  | DecodedMintToInstruction
  | DecodedBurnInstruction
  | DecodedCloseAccountInstruction
  | DecodedFreezeAccountInstruction
  | DecodedThawAccountInstruction
  | DecodedTransferCheckedInstruction
  | DecodedApproveCheckedInstruction
  | DecodedMintToCheckedInstruction
  | DecodedBurnCheckedInstruction
  | DecodedInitializeAccount2Instruction
  | DecodedSyncNativeInstruction
  | DecodedInitializeAccount3Instruction
  | DecodedInitializeMint2Instruction
  | DecodedAmountToUiAmountInstruction
  | DecodedUiAmountToAmountInstruction
  | never;

/** A decoded, valid MintToChecked instruction */
export declare interface DecodedMintToCheckedInstruction {
  programId: PublicKey;
  keys: {
    mint: AccountMeta;
    destination: AccountMeta;
    authority: AccountMeta;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: TokenInstruction.MintToChecked;
    amount: bigint;
    decimals: number;
  };
}

/** A decoded, non-validated MintToChecked instruction */
export declare interface DecodedMintToCheckedInstructionUnchecked {
  programId: PublicKey;
  keys: {
    mint: AccountMeta | undefined;
    destination: AccountMeta | undefined;
    authority: AccountMeta | undefined;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: number;
    amount: bigint;
    decimals: number;
  };
}

/** A decoded, valid MintTo instruction */
export declare interface DecodedMintToInstruction {
  programId: PublicKey;
  keys: {
    mint: AccountMeta;
    destination: AccountMeta;
    authority: AccountMeta;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: TokenInstruction.MintTo;
    amount: bigint;
  };
}

/** A decoded, non-validated MintTo instruction */
export declare interface DecodedMintToInstructionUnchecked {
  programId: PublicKey;
  keys: {
    mint: AccountMeta | undefined;
    destination: AccountMeta | undefined;
    authority: AccountMeta | undefined;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: number;
    amount: bigint;
  };
}

/** A decoded, valid Revoke instruction */
export declare interface DecodedRevokeInstruction {
  programId: PublicKey;
  keys: {
    account: AccountMeta;
    owner: AccountMeta;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: TokenInstruction.Revoke;
  };
}

/** A decoded, non-validated Revoke instruction */
export declare interface DecodedRevokeInstructionUnchecked {
  programId: PublicKey;
  keys: {
    account: AccountMeta | undefined;
    owner: AccountMeta | undefined;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: number;
  };
}

/** A decoded, valid SetAuthority instruction */
export declare interface DecodedSetAuthorityInstruction {
  programId: PublicKey;
  keys: {
    account: AccountMeta;
    currentAuthority: AccountMeta;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: TokenInstruction.SetAuthority;
    authorityType: AuthorityType;
    newAuthority: PublicKey | null;
  };
}

/** A decoded, non-validated SetAuthority instruction */
export declare interface DecodedSetAuthorityInstructionUnchecked {
  programId: PublicKey;
  keys: {
    account: AccountMeta | undefined;
    currentAuthority: AccountMeta | undefined;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: number;
    authorityType: AuthorityType;
    newAuthority: PublicKey | null;
  };
}

/** A decoded, valid SetTransferFee instruction */
export declare interface DecodedSetTransferFeeInstruction {
  programId: PublicKey;
  keys: {
    mint: AccountMeta;
    authority: AccountMeta;
    signers: AccountMeta[] | null;
  };
  data: {
    instruction: TokenInstruction.TransferFeeExtension;
    transferFeeInstruction: TransferFeeInstruction.SetTransferFee;
    transferFeeBasisPoints: number;
    maximumFee: bigint;
  };
}

/** A decoded, valid SetTransferFee instruction */
export declare interface DecodedSetTransferFeeInstructionUnchecked {
  programId: PublicKey;
  keys: {
    mint: AccountMeta;
    authority: AccountMeta;
    signers: AccountMeta[] | undefined;
  };
  data: {
    instruction: TokenInstruction.TransferFeeExtension;
    transferFeeInstruction: TransferFeeInstruction.SetTransferFee;
    transferFeeBasisPoints: number;
    maximumFee: bigint;
  };
}

/** A decoded, valid SyncNative instruction */
export declare interface DecodedSyncNativeInstruction {
  programId: PublicKey;
  keys: {
    account: AccountMeta;
  };
  data: {
    instruction: TokenInstruction.SyncNative;
  };
}

/** A decoded, non-validated SyncNative instruction */
export declare interface DecodedSyncNativeInstructionUnchecked {
  programId: PublicKey;
  keys: {
    account: AccountMeta | undefined;
  };
  data: {
    instruction: number;
  };
}

/** A decoded, valid ThawAccount instruction */
export declare interface DecodedThawAccountInstruction {
  programId: PublicKey;
  keys: {
    account: AccountMeta;
    mint: AccountMeta;
    authority: AccountMeta;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: TokenInstruction.ThawAccount;
  };
}

/** A decoded, non-validated ThawAccount instruction */
export declare interface DecodedThawAccountInstructionUnchecked {
  programId: PublicKey;
  keys: {
    account: AccountMeta | undefined;
    mint: AccountMeta | undefined;
    authority: AccountMeta | undefined;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: number;
  };
}

/** A decoded, valid TransferChecked instruction */
export declare interface DecodedTransferCheckedInstruction {
  programId: PublicKey;
  keys: {
    source: AccountMeta;
    mint: AccountMeta;
    destination: AccountMeta;
    owner: AccountMeta;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: TokenInstruction.TransferChecked;
    amount: bigint;
    decimals: number;
  };
}

/** A decoded, non-validated TransferChecked instruction */
export declare interface DecodedTransferCheckedInstructionUnchecked {
  programId: PublicKey;
  keys: {
    source: AccountMeta | undefined;
    mint: AccountMeta | undefined;
    destination: AccountMeta | undefined;
    owner: AccountMeta | undefined;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: number;
    amount: bigint;
    decimals: number;
  };
}

/** A decoded, valid TransferCheckedWithFee instruction */
export declare interface DecodedTransferCheckedWithFeeInstruction {
  programId: PublicKey;
  keys: {
    source: AccountMeta;
    mint: AccountMeta;
    destination: AccountMeta;
    authority: AccountMeta;
    signers: AccountMeta[] | null;
  };
  data: {
    instruction: TokenInstruction.TransferFeeExtension;
    transferFeeInstruction: TransferFeeInstruction.TransferCheckedWithFee;
    amount: bigint;
    decimals: number;
    fee: bigint;
  };
}

/** A decoded, non-validated TransferCheckedWithFees instruction */
export declare interface DecodedTransferCheckedWithFeeInstructionUnchecked {
  programId: PublicKey;
  keys: {
    source: AccountMeta;
    mint: AccountMeta;
    destination: AccountMeta;
    authority: AccountMeta;
    signers: AccountMeta[] | undefined;
  };
  data: {
    instruction: TokenInstruction.TransferFeeExtension;
    transferFeeInstruction: TransferFeeInstruction.TransferCheckedWithFee;
    amount: bigint;
    decimals: number;
    fee: bigint;
  };
}

/** A decoded, valid Transfer instruction */
export declare interface DecodedTransferInstruction {
  programId: PublicKey;
  keys: {
    source: AccountMeta;
    destination: AccountMeta;
    owner: AccountMeta;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: TokenInstruction.Transfer;
    amount: bigint;
  };
}

/** A decoded, non-validated Transfer instruction */
export declare interface DecodedTransferInstructionUnchecked {
  programId: PublicKey;
  keys: {
    source: AccountMeta | undefined;
    destination: AccountMeta | undefined;
    owner: AccountMeta | undefined;
    multiSigners: AccountMeta[];
  };
  data: {
    instruction: number;
    amount: bigint;
  };
}

/** A decoded, valid UiAmountToAmount instruction */
export declare interface DecodedUiAmountToAmountInstruction {
  programId: PublicKey;
  keys: {
    mint: AccountMeta;
  };
  data: {
    instruction: TokenInstruction.UiAmountToAmount;
    amount: Uint8Array;
  };
}

/** A decoded, non-validated UiAmountToAmount instruction */
export declare interface DecodedUiAmountToAmountInstructionUnchecked {
  programId: PublicKey;
  keys: {
    mint: AccountMeta | undefined;
  };
  data: {
    instruction: number;
    amount: Uint8Array;
  };
}

/** A decoded, valid WithdrawWithheldTokensFromAccounts instruction */
export declare interface DecodedWithdrawWithheldTokensFromAccountsInstruction {
  programId: PublicKey;
  keys: {
    mint: AccountMeta;
    destination: AccountMeta;
    authority: AccountMeta;
    signers: AccountMeta[] | null;
    sources: AccountMeta[] | null;
  };
  data: {
    instruction: TokenInstruction.TransferFeeExtension;
    transferFeeInstruction: TransferFeeInstruction.WithdrawWithheldTokensFromAccounts;
    numTokenAccounts: number;
  };
}

/** A decoded, valid WithdrawWithheldTokensFromAccounts instruction */
export declare interface DecodedWithdrawWithheldTokensFromAccountsInstructionUnchecked {
  programId: PublicKey;
  keys: {
    mint: AccountMeta;
    destination: AccountMeta;
    authority: AccountMeta;
    signers: AccountMeta[] | null;
    sources: AccountMeta[] | null;
  };
  data: {
    instruction: TokenInstruction.TransferFeeExtension;
    transferFeeInstruction: TransferFeeInstruction.WithdrawWithheldTokensFromAccounts;
    numTokenAccounts: number;
  };
}

/** A decoded, valid WithdrawWithheldTokensFromMint instruction */
export declare interface DecodedWithdrawWithheldTokensFromMintInstruction {
  programId: PublicKey;
  keys: {
    mint: AccountMeta;
    destination: AccountMeta;
    authority: AccountMeta;
    signers: AccountMeta[] | null;
  };
  data: {
    instruction: TokenInstruction.TransferFeeExtension;
    transferFeeInstruction: TransferFeeInstruction.WithdrawWithheldTokensFromMint;
  };
}

/** A decoded, valid WithdrawWithheldTokensFromMint instruction */
export declare interface DecodedWithdrawWithheldTokensFromMintInstructionUnchecked {
  programId: PublicKey;
  keys: {
    mint: AccountMeta;
    destination: AccountMeta;
    authority: AccountMeta;
    signers: AccountMeta[] | null;
  };
  data: {
    instruction: TokenInstruction.TransferFeeExtension;
    transferFeeInstruction: TransferFeeInstruction.WithdrawWithheldTokensFromMint;
  };
}

/**
 * Decode a FreezeAccount instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeFreezeAccountInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedFreezeAccountInstruction;

/**
 * Decode a FreezeAccount instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeFreezeAccountInstructionUnchecked({
  programId,
  keys: [account, mint, authority, ...multiSigners],
  data,
}: TransactionInstruction): DecodedFreezeAccountInstructionUnchecked;

/**
 * Decode a HarvestWithheldTokensToMint instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeHarvestWithheldTokensToMintInstruction(
  instruction: TransactionInstruction,
  programId: PublicKey,
): DecodedHarvestWithheldTokensToMintInstruction;

/**
 * Decode a HarvestWithheldTokensToMint instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeHarvestWithheldTokensToMintInstructionUnchecked({
  programId,
  keys: [mint, ...sources],
  data,
}: TransactionInstruction): DecodedHarvestWithheldTokensToMintInstructionUnchecked;

/**
 * Decode an InitializeAccount2 instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeInitializeAccount2Instruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedInitializeAccount2Instruction;

/**
 * Decode an InitializeAccount2 instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeInitializeAccount2InstructionUnchecked({
  programId,
  keys: [account, mint, rent],
  data,
}: TransactionInstruction): DecodedInitializeAccount2InstructionUnchecked;

/**
 * Decode an InitializeAccount3 instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeInitializeAccount3Instruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedInitializeAccount3Instruction;

/**
 * Decode an InitializeAccount3 instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeInitializeAccount3InstructionUnchecked({
  programId,
  keys: [account, mint],
  data,
}: TransactionInstruction): DecodedInitializeAccount3InstructionUnchecked;

/**
 * Decode an InitializeAccount instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeInitializeAccountInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedInitializeAccountInstruction;

/**
 * Decode an InitializeAccount instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeInitializeAccountInstructionUnchecked({
  programId,
  keys: [account, mint, owner, rent],
  data,
}: TransactionInstruction): DecodedInitializeAccountInstructionUnchecked;

/**
 * Decode an InitializeImmutableOwner instruction and validate it
 *
 * @param instruction InitializeImmutableOwner instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeInitializeImmutableOwnerInstruction(
  instruction: TransactionInstruction,
  programId: PublicKey,
): DecodedInitializeImmutableOwnerInstruction;

/**
 * Decode an InitializeImmutableOwner instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeInitializeImmutableOwnerInstructionUnchecked({
  programId,
  keys: [account],
  data,
}: TransactionInstruction): DecodedInitializeImmutableOwnerInstructionUnchecked;

/**
 * Decode an InitializeMint2 instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeInitializeMint2Instruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedInitializeMint2Instruction;

/**
 * Decode an InitializeMint2 instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeInitializeMint2InstructionUnchecked({
  programId,
  keys: [mint],
  data,
}: TransactionInstruction): DecodedInitializeMint2InstructionUnchecked;

/**
 * Decode an InitializeMintCloseAuthority instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeInitializeMintCloseAuthorityInstruction(
  instruction: TransactionInstruction,
  programId: PublicKey,
): DecodedInitializeMintCloseAuthorityInstruction;

/**
 * Decode an InitializeMintCloseAuthority instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeInitializeMintCloseAuthorityInstructionUnchecked({
  programId,
  keys: [mint],
  data,
}: TransactionInstruction): DecodedInitializeMintCloseAuthorityInstructionUnchecked;

/**
 * Decode an InitializeMint instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeInitializeMintInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedInitializeMintInstruction;

/**
 * Decode an InitializeMint instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeInitializeMintInstructionUnchecked({
  programId,
  keys: [mint, rent],
  data,
}: TransactionInstruction): DecodedInitializeMintInstructionUnchecked;

/**
 * Decode an InitializeMultisig instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeInitializeMultisigInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedInitializeMultisigInstruction;

/**
 * Decode an InitializeMultisig instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeInitializeMultisigInstructionUnchecked({
  programId,
  keys: [account, rent, ...signers],
  data,
}: TransactionInstruction): DecodedInitializeMultisigInstructionUnchecked;

/**
 * Decode an InitializePermanentDelegate instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeInitializePermanentDelegateInstruction(
  instruction: TransactionInstruction,
  programId: PublicKey,
): DecodedInitializePermanentDelegateInstruction;

/**
 * Decode an InitializePermanentDelegate instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeInitializePermanentDelegateInstructionUnchecked({
  programId,
  keys: [mint],
  data,
}: TransactionInstruction): DecodedInitializePermanentDelegateInstructionUnchecked;

/**
 * Decode an InitializeTransferFeeConfig instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeInitializeTransferFeeConfigInstruction(
  instruction: TransactionInstruction,
  programId: PublicKey,
): DecodedInitializeTransferFeeConfigInstruction;

/**
 * Decode an InitializeTransferFeeConfig instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeInitializeTransferFeeConfigInstructionUnchecked({
  programId,
  keys: [mint],
  data,
}: TransactionInstruction): DecodedInitializeTransferFeeConfigInstructionUnchecked;

/** TODO: docs */
export declare function decodeInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedInstruction;

/**
 * Decode a MintToChecked instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeMintToCheckedInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedMintToCheckedInstruction;

/**
 * Decode a MintToChecked instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeMintToCheckedInstructionUnchecked({
  programId,
  keys: [mint, destination, authority, ...multiSigners],
  data,
}: TransactionInstruction): DecodedMintToCheckedInstructionUnchecked;

/**
 * Decode a MintTo instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeMintToInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedMintToInstruction;

/**
 * Decode a MintTo instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeMintToInstructionUnchecked({
  programId,
  keys: [mint, destination, authority, ...multiSigners],
  data,
}: TransactionInstruction): DecodedMintToInstructionUnchecked;

/**
 * Decode a Revoke instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeRevokeInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedRevokeInstruction;

/**
 * Decode a Revoke instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeRevokeInstructionUnchecked({
  programId,
  keys: [account, owner, ...multiSigners],
  data,
}: TransactionInstruction): DecodedRevokeInstructionUnchecked;

/**
 * Decode a SetAuthority instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeSetAuthorityInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedSetAuthorityInstruction;

/**
 * Decode a SetAuthority instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeSetAuthorityInstructionUnchecked({
  programId,
  keys: [account, currentAuthority, ...multiSigners],
  data,
}: TransactionInstruction): DecodedSetAuthorityInstructionUnchecked;

/**
 * Decode an SetTransferFee instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeSetTransferFeeInstruction(
  instruction: TransactionInstruction,
  programId: PublicKey,
): DecodedSetTransferFeeInstruction;

/**
 * Decode a SetTransferFee instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeSetTransferFeeInstructionUnchecked({
  programId,
  keys: [mint, authority, ...signers],
  data,
}: TransactionInstruction): DecodedSetTransferFeeInstructionUnchecked;

/**
 * Decode a SyncNative instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeSyncNativeInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedSyncNativeInstruction;

/**
 * Decode a SyncNative instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeSyncNativeInstructionUnchecked({
  programId,
  keys: [account],
  data,
}: TransactionInstruction): DecodedSyncNativeInstructionUnchecked;

/**
 * Decode a ThawAccount instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeThawAccountInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedThawAccountInstruction;

/**
 * Decode a ThawAccount instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeThawAccountInstructionUnchecked({
  programId,
  keys: [account, mint, authority, ...multiSigners],
  data,
}: TransactionInstruction): DecodedThawAccountInstructionUnchecked;

/**
 * Decode a TransferChecked instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeTransferCheckedInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedTransferCheckedInstruction;

/**
 * Decode a TransferChecked instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeTransferCheckedInstructionUnchecked({
  programId,
  keys: [source, mint, destination, owner, ...multiSigners],
  data,
}: TransactionInstruction): DecodedTransferCheckedInstructionUnchecked;

/**
 * Decode a TransferCheckedWithFee instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeTransferCheckedWithFeeInstruction(
  instruction: TransactionInstruction,
  programId: PublicKey,
): DecodedTransferCheckedWithFeeInstruction;

/**
 * Decode a TransferCheckedWithFees instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeTransferCheckedWithFeeInstructionUnchecked({
  programId,
  keys: [source, mint, destination, authority, ...signers],
  data,
}: TransactionInstruction): DecodedTransferCheckedWithFeeInstructionUnchecked;

/**
 * Decode a Transfer instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeTransferInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedTransferInstruction;

/**
 * Decode a Transfer instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeTransferInstructionUnchecked({
  programId,
  keys: [source, destination, owner, ...multiSigners],
  data,
}: TransactionInstruction): DecodedTransferInstructionUnchecked;

/**
 * Decode a UiAmountToAmount instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeUiAmountToAmountInstruction(
  instruction: TransactionInstruction,
  programId?: PublicKey,
): DecodedUiAmountToAmountInstruction;

/**
 * Decode a UiAmountToAmount instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeUiAmountToAmountInstructionUnchecked({
  programId,
  keys: [mint],
  data,
}: TransactionInstruction): DecodedUiAmountToAmountInstructionUnchecked;

/**
 * Decode a WithdrawWithheldTokensFromAccounts instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeWithdrawWithheldTokensFromAccountsInstruction(
  instruction: TransactionInstruction,
  programId: PublicKey,
): DecodedWithdrawWithheldTokensFromAccountsInstruction;

/**
 * Decode a WithdrawWithheldTokensFromAccount instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeWithdrawWithheldTokensFromAccountsInstructionUnchecked({
  programId,
  keys,
  data,
}: TransactionInstruction): DecodedWithdrawWithheldTokensFromAccountsInstructionUnchecked;

/**
 * Decode a WithdrawWithheldTokensFromMint instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeWithdrawWithheldTokensFromMintInstruction(
  instruction: TransactionInstruction,
  programId: PublicKey,
): DecodedWithdrawWithheldTokensFromMintInstruction;

/**
 * Decode a WithdrawWithheldTokensFromMint instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeWithdrawWithheldTokensFromMintInstructionUnchecked({
  programId,
  keys: [mint, destination, authority, ...signers],
  data,
}: TransactionInstruction): DecodedWithdrawWithheldTokensFromMintInstructionUnchecked;

export declare const DEFAULT_ACCOUNT_STATE_SIZE: number;

/** DefaultAccountState as stored by the program */
export declare interface DefaultAccountState {
  /** Default AccountState in which new accounts are initialized */
  state: AccountState;
}

export declare enum DefaultAccountStateInstruction {
  Initialize = 0,
  Update = 1,
}

/** TODO: docs */
export declare interface DefaultAccountStateInstructionData {
  instruction: TokenInstruction.DefaultAccountStateExtension;
  defaultAccountStateInstruction: DefaultAccountStateInstruction;
  accountState: AccountState;
}

/** TODO: docs */
export declare const defaultAccountStateInstructionData: Structure<DefaultAccountStateInstructionData>;

/** Buffer layout for de/serializing a transfer fee config extension */
export declare const DefaultAccountStateLayout: Structure<DefaultAccountState>;

/**
 * Disable CPI Guard on the given account
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param account        Account to modify
 * @param owner          Owner of the account
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function disableCpiGuard(
  connection: Connection,
  payer: Signer,
  account: PublicKey,
  owner: Signer | PublicKey,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/**
 * Disable memo transfers on the given account
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param account        Account to modify
 * @param owner          Owner of the account
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function disableRequiredMemoTransfers(
  connection: Connection,
  payer: Signer,
  account: PublicKey,
  owner: Signer | PublicKey,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/**
 * Enable CPI Guard on the given account
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param account        Account to modify
 * @param owner          Owner of the account
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function enableCpiGuard(
  connection: Connection,
  payer: Signer,
  account: PublicKey,
  owner: Signer | PublicKey,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/**
 * Enable memo transfers on the given account
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param account        Account to modify
 * @param owner          Owner of the account
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function enableRequiredMemoTransfers(
  connection: Connection,
  payer: Signer,
  account: PublicKey,
  owner: Signer | PublicKey,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

export declare enum ExtensionType {
  Uninitialized = 0,
  TransferFeeConfig = 1,
  TransferFeeAmount = 2,
  MintCloseAuthority = 3,
  ConfidentialTransferMint = 4,
  ConfidentialTransferAccount = 5,
  DefaultAccountState = 6,
  ImmutableOwner = 7,
  MemoTransfer = 8,
  NonTransferable = 9,
  InterestBearingConfig = 10,
  CpiGuard = 11,
  PermanentDelegate = 12,
  NonTransferableAccount = 13,
  TransferHook = 14,
  TransferHookAccount = 15,
  MetadataPointer = 18, // Remove number once above extensions implemented
  TokenMetadata = 19, // Remove number once above extensions implemented
  GroupPointer = 20,
  TokenGroup = 21,
  GroupMemberPointer = 22,
  TokenGroupMember = 23,
  ScaledUiAmountConfig = 25,
  PausableConfig = 26,
  PausableAccount = 27,
}

/** ExtraAccountMeta as stored by the transfer hook program */
export declare interface ExtraAccountMeta {
  discriminator: number;
  addressConfig: Uint8Array;
  isSigner: boolean;
  isWritable: boolean;
}

/** Buffer layout for de/serializing a list of ExtraAccountMetaAccountData prefixed by a u32 length */
export declare interface ExtraAccountMetaAccountData {
  instructionDiscriminator: bigint;
  length: number;
  extraAccountsList: ExtraAccountMetaList;
}

/** Buffer layout for de/serializing an ExtraAccountMetaAccountData */
export declare const ExtraAccountMetaAccountDataLayout: Structure<ExtraAccountMetaAccountData>;

/** Buffer layout for de/serializing an ExtraAccountMeta */
export declare const ExtraAccountMetaLayout: Structure<ExtraAccountMeta>;

export declare interface ExtraAccountMetaList {
  count: number;
  extraAccounts: ExtraAccountMeta[];
}

/** Buffer layout for de/serializing a list of ExtraAccountMeta prefixed by a u32 length */
export declare const ExtraAccountMetaListLayout: Structure<ExtraAccountMetaList>;

/**
 * Freeze a token account
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param account        Account to freeze
 * @param mint           Mint for the account
 * @param authority      Mint freeze authority
 * @param multiSigners   Signing accounts if `authority` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function freezeAccount(
  connection: Connection,
  payer: Signer,
  account: PublicKey,
  mint: PublicKey,
  authority: Signer | PublicKey,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/** TODO: docs */
export declare interface FreezeAccountInstructionData {
  instruction: TokenInstruction.FreezeAccount;
}

/** TODO: docs */
export declare const freezeAccountInstructionData: Structure<FreezeAccountInstructionData>;

/**
 * Retrieve information about a token account
 *
 * @param connection Connection to use
 * @param address    Token account
 * @param commitment Desired level of commitment for querying the state
 * @param programId  SPL Token program account
 *
 * @return Token account information
 */
export declare function getAccount(
  connection: Connection,
  address: PublicKey,
  commitment?: Commitment,
  programId?: PublicKey,
): Promise<Account>;

export declare function getAccountLen(extensionTypes: ExtensionType[]): number;

export declare function getAccountLenForMint(mint: Mint): number;

export declare function getAccountTypeOfMintType(e: ExtensionType): ExtensionType;

/**
 * Async version of getAssociatedTokenAddressSync
 * For backwards compatibility
 *
 * @param mint                     Token mint account
 * @param owner                    Owner of the new account
 * @param allowOwnerOffCurve       Allow the owner account to be a PDA (Program Derived Address)
 * @param programId                SPL Token program account
 * @param associatedTokenProgramId SPL Associated Token program account
 *
 * @return Promise containing the address of the associated token account
 */
export declare function getAssociatedTokenAddress(
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve?: boolean,
  programId?: PublicKey,
  associatedTokenProgramId?: PublicKey,
): Promise<PublicKey>;

/**
 * Get the address of the associated token account for a given mint and owner
 *
 * @param mint                     Token mint account
 * @param owner                    Owner of the new account
 * @param allowOwnerOffCurve       Allow the owner account to be a PDA (Program Derived Address)
 * @param programId                SPL Token program account
 * @param associatedTokenProgramId SPL Associated Token program account
 *
 * @return Address of the associated token account
 */
export declare function getAssociatedTokenAddressSync(
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve?: boolean,
  programId?: PublicKey,
  associatedTokenProgramId?: PublicKey,
): PublicKey;

export declare function getCpiGuard(account: Account): CpiGuard | null;

export declare function getDefaultAccountState(mint: Mint): DefaultAccountState | null;

/** Get the fee for given epoch */
export declare function getEpochFee(
  transferFeeConfig: TransferFeeConfig,
  epoch: bigint,
): TransferFee;

export declare function getExtensionData(extension: ExtensionType, tlvData: Buffer): Buffer | null;

export declare function getExtensionTypes(tlvData: Buffer): ExtensionType[];

export declare function getExtraAccountMetaAddress(
  mint: PublicKey,
  programId: PublicKey,
): PublicKey;

/** Unpack an extra account metas account and parse the data into a list of ExtraAccountMetas */
export declare function getExtraAccountMetas(account: AccountInfo<Buffer>): ExtraAccountMeta[];

export declare function getGroupMemberPointerState(mint: Mint): Partial<GroupMemberPointer> | null;

export declare function getGroupPointerState(mint: Mint): Partial<GroupPointer> | null;

export declare function getImmutableOwner(account: Account): ImmutableOwner | null;

export declare function getInterestBearingMintConfigState(
  mint: Mint,
): InterestBearingMintConfigState | null;

export declare function getMemoTransfer(account: Account): MemoTransfer | null;

export declare function getMetadataPointerState(mint: Mint): Partial<MetadataPointer> | null;

/** Get the minimum lamport balance for a base token account to be rent exempt
 *
 * @param connection Connection to use
 * @param commitment Desired level of commitment for querying the state
 *
 * @return Amount of lamports required
 */
export declare function getMinimumBalanceForRentExemptAccount(
  connection: Connection,
  commitment?: Commitment,
): Promise<number>;

/** Get the minimum lamport balance for a rent-exempt token account with extensions
 *
 * @param connection Connection to use
 * @param commitment Desired level of commitment for querying the state
 *
 * @return Amount of lamports required
 */
export declare function getMinimumBalanceForRentExemptAccountWithExtensions(
  connection: Connection,
  extensions: ExtensionType[],
  commitment?: Commitment,
): Promise<number>;

/** Get the minimum lamport balance for a mint to be rent exempt
 *
 * @param connection Connection to use
 * @param commitment Desired level of commitment for querying the state
 *
 * @return Amount of lamports required
 */
export declare function getMinimumBalanceForRentExemptMint(
  connection: Connection,
  commitment?: Commitment,
): Promise<number>;

/** Get the minimum lamport balance for a rent-exempt mint with extensions
 *
 * @param connection Connection to use
 * @param extensions Extension types included in the mint
 * @param commitment Desired level of commitment for querying the state
 *
 * @return Amount of lamports required
 */
export declare function getMinimumBalanceForRentExemptMintWithExtensions(
  connection: Connection,
  extensions: ExtensionType[],
  commitment?: Commitment,
): Promise<number>;

/** Get the minimum lamport balance for a multisig to be rent exempt
 *
 * @param connection Connection to use
 * @param commitment Desired level of commitment for querying the state
 *
 * @return Amount of lamports required
 */
export declare function getMinimumBalanceForRentExemptMultisig(
  connection: Connection,
  commitment?: Commitment,
): Promise<number>;

/**
 * Retrieve information about a mint
 *
 * @param connection Connection to use
 * @param address    Mint account
 * @param commitment Desired level of commitment for querying the state
 * @param programId  SPL Token program account
 *
 * @return Mint information
 */
export declare function getMint(
  connection: Connection,
  address: PublicKey,
  commitment?: Commitment,
  programId?: PublicKey,
): Promise<Mint>;

export declare function getMintCloseAuthority(mint: Mint): MintCloseAuthority | null;

export declare function getMintLen(
  extensionTypes: ExtensionType[],
  variableLengthExtensions?: {
    [E in ExtensionType]?: number;
  },
): number;

/**
 * Retrieve information about multiple token accounts in a single RPC call
 *
 * @param connection Connection to use
 * @param addresses  Token accounts
 * @param commitment Desired level of commitment for querying the state
 * @param programId  SPL Token program account
 *
 * @return Token account information
 */
export declare function getMultipleAccounts(
  connection: Connection,
  addresses: PublicKey[],
  commitment?: Commitment,
  programId?: PublicKey,
): Promise<Account[]>;

/**
 * Retrieve information about a multisig
 *
 * @param connection Connection to use
 * @param address    Multisig account
 * @param commitment Desired level of commitment for querying the state
 * @param programId  SPL Token program account
 *
 * @return Multisig information
 */
export declare function getMultisig(
  connection: Connection,
  address: PublicKey,
  commitment?: Commitment,
  programId?: PublicKey,
): Promise<Multisig>;

export declare function getNewAccountLenForExtensionLen(
  info: AccountInfo<Buffer>,
  address: PublicKey,
  extensionType: ExtensionType,
  extensionLen: number,
  programId?: PublicKey,
): number;

export declare function getNonTransferable(mint: Mint): NonTransferable | null;

export declare function getNonTransferableAccount(account: Account): NonTransferableAccount | null;

/**
 * Retrieve the associated token account, or create it if it doesn't exist
 *
 * @param connection               Connection to use
 * @param payer                    Payer of the transaction and initialization fees
 * @param mint                     Mint associated with the account to set or verify
 * @param owner                    Owner of the account to set or verify
 * @param allowOwnerOffCurve       Allow the owner account to be a PDA (Program Derived Address)
 * @param commitment               Desired level of commitment for querying the state
 * @param confirmOptions           Options for confirming the transaction
 * @param programId                SPL Token program account
 * @param associatedTokenProgramId SPL Associated Token program account
 *
 * @return Address of the new associated token account
 */
export declare function getOrCreateAssociatedTokenAccount(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve?: boolean,
  commitment?: Commitment,
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
  associatedTokenProgramId?: PublicKey,
): Promise<Account>;

export declare function getPausableAccount(account: Account): PausableAccount | null;

export declare function getPausableConfig(mint: Mint): PausableConfig | null;

export declare function getPermanentDelegate(mint: Mint): PermanentDelegate | null;

export declare function getScaledUiAmountConfig(mint: Mint): ScaledUiAmountConfig | null;

export declare function getTokenGroupMemberState(mint: Mint): Partial<TokenGroupMember> | null;

export declare function getTokenGroupState(mint: Mint): Partial<TokenGroup> | null;

/**
 * Retrieve Token Metadata Information
 *
 * @param connection Connection to use
 * @param address    Mint account
 * @param commitment Desired level of commitment for querying the state
 * @param programId  SPL Token program account
 *
 * @return Token Metadata information
 */
export declare function getTokenMetadata(
  connection: Connection,
  address: PublicKey,
  commitment?: Commitment,
  programId?: PublicKey,
): Promise<TokenMetadata | null>;

export declare function getTransferFeeAmount(account: Account): TransferFeeAmount | null;

export declare function getTransferFeeConfig(mint: Mint): TransferFeeConfig | null;

export declare function getTransferHook(mint: Mint): TransferHook | null;

export declare function getTransferHookAccount(account: Account): TransferHookAccount | null;

export declare function getTypeLen(e: ExtensionType): number;

export declare const GROUP_MEMBER_POINTER_SIZE: number;

export declare const GROUP_POINTER_SIZE: number;

/** GroupMemberPointer as stored by the program */
export declare interface GroupMemberPointer {
  /** Optional authority that can set the member address */
  authority: PublicKey | null;
  /** Optional account address that holds the member */
  memberAddress: PublicKey | null;
}

export declare enum GroupMemberPointerInstruction {
  Initialize = 0,
  Update = 1,
}

/** Buffer layout for de/serializing a Group Pointer extension */
export declare const GroupMemberPointerLayout: Structure<{
  authority: PublicKey;
  memberAddress: PublicKey;
}>;

/** GroupPointer as stored by the program */
export declare interface GroupPointer {
  /** Optional authority that can set the group address */
  authority: PublicKey | null;
  /** Optional account address that holds the group */
  groupAddress: PublicKey | null;
}

export declare enum GroupPointerInstruction {
  Initialize = 0,
  Update = 1,
}

/** Buffer layout for de/serializing a GroupPointer extension */
export declare const GroupPointerLayout: Structure<{
  authority: PublicKey;
  groupAddress: PublicKey;
}>;

/**
 * Harvest withheld tokens from accounts to the mint
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param mint           The token mint
 * @param sources        Source accounts from which to withdraw withheld fees
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function harvestWithheldTokensToMint(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  sources: PublicKey[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

export declare interface HarvestWithheldTokensToMintInstructionData {
  instruction: TokenInstruction.TransferFeeExtension;
  transferFeeInstruction: TransferFeeInstruction.HarvestWithheldTokensToMint;
}

export declare const harvestWithheldTokensToMintInstructionData: Structure<HarvestWithheldTokensToMintInstructionData>;

export declare const IMMUTABLE_OWNER_SIZE: number;

/** ImmutableOwner as stored by the program */
export declare type ImmutableOwner = {};

/** Buffer layout for de/serializing an account */
export declare const ImmutableOwnerLayout: Structure<ImmutableOwner>;

export declare interface InitializeAccount2InstructionData {
  instruction: TokenInstruction.InitializeAccount2;
  owner: PublicKey;
}

export declare const initializeAccount2InstructionData: Structure<InitializeAccount2InstructionData>;

export declare interface InitializeAccount3InstructionData {
  instruction: TokenInstruction.InitializeAccount3;
  owner: PublicKey;
}

export declare const initializeAccount3InstructionData: Structure<InitializeAccount3InstructionData>;

/** TODO: docs */
export declare interface InitializeAccountInstructionData {
  instruction: TokenInstruction.InitializeAccount;
}

/** TODO: docs */
export declare const initializeAccountInstructionData: Structure<InitializeAccountInstructionData>;

/**
 * Initialize a default account state on a mint
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param mint        Mint to initialize with extension
 * @param state        Account state with which to initialize new accounts
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function initializeDefaultAccountState(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  state: AccountState,
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

export declare const initializeGroupMemberPointerData: Structure<{
  instruction: TokenInstruction.GroupMemberPointerExtension;
  groupMemberPointerInstruction: number;
  authority: PublicKey;
  memberAddress: PublicKey;
}>;

export declare const initializeGroupPointerData: Structure<{
  instruction: TokenInstruction.GroupPointerExtension;
  groupPointerInstruction: number;
  authority: PublicKey;
  groupAddress: PublicKey;
}>;

/** Deserialized instruction for the initiation of an immutable owner account */
export declare interface InitializeImmutableOwnerInstructionData {
  instruction: TokenInstruction.InitializeImmutableOwner;
}

/** The struct that represents the instruction data as it is read by the program */
export declare const initializeImmutableOwnerInstructionData: Structure<InitializeImmutableOwnerInstructionData>;

export declare const initializeMetadataPointerData: Structure<{
  instruction: TokenInstruction.MetadataPointerExtension;
  metadataPointerInstruction: number;
  authority: PublicKey;
  metadataAddress: PublicKey;
}>;

/** TODO: docs */
export declare interface InitializeMint2InstructionData {
  instruction: TokenInstruction.InitializeMint2;
  decimals: number;
  mintAuthority: PublicKey;
  freezeAuthority: PublicKey | null;
}

/** TODO: docs */
export declare const initializeMint2InstructionData: Structure<InitializeMint2InstructionData>;

/** TODO: docs */
export declare interface InitializeMintCloseAuthorityInstructionData {
  instruction: TokenInstruction.InitializeMintCloseAuthority;
  closeAuthority: PublicKey | null;
}

/** TODO: docs */
export declare const initializeMintCloseAuthorityInstructionData: Structure<InitializeMintCloseAuthorityInstructionData>;

/** TODO: docs */
export declare interface InitializeMintInstructionData {
  instruction: TokenInstruction.InitializeMint;
  decimals: number;
  mintAuthority: PublicKey;
  freezeAuthority: PublicKey | null;
}

/** TODO: docs */
export declare const initializeMintInstructionData: Structure<InitializeMintInstructionData>;

/** TODO: docs */
export declare interface InitializeMultisigInstructionData {
  instruction: TokenInstruction.InitializeMultisig;
  m: number;
}

/** TODO: docs */
export declare const initializeMultisigInstructionData: Structure<InitializeMultisigInstructionData>;

/** Deserialized instruction for the initiation of an immutable owner account */
export declare interface InitializeNonTransferableMintInstructionData {
  instruction: TokenInstruction.InitializeNonTransferableMint;
}

/** The struct that represents the instruction data as it is read by the program */
export declare const initializeNonTransferableMintInstructionData: Structure<InitializeNonTransferableMintInstructionData>;

export declare interface InitializePausableConfigInstructionData {
  instruction: TokenInstruction.PausableExtension;
  pausableInstruction: PausableInstruction.Initialize;
  authority: PublicKey;
}

export declare const initializePausableConfigInstructionData: Structure<InitializePausableConfigInstructionData>;

/** TODO: docs */
export declare interface InitializePermanentDelegateInstructionData {
  instruction: TokenInstruction.InitializePermanentDelegate;
  delegate: PublicKey;
}

/** TODO: docs */
export declare const initializePermanentDelegateInstructionData: Structure<InitializePermanentDelegateInstructionData>;

export declare interface InitializeScaledUiAmountConfigData {
  instruction: TokenInstruction.ScaledUiAmountExtension;
  scaledUiAmountInstruction: ScaledUiAmountInstruction.Initialize;
  authority: PublicKey | null;
  multiplier: number;
}

export declare const initializeScaledUiAmountConfigInstructionData: Structure<InitializeScaledUiAmountConfigData>;

/** TODO: docs */
export declare interface InitializeTransferFeeConfigInstructionData {
  instruction: TokenInstruction.TransferFeeExtension;
  transferFeeInstruction: TransferFeeInstruction.InitializeTransferFeeConfig;
  transferFeeConfigAuthority: PublicKey | null;
  withdrawWithheldAuthority: PublicKey | null;
  transferFeeBasisPoints: number;
  maximumFee: bigint;
}

/** TODO: docs */
export declare const initializeTransferFeeConfigInstructionData: Structure<InitializeTransferFeeConfigInstructionData>;

/**
 * Initialize a transfer hook on a mint
 *
 * @param connection            Connection to use
 * @param payer                 Payer of the transaction fees
 * @param mint                  Mint to initialize with extension
 * @param authority             Transfer hook authority account
 * @param transferHookProgramId The transfer hook program account
 * @param confirmOptions        Options for confirming the transaction
 * @param programId             SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function initializeTransferHook(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  authority: PublicKey,
  transferHookProgramId: PublicKey,
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/** Deserialized instruction for the initiation of an transfer hook */
export declare interface InitializeTransferHookInstructionData {
  instruction: TokenInstruction.TransferHookExtension;
  transferHookInstruction: TransferHookInstruction.Initialize;
  authority: PublicKey;
  transferHookProgramId: PublicKey;
}

/** The struct that represents the instruction data as it is read by the program */
export declare const initializeTransferHookInstructionData: Structure<InitializeTransferHookInstructionData>;

export declare const INTEREST_BEARING_MINT_CONFIG_STATE_SIZE: number;

export declare interface InterestBearingMintConfigState {
  rateAuthority: PublicKey;
  initializationTimestamp: bigint;
  preUpdateAverageRate: number;
  lastUpdateTimestamp: bigint;
  currentRate: number;
}

export declare const InterestBearingMintConfigStateLayout: Structure<InterestBearingMintConfigState>;

export declare interface InterestBearingMintInitializeInstructionData {
  instruction: TokenInstruction.InterestBearingMintExtension;
  interestBearingMintInstruction: InterestBearingMintInstruction.Initialize;
  rateAuthority: PublicKey;
  rate: number;
}

export declare const interestBearingMintInitializeInstructionData: Structure<InterestBearingMintInitializeInstructionData>;

export declare enum InterestBearingMintInstruction {
  Initialize = 0,
  UpdateRate = 1,
}

export declare interface InterestBearingMintUpdateRateInstructionData {
  instruction: TokenInstruction.InterestBearingMintExtension;
  interestBearingMintInstruction: InterestBearingMintInstruction.UpdateRate;
  rate: number;
}

export declare const interestBearingMintUpdateRateInstructionData: Structure<InterestBearingMintUpdateRateInstructionData>;

export declare function isAccountExtension(e: ExtensionType): boolean;

/** TODO: docs */
export declare function isAmountToUiAmountInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedAmountToUiAmountInstruction;

/** TODO: docs */
export declare function isApproveCheckedInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedApproveCheckedInstruction;

/** TODO: docs */
export declare function isApproveInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedApproveInstruction;

/** TODO: docs */
export declare function isBurnCheckedInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedBurnCheckedInstruction;

/** TODO: docs */
export declare function isBurnInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedBurnInstruction;

/** TODO: docs */
export declare function isCloseAccountInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedCloseAccountInstruction;

/** TODO: docs */
export declare function isFreezeAccountInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedFreezeAccountInstruction;

/** TODO: docs */
export declare function isInitializeAccount2Instruction(
  decoded: DecodedInstruction,
): decoded is DecodedInitializeAccount2Instruction;

/** TODO: docs */
export declare function isInitializeAccount3Instruction(
  decoded: DecodedInstruction,
): decoded is DecodedInitializeAccount3Instruction;

/** TODO: docs */
export declare function isInitializeAccountInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedInitializeAccountInstruction;

/** TODO: docs, implement */
/** TODO: docs */
export declare function isInitializeMint2Instruction(
  decoded: DecodedInstruction,
): decoded is DecodedInitializeMint2Instruction;

/** TODO: docs */
export declare function isInitializeMintInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedInitializeMintInstruction;

/** TODO: docs */
export declare function isInitializeMultisigInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedInitializeMultisigInstruction;

export declare function isMintExtension(e: ExtensionType): boolean;

/** TODO: docs */
export declare function isMintToCheckedInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedMintToCheckedInstruction;

/** TODO: docs */
export declare function isMintToInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedMintToInstruction;

/** TODO: docs */
export declare function isRevokeInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedRevokeInstruction;

/** TODO: docs */
export declare function isSetAuthorityInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedSetAuthorityInstruction;

/** TODO: docs */
export declare function isSyncNativeInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedSyncNativeInstruction;

/** TODO: docs */
export declare function isThawAccountInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedThawAccountInstruction;

/** TODO: docs */
export declare function isTransferCheckedInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedTransferCheckedInstruction;

/** TODO: docs */
export declare function isTransferInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedTransferInstruction;

/** TODO: docs */
export declare function isUiamountToAmountInstruction(
  decoded: DecodedInstruction,
): decoded is DecodedUiAmountToAmountInstruction;

export declare const LENGTH_SIZE = 2;

export declare const MAX_FEE_BASIS_POINTS = 10000;

export declare const MEMO_TRANSFER_SIZE: number;

/** MemoTransfer as stored by the program */
export declare interface MemoTransfer {
  /** Require transfers into this account to be accompanied by a memo */
  requireIncomingTransferMemos: boolean;
}

export declare enum MemoTransferInstruction {
  Enable = 0,
  Disable = 1,
}

/** TODO: docs */
export declare interface MemoTransferInstructionData {
  instruction: TokenInstruction.MemoTransferExtension;
  memoTransferInstruction: MemoTransferInstruction;
}

/** TODO: docs */
export declare const memoTransferInstructionData: Structure<MemoTransferInstructionData>;

/** Buffer layout for de/serializing a memo transfer extension */
export declare const MemoTransferLayout: Structure<MemoTransfer>;

export declare const METADATA_POINTER_SIZE: number;

/** MetadataPointer as stored by the program */
export declare interface MetadataPointer {
  /** Optional authority that can set the metadata address */
  authority: PublicKey | null;
  /** Optional Account Address that holds the metadata */
  metadataAddress: PublicKey | null;
}

export declare enum MetadataPointerInstruction {
  Initialize = 0,
  Update = 1,
}

/** Buffer layout for de/serializing a Metadata Pointer extension */
export declare const MetadataPointerLayout: Structure<{
  authority: PublicKey;
  metadataAddress: PublicKey;
}>;

/** Information about a mint */
export declare interface Mint {
  /** Address of the mint */
  address: PublicKey;
  /**
   * Optional authority used to mint new tokens. The mint authority may only be provided during mint creation.
   * If no mint authority is present then the mint has a fixed supply and no further tokens may be minted.
   */
  mintAuthority: PublicKey | null;
  /** Total supply of tokens */
  supply: bigint;
  /** Number of base 10 digits to the right of the decimal place */
  decimals: number;
  /** Is this mint initialized */
  isInitialized: boolean;
  /** Optional authority to freeze token accounts */
  freezeAuthority: PublicKey | null;
  /** Additional data for extension */
  tlvData: Buffer;
}

export declare const MINT_CLOSE_AUTHORITY_SIZE: number;

/** Byte length of a mint */
export declare const MINT_SIZE: number;

/** MintCloseAuthority as stored by the program */
export declare interface MintCloseAuthority {
  closeAuthority: PublicKey;
}

/** Buffer layout for de/serializing a mint */
export declare const MintCloseAuthorityLayout: Structure<MintCloseAuthority>;

/** Buffer layout for de/serializing a mint */
export declare const MintLayout: Structure<RawMint>;

/**
 * Mint tokens to an account
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param mint           Mint for the account
 * @param destination    Address of the account to mint to
 * @param authority      Minting authority
 * @param amount         Amount to mint
 * @param multiSigners   Signing accounts if `authority` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function mintTo(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  destination: PublicKey,
  authority: Signer | PublicKey,
  amount: number | bigint,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/**
 * Mint tokens to an account, asserting the token mint and decimals
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param mint           Mint for the account
 * @param destination    Address of the account to mint to
 * @param authority      Minting authority
 * @param amount         Amount to mint
 * @param decimals       Number of decimals in amount to mint
 * @param multiSigners   Signing accounts if `authority` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function mintToChecked(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  destination: PublicKey,
  authority: Signer | PublicKey,
  amount: number | bigint,
  decimals: number,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/** TODO: docs */
export declare interface MintToCheckedInstructionData {
  instruction: TokenInstruction.MintToChecked;
  amount: bigint;
  decimals: number;
}

/** TODO: docs */
export declare const mintToCheckedInstructionData: Structure<MintToCheckedInstructionData>;

/** TODO: docs */
export declare interface MintToInstructionData {
  instruction: TokenInstruction.MintTo;
  amount: bigint;
}

/** TODO: docs */
export declare const mintToInstructionData: Structure<MintToInstructionData>;

/** Information about a multisig */
export declare interface Multisig {
  /** Address of the multisig */
  address: PublicKey;
  /** Number of signers required */
  m: number;
  /** Number of possible signers, corresponds to the number of `signers` that are valid */
  n: number;
  /** Is this mint initialized */
  isInitialized: boolean;
  /** Full set of signers, of which `n` are valid */
  signer1: PublicKey;
  signer2: PublicKey;
  signer3: PublicKey;
  signer4: PublicKey;
  signer5: PublicKey;
  signer6: PublicKey;
  signer7: PublicKey;
  signer8: PublicKey;
  signer9: PublicKey;
  signer10: PublicKey;
  signer11: PublicKey;
}

/** Byte length of a multisig */
export declare const MULTISIG_SIZE: number;

/** Buffer layout for de/serializing a multisig */
export declare const MultisigLayout: Structure<RawMultisig>;

/** Address of the special mint for wrapped native SOL in spl-token */
export declare const NATIVE_MINT: PublicKey;

/** Address of the special mint for wrapped native SOL in spl-token-2022 */
export declare const NATIVE_MINT_2022: PublicKey;

export declare const NON_TRANSFERABLE_ACCOUNT_SIZE: number;

export declare const NON_TRANSFERABLE_SIZE: number;

/** Non-transferable mint state as stored by the program */
export declare type NonTransferable = {};

/** Non-transferable token account state as stored by the program */
export declare type NonTransferableAccount = {};

/** Buffer layout for de/serializing an account */
export declare const NonTransferableLayout: Structure<NonTransferable>;

export declare const ONE_IN_BASIS_POINTS: bigint;

export declare const PAUSABLE_ACCOUNT_SIZE: number;

export declare const PAUSABLE_CONFIG_SIZE: number;

/** Pausable token account state as stored by the program */
export declare type PausableAccount = {};

/** Buffer layout for de/serializing a pausable account */
export declare const PausableAccountLayout: Structure<PausableAccount>;

/** PausableConfig as stored by the program */
export declare interface PausableConfig {
  /** Authority that can pause or resume activity on the mint */
  authority: PublicKey;
  /** Whether minting / transferring / burning tokens is paused */
  paused: boolean;
}

/** Buffer layout for de/serializing a pausable config */
export declare const PausableConfigLayout: Structure<PausableConfig>;

export declare enum PausableInstruction {
  Initialize = 0,
  Pause = 1,
  Resume = 2,
}

/**
 * Pause a pausable mint
 *
 * @param connection      Connection to use
 * @param payer           Payer of the transaction fees
 * @param mint            Public key of the mint
 * @param owner           The pausable config authority
 * @param multiSigners    Signing accounts if `owner` is a multisig
 * @param confirmOptions  Options for confirming the transaction
 * @param programId       SPL Token program account
 *
 * @return Public key of the mint
 */
export declare function pause(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  owner: Signer | PublicKey,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

export declare interface PauseInstructionData {
  instruction: TokenInstruction.PausableExtension;
  pausableInstruction: PausableInstruction.Pause;
}

export declare const pauseInstructionData: Structure<PauseInstructionData>;

export declare const PERMANENT_DELEGATE_SIZE: number;

/** PermanentDelegate as stored by the program */
export declare interface PermanentDelegate {
  delegate: PublicKey;
}

/** Buffer layout for de/serializing a mint */
export declare const PermanentDelegateLayout: Structure<PermanentDelegate>;

/** Check that the token program provided is not `Tokenkeg...`, useful when using extensions */
export declare function programSupportsExtensions(programId: PublicKey): boolean;

/** Token account as stored by the program */
export declare interface RawAccount {
  mint: PublicKey;
  owner: PublicKey;
  amount: bigint;
  delegateOption: 1 | 0;
  delegate: PublicKey;
  state: AccountState;
  isNativeOption: 1 | 0;
  isNative: bigint;
  delegatedAmount: bigint;
  closeAuthorityOption: 1 | 0;
  closeAuthority: PublicKey;
}

/** Mint as stored by the program */
export declare interface RawMint {
  mintAuthorityOption: 1 | 0;
  mintAuthority: PublicKey;
  supply: bigint;
  decimals: number;
  isInitialized: boolean;
  freezeAuthorityOption: 1 | 0;
  freezeAuthority: PublicKey;
}

/** Multisig as stored by the program */
export declare type RawMultisig = Omit<Multisig, "address">;

/** TODO: docs */
export declare interface ReallocateInstructionData {
  instruction: TokenInstruction.Reallocate;
  extensionTypes: ExtensionType[];
}

/**
 * Recover funds funds in an associated token account which is owned by an associated token account
 *
 * @param connection               Connection to use
 * @param payer                    Payer of the transaction and initialization fees
 * @param owner                    Owner of original ATA
 * @param mint                     Mint for the original ATA
 * @param nestedMint               Mint for the nested ATA
 * @param confirmOptions           Options for confirming the transaction
 * @param programId                SPL Token program account
 * @param associatedTokenProgramId SPL Associated Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function recoverNested(
  connection: Connection,
  payer: Signer,
  owner: Signer,
  mint: PublicKey,
  nestedMint: PublicKey,
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
  associatedTokenProgramId?: PublicKey,
): Promise<TransactionSignature>;

/** Take an ExtraAccountMeta and construct that into an actual AccountMeta */
export declare function resolveExtraAccountMeta(
  connection: Connection,
  extraMeta: ExtraAccountMeta,
  previousMetas: AccountMeta[],
  instructionData: Buffer,
  transferHookProgramId: PublicKey,
): Promise<AccountMeta>;

/**
 * Resume a pausable mint
 *
 * @param connection      Connection to use
 * @param payer           Payer of the transaction fees
 * @param mint            Public key of the mint
 * @param owner           The pausable config authority
 * @param multiSigners    Signing accounts if `owner` is a multisig
 * @param confirmOptions  Options for confirming the transaction
 * @param programId       SPL Token program account
 *
 * @return Public key of the mint
 */
export declare function resume(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  owner: Signer | PublicKey,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

export declare interface ResumeInstructionData {
  instruction: TokenInstruction.PausableExtension;
  pausableInstruction: PausableInstruction.Resume;
}

export declare const resumeInstructionData: Structure<ResumeInstructionData>;

/**
 * Revoke approval for the transfer of tokens from an account
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param account        Address of the token account
 * @param owner          Owner of the account
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function revoke(
  connection: Connection,
  payer: Signer,
  account: PublicKey,
  owner: Signer | PublicKey,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/** TODO: docs */
export declare interface RevokeInstructionData {
  instruction: TokenInstruction.Revoke;
}

/** TODO: docs */
export declare const revokeInstructionData: Structure<RevokeInstructionData>;

export declare const SCALED_UI_AMOUNT_CONFIG_SIZE: number;

export declare interface ScaledUiAmountConfig {
  authority: PublicKey;
  multiplier: number;
  newMultiplierEffectiveTimestamp: bigint;
  newMultiplier: number;
}

export declare const ScaledUiAmountConfigLayout: Structure<ScaledUiAmountConfig>;

export declare enum ScaledUiAmountInstruction {
  Initialize = 0,
  UpdateMultiplier = 1,
}

/**
 * Assign a new authority to the account
 *
 * @param connection       Connection to use
 * @param payer            Payer of the transaction fees
 * @param account          Address of the account
 * @param currentAuthority Current authority of the specified type
 * @param authorityType    Type of authority to set
 * @param newAuthority     New authority of the account
 * @param multiSigners     Signing accounts if `currentAuthority` is a multisig
 * @param confirmOptions   Options for confirming the transaction
 * @param programId        SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function setAuthority(
  connection: Connection,
  payer: Signer,
  account: PublicKey,
  currentAuthority: Signer | PublicKey,
  authorityType: AuthorityType,
  newAuthority: PublicKey | null,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/** TODO: docs */
export declare interface SetAuthorityInstructionData {
  instruction: TokenInstruction.SetAuthority;
  authorityType: AuthorityType;
  newAuthority: PublicKey | null;
}

/** TODO: docs */
export declare const setAuthorityInstructionData: Structure<SetAuthorityInstructionData>;

/**
 * Update transfer fee and maximum fee
 *
 * @param connection                Connection to use
 * @param payer                     Payer of the transaction fees
 * @param mint                      The token mint
 * @param authority                 The authority of the transfer fee
 * @param multiSigners              Signing accounts if `owner` is a multisig
 * @param transferFeeBasisPoints    Amount of transfer collected as fees, expressed as basis points of the transfer amount
 * @param maximumFee                Maximum fee assessed on transfers
 * @param confirmOptions            Options for confirming the transaction
 * @param programId                 SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function setTransferFee(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  authority: Signer | PublicKey,
  multiSigners: Signer[],
  transferFeeBasisPoints: number,
  maximumFee: bigint,
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

export declare interface SetTransferFeeInstructionData {
  instruction: TokenInstruction.TransferFeeExtension;
  transferFeeInstruction: TransferFeeInstruction.SetTransferFee;
  transferFeeBasisPoints: number;
  maximumFee: bigint;
}

export declare const setTransferFeeInstructionData: Structure<SetTransferFeeInstructionData>;

/**
 * Sync the balance of a native SPL token account to the underlying system account's lamports
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param account        Native account to sync
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function syncNative(
  connection: Connection,
  payer: Signer,
  account: PublicKey,
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/** TODO: docs */
export declare interface SyncNativeInstructionData {
  instruction: TokenInstruction.SyncNative;
}

/** TODO: docs */
export declare const syncNativeInstructionData: Structure<SyncNativeInstructionData>;

/**
 * Thaw (unfreeze) a token account
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param account        Account to thaw
 * @param mint           Mint for the account
 * @param authority      Mint freeze authority
 * @param multiSigners   Signing accounts if `authority` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function thawAccount(
  connection: Connection,
  payer: Signer,
  account: PublicKey,
  mint: PublicKey,
  authority: Signer | PublicKey,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/** TODO: docs */
export declare interface ThawAccountInstructionData {
  instruction: TokenInstruction.ThawAccount;
}

/** TODO: docs */
export declare const thawAccountInstructionData: Structure<ThawAccountInstructionData>;

/** Address of the SPL Token 2022 program */
export declare const TOKEN_2022_PROGRAM_ID: PublicKey;

export { TOKEN_GROUP_MEMBER_SIZE, TOKEN_GROUP_SIZE };

/** Address of the SPL Token program */
export declare const TOKEN_PROGRAM_ID: PublicKey;

/** Thrown if an account is not found at the expected address */
export declare class TokenAccountNotFoundError extends TokenError {
  name: string;
}

/** Base class for errors */
export declare abstract class TokenError extends Error {
  constructor(message?: string);
}

/**
 * Initialize a new `Group`
 *
 * Assumes one has already initialized a mint for the group.
 *
 * @param connection       Connection to use
 * @param payer            Payer of the transaction fee
 * @param mint             Group mint
 * @param mintAuthority    Group mint authority
 * @param updateAuthority  Group update authority
 * @param maxSize          Maximum number of members in the group
 * @param multiSigners     Signing accounts if `authority` is a multisig
 * @param confirmOptions   Options for confirming the transaction
 * @param programId        SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function tokenGroupInitializeGroup(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  mintAuthority: PublicKey | Signer,
  updateAuthority: PublicKey | null,
  maxSize: bigint,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/**
 * Initialize a new `Group` with rent transfer.
 *
 * Assumes one has already initialized a mint for the group.
 *
 * @param connection       Connection to use
 * @param payer            Payer of the transaction fee
 * @param mint             Group mint
 * @param mintAuthority    Group mint authority
 * @param updateAuthority  Group update authority
 * @param maxSize          Maximum number of members in the group
 * @param multiSigners     Signing accounts if `authority` is a multisig
 * @param confirmOptions   Options for confirming the transaction
 * @param programId        SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function tokenGroupInitializeGroupWithRentTransfer(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  mintAuthority: PublicKey | Signer,
  updateAuthority: PublicKey | null,
  maxSize: bigint,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/**
 * Initialize a new `Member` of a `Group`
 *
 * Assumes the `Group` has already been initialized,
 * as well as the mint for the member.
 *
 * @param connection             Connection to use
 * @param payer                  Payer of the transaction fee
 * @param mint                   Member mint
 * @param mintAuthority          Member mint authority
 * @param group                  Group mint
 * @param groupUpdateAuthority   Group update authority
 * @param multiSigners           Signing accounts if `authority` is a multisig
 * @param confirmOptions         Options for confirming the transaction
 * @param programId              SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function tokenGroupMemberInitialize(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  mintAuthority: PublicKey | Signer,
  group: PublicKey,
  groupUpdateAuthority: PublicKey,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/**
 * Initialize a new `Member` of a `Group` with rent transfer.
 *
 * Assumes the `Group` has already been initialized,
 * as well as the mint for the member.
 *
 * @param connection             Connection to use
 * @param payer                  Payer of the transaction fee
 * @param mint                   Member mint
 * @param mintAuthority          Member mint authority
 * @param group                  Group mint
 * @param groupUpdateAuthority   Group update authority
 * @param multiSigners           Signing accounts if `authority` is a multisig
 * @param confirmOptions         Options for confirming the transaction
 * @param programId              SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function tokenGroupMemberInitializeWithRentTransfer(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  mintAuthority: PublicKey | Signer,
  group: PublicKey,
  groupUpdateAuthority: PublicKey,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/**
 * Update the authority of a `Group`
 *
 * @param connection       Connection to use
 * @param payer            Payer of the transaction fee
 * @param mint             Group mint
 * @param updateAuthority  Group update authority
 * @param newAuthority     New authority for the token group, or unset
 * @param multiSigners     Signing accounts if `authority` is a multisig
 * @param confirmOptions   Options for confirming the transaction
 * @param programId        SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function tokenGroupUpdateGroupAuthority(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  updateAuthority: PublicKey | Signer,
  newAuthority: PublicKey | null,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/**
 * Update the max size of a `Group`
 *
 * @param connection       Connection to use
 * @param payer            Payer of the transaction fee
 * @param mint             Group mint
 * @param updateAuthority  Group update authority
 * @param maxSize          Maximum number of members in the group
 * @param multiSigners     Signing accounts if `authority` is a multisig
 * @param confirmOptions   Options for confirming the transaction
 * @param programId        SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function tokenGroupUpdateGroupMaxSize(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  updateAuthority: PublicKey | Signer,
  maxSize: bigint,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/** Instructions defined by the program */
export declare enum TokenInstruction {
  InitializeMint = 0,
  InitializeAccount = 1,
  InitializeMultisig = 2,
  Transfer = 3,
  Approve = 4,
  Revoke = 5,
  SetAuthority = 6,
  MintTo = 7,
  Burn = 8,
  CloseAccount = 9,
  FreezeAccount = 10,
  ThawAccount = 11,
  TransferChecked = 12,
  ApproveChecked = 13,
  MintToChecked = 14,
  BurnChecked = 15,
  InitializeAccount2 = 16,
  SyncNative = 17,
  InitializeAccount3 = 18,
  InitializeMultisig2 = 19,
  InitializeMint2 = 20,
  GetAccountDataSize = 21,
  InitializeImmutableOwner = 22,
  AmountToUiAmount = 23,
  UiAmountToAmount = 24,
  InitializeMintCloseAuthority = 25,
  TransferFeeExtension = 26,
  ConfidentialTransferExtension = 27,
  DefaultAccountStateExtension = 28,
  Reallocate = 29,
  MemoTransferExtension = 30,
  CreateNativeMint = 31,
  InitializeNonTransferableMint = 32,
  InterestBearingMintExtension = 33,
  CpiGuardExtension = 34,
  InitializePermanentDelegate = 35,
  TransferHookExtension = 36,
  MetadataPointerExtension = 39,
  GroupPointerExtension = 40,
  GroupMemberPointerExtension = 41,
  ScaledUiAmountExtension = 43,
  PausableExtension = 44,
}

/** Thrown if a program state account does not contain valid data */
export declare class TokenInvalidAccountDataError extends TokenError {
  name: string;
}

/** Thrown if a program state account is not a valid Account */
export declare class TokenInvalidAccountError extends TokenError {
  name: string;
}

/** Thrown if a program state account is not owned by the expected token program */
export declare class TokenInvalidAccountOwnerError extends TokenError {
  name: string;
}

/** Thrown if the byte length of an program state account doesn't match the expected size */
export declare class TokenInvalidAccountSizeError extends TokenError {
  name: string;
}

/** Thrown if an instruction's data is invalid */
export declare class TokenInvalidInstructionDataError extends TokenError {
  name: string;
}

/** Thrown if an instruction's keys are invalid */
export declare class TokenInvalidInstructionKeysError extends TokenError {
  name: string;
}

/** Thrown if an instruction's program is invalid */
export declare class TokenInvalidInstructionProgramError extends TokenError {
  name: string;
}

/** Thrown if an instruction's type is invalid */
export declare class TokenInvalidInstructionTypeError extends TokenError {
  name: string;
}

/** Thrown if the mint of a token account doesn't match the expected mint */
export declare class TokenInvalidMintError extends TokenError {
  name: string;
}

/** Thrown if the owner of a token account doesn't match the expected owner */
export declare class TokenInvalidOwnerError extends TokenError {
  name: string;
}

/**
 * Initializes a TLV entry with the basic token-metadata fields.
 *
 * @param connection       Connection to use
 * @param payer            Payer of the transaction fees
 * @param mint             Mint Account
 * @param updateAuthority  Update Authority
 * @param mintAuthority    Mint Authority
 * @param name             Longer name of token
 * @param symbol           Shortened symbol of token
 * @param uri              URI pointing to more metadata (image, video, etc)
 * @param multiSigners     Signing accounts if `authority` is a multisig
 * @param confirmOptions   Options for confirming the transaction
 * @param programId        SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function tokenMetadataInitialize(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  updateAuthority: PublicKey,
  mintAuthority: PublicKey | Signer,
  name: string,
  symbol: string,
  uri: string,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/**
 * Initializes a TLV entry with the basic token-metadata fields,
 * Includes a transfer for any additional rent-exempt SOL if required.
 *
 * @param connection       Connection to use
 * @param payer            Payer of the transaction fees
 * @param mint             Mint Account
 * @param updateAuthority  Update Authority
 * @param mintAuthority    Mint Authority
 * @param name             Longer name of token
 * @param symbol           Shortened symbol of token
 * @param uri              URI pointing to more metadata (image, video, etc)
 * @param multiSigners     Signing accounts if `authority` is a multisig
 * @param confirmOptions   Options for confirming the transaction
 * @param programId        SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function tokenMetadataInitializeWithRentTransfer(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  updateAuthority: PublicKey,
  mintAuthority: PublicKey | Signer,
  name: string,
  symbol: string,
  uri: string,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/**
 * Remove a field in a token-metadata account.
 *
 * The field can be one of the required fields (name, symbol, URI), or a
 * totally new field denoted by a "key" string.
 * @param connection       Connection to use
 * @param payer            Payer of the transaction fees
 * @param mint             Mint Account
 * @param updateAuthority  Update Authority
 * @param key              Key to remove in the additional metadata portion
 * @param idempotent       When true, instruction will not error if the key does not exist
 * @param multiSigners     Signing accounts if `authority` is a multisig
 * @param confirmOptions   Options for confirming the transaction
 * @param programId        SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function tokenMetadataRemoveKey(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  updateAuthority: PublicKey | Signer,
  key: string,
  idempotent: boolean,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/**
 *  Update authority
 *
 * @param connection       Connection to use
 * @param payer            Payer of the transaction fees
 * @param mint             Mint Account
 * @param updateAuthority  Update Authority
 * @param newAuthority     New authority for the token metadata, or unset
 * @param multiSigners     Signing accounts if `authority` is a multisig
 * @param confirmOptions   Options for confirming the transaction
 * @param programId        SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function tokenMetadataUpdateAuthority(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  updateAuthority: PublicKey | Signer,
  newAuthority: PublicKey | null,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/**
 * Updates a field in a token-metadata account.
 * If the field does not exist on the account, it will be created.
 * If the field does exist, it will be overwritten.
 *
 * The field can be one of the required fields (name, symbol, URI), or a
 * totally new field denoted by a "key" string.
 * @param connection       Connection to use
 * @param payer            Payer of the transaction fees
 * @param mint             Mint Account
 * @param updateAuthority  Update Authority
 * @param field            Field to update in the metadata
 * @param value            Value to write for the field
 * @param multiSigners     Signing accounts if `authority` is a multisig
 * @param confirmOptions   Options for confirming the transaction
 * @param programId        SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function tokenMetadataUpdateField(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  updateAuthority: PublicKey | Signer,
  field: string | Field,
  value: string,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/**
 * Updates a field in a token-metadata account.
 * If the field does not exist on the account, it will be created.
 * If the field does exist, it will be overwritten.
 * Includes a transfer for any additional rent-exempt SOL if required.
 *
 * The field can be one of the required fields (name, symbol, URI), or a
 * totally new field denoted by a "key" string.
 * @param connection       Connection to use
 * @param payer            Payer of the transaction fees
 * @param mint             Mint Account
 * @param updateAuthority  Update Authority
 * @param field            Field to update in the metadata
 * @param value            Value to write for the field
 * @param multiSigners     Signing accounts if `authority` is a multisig
 * @param confirmOptions   Options for confirming the transaction
 * @param programId        SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function tokenMetadataUpdateFieldWithRentTransfer(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  updateAuthority: PublicKey | Signer,
  field: string | Field,
  value: string,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/** Thrown if the owner of a token account is a PDA (Program Derived Address) */
export declare class TokenOwnerOffCurveError extends TokenError {
  name: string;
}

/** Thrown if account data required by an extra account meta seed config could not be fetched */
export declare class TokenTransferHookAccountDataNotFound extends TokenError {
  name: string;
}

/** Thrown if the transfer hook extra accounts contains an invalid account index */
export declare class TokenTransferHookAccountNotFound extends TokenError {
  name: string;
}

/** Thrown if pubkey data extra accounts config is invalid */
export declare class TokenTransferHookInvalidPubkeyData extends TokenError {
  name: string;
}

/** Thrown if the transfer hook extra accounts contains an invalid seed */
export declare class TokenTransferHookInvalidSeed extends TokenError {
  name: string;
}

/** Thrown if pubkey data source is too small for a pubkey */
export declare class TokenTransferHookPubkeyDataTooSmall extends TokenError {
  name: string;
}

/** Thrown if the program does not support the desired instruction */
export declare class TokenUnsupportedInstructionError extends TokenError {
  name: string;
}

/**
 * Transfer tokens from one account to another
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param source         Source account
 * @param destination    Destination account
 * @param owner          Owner of the source account
 * @param amount         Number of tokens to transfer
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function transfer(
  connection: Connection,
  payer: Signer,
  source: PublicKey,
  destination: PublicKey,
  owner: Signer | PublicKey,
  amount: number | bigint,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

export declare const TRANSFER_FEE_AMOUNT_SIZE: number;

export declare const TRANSFER_FEE_CONFIG_SIZE: number;

export declare const TRANSFER_HOOK_ACCOUNT_SIZE: number;

export declare const TRANSFER_HOOK_SIZE: number;

/**
 * Transfer tokens from one account to another, asserting the token mint and decimals
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param source         Source account
 * @param mint           Mint for the account
 * @param destination    Destination account
 * @param owner          Owner of the source account
 * @param amount         Number of tokens to transfer
 * @param decimals       Number of decimals in transfer amount
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function transferChecked(
  connection: Connection,
  payer: Signer,
  source: PublicKey,
  mint: PublicKey,
  destination: PublicKey,
  owner: Signer | PublicKey,
  amount: number | bigint,
  decimals: number,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/** TODO: docs */
export declare interface TransferCheckedInstructionData {
  instruction: TokenInstruction.TransferChecked;
  amount: bigint;
  decimals: number;
}

/** TODO: docs */
export declare const transferCheckedInstructionData: Structure<TransferCheckedInstructionData>;

/**
 * Transfer tokens from one account to another, asserting the transfer fee, token mint, and decimals
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param source         Source account
 * @param mint           Mint for the account
 * @param destination    Destination account
 * @param owner          Owner of the source account
 * @param amount         Number of tokens to transfer
 * @param decimals       Number of decimals in transfer amount
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function transferCheckedWithFee(
  connection: Connection,
  payer: Signer,
  source: PublicKey,
  mint: PublicKey,
  destination: PublicKey,
  owner: Signer | PublicKey,
  amount: bigint,
  decimals: number,
  fee: bigint,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/**
 * Transfer tokens from one account to another, asserting the transfer fee, token mint, and decimals
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param source         Source account
 * @param mint           Mint for the account
 * @param destination    Destination account
 * @param authority      Authority of the source account
 * @param amount         Number of tokens to transfer
 * @param decimals       Number of decimals in transfer amount
 * @param fee            The calculated fee for the transfer fee extension
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function transferCheckedWithFeeAndTransferHook(
  connection: Connection,
  payer: Signer,
  source: PublicKey,
  mint: PublicKey,
  destination: PublicKey,
  authority: Signer | PublicKey,
  amount: bigint,
  decimals: number,
  fee: bigint,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

export declare interface TransferCheckedWithFeeInstructionData {
  instruction: TokenInstruction.TransferFeeExtension;
  transferFeeInstruction: TransferFeeInstruction.TransferCheckedWithFee;
  amount: bigint;
  decimals: number;
  fee: bigint;
}

export declare const transferCheckedWithFeeInstructionData: Structure<TransferCheckedWithFeeInstructionData>;

/**
 * Transfer tokens from one account to another, asserting the token mint, and decimals
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param source         Source account
 * @param mint           Mint for the account
 * @param destination    Destination account
 * @param authority      Authority of the source account
 * @param amount         Number of tokens to transfer
 * @param decimals       Number of decimals in transfer amount
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function transferCheckedWithTransferHook(
  connection: Connection,
  payer: Signer,
  source: PublicKey,
  mint: PublicKey,
  destination: PublicKey,
  authority: Signer | PublicKey,
  amount: bigint,
  decimals: number,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/** TransferFeeConfig as stored by the program */
export declare interface TransferFee {
  /** First epoch where the transfer fee takes effect */
  epoch: bigint;
  /** Maximum fee assessed on transfers, expressed as an amount of tokens */
  maximumFee: bigint;
  /**
   * Amount of transfer collected as fees, expressed as basis points of the
   * transfer amount, ie. increments of 0.01%
   */
  transferFeeBasisPoints: number;
}

/** Transfer fee amount data for accounts. */
export declare interface TransferFeeAmount {
  /** Withheld transfer fee tokens that can be claimed by the fee authority */
  withheldAmount: bigint;
}

/** Buffer layout for de/serializing */
export declare const TransferFeeAmountLayout: Structure<TransferFeeAmount>;

/** Transfer fee extension data for mints. */
export declare interface TransferFeeConfig {
  /** Optional authority to set the fee */
  transferFeeConfigAuthority: PublicKey;
  /** Withdraw from mint instructions must be signed by this key */
  withdrawWithheldAuthority: PublicKey;
  /** Withheld transfer fee tokens that have been moved to the mint for withdrawal */
  withheldAmount: bigint;
  /** Older transfer fee, used if the current epoch < newerTransferFee.epoch */
  olderTransferFee: TransferFee;
  /** Newer transfer fee, used if the current epoch >= newerTransferFee.epoch */
  newerTransferFee: TransferFee;
}

/** Buffer layout for de/serializing a transfer fee config extension */
export declare const TransferFeeConfigLayout: Structure<TransferFeeConfig>;

export declare enum TransferFeeInstruction {
  InitializeTransferFeeConfig = 0,
  TransferCheckedWithFee = 1,
  WithdrawWithheldTokensFromMint = 2,
  WithdrawWithheldTokensFromAccounts = 3,
  HarvestWithheldTokensToMint = 4,
  SetTransferFee = 5,
}

/** Buffer layout for de/serializing a transfer fee */
export declare function transferFeeLayout(property?: string): Layout<TransferFee>;

/** TransferHook as stored by the program */
export declare interface TransferHook {
  /** The transfer hook update authority */
  authority: PublicKey;
  /** The transfer hook program account */
  programId: PublicKey;
}

/** TransferHookAccount as stored by the program */
export declare interface TransferHookAccount {
  /**
   * Whether or not this account is currently transferring tokens
   * True during the transfer hook cpi, otherwise false
   */
  transferring: boolean;
}

/** Buffer layout for de/serializing a transfer hook account extension */
export declare const TransferHookAccountLayout: Structure<TransferHookAccount>;

export declare enum TransferHookInstruction {
  Initialize = 0,
  Update = 1,
}

/** Buffer layout for de/serializing a transfer hook extension */
export declare const TransferHookLayout: Structure<TransferHook>;

/** TODO: docs */
export declare interface TransferInstructionData {
  instruction: TokenInstruction.Transfer;
  amount: bigint;
}

/** TODO: docs */
export declare const transferInstructionData: Structure<TransferInstructionData>;

export declare const TYPE_SIZE = 2;

/**
 * Amount as a string using mint-prescribed decimals
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param mint           Mint for the account
 * @param amount         Ui Amount of tokens to be converted to Amount
 * @param programId      SPL Token program account
 *
 * @return Ui Amount generated
 */
export declare function uiAmountToAmount(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  amount: string,
  programId?: PublicKey,
): Promise<bigint | TransactionError | null>;

/**
 * Convert a UI amount back to the raw amount
 *
 * @param connection     Connection to use
 * @param mint           Mint to use for calculations
 * @param uiAmount       UI Amount to be converted back to raw amount
 *
 *
 * @return Raw amount
 */
export declare function uiAmountToAmountForMintWithoutSimulation(
  connection: Connection,
  mint: PublicKey,
  uiAmount: string,
): Promise<bigint>;

/** TODO: docs */
export declare interface UiAmountToAmountInstructionData {
  instruction: TokenInstruction.UiAmountToAmount;
  amount: Uint8Array;
}

/**
 * Convert an amount with interest back to the original amount without interest
 * This implements the same logic as the CPI instruction available in /token/program-2022/src/extension/interest_bearing_mint/mod.rs
 *
 * @param uiAmount                  UI Amount (principal plus continuously compounding interest) to be converted back to original principal
 * @param decimals                  Number of decimals for the mint
 * @param currentTimestamp          Current timestamp in seconds
 * @param lastUpdateTimestamp       Last time the interest rate was updated in seconds
 * @param initializationTimestamp   Time the interest bearing extension was initialized in seconds
 * @param preUpdateAverageRate      Interest rate in basis points (hundredths of a percent) before the last update
 * @param currentRate              Current interest rate in basis points
 *
 * In general to calculate the principal from the UI amount, the formula is:
 * P = A / (e^(r * t)) where
 * P = principal
 * A = UI amount
 * r = annual interest rate (as a decimal, e.g., 5% = 0.05)
 * t = time in years
 *
 * In this case, we are calculating the principal by dividing the UI amount by the total scale factor which is the product of two exponential functions:
 * totalScale = e^(r1 * t1) * e^(r2 * t2)
 * where r1 is the pre-update average rate, r2 is the current rate, t1 is the time in years between the initialization timestamp and the last update timestamp,
 * and t2 is the time in years between the last update timestamp and the current timestamp.
 * then to calculate the principal, we divide the UI amount by the total scale factor:
 * P = A / totalScale
 *
 * @return Original amount (principal) without interest
 */
export declare function uiAmountToAmountWithoutSimulation(
  uiAmount: string,
  decimals: number,
  currentTimestamp: number, // in seconds
  lastUpdateTimestamp: number,
  initializationTimestamp: number,
  preUpdateAverageRate: number,
  currentRate: number,
): bigint;

/**
 * Unpack a token account
 *
 * @param address   Token account
 * @param info      Token account data
 * @param programId SPL Token program account
 *
 * @return Unpacked token account
 */
export declare function unpackAccount(
  address: PublicKey,
  info: AccountInfo<Buffer> | null,
  programId?: PublicKey,
): Account;

/**
 * Unpack a mint
 *
 * @param address   Mint account
 * @param info      Mint account data
 * @param programId SPL Token program account
 *
 * @return Unpacked mint
 */
export declare function unpackMint(
  address: PublicKey,
  info: AccountInfo<Buffer> | null,
  programId?: PublicKey,
): Mint;

/**
 * Unpack a multisig
 *
 * @param address   Multisig account
 * @param info      Multisig account data
 * @param programId SPL Token program account
 *
 * @return Unpacked multisig
 */
export declare function unpackMultisig(
  address: PublicKey,
  info: AccountInfo<Buffer> | null,
  programId?: PublicKey,
): Multisig;

export declare function unpackPubkeyData(
  keyDataConfig: Uint8Array,
  previousMetas: AccountMeta[],
  instructionData: Buffer,
  connection: Connection,
): Promise<PublicKey>;

export declare function unpackSeeds(
  seeds: Uint8Array,
  previousMetas: AccountMeta[],
  instructionData: Buffer,
  connection: Connection,
): Promise<Buffer[]>;

/**
 * Update the default account state on a mint
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param mint        Mint to modify
 * @param state        New account state to set on created accounts
 * @param freezeAuthority          Freeze authority of the mint
 * @param multiSigners   Signing accounts if `freezeAuthority` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function updateDefaultAccountState(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  state: AccountState,
  freezeAuthority: Signer | PublicKey,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

export declare const updateGroupMemberPointerData: Structure<{
  instruction: TokenInstruction.GroupMemberPointerExtension;
  groupMemberPointerInstruction: number;
  memberAddress: PublicKey;
}>;

export declare const updateGroupPointerData: Structure<{
  instruction: TokenInstruction.GroupPointerExtension;
  groupPointerInstruction: number;
  groupAddress: PublicKey;
}>;

export declare const updateMetadataPointerData: Structure<{
  instruction: TokenInstruction.MetadataPointerExtension;
  metadataPointerInstruction: number;
  metadataAddress: PublicKey;
}>;

/**
 * Update scaled UI amount multiplier
 *
 * @param connection            Connection to use
 * @param payer                 Payer of the transaction fees
 * @param mint                  The token mint
 * @param owner                 Owner of the scaled UI amount mint
 * @param multiplier            New multiplier
 * @param effectiveTimestamp    Effective time stamp for the new multiplier
 * @param multiSigners          Signing accounts if `owner` is a multisig
 * @param confirmOptions        Options for confirming the transaction
 * @param programId             SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function updateMultiplier(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  owner: Signer | PublicKey,
  multiplier: number,
  effectiveTimestamp: bigint,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

export declare interface UpdateMultiplierData {
  instruction: TokenInstruction.ScaledUiAmountExtension;
  scaledUiAmountInstruction: ScaledUiAmountInstruction.UpdateMultiplier;
  multiplier: number;
  effectiveTimestamp: bigint;
}

export declare const updateMultiplierData: Structure<UpdateMultiplierData>;

/**
 * Update the interest rate of an interest bearing account
 *
 * @param connection      Connection to use
 * @param payer           Payer of the transaction fees
 * @param mint            Public key of the mint
 * @param rateAuthority   The public key for the account that can update the rate
 * @param rate            The initial interest rate
 * @param multiSigners    Signing accounts if `owner` is a multisig
 * @param confirmOptions  Options for confirming the transaction
 * @param programId       SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function updateRateInterestBearingMint(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  rateAuthority: Signer,
  rate: number,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<string>;

export declare function updateTokenMetadata(
  current: TokenMetadata,
  key: Field | string,
  value: string,
): TokenMetadata;

/**
 * Update the transfer hook program on a mint
 *
 * @param connection            Connection to use
 * @param payer                 Payer of the transaction fees
 * @param mint                  Mint to modify
 * @param transferHookProgramId New transfer hook program account
 * @param authority             Transfer hook update authority
 * @param multiSigners          Signing accounts if `freezeAuthority` is a multisig
 * @param confirmOptions        Options for confirming the transaction
 * @param programId             SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function updateTransferHook(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  transferHookProgramId: PublicKey,
  authority: Signer | PublicKey,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

/** Deserialized instruction for the initiation of an transfer hook */
export declare interface UpdateTransferHookInstructionData {
  instruction: TokenInstruction.TransferHookExtension;
  transferHookInstruction: TransferHookInstruction.Update;
  transferHookProgramId: PublicKey;
}

/** The struct that represents the instruction data as it is read by the program */
export declare const updateTransferHookInstructionData: Structure<UpdateTransferHookInstructionData>;

/**
 * Withdraw withheld tokens from accounts
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param mint           The token mint
 * @param destination    The destination account
 * @param authority      The mint's withdraw withheld tokens authority
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param sources        Source accounts from which to withdraw withheld fees
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function withdrawWithheldTokensFromAccounts(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  destination: PublicKey,
  authority: Signer | PublicKey,
  multiSigners: Signer[],
  sources: PublicKey[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

export declare interface WithdrawWithheldTokensFromAccountsInstructionData {
  instruction: TokenInstruction.TransferFeeExtension;
  transferFeeInstruction: TransferFeeInstruction.WithdrawWithheldTokensFromAccounts;
  numTokenAccounts: number;
}

export declare const withdrawWithheldTokensFromAccountsInstructionData: Structure<WithdrawWithheldTokensFromAccountsInstructionData>;

/**
 * Withdraw withheld tokens from mint
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param mint           The token mint
 * @param destination    The destination account
 * @param authority      The mint's withdraw withheld tokens authority
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
export declare function withdrawWithheldTokensFromMint(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  destination: PublicKey,
  authority: Signer | PublicKey,
  multiSigners?: Signer[],
  confirmOptions?: ConfirmOptions,
  programId?: PublicKey,
): Promise<TransactionSignature>;

export declare interface WithdrawWithheldTokensFromMintInstructionData {
  instruction: TokenInstruction.TransferFeeExtension;
  transferFeeInstruction: TransferFeeInstruction.WithdrawWithheldTokensFromMint;
}

export declare const withdrawWithheldTokensFromMintInstructionData: Structure<WithdrawWithheldTokensFromMintInstructionData>;
