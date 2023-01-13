use anchor_lang::prelude::*;
use solana_program::pubkey;

use crate::{constants::BPS_SETTINGS, state::BpsSettings};

#[derive(Accounts)]
pub struct InitBpsSettings<'info> {
    #[account(
        init,
        payer = signer,
        space = BpsSettings::size_v2(),
        seeds = [BPS_SETTINGS.as_ref()],
        bump
    )]
    pub bps_settings: Account<'info, BpsSettings>,
    #[account(
        mut,
        address = pubkey!("bpstzWLPDetyjiD33HPGGE96MzkhEA7dhRFzhc8Ay5R")
    )]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn init_bps_settings(
    ctx: Context<InitBpsSettings>,
    time_for_penalization: i64,
    game_fee_lamports: u64,
) -> Result<()> {
    let bps_settings = &mut ctx.accounts.bps_settings;
    let signer = &ctx.accounts.signer;
    let bump = ctx.bumps.get("bps_settings").unwrap();
    bps_settings.set_inner(BpsSettings::new(
        *bump,
        time_for_penalization,
        signer.key(),
        game_fee_lamports,
    ));
    Ok(())
}
