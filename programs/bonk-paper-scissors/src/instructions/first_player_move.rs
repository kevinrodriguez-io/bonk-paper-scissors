use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke, system_instruction},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount, Transfer},
};
use solana_program::pubkey;

use crate::{
    constants::{BPS_SETTINGS_V2, ESCROW, FIRST_PLAYER, GAME},
    error::BPSError,
    state::{BpsSettingsV2, Game},
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
        constraint = first_player_token_account.amount >= amount @ BPSError::AmountExceedsBalance
    )]
    pub first_player_token_account: Account<'info, TokenAccount>,
    #[account(
        // Constraint for Bonk ;)
        address = pubkey!("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263")
    )]
    pub mint: Box<Account<'info, Mint>>,

    #[account(
        seeds = [BPS_SETTINGS_V2.as_ref()],
        bump = bps_settings_v2.bump,
    )]
    pub bps_settings_v2: Box<Account<'info, BpsSettingsV2>>,
    /// CHECK: Address check is enough.
    #[account(
        mut,
        address = bps_settings_v2.authority
    )]
    pub bps_treasury: AccountInfo<'info>,

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
    let clock = Clock::get()?;
    let game = &mut ctx.accounts.game;
    let first_player = &ctx.accounts.first_player;
    let first_player_token_account = &mut ctx.accounts.first_player_token_account;
    let first_player_escrow = &mut ctx.accounts.first_player_escrow;
    let bps_settings_v2 = &ctx.accounts.bps_settings_v2;
    let bps_treasury = &ctx.accounts.bps_treasury;
    let _hash = anchor_lang::solana_program::hash::Hash::new_from_array(first_player_hash);
    let bump = ctx.bumps.get("game").unwrap();

    let mint = ctx.accounts.mint.key();
    let first_player_key = first_player.key();

    // Transfer the tokens to the escrow account.
    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: first_player_token_account.to_account_info(),
                to: first_player_escrow.to_account_info(),
                authority: first_player.to_account_info(),
            },
        ),
        amount,
    )?;
    // Pay the fee to the treasury.
    invoke(
        &system_instruction::transfer(
            &first_player_key,
            &bps_settings_v2.authority,
            bps_settings_v2.player_fee_lamports,
        ),
        &[
            first_player.to_account_info(),
            bps_treasury.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    game.set_inner(Game::new(
        *bump,
        game_id,
        mint,
        amount,
        clock.unix_timestamp,
        first_player_key,
        first_player_hash,
        first_player_escrow.key(),
    ));
    Ok(())
}
