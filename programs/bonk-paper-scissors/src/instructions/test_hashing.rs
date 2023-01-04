use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct TestHashing {}

pub fn test_hashing(
    choice: u8,
    salt: [u8; 32],
    hash: [u8; 32],
) -> Result<()> {
    let choice_bytes = choice.clone();
    let instantiated_hash = anchor_lang::solana_program::hash::Hash::new_from_array(hash);
    let created_hash = anchor_lang::solana_program::hash::hashv(&[&[choice_bytes], &salt]);
    require_eq!(created_hash, instantiated_hash);
    Ok(())
}
