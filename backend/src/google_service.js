const { GoogleAdsApi } = require('google-ads-api');

class GoogleAdsService {
    _resolveDateRange(range) {
        const today = new Date();
        const formatDate = (date) => date.toISOString().split('T')[0].split('-').join('');
        
        const presets = {
            'LAST_7_DAYS': 'LAST_7_DAYS',
            'LAST_30_DAYS': 'LAST_30_DAYS',
            'ALL_TIME': 'ALL_TIME'
        };

        if (presets[range]) return presets[range];

        let startDate = new Date();
        if (range === 'LAST_90_DAYS' || range === '3m') {
            startDate.setDate(today.getDate() - 90);
        } else if (range === '7D') {
            return 'LAST_7_DAYS';
        } else if (range === '30D') {
            return 'LAST_30_DAYS';
        } else {
            // Default fallback
            return 'LAST_30_DAYS';
        }

        return `${formatDate(startDate)},${formatDate(today)}`;
    }

    constructor(credentials) {
        this.client = null;
        this.customer = null;

        // Sanitize customer IDs by removing dashes
        this.customer_id = credentials.customerId ? credentials.customerId.toString().replace(/-/g, '') : null;
        const login_customer_id = credentials.loginCustomerId ? credentials.loginCustomerId.toString().replace(/-/g, '') : null;

        if (!credentials.clientId || !credentials.clientSecret || !credentials.refreshToken || !this.customer_id) {
            console.warn("⚠️ Google Ads API credentials incomplete for client.");
            return;
        }

        try {
            console.log(`[GoogleAdsService] Initializing for Customer: ${this.customer_id}, Login: ${login_customer_id}`);
            this.client = new GoogleAdsApi({
                client_id: credentials.clientId,
                client_secret: credentials.clientSecret,
                developer_token: credentials.developerToken,
            });
            this.customer = this.client.Customer({
                customer_id: this.customer_id,
                login_customer_id: login_customer_id,
                refresh_token: credentials.refreshToken,
            });
        } catch (err) {
            console.error("❌ Failed to initialize Google Ads Client:", err);
        }
    }

    async fetchHistoricalMetrics(range = 'LAST_30_DAYS') {
        if (!this.customer) return [];
        try {
            const today = new Date();
            const formatDateQuery = (date) => date.toISOString().split('T')[0];

            let start = new Date();
            if (range === 'LAST_7_DAYS') {
                start.setDate(today.getDate() - 7);
            } else if (range === 'LAST_30_DAYS' || range === '30D') {
                start.setDate(today.getDate() - 30);
            } else if (range === 'ALL_TIME' || range === 'ALL') {
                start = new Date('2024-01-01');
            } else {
                start.setDate(today.getDate() - 30);
            }

            const startDate = formatDateQuery(start);
            const endDate = formatDateQuery(today);

            const history = await this.customer.query(`
                SELECT 
                    segments.date, 
                    metrics.all_conversions, 
                    metrics.cost_micros 
                FROM campaign 
                WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
            `);

            const grouped = {};
            history.forEach(h => {
                const date = h.segments.date;
                if (!grouped[date]) {
                    grouped[date] = { name: date, leads: 0, spend: 0 };
                }
                grouped[date].leads += Math.round(parseFloat(h.metrics.all_conversions || 0));
                grouped[date].spend += parseFloat((h.metrics.cost_micros / 1000000).toFixed(2));
            });

            return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
        } catch (err) {
            console.error("Error fetching historical metrics:", err);
            return [];
        }
    }

    async fetchCampaigns(range = 'LAST_30_DAYS') {
        if (!this.customer) return [];
        try {
            const resolvedRange = this._resolveDateRange(range);
            console.log(`[GoogleAdsService] Fetching campaigns for resolved range: ${resolvedRange}`);
            const campaigns = await this.customer.report({
                entity: 'campaign',
                attributes: [
                    'campaign.id',
                    'campaign.name',
                    'campaign.status',
                    'campaign.advertising_channel_type',
                    'campaign.bidding_strategy_type',
                    'metrics.all_conversions',
                    'metrics.cost_per_conversion',
                    'metrics.ctr',
                    'metrics.average_cpc',
                    'metrics.cost_micros',
                    'campaign_budget.amount_micros',
                    'campaign.primary_status',
                    'campaign.primary_status_reasons'
                ],
                date_range: resolvedRange,
                limit: 100,
            });


            if (!campaigns || campaigns.length === 0) return [];

            return campaigns.map(c => {
                const statusMap = { 2: 'ENABLED', 3: 'PAUSED', 4: 'REMOVED' };
                const status = statusMap[c.campaign.status] || 'UNKNOWN';

                const primaryStatusMap = {
                    2: 'ELIGIBLE', 3: 'LEARNING', 4: 'PAUSED', 5: 'REMOVED', 6: 'ENDED', 7: 'PENDING', 8: 'LIMITED'
                };
                const primaryStatus = primaryStatusMap[c.campaign.primary_status] || status;

                return {
                    id: c.campaign.id,
                    name: c.campaign.name,
                    status: status,
                    primary_status: primaryStatus,
                    reasons: (c.campaign.primary_status_reasons || []).map(r => {
                        const reasonMap = { 2: 'REACHED_BUDGET_LIMIT', 3: 'AUCTION_LIMITED', 4: 'NOT_ELIGIBLE', 5: 'HAS_AD_GROUP_ISSUES' };
                        return reasonMap[r] || r;
                    }),
                    type: c.campaign.advertising_channel_type,
                    budget: parseFloat((c.campaign_budget.amount_micros / 1000000).toFixed(0)),
                    leads: Math.round(c.metrics.all_conversions || 0),
                    spend: parseFloat((c.metrics.cost_micros / 1000000).toFixed(2)),
                    cpl: parseFloat((c.metrics.cost_per_conversion / 1000000).toFixed(0)),
                    ctr: parseFloat((c.metrics.ctr * 100).toFixed(2)),
                    cpc: parseFloat((c.metrics.average_cpc / 1000000).toFixed(2)),
                    health: 85
                };
            });
        } catch (err) {
            console.error("Error fetching campaigns:", err);
            return [];
        }
    }

    async fetchAdGroups(range = 'LAST_30_DAYS') {
        if (!this.customer) return [];
        try {
            const resolvedRange = this._resolveDateRange(range);
            const adgroups = await this.customer.report({
                entity: 'ad_group',
                attributes: [
                    'ad_group.id',
                    'ad_group.name',
                    'ad_group.status',
                    'ad_group.type',
                    'campaign.id',
                    'campaign.name',
                    'metrics.all_conversions',
                    'metrics.cost_micros',
                    'metrics.cost_per_conversion',
                    'metrics.ctr',
                    'metrics.average_cpc',
                    'metrics.impressions',
                    'metrics.clicks'
                ],
                date_range: resolvedRange,
                limit: 200,
            });

            if (!adgroups) return [];

            return adgroups.map(g => {
                const typeMap = {
                    2: 'SEARCH_STANDARD', 3: 'SEARCH_DYNAMIC', 4: 'SEARCH_HPA',
                    5: 'DISPLAY_STANDARD', 6: 'DISPLAY_SMART', 7: 'DISPLAY_GMAIL',
                    8: 'SHOPPING_STANDARD', 9: 'SHOPPING_SMART',
                    10: 'VIDEO_STANDARD', 11: 'VIDEO_OUTSTREAM',
                    14: 'DEMAND_GEN'
                };
                return {
                    id: g.ad_group.id,
                    name: g.ad_group.name,
                    status: { 2: 'ENABLED', 3: 'PAUSED', 4: 'REMOVED' }[g.ad_group.status] || 'UNKNOWN',
                    type: typeMap[g.ad_group.type] || g.ad_group.type || 'UNKNOWN',
                    campaignId: g.campaign.id,
                    campaign: g.campaign.name,
                    leads: Math.round(g.metrics.all_conversions || 0),
                    spend: parseFloat((g.metrics.cost_micros / 1000000).toFixed(2)),
                    cpl: parseFloat((g.metrics.cost_per_conversion / 1000000).toFixed(0)),
                    ctr: parseFloat((g.metrics.ctr * 100).toFixed(2)),
                    cpc: parseFloat((g.metrics.average_cpc / 1000000).toFixed(2)),
                    impressions: g.metrics.impressions,
                    clicks: g.metrics.clicks,
                    cvr: g.metrics.clicks > 0 ? parseFloat(((g.metrics.all_conversions / g.metrics.clicks) * 100).toFixed(2)) : 0,
                    is: 80
                };
            });
        } catch (err) {
            console.error("Error fetching ad groups:", err);
            return [];
        }
    }

    async fetchAds(range = 'LAST_30_DAYS') {
        if (!this.customer) return [];
        try {
            const resolvedRange = this._resolveDateRange(range);
            const ads = await this.customer.report({
                entity: 'ad_group_ad',
                attributes: [
                    'ad_group_ad.ad.id',
                    'ad_group_ad.status',
                    'ad_group_ad.ad.type',
                    'ad_group_ad.ad.responsive_search_ad.headlines',
                    'ad_group_ad.ad.responsive_search_ad.descriptions',
                    'ad_group.name',
                    'campaign.name',
                    'metrics.all_conversions',
                    'metrics.cost_micros',
                    'metrics.ctr',
                    'metrics.impressions',
                    'metrics.clicks'
                ],
                date_range: resolvedRange,
                limit: 100,
            });

            if (!ads) return [];

            return ads.map(a => ({
                id: a.ad_group_ad.ad.id,
                status: { 2: 'ENABLED', 3: 'PAUSED', 4: 'REMOVED' }[a.ad_group_ad.status] || 'UNKNOWN',
                type: a.ad_group_ad.ad.type,
                adGroup: a.ad_group.name,
                campaign: a.campaign.name,
                headlines: (a.ad_group_ad.ad.responsive_search_ad?.headlines || []).map(h => h.text),
                descriptions: (a.ad_group_ad.ad.responsive_search_ad?.descriptions || []).map(d => d.text),
                leads: Math.round(a.metrics.all_conversions || 0),
                spend: parseFloat((a.metrics.cost_micros / 1000000).toFixed(2)),
                ctr: parseFloat((a.metrics.ctr * 100).toFixed(2)),
                impressions: a.metrics.impressions,
                clicks: a.metrics.clicks
            }));
        } catch (err) {
            console.error("Error fetching ads:", err);
            return [];
        }
    }

    async fetchKeywords(range = 'LAST_30_DAYS') {
        if (!this.customer) return [];
        try {
            const qsResults = await this.customer.query(`
                SELECT 
                    ad_group_criterion.criterion_id, 
                    ad_group_criterion.keyword.text, 
                    ad_group_criterion.keyword.match_type, 
                    ad_group_criterion.quality_info.quality_score, 
                    ad_group_criterion.quality_info.search_predicted_ctr, 
                    ad_group_criterion.quality_info.creative_quality_score, 
                    ad_group_criterion.quality_info.post_click_quality_score, 
                    ad_group.name, 
                    campaign.name
                FROM ad_group_criterion 
                WHERE ad_group_criterion.type = 'KEYWORD'
                AND ad_group_criterion.status = 'ENABLED'
            `);

            const metricsResults = await this.customer.query(`
                SELECT 
                    ad_group_criterion.criterion_id,
                    metrics.all_conversions, 
                    metrics.cost_micros, 
                    metrics.ctr, 
                    metrics.impressions, 
                    metrics.clicks 
                FROM keyword_view 
                WHERE ${resolvedRange.includes(',') ? `segments.date BETWEEN '${resolvedRange.split(',')[0].slice(0,4)}-${resolvedRange.split(',')[0].slice(4,6)}-${resolvedRange.split(',')[0].slice(6,8)}' AND '${resolvedRange.split(',')[1].slice(0,4)}-${resolvedRange.split(',')[1].slice(4,6)}-${resolvedRange.split(',')[1].slice(6,8)}'` : `segments.date DURING ${resolvedRange}`}
            `);

            const metricsMap = {};
            metricsResults.forEach(m => {
                metricsMap[m.ad_group_criterion.criterion_id] = m.metrics;
            });

            const qsMapLabels = { 2: 'BELOW_AVERAGE', 3: 'AVERAGE', 4: 'ABOVE_AVERAGE' };

            return qsResults.map(k => {
                const m = metricsMap[k.ad_group_criterion.criterion_id] || { all_conversions: 0, cost_micros: 0, ctr: 0, impressions: 0, clicks: 0 };
                return {
                    id: k.ad_group_criterion.criterion_id,
                    text: k.ad_group_criterion.keyword.text,
                    matchType: { 2: 'EXACT', 3: 'PHRASE', 4: 'BROAD' }[k.ad_group_criterion.keyword.match_type] || 'UNKNOWN',
                    qs: k.ad_group_criterion.quality_info?.quality_score || 0,
                    exp_ctr: qsMapLabels[k.ad_group_criterion.quality_info?.search_predicted_ctr] || 'UNKNOWN',
                    creative_quality: qsMapLabels[k.ad_group_criterion.quality_info?.creative_quality_score] || 'UNKNOWN',
                    lp_exp: qsMapLabels[k.ad_group_criterion.quality_info?.post_click_quality_score] || 'UNKNOWN',
                    adGroup: k.ad_group.name,
                    campaign: k.campaign.name,
                    leads: Math.round(m.all_conversions || 0),
                    spend: parseFloat((m.cost_micros / 1000000).toFixed(2)),
                    ctr: parseFloat((m.ctr * 100).toFixed(2)),
                    impressions: m.impressions || 0,
                    clicks: m.clicks || 0
                };
            });
        } catch (err) {
            console.error("Error in two-step keyword fetch:", err);
            return [];
        }
    }

    async fetchBreakdowns(dimension, campaignId = null, range = 'LAST_30_DAYS') {
        if (!this.customer) return [];
        try {
            let dateClause;
            const resolvedRange = this._resolveDateRange(range);
            if (resolvedRange.includes(',')) {
                const [start, end] = resolvedRange.split(',');
                dateClause = `segments.date BETWEEN '${start.slice(0,4)}-${start.slice(4,6)}-${start.slice(6,8)}' AND '${end.slice(0,4)}-${end.slice(4,6)}-${end.slice(6,8)}'`;
            } else {
                dateClause = `segments.date DURING ${resolvedRange}`;
            }
            const campaignClause = campaignId ? ` AND campaign.id = ${campaignId}` : '';

            const baseMetrics = `
                metrics.all_conversions, 
                metrics.cost_micros, 
                metrics.impressions, 
                metrics.clicks, 
                metrics.ctr, 
                metrics.average_cpc, 
                metrics.average_cpm
            `;

            let raw = [];
            const grouped = {};

            if (dimension === 'Age') {
                raw = await this.customer.query(`
                    SELECT ad_group_criterion.age_range.type, ${baseMetrics}
                    FROM age_range_view 
                    WHERE ${dateClause}${campaignClause} AND metrics.impressions > 0
                `);

                const ageLabel = {
                    503001: '18-24', 503002: '25-34', 503003: '35-44',
                    503004: '45-54', 503005: '55-64', 503006: '65+', 503999: 'Unknown'
                };

                raw.forEach(r => {
                    const typeCode = r.ad_group_criterion?.age_range?.type;
                    const key = ageLabel[typeCode] || `Unknown (${typeCode || 'N/A'})`;
                    if (!grouped[key]) grouped[key] = { dimension: key, leads: 0, spend: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, cpm: 0, _count: 0 };
                    const m = this._mapMetrics(r.metrics);
                    grouped[key].leads += m.leads; grouped[key].spend += m.spend;
                    grouped[key].impressions += m.impressions; grouped[key].clicks += m.clicks;
                    grouped[key]._count++;
                });

            } else if (dimension === 'Gender') {
                raw = await this.customer.query(`
                    SELECT ad_group_criterion.gender.type, ${baseMetrics}
                    FROM gender_view 
                    WHERE ${dateClause}${campaignClause} AND metrics.impressions > 0
                `);

                const genLabel = { 10: 'Male', 11: 'Female', 20: 'Unknown' };

                raw.forEach(r => {
                    const typeCode = r.ad_group_criterion?.gender?.type;
                    const key = genLabel[typeCode] || `Unknown (${typeCode || 'N/A'})`;
                    if (!grouped[key]) grouped[key] = { dimension: key, leads: 0, spend: 0, impressions: 0, clicks: 0, _count: 0 };
                    const m = this._mapMetrics(r.metrics);
                    grouped[key].leads += m.leads; grouped[key].spend += m.spend;
                    grouped[key].impressions += m.impressions; grouped[key].clicks += m.clicks;
                    grouped[key]._count++;
                });

            } else if (dimension === 'Device') {
                raw = await this.customer.query(`
                    SELECT segments.device, ${baseMetrics}
                    FROM campaign 
                    WHERE ${dateClause}${campaignClause}
                `);
                const devLabel = { 2: 'Mobile', 3: 'Tablet', 4: 'Desktop', 5: 'Connected TV', 6: 'Other' };
                raw.forEach(r => {
                    const key = devLabel[r.segments.device] || 'Other';
                    if (!grouped[key]) grouped[key] = { dimension: key, leads: 0, spend: 0, impressions: 0, clicks: 0, _count: 0 };
                    const m = this._mapMetrics(r.metrics);
                    grouped[key].leads += m.leads; grouped[key].spend += m.spend;
                    grouped[key].impressions += m.impressions; grouped[key].clicks += m.clicks;
                    grouped[key]._count++;
                });

            } else if (dimension === 'Region') {
                raw = await this.customer.query(`
                    SELECT segments.geo_target_state, ${baseMetrics}
                    FROM campaign 
                    WHERE ${dateClause}${campaignClause} AND metrics.impressions > 0
                    LIMIT 50
                `);
                raw.forEach(r => {
                    const key = r.segments.geo_target_state || 'Other';
                    if (!grouped[key]) grouped[key] = { dimension: key, leads: 0, spend: 0, impressions: 0, clicks: 0, _count: 0 };
                    const m = this._mapMetrics(r.metrics);
                    grouped[key].leads += m.leads; grouped[key].spend += m.spend;
                    grouped[key].impressions += m.impressions; grouped[key].clicks += m.clicks;
                    grouped[key]._count++;
                });

            } else if (dimension === 'Placement') {
                raw = await this.customer.query(`
                    SELECT group_placement_view.placement, group_placement_view.display_name, ${baseMetrics}
                    FROM group_placement_view 
                    WHERE ${dateClause}${campaignClause} AND metrics.impressions > 0
                    LIMIT 50
                `);
                raw.forEach(r => {
                    const key = r.group_placement_view.display_name || r.group_placement_view.placement || 'Other';
                    if (!grouped[key]) grouped[key] = { dimension: key, leads: 0, spend: 0, impressions: 0, clicks: 0, _count: 0 };
                    const m = this._mapMetrics(r.metrics);
                    grouped[key].leads += m.leads; grouped[key].spend += m.spend;
                    grouped[key].impressions += m.impressions; grouped[key].clicks += m.clicks;
                    grouped[key]._count++;
                });
            }

            return Object.values(grouped).map(item => ({
                dimension: item.dimension,
                leads: item.leads,
                spend: parseFloat(item.spend.toFixed(2)),
                impressions: item.impressions,
                clicks: item.clicks,
                ctr: item.clicks > 0 ? parseFloat((item.clicks / item.impressions * 100).toFixed(2)) : 0,
                cpc: item.clicks > 0 ? parseFloat((item.spend / item.clicks).toFixed(2)) : 0,
                cpm: item.impressions > 0 ? parseFloat((item.spend / item.impressions * 1000).toFixed(2)) : 0,
                cpl: item.leads > 0 ? parseFloat((item.spend / item.leads).toFixed(0)) : 0
            })).sort((a, b) => b.spend - a.spend);

        } catch (err) {
            console.error(`Error fetching ${dimension} breakdowns:`, err);
            return [];
        }
    }

    async fetchSearchTerms(range = 'LAST_30_DAYS') {
        if (!this.customer) return [];
        try {
            const dateRange = range === 'ALL_TIME' ? '20240101,' + new Date().toISOString().split('T')[0].replace(/-/g, '') : range;
            const results = await this.customer.query(`
                SELECT 
                    search_term_view.search_term, 
                    search_term_view.status, 
                    ad_group.name, 
                    campaign.name,
                    metrics.all_conversions, 
                    metrics.cost_micros, 
                    metrics.impressions, 
                    metrics.clicks, 
                    metrics.ctr
                FROM search_term_view 
                WHERE ${resolvedRange.includes(',') ? `segments.date BETWEEN '${resolvedRange.split(',')[0].slice(0,4)}-${resolvedRange.split(',')[0].slice(4,6)}-${resolvedRange.split(',')[0].slice(6,8)}' AND '${resolvedRange.split(',')[1].slice(0,4)}-${resolvedRange.split(',')[1].slice(4,6)}-${resolvedRange.split(',')[1].slice(6,8)}'` : `segments.date DURING ${resolvedRange}`}
                LIMIT 500
            `);

            return results.map(r => ({
                term: r.search_term_view.search_term,
                status: r.search_term_view.status,
                adGroup: r.ad_group.name,
                campaign: r.campaign.name,
                leads: Math.round(r.metrics.all_conversions || 0),
                spend: parseFloat((r.metrics.cost_micros / 1000000).toFixed(2)),
                impressions: r.metrics.impressions || 0,
                clicks: r.metrics.clicks || 0,
                ctr: parseFloat((r.metrics.ctr * 100).toFixed(2))
            }));
        } catch (err) {
            console.error("Error fetching search terms:", err);
            return [];
        }
    }

    _mapMetrics(metrics) {
        return {
            leads: Math.round(metrics.all_conversions || 0),
            spend: parseFloat((metrics.cost_micros / 1000000).toFixed(2)),
            impressions: metrics.impressions || 0,
            clicks: metrics.clicks || 0,
            ctr: parseFloat((metrics.ctr * 100).toFixed(2)),
            cpc: parseFloat((metrics.average_cpc / 1000000).toFixed(2)),
            cpm: parseFloat((metrics.average_cpm / 1000000).toFixed(2)),
            cpl: metrics.all_conversions > 0 ? parseFloat((metrics.cost_micros / 1000000 / metrics.all_conversions).toFixed(0)) : 0
        };
    }

    async updateCampaignStatus(campaignId, status) {
        if (!this.customer) return;
        const statusEnum = status === 'ENABLED' ? 2 : 3;
        await this.customer.campaigns.update([{
            resource_name: `customers/${this.customer_id}/campaigns/${campaignId}`,
            status: statusEnum
        }]);
    }

    async updateCampaignBudget(campaignId, amountMicros) {
        if (!this.customer) return;
        const result = await this.customer.query(`SELECT campaign.campaign_budget FROM campaign WHERE campaign.id = ${campaignId}`);
        if (result && result.length > 0) {
            const budgetResource = result[0].campaign.campaign_budget;
            await this.customer.campaignBudgets.update([{
                resource_name: budgetResource,
                amount_micros: amountMicros
            }]);
        }
    }
}

module.exports = GoogleAdsService;

