use anchor_lang::prelude::*;

#[error_code]
pub enum BPSError {
    #[msg("Invalid Game State")]
    InvalidGameState,
    #[msg("Player already moved")]
    PlayerAlreadyMoved,
    #[msg("Invalid Player")]
    InvalidPlayer,
}
