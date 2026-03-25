import React, { useState } from 'react';
import { Shield, Target, ExternalLink, MoreVertical, Pause, Play, TrendingDown } from 'lucide-react';
import AlertsModal from './AlertsModal';

const CampaignsView = ({ campaigns, platform, onCampaignClick, onAction, alerts }) => {
    const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);

    if (!campaigns) return <div className="animate-pulse items-center justify-center flex h-64 text-text-muted transition-all">Loading Campaigns...</div>;

    const searchCampaigns = campaigns.filter(c => c.classification === 'branded' || c.classification === 'location');
    const demandGenCampaigns = campaigns.filter(c => c.classification === 'demand_gen');
    const otherCampaigns = campaigns.filter(c => c.classification === 'other' || !c.classification);

    const CampaignTable = ({ title, data }) => (
        <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">{title}</h3>
                <span className="text-xs text-text-muted">{data.length} campaigns • Spend ₹{data.reduce((a, b) => a + (b.spend || 0), 0).toLocaleString()}</span>
            </div>
            <div className="card p-0 overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 border-b border-white/5">
                        <tr>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted">Campaign</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-center">Status</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted">Type</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted">Class</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted">Health</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-right">Spend</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-right">Leads</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-right">CPL</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-right">CTR</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-right">CVR</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-right">IS</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted">Bidding</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-right">Budget</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(c => (
                            <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="px-4 py-4">
                                    <div
                                        className="font-bold flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => onCampaignClick(c)}
                                    >
                                        <input type="checkbox" className="rounded border-white/10 bg-transparent" onClick={(e) => e.stopPropagation()} />
                                        {c.name}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col items-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAction('PAUSE', c);
                                            }}
                                            className="flex items-center gap-2 group"
                                        >
                                            <div className={`w-7 h-3.5 rounded-full relative transition-all ${(c.status === 'ENABLED' || c.status === 'ACTIVE') ? 'bg-success' : 'bg-white/20 hover:bg-white/30'}`}>
                                                <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-background transition-all ${(c.status === 'ENABLED' || c.status === 'ACTIVE') ? 'right-0.5' : 'left-0.5'}`}></div>
                                            </div>
                                        </button>
                                        <span className={`text-[8px] font-bold uppercase tracking-wider mt-1 ${(c.status === 'ENABLED' || c.status === 'ACTIVE') ? 'text-success' : 'text-text-muted'}`}>
                                            {(c.status === 'ENABLED' || c.status === 'ACTIVE') ? 'Running' : 'Paused'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${c.classification === 'branded' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {c.classification}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${c.healthClass === 'CRITICAL' ? 'bg-danger/20 text-danger' : c.healthClass === 'LEARNING' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                                        {c.healthClass || 'HEALTHY'}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className={`h-full ${c.healthClass === 'CRITICAL' ? 'bg-danger' : c.healthClass === 'LEARNING' ? 'bg-warning' : 'bg-success'}`} style={{ width: `${c.health || 0}%` }}></div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-right font-medium">₹{(c.spend || 0).toLocaleString()}</td>
                                <td className="px-4 py-4 text-right font-bold">{c.leads || 0}</td>
                                <td className="px-4 py-4 text-right font-bold">₹{c.cpl || 0}</td>
                                <td className="px-4 py-4 text-right">{c.ctr || 0}%</td>
                                <td className="px-4 py-4 text-right">{c.cvr || 0}%</td>
                                <td className="px-4 py-4 text-right text-text-muted">{c.is || 0}%</td>
                                <td className="px-4 py-4 font-mono text-[9px] text-text-muted uppercase">{c.bidding || 'N/A'}</td>
                                <td className="px-4 py-4 text-right font-bold">₹{(c.budget || 0).toLocaleString()}</td>
                                <td className="px-4 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            title="Upscale Budget"
                                            onClick={(e) => { e.stopPropagation(); onAction('UPSCALE', c); }}
                                            className="p-1 hover:bg-white/10 rounded"
                                        >
                                            <TrendingDown size={14} className="text-primary rotate-180" />
                                        </button>
                                        <button
                                            title="Downscale Budget"
                                            onClick={(e) => { e.stopPropagation(); onAction('DOWNSCALE', c); }}
                                            className="p-1 hover:bg-white/10 rounded"
                                        >
                                            <TrendingDown size={14} className="text-danger" />
                                        </button>
                                        <button
                                            title="Settings"
                                            onClick={(e) => { e.stopPropagation(); onCampaignClick(c); }}
                                            className="p-1 hover:bg-white/10 rounded"
                                        >
                                            <MoreVertical size={14} className="text-text-muted" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-6">
            <div
                className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all group"
                onClick={() => setIsAlertsModalOpen(true)}
            >
                <div className="flex items-center gap-3">
                    <Shield className="text-danger group-hover:scale-110 transition-transform" size={20} />
                    <div>
                        <div className="text-xs font-bold text-danger uppercase">{alerts?.length || 0} Critical Alerts</div>
                        <div className="text-[10px] text-text-muted">Click to view actionable recommendations</div>
                    </div>
                </div>
                <div className="btn-primary py-1 px-3 text-[10px]">Fix Issues</div>
            </div>

            <CampaignTable title="Search Campaigns (Branded + Location)" data={searchCampaigns} />
            <CampaignTable title="Demand Gen Campaigns" data={demandGenCampaigns} />
            {otherCampaigns.length > 0 && <CampaignTable title={platform === 'Meta' ? "All Campaigns" : "Other Campaigns"} data={otherCampaigns} />}

            <AlertsModal
                isOpen={isAlertsModalOpen}
                onClose={() => setIsAlertsModalOpen(false)}
                alerts={alerts || []}
                onAction={onAction}
            />
        </div>
    );
};

export default CampaignsView;
