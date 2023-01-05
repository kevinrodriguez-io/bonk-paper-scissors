use anchor_lang::prelude::*;

#[account]
pub struct Receipt {
    pub game_id: String,
    pub game_key: Pubkey,
    pub winner: Option<Pubkey>,
    pub loser: Option<Pubkey>,
    pub amount_won: u64,
    pub amount_burned: u64,
    pub drawn_at: i64,
}

impl Receipt {
    pub fn size() -> usize {
        8 + // discriminator
        4 + 32 + // game_id
        32 + // game_key
        1+ 32 + // winner
        1+ 32 + // loser
        8 + // amount_won
        8 + // amount_burned
        8 // drawn_at
    }

    pub fn new(
        game_id: String,
        game_key: Pubkey,
        winner: Option<Pubkey>,
        loser: Option<Pubkey>,
        amount_won: u64,
        amount_burned: u64,
        drawn_at: i64,
    ) -> Self {
        Self {
            game_id,
            game_key,
            winner,
            loser,
            amount_won,
            amount_burned,
            drawn_at,
        }
    }
}
