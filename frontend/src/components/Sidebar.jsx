import React from 'react';
import {
    LayoutDashboard,
    Megaphone,
    Layers,
    Image as ImageIcon,
    BarChart3,
    ShieldAlert,
    Lightbulb,
    Settings,
    History,
    Terminal,
    Target,
    Percent,
    TrendingDown,
    MousePointerClick,
    Activity,
    Search,
    Zap,
    Box,
    TerminalSquare,
    BrainCircuit,
    LineChart,
    Files
} from 'lucide-react';


const Sidebar = ({ currentView, setView }) => (
    <div className="w-64 border-r border-white/5 h-screen p-4 flex flex-col gap-1 shrink-0 bg-[#060608]">
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-background shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                <BrainCircuit size={18} />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight leading-none mb-1">Mojo Agent</span>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] opacity-40">Strategic v2.0</span>
            </div>
        </div>

        <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-3 mb-2 mt-2 opacity-30">Strategic Hub</div>
        <div className={currentView === 'dashboard' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('dashboard')}><LineChart size={16} /> Performance Hub</div>
        <div className={currentView === 'recommendations' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('recommendations')}><Zap size={16} fill={currentView === 'recommendations' ? "currentColor" : "none"} /> Smart Ops</div>
        <div className={currentView === 'breakdowns' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('breakdowns')}><BarChart3 size={16} /> Data Science</div>

        <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-3 mb-2 mt-6 opacity-30">Management</div>
        <div className={currentView === 'campaigns' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('campaigns')}><Megaphone size={16} /> Campaigns</div>
        <div className={currentView === 'adsets' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('adsets')}><Layers size={16} /> Ad Groups</div>
        <div className={currentView === 'adcopy' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('adcopy')}><ImageIcon size={16} /> Creative Center</div>
        <div className={currentView === 'search' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('search')}><Search size={16} /> Term Registry</div>

        <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-3 mb-2 mt-6 opacity-30">Agent Ops</div>
        <div className={currentView === 'bidding' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('bidding')}><TrendingDown size={16} /> Bid Automation</div>
        <div className={currentView === 'qs' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('qs')}><Percent size={16} /> Quality Control</div>
        <div className={currentView === 'command' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('command')}><TerminalSquare size={16} /> Neural Command</div>
        <div className={currentView === 'exec_log' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('exec_log')}><History size={16} /> Execution Log</div>

        <div className="mt-auto pt-4 border-t border-white/5 space-y-1">
            <div className={currentView === 'benchmarks' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('benchmarks')}><Target size={16} /> Benchmarks</div>
            <div className={currentView === 'settings' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('settings')}><Settings size={16} /> Client Config</div>
        </div>
    </div>
);

export default Sidebar;
