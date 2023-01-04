use anchor_lang::prelude::*;

use crate::constants::SEVEN_DAYS;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum Choice {
    Bonk = 1,
    Paper = 2,
    Scissors = 3,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum GameState {
    CreatedAndWaitingForStart,
    StartedAndWaitingForReveal,
    FirstPlayerWon,
    SecondPlayerWon,
    Draw,
}

#[account]
pub struct Game {
    pub bump: u8,
    pub game_id: String,
    pub mint: Pubkey,
    pub amount_to_match: u64,

    pub first_player: Pubkey,
    pub first_player_hash: [u8; 32],
    pub first_player_escrow_address: Pubkey,
    pub first_player_choice: Option<Choice>,
    pub first_player_revealed_at: Option<i64>,

    pub second_player: Option<Pubkey>,
    pub second_player_hash: Option<[u8; 32]>,
    pub second_player_escrow_address: Option<Pubkey>,
    pub second_player_choice: Option<Choice>,
    pub second_player_revealed_at: Option<i64>,

    pub game_state: GameState,
}

impl Game {
    pub fn size() -> usize {
        8 + // Discriminator
        1 + // bump
        4 + 32 + // game_id
        32 + // mint
        8 + // amount_to_match

        32 + // first_player
        32 + // first_player_hash
        32 + // first_player_escrow_address
        1 + 1 + // first_player_choice
        1 + 8 + // first_player_revealed_at

        1 + 32 + // second_player
        1 + 32 + // second_player_hash
        1 + 32 + // second_player_escrow_address
        1 + 1 + // second_player_choice
        1 + 8 + // second_player_revealed_at

        1 + // game_state
        128 // padding
    }

    pub fn new(
        bump: u8,
        game_id: String,
        mint: Pubkey,
        amount_to_match: u64,
        first_player: Pubkey,
        first_player_hash: [u8; 32],
        first_player_escrow_address: Pubkey,
    ) -> Self {
        Self {
            bump,
            game_id,
            mint,
            amount_to_match,

            first_player,
            first_player_hash,
            first_player_escrow_address,
            first_player_choice: None,
            first_player_revealed_at: None,

            second_player: None,
            second_player_hash: None,
            second_player_escrow_address: None,
            second_player_choice: None,
            second_player_revealed_at: None,

            game_state: GameState::CreatedAndWaitingForStart,
        }
    }

    pub fn set_second_player(
        &mut self,
        second_player: Pubkey,
        second_player_hash: [u8; 32],
        second_player_escrow_address: Pubkey,
    ) {
        self.second_player = Some(second_player);
        self.second_player_hash = Some(second_player_hash);
        self.second_player_escrow_address = Some(second_player_escrow_address);
        self.game_state = GameState::StartedAndWaitingForReveal;
    }

    pub fn set_first_player_choice(&mut self, choice: Choice, revealed_at: i64) {
        self.first_player_choice = Some(choice);
        self.first_player_revealed_at = Some(revealed_at);
    }

    pub fn set_second_player_choice(&mut self, choice: Choice, revealed_at: i64) {
        self.second_player_choice = Some(choice);
        self.second_player_revealed_at = Some(revealed_at);
    }

    // A Player forfeits if seven days has passed since it's opponent revealed its choice and he didn't reveal his choice
    pub fn did_first_player_forfeit(&self, now: i64) -> bool {
        // This player did reveal, can't forfeit.
        if self.first_player_revealed_at.is_some() {
            return false;
        }
        // No player has revealed.
        if self.first_player_revealed_at.is_none() && self.second_player_revealed_at.is_none() {
            return false;
        }
        // This player didn't reveal, but seven days has passed since the other player revealed.
        return self.second_player_revealed_at.unwrap() + SEVEN_DAYS < now;
    }

    // A Player forfeits if seven days has passed since it's opponent revealed its choice and he didn't reveal his choice
    pub fn did_second_player_forfeit(&self, now: i64) -> bool {
        // This player did reveal, can't forfeit.
        if self.second_player_revealed_at.is_some() {
            return false;
        }
        // No player has revealed.
        if self.first_player_revealed_at.is_none() && self.second_player_revealed_at.is_none() {
            return false;
        }
        // This player didn't reveal, but seven days has passed since the other player revealed.
        return self.first_player_revealed_at.unwrap() + SEVEN_DAYS < now;
    }
}