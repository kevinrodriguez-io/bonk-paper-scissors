use anchor_lang::prelude::*;
use solana_program::pubkey;

use crate::{constants::BPS_SETTINGS, state::BpsSettings};

#[derive(Accounts)]
pub struct UpdateBpsSettings<'info> {
    #[account(
        mut,
        seeds = [BPS_SETTINGS.as_ref()],
        bump = bps_settings.bump,
        realloc = BpsSettings::size_v2(),
        realloc::payer = signer,
        realloc::zero = false,
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
    player_fee_lamports: u64,
) -> Result<()> {
    let bps_settings = &mut ctx.accounts.bps_settings;
    let signer = &ctx.accounts.signer;
    bps_settings.time_for_penalization = time_for_penalization;
    bps_settings.authority = signer.key();
    bps_settings.player_fee_lamports = player_fee_lamports;
    Ok(())
}
