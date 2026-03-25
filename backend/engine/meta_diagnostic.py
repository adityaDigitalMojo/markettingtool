from typing import List, Dict, Any

class MetaDiagnosticEngine:
    def __init__(self, benchmarks: Dict[str, Any]):
        self.benchmarks = benchmarks

    def analyze_campaign(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        recommendations = []
        
        cpl = data.get('cpl', 0)
        ctr = data.get('ctr', 0)
        cpm = data.get('cpm', 0)
        cpc = data.get('cpc', 0)
        freq = data.get('freq', 0)
        tsr = data.get('thumb_stop_ratio', 0)
        vhr = data.get('video_hold_rate', 0)
        
        # Rule 1: Creative Fatigue
        # CPM ↑ & CTR ↓ -> fatigue suspected; check frequency
        # Benchmark Frequency: TOFU/MOFU > 2.5, BOFU > 4
        if cpm > self.benchmarks.get('cpm_max', 600) and ctr < self.benchmarks.get('ctr_min', 0.7):
            if freq > 2.5: # Assuming TOFU/MOFU for now
                recommendations.append({
                    "type": "FIX",
                    "title": "Creative Fatigue Detected",
                    "description": f"Frequency is {freq} (> 2.5) with rising CPM and falling CTR. Refresh creatives immediately.",
                    "ice_score": 8.5,
                    "priority": "IMMEDIATE"
                })

        # Rule 2: Offer/Hook Weak
        # CPM flat, CTR ↓, CPC ↑ -> offer/hook weak
        if ctr < self.benchmarks.get('ctr_min', 0.7) and cpc > self.benchmarks.get('cpc_max', 50):
            recommendations.append({
                "type": "FIX",
                "title": "Weak Hook/Offer",
                "description": f"CTR is {ctr}% (< 0.7%) and CPC is {cpc} (> 50). Sharpen headline or first 3 seconds.",
                "ice_score": 7.8,
                "priority": "THIS_WEEK"
            })

        # Rule 3: CPL High / CVR Issue
        # CPM/CTR/CPC stable but CPL ↑ -> audience or form issue
        if cpl > self.benchmarks.get('cpl_target', 1800):
            recommendations.append({
                "type": "REBALANCE",
                "title": "High CPL / CVR Issue",
                "description": f"CPL is {cpl} (> target {self.benchmarks.get('cpl_target')}). Check lead form friction or audience-creative fit.",
                "ice_score": 7.5,
                "priority": "THIS_WEEK"
            })

        # Rule 4: Thumb Stop Ratio
        if tsr > 0 and tsr < 0.25: # Benchmark 25%
            recommendations.append({
                "type": "FIX",
                "title": "Low Thumb Stop Ratio",
                "description": f"Thumb-stop is {tsr*100}% (< 25%). The first 3 seconds of your video are failing to stop the scroll.",
                "ice_score": 8.2,
                "priority": "IMMEDIATE"
            })

        # Rule 5: Video Hold Rate
        if vhr > 0 and vhr < 0.25:
            recommendations.append({
                "type": "FIX",
                "title": "Low Video Hold Rate",
                "description": f"Hold rate is {vhr*100}% (< 25%). People are dropping off quickly. Add pattern-interrupts or re-script the middle.",
                "ice_score": 7.2,
                "priority": "THIS_WEEK"
            })

        return recommendations

# Example Usage / Benchmarks from SOP
DEFAULT_BENCHMARKS = {
    "cpm_max": 600,
    "ctr_min": 0.7,
    "cpc_max": 50,
    "cpl_target": 720, # Dynamic based on ticket size, 720 for Amara as per screenshot
    "tsr_min": 0.25,
    "vhr_min": 0.25
}
