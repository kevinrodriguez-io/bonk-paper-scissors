use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Token, TokenAccount, Transfer},
};
use solana_program::pubkey;

use crate::{
    constants::GAME,
    state::{Game, GameState}, error::BPSError,
};

#[derive(Accounts)]
pub struct AdminUnwindStaleGame<'info> {
    #[account(
        mut,
        close = first_player,
        seeds = [
            GAME.as_ref(),
            first_player.key().as_ref(),
            game.game_id.as_bytes()
        ],
        constraint = game.game_state == GameState::StartedAndWaitingForReveal,
        bump = game.bump
    )]
    pub game: Account<'info, Game>,

    #[account(
        mut,
        // TODO: Figure out a way to close this, maybe in a different instruction?
        // close = first_player,
        token::mint = game.mint,
        token::authority = game,
    )]
    pub first_player_escrow: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = first_player_token_account.mint == game.mint,
        constraint = first_player_token_account.owner == first_player.key(),
        constraint = first_player_token_account.amount >= game.amount_to_match
    )]
    pub first_player_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        // TODO: Figure out a way to close this, maybe in a different instruction?
        // close = second_player,
        token::mint = game.mint,
        token::authority = game,
    )]
    pub second_player_escrow: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = second_player_token_account.mint == game.mint,
        constraint = second_player_token_account.owner == second_player.key(),
        constraint = second_player_token_account.amount >= game.amount_to_match
    )]
    pub second_player_token_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: No use to check this. (Checked by CPI)
    #[account(
        mut,
        address = game.first_player,
    )]
    pub first_player: AccountInfo<'info>,
    /// CHECK: No use to check this. (Checked by CPI)
    #[account(
        mut,
        address = game.second_player.unwrap(),
    )]
    pub second_player: AccountInfo<'info>,

    // Program upgrade authority
    #[account(mut, address = pubkey!("bpstzWLPDetyjiD33HPGGE96MzkhEA7dhRFzhc8Ay5R"))]
    pub signer: Signer<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn admin_unwind_stale_game(ctx: Context<AdminUnwindStaleGame>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let first_player_escrow = &mut ctx.accounts.first_player_escrow;
    let first_player_token_account = &mut ctx.accounts.first_player_token_account;
    let second_player_escrow = &mut ctx.accounts.second_player_escrow;
    let second_player_token_account = &mut ctx.accounts.second_player_token_account;
    require!(game.game_state == GameState::StartedAndWaitingForReveal, BPSError::InvalidGameState);
    require!(game.first_player_revealed_at.is_none(), BPSError::InvalidGameState);
    require!(game.second_player_revealed_at.is_none(), BPSError::InvalidGameState);

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
    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: second_player_escrow.to_account_info(),
                to: second_player_token_account.to_account_info(),
                authority: game.to_account_info(),
            },
        )
        .with_signer(game_signer),
        game.amount_to_match,
    )?;
    Ok(())
}
