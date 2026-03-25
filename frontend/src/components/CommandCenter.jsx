import React from 'react';
import { Send, Hash, Zap, Terminal } from 'lucide-react';

const CommandCenter = ({ platform }) => {
    return (
        <div className="card">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/20 p-2 rounded-lg text-primary">
                    <Terminal size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Command Center</h2>
                    <p className="text-text-muted text-sm">Instruction for the agent's next run</p>
                </div>
            </div>

            <div className="relative group">
                <textarea
                    placeholder="Type instruction... e.g., 'Pause all ads with CPL above ₹2000'"
                    className="w-full bg-black/40 border border-white/5 p-4 rounded-xl min-h-[120px] focus:outline-none focus:border-primary/50 transition-all text-sm group-hover:bg-black/60"
                />
                <div className="absolute right-4 bottom-4 flex gap-2">
                    <button className="bg-primary text-background p-2 rounded-lg hover:scale-105 transition-all">
                        <Send size={18} />
                    </button>
                </div>
            </div>

            <div className="flex gap-4 mt-6">
                <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                    <span>PLATFORM:</span>
                    <button className={`px-2 py-1 rounded uppercase transition-all ${platform === 'Meta' ? 'bg-primary text-background' : 'bg-white/5 hover:bg-white/10'}`}>Meta</button>
                    <button className={`px-2 py-1 rounded uppercase transition-all ${platform === 'Google' ? 'bg-google text-white' : 'bg-white/5 hover:bg-white/10'}`}>Google</button>
                </div>
            </div>

            <div className="mt-10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                    <Zap size={14} className="text-primary" /> Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { title: 'Scale Winners +20%', count: 2 },
                        { title: 'Pause Underperformers', count: 2 },
                        { title: 'Fix Learning Limited', count: 3 },
                        { title: 'Rebalance to SOP', count: '---' }
                    ].map(action => (
                        <button key={action.title} className="bg-white/5 border border-white/5 p-4 rounded-xl text-left hover:bg-white/10 transition-all">
                            <div className="text-xs font-semibold mb-1">{action.title}</div>
                            <div className="text-xs text-text-muted">{action.count} adsets affected</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CommandCenter;
