import React, { useState } from 'react';
import { Target, AlertCircle, X, ChevronRight, Zap } from 'lucide-react';

const StrategicCallDialog = ({ isOpen, onClose, onConfirm, actionData }) => {
    const [rationale, setRationale] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (!rationale.trim()) return;
        setIsSubmitting(true);
        await onConfirm(rationale);
        setIsSubmitting(false);
        setRationale('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-card border border-white/5 shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-xl text-primary">
                            <Target size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Strategic Call</h2>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black opacity-50">Scientific Marketing Protocol</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-text-muted transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-primary font-bold text-xs uppercase tracking-wider">
                            <Zap size={14} fill="currentColor" /> Action Execution
                        </div>
                        <h3 className="text-xl font-bold mb-2">{actionData?.title || 'Optimize Campaign'}</h3>
                        <p className="text-sm text-text-muted leading-relaxed">
                            {actionData?.desc || 'Adjusting parameters to improve performance based on AI recommendations.'}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-xs font-black uppercase tracking-widest text-text-muted opacity-50 ml-1">
                            Strategic Rationale <span className="text-danger">*</span>
                        </label>
                        <textarea
                            autoFocus
                            value={rationale}
                            onChange={(e) => setRationale(e.target.value)}
                            placeholder="Why are you making this change? (e.g. CPL is 2x target, scaling winning creative...)"
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none placeholder:text-white/10"
                        />
                        <div className="flex items-start gap-2 p-3 bg-danger/5 border border-danger/10 rounded-xl">
                            <AlertCircle size={14} className="text-danger mt-0.5 shrink-0" />
                            <p className="text-[10px] text-danger/80 leading-normal">
                                <strong>Important:</strong> This rationale will be tracked by the Learning Engine to evaluate decision quality over the next 14 days.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white/5 border-t border-white/5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-text-muted"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!rationale.trim() || isSubmitting}
                        onClick={handleConfirm}
                        className="flex-[2] bg-primary text-background py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                    >
                        {isSubmitting ? 'Recording...' : (
                            <>Confirm Execution <ChevronRight size={16} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StrategicCallDialog;
