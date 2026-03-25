import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock } from 'lucide-react';

const ExecutionLog = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/logs');
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
                    <div key={log.id} className="bg-white/5 border border-white/5 p-3 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-success">
                                <CheckCircle2 size={16} />
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider">{log.action}</div>
                                <div className="text-[10px] text-text-muted">{log.entity}</div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="text-[10px] text-text-muted flex items-center gap-1">
                                <Clock size={10} /> {new Date(log.timestamp).toLocaleTimeString()}
                            </div>
                            <div className="text-[10px] font-bold text-success mt-0.5">SUCCESS</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExecutionLog;
