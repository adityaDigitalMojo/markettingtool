import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock, Target, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';


const ExecutionLog = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/execution-log?clientId=${localStorage.getItem('clientId') || ''}`);
                setLogs(res.data);

            } catch (err) {
                console.error("Error fetching logs:", err);
            }
        };
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="card max-h-[400px] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Execution Log</h2>
                <button className="text-xs text-text-muted hover:text-primary transition-all">Refresh</button>
            </div>

            <div className="flex flex-col gap-3">
                {logs.length === 0 && (
                    <div className="text-center py-10 text-text-muted text-sm italic">
                        No actions recorded yet.
                    </div>
                )}
                {logs.map(log => (
                    <div key={log.id} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={log.finalOutcome === 'POSITIVE' ? 'text-success' : log.finalOutcome === 'NEGATIVE' ? 'text-danger' : 'text-primary'}>
                                    {log.finalOutcome === 'POSITIVE' ? <TrendingUp size={20} /> : log.finalOutcome === 'NEGATIVE' ? <TrendingDown size={20} /> : <Target size={20} />}
                                </div>
                                <div className="flex flex-col">
                                    <div className="text-xs font-black uppercase tracking-[0.1em]">{log.action}</div>
                                    <div className="text-[10px] text-text-muted font-bold opacity-50 uppercase">{log.platform} · {log.entityType} · {log.entityId}</div>
                                </div>
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                log.finalOutcome === 'POSITIVE' ? 'bg-success/20 text-success border border-success/30' :
                                log.finalOutcome === 'NEGATIVE' ? 'bg-danger/20 text-danger border border-danger/30' :
                                'bg-primary/20 text-primary border border-primary/30'
                            }`}>
                                {log.status === 'PENDING_OUTCOME' ? 'Tracking' : log.finalOutcome || 'Neutral'}
                            </div>
                        </div>

                        <div className="p-3 bg-white/2 rounded-xl border border-white/5">
                            <p className="text-xs text-text-muted leading-relaxed italic">
                                "{log.rationale}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Before</span>
                                <div className="text-sm font-bold">₹{log.beforeMetrics?.cpl?.toFixed(0) || 0} <span className="text-[10px] text-text-muted font-normal">CPL</span></div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-30 uppercase tracking-widest opacity-30">Snapshot</span>
                                <div className="text-[10px] text-text-muted flex items-center gap-1">
                                    <Clock size={10} /> {new Date(log.timestamp?.toDate ? log.timestamp.toDate() : log.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
};

export default ExecutionLog;
