use anchor_lang::prelude::*;

#[account]
pub struct BpsSettings {
    pub bump: u8,
    pub time_for_penalization: i64,
    pub authority: Pubkey,
    pub player_fee_lamports: u64,
}

impl BpsSettings {
    #[deprecated(note = "Use size_v2 onwards, this is only kept for compatibility.")]
    pub fn size() -> usize {
        8 + // discriminator
        1 + // bump
        8 // time_for_penalization
    }
    pub fn size_v2() -> usize {
        8 + // discriminator
        1 + // bump
        8 + // time_for_penalization
        32 + // authority
        8 // player_fee_lamports
    }
    pub fn new(
        bump: u8,
        time_for_penalization: i64,
        authority: Pubkey,
        player_fee_lamports: u64,
    ) -> Self {
        Self {
            bump,
            time_for_penalization,
            authority,
            player_fee_lamports,
        }
    }
}
