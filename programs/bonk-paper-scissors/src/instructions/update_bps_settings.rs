use anchor_lang::prelude::*;
use solana_program::pubkey;

use crate::{constants::BPS_SETTINGS, state::BpsSettings};

#[derive(Accounts)]
pub struct UpdateBpsSettings<'info> {
    #[account(
        mut,
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

pub fn update_bps_settings(
    ctx: Context<UpdateBpsSettings>,
    time_for_penalization: i64,
) -> Result<()> {
    let bps_settings = &mut ctx.accounts.bps_settings;
    bps_settings.time_for_penalization = time_for_penalization;
    Ok(())
}
