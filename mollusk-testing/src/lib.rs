use pinocchio::{
    account_info::AccountInfo, program_error::ProgramError, pubkey::{find_program_address, Pubkey}, seeds, instruction::Signer,* 
};

use pinocchio_system::instructions::Transfer;

use borsh::{BorshDeserialize, BorshSerialize};

use pinocchio_pubkey::declare_id;

declare_id!("4BvWMZJWFmqu3mDp8FF3J3aymaV3ZAQP7wWmgiJQQFxo");

entrypoint!(process_instruction);

#[derive(BorshSerialize, BorshDeserialize)]
pub struct VaultContext<'a> {
    pub vault: &'a AccountInfo,
    pub owner: &'a AccountInfo,
    pub vault_state: &'a AccountInfo,
    pub system_program: &'a AccountInfo,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct VaultState {
    pub balance: u64,
}

impl<'a> VaultContext<'a> {
    pub fn deposit(&self, amount: u64) -> ProgramResult {
        // Check if owner has enough lamports
        if self.owner.lamports() < amount {
            return Err(ProgramError::InsufficientFunds);
        }

        Transfer {
            from: &self.owner,
            to: &self.vault,
            lamports: amount,
        }.invoke()?;

        let mut vault_state_data = self.vault_state.try_borrow_mut_data()?;
        let mut vault_state = VaultState::try_from_slice(&vault_state_data)
            .map_err(|_| ProgramError::InvalidAccountData)?;
        
        vault_state.balance = vault_state.balance.checked_add(amount)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        
        vault_state.serialize(&mut &mut vault_state_data[..])
            .map_err(|_| ProgramError::InvalidAccountData)?;

        Ok(())
    }

    pub fn withdraw(&self, amount: u64) -> ProgramResult {
        let mut vault_state_data = self.vault_state.try_borrow_mut_data()?;

        let mut vault_state = VaultState::try_from_slice(&vault_state_data)
            .map_err(|_| ProgramError::InvalidAccountData)?;

        if vault_state.balance < amount {
            msg!("Insufficient balance in vault state");
            return Err(ProgramError::InsufficientFunds);
        };

        if self.vault.lamports() < amount {
            msg!("Insufficient vault PDA lamports");
            return Err(ProgramError::InsufficientFunds);
        };

        let (vault_pda, bump) = find_program_address(
        &[b"vault", self.owner.key().as_ref()],
        &crate::ID,
        );

        let bump_ref = &[bump];
        let seeds = seeds!(b"vault", self.owner.key().as_ref(), bump_ref);
        let signer = Signer::from(&seeds); 

        Transfer {
            from: &self.vault,
            to: &self.owner,
            lamports: amount,
        }.invoke_signed(&[signer])?;

        let mut vault_state = VaultState::try_from_slice(&vault_state_data)
            .map_err(|_| ProgramError::InvalidAccountData)?;

        vault_state.balance = vault_state.balance.checked_sub(amount)
            .ok_or(ProgramError::ArithmeticOverflow)?;

         vault_state.serialize(&mut &mut vault_state_data[..])
            .map_err(|_| ProgramError::InvalidAccountData)?;

        Ok(())
    }

}

impl<'a> TryFrom<&'a [AccountInfo]> for VaultContext<'a> {
    type Error = ProgramError;

    fn try_from(accounts: &'a [AccountInfo]) -> Result<Self, Self::Error> {
        let [owner, vault, vault_state, system_program] = accounts else {
            msg!("Expected [owner, vault, vault_state_account]");
            return Err(ProgramError::NotEnoughAccountKeys);
        };

        if !owner.is_signer() {
            msg!("Owner must be signer");
            return Err(ProgramError::MissingRequiredSignature);
        }

        let (vault_pda, _) = find_program_address(
            &[b"vault", owner.key().as_ref()], 
            &crate::ID,
        );

        if vault.key() != &vault_pda {
            msg!("Invalid vault PDA");
            return Err(ProgramError::InvalidSeeds);
        }

        let (vault_state_pda, _) = find_program_address(
            &[b"vault_state"],
            &crate::ID
        );

        if vault_state.key() != & vault_state_pda {
            msg!("Invalid vault state PDA");
            return Err(ProgramError::InvalidSeeds);
        }

        if system_program.key() != &pinocchio_system::ID {
            msg!("Invalid system program");
            return Err(ProgramError::IncorrectProgramId);
        }

        // Not required because we are certain that this is correct to avoide compute units
        // if unsafe { vault.owner() } != &crate::ID {
        //     msg!("Vault must be owned by this program");
        //     return Err(ProgramError::IncorrectProgramId);
        // } 

        Ok(Self {
            owner,
            vault,
            vault_state,
            system_program
        })
    }
}

#[derive(BorshSerialize, BorshDeserialize)]
pub enum VaultInstructions {
    InitializeVault,
    DepositSol { amount: u64 },
    WithdrawSol { amount: u64 },
}

pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {

    let instruction = VaultInstructions::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        VaultInstructions::InitializeVault => {
            let context = VaultContext::try_from(accounts)?;

            let vault_state = VaultState {
                balance: 0,
            };

            let mut account_data = context.vault_state.try_borrow_mut_data()?;
            vault_state.serialize(&mut &mut account_data[..]) 
                .map_err(|_| ProgramError::InvalidAccountData)?;
        },

        VaultInstructions::DepositSol { amount } => {
            let context = VaultContext::try_from(accounts)?;
            context.deposit(amount)?;
        },

        VaultInstructions::WithdrawSol { amount } => {
            let context = VaultContext::try_from(accounts)?;
            context.withdraw(amount)?;
        }
    }

    Ok(())
}

#[cfg(test)]
mod testing {
    use super::*;
    use {
        mollusk_svm::{program, Mollusk},
        solana_sdk::{account::Account, native_token::LAMPORTS_PER_SOL, instruction::Instruction},
    };

    use mollusk_svm::result::Check;

    use pinocchio_token::state::{TokenAccount, Mint};

    use solana_sdk::{pubkey, pubkey::Pubkey, instruction::AccountMeta, program_error::ProgramError};

    const ID: Pubkey = pubkey!("4BvWMZJWFmqu3mDp8FF3J3aymaV3ZAQP7wWmgiJQQFxo");
    const USER: Pubkey = Pubkey::new_from_array([0x01; 32]);

    #[test]
    fn test_init_vault() {
        let mollusk = Mollusk::new(&ID, "target/deploy/pinocchio_vault");

        let (vault_pda, vault_bump) = Pubkey::find_program_address(
            &[b"vault", USER.as_ref()], 
            &ID
        );

        let (vault_state_pda, vault_bump) = Pubkey::find_program_address(
             &[b"vault_state"],
            &ID
        );

        let (system_program, system_account) = program::keyed_account_for_system_program();

        let user_account = Account::new(1 * LAMPORTS_PER_SOL, 0, &system_program);
        let state_account = Account::new(0 * LAMPORTS_PER_SOL, 100, &ID);
        let vault_account = Account::new(0 * LAMPORTS_PER_SOL, 0, &system_program);

        //Get the accounts meta

        let ix_accounts = vec![
            AccountMeta::new(USER, true),            
            AccountMeta::new(vault_pda, false),      
            AccountMeta::new(vault_state_pda, false), 
            AccountMeta::new_readonly(system_program, false),
        ];

        //Data: our instruction does not takes any data

        //Build IX
        let data = VaultInstructions::InitializeVault.try_to_vec().unwrap();
        let instruction = Instruction::new_with_bytes(ID, &data, ix_accounts);

        //Get Tx Accounts
        let tx_accounts = &vec![
            (vault_pda, vault_account.clone()),
            (USER, user_account.clone()),
            (vault_state_pda, state_account.clone()),
            (system_program, system_account.clone()),
        ];
        
        //process and validate instruction
        mollusk.process_and_validate_instruction(
            &instruction,
            &tx_accounts,
    // &[Check::err(ProgramError::InvalidSeeds)],
            &[Check::success()]
        );
    }

    #[test]
    fn deposit_sol() {
        let mollusk = Mollusk::new(&ID, "target/deploy/pinocchio_vault");

        let (vault_pda, _vault_bump) = Pubkey::find_program_address(
            &[b"vault", USER.as_ref()], 
            &ID
        );

        let (vault_state_pda, _vault_state_bump) = Pubkey::find_program_address(
             &[b"vault_state"],
            &ID
        );

        let (system_program, system_account) = program::keyed_account_for_system_program();

        let user_account = Account::new(10 * LAMPORTS_PER_SOL, 0, &system_program);

        // Properly initialize vault state account with serialized data
        let vault_state = VaultState { balance: 0 };
        let serialized_state = vault_state.try_to_vec().unwrap();
        let mut state_account = Account::new(LAMPORTS_PER_SOL / 1000, serialized_state.len(), &ID);
        state_account.data = serialized_state; // Important: set the actual data
        
        let vault_account = Account::new(0, 0, &system_program);

        let ix_accounts = vec![
            AccountMeta::new(USER, true),            
            AccountMeta::new(vault_pda, false),      
            AccountMeta::new(vault_state_pda, false), 
            AccountMeta::new_readonly(system_program, false),
        ];

        let deposit_amount = 8 * LAMPORTS_PER_SOL;
        let data = VaultInstructions::DepositSol { amount: deposit_amount }.try_to_vec().unwrap();
        let instruction = Instruction::new_with_bytes(ID, &data, ix_accounts);

        let tx_accounts = vec![
            (USER, user_account.clone()),                    // Index 0
            (vault_pda, vault_account.clone()),              // Index 1
            (vault_state_pda, state_account.clone()),        // Index 2
            (system_program, system_account.clone()),        // Index 3
        ];

        // Print initial balances (before transaction)
        println!("=== BEFORE TRANSACTION ===");
        println!("Initial user balance: {} SOL", tx_accounts[0].1.lamports as f64 / LAMPORTS_PER_SOL as f64);
        println!("Initial vault balance: {} SOL", tx_accounts[1].1.lamports as f64 / LAMPORTS_PER_SOL as f64);

        let result = mollusk.process_and_validate_instruction(
            &instruction,
            &tx_accounts,
            &[Check::success()]
        );

        // Note: mollusk doesn't modify the original tx_accounts, you'd need to inspect the result
        // to see the actual final state. The printed values above are the initial values.
        
        println!("=== TRANSACTION COMPLETED ===");
        println!("Expected: User should have {} SOL less, Vault should have {} SOL more", 
                 deposit_amount as f64 / LAMPORTS_PER_SOL as f64,
                 deposit_amount as f64 / LAMPORTS_PER_SOL as f64);

        println!("Compute units consumed: {}", result.compute_units_consumed);
        println!("User final balance: {} SOL", result.get_account(&USER).unwrap().lamports as f64 / LAMPORTS_PER_SOL as f64);
        println!("Vault final balance: {} SOL", result.get_account(&vault_pda).unwrap().lamports as f64
            / LAMPORTS_PER_SOL as f64);

    }

    #[test]
    fn withdraw_sol() {
        let mollusk = Mollusk::new(&ID, "target/deploy/pinocchio_vault");

        let (vault_pda, _vault_bump) = Pubkey::find_program_address(
            &[b"vault", USER.as_ref()], 
            &ID
        );

        let (vault_state_pda, _vault_state_bump) = Pubkey::find_program_address(
             &[b"vault_state"],
            &ID
        );

        let (system_program, system_account) = program::keyed_account_for_system_program();

        let user_account = Account::new(10 * LAMPORTS_PER_SOL, 0, &system_program);

        let vault_state = VaultState { balance: 10 * LAMPORTS_PER_SOL };
        let serialized_state = vault_state.try_to_vec().unwrap();
        let mut state_account = Account::new(LAMPORTS_PER_SOL / 1000, serialized_state.len(), &ID);
        state_account.data = serialized_state; // Important: set the actual data
        
        let vault_account = Account::new(10 * LAMPORTS_PER_SOL, 0, &system_program);

         let ix_accounts = vec![
            AccountMeta::new(USER, true),            
            AccountMeta::new(vault_pda, false),      
            AccountMeta::new(vault_state_pda, false), 
            AccountMeta::new_readonly(system_program, false),
        ];

        let withdraw_amount = 1 * LAMPORTS_PER_SOL;
        let data = VaultInstructions::WithdrawSol { amount: withdraw_amount }.try_to_vec().unwrap();

        println!("Withdraw Instruction Data: {:?}", data);

        let instruction = Instruction::new_with_bytes(ID, &data, ix_accounts);

        let tx_accounts = vec![
            (USER, user_account.clone()),                    // Index 0
            (vault_pda, vault_account.clone()),              // Index 1
            (vault_state_pda, state_account.clone()),        // Index 2
            (system_program, system_account.clone()),        // Index 3
        ];

        // Print initial balances (before transaction)
        println!("=== BEFORE TRANSACTION ===");
        println!("Initial user balance: {} SOL", tx_accounts[0].1.lamports as f64 / LAMPORTS_PER_SOL as f64);
        println!("Initial vault balance: {} SOL", tx_accounts[1].1.lamports as f64 / LAMPORTS_PER_SOL as f64);

        let result = mollusk.process_and_validate_instruction(
            &instruction,
            &tx_accounts,
            &[Check::success()]
        );

        // Note: mollusk doesn't modify the original tx_accounts, you'd need to inspect the result
        // to see the actual final state. The printed values above are the initial values.
        println!("=== TRANSACTION COMPLETED ===");
        println!("Expected: User should have {} SOL more, Vault should have {} SOL less", 
                 withdraw_amount as f64 / LAMPORTS_PER_SOL as f64,
                 withdraw_amount as f64 / LAMPORTS_PER_SOL as f64);

        println!("Compute units consumed: {}", result.compute_units_consumed);
        println!("User final balance: {} SOL", result.get_account(&USER).unwrap().lamports as f64 / LAMPORTS_PER_SOL as f64);
        println!("Vault final balance: {} SOL", result.get_account(&vault_pda).unwrap().lamports as f64 / LAMPORTS_PER_SOL as f64);

    }
}