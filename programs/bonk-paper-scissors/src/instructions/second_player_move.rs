use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke, system_instruction},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount, Transfer},
};

use crate::{
    constants::{BPS_SETTINGS, ESCROW, GAME, SECOND_PLAYER},
    error::BPSError,
    state::{BpsSettings, Game, GameState},
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
    pub mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        constraint = game.first_player != second_player.key() @ BPSError::FirstPlayerCantJoinAsSecondPlayer,
    )]
    pub second_player: Signer<'info>,

    #[account(
        seeds = [BPS_SETTINGS.as_ref()],
        bump = bps_settings.bump,
    )]
    pub bps_settings: Box<Account<'info, BpsSettings>>,

    /// CHECK: Address check is enough.
    #[account(
        mut,
        address = bps_settings.authority
    )]
    pub bps_treasury: AccountInfo<'info>,

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
    let second_player = &mut ctx.accounts.second_player;
    let bps_settings = &ctx.accounts.bps_settings;
    let bps_treasury = &mut ctx.accounts.bps_treasury;
    require!(
        game.game_state == GameState::CreatedAndWaitingForStart,
        BPSError::InvalidGameState
    );

    let second_player_key = second_player.key();

    // Transfer the tokens to the escrow account.
    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: second_player_token_account.to_account_info(),
                to: second_player_escrow.to_account_info(),
                authority: second_player.to_account_info(),
            },
        ),
        game.amount_to_match,
    )?;

    // Pay the fee to the treasury.
    invoke(
        &system_instruction::transfer(
            &second_player_key,
            &bps_settings.authority,
            bps_settings.player_fee_lamports,
        ),
        &[
            second_player.to_account_info(),
            bps_treasury.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    game.set_second_player(
        second_player_key,
        second_player_hash,
        second_player_escrow.key(),
    );

    Ok(())
}
