import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    Tablet,
    MapPin,
    Layout,
    ChevronDown,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Target,
    Activity,
    Info,
    Search
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const BreakdownsView = ({ platform, clientId, campaigns, range }) => {
    const [dimension, setDimension] = useState('Age');
    const [selectedCampaignId, setSelectedCampaignId] = useState('OVERALL');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const dimensions = [
        { id: 'Age', label: 'Age', icon: Users },
        { id: 'Gender', label: 'Gender', icon: Activity },
        { id: 'Placement', label: 'Placement', icon: Layout },
        { id: 'Device', label: 'Device', icon: Tablet },
        { id: 'Region', label: 'Region', icon: MapPin }
    ];

    const fetchData = async () => {
        if (!clientId) return;
        setLoading(true);
        try {
            const campaignParam = selectedCampaignId === 'OVERALL' ? '' : `&campaignId=${selectedCampaignId}`;
            const res = await axios.get(`${API_BASE}/api/breakdowns?platform=${platform}&clientId=${clientId}&dimension=${dimension}${campaignParam}&range=${range}`);
            setData(res.data);
        } catch (err) {
            console.error("Error fetching breakdowns:", err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dimension, selectedCampaignId, range, platform, clientId]);

    const totalSpend = data.reduce((sum, item) => sum + item.spend, 0);
    const bestPerformer = [...data].sort((a, b) => (a.cpl || Infinity) - (b.cpl || Infinity))[0];
    const worstPerformer = [...data].sort((a, b) => (b.cpl || 0) - (a.cpl || 0))[0];

    const selectedCampaignName = selectedCampaignId === 'OVERALL'
        ? 'Account Overview (all campaigns)'
        : campaigns.find(c => c.id === selectedCampaignId)?.name || 'Unknown Campaign';

    const getStatusBadge = (item) => {
        if (item.leads === 0 && item.spend > 1000) return { label: 'UNDERPERFORMER', color: 'bg-danger/10 text-danger' };
        if (item.cpl > 1200) return { label: 'UNDERPERFORMER', color: 'bg-danger/10 text-danger' };
        if (item.cpl > 0 && item.cpl < 800) return { label: 'TOP PERFORMER', color: 'bg-success/10 text-success' };
        return { label: 'NEUTRAL', color: 'bg-white/10 text-text-muted' };
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <Activity className="text-primary" size={24} />
                        Breakdowns
                    </h1>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">
                        Performance by demographic and placement dimensions
                    </p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 px-4 py-2 bg-white/2 border border-white/5 rounded-xl hover:bg-white/5 transition-all min-w-[300px] justify-between group"
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">{selectedCampaignId === 'OVERALL' ? 'Type' : 'Active Campaign'}</span>
                            <span className="text-xs font-bold truncate max-w-[240px]">{selectedCampaignName}</span>
                        </div>
                        <ChevronDown size={16} className={`text-text-muted transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                            <div className="absolute top-full right-0 mt-2 w-full min-w-[320px] bg-background border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                                    <button
                                        onClick={() => { setSelectedCampaignId('OVERALL'); setIsDropdownOpen(false); }}
                                        className={`w-full text-left p-3 rounded-xl transition-all flex justify-between items-center ${selectedCampaignId === 'OVERALL' ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-white/5 text-text-muted'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold">Account Overview</span>
                                            <span className="text-[9px] opacity-60 uppercase font-black">All Campaigns</span>
                                        </div>
                                    </button>
                                    <div className="h-[1px] bg-white/5 my-1"></div>
                                    {campaigns.filter(c => c.status === 'ENABLED' || c.status === 'ACTIVE').map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => { setSelectedCampaignId(c.id); setIsDropdownOpen(false); }}
                                            className={`w-full text-left p-3 rounded-xl transition-all flex justify-between items-center group ${selectedCampaignId === c.id ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-white/5 text-text-muted'}`}
                                        >
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-xs font-bold truncate">{c.name}</span>
                                                <span className="text-[9px] opacity-60 uppercase font-bold tracking-tighter truncate">{c.type}</span>
                                            </div>
                                            <div className="bg-background px-2 py-0.5 rounded text-[8px] font-bold border border-white/5 group-hover:border-primary/30 transition-colors">
                                                CPL ₹{c.cpl}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </header>

            <div className="flex gap-4 border-b border-white/5">
                {dimensions.map(dim => {
                    const Icon = dim.icon;
                    return (
                        <button
                            key={dim.id}
                            onClick={() => setDimension(dim.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-[11px] font-bold uppercase tracking-widest transition-all relative ${dimension === dim.id ? 'text-primary' : 'text-text-muted hover:text-text'}`}
                        >
                            <Icon size={14} />
                            {dim.label}
                            {dimension === dim.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>}
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/2 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.05] transition-all group-hover:scale-110">
                        <DollarSign size={80} />
                    </div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <DollarSign size={12} className="text-primary" /> Total Spend
                    </div>
                    <div className="text-2xl font-bold">₹{totalSpend.toLocaleString()}</div>
                </div>

                <div className="bg-white/2 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.05] transition-all group-hover:scale-110">
                        <TrendingUp size={80} />
                    </div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <TrendingUp size={12} className="text-success" /> Best Performing
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-xl font-bold text-success">{bestPerformer?.dimension || 'N/A'}</div>
                        <div className="text-[10px] font-bold px-1.5 py-0.5 bg-success/10 text-success rounded uppercase tracking-tighter">CPL ₹{bestPerformer?.cpl || 0}</div>
                    </div>
                </div>

                <div className="bg-white/2 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.05] transition-all group-hover:scale-110">
                        <TrendingDown size={80} />
                    </div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <TrendingDown size={12} className="text-danger" /> Worst Performing
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-xl font-bold text-danger">{worstPerformer?.dimension || 'N/A'}</div>
                        <div className="text-[10px] font-bold px-1.5 py-0.5 bg-danger/10 text-danger rounded uppercase tracking-tighter">CPL ₹{worstPerformer?.cpl || 0}</div>
                    </div>
                </div>

                <div className="bg-white/2 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group overflow-hidden relative border-l-primary/30">
                    <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.05] transition-all group-hover:scale-110">
                        <MapPin size={80} />
                    </div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Target size={12} className="text-primary" /> Geo Status
                    </div>
                    <div className="text-lg font-bold text-primary">All spend within target</div>
                </div>
            </div>

            <div className="bg-white/2 rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/2 border-b border-white/5">
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">{dimension}</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Spend</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Spend %</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Impr.</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Clicks</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">CTR</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">CPC</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">CPM</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Leads</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">CPL</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Recommendation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="11" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                            <div className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] animate-pulse">Syncing Segment Data...</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <Search size={40} className="text-text-muted" />
                                            <div className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em]">No Breakdown Data Available</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.map((item, idx) => {
                                    const spendPct = totalSpend > 0 ? (item.spend / totalSpend * 100).toFixed(1) : 0;
                                    const status = getStatusBadge(item);
                                    return (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 group transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="font-bold text-sm tracking-tight">{item.dimension}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase w-fit ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-2 min-w-[120px]">
                                                    <span className="font-bold tracking-tighter">₹{item.spend.toLocaleString()}</span>
                                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary shadow-[0_0_8px_rgba(234,179,8,0.5)] transition-all duration-1000"
                                                            style={{ width: `${spendPct}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right font-medium text-text-muted text-sm">{spendPct}%</td>
                                            <td className="px-6 py-5 text-right text-text-muted text-sm">{item.impressions.toLocaleString()}</td>
                                            <td className="px-6 py-5 text-right text-text-muted text-sm font-medium">{item.clicks.toLocaleString()}</td>
                                            <td className="px-6 py-5 text-right text-sm">
                                                <span className={`${item.ctr > 1.5 ? 'text-success' : item.ctr > 0.8 ? 'text-text' : 'text-danger'} font-bold`}>{item.ctr}%</span>
                                            </td>
                                            <td className="px-6 py-5 text-right text-sm text-text-muted">₹{item.cpc.toLocaleString()}</td>
                                            <td className="px-6 py-5 text-right text-sm text-text-muted">₹{item.cpm.toLocaleString()}</td>
                                            <td className="px-6 py-5 text-right font-black text-primary text-sm">{item.leads}</td>
                                            <td className="px-6 py-5 text-right">
                                                <span className={`font-bold text-sm ${item.cpl > 1200 ? 'text-danger' : item.cpl > 0 ? 'text-success' : 'text-text-muted'}`}>
                                                    {item.cpl > 0 ? `₹${item.cpl.toLocaleString()}` : '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-5">
                                                {item.cpl > 1200 ? (
                                                    <div className="flex items-start gap-2 max-w-[200px]">
                                                        <div className="mt-0.5 text-danger animate-pulse"><Info size={12} /></div>
                                                        <p className="text-[10px] text-danger leading-tight font-medium">High CPL — consider excluding this segment</p>
                                                    </div>
                                                ) : item.cpl > 0 && item.cpl < 800 ? (
                                                    <div className="flex items-start gap-2 max-w-[200px]">
                                                        <div className="mt-0.5 text-success"><Activity size={12} /></div>
                                                        <p className="text-[10px] text-success leading-tight font-medium">Efficient performance — scale if possible</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-[18px] opacity-10">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BreakdownsView;
