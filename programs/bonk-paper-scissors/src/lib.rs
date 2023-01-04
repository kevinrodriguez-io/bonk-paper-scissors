pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::{prelude::*};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{burn, transfer, Burn, Mint, Token, TokenAccount, Transfer},
};

use constants::GAME;
use error::BPSError::BPSError;
use state::{Choice, Game, GameState};

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
        let game = &mut ctx.accounts.game;
        let first_player_token_account = &mut ctx.accounts.first_player_token_account;
        let first_player_escrow = &mut ctx.accounts.first_player_escrow;

        let bump = ctx.bumps.get("game").unwrap();

        let mint = ctx.accounts.mint.key();
        let first_player = ctx.accounts.first_player.key();

        // Transfer the tokens to the escrow account.
        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: first_player_token_account.to_account_info(),
                to: first_player_escrow.to_account_info(),
                authority: ctx.accounts.first_player.to_account_info(),
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

    // TODO: If a player doesn't reveal in 7 days, the game assumes forfeit.
    pub fn reveal(ctx: Context<Reveal>, choice: Choice, _salt: [u8; 32]) -> Result<()> {
        let clock = Clock::get()?;
        let game = &mut ctx.accounts.game;

        let _choice_bytes = (choice.clone() as u8).to_le_bytes();
        let player_key = ctx.accounts.player.key();

        require!(
            game.game_state == GameState::StartedAndWaitingForReveal,
            BPSError::InvalidGameState
        );
        if player_key == game.first_player {
            require!(
                game.first_player_choice.is_none(),
                BPSError::PlayerAlreadyMoved
            );
            // TODO: Check hash
            game.set_first_player_choice(choice, clock.unix_timestamp);
        } else if player_key == game.second_player.unwrap() {
            require!(
                game.second_player_choice.is_none(),
                BPSError::PlayerAlreadyMoved
            );
            // TODO: Check hash
            game.set_second_player_choice(choice, clock.unix_timestamp);
        } else {
            return err!(BPSError::InvalidPlayer);
        }
        Ok(())
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        let clock = Clock::get()?;
        let game = &mut ctx.accounts.game;
        let mint = &ctx.accounts.mint;
        let first_player_escrow = &mut ctx.accounts.first_player_escrow;
        let first_player_token_account = &mut ctx.accounts.first_player_token_account;
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

        let game_seeds = &[b"game", game.first_player.as_ref(), &[game.bump]];
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

        if first_player_wins {
            // ----- Transfer 90% of the tokens to the first player -----
            transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer { from: first_player_escrow.to_account_info(), to: first_player_token_account.to_account_info(), authority: game.to_account_info(), },
                ).with_signer(game_signer), (game.amount_to_match as f64 * 0.9) as u64
            )?;
            transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer { from: second_player_escrow.to_account_info(), to: first_player_token_account.to_account_info(), authority: game.to_account_info(), },
                ).with_signer(game_signer), (game.amount_to_match as f64 * 0.9) as u64,
            )?;
            // ----- Transfer 90% of the tokens to the first player -----

            // ----- Burn 10% of each player's funds -----
            burn(CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn { mint: mint.to_account_info(), authority: game.to_account_info(), from: first_player_escrow.to_account_info(), }
            ).with_signer(game_signer), (game.amount_to_match as f64 * 0.1) as u64)?; // Burn 10%
            burn(CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn { mint: mint.to_account_info(), authority: game.to_account_info(), from: second_player_escrow.to_account_info(), }
            ).with_signer(game_signer), (game.amount_to_match as f64 * 0.1) as u64)?; // Burn 10%
            // ----- Burn 10% of each player's funds -----

            game.game_state = GameState::FirstPlayerWon;
        } else if second_player_wins {
            // ----- Transfer 90% of the tokens to the second player -----
            transfer(CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer { from: second_player_escrow.to_account_info(), to: second_player_token_account.to_account_info(), authority: game.to_account_info(), },
            ).with_signer(game_signer), (game.amount_to_match as f64 * 0.9) as u64)?;
            transfer(CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer { from: first_player_escrow.to_account_info(), to: second_player_token_account.to_account_info(), authority: game.to_account_info(), },
            ).with_signer(game_signer), (game.amount_to_match as f64 * 0.9) as u64)?;
            // ----- Transfer 90% of the tokens to the second player -----

            // ----- Burn 10% of each player's funds -----
            burn(CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn { mint: mint.to_account_info(), authority: game.to_account_info(), from: first_player_escrow.to_account_info(), }
            ).with_signer(game_signer), (game.amount_to_match as f64 * 0.1) as u64)?; // Burn 10%
            burn(CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn { mint: mint.to_account_info(), authority: game.to_account_info(), from: second_player_escrow.to_account_info(), }
            ).with_signer(game_signer), (game.amount_to_match as f64 * 0.1) as u64)?; // Burn 10%
            // ----- Burn 10% of each player's funds -----

            game.game_state = GameState::SecondPlayerWon;
        } else {
            // ----- Return all funds to the original accounts -----
            transfer(CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer { from: first_player_escrow.to_account_info(), to: first_player_token_account.to_account_info(), authority: game.to_account_info(), },
            ).with_signer(game_signer), game.amount_to_match)?;
            transfer(CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer { from: second_player_escrow.to_account_info(), to: second_player_token_account.to_account_info(), authority: game.to_account_info(), },
            ).with_signer(game_signer), game.amount_to_match)?;
            // ----- Return all funds to the original accounts -----
            game.game_state = GameState::Draw;
        }

        Ok(())
    }
}

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
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub first_player: Signer<'info>,
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
        payer = second_player
    )]
    pub second_player_escrow: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = second_player_token_account.mint == mint.key(),
        constraint = second_player_token_account.owner == second_player.key(),
        constraint = second_player_token_account.amount >= game.amount_to_match
    )]
    pub second_player_token_account: Account<'info, TokenAccount>,
    #[account(address = game.mint)]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub second_player: Signer<'info>,
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
        bump = game.bump
    )]
    pub game: Account<'info, Game>,
    pub player: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(game_id: String)]
pub struct Claim<'info> {
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
        mut,
        close = first_player,
        token::mint = game.mint,
        token::authority = game,
    )]
    pub first_player_escrow: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = first_player_token_account.mint == game.mint,
        constraint = first_player_token_account.owner == first_player.key(),
        constraint = first_player_token_account.amount >= game.amount_to_match
    )]
    pub first_player_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        close = second_player,
        token::mint = game.mint,
        token::authority = game,
    )]
    pub second_player_escrow: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = second_player_token_account.mint == game.mint,
        constraint = second_player_token_account.owner == second_player.key(),
        constraint = second_player_token_account.amount >= game.amount_to_match
    )]
    pub second_player_token_account: Account<'info, TokenAccount>,

    #[account(
        mut, 
        address = game.mint
    )]
    pub mint: Account<'info, Mint>,

    // CHECK: No use to check this.
    pub first_player: AccountInfo<'info>,
    // CHECK: No use to check this.
    pub second_player: AccountInfo<'info>,

    pub payer: Signer<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
