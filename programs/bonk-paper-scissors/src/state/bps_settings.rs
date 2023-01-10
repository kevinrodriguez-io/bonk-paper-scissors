use anchor_lang::prelude::*;

#[account]
pub struct BpsSettings {
    pub bump: u8,
    pub time_for_penalization: i64,
}

impl BpsSettings {
    pub fn size() -> usize {
        8 + // discriminator
        1 + // bump
        8 // time_for_penalization
    }
    pub fn new(bump: u8, time_for_penalization: i64) -> Self {
        Self {
            bump,
            time_for_penalization,
        }
    }
}
