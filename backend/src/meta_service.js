const axios = require('axios');

class MetaAdsService {
    constructor(credentials) {
        this.accessToken = credentials.accessToken;
        this.adAccountId = credentials.adAccountId;
        this.baseUrl = 'https://graph.facebook.com/v19.0';

        if (this.adAccountId && !this.adAccountId.startsWith('act_')) {
            this.adAccountId = `act_${this.adAccountId}`;
        }
    }

    _getDateRange(range) {
        const today = new Date();
        const fmt = (d) => d.toISOString().split('T')[0];
        if (range === 'LAST_7_DAYS') {
            const since = new Date(today); since.setDate(today.getDate() - 7);
            return JSON.stringify({ since: fmt(since), until: fmt(today) });
        } else if (range === 'ALL_TIME') {
            // Updated to be more realistic as a starting point if no data found
            return JSON.stringify({ since: '2024-01-01', until: fmt(today) });
        }
        const since = new Date(today); since.setDate(today.getDate() - 30);
        return JSON.stringify({ since: fmt(since), until: fmt(today) });
    }

    async fetchCampaigns(range = 'LAST_30_DAYS') {
        if (!this.accessToken) return [];
        try {
            const dateRange = this._getDateRange(range);
            const response = await axios.get(`${this.baseUrl}/${this.adAccountId}/campaigns`, {
                params: {
                    access_token: this.accessToken,
                    fields: `id,name,status,objective,insights.time_range(${dateRange}){spend,inline_link_clicks,impressions,actions,reach,cpm,cpc}`,
                    limit: 50
                }
            });

            return (response.data.data || []).map(c => {
                const ins = c.insights?.data?.[0] || {};
                const impressions = parseInt(ins.impressions || 0);
                const reach = parseInt(ins.reach || 0);
                const spend = parseFloat(ins.spend || 0);
                const clicks = parseInt(ins.inline_link_clicks || 0);
                const leads = (ins.actions || []).reduce((acc, a) =>
                    ['lead', 'offsite_conversion.fb_pixel_lead', 'onsite_conversion.messaging_conversation_started_7d'].includes(a.action_type)
                        ? acc + parseInt(a.value || 0) : acc, 0);

                return {
                    id: c.id, name: c.name, status: c.status, objective: c.objective,
                    leads, spend,
                    cpl: leads > 0 ? parseFloat((spend / leads).toFixed(2)) : 0,
                    ctr: impressions > 0 ? parseFloat((clicks / impressions * 100).toFixed(2)) : 0,
                    cpm: parseFloat(ins.cpm || 0),
                    cpc: parseFloat(ins.cpc || 0),
                    impressions, reach, clicks,
                    freq: reach > 0 ? parseFloat((impressions / reach).toFixed(2)) : 0
                };
            });
        } catch (err) {
            console.error('[Meta] Error fetching campaigns:', err.response?.data || err.message);
            return [];
        }
    }

    async fetchAdsets(range = 'LAST_30_DAYS') {
        if (!this.accessToken) return [];
        try {
            const dateRange = this._getDateRange(range);
            const response = await axios.get(`${this.baseUrl}/${this.adAccountId}/adsets`, {
                params: {
                    access_token: this.accessToken,
                    fields: `id,name,status,campaign_id,billing_event,bid_amount,insights.time_range(${dateRange}){spend,actions,impressions,inline_link_clicks,cpm,cpc}`,
                    limit: 50
                }
            });

            return (response.data.data || []).map(as => {
                const ins = as.insights?.data?.[0] || {};
                const spend = parseFloat(ins.spend || 0);
                const impressions = parseInt(ins.impressions || 0);
                const clicks = parseInt(ins.inline_link_clicks || 0);
                const leads = (ins.actions || []).reduce((acc, a) =>
                    ['lead', 'offsite_conversion.fb_pixel_lead'].includes(a.action_type)
                        ? acc + parseInt(a.value || 0) : acc, 0);

                return {
                    id: as.id, name: as.name, status: as.status, campaignId: as.campaign_id,
                    leads, spend,
                    cpl: leads > 0 ? parseFloat((spend / leads).toFixed(2)) : 0,
                    ctr: impressions > 0 ? parseFloat((clicks / impressions * 100).toFixed(2)) : 0,
                    cpm: parseFloat(ins.cpm || 0),
                    impressions, clicks
                };
            });
        } catch (err) {
            console.error('[Meta] Error fetching adsets:', err.response?.data || err.message);
            return [];
        }
    }

    async fetchCreatives(range = 'LAST_30_DAYS') {
        if (!this.accessToken) return [];
        try {
            const dateRange = this._getDateRange(range);
            const response = await axios.get(`${this.baseUrl}/${this.adAccountId}/ads`, {
                params: {
                    access_token: this.accessToken,
                    fields: `id,name,status,creative{id,name,thumbnail_url,object_type},insights.time_range(${dateRange}){spend,actions,impressions,inline_link_clicks,video_p25_watched_actions,video_p100_watched_actions,ctr}`,
                    limit: 50
                }
            });

            return (response.data.data || []).map(ad => {
                const ins = ad.insights?.data?.[0] || {};
                const leads = (ins.actions || []).reduce((acc, a) =>
                    ['lead', 'offsite_conversion.fb_pixel_lead'].includes(a.action_type)
                        ? acc + parseInt(a.value || 0) : acc, 0);
                const spend = parseFloat(ins.spend || 0);
                const impressions = parseInt(ins.impressions || 1);
                const video_p25 = parseInt(ins.video_p25_watched_actions?.[0]?.value || 0);
                const video_p100 = parseInt(ins.video_p100_watched_actions?.[0]?.value || 0);

                return {
                    id: ad.id, name: ad.name, status: ad.status,
                    type: ad.creative?.object_type || 'IMAGE',
                    thumbnail: ad.creative?.thumbnail_url,
                    leads, spend,
                    cpl: leads > 0 ? parseFloat((spend / leads).toFixed(2)) : 0,
                    ctr: parseFloat(ins.ctr || 0),
                    hook: video_p25 > 0 ? parseFloat((video_p25 / impressions * 100).toFixed(1)) : 0,
                    hold: video_p100 > 0 ? parseFloat((video_p100 / impressions * 100).toFixed(1)) : 0,
                };
            });
        } catch (err) {
            console.error('[Meta] Error fetching creatives:', err.response?.data || err.message);
            return [];
        }
    }

    async fetchAdRelevanceDiagnostics(range = 'LAST_30_DAYS') {
        if (!this.accessToken) return [];
        try {
            const dateRange = this._getDateRange(range);
            const response = await axios.get(`${this.baseUrl}/${this.adAccountId}/ads`, {
                params: {
                    access_token: this.accessToken,
                    fields: `id,name,status,adset{name,campaign{name}},insights.time_range(${dateRange}){spend,actions,impressions,inline_link_clicks,quality_ranking,engagement_rate_ranking,conversion_rate_ranking}`,
                    limit: 100
                }
            });

            return (response.data.data || []).map(ad => {
                const ins = ad.insights?.data?.[0] || {};
                const leads = (ins.actions || []).reduce((acc, a) =>
                    ['lead', 'offsite_conversion.fb_pixel_lead'].includes(a.action_type)
                        ? acc + parseInt(a.value || 0) : acc, 0);
                const spend = parseFloat(ins.spend || 0);
                const impressions = parseInt(ins.impressions || 0);
                const clicks = parseInt(ins.inline_link_clicks || 0);

                const qRanking = ins.quality_ranking || 'UNKNOWN';
                const eRanking = ins.engagement_rate_ranking || 'UNKNOWN';
                const cRanking = ins.conversion_rate_ranking || 'UNKNOWN';

                const rankingToScore = (r) => {
                    if (r === 'ABOVE_AVERAGE') return 8;
                    if (r === 'AVERAGE') return 5;
                    if (r === 'BELOW_AVERAGE') return 3;
                    return 0;
                };
                const qs = Math.round((rankingToScore(qRanking) + rankingToScore(eRanking) + rankingToScore(cRanking)) / 3);

                let recommendation = null;
                if (cRanking === 'BELOW_AVERAGE') {
                    recommendation = {
                        type: 'CONV_RATE', action: 'Fix Landing Page / Offer', status: 'CRITICAL',
                        reason: "Your conversion rate ranking is below average. Users click but don't convert.",
                        steps: ["Ensure landing page message matches ad", "Add strong CTA", "Reduce form fields"]
                    };
                } else if (qRanking === 'BELOW_AVERAGE') {
                    recommendation = {
                        type: 'QUALITY', action: 'Improve Creative Quality', status: 'CRITICAL',
                        reason: "Your ad quality ranking is below average.",
                        steps: ["Replace with high-res creative", "Avoid excessive text", "Use authentic photos"]
                    };
                } else if (eRanking === 'BELOW_AVERAGE') {
                    recommendation = {
                        type: 'ENGAGEMENT', action: 'Improve Hook / Copy', status: 'IMPROVE',
                        reason: "Your engagement rate ranking is below average.",
                        steps: ["Strong visual hook", "Ask direct question", "Use social proof"]
                    };
                }

                return {
                    id: ad.id, name: ad.name, status: ad.status,
                    adGroup: ad.adset?.name || 'Unknown', campaign: ad.adset?.campaign?.name || 'Unknown',
                    qs, qRanking, eRanking, cRanking,
                    leads, spend, impressions, clicks,
                    ctr: impressions > 0 ? parseFloat((clicks / impressions * 100).toFixed(2)) : 0,
                    recommendation
                };
            });
        } catch (err) {
            console.error('[Meta] Error fetching ad relevance:', err.response?.data || err.message);
            return [];
        }
    }

    async fetchPlacementBreakdown(range = 'LAST_30_DAYS') {
        if (!this.accessToken) return [];
        try {
            const dateRange = this._getDateRange(range);
            const response = await axios.get(`${this.baseUrl}/${this.adAccountId}/insights`, {
                params: {
                    access_token: this.accessToken,
                    breakdowns: 'publisher_platform,platform_position',
                    fields: `campaign_name,adset_name,spend,actions,impressions,inline_link_clicks,ctr`,
                    time_range: dateRange,
                    limit: 200
                }
            });

            const grouped = {};
            (response.data.data || []).forEach(row => {
                const key = row.adset_name || 'Unknown';
                if (!grouped[key]) {
                    grouped[key] = { name: key, campaign: row.campaign_name, terms: [] };
                }
                const leads = (row.actions || []).reduce((acc, a) =>
                    ['lead', 'offsite_conversion.fb_pixel_lead'].includes(a.action_type)
                        ? acc + parseInt(a.value || 0) : acc, 0);

                grouped[key].terms.push({
                    term: `${row.publisher_platform} / ${row.platform_position}`.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    status: 'PLACEMENT',
                    adGroup: row.adset_name,
                    campaign: row.campaign_name,
                    leads, spend: parseFloat(row.spend || 0),
                    impressions: parseInt(row.impressions || 0),
                    clicks: parseInt(row.inline_link_clicks || 0),
                    ctr: parseFloat(row.ctr || 0)
                });
            });

            return Object.values(grouped);
        } catch (err) {
            console.error('[Meta] Error fetching placements:', err.response?.data || err.message);
            return [];
        }
    }

    async updateCampaignStatus(campaignId, status) {
        if (!this.accessToken) return;
        await axios.post(`${this.baseUrl}/${campaignId}`, null, {
            params: { access_token: this.accessToken, status }
        });
    }

    async updateAdsetStatus(adsetId, status) {
        if (!this.accessToken) return;
        await axios.post(`${this.baseUrl}/${adsetId}`, null, {
            params: { access_token: this.accessToken, status }
        });
    }

    async fetchDashboard(range = 'LAST_30_DAYS') {
        if (!this.accessToken) return null;
        try {
            const dateRange = this._getDateRange(range);
            const response = await axios.get(`${this.baseUrl}/${this.adAccountId}/insights`, {
                params: {
                    access_token: this.accessToken,
                    fields: `spend,actions,impressions,inline_link_clicks,reach,cpm,cpc,frequency`,
                    time_range: dateRange,
                    level: 'account'
                }
            });
            const ins = response.data.data?.[0] || {};
            const leads = (ins.actions || []).reduce((acc, a) =>
                ['lead', 'offsite_conversion.fb_pixel_lead', 'onsite_conversion.messaging_conversation_started_7d'].includes(a.action_type)
                    ? acc + parseInt(a.value || 0) : acc, 0);
            const spend = parseFloat(ins.spend || 0);
            const clicks = parseInt(ins.inline_link_clicks || 0);
            const impressions = parseInt(ins.impressions || 0);

            return {
                leads, spend,
                cpl: leads > 0 ? parseFloat((spend / leads).toFixed(2)) : 0,
                ctr: impressions > 0 ? parseFloat((clicks / impressions * 100).toFixed(2)) : 0,
                cpm: parseFloat(ins.cpm || 0),
                cpc: parseFloat(ins.cpc || 0),
                reach: parseInt(ins.reach || 0),
                impressions, clicks
            };
        } catch (err) {
            console.error('[Meta] Error fetching dashboard:', err.response?.data || err.message);
            return null;
        }
    }
}

module.exports = MetaAdsService;

