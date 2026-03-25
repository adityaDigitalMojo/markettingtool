import React from 'react';
import { X, Target, BarChart3, TrendingDown, DollarSign, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

const CampaignDetailModal = ({ campaign, isOpen, onClose, onAction }) => {
    if (!isOpen || !campaign) return null;

    const recommendations = [
        {
            type: 'UPSCALE',
            label: 'Upscale Budget',
            desc: 'CTR is above 2% and CPL is ₹800 (40% below target). Recommend 20% budget increase.',
            impact: 'HIGH'
        },
        {
            type: 'PAUSE',
            label: 'Pause Underperformers',
            desc: 'Found 2 keywords with high spend and zero conversions.',
            impact: 'MEDIUM'
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-background border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                <header className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-10">
                    <div>
                        <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> {campaign.status} Campaign
                        </div>
                        <h2 className="text-2xl font-bold">{campaign.name}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-text-muted">
                        <X size={20} />
                    </button>
                </header>

                <div className="p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white/2 p-4 rounded-xl border border-white/5">
                            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Spend</div>
                            <div className="text-xl font-bold">₹{campaign.spend?.toLocaleString() || 0}</div>
                        </div>
                        <div className="bg-white/2 p-4 rounded-xl border border-white/5">
                            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Leads</div>
                            <div className="text-xl font-bold">{campaign.leads || 0}</div>
                        </div>
                        <div className="bg-white/2 p-4 rounded-xl border border-white/5">
                            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Avg CPL</div>
                            <div className="text-xl font-bold text-primary">₹{campaign.cpl || 0}</div>
                        </div>
                        <div className="bg-white/2 p-4 rounded-xl border border-white/5">
                            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Budget</div>
                            <div className="text-xl font-bold">₹{campaign.budget?.toLocaleString() || 0}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            {(campaign.status !== 'ENABLED' && campaign.status !== 'ACTIVE') && campaign.reasons && campaign.reasons.length > 0 && (
                                <div className="mb-8 p-4 bg-danger/10 border border-danger/20 rounded-xl">
                                    <h4 className="text-[10px] font-bold text-danger uppercase mb-2 flex items-center gap-2">
                                        <AlertTriangle size={12} /> System Status Reasoning
                                    </h4>
                                    <ul className="text-sm text-text-muted list-disc list-inside">
                                        {campaign.reasons.map((r, i) => (
                                            <li key={i}>{r.replace(/_/g, ' ')}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">Diagnostics & Recommendations</h3>
                            <div className="flex flex-col gap-4">
                                {recommendations.map((rec, i) => (
                                    <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                                    <Zap size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-bold">{rec.label}</div>
                                                    <div className="text-[10px] text-text-muted uppercase tracking-widest">Impact: {rec.impact}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onAction(rec.type, campaign)}
                                                className="px-4 py-2 bg-primary text-background text-[10px] font-bold uppercase rounded-lg hover:scale-105 transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)] shadow-primary/20"
                                            >
                                                Apply Now
                                            </button>
                                        </div>
                                        <p className="text-sm text-text-muted leading-relaxed">{rec.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">Manual Control</h3>
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => onAction('PAUSE', campaign)}
                                    className="w-full flex justify-between items-center p-4 bg-white/2 border border-white/5 rounded-xl hover:bg-white/5 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle size={16} className="text-warning" />
                                        <span className="text-sm font-medium">{(campaign.status === 'ENABLED' || campaign.status === 'ACTIVE') ? 'Pause Campaign' : 'Resume Campaign'}</span>
                                    </div>
                                    <div className={`w-8 h-4 rounded-full relative ${(campaign.status === 'ENABLED' || campaign.status === 'ACTIVE') ? 'bg-primary' : 'bg-white/20'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-background transition-all ${(campaign.status === 'ENABLED' || campaign.status === 'ACTIVE') ? 'right-0.5' : 'left-0.5'}`}></div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => onAction('UPSCALE', campaign)}
                                    className="w-full flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-xl hover:bg-white/5 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <TrendingDown size={16} className="text-primary rotate-180" />
                                        <span className="text-sm font-medium">Upscale ( +20% Budget )</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => onAction('DOWNSCALE', campaign)}
                                    className="w-full flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-xl hover:bg-white/5 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <TrendingDown size={16} className="text-danger" />
                                        <span className="text-sm font-medium">Downscale ( -20% Budget )</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetailModal;
