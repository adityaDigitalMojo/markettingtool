import React from 'react';
import { X, AlertCircle, TrendingDown, Clock, ShieldAlert, Play } from 'lucide-react';

const AlertsModal = ({ isOpen, onClose, alerts, onAction }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-white/5 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-danger/10 rounded-xl">
                            <ShieldAlert className="text-danger" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Active Performance Alerts</h2>
                            <p className="text-xs text-text-muted mt-0.5">{alerts.length} campaigns requiring attention</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-6 flex flex-col gap-4">
                    {alerts.length === 0 ? (
                        <div className="text-center py-10 opacity-50">No active alerts found.</div>
                    ) : (
                        alerts.map(alert => (
                            <div key={alert.id} className="p-4 bg-white/2 border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-sm text-text group-hover:text-primary transition-colors">{alert.name}</h3>
                                        <div className="flex gap-2 mt-1.5">
                                            {alert.issues.map((issue, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-danger/10 text-danger text-[9px] font-black uppercase tracking-tighter rounded">
                                                    {issue.type.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 mb-4">
                                    {alert.issues.map((issue, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-[11px] text-text-muted">
                                            <AlertCircle size={12} className="mt-0.5 text-danger/50" />
                                            <span>{issue.message}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { onAction('UPSCALE', alert); onClose(); }}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-[10px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <TrendingDown size={12} className="rotate-180" /> Optimize Budget
                                    </button>
                                    <button
                                        onClick={() => { onAction('PAUSE', alert); onClose(); }}
                                        className="flex-1 bg-danger/10 hover:bg-danger/20 text-danger text-[10px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Play size={12} fill="currentColor" /> Pause & Review
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-white/2 border-t border-white/5 text-center">
                    <p className="text-[10px] text-text-muted italic">Mojo Intelligence suggests reviewing high CPL campaigns to avoid budget wastage.</p>
                </div>
            </div>
        </div>
    );
};

export default AlertsModal;
