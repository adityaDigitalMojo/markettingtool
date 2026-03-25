import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Percent, TrendingDown, Target, Info } from 'lucide-react';

const BiddingView = ({ platform, range, onCampaignClick, onAction }) => {
    const [data, setData] = useState({ analysis: [], stats: { decrease: 0, hold: 0, increase: 0 } });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:8000/api/bidding/analysis?platform=${platform}&range=${range}`);
                setData(res.data);
            } catch (err) {
                console.error("Error fetching bidding data:", err);
            }
            setLoading(false);
        };
        fetchData();
    }, [platform, range]);

    if (loading) return <div className="animate-pulse flex items-center justify-center h-64 text-text-muted">Loading Bidding Analysis...</div>;
    if (!data || !Array.isArray(data.analysis)) return <div className="text-text-muted text-center py-20 font-bold uppercase tracking-widest opacity-30">No Bidding Data Available</div>;

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="text-primary" /> Bidding Analysis</h1>
                <p className="text-text-muted text-xs uppercase font-bold tracking-widest mt-1">
                    {data.analysis.length} ad groups across {new Set(data.analysis.map(a => a.campaign)).size} campaigns • CPA vs CPC / CVR
                </p>
            </header>

            <div className="card border-primary/20 bg-primary/5">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-[10px] font-bold text-primary uppercase mb-2">Bidding Formula</div>
                        <div className="text-lg font-mono">CPA = CPC / CVR</div>
                        <div className="text-[10px] text-text-muted mt-1 uppercase">Max CPC = MIN(Low Top-of-Page CPC * 1.35, Target CPA * CVR)</div>
                        <p className="text-[10px] text-text-muted mt-2">Target CPA ₹1850 - If your CPC exceeds Max CPC, you're paying more per click than the lead value justifies.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center">
                            <div className="text-[10px] text-text-muted uppercase font-bold">Need Decrease</div>
                            <div className="text-2xl font-bold text-danger">{data.stats.decrease}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] text-text-muted uppercase font-bold">Hold</div>
                            <div className="text-2xl font-bold text-success">{data.stats.hold}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] text-text-muted uppercase font-bold">Can Increase</div>
                            <div className="text-2xl font-bold text-warning">{data.stats.increase}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 border-b border-white/5">
                        <tr>
                            <th className="px-6 py-4 font-bold uppercase text-[10px] text-text-muted">Campaign</th>
                            <th className="px-6 py-4 font-bold uppercase text-[10px] text-text-muted">Avg CPC</th>
                            <th className="px-6 py-4 font-bold uppercase text-[10px] text-text-muted">Computed Max CPC</th>
                            <th className="px-6 py-4 font-bold uppercase text-[10px] text-text-muted">CPC Status</th>
                            <th className="px-6 py-4 font-bold uppercase text-[10px] text-text-muted">CVR</th>
                            <th className="px-4 py-4 font-bold uppercase text-[10px] text-text-muted text-center">Recommendation</th>
                            <th className="px-4 py-4 font-bold uppercase text-[10px] text-text-muted text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.analysis.map((ag, idx) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => onCampaignClick({ id: ag.campaignId, name: ag.campaign })}>
                                <td className="px-6 py-4">
                                    <div className="font-bold hover:text-primary transition-colors">{ag.campaign}</div>
                                    <div className="text-[9px] text-text-muted uppercase">{ag.name}</div>
                                </td>
                                <td className="px-6 py-4 font-bold">₹{ag.cpc || 0}</td>
                                <td className="px-6 py-4 text-text-muted">₹{ag.computedMaxCpc || 'N/A'}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${ag.status === 'danger' ? 'bg-danger/20 text-danger' : ag.status === 'warning' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                                        {ag.status === 'danger' ? 'Above Max' : ag.status === 'warning' ? 'Below Potential' : 'Within Range'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold text-primary">{ag.cvr || 0}%</td>
                                <td className="px-4 py-4 text-center">
                                    <span className={`text-[9px] font-bold ${ag.status === 'danger' ? 'text-danger' : ag.status === 'warning' ? 'text-warning' : 'text-success'}`}>
                                        {typeof ag.recommendation === 'object' ? ag.recommendation?.reason : ag.recommendation}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAction(ag.status === 'danger' ? 'DOWNSCALE' : ag.status === 'warning' ? 'UPSCALE' : 'HOLD', { id: ag.campaignId, name: ag.campaign });
                                        }}
                                        className={`px-3 py-1 rounded border text-[9px] font-bold uppercase transition-all ${ag.status === 'danger' ? 'border-danger/30 text-danger hover:bg-danger/10' : ag.status === 'warning' ? 'border-warning/30 text-warning hover:bg-warning/10' : 'border-success/30 text-success'}`}
                                    >
                                        {ag.action || ag.recommendation?.action || 'HOLD'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">Smart Bidding Readiness <Info size={16} className="text-text-muted" /></h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.analysis.slice(0, 3).map((ag, i) => (
                        <div key={i} className="card border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-[10px] font-bold uppercase truncate max-w-[150px]">{ag.campaign}</div>
                                <span className="px-2 py-0.5 bg-warning/20 text-warning rounded text-[9px] font-bold uppercase">Needs Volume</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-[9px] text-text-muted uppercase">Conversions (30d)</div>
                                    <div className="text-lg font-bold">{ag.leads} <span className="text-xs font-normal text-text-muted">{'<'} 30</span></div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] text-text-muted uppercase">Suggested CPL</div>
                                    <div className="text-lg font-bold text-primary">₹2,350</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BiddingView;
