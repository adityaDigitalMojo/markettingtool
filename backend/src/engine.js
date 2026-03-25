const DEFAULT_BENCHMARKS = {
    cpm_max: 600,
    ctr_min: 0.7,
    cpc_max: 50,
    cpl_target: 720,
    tsr_min: 0.25,
    vhr_min: 0.25
};

function analyzeCampaign(data, benchmarks = DEFAULT_BENCHMARKS) {
    const recommendations = [];

    const cpl = parseFloat(data.cpl) || 0;
    const ctr = parseFloat(data.ctr) || 0;
    const cpm = parseFloat(data.cpm) || 0;
    const cpc = parseFloat(data.cpc) || 0;
    const freq = parseFloat(data.freq) || 0;
    const tsr = parseFloat(data.thumb_stop_ratio) || 0;
    const vhr = parseFloat(data.video_hold_rate) || 0;

    // Rule 1: Creative Fatigue
    if (cpm > benchmarks.cpm_max && ctr < benchmarks.ctr_min) {
        if (freq > 2.5) {
            recommendations.push({
                type: "FIX",
                title: "Creative Fatigue Detected",
                description: `Frequency is ${freq} (> 2.5) with rising CPM and falling CTR. Refresh creatives immediately.`,
                ice_score: 8.5,
                priority: "IMMEDIATE"
            });
        }
    }

    // Rule 2: Offer/Hook Weak
    if (ctr < benchmarks.ctr_min && cpc > benchmarks.cpc_max) {
        recommendations.push({
            type: "FIX",
            title: "Weak Hook/Offer",
            description: `CTR is ${ctr}% (< 0.7%) and CPC is ${cpc} (> 50). Sharpen headline or first 3 seconds.`,
            ice_score: 7.8,
            priority: "THIS_WEEK"
        });
    }

    // Rule 3: CPL High / CVR Issue
    if (cpl > benchmarks.cpl_target) {
        recommendations.push({
            type: "REBALANCE",
            title: "High CPL / CVR Issue",
            description: `CPL is ${cpl} (> target ${benchmarks.cpl_target}). Check lead form friction or audience-creative fit.`,
            ice_score: 7.5,
            priority: "THIS_WEEK"
        });
    }

    // Rule 4: Thumb Stop Ratio
    if (tsr > 0 && tsr < 0.25) {
        recommendations.push({
            type: "FIX",
            title: "Low Thumb Stop Ratio",
            description: `Thumb-stop is ${(tsr * 100).toFixed(1)}% (< 25%). The first 3 seconds are failing to stop the scroll.`,
            ice_score: 8.2,
            priority: "IMMEDIATE"
        });
    }

    return recommendations;
}

module.exports = { analyzeCampaign, DEFAULT_BENCHMARKS };
