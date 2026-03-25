require('dotenv').config();
const { GoogleAdsApi, enums } = require('google-ads-api');

const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_DEVELOPER_TOKEN,
});

const customer = client.Customer({
    customer_id: process.env.GOOGLE_CUSTOMER_ID,
    login_customer_id: process.env.GOOGLE_LOGIN_CUSTOMER_ID,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

async function diagnose() {
    console.log("--- DIAGNOSING GOOGLE ADS DATA (LAST 7 DAYS) ---");

    // 1. Fetch Campaigns
    const campaigns = await customer.report({
        entity: 'campaign',
        attributes: [
            'campaign.id',
            'campaign.name',
            'campaign.status',
            'campaign.advertising_channel_type'
        ],
        metrics: [
            'metrics.conversions',
            'metrics.all_conversions',
            'metrics.cost_micros',
            'metrics.impressions',
            'metrics.clicks'
        ],
        date_constant: 'LAST_7_DAYS',
    });

    console.log(`Found ${campaigns.length} campaigns.`);
    campaigns.forEach(c => {
        console.log(`- ${c.campaign.name} (${c.campaign.id}, ${c.campaign.status}): 
          Conversions: ${c.metrics.conversions}
          All Conversions: ${c.metrics.all_conversions}
          Cost: ${c.metrics.cost_micros / 1000000}
          Impressions: ${c.metrics.impressions}`);
    });

    const totalConversions = campaigns.reduce((acc, curr) => acc + curr.metrics.conversions, 0);
    const totalAllConversions = campaigns.reduce((acc, curr) => acc + curr.metrics.all_conversions, 0);

    console.log(`\nTOTAL CONVERSIONS: ${totalConversions}`);
    console.log(`TOTAL ALL_CONVERSIONS: ${totalAllConversions}`);
    console.log("-----------------------------------------------");
}

diagnose().catch(console.error);
