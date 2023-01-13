pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

use instructions::*;
use state::Choice;

declare_id!("32TtZ4MYWk6zzwg8Eok3x6m85JQgcVsN97cGfUhfpNb9");

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
    pub fn cancel_game(ctx: Context<CancelGame>) -> Result<()> {
        instructions::cancel_game(ctx)
    }

    /// Player two starts the game, providing the second hash (choice + salt).
    pub fn second_player_move(
        ctx: Context<SecondPlayerMove>,
        second_player_hash: [u8; 32], // Choice + Salt
    ) -> Result<()> {
        instructions::second_player_move(ctx, second_player_hash)
    }

    /// This involves some hashing magic, but I'm a wizard ;).
    pub fn reveal(ctx: Context<Reveal>, choice: Choice, salt: [u8; 32]) -> Result<()> {
        instructions::reveal(ctx, choice, salt)
    }

    /// After both players have revealed, the game can be claimed.
    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        instructions::claim(ctx)
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

    pub fn admin_unwind_stale_game(ctx: Context<AdminUnwindStaleGame>) -> Result<()> {
        instructions::admin_unwind_stale_game(ctx)
    }

    pub fn init_bps_settings(
        ctx: Context<InitBpsSettings>,
        time_for_penalization: i64,
        game_fee_lamports: u64,
    ) -> Result<()> {
        instructions::init_bps_settings(ctx, time_for_penalization, game_fee_lamports)
    }

    pub fn update_bps_settings(
        ctx: Context<UpdateBpsSettings>,
        time_for_penalization: i64,
        player_fee_lamports: u64,
    ) -> Result<()> {
        instructions::update_bps_settings(ctx, time_for_penalization, player_fee_lamports)
    }
}
