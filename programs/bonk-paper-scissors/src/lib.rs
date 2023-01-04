pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

use instructions::*;
use state::Choice;

declare_id!("bonk8yVf477u7s7nqttS6VXFTCjbV2S5MKxmojGAa4i");

#[program]
pub mod bonk_paper_scissors {

    use super::*;

    /// Player one creates the game, providing the first hash (choice + salt).
    pub fn first_player_move(
        ctx: Context<FirstPlayerMove>,
        game_id: String,
        amount: u64,
        first_player_hash: [u8; 32], // Choice + Salt
    ) -> Result<()> {
        instructions::first_player_move(ctx, game_id, amount, first_player_hash)
    }

    /// Cancels a game and returns the funds to the first player.
    pub fn cancel_game(ctx: Context<CancelGame>, game_id: String) -> Result<()> {
        instructions::cancel_game(ctx, game_id)
    }

    /// Player two starts the game, providing the second hash (choice + salt).
    pub fn second_player_move(
        ctx: Context<SecondPlayerMove>,
        _game_id: String,
        second_player_hash: [u8; 32], // Choice + Salt
    ) -> Result<()> {
        instructions::second_player_move(ctx, second_player_hash)
    }

    /// This involves some hashing magic, but I'm a wizard ;).
    pub fn reveal(
        ctx: Context<Reveal>,
        _game_id: String,
        choice: Choice,
        salt: [u8; 32],
    ) -> Result<()> {
        instructions::reveal(ctx, choice, salt)
    }

    /// After both players have revealed, the game can be claimed.
    pub fn claim(ctx: Context<Claim>, game_id: String) -> Result<()> {
        instructions::claim(ctx, game_id)
    }

    // Tests hashing function
    pub fn test_hashing(
        _ctx: Context<TestHashing>,
        choice: u8,
        salt: [u8; 32],
        hash: [u8; 32],
    ) -> Result<()> {
        instructions::test_hashing(choice, salt, hash)
    }
}
