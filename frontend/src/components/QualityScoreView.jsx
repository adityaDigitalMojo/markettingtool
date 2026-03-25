import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Info, ChevronDown } from 'lucide-react';
import QSImprovementModal from './QSImprovementModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const QualityScoreView = ({ platform, clientId, range, onAction }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedKeyword, setSelectedKeyword] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!clientId) return;
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/api/keywords?platform=${platform}&clientId=${clientId}&range=${range}`);
                setData(res.data);
            } catch (err) {
                console.error("Error fetching keywords data:", err);
            }
            setLoading(false);
        };
        fetchData();
    }, [platform, clientId, range]);

    if (loading) return <div className="animate-pulse flex items-center justify-center h-64 text-text-muted transition-all">Analyzing Quality Scores...</div>;

    const getQsColor = (qs) => {
        if (qs >= 7) return 'text-success';
        if (qs >= 4) return 'text-warning';
        return 'text-danger';
    };

    const getRelevanceColor = (rel) => {
        if (rel === 'ABOVE_AVERAGE') return 'bg-success/20 text-success';
        if (rel === 'AVERAGE') return 'bg-warning/20 text-warning';
        return 'bg-danger/20 text-danger';
    };

    const getRelevanceLabel = (rel) => {
        if (rel === 'ABOVE_AVERAGE') return 'Above Avg';
        if (rel === 'AVERAGE') return 'Average';
        return 'Below Avg';
    };

    return (
        <div className="flex flex-col gap-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="text-primary" />
                        {platform === 'Meta' ? 'Ad Relevance Diagnostics' : 'Quality Score Analysis'}
                    </h1>
                    <p className="text-text-muted text-xs uppercase font-bold tracking-widest mt-1">
                        {platform === 'Meta' ? 'Meta Ad Ranking · Quality · Engagement · Conversion' : 'Search campaigns only (Branded + Location)'} • {data.reduce((a, b) => a + b.keywords.length, 0)} {platform === 'Meta' ? 'ads' : 'keywords'}
                    </p>
                </div>
                <div className="flex bg-white/5 rounded-lg p-1">
                    <div className="px-4 py-2 border-r border-white/10 text-center">
                        <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Avg Quality Score</div>
                        <div className="text-xl font-bold text-primary">5.8<span className="text-xs text-text-muted">/10</span></div>
                    </div>
                    <div className="px-4 py-2 border-r border-white/10 text-center">
                        <div className="text-[10px] text-text-muted uppercase font-bold mb-1 text-danger">Critical (QS &lt; 3)</div>
                        <div className="text-xl font-bold">12</div>
                    </div>
                    <div className="px-4 py-2 text-center">
                        <div className="text-[10px] text-text-muted uppercase font-bold mb-1 text-warning">Below Average (QS &lt; 5)</div>
                        <div className="text-xl font-bold">24</div>
                    </div>
                </div>
            </header>

            <div className="flex flex-col gap-6">
                {data.map((group, idx) => (
                    <div key={idx} className="card p-0 overflow-hidden border-white/5">
                        <div className="bg-white/5 px-6 py-4 flex justify-between items-center border-b border-white/5 cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-8 rounded-full ${group.avgQs > 7 ? 'bg-success' : group.avgQs > 4 ? 'bg-warning' : 'bg-danger'}`}></div>
                                <div>
                                    <div className="text-sm font-bold">{group.name}</div>
                                    <div className="text-[10px] text-text-muted uppercase font-bold">{group.keywords.length} keywords • {group.avgQs} avg QS</div>
                                </div>
                            </div>
                            <ChevronDown size={14} className="text-text-muted" />
                        </div>

                        <table className="w-full text-left text-[10px]">
                            <thead className="bg-white/2 border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-3 font-bold uppercase text-text-muted">{platform === 'Meta' ? 'Ad Name' : 'Keyword'}</th>
                                    <th className="px-4 py-3 font-bold uppercase text-text-muted text-center">{platform === 'Meta' ? 'Score' : 'QS'}</th>
                                    <th className="px-4 py-3 font-bold uppercase text-text-muted text-center">{platform === 'Meta' ? 'Engagement Rank' : 'Exp. CTR'}</th>
                                    <th className="px-4 py-3 font-bold uppercase text-text-muted text-center">{platform === 'Meta' ? 'Quality Rank' : 'Ad Relevance'}</th>
                                    <th className="px-4 py-3 font-bold uppercase text-text-muted text-center">{platform === 'Meta' ? 'Conv. Rate Rank' : 'LP Exp.'}</th>
                                    <th className="px-4 py-3 font-bold uppercase text-text-muted text-right">Impr.</th>
                                    <th className="px-4 py-3 font-bold uppercase text-text-muted text-right">Clicks</th>
                                    <th className="px-4 py-3 font-bold uppercase text-text-muted text-right">Conv.</th>
                                    <th className="px-4 py-3 font-bold uppercase text-text-muted text-right">Cost</th>
                                    <th className="px-4 py-3 font-bold uppercase text-text-muted text-center text-primary italic">Improvement</th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.keywords.map((k, kIdx) => (
                                    <tr key={kIdx} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="font-bold">{k.text}</div>
                                            <div className="text-[8px] text-text-muted uppercase">Matched: {k.matchType}</div>
                                        </td>
                                        <td className={`px-4 py-3 text-center text-sm font-black ${getQsColor(k.qs)}`}>{k.qs}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-[3px] font-bold uppercase text-[8px] ${getRelevanceColor(k.exp_ctr)}`}>
                                                {getRelevanceLabel(k.exp_ctr)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-[3px] font-bold uppercase text-[8px] ${getRelevanceColor(k.creative_quality)}`}>
                                                {getRelevanceLabel(k.creative_quality)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-[3px] font-bold uppercase text-[8px] ${getRelevanceColor(k.lp_exp)}`}>
                                                {getRelevanceLabel(k.lp_exp)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-text-muted">{k.impressions.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right text-text-muted">{k.clicks.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right font-bold text-success">{k.leads}</td>
                                        <td className="px-4 py-3 text-right font-bold whitespace-nowrap">₹{k.spend.toLocaleString()}</td>
                                        <td className="px-6 py-3 text-center">
                                            {k.recommendation ? (
                                                <button
                                                    className={`px-3 py-1 text-[9px] font-black uppercase rounded-[4px] transition-all flex items-center gap-1 mx-auto ${k.recommendation.status === 'CRITICAL' ? 'bg-danger/10 hover:bg-danger/20 text-danger' : 'bg-primary/10 hover:bg-primary/20 text-primary'}`}
                                                    onClick={() => setSelectedKeyword(k)}
                                                >
                                                    <Info size={10} /> {k.recommendation.action}
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-success font-black opacity-30 uppercase">Healthy</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            <QSImprovementModal
                isOpen={!!selectedKeyword}
                onClose={() => setSelectedKeyword(null)}
                keyword={selectedKeyword}
                onAction={onAction}
            />
        </div>
    );
};

export default QualityScoreView;
