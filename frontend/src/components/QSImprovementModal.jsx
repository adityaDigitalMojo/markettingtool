import React from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, Zap, Lightbulb, ExternalLink } from 'lucide-react';

const QSImprovementModal = ({ isOpen, onClose, keyword, onAction }) => {
    if (!isOpen || !keyword || !keyword.recommendation) return null;

    const { recommendation } = keyword;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/2">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${recommendation.status === 'CRITICAL' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}>
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Improvement Needed</h2>
                            <div className="text-lg font-black text-white leading-tight">{keyword.text}</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X size={20} className="text-text-muted" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Metrics Summary */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Exp. CTR</div>
                            <div className={`text-xs font-black uppercase ${keyword.exp_ctr === 'ABOVE_AVERAGE' ? 'text-success' : keyword.exp_ctr === 'AVERAGE' ? 'text-warning' : 'text-danger'}`}>
                                {keyword.exp_ctr === 'ABOVE_AVERAGE' ? 'Above Avg' : keyword.exp_ctr === 'AVERAGE' ? 'Average' : 'Below Avg'}
                            </div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Ad Relevance</div>
                            <div className={`text-xs font-black uppercase ${keyword.creative_quality === 'ABOVE_AVERAGE' ? 'text-success' : keyword.creative_quality === 'AVERAGE' ? 'text-warning' : 'text-danger'}`}>
                                {keyword.creative_quality === 'ABOVE_AVERAGE' ? 'Above Avg' : keyword.creative_quality === 'AVERAGE' ? 'Average' : 'Below Avg'}
                            </div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="text-[10px] font-bold text-text-muted uppercase mb-1">LP Exp.</div>
                            <div className={`text-xs font-black uppercase ${keyword.lp_exp === 'ABOVE_AVERAGE' ? 'text-success' : keyword.lp_exp === 'AVERAGE' ? 'text-warning' : 'text-danger'}`}>
                                {keyword.lp_exp === 'ABOVE_AVERAGE' ? 'Above Avg' : keyword.lp_exp === 'AVERAGE' ? 'Average' : 'Below Avg'}
                            </div>
                        </div>
                    </div>

                    {/* Insight Box */}
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                            <Lightbulb size={40} className="text-primary" />
                        </div>
                        <h3 className="text-xs font-bold text-primary uppercase mb-2 flex items-center gap-2">
                            <Zap size={14} fill="currentColor" /> Diagnostic Insight
                        </h3>
                        <p className="text-sm text-text-muted leading-relaxed relative z-10">
                            {recommendation.reason}
                        </p>
                    </div>

                    {/* Actionable Steps */}
                    <div>
                        <h3 className="text-xs font-bold text-text-muted uppercase mb-3 px-1">Actionable Steps to Fix</h3>
                        <div className="space-y-3">
                            {recommendation.steps.map((step, idx) => (
                                <div key={idx} className="flex gap-3 bg-white/2 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                                    <div className="text-primary font-black text-sm">{idx + 1}</div>
                                    <div className="text-sm text-white/80">{step}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 pt-0 flex gap-3">
                    <button
                        onClick={() => {
                            onAction('OPTIMIZE_KEYWORD', { id: keyword.id, type: recommendation.type });
                            onClose();
                        }}
                        className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                    >
                        <Zap size={16} fill="white" /> Execute Optimization
                    </button>
                    <button className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-text-muted hover:text-white">
                        <ExternalLink size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QSImprovementModal;
