import React, { useState } from 'react';
import { Lightbulb, ChevronDown, CheckCircle2, AlertCircle, Play, Zap, ShieldCheck, User } from 'lucide-react';
import StrategicCallDialog from './StrategicCallDialog';


const RecommendationsView = ({ recs, handleAction, platform, onCampaignClick, campaigns }) => {
    const [selectedRec, setSelectedRec] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const onApproveClick = (rec) => {
        setSelectedRec(rec);
        setIsDialogOpen(true);
    };

    const onConfirmAction = (rationale) => {
        handleAction(selectedRec.id, 'EXECUTE', { note: rationale });
    };

    return (
        <div className="flex flex-col gap-8">
            <StrategicCallDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={onConfirmAction}
                actionData={selectedRec}
            />

            <header>
                <h1 className="text-2xl font-bold">Smart Recommendations</h1>
                <p className="text-text-muted">AI-driven optimizations for your {platform} Ads performance.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(recs) && recs.map(r => (
                    <div key={r.id} className={`card flex flex-col h-full ${r.priority === 'IMMEDIATE' ? 'border-l-4 border-l-danger bg-danger/5 shadow-[0_0_20px_rgba(239,68,68,0.05)]' : 'border-l-4 border-l-primary'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                ICE Score: {r.ice || '8.0'}
                            </span>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${r.tier === 'AUTO' ? 'bg-success/20 text-success' : r.tier === 'MANUAL' ? 'bg-danger/20 text-danger' : 'bg-primary/20 text-primary'
                                }`}>
                                {r.tier === 'AUTO' ? <Zap size={10} fill="currentColor" /> : r.tier === 'MANUAL' ? <User size={10} /> : <ShieldCheck size={10} />}
                                {r.tier || 'CONSENT'}
                            </div>
                        </div>

                        <h3 className="font-bold text-lg mb-2">{r.title}</h3>
                        <p className="text-sm text-text-muted mb-6 flex-1">{r.desc || r.description}</p>

                        <div className="flex gap-2 mt-auto">
                            {r.status === 'APPROVED' ? (
                                <div className="flex-1 bg-success/20 text-success flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest border border-success/30">
                                    <CheckCircle2 size={16} /> Executed
                                </div>
                            ) : (
                                <>
                                    {r.isActionable !== false && (
                                        <button
                                            onClick={() => onApproveClick(r)}
                                            className="flex-[2] bg-primary text-background text-[10px] font-black py-4 rounded-2xl hover:opacity-90 transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                                        >
                                            <Play size={14} fill="currentColor" /> Strategic Execution
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            const targetId = r.targetId || r.campaignId;
                                            const targetName = r.targetName || r.campaignName;
                                            const campaign = campaigns.find(c => c.id === targetId || c.name === targetName);
                                            if (campaign) onCampaignClick(campaign);
                                        }}
                                        className={`flex-1 border border-white/10 text-[10px] font-bold py-3 rounded-xl hover:bg-white/5 transition-all text-text-muted uppercase tracking-widest ${r.isActionable === false ? 'w-full flex-none' : ''}`}
                                    >
                                        Inspect
                                    </button>
                                </>

                            )}
                        </div>
                    </div>
                ))}
                {recs.length === 0 && (
                    <div className="col-span-full py-20 text-center text-text-muted border-2 border-dashed border-white/5 rounded-2xl">
                        <Lightbulb className="mx-auto mb-4 opacity-20" size={48} />
                        <p>No new recommendations at this time. Your campaigns are looking healthy!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecommendationsView;
