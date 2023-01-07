use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount, Transfer},
};

use crate::{
    constants::{ESCROW, GAME, SECOND_PLAYER},
    error::BPSError,
    state::{Game, GameState},
};

#[derive(Accounts)]
pub struct SecondPlayerMove<'info> {
    #[account(
        mut,
        seeds = [
            GAME.as_ref(),
            game.first_player.as_ref(),
            game.game_id.as_bytes()
        ],
        bump = game.bump
    )]
    pub game: Account<'info, Game>,

    #[account(
        init,
        token::mint = mint,
        token::authority = game,
        seeds = [game.key().as_ref(), ESCROW.as_ref(), SECOND_PLAYER.as_ref()],
        bump,
        payer = second_player
    )]
    pub second_player_escrow: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = second_player_token_account.mint == mint.key(),
        constraint = second_player_token_account.owner == second_player.key(),
        constraint = second_player_token_account.amount >= game.amount_to_match @ BPSError::AmountExceedsBalance
    )]
    pub second_player_token_account: Account<'info, TokenAccount>,
    #[account(address = game.mint)]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = game.first_player != second_player.key() @ BPSError::FirstPlayerCantJoinAsSecondPlayer,
    )]
    pub second_player: Signer<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

/// Player two starts the game, providing the second hash (choice + salt).
pub fn second_player_move(
    ctx: Context<SecondPlayerMove>,
    second_player_hash: [u8; 32], // Choice + Salt
) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let second_player_token_account = &mut ctx.accounts.second_player_token_account;
    let second_player_escrow = &mut ctx.accounts.second_player_escrow;
    require!(
        game.game_state == GameState::CreatedAndWaitingForStart,
        BPSError::InvalidGameState
    );

    let second_player = ctx.accounts.second_player.key();

    // Transfer the tokens to the escrow account.
    let cpi_context = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: second_player_token_account.to_account_info(),
            to: second_player_escrow.to_account_info(),
            authority: ctx.accounts.second_player.to_account_info(),
        },
    );
    transfer(cpi_context, game.amount_to_match)?;

    game.set_second_player(
        second_player,
        second_player_hash,
        second_player_escrow.key(),
    );

    Ok(())
}
