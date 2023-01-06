use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount, Transfer},
};

use crate::{
    constants::{ESCROW, FIRST_PLAYER, GAME},
    state::Game,
};

#[derive(Accounts)]
#[instruction(game_id: String, amount: u64)]
pub struct FirstPlayerMove<'info> {
    #[account(
        init,
        payer = first_player,
        space = Game::size(),
        seeds = [
            GAME.as_ref(),
            first_player.key().as_ref(),
            game_id.as_bytes()
        ],
        bump
    )]
    pub game: Account<'info, Game>,

    #[account(
        init,
        token::mint = mint,
        token::authority = game,
        seeds = [
            game.key().as_ref(),
            ESCROW.as_ref(),
            FIRST_PLAYER.as_ref(),
        ],
        bump,
        payer = first_player
    )]
    pub first_player_escrow: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = first_player_token_account.mint == mint.key(),
        constraint = first_player_token_account.owner == first_player.key(),
        constraint = first_player_token_account.amount >= amount
    )]
    pub first_player_token_account: Account<'info, TokenAccount>,
    #[account(
        // Constraint for Bonk ;)
        // address = pubkey!("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263")
    )]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub first_player: Signer<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

/// Player one creates the game, providing the first hash (choice + salt).
pub fn first_player_move(
    ctx: Context<FirstPlayerMove>,
    game_id: String,
    amount: u64,
    first_player_hash: [u8; 32], // Choice + Salt
) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let first_player_token_account = &mut ctx.accounts.first_player_token_account;
    let first_player_escrow = &mut ctx.accounts.first_player_escrow;
    let _hash = anchor_lang::solana_program::hash::Hash::new_from_array(first_player_hash);
    let bump = ctx.bumps.get("game").unwrap();

    let mint = ctx.accounts.mint.key();
    let first_player = ctx.accounts.first_player.key();

    // Transfer the tokens to the escrow account.
    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: first_player_token_account.to_account_info(),
                to: first_player_escrow.to_account_info(),
                authority: ctx.accounts.first_player.to_account_info(),
            },
        ),
        amount,
    )?;

    game.set_inner(Game::new(
        *bump,
        game_id,
        mint,
        amount,
        first_player,
        first_player_hash,
        first_player_escrow.key(),
    ));
    Ok(())
}
