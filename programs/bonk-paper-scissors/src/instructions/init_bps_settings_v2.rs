use anchor_lang::prelude::*;
use solana_program::pubkey;

use crate::{constants::BPS_SETTINGS_V2, state::BpsSettingsV2};

#[derive(Accounts)]
pub struct InitBpsSettingsV2<'info> {
    #[account(
        init,
        payer = signer,
        space = BpsSettingsV2::size(),
        seeds = [BPS_SETTINGS_V2.as_ref()],
        bump
    )]
    pub bps_settings_v2: Account<'info, BpsSettingsV2>,
    #[account(
        mut,
        address = pubkey!("bpstzWLPDetyjiD33HPGGE96MzkhEA7dhRFzhc8Ay5R")
    )]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn init_bps_settings_v2(
    ctx: Context<InitBpsSettingsV2>,
    time_for_penalization: i64,
    game_fee_lamports: u64,
) -> Result<()> {
    let bps_settings = &mut ctx.accounts.bps_settings_v2;
    let signer = &ctx.accounts.signer;
    let bump = ctx.bumps.get("bps_settings_v2").unwrap();
    bps_settings.set_inner(BpsSettingsV2::new(
        *bump,
        time_for_penalization,
        signer.key(),
        game_fee_lamports,
    ));
    Ok(())
}
