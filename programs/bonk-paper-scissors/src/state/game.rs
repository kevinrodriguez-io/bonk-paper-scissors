use anchor_lang::{prelude::*, solana_program::keccak::Hash};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum Choice {
    Bonk,
    Paper,
    Scissors,
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
    pub first_player_hash: Hash,
    pub first_player_escrow_address: Pubkey,

    pub second_player: Option<Pubkey>,
    pub second_player_hash: Option<Hash>,
    pub second_player_escrow_address: Option<Pubkey>,

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

        1 + 32 + // second_player
        1 + 32 + // second_player_hash
        1 + 32 + // second_player_escrow_address

        1 + // game_state
        128 // padding
    }

    pub fn new(
        bump: u8,
        game_id: String,
        mint: Pubkey,
        amount_to_match: u64,
        first_player: Pubkey,
        first_player_hash: Hash,
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

            second_player: None,
            second_player_hash: None,
            second_player_escrow_address: None,

            game_state: GameState::CreatedAndWaitingForStart,
        }
    }

    pub fn set_second_player(
        &mut self,
        second_player: Pubkey,
        second_player_hash: Hash,
        second_player_escrow_address: Pubkey,
    ) {
        self.second_player = Some(second_player);
        self.second_player_hash = Some(second_player_hash);
        self.second_player_escrow_address = Some(second_player_escrow_address);
        self.game_state = GameState::StartedAndWaitingForReveal;
    }
}
