use anchor_lang::prelude::*;

use crate::{constants::GAME, state::{Game, Choice, GameState}, error::BPSError};

#[derive(Accounts)]
pub struct Reveal<'info> {
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
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn reveal(
    ctx: Context<Reveal>,
    choice: Choice,
    salt: [u8; 32],
) -> Result<()> {
    let clock = Clock::get()?;
    let game = &mut ctx.accounts.game;

    let choice_bytes = choice.clone() as u8;
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
        let created_hash = anchor_lang::solana_program::hash::hashv(&[&[choice_bytes], &salt]);
        let stored_hash =
            anchor_lang::solana_program::hash::Hash::new_from_array(game.first_player_hash);
        require_eq!(created_hash, stored_hash, BPSError::InvalidHash);
        game.set_first_player_choice(choice.into(), clock.unix_timestamp);
    } else if player_key == game.second_player.unwrap() {
        require!(
            game.second_player_choice.is_none(),
            BPSError::PlayerAlreadyMoved
        );
        let created_hash = anchor_lang::solana_program::hash::hashv(&[&[choice_bytes], &salt]);
        let stored_hash = anchor_lang::solana_program::hash::Hash::new_from_array(
            game.second_player_hash.unwrap(),
        );
        require_eq!(created_hash, stored_hash, BPSError::InvalidHash);
        game.set_second_player_choice(choice, clock.unix_timestamp);
    } else {
        return err!(BPSError::InvalidPlayer);
    }
    Ok(())
}
