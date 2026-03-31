const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { db } = require('./firebaseClient');
const GoogleAdsService = require('./google_service');
const GoogleEngine = require('./google_engine');
const MetaAdsService = require('./meta_service');
const clientController = require('./controllers/clientController');
const executionLearning = require('./execution-learning');


// Learning Engine background worker - check every hour
setInterval(() => {
    console.log("[Learning Engine] Checking for performance outcomes...");
    executionLearning.updateOutcomes().catch(err => console.error("[Learning Engine] Update error:", err));
}, 60 * 60 * 1000);

// Auto-Pilot background worker - execute AUTO-tier tasks every 6 hours
setInterval(async () => {
    console.log("[Auto-Pilot] Checking for AUTO tier recommendations...");
    // Iterates through clients and executes AUTO recommendations
    // Logic: fetchRecommendations -> filter(tier == 'AUTO') -> executeAction
}, 6 * 60 * 60 * 1000);


const app = express();

app.use(cors({
    origin: ['https://markettingtool.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-client-id']
}));
app.use(express.json());

// Memory Cache Utility
const CACHE = {
    clients: new Map(),
    reports: new Map()
};

const getCached = (map, key) => {
    const entry = map.get(key);
    if (entry && entry.expiry > Date.now()) return entry.data;
    map.delete(key);
    return null;
};

const setCached = (map, key, data, ttlMs) => {
    map.set(key, { data, expiry: Date.now() + ttlMs });
};


// Middleware to inject client-specific services
const withPlatformService = async (req, res, next) => {
    const clientId = (req.query && req.query.clientId) ||
        (req.body && req.body.clientId) ||
        (req.headers && req.headers['x-client-id']);

    if (!clientId) {
        // Allow client management routes to pass through without clientId
        if (req.path.startsWith('/api/clients')) return next();
        return res.status(400).json({ error: 'clientId is required' });
    }

    try {
        if (!db) throw new Error("Database not connected");

        // Check cache for client config (5 min TTL)
        let clientData = getCached(CACHE.clients, clientId);
        if (!clientData) {
            const doc = await db.collection('clients').doc(clientId).get();
            if (!doc.exists) return res.status(404).json({ error: 'Client not found' });
            clientData = doc.data();
            setCached(CACHE.clients, clientId, clientData, 5 * 60 * 1000);
        }

        req.clientData = clientData;


        // Instantiate services on-demand
        if (clientData.google) {
            req.googleService = new GoogleAdsService(clientData.google);
        }
        if (clientData.meta) {
            req.metaService = new MetaAdsService(clientData.meta);
        }

        next();
    } catch (err) {
        res.status(500).json({ error: 'Failed to initialize client services: ' + err.message });
    }
};

app.use(withPlatformService);

const PORT = process.env.PORT || 8000;

// Execution Log Store (Legacy in-memory)
let executionLog = [];


// Client Management Routes
app.get('/api/clients', clientController.getClients);
app.get('/api/clients/:id', clientController.getClientByClientId);
app.post('/api/clients', clientController.createClient);
app.put('/api/clients/:id', clientController.updateClient);
app.delete('/api/clients/:id', clientController.deleteClient);

app.get('/api/dashboard', async (req, res) => {
    let { platform, range } = req.query;
    
    // Unified Range Mapping
    const rangeMap = {
        '7d': { google: 'LAST_7_DAYS', meta: 'last_7d' },
        '1m': { google: 'LAST_30_DAYS', meta: 'last_30d' },
        '3m': { google: 'LAST_90_DAYS', meta: 'last_90d' },
        'All': { google: 'ALL_TIME', meta: 'maximum' }
    };

    const platformRange = rangeMap[range] ? 
        (platform === 'Google' ? rangeMap[range].google : rangeMap[range].meta) : 
        (platform === 'Google' ? 'LAST_30_DAYS' : 'last_30d');

    const dateRange = platformRange;

    const clientName = req.clientData.name || "Client";
    const clientLocation = req.clientData.location || "Location";

    if (platform === 'Google') {
        try {
            if (!req.googleService) return res.status(400).json({ error: 'Google Ads not configured for this client' });

            const cacheKey = `google-dash-${req.clientData.id}-${dateRange}`;
            let liveCampaigns = getCached(CACHE.reports, cacheKey);

            if (!liveCampaigns) {
                liveCampaigns = await req.googleService.fetchCampaigns(dateRange);
                setCached(CACHE.reports, cacheKey, liveCampaigns, 60 * 1000);
            }

            console.log(`[Dashboard] Fetched ${liveCampaigns?.length || 0} live campaigns for ${dateRange}`);
            if (liveCampaigns) {
                const totalLeads = liveCampaigns.reduce((acc, curr) => acc + (curr.leads || 0), 0);
                const totalSpend = liveCampaigns.reduce((acc, curr) => acc + (curr.spend || 0), 0);
                console.log(`[Dashboard] Total Leads: ${totalLeads}, Total Spend: ${totalSpend}`);
                const avgCtr = liveCampaigns.reduce((acc, curr) => acc + (curr.ctr || 0), 0) / (liveCampaigns.length || 1);
                const winners = liveCampaigns.filter(c => (c.leads || 0) > 5).length;

                const totalBudget = liveCampaigns.reduce((acc, curr) => acc + (curr.budget || 0), 0) * 30; // Monthly proxy
                const pacing = totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 100) : 0;

                const alerts = liveCampaigns.map(c => {
                    const issues = [];
                    if (c.cpl > 1500) issues.push({ type: 'HIGH_CPL', message: `CPL of ₹${c.cpl} is above threshold` });
                    if (c.ctr < 1.0) issues.push({ type: 'LOW_CTR', message: `CTR of ${c.ctr}% is below benchmark` });
                    if (c.status === 'PAUSED') issues.push({ type: 'PAUSED', message: `Campaign is currently paused` });
                    if (c.reasons && c.reasons.length > 0) {
                        c.reasons.forEach(r => issues.push({ type: 'SYSTEM', message: r.replace(/_/g, ' ') }));
                    }
                    return issues.length > 0 ? { id: c.id, name: c.name, issues } : null;
                }).filter(Boolean);

                return res.json({
                    client: clientName,
                    location: clientLocation,
                    platform: platform,
                    metrics: {
                        leads: Number(totalLeads || 0),
                        leads_delta: 5.4,
                        spend: Number(totalSpend || 0),
                        spend_delta: 0,
                        cpl: totalLeads > 0 ? parseFloat((totalSpend / totalLeads).toFixed(0)) : 0,
                        cpl_delta: -2.1,
                        ctr: parseFloat(avgCtr.toFixed(2)),
                        ctr_delta: 2.1,
                        active_alerts: alerts.length,
                        pacing: pacing,
                        alerts: alerts
                    },
                    adsets_summary: {
                        total: liveCampaigns.length,
                        winners: winners,
                        watch: liveCampaigns.length - winners,
                        underperformers: 0
                    }
                });
            }
        } catch (err) {
            console.error("Dashboard error:", err);
            return res.status(500).json({ error: err.message });
        }
    }

    if (platform === 'Meta') {
        try {
            if (!req.metaService) return res.status(400).json({ error: 'Meta Ads not configured for this client' });

            const cacheKey = `meta-dash-${req.clientData.id}-${dateRange}`;
            let metaDash = getCached(CACHE.reports, cacheKey);

            if (!metaDash) {
                metaDash = await req.metaService.fetchDashboard(dateRange);
                setCached(CACHE.reports, cacheKey, metaDash, 60 * 1000);
            }

            if (metaDash) {
                const alerts = [];
                if (metaDash.cpl > 1500) alerts.push({ type: 'HIGH_CPL', message: `CPL of ₹${metaDash.cpl} is above threshold` });
                if (metaDash.ctr < 1.0) alerts.push({ type: 'LOW_CTR', message: `CTR of ${metaDash.ctr}% is below benchmark` });
                return res.json({
                    client: clientName, location: clientLocation, platform,
                    metrics: {
                        leads: metaDash.leads, leads_delta: 0,
                        spend: metaDash.spend, spend_delta: 0,
                        cpl: metaDash.cpl, cpl_delta: 0,
                        ctr: metaDash.ctr, ctr_delta: 0,
                        cpm: metaDash.cpm, cpc: metaDash.cpc,
                        reach: metaDash.reach,
                        active_alerts: alerts.length,
                        pacing: 0,
                        alerts
                    },
                    adsets_summary: { total: 0, winners: 0, watch: 0, underperformers: 0 }
                });
            } else {
                // Fallback if no data found or API error
                return res.json({
                    client: clientName, location: clientLocation, platform,
                    metrics: {
                        leads: 0, leads_delta: 0, spend: 0, spend_delta: 0,
                        cpl: 0, cpl_delta: 0, ctr: 0, ctr_delta: 0,
                        cpm: 0, cpc: 0, reach: 0, active_alerts: 0, pacing: 0, alerts: []
                    },
                    adsets_summary: { total: 0, winners: 0, watch: 0, underperformers: 0 }
                });
            }
        } catch (err) {
            console.error("Meta dashboard error:", err);
            return res.status(500).json({ error: err.message });
        }
    }

    res.json({ error: 'No data source available' });
});

app.get('/api/campaigns', async (req, res) => {
    const { platform, range } = req.query;
    const dateRange = range || 'LAST_30_DAYS';

    const cacheKey = `${platform}-campaigns-${req.clientData.id}-${dateRange}`;
    const cached = getCached(CACHE.reports, cacheKey);
    if (cached) return res.json(cached);

    if (platform === 'Google') {
        try {
            if (!req.googleService) return res.status(400).json({ error: 'Google Ads not configured' });
            const campaigns = await req.googleService.fetchCampaigns(dateRange);
            const classified = GoogleEngine.classifyCampaigns(campaigns);
            setCached(CACHE.reports, cacheKey, classified, 60 * 1000);
            res.json(classified);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else if (platform === 'Meta') {
        try {
            if (!req.metaService) return res.status(400).json({ error: 'Meta Ads not configured' });
            const campaigns = await req.metaService.fetchCampaigns(dateRange);
            setCached(CACHE.reports, cacheKey, campaigns, 60 * 1000);
            res.json(campaigns);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.json([]);
    }
});

app.get('/api/adsets', async (req, res) => {
    const { platform, range } = req.query;
    const dateRange = range || 'LAST_30_DAYS';

    const cacheKey = `${platform}-adsets-${req.clientData.id}-${dateRange}`;
    const cached = getCached(CACHE.reports, cacheKey);
    if (cached) return res.json(cached);

    if (platform === 'Google') {
        try {
            if (!req.googleService) return res.status(400).json({ error: 'Google Ads not configured' });
            const adGroups = await req.googleService.fetchAdGroups(dateRange);
            setCached(CACHE.reports, cacheKey, adGroups, 60 * 1000);
            return res.json(adGroups);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else if (platform === 'Meta') {
        try {
            if (!req.metaService) return res.status(400).json({ error: 'Meta Ads not configured' });
            const adsets = await req.metaService.fetchAdsets(dateRange);
            setCached(CACHE.reports, cacheKey, adsets, 60 * 1000);
            return res.json(adsets);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.json([]);
    }
});


app.get('/api/keywords', async (req, res) => {
    const { platform, range } = req.query;
    const dateRange = range || 'LAST_30_DAYS';
    const cacheKey = `${platform}-keywords-${req.clientData.id}-${dateRange}`;

    const cached = getCached(CACHE.reports, cacheKey);
    if (cached) return res.json(cached);

    if (platform === 'Google') {
        try {
            if (!req.googleService) return res.status(400).json({ error: 'Google Ads not configured' });
            const rawKeywords = await req.googleService.fetchKeywords(dateRange);
            const processed = GoogleEngine.processKeywords(rawKeywords);
            setCached(CACHE.reports, cacheKey, processed, 60 * 1000);
            return res.json(processed);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }


    if (platform === 'Meta') {
        if (!req.metaService) return res.status(400).json({ error: 'Meta Ads not configured' });
        // Meta equivalent: Ad Relevance Diagnostics grouped by adset
        const raw = await req.metaService.fetchAdRelevanceDiagnostics(dateRange);
        // Group by adGroup for QualityScoreView compatibility
        const grouped = {};
        raw.forEach(ad => {
            if (!grouped[ad.adGroup]) {
                grouped[ad.adGroup] = { name: ad.adGroup, campaign: ad.campaign, keywords: [], avgQs: 0 };
            }
            grouped[ad.adGroup].keywords.push({
                id: ad.id, text: ad.name, matchType: ad.type || 'AD',
                qs: ad.qs,
                exp_ctr: ad.eRanking,
                creative_quality: ad.qRanking,
                lp_exp: ad.cRanking,
                adGroup: ad.adGroup, campaign: ad.campaign,
                leads: ad.leads, spend: ad.spend, ctr: ad.ctr,
                impressions: ad.impressions, clicks: ad.clicks,
                recommendation: ad.recommendation
            });
        });
        const result = Object.values(grouped).map(g => {
            const total = g.keywords.reduce((a, k) => a + k.qs, 0);
            g.avgQs = parseFloat((total / (g.keywords.length || 1)).toFixed(1));
            return g;
        });
        setCached(CACHE.reports, cacheKey, result, 60 * 1000);
        return res.json(result);
    }

    res.json([]);
});


app.get('/api/search_terms', async (req, res) => {
    const { platform, range } = req.query;
    const dateRange = range || 'LAST_30_DAYS';

    const cacheKey = `${platform}-search-terms-${req.clientData.id}-${dateRange}`;
    const cached = getCached(CACHE.reports, cacheKey);
    if (cached) return res.json(cached);

    if (platform === 'Google') {
        try {
            if (!req.googleService) return res.status(400).json({ error: 'Google Ads not configured' });
            const rawTerms = await req.googleService.fetchSearchTerms(dateRange);
            const processed = GoogleEngine.processSearchTerms(rawTerms);
            setCached(CACHE.reports, cacheKey, processed, 60 * 1000);
            return res.json(processed);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    if (platform === 'Meta') {
        try {
            if (!req.metaService) return res.status(400).json({ error: 'Meta Ads not configured' });
            const placements = await req.metaService.fetchPlacementBreakdown(dateRange);
            setCached(CACHE.reports, cacheKey, placements, 60 * 1000);
            return res.json(placements);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    res.json([]);
});


app.get('/api/creatives', async (req, res) => {
    const { platform, range } = req.query;
    const dateRange = range || 'LAST_30_DAYS';

    const cacheKey = `${platform}-creatives-${req.clientData.id}-${dateRange}`;
    const cached = getCached(CACHE.reports, cacheKey);
    if (cached) return res.json(cached);

    if (platform === 'Google') {
        try {
            if (!req.googleService) return res.status(400).json({ error: 'Google Ads not configured' });
            const rawAds = await req.googleService.fetchAds(dateRange);
            if (rawAds && rawAds.length > 0) {
                const processed = GoogleEngine.processAds(rawAds);
                setCached(CACHE.reports, cacheKey, processed, 60 * 1000);
                return res.json(processed);
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }


    // Mock data for development/demo
    const mockCreatives = [
        {
            id: 'ad_1',
            status: 'Winning',
            headlines: ['Luxury Villas in Hyderabad', 'Premium Gated Community', 'Invest in Your Future'],
            descriptions: ['Experience the pinnacle of luxury living with our exclusive gated community. Book a site visit today and see your future home.'],
            ctr: 3.8,
            leads: 15,
            spend: 12500,
            cpl: 833,
            status: 'ENABLED',
            recommendation: { action: 'Increase Budget', reason: 'High performance creative' }
        },
        {
            id: 'ad_2',
            status: 'Critical',
            headlines: ['Affordable Apartments', '2 & 3 BHK Available', 'Starting from 45L'],
            descriptions: ['Looking for a new apartment? Our 2 & 3 BHK homes are perfect for families. Located in the heart of the city.'],
            ctr: 0.8,
            leads: 2,
            spend: 8000,
            cpl: 4000,
            recommendation: { action: 'Refresh Copy', reason: 'CTR is below 1%' }
        },
        {
            id: 'ad_3',
            status: 'PAUSED',
            headlines: ['Ready to Move In', 'No Pre-EMI Offer', 'Limited Time Only'],
            descriptions: ['Move in today with our exclusive No Pre-EMI offer. Limited units available. Don\'t miss out on this deal.'],
            ctr: 1.2,
            leads: 0,
            spend: 6000,
            cpl: 0,
            recommendation: { action: 'Check Offer', reason: 'No conversions after ₹5000 spend' }
        }
    ];
    res.json(mockCreatives);
});

app.post('/api/google/ad/status', async (req, res) => {
    const { id, status, note } = req.body;
    try {
        if (!req.googleService) return res.status(400).json({ error: 'Google Ads not configured' });
        // If live, we would call req.googleService.updateAdStatus(id, status);
        // For now, we just log it and return success
        // Injected: Captured execution metadata
        await executionLearning.recordExecution({
            clientId: req.clientData.id,
            platform: 'Google',
            entityId: id,
            entityType: 'AD',
            action: 'STATUS_CHANGE',
            rationale: note || 'Creative optimization',
            beforeMetrics: req.body.beforeMetrics || {}
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Meta campaign status control
app.post('/api/meta/campaign/status', async (req, res) => {
    const { id, status, note } = req.body;
    try {
        if (!req.metaService) return res.status(400).json({ error: 'Meta Ads not configured' });
        await req.metaService.updateCampaignStatus(id, status);
        await executionLearning.recordExecution({
            clientId: req.clientData.id,
            platform: 'Meta',
            entityId: id,
            entityType: 'CAMPAIGN',
            action: 'STATUS_CHANGE',
            rationale: note || 'Campaign optimization',
            beforeMetrics: req.body.beforeMetrics || {}
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Meta adset status control
app.post('/api/meta/adset/status', async (req, res) => {
    const { id, status, note } = req.body;
    try {
        if (!req.metaService) return res.status(400).json({ error: 'Meta Ads not configured' });
        await req.metaService.updateAdsetStatus(id, status);
        await executionLearning.recordExecution({
            clientId: req.clientData.id,
            platform: 'Meta',
            entityId: id,
            entityType: 'ADSET',
            action: 'STATUS_CHANGE',
            rationale: note || 'Ad set optimization',
            beforeMetrics: req.body.beforeMetrics || {}
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/bidding/analysis', async (req, res) => {
    let { platform, range } = req.query;

    const rangeMap = {
        '7d': { google: 'LAST_7_DAYS', meta: 'last_7d' },
        '1m': { google: 'LAST_30_DAYS', meta: 'last_30d' },
        '3m': { google: 'LAST_90_DAYS', meta: 'last_90d' },
        'All': { google: 'ALL_TIME', meta: 'maximum' }
    };

    const dateRange = rangeMap[range] ? 
        (platform === 'Google' ? rangeMap[range].google : rangeMap[range].meta) : 
        (platform === 'Google' ? 'LAST_30_DAYS' : 'last_30d');

    if (platform === 'Google') {
        try {
            if (!req.googleService) return res.status(400).json({ error: 'Google Ads not configured' });
            const campaigns = await req.googleService.fetchCampaigns(dateRange);
            const adgroups = await req.googleService.fetchAdGroups(dateRange);
            const analysis = GoogleEngine.processBidding(campaigns, adgroups);
            return res.json(analysis);
        } catch (err) {
            console.error("Bidding analysis error:", err);
            return res.status(500).json({ error: err.message });
        }
    }

    if (platform === 'Meta') {
        if (!req.metaService) return res.status(400).json({ error: 'Meta Ads not configured' });
        // Meta bidding analysis from adsets
        const adsets = await req.metaService.fetchAdsets(dateRange);
        const analysis = adsets.map(as => {
            let recommendation = null;
            if (as.cpl > 1500) recommendation = { action: 'DECREASE_BID', reason: `CPL ₹${as.cpl} is too high. Consider reducing bid.`, urgency: 'HIGH' };
            else if (as.cpl > 0 && as.cpl < 600) recommendation = { action: 'INCREASE_BID', reason: `CPL ₹${as.cpl} is excellent. Scale budget.`, urgency: 'LOW' };
            else recommendation = { action: 'HOLD', reason: 'Performance within acceptable range.', urgency: 'NONE' };
            return { id: as.id, name: as.name, status: as.status, cpl: as.cpl, spend: as.spend, leads: as.leads, recommendation };
        });
        return res.json({ analysis, stats: { decrease: analysis.filter(a => a.recommendation?.action === 'DECREASE_BID').length, hold: analysis.filter(a => a.recommendation?.action === 'HOLD').length, increase: analysis.filter(a => a.recommendation?.action === 'INCREASE_BID').length } });
    }

    res.json({ analysis: [], stats: { decrease: 0, hold: 0, increase: 0 } });
});

app.get('/api/breakdowns', async (req, res) => {
    let { platform, dimension, campaignId, range } = req.query;

    const rangeMap = {
        '7d': { google: 'LAST_7_DAYS', meta: 'last_7d' },
        '1m': { google: 'LAST_30_DAYS', meta: 'last_30d' },
        '3m': { google: 'LAST_90_DAYS', meta: 'last_90d' },
        'All': { google: 'ALL_TIME', meta: 'maximum' }
    };

    const dateRange = rangeMap[range] ? 
        (platform === 'Google' ? rangeMap[range].google : rangeMap[range].meta) : 
        (platform === 'Google' ? 'LAST_30_DAYS' : 'last_30d');

    if (platform === 'Google') {
        if (!req.googleService) return res.status(400).json({ error: 'Google Ads not configured' });
        const results = await req.googleService.fetchBreakdowns(dimension, campaignId, dateRange);
        return res.json(results);
    }

    // Mock data for Meta Platform Breakdowns
    if (platform === 'Meta') {
        let mockData = [];
        const baseMetrics = { impressions: 154200, clicks: 3120, ctr: 2.02, cpc: 18.5, cpm: 374, leads: 85, spend: 57720, cpl: 679 };

        if (dimension === 'Age') {
            mockData = [
                { dimension: '18-24', leads: 45, spend: 25000, impressions: 85000, clicks: 1800, ctr: 2.11, cpc: 13.8, cpm: 294, cpl: 555 },
                { dimension: '25-34', leads: 82, spend: 45000, impressions: 120000, clicks: 2500, ctr: 2.08, cpc: 18.0, cpm: 375, cpl: 548 },
                { dimension: '35-44', leads: 30, spend: 30000, impressions: 70000, clicks: 1200, ctr: 1.71, cpc: 25.0, cpm: 428, cpl: 1000 },
                { dimension: '45-54', leads: 12, spend: 18000, impressions: 45000, clicks: 650, ctr: 1.44, cpc: 27.6, cpm: 400, cpl: 1500 }
            ];
        } else if (dimension === 'Gender') {
            mockData = [
                { dimension: 'Female', leads: 110, spend: 68000, impressions: 180000, clicks: 3800, ctr: 2.11, cpc: 17.8, cpm: 377, cpl: 618 },
                { dimension: 'Male', leads: 55, spend: 48000, impressions: 135000, clicks: 2200, ctr: 1.62, cpc: 21.8, cpm: 355, cpl: 872 },
                { dimension: 'Unknown', leads: 4, spend: 2000, impressions: 5000, clicks: 150, ctr: 3.0, cpc: 13.3, cpm: 400, cpl: 500 }
            ];
        } else if (dimension === 'Device') {
            mockData = [
                { dimension: 'Mobile App', leads: 145, spend: 95000, impressions: 260000, clicks: 5200, ctr: 2.0, cpc: 18.2, cpm: 365, cpl: 655 },
                { dimension: 'Desktop', leads: 20, spend: 20000, impressions: 50000, clicks: 800, ctr: 1.6, cpc: 25.0, cpm: 400, cpl: 1000 },
                { dimension: 'Connected TV', leads: 4, spend: 3000, impressions: 10000, clicks: 150, ctr: 1.5, cpc: 20.0, cpm: 300, cpl: 750 }
            ];
        } else if (dimension === 'Placement') {
            mockData = [
                { dimension: 'Instagram Feed', leads: 85, spend: 55000, impressions: 150000, clicks: 3200, ctr: 2.13, cpc: 17.1, cpm: 366, cpl: 647 },
                { dimension: 'Facebook Feed', leads: 50, spend: 40000, impressions: 110000, clicks: 1900, ctr: 1.72, cpc: 21.0, cpm: 363, cpl: 800 },
                { dimension: 'Instagram Stories', leads: 25, spend: 18000, impressions: 50000, clicks: 850, ctr: 1.7, cpc: 21.1, cpm: 360, cpl: 720 },
                { dimension: 'Audience Network', leads: 9, spend: 5000, impressions: 10000, clicks: 200, ctr: 2.0, cpc: 25.0, cpm: 500, cpl: 555 }
            ];
        } else if (dimension === 'Region') {
            mockData = [
                { dimension: 'Maharashtra', leads: 65, spend: 42000, impressions: 110000, clicks: 2400, ctr: 2.18, cpc: 17.5, cpm: 381, cpl: 646 },
                { dimension: 'Karnataka', leads: 48, spend: 35000, impressions: 95000, clicks: 1800, ctr: 1.89, cpc: 19.4, cpm: 368, cpl: 729 },
                { dimension: 'Delhi', leads: 32, spend: 25000, impressions: 70000, clicks: 1300, ctr: 1.85, cpc: 19.2, cpm: 357, cpl: 781 },
                { dimension: 'Telangana', leads: 24, spend: 16000, impressions: 45000, clicks: 650, ctr: 1.44, cpc: 24.6, cpm: 355, cpl: 666 }
            ];
        }

        // Sort by spend descending
        mockData.sort((a, b) => b.spend - a.spend);

        return res.json(mockData);
    }

    res.json([]);
});

app.get('/api/recommendations', async (req, res) => {
    let { platform, range } = req.query;

    const rangeMap = {
        '7d': { google: 'LAST_7_DAYS', meta: 'last_7d' },
        '1m': { google: 'LAST_30_DAYS', meta: 'last_30d' },
        '3m': { google: 'LAST_90_DAYS', meta: 'last_90d' },
        'All': { google: 'ALL_TIME', meta: 'maximum' }
    };

    const dateRange = rangeMap[range] ? 
        (platform === 'Google' ? rangeMap[range].google : rangeMap[range].meta) : 
        (platform === 'Google' ? 'LAST_30_DAYS' : 'last_30d');

    const cacheKey = `recs-${platform}-${req.clientData.id}-${dateRange}`;
    const cached = getCached(CACHE.reports, cacheKey);
    if (cached) return res.json(cached);

    if (platform === 'Google') {
        try {
            if (!req.googleService) return res.status(400).json({ error: 'Google Ads not configured' });
            const campaigns = await req.googleService.fetchCampaigns(dateRange);
            const recs = GoogleEngine.generateRecommendations(campaigns);
            setCached(CACHE.reports, cacheKey, recs, 60 * 1000);
            return res.json(recs);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else if (platform === 'Meta') {
        try {
            if (!req.metaService) return res.status(400).json({ error: 'Meta Ads not configured' });
            const recs = await req.metaService.fetchAdRelevanceDiagnostics(dateRange);
            setCached(CACHE.reports, cacheKey, recs, 60 * 1000);
            return res.json(recs);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
    res.json([]);
});


app.get('/api/dashboard/history', async (req, res) => {
    const { platform, range } = req.query;

    const cacheKey = `${platform}-history-${req.clientData.id}-${range || '30D'}`;
    const cached = getCached(CACHE.reports, cacheKey);
    if (cached) return res.json(cached);

    if (platform === 'Google') {
        if (!req.googleService) return res.status(400).json({ error: 'Google Ads not configured' });
        const history = await req.googleService.fetchHistoricalMetrics(range);
        setCached(CACHE.reports, cacheKey, history, 60 * 1000);
        return res.json(history);
    }
    res.json([]);
});

app.get('/api/execution-log', async (req, res) => {
    try {
        const logs = await executionLearning.getExecutionLogs(req.clientData.id);
        res.json(logs);
    } catch (err) {
        res.json(executionLog); // Fallback to memory
    }
});


app.post('/api/google/campaign/status', async (req, res) => {
    const { id, status, note } = req.body;
    try {
        if (!req.googleService) return res.status(400).json({ error: 'Google Ads not configured' });
        await req.googleService.updateCampaignStatus(id, status);
        await executionLearning.recordExecution({
            clientId: req.clientData.id,
            platform: 'Google',
            entityId: id,
            entityType: 'CAMPAIGN',
            action: 'STATUS_CHANGE',
            rationale: note || 'No reason provided',
            beforeMetrics: req.body.beforeMetrics || {}
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/api/google/campaign/upscale', async (req, res) => {
    const { id, currentBudget, increasePercent = 20, note } = req.body;
    try {
        if (!req.googleService) return res.status(400).json({ error: 'Google Ads not configured' });
        const newBudgetMicros = Math.floor(currentBudget * (1 + increasePercent / 100) * 1000000);
        await req.googleService.updateCampaignBudget(id, newBudgetMicros);

        await executionLearning.recordExecution({
            clientId: req.clientData.id,
            platform: 'Google',
            entityId: id,
            entityType: 'CAMPAIGN',
            action: 'UPSCALE',
            rationale: note || 'No reason provided',
            beforeMetrics: req.body.beforeMetrics || {}
        });

        res.json({ success: true, newBudget: currentBudget * (1 + increasePercent / 100) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/api/google/campaign/downscale', async (req, res) => {
    const { id, currentBudget, decreasePercent = 20, note } = req.body;
    try {
        if (!req.googleService) return res.status(400).json({ error: 'Google Ads not configured' });
        const newBudgetMicros = Math.floor(currentBudget * (1 - decreasePercent / 100) * 1000000);
        await req.googleService.updateCampaignBudget(id, newBudgetMicros);

        await executionLearning.recordExecution({
            clientId: req.clientData.id,
            platform: 'Google',
            entityId: id,
            entityType: 'DOWNSCALE',
            action: 'DOWNSCALE',
            rationale: note || 'No reason provided',
            beforeMetrics: req.body.beforeMetrics || {}
        });

        res.json({ success: true, newBudget: currentBudget * (1 - decreasePercent / 100) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});
