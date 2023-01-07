use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{burn, transfer, Burn, Mint, Token, TokenAccount, Transfer},
};

use crate::{
    constants::GAME,
    error::BPSError,
    state::{Choice, Game, GameState},
};

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(
        mut,
        seeds = [
            GAME.as_ref(),
            game.first_player.as_ref(),
            game.game_id.as_bytes()
        ],
        bump = game.bump
    )]
    pub game: Box<Account<'info, Game>>,

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

    #[account(
        mut,
        address = game.mint
    )]
    pub mint: Account<'info, Mint>,

    /// CHECK: No use to check this. (Checked by CPI)
    #[account(mut)]
    pub first_player: AccountInfo<'info>,
    /// CHECK: No use to check this. (Checked by CPI)
    #[account(mut)]
    pub second_player: AccountInfo<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn claim(ctx: Context<Claim>) -> Result<()> {
    let clock = Clock::get()?;
    let game = &mut ctx.accounts.game;
    let mint = &ctx.accounts.mint;
    let first_player = &ctx.accounts.first_player;
    let first_player_escrow = &mut ctx.accounts.first_player_escrow;
    let first_player_token_account = &mut ctx.accounts.first_player_token_account;
    let second_player = &ctx.accounts.second_player;
    let second_player_escrow = &mut ctx.accounts.second_player_escrow;
    let second_player_token_account = &mut ctx.accounts.second_player_token_account;

    require!(
        game.game_state == GameState::StartedAndWaitingForReveal,
        BPSError::InvalidGameState
    );
    require!(
        game.first_player_revealed_at.is_some() && game.second_player_revealed_at.is_some(),
        BPSError::InvalidGameState
    );

    let game_seeds = &[
        b"game",
        game.first_player.as_ref(),
        game.game_id.as_bytes(),
        &[game.bump],
    ];
    let game_signer = &[&game_seeds[..]];

    let first_player_choice = game.first_player_choice.as_ref().unwrap();
    let second_player_choice = game.second_player_choice.as_ref().unwrap();

    let first_player_wins = game.did_second_player_forfeit(clock.unix_timestamp)
        || match (first_player_choice, second_player_choice) {
            (Choice::Bonk, Choice::Scissors) => true,
            (Choice::Paper, Choice::Bonk) => true,
            (Choice::Scissors, Choice::Paper) => true,
            _ => false,
        };

    let second_player_wins = game.did_first_player_forfeit(clock.unix_timestamp)
        || match (second_player_choice, first_player_choice) {
            (Choice::Bonk, Choice::Scissors) => true,
            (Choice::Paper, Choice::Bonk) => true,
            (Choice::Scissors, Choice::Paper) => true,
            _ => false,
        };

    let amount_to_pay = (game.amount_to_match as f64 * 0.9) as u64;
    let amount_to_burn = (game.amount_to_match as f64 * 0.1) as u64;

    if first_player_wins {
        // ----- Transfer 90% of the tokens to the first player -----
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
            amount_to_pay,
        )?;
        transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: second_player_escrow.to_account_info(),
                    to: first_player_token_account.to_account_info(),
                    authority: game.to_account_info(),
                },
            )
            .with_signer(game_signer),
            amount_to_pay,
        )?;
        // ----- Transfer 90% of the tokens to the first player -----

        // ----- Burn 10% of each player's funds -----
        burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: mint.to_account_info(),
                    authority: game.to_account_info(),
                    from: first_player_escrow.to_account_info(),
                },
            )
            .with_signer(game_signer),
            amount_to_burn,
        )?; // Burn 10%
        burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: mint.to_account_info(),
                    authority: game.to_account_info(),
                    from: second_player_escrow.to_account_info(),
                },
            )
            .with_signer(game_signer),
            amount_to_burn,
        )?; // Burn 10%
        // ----- Burn 10% of each player's funds -----

        game.game_state = GameState::FirstPlayerWon;
        game.set_claim_fields(
            first_player.key(),
            second_player.key(),
            amount_to_pay * 2,
            amount_to_burn * 2,
            clock.unix_timestamp,
        );
    } else if second_player_wins {
        msg!("Second player wins");
        // ----- Transfer 90% of the tokens to the second player -----
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
            amount_to_pay,
        )?;
        transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: first_player_escrow.to_account_info(),
                    to: second_player_token_account.to_account_info(),
                    authority: game.to_account_info(),
                },
            )
            .with_signer(game_signer),
            amount_to_pay,
        )?;
        // ----- Transfer 90% of the tokens to the second player -----

        // ----- Burn 10% of each player's funds -----
        burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: mint.to_account_info(),
                    authority: game.to_account_info(),
                    from: first_player_escrow.to_account_info(),
                },
            )
            .with_signer(game_signer),
            amount_to_burn,
        )?; // Burn 10%
        burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: mint.to_account_info(),
                    authority: game.to_account_info(),
                    from: second_player_escrow.to_account_info(),
                },
            )
            .with_signer(game_signer),
            amount_to_burn,
        )?; // Burn 10%
            // ----- Burn 10% of each player's funds -----

        game.game_state = GameState::SecondPlayerWon;
        game.set_claim_fields(
            second_player.key(),
            first_player.key(),
            amount_to_pay * 2,
            amount_to_burn * 2,
            clock.unix_timestamp,
        );
    } else {
        // ----- Return all funds to the original accounts -----
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
        // ----- Return all funds to the original accounts -----
        game.game_state = GameState::Draw;
        game.set_claim_fields(
            second_player.key(),
            first_player.key(),
            amount_to_pay * 2,
            amount_to_burn * 2,
            clock.unix_timestamp,
        );
    }

    Ok(())
}
