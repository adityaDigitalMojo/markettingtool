const googleService = require('./backend/src/google_service');
const GoogleEngine = require('./backend/src/google_engine');
require('dotenv').config({ path: './backend/.env' });

async function checkRecs() {
    try {
        console.log("Fetching raw keywords...");
        const raw = await googleService.fetchKeywords('LAST_30_DAYS');
        console.log(`Fetched ${raw.length} keywords.`);

        const counts = {
            lp: raw.filter(k => k.lp_exp === 'BELOW_AVERAGE').length,
            creative: raw.filter(k => k.creative_quality === 'BELOW_AVERAGE').length,
            ctr: raw.filter(k => k.exp_ctr === 'BELOW_AVERAGE').length
        };
        console.log("Below Average Counts:", counts);

        const processed = GoogleEngine.processKeywords(raw);
        const withRecs = processed.flatMap(g => g.keywords).filter(k => k.recommendation);
        console.log(`Keywords with recommendations: ${withRecs.length}`);

        if (withRecs.length > 0) {
            console.log("Sample Recommendation:", JSON.stringify(withRecs[0].recommendation, null, 2));
        }
    } catch (err) {
        console.error(err);
    }
}

checkRecs();
