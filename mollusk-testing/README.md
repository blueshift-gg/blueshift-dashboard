# Mollusk Testing Framework

A beginner-friendly guide to testing Solana programs with Mollusk.

## Overview

Mollusk is a fast and simple testing framework for Solana programs. Think of it as a mini Solana environment that runs your tests instantly without needing a full validator.

### Why use Mollusk?

- ⚡ **Super Fast**: Tests run in milliseconds, not seconds
- 🧪 **Easy Testing**: No complex setup required
- 🔧 **Simple API**: Just a few methods to learn
- 🎯 **Focused**: Test your program logic directly

## Installation

Add Mollusk to your `Cargo.toml`:

```toml
[dev-dependencies]
mollusk-svm = "0.4"
```

## Quick Start

```rust
mod testing {
    use mollusk_svm::Mollusk;
    use solana_sdk::pubkey::Pubkey;

    const MY_PROGRAM_ID: Pubkey = solana_sdk::pubkey!("YourProgramId11111111111111111111111111111");

    #[test]
    fn my_first_test() {
        let mollusk = Mollusk::new(&MY_PROGRAM_ID, "target/deploy/my_program.so");
        // Your test logic here
    }
}
```

## Table of Contents

- [Getting Started](#getting-started)
- [Creating Mollusk Instances](#creating-mollusk-instances)
- [Adding Your Program](#adding-your-program)
- [Working with Token Programs](#working-with-token-programs)
- [Setting Up Instructions](#setting-up-instructions)
- [Managing Accounts](#managing-accounts)
- [Execution & Validation](#execution--validation)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)

## Getting Started

### Your First Test

```rust
use mollusk_svm::{Mollusk, result::Check};
use solana_sdk::{
    account::Account,
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
    system_program,
};

#[test]
fn test_my_program() {
    // 1. Create Mollusk instance
    let mollusk = Mollusk::new(&MY_PROGRAM_ID, "target/deploy/my_program.so");
    
    // 2. Set up accounts
    let user = Pubkey::new_unique();
    let accounts = vec![
        (user, Account {
            lamports: 1_000_000,
            data: vec![],
            owner: system_program::id(),
            executable: false,
            rent_epoch: 0,
        }),
    ];
    
    // 3. Create instruction
    let instruction = Instruction::new_with_bytes(
        MY_PROGRAM_ID,
        &[0], // Your instruction data
        vec![AccountMeta::new(user, true)],
    );
    
    // 4. Execute and validate
    let result = mollusk.process_instruction(&instruction, &accounts);
    assert!(result.is_ok());
}
```

## Creating Mollusk Instances

### Basic Setup

```rust
use mollusk_svm::Mollusk;
use solana_sdk::pubkey::Pubkey;

const MY_PROGRAM_ID: Pubkey = solana_sdk::pubkey!("YourProgramId11111111111111111111111111111");

#[test]
fn test_my_program() {
    let program_id = Pubkey::new_unique();
    
    // Create a new Mollusk instance
    let mollusk = Mollusk::new(&program_id, "path/to/program.so");
    
    // Your test logic here
}
```

### Using Built-in Programs

```rust
#[test]
fn test_with_builtins() {
    // Creates Mollusk with default builtin programs (System, etc.)
    let mollusk = Mollusk::default();
    
    // Your test logic here
}
```

### Configuration Methods

```rust
use mollusk_svm::Mollusk;
use solana_sdk::feature_set::FeatureSet;

#[test]
fn test_with_custom_config() {
    let mut mollusk = Mollusk::new(&program_id, "path/to/program.so");
    
    // Configure compute budget
    mollusk.set_compute_budget(200_000);
    
    // Configure feature set  
    mollusk.set_feature_set(FeatureSet::all_enabled());
    
    // Add sysvars (handled automatically in most cases)
}
```

## Adding Your Program

### Loading Your Program

```rust
use mollusk_svm::Mollusk;
use solana_sdk::pubkey::Pubkey;

const PROGRAM_ID: Pubkey = solana_sdk::pubkey!("YourProgramIdHere111111111111111111111111");

#[test]
fn test_program_loading() {
    // Method 1: Load from .so file (most common)
    let mollusk = Mollusk::new(&PROGRAM_ID, "target/deploy/my_program.so");
    
    // Method 2: Load program data from bytes
    let program_data = std::fs::read("target/deploy/my_program.so").unwrap();
    let mollusk = Mollusk::new(&PROGRAM_ID, &program_data);
}
```

### Adding Additional Programs

```rust
#[test]
fn test_with_multiple_programs() {
    let mut mollusk = Mollusk::new(&PROGRAM_ID, "target/deploy/my_program.so");
    
    // Add additional programs using add_program method
    mollusk.add_program(&OTHER_PROGRAM_ID, "path/to/other_program.so");
    mollusk.add_program(&THIRD_PROGRAM_ID, &program_bytes);
}
```

### Program Deployment Patterns

```rust
// Common pattern for program testing setup
fn setup_mollusk() -> Mollusk {
    let mollusk = Mollusk::new(&PROGRAM_ID, "target/deploy/my_program.so");
    
    // Note: For SPL Token and other programs, use Mollusk::default() 
    // or add them manually if needed
    mollusk
}

// Alternative: Use default Mollusk with built-in programs
fn setup_mollusk_with_builtins() -> Mollusk {
    let mut mollusk = Mollusk::default();
    
    // Add your custom program
    mollusk.add_program(&PROGRAM_ID, "target/deploy/my_program.so");
    
    mollusk
}
```

## Working with Token Programs

### Basic Token Setup

The Token Program is included in `Mollusk::default()`. Here's how to create token accounts using Pinocchio Token:

```rust
use pinocchio_token::state::{Account as TokenAccount, Mint};
use solana_sdk::{account::Account, rent::Rent};

#[test]
fn test_with_tokens() {
    // Start with default Mollusk (includes Token Program)
    let mut mollusk = Mollusk::default();
    mollusk.add_program(&MY_PROGRAM_ID, "target/deploy/my_program.so");
    
    // Create a mint
    let mint_pubkey = Pubkey::new_unique();
    let mint_authority = Pubkey::new_unique();
    let mint_account = create_mint_account(&mint_authority, 6); // 6 decimals
    
    // Create a token account
    let token_account_pubkey = Pubkey::new_unique();
    let owner = Pubkey::new_unique();
    let token_account = create_token_account(&mint_pubkey, &owner, 1000); // 1000 tokens
    
    // Use these in your test
    let accounts = vec![
        (mint_pubkey, mint_account),
        (token_account_pubkey, token_account),
    ];
}

// Helper function to create a mint account
fn create_mint_account(authority: &Pubkey, decimals: u8) -> Account {
    let mint_data = Mint {
        mint_authority: Some(*authority).into(),
        supply: 0,
        decimals,
        is_initialized: true,
        freeze_authority: None.into(),
    };
    
    Account {
        lamports: Rent::default().minimum_balance(Mint::LEN),
        data: mint_data.try_to_vec().unwrap(),
        owner: pinocchio_token::id(),
        executable: false,
        rent_epoch: 0,
    }
}

// Helper function to create a token account
fn create_token_account(mint: &Pubkey, owner: &Pubkey, amount: u64) -> Account {
    let account_data = TokenAccount {
        mint: *mint,
        owner: *owner,
        amount,
        delegate: None.into(),
        state: pinocchio_token::state::AccountState::Initialized,
        is_native: None.into(),
        delegated_amount: 0,
        close_authority: None.into(),
    };
    
    Account {
        lamports: Rent::default().minimum_balance(TokenAccount::LEN),
        data: account_data.try_to_vec().unwrap(),
        owner: pinocchio_token::id(),
        executable: false,
        rent_epoch: 0,
    }
}
```

### Associated Token Accounts

```rust
use pinocchio_token::get_associated_token_address;

#[test]
fn test_with_associated_token_accounts() {
    let mollusk = setup_mollusk_with_token_program();
    
    let wallet = Pubkey::new_unique();
    let mint = Pubkey::new_unique();
    let ata = get_associated_token_address(&wallet, &mint);
    
    // Create the ATA
    let ata_account = create_token_account(&ata, &mint, &wallet, 0);
    
    // Include in accounts for testing
    let accounts = vec![
        (wallet, create_user_account(&wallet, 1_000_000)),
        (mint, create_mint_account(&mint, &wallet, 6)),
        (ata, ata_account),
    ];
}
```

## Setting Up Instructions

### Creating Basic Instructions

```rust
use solana_sdk::instruction::{AccountMeta, Instruction};

#[test]
fn test_instruction_creation() {
    let mollusk = Mollusk::new(&MY_PROGRAM_ID, "target/deploy/my_program.so");
    
    // Create accounts for the instruction
    let user = Pubkey::new_unique();
    let data_account = Pubkey::new_unique();
    
    // Define which accounts the instruction needs
    let accounts = vec![
        AccountMeta::new(user, true),              // User (signer, writable)
        AccountMeta::new(data_account, false),     // Data account (writable)
        AccountMeta::new_readonly(system_program::id(), false), // System program (readonly)
    ];
    
    // Create instruction data (what your program expects)
    let instruction_data = vec![0]; // Example: instruction type 0
    
    // Build the instruction
    let instruction = Instruction::new_with_bytes(
        MY_PROGRAM_ID,
        &instruction_data,
        accounts,
    );
    
    // Now you can use this instruction in tests
}
```

### Working with Pinocchio Account Data

```rust
use pinocchio::{account_info::AccountInfo, program_error::ProgramError};

// Define your Pinocchio program's account structure
#[repr(C)]
#[derive(Clone, Copy)]
struct MyPinocchioAccount {
    is_initialized: bool,
    authority: Pubkey,
    value: u64,
}

impl MyPinocchioAccount {
    const LEN: usize = 1 + 32 + 8; // bool + Pubkey + u64
}

fn create_pinocchio_program_account(authority: &Pubkey, value: u64) -> Account {
    let mut data = vec![0; MyPinocchioAccount::LEN];
    
    // Manually serialize the data (Pinocchio style)
    data[0] = 1; // is_initialized = true
    data[1..33].copy_from_slice(authority.as_ref());
    data[33..41].copy_from_slice(&value.to_le_bytes());
    
    Account {
        lamports: Rent::default().minimum_balance(data.len()),
        data,
        owner: MY_PROGRAM_ID,
        executable: false,
        rent_epoch: 0,
    }
}
```

## Managing Accounts

### Creating Simple Accounts

```rust
use solana_sdk::{account::Account, system_program};

// Create a basic user account with SOL
fn create_user_account(lamports: u64) -> Account {
    Account {
        lamports,                    // How much SOL the account has
        data: vec![],               // Empty data
        owner: system_program::id(), // Owned by System Program
        executable: false,          // Not a program
        rent_epoch: 0,
    }
}

// Create an account owned by your program
fn create_program_account(data: Vec<u8>) -> Account {
    Account {
        lamports: Rent::default().minimum_balance(data.len()),
        data,
        owner: MY_PROGRAM_ID, // Your program owns this account
        executable: false,
        rent_epoch: 0,
    }
}

#[test]
fn test_with_accounts() {
    let mollusk = Mollusk::new(&MY_PROGRAM_ID, "target/deploy/my_program.so");
    
    // Create accounts
    let user = Pubkey::new_unique();
    let user_account = create_user_account(1_000_000); // 1 SOL
    
    let data_account = Pubkey::new_unique();
    let data = vec![0; 100]; // 100 bytes of data
    let data_account_obj = create_program_account(data);
    
    // Put accounts in the format Mollusk expects
    let accounts = vec![
        (user, user_account),
        (data_account, data_account_obj),
    ];
    
    // Use these accounts in your test
}
```

### Working with Account Data

```rust
use borsh::{BorshDeserialize, BorshSerialize};

// Define your account data structure
#[derive(BorshSerialize, BorshDeserialize)]
struct MyAccountData {
    is_initialized: bool,
    authority: Pubkey,
    value: u64,
}

fn create_initialized_account(authority: &Pubkey, value: u64) -> Account {
    let account_data = MyAccountData {
        is_initialized: true,
        authority: *authority,
        value,
    };
    
    let data = account_data.try_to_vec().unwrap();
    
    Account {
        lamports: Rent::default().minimum_balance(data.len()),
        data,
        owner: MY_PROGRAM_ID,
        executable: false,
        rent_epoch: 0,
    }
}
```

## Execution & Validation

### Basic Execution

```rust
use mollusk_svm::result::Check;

#[test]
fn test_basic_execution() {
    let mollusk = Mollusk::new(&MY_PROGRAM_ID, "target/deploy/my_program.so");
    
    let instruction = create_test_instruction();
    let accounts = setup_test_accounts();
    
    // Method 1: Execute and get result
    let result = mollusk.process_instruction(&instruction, &accounts);
    assert!(result.is_ok());
    
    // Method 2: Execute with validation checks
    let checks = vec![
        Check::success(),
        Check::compute_units(10_000), // Expected compute units
    ];
    
    let result = mollusk.process_and_validate_instruction(
        &instruction, 
        &accounts, 
        &checks
    );
}
```

### Error Handling and Validation

```rust
use mollusk_svm::result::Check;

#[test]
fn test_error_conditions() {
    let mollusk = Mollusk::new(&MY_PROGRAM_ID, "target/deploy/my_program.so");
    
    // Test insufficient funds scenario
    let insufficient_funds_instruction = create_transfer_instruction(1_000_000);
    let poor_accounts = setup_accounts_with_low_balance();
    
    let result = mollusk.process_instruction(&insufficient_funds_instruction, &poor_accounts);
    
    // Check that it failed as expected
    assert!(result.is_err());
    
    // You can also use validation to expect specific failures
    let checks = vec![
        Check::err(&InstructionError::InsufficientFunds),
    ];
    
    mollusk.process_and_validate_instruction(
        &insufficient_funds_instruction,
        &poor_accounts,
        &checks,
    );
}
```

## Advanced Features

### Advanced Checks

```rust
use mollusk_svm::result::Check;
use solana_sdk::instruction::InstructionError;

#[test]
fn test_comprehensive_validation() {
    let mollusk = Mollusk::new(&MY_PROGRAM_ID, "target/deploy/my_program.so");
    
    let instruction = create_test_instruction();
    let accounts = setup_test_accounts();
    
    let checks = vec![
        Check::success(),
        Check::compute_units(5_000), // Expect specific compute usage
        Check::account(&USER_ACCOUNT)
            .lamports(expected_lamports)
            .data(&expected_data)
            .build(),
        Check::account(&TOKEN_ACCOUNT)
            .lamports(token_account_rent)
            .owner(&pinocchio_token::id())
            .build(),
    ];
    
    mollusk.process_and_validate_instruction(&instruction, &accounts, &checks);
}
```

### Instruction Chains

```rust
#[test]
fn test_instruction_chain() {
    let mollusk = Mollusk::default();
    
    let instructions = vec![
        create_initialize_instruction(),
        create_update_instruction(),
        create_finalize_instruction(),
    ];
    
    let accounts = setup_test_accounts();
    
    // Process chain of instructions
    let result = mollusk.process_instruction_chain(&instructions, &accounts);
    assert!(result.is_ok());
}
```

## Best Practices

1. **Use helper functions** for common account creation patterns
2. **Test error conditions** as well as success cases
3. **Validate account state changes** using the Check API
4. **Keep tests focused** on specific functionality
5. **Use meaningful test names** that describe what's being tested

## Contributing

We welcome contributions to improve this guide! Please feel free to:

- Submit bug reports and feature requests
- Create pull requests for improvements
- Suggest additional examples or use cases
- Help with documentation improvements

## License

This guide is provided under the same license as the Mollusk framework.