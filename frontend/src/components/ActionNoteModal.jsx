import React, { useState } from 'react';
import { StickyNote, X, Send } from 'lucide-react';

const ActionNoteModal = ({ isOpen, onClose, onConfirm, actionType, campaignName }) => {
    const [note, setNote] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!note.trim()) return;
        onConfirm(note);
        setNote('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
            <div className="bg-background border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <header className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg text-primary">
                            <StickyNote size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Action Note</h2>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest">{actionType} • {campaignName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-text-muted">
                        <X size={18} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="p-6">
                    <p className="text-sm text-text-muted mb-4 leading-relaxed">
                        Please provide a reason for this {actionType.toLowerCase()} action. This helps improve the AI's future recommendations.
                    </p>
                    <textarea
                        autoFocus
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g., Performance was below target CPL for 3 days..."
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-primary transition-all resize-none mb-6"
                        required
                    />
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-text-muted"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!note.trim()}
                            className="flex-1 px-4 py-3 bg-primary text-background rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(234,179,8,0.3)] disabled:opacity-50 disabled:scale-100"
                        >
                            Confirm Action <Send size={14} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActionNoteModal;
