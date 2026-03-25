class GoogleEngine {
    static classifyCampaigns(campaigns) {
        if (!campaigns) return [];
        return campaigns.map(c => {
            let classification = 'other';
            const name = (c.name || '').toLowerCase();

            // Refined Demand Gen detection (Name patterns from real data)
            const isDemandGen = c.type === 'DEMAND_GEN' ||
                /demand.?gen/i.test(name) ||
                name.includes('d2u') ||
                name.includes('dt5') ||
                name.includes('d2x') ||
                name.includes('dt9');

            if (name.includes('branded') || name.includes('brand')) classification = 'branded';
            else if (name.includes('location') || name.includes('specific') || name.includes('local')) classification = 'location';
            else if (isDemandGen) classification = 'demand_gen';

            // Dynamic health/class logic
            let healthClass = 'HEALTHY';
            if (c.primary_status === 'LEARNING') healthClass = 'LEARNING';
            else if (c.cpl > 1300 || c.ctr < 1.0 || c.reasons?.length > 0) healthClass = 'CRITICAL';

            return {
                ...c,
                classification,
                healthClass,
                classColor: classification === 'branded' ? 'branded' :
                    classification === 'location' ? 'location' :
                        classification === 'demand_gen' ? 'demand_gen' : 'other'
            };
        });
    }

    static processBidding(campaigns, adgroups) {
        const TARGET_CPA = 1850;
        const analysis = adgroups.map(ag => {
            const cvr = ag.cvr / 100;
            const computedMaxCpc = parseFloat((TARGET_CPA * cvr).toFixed(2));
            const currentCpc = ag.cpc;

            let recommendation = 'Bids within range';
            let action = 'Hold';
            let status = 'success';

            if (currentCpc > computedMaxCpc * 1.1) {
                recommendation = `${Math.ceil((currentCpc - computedMaxCpc) / currentCpc * 100)}% CPC exceeds justifies`;
                action = 'Decrease CPC';
                status = 'danger';
            } else if (currentCpc < computedMaxCpc * 0.7 && ag.is < 70) {
                recommendation = 'Room to increase bids';
                action = 'Increase CPC';
                status = 'warning';
            }

            return { ...ag, computedMaxCpc, recommendation, action, status };
        });

        const stats = {
            decrease: analysis.filter(a => a.status === 'danger').length,
            hold: analysis.filter(a => a.status === 'success').length,
            increase: analysis.filter(a => a.status === 'warning').length
        };

        return { analysis, stats };
    }

    static processKeywords(keywords) {
        const adGroups = {};
        keywords.forEach(k => {
            if (!adGroups[k.adGroup]) {
                adGroups[k.adGroup] = {
                    name: k.adGroup,
                    campaign: k.campaign,
                    keywords: [],
                    avgQs: 0
                };
            }
            adGroups[k.adGroup].keywords.push(k);
        });

        return Object.values(adGroups).map(group => {
            const totalQs = group.keywords.reduce((acc, curr) => acc + curr.qs, 0);
            group.avgQs = parseFloat((totalQs / group.keywords.length).toFixed(1));

            // Detailed recommendations per keyword
            group.keywords = group.keywords.map(k => {
                let rec = null;
                if (k.lp_exp === 'BELOW_AVERAGE') {
                    rec = {
                        type: 'LP_EXP',
                        action: 'Improve Landing Page',
                        status: 'CRITICAL',
                        reason: "Your landing page experience is currently below average, meaning users aren't finding what they expected quickly.",
                        steps: [
                            "Ensure the keyword is prominently featured in the main heading (H1)",
                            "Reduce page load time to under 2 seconds for mobile users",
                            "Add a clearer, high-contrast Call to Action (CTA) button"
                        ]
                    };
                } else if (k.creative_quality === 'BELOW_AVERAGE') {
                    rec = {
                        type: 'AD_REL',
                        action: 'Refine Ad Copy',
                        status: 'IMPROVE',
                        reason: "Your ad copy relevance is low. The ad doesn't strongly connect with the search query.",
                        steps: [
                            "Include the exact keyword in Headline 1",
                            "Utilize the keyword in the Display URL path",
                            "Highlight a unique selling point (USP) specifically related to this keyword"
                        ]
                    };
                } else if (k.exp_ctr === 'BELOW_AVERAGE') {
                    rec = {
                        type: 'EXP_CTR',
                        action: 'Better Hook Needed',
                        status: 'IMPROVE',
                        reason: "Your expected CTR is low. Your ad isn't as compelling as competitors' ads for this keyword.",
                        steps: [
                            "Test a more aggressive or curiosity-driven headline",
                            "Add at least 4 sitelink and 4 callout extensions",
                            "Use social proof like 'Trusted by 10k+ families' in descriptions"
                        ]
                    };
                }

                return { ...k, recommendation: rec };
            });

            return group;
        });
    }

    static processSearchTerms(terms) {
        const groups = {};
        terms.forEach(t => {
            if (!groups[t.adGroup]) {
                groups[t.adGroup] = {
                    name: t.adGroup,
                    campaign: t.campaign,
                    terms: []
                };
            }
            groups[t.adGroup].terms.push(t);
        });
        return Object.values(groups);
    }

    static processAds(ads) {
        return ads.map(ad => {
            let status = 'Healthy';
            let recommendation = null;

            if (ad.ctr < 1.0) {
                status = 'Critical';
                recommendation = { action: 'Replace Headlines', reason: 'Low CTR' };
            } else if (ad.leads === 0 && ad.spend > 5000) {
                status = 'Underperforming';
                recommendation = { action: 'Check Offer', reason: 'No Conversions' };
            } else if (ad.leads > 5) {
                status = 'Winning';
            }

            return { ...ad, status, recommendation };
        });
    }

    static generateRecommendations(campaigns) {
        if (!campaigns) return [];
        const recs = [];
        campaigns.forEach(c => {
            if (c.cpl > 1500) {
                recs.push({
                    id: `rec_cpl_${c.id}`,
                    campaignId: c.id,
                    campaignName: c.name,
                    type: 'OPTIMIZE_CPL',
                    impact: 'High',
                    description: `CPL is ₹${c.cpl}, which is above target. Check keyword intent and landing page.`,
                    action: 'Review Ad Copy'
                });
            }
            if (c.ctr < 1.0) {
                recs.push({
                    id: `rec_ctr_${c.id}`,
                    campaignId: c.id,
                    campaignName: c.name,
                    type: 'IMPROVE_CTR',
                    impact: 'Medium',
                    description: `CTR is ${c.ctr}%. Consider testing new headlines.`,
                    action: 'Fix Ad Copy'
                });
            }
        });
        return recs;
    }
}

module.exports = GoogleEngine;
