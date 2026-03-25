import React from 'react';
import { Target, BarChart, TrendingUp, Zap } from 'lucide-react';

const BenchmarksView = ({ platform }) => {
    const benchmarks = platform === 'Meta' ? {
        cpl: 720,
        ctr: 0.7,
        cpm: 600,
        freq: 2.5
    } : {
        cpl: 1200,
        ctr: 5.0,
        lost_rank: 20,
        abs_top: 70
    };

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-2xl font-bold">Performance Benchmarks</h1>
                <p className="text-text-muted">Target KPIs and thresholds used by Mojo AI for {platform} Ads.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(benchmarks).map(([key, val]) => (
                    <div key={key} className="card border-t-2 border-t-primary/30">
                        <div className="text-[10px] text-text-muted uppercase font-bold mb-2">{key.replace('_', ' ')} Target</div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            {val}{typeof val === 'number' && key !== 'cpl' ? '%' : (key === 'cpl' ? '₹' : '')}
                            <Target size={16} className="text-primary opacity-50" />
                        </div>
                        <p className="text-[10px] text-text-muted mt-2 italic">Based on real estate vertical average</p>
                    </div>
                ))}
            </div>

            <div className="card">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                    <TrendingUp size={18} className="text-success" />
                    Historical Benchmark Trend
                </h3>
                <div className="h-48 flex items-end gap-2 px-4">
                    {[45, 52, 48, 60, 55, 65, 58, 72, 68, 75, 80, 85].map((h, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-primary/20 rounded-t hover:bg-primary/40 transition-all cursor-help relative group"
                            style={{ height: `${h}%` }}
                        >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border border-white/10 px-2 py-1 rounded text-[10px] invisible group-hover:visible whitespace-nowrap z-10">
                                M{i + 1}: {h}%
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 px-4 text-[10px] text-text-muted uppercase font-bold tracking-widest">
                    <span>Jan 2025</span>
                    <span>Dec 2025</span>
                </div>
            </div>
        </div>
    );
};

export default BenchmarksView;
