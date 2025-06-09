use anchor_lang::prelude::*;

declare_id!("YOUR_PROGRAM_ID");

#[program]
pub mod aimpact_recommender {
    use super::*;

    pub fn store_recommendation(ctx: Context<StoreRecommendation>, data: String) -> Result<()> {
        let recommendation = &mut ctx.accounts.recommendation;
        recommendation.data = data;
        recommendation.owner = *ctx.accounts.user.key;
        Ok(())
    }
}

#[account]
pub struct Recommendation {
    pub data: String,
    pub owner: Pubkey,
}

#[derive(Accounts)]
pub struct StoreRecommendation<'info> {
    #[account(init, payer = user, space = 8 + 256 + 32)]
    pub recommendation: Account<'info, Recommendation>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}