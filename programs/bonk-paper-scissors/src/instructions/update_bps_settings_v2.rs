use anchor_lang::prelude::*;
use solana_program::pubkey;

use crate::{constants::BPS_SETTINGS_V2, state::BpsSettingsV2};

#[derive(Accounts)]
pub struct UpdateBpsSettingsV2<'info> {
    #[account(
        mut,
        seeds = [BPS_SETTINGS_V2.as_ref()],
        bump = bps_settings_v2.bump,
    )]
    pub bps_settings_v2: Account<'info, BpsSettingsV2>,
    #[account(
        mut,
        address = pubkey!("bpstzWLPDetyjiD33HPGGE96MzkhEA7dhRFzhc8Ay5R")
    )]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn update_bps_settings_v2(
    ctx: Context<UpdateBpsSettingsV2>,
    time_for_penalization: i64,
    player_fee_lamports: u64,
) -> Result<()> {
    let bps_settings = &mut ctx.accounts.bps_settings_v2;
    let signer = &ctx.accounts.signer;
    bps_settings.time_for_penalization = time_for_penalization;
    bps_settings.authority = signer.key();
    bps_settings.player_fee_lamports = player_fee_lamports;
    Ok(())
}
