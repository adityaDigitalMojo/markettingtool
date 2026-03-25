import React from 'react';
import { Pause, MoreVertical, ExternalLink } from 'lucide-react';

const AdGroupsView = ({ adgroups, platform, onCampaignClick, onAction }) => {
    if (!Array.isArray(adgroups)) return <div className="animate-pulse flex items-center justify-center h-64 text-text-muted">Loading Ad Groups...</div>;

    const searchGroups = adgroups.filter(ag => !ag.type?.toLowerCase().includes('demand_gen') && !ag.name?.toLowerCase().includes('demand_gen'));
    const demandGenGroups = adgroups.filter(ag => ag.type?.toLowerCase().includes('demand_gen') || ag.name?.toLowerCase().includes('demand_gen'));

    const GroupTable = ({ title, data }) => (
        <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">{title}</h3>
                <span className="text-xs text-text-muted">{data.length} ad groups</span>
            </div>
            <div className="card p-0 overflow-hidden">
                <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 border-b border-white/5">
                        <tr>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted">Ad Group</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-center">Status</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted">Campaign</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted">Type</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-right">Impr.</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-right">Clicks</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-right">Spend</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-right">Conv.</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-right">CTR</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-right">CVR</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-right">CPC</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-right">CPL</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px] text-text-muted text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(ag => (
                            <tr key={ag.id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => onCampaignClick({ id: ag.campaignId, name: ag.campaign })}>
                                <td className="px-4 py-4 font-bold flex items-center gap-2">
                                    <input type="checkbox" className="rounded border-white/10 bg-transparent" onClick={(e) => e.stopPropagation()} />
                                    <span className="hover:text-primary transition-colors">{ag.name}</span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col items-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAction('PAUSE', { id: ag.campaignId, name: ag.campaign, status: ag.status });
                                            }}
                                            className="flex items-center gap-2 group"
                                        >
                                            <div className={`w-7 h-3.5 rounded-full relative transition-all ${(ag.status === 'ENABLED' || ag.status === 'ACTIVE') ? 'bg-success' : 'bg-white/20 hover:bg-white/30'}`}>
                                                <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-background transition-all ${(ag.status === 'ENABLED' || ag.status === 'ACTIVE') ? 'right-0.5' : 'left-0.5'}`}></div>
                                            </div>
                                        </button>
                                        <span className={`text-[8px] font-bold uppercase tracking-wider mt-1 ${(ag.status === 'ENABLED' || ag.status === 'ACTIVE') ? 'text-success' : 'text-text-muted'}`}>
                                            {(ag.status === 'ENABLED' || ag.status === 'ACTIVE') ? 'Running' : 'Paused'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-text-muted truncate max-w-[150px]">{ag.campaign}</td>
                                <td className="px-4 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${ag.type === 'DEMAND_GEN' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                        {(ag.type || '').toLowerCase().includes('demand_gen') ? 'demand_gen' : (platform === 'Meta' ? 'Meta Adset' : 'Search')}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right text-text-muted">{ag.impressions?.toLocaleString()}</td>
                                <td className="px-4 py-4 text-right text-text-muted">{ag.clicks?.toLocaleString()}</td>
                                <td className="px-4 py-4 text-right font-medium text-white">₹{ag.spend?.toLocaleString()}</td>
                                <td className="px-4 py-4 text-right font-bold text-primary">{ag.leads}</td>
                                <td className="px-4 py-4 text-right">{ag.ctr}%</td>
                                <td className="px-4 py-4 text-right">{ag.cvr}%</td>
                                <td className="px-4 py-4 text-right text-text-muted">₹{ag.cpc}</td>
                                <td className="px-4 py-4 text-right font-bold">₹{ag.cpl}</td>
                                <td className="px-4 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAction('PAUSE', { id: ag.campaignId, name: ag.campaign });
                                            }}
                                            className="p-1 hover:bg-white/10 rounded"
                                        >
                                            <Pause size={14} className="text-text-muted" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCampaignClick({ id: ag.campaignId, name: ag.campaign });
                                            }}
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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold">Ad Groups</h2>
                    <p className="text-xs text-text-muted">{adgroups.length} active ad groups (paused/removed filtered out)</p>
                </div>
                <select className="bg-white/5 border border-white/10 rounded px-4 py-2 text-xs font-bold uppercase">
                    <option>All Campaigns</option>
                </select>
            </div>

            <GroupTable title={platform === 'Meta' ? "All Ad Groups" : "Search Ad Groups"} data={searchGroups} />
            {demandGenGroups.length > 0 && <GroupTable title="Demand Gen Ad Groups" data={demandGenGroups} />}
        </div>
    );
};

export default AdGroupsView;
