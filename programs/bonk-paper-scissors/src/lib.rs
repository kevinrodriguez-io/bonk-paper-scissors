pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::{prelude::*, solana_program::keccak::Hash};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount, Transfer},
};

use constants::GAME;
use state::{Choice, Game};

declare_id!("bonk8yVf477u7s7nqttS6VXFTCjbV2S5MKxmojGAa4i");

#[program]
pub mod bonk_paper_scissors {

    use super::*;

    /// Player one creates the game, providing the first hash (choice + salt).
    pub fn first_player_move(
        ctx: Context<FirstPlayerMove>,
        game_id: String,
        amount: u64,
        first_player_hash: Hash, // Choice + Salt
    ) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let first_player_token_account = &mut ctx.accounts.first_player_token_account;
        let first_player_escrow = &mut ctx.accounts.first_player_escrow;

        let bump = ctx.bumps.get("game").unwrap();

        let mint = ctx.accounts.mint.key();
        let first_player = ctx.accounts.payer.key();

        // Transfer the tokens to the escrow account.
        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: first_player_token_account.to_account_info(),
                to: first_player_escrow.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            },
        );
        transfer(cpi_context, amount)?;

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

    /// Player two starts the game, providing the second hash (choice + salt).
    pub fn second_player_move(
        ctx: Context<SecondPlayerMove>,
        second_player_hash: Hash, // Choice + Salt
    ) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let second_player_token_account = &mut ctx.accounts.second_player_token_account;
        let second_player_escrow = &mut ctx.accounts.second_player_escrow;

        let second_player = ctx.accounts.payer.key();

        // Transfer the tokens to the escrow account.
        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: second_player_token_account.to_account_info(),
                to: second_player_escrow.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
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

    pub fn reveal(ctx: Context<Reveal>, choice: Choice, salt: Hash) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(game_id: String, amount: u64)]
pub struct FirstPlayerMove<'info> {
    #[account(
        init,
        payer = payer,
        space = Game::size(),
        seeds = [
            GAME.as_ref(),
            payer.key().as_ref(),
            game_id.as_bytes()
        ],
        bump
    )]
    pub game: Account<'info, Game>,

    #[account(
        init,
        token::mint = mint,
        token::authority = game,
        payer = payer
    )]
    pub first_player_escrow: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = first_player_token_account.mint == mint.key(),
        constraint = first_player_token_account.owner == payer.key(),
        constraint = first_player_token_account.amount >= amount
    )]
    pub first_player_token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(game_id: String)]
pub struct SecondPlayerMove<'info> {
    #[account(
        seeds = [
            GAME.as_ref(),
            game.first_player.as_ref(),
            game_id.as_bytes()
        ],
        bump = game.bump
    )]
    pub game: Account<'info, Game>,

    #[account(
        init,
        token::mint = mint,
        token::authority = game,
        payer = payer
    )]
    pub second_player_escrow: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = second_player_token_account.mint == mint.key(),
        constraint = second_player_token_account.owner == payer.key(),
        constraint = second_player_token_account.amount >= game.amount_to_match
    )]
    pub second_player_token_account: Account<'info, TokenAccount>,
    #[account(address = game.mint)]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(game_id: String)]
pub struct Reveal<'info> {
    #[account(
        seeds = [
            GAME.as_ref(),
            game.first_player.as_ref(),
            game_id.as_bytes()
        ],
        bump
    )]
    pub game: Account<'info, Game>,
}
