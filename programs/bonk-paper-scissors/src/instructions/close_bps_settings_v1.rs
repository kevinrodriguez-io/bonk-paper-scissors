use anchor_lang::prelude::*;
use solana_program::pubkey;

use crate::{constants::BPS_SETTINGS, state::BpsSettings};

#[derive(Accounts)]
pub struct CloseBpsSettingsV1<'info> {
    #[account(
        mut,
        close = signer,
        seeds = [BPS_SETTINGS.as_ref()],
        bump = bps_settings.bump
    )]
    pub bps_settings: Account<'info, BpsSettings>,
    #[account(
        mut,
        address = pubkey!("bpstzWLPDetyjiD33HPGGE96MzkhEA7dhRFzhc8Ay5R")
    )]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn close_bps_settings_v1() -> Result<()> {
    Ok(())
}
