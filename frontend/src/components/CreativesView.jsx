import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Play, Eye, MousePointer2, Loader2, Info } from 'lucide-react';
import axios from 'axios';

const CreativesView = ({ platform, clientId = 'amara' }) => {
    const [creatives, setCreatives] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCreatives = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:8000/api/creatives?platform=${platform}&clientId=${clientId}`);
                setCreatives(res.data);
            } catch (err) {
                console.error("Error fetching creatives:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCreatives();
    }, [platform, clientId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-text-muted">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p>Fetching live {platform} creatives...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-2xl font-bold">Creative Analysis</h1>
                <p className="text-text-muted">Analyzing visual performance, Hook Rates, and Hold Rates for {platform}.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creatives.map(cr => (
                    <div key={cr.id} className="card group hover:border-primary/50 transition-all">
                        <div className="aspect-video bg-white/5 rounded-lg mb-4 flex flex-col items-center justify-center relative overflow-hidden p-4">
                            <div className="text-[10px] text-text-muted font-bold mb-2 uppercase opacity-50">Ad Group: {cr.adGroup}</div>
                            <div className="text-center font-serif italic text-sm text-text/80">"{cr.headlines?.[0] || 'Search Ad'}"</div>
                            <div className="absolute top-2 right-2">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${cr.status === 'Winning' ? 'bg-success/20 text-success' :
                                    cr.status === 'Healthy' ? 'bg-primary/20 text-primary' : 'bg-danger/20 text-danger'
                                    }`}>
                                    {cr.status}
                                </span>
                            </div>
                        </div>
                        <h3 className="font-bold mb-3 truncate">{cr.name}</h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-white/5 p-2 rounded-lg">
                                <div className="text-[10px] text-text-muted uppercase font-bold mb-0.5">Leads</div>
                                <div className="text-lg font-bold">{cr.leads}</div>
                            </div>
                            <div className="bg-white/5 p-2 rounded-lg">
                                <div className="text-[10px] text-text-muted uppercase font-bold mb-0.5">CTR</div>
                                <div className="text-lg font-bold">{cr.ctr}%</div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mb-4 h-24 overflow-y-auto pr-2 scrollbar-thin">
                            <div className="text-[10px] text-text-muted font-black uppercase mb-1">Headlines</div>
                            {cr.headlines?.slice(0, 3).map((h, i) => (
                                <div key={i} className="text-[10px] bg-white/5 p-1.5 rounded">{h}</div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            {cr.recommendation ? (
                                <button
                                    className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2"
                                    onClick={() => alert(`Applying: ${cr.recommendation.action}`)}
                                >
                                    <Info size={12} /> {cr.recommendation.action}
                                </button>
                            ) : (
                                <div className="flex-1 text-center py-2 text-[10px] text-success/50 font-black uppercase">Optimized</div>
                            )}
                        </div>
                    </div>
                ))}
                {creatives.length === 0 && (
                    <div className="col-span-full py-20 text-center text-text-muted border-2 border-dashed border-white/5 rounded-2xl">
                        No active creatives found for this account.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreativesView;
