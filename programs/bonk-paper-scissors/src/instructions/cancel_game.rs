use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, TokenAccount, Token, Transfer};

use crate::{
    constants::{ESCROW, FIRST_PLAYER, GAME},
    error::BPSError,
    state::{Game, GameState},
};

#[derive(Accounts)]
pub struct CancelGame<'info> {
    #[account(
        mut,
        close = first_player,
        seeds = [
            GAME.as_ref(),
            first_player.key().as_ref(),
            game.game_id.as_bytes()
        ],
        bump = game.bump,
        constraint = game.game_state == GameState::CreatedAndWaitingForStart @ BPSError::InvalidGameState,
    )]
    pub game: Account<'info, Game>,
    #[account(
        mut,
        // TODO: Figure out a way to close this, maybe in a different instruction?
        // close = first_player,
        token::mint = game.mint.key(),
        token::authority = game,
        seeds = [
            game.key().as_ref(),
            ESCROW.as_ref(),
            FIRST_PLAYER.as_ref(),
        ],
        bump,
    )]
    pub first_player_escrow: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = first_player_token_account.mint == game.mint,
        constraint = first_player_token_account.owner == first_player.key(),
    )]
    pub first_player_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        address = game.first_player,
    )]
    pub first_player: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn cancel_game(ctx: Context<CancelGame>) -> Result<()> {
    let game = &ctx.accounts.game;
    let first_player_escrow = &ctx.accounts.first_player_escrow;
    let first_player_token_account = &ctx.accounts.first_player_token_account;
    let game_seeds = &[
        b"game",
        game.first_player.as_ref(),
        game.game_id.as_bytes(),
        &[game.bump],
    ];
    let game_signer = &[&game_seeds[..]];
    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: first_player_escrow.to_account_info(),
                to: first_player_token_account.to_account_info(),
                authority: game.to_account_info(),
            },
        )
        .with_signer(game_signer),
        game.amount_to_match,
    )?;
    Ok(())
}
