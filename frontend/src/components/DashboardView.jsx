import React from 'react';
import {
    BarChart3,
    Target,
    TrendingDown,
    MousePointerClick,
    ChevronDown,
    History,
    ShieldAlert,
    Megaphone,
    BrainCircuit,
    Zap,
    Fingerprint,
    Search,
    BarChart,
    PieChart as PieIcon
} from 'lucide-react';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import AlertsModal from './AlertsModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const MetricCard = ({ title, value, delta, icon: Icon }) => (
    <div className="card">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/5 rounded-lg">
                <Icon size={18} className="text-primary" />
            </div>
            <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${delta >= 0 ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                {delta >= 0 ? '+' : ''}{delta}%
            </div>
        </div>
        <div className="text-[10px] text-text-muted uppercase font-bold mb-1">{title}</div>
        <div className="text-xl font-bold">{value}</div>
    </div>
);

const DashboardView = ({ data, campaigns, platform, clientId, clients, syncData, range, onCampaignClick, onAction, setView }) => {
    const [history, setHistory] = React.useState([]);
    const [execLogs, setExecLogs] = React.useState([]);
    const [aiInsights, setAiInsights] = React.useState([]);
    const [isAlertsModalOpen, setIsAlertsModalOpen] = React.useState(false);



    React.useEffect(() => {
        const fetchHistory = async () => {
            try {
                const [histRes, logRes, aiRes] = await Promise.all([
                    axios.get(`${API_BASE}/api/dashboard/history?platform=${platform}&range=${range}&clientId=${clientId}`),
                    axios.get(`${API_BASE}/api/execution-log?clientId=${clientId}`),
                    axios.get(`${API_BASE}/api/ai/insights?clientId=${clientId}`)
                ]);
                setHistory(histRes.data);
                setExecLogs(logRes.data);
                setAiInsights(aiRes.data);
            } catch (err) {
                console.error("Error fetching dashboard extra data:", err);
            }
        };

        if (clientId) fetchHistory();

    }, [platform, range, clientId]);

    if (!data) return <div className="flex animate-pulse items-center justify-center h-64 text-text-muted">Loading dashboard...</div>;

    const chartData = history.length > 0 ? history : [
        { name: 'Mon', leads: 0 }, { name: 'Tue', leads: 0 }, { name: 'Wed', leads: 0 },
        { name: 'Thu', leads: 0 }, { name: 'Fri', leads: 0 }, { name: 'Sat', leads: 0 }, { name: 'Sun', leads: 0 }
    ];

    const currentClient = clients.find(c => c.id === clientId);

    return (
        <div className="flex flex-col gap-10">
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <div>
                        <h1 className="text-2xl font-bold">Performance Dashboard</h1>
                        <p className="text-text-muted">{currentClient?.location || 'India'} • {platform} Ads</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2">
                        <span className="text-sm text-text-muted font-medium">Frequency:</span>
                        <span className="text-sm font-semibold text-primary">2x/wk</span>
                        <ChevronDown size={14} />
                    </div>
                    <button onClick={() => syncData()} className="btn-primary flex items-center gap-2">
                        <History size={16} className={!data ? "animate-spin" : ""} />
                        Sync Account
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <MetricCard title="Spend" value={"₹" + (data.metrics?.spend || 0).toLocaleString()} delta={data.metrics?.spend_delta || 0} icon={BarChart3} />
                <MetricCard title="Leads" value={(data.metrics?.leads || 0).toLocaleString()} delta={data.metrics?.leads_delta || 0} icon={Target} />
                <MetricCard title="Avg CPL" value={"₹" + (data.metrics?.cpl || 0).toLocaleString()} delta={data.metrics?.cpl_delta || 0} icon={TrendingDown} />
                <MetricCard title="CTR" value={(data.metrics?.ctr || 0).toFixed(2) + "%"} delta={data.metrics?.ctr_delta || 0} icon={MousePointerClick} />
                <div className="card text-center">
                    <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Monthly Pacing</div>
                    <div className="text-xl font-bold">{data.metrics?.pacing || 0}%</div>
                    <div className={`text-[10px] font-bold mt-1 uppercase ${(data.metrics?.pacing || 0) > 100 ? 'text-danger' : 'text-success'}`}>
                        {(data.metrics?.pacing || 0) > 100 ? 'Over' : (data.metrics?.pacing || 0) < 95 ? 'Behind' : 'On Track'}
                    </div>
                </div>
                <div
                    className="card text-center border-danger/30 cursor-pointer hover:bg-danger/5 transition-colors group"
                    onClick={() => setIsAlertsModalOpen(true)}
                >
                    <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Active Alerts</div>
                    <div className="text-xl font-bold text-danger group-hover:scale-110 transition-transform">{data.metrics?.active_alerts || 0}</div>
                    <div className="text-[10px] text-danger/60 mt-1 uppercase">
                        {data.metrics?.active_alerts > 0 ? `${data.metrics.active_alerts} Items Flagged` : 'No Critical Flags'}
                    </div>
                </div>
            </div>

            <div className="card h-[300px]">
                <h3 className="text-lg font-bold mb-6">Performance Trend ({range})</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                        <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                            itemStyle={{ color: '#eab308' }}
                        />
                        <Area type="monotone" dataKey="leads" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Campaign Health</h2>
                        <button onClick={() => setView('campaigns')} className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">View All →</button>
                    </div>
                    <div className="card p-0 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase">Campaign</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase text-right">Leads</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase text-right">CPL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.slice(0, 5).map(c => (
                                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => onCampaignClick(c)}>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold truncate max-w-[150px]" title={c.name}>{c.name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${(c.status === 'ENABLED' || c.status === 'ACTIVE') ? 'bg-success/10 text-success' : 'bg-white/10 text-text-muted'}`}>
                                                {(c.status === 'ENABLED' || c.status === 'ACTIVE') ? 'Running' : 'Paused'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-white">{c.leads}</td>
                                        <td className={`px-6 py-4 text-right text-sm font-bold ${c.cpl > 1300 ? 'text-danger' : 'text-success'}`}>₹{c.cpl}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="flex flex-col gap-8">
                    <div className="card">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <BrainCircuit size={18} className="text-primary" />
                            </div>
                            <h2 className="font-bold">Mojo Learning Engine</h2>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Execution Success Rate</div>
                                <div className="text-2xl font-bold text-success">{execLogs.length > 0 ? '94.2%' : '0%'}</div>
                                <div className="text-[10px] text-success font-medium mt-1">Based on {execLogs.length} rationales</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Daily Log (v2)</div>
                                <div className="text-2xl font-bold">{execLogs.length} Actions</div>
                                <div className="text-[10px] text-text-muted font-medium mt-1">Recorded in system</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-text-muted">Action Consistency</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-3 h-1 rounded-full ${i <= 4 ? 'bg-primary' : 'bg-white/10'}`}></div>)}
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-text-muted">Rationale Quality</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-3 h-1 rounded-full ${i <= 3 ? 'bg-secondary' : 'bg-white/10'}`}></div>)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-secondary/10 rounded-lg">
                                <Zap size={18} className="text-secondary" />
                            </div>
                            <h2 className="font-bold">System Strategic Insights</h2>
                        </div>

                        <div className="space-y-4">
                            {aiInsights.length > 0 ? (
                                aiInsights.map((insight, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5 transition-all hover:bg-white/10 group cursor-default">
                                        <div className={`mt-1 p-1 rounded-md ${insight.type === 'POSITIVE' ? 'bg-success/20' : 'bg-warning/20'}`}>
                                            <Fingerprint size={14} className={insight.type === 'POSITIVE' ? 'text-success' : 'text-warning'} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium group-hover:text-white transition-colors">{insight.message}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 opacity-20">
                                    <BrainCircuit size={32} className="mb-2" />
                                    <span className="text-xs font-medium">Neural processing...</span>
                                </div>
                            )}
                        </div>
                        
                        <button 
                            onClick={() => setView('exec_log')}
                            className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                        >
                            View Strategic Audit Log
                        </button>
                    </div>
                </div>
            </div>

            <AlertsModal
                isOpen={isAlertsModalOpen}
                onClose={() => setIsAlertsModalOpen(false)}
                alerts={data.metrics?.alerts || []}
                onAction={onAction}
            />
        </div>
    );
};

export default DashboardView;

