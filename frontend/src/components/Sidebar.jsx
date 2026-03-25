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
} from 'lucide-react';

const Sidebar = ({ currentView, setView }) => (
    <div className="w-64 border-r border-white/5 h-screen p-4 flex flex-col gap-1 shrink-0 bg-[#09090b]">
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-background shadow-[0_0_15px_rgba(234,179,8,0.3)]">M</div>
            <span className="font-bold text-lg tracking-tight">Mojo <span className="text-text-muted font-normal text-sm">v1.2</span></span>
        </div>

        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-3 mb-2 opacity-50">Navigation</div>
        <div className={currentView === 'dashboard' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('dashboard')}><LayoutDashboard size={16} /> Dashboard</div>
        <div className={currentView === 'campaigns' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('campaigns')}><Megaphone size={16} /> Campaigns</div>
        <div className={currentView === 'bidding' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('bidding')}><TrendingDown size={16} /> Bidding</div>
        <div className={currentView === 'adsets' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('adsets')}><Layers size={16} /> Ad Groups</div>
        <div className={currentView === 'adcopy' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('adcopy')}><ImageIcon size={16} /> Ad Copy</div>
        <div className={currentView === 'qs' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('qs')}><Percent size={16} /> Quality Score</div>
        <div className={currentView === 'search' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('search')}><Search size={16} /> Search Terms</div>
        <div className={currentView === 'demandgen' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('demandgen')}><Zap size={16} /> Demand Gen</div>
        <div className={currentView === 'restructure' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('restructure')}><Box size={16} /> Restructuring</div>

        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-3 mb-2 mt-4 opacity-50">Advanced</div>
        <div className={currentView === 'breakdowns' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('breakdowns')}><BarChart3 size={16} /> Breakdowns</div>
        <div className={currentView === 'audit' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('audit')}><ShieldAlert size={16} /> Audit Panels</div>
        <div className={currentView === 'recommendations' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('recommendations')}><Lightbulb size={16} /> Recommendations</div>
        <div className={currentView === 'command' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('command')}><Terminal size={16} /> Command Center</div>

        <div className="mt-auto pt-4 border-t border-white/5">
            <div className={currentView === 'exec_log' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('exec_log')}><History size={16} /> Exec Log</div>
            <div className={currentView === 'settings' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('settings')}><Settings size={16} /> Settings</div>
            <div className={currentView === 'benchmarks' ? "sidebar-item-active" : "sidebar-item"} onClick={() => setView('benchmarks')}><Target size={16} /> Benchmarks</div>
        </div>
    </div>
);

export default Sidebar;
