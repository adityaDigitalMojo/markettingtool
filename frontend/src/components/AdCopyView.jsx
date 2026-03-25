import React, { useState, useEffect } from 'react';
import {
    Plus,
    ImageIcon,
    Type,
    Sparkles,
    Eye,
    BarChart3,
    MoreVertical,
    Zap,
    Pause,
    Play,
    X,
    Copy
} from 'lucide-react';

import axios from 'axios';

// --- Sub-components moved OUTSIDE to prevent focus loss ---

const AdPreview = ({ adForm }) => (
    <div className="card border-primary/20 bg-background/50 sticky top-8">
        <div className="flex items-center gap-2 mb-4 text-text-muted text-[10px] font-bold uppercase tracking-widest">
            <Eye size={12} />
            Live Preview (Search Result)
        </div>

        <div className="bg-white rounded-xl p-4 text-slate-800 font-sans shadow-xl">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-400">S</div>
                <div className="text-[11px] text-slate-500 truncate">{adForm.finalUrl}</div>
            </div>

            <h3 className="text-blue-700 text-lg font-medium hover:underline cursor-pointer mb-1 leading-tight">
                {adForm.headlines[0] || 'Your Primary Headline Goes Here'} | {adForm.headlines[1] || 'Supporting Hook'}
            </h3>

            <div className="text-[13px] text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-700 mr-2">Ad · {adForm.businessName}</span>
                {adForm.descriptions[0] || 'Enter a compelling description to attract clicks and highlight your unique selling proposition.'}
            </div>

            <div className="mt-3 flex gap-4 text-[13px] text-blue-700">
                <span className="hover:underline cursor-pointer">Explore Now</span>
                <span className="hover:underline cursor-pointer">Contact Us</span>
            </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
            <div className="text-[10px] font-bold text-text-muted uppercase">Optimization Score</div>
            <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '65%' }}></div>
                </div>
                <span className="text-xs font-bold text-primary">65%</span>
            </div>
            <div className="text-[10px] text-text-muted italic">"Add more unique headlines to reaching 80%+"</div>
        </div>
    </div>
);

const CreateTab = ({ adForm, handleFormChange, addField }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                        <Type size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold">Headlines</h3>
                        <p className="text-xs text-text-muted">Target keywords and benefits ({adForm.headlines.length}/15)</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {adForm.headlines.map((h, i) => (
                        <div key={i} className="relative">
                            <input
                                type="text"
                                value={h}
                                onChange={(e) => handleFormChange('headline', i, e.target.value)}
                                placeholder={`Headline ${i + 1}`}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-primary/50 outline-none transition-all pr-12"
                                maxLength={30}
                            />
                            <span className={`absolute right-3 top-2.5 text-[10px] font-medium ${h.length > 25 ? 'text-warning' : 'text-text-muted'}`}>
                                {h.length}/30
                            </span>
                        </div>
                    ))}
                    <button
                        onClick={() => addField('headline')}
                        className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-all mt-1"
                    >
                        <Plus size={14} /> Add Headline
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                        <ImageIcon size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold">Descriptions</h3>
                        <p className="text-xs text-text-muted">Tell your story ({adForm.descriptions.length}/4)</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {adForm.descriptions.map((d, i) => (
                        <div key={i} className="relative">
                            <textarea
                                value={d}
                                onChange={(e) => handleFormChange('description', i, e.target.value)}
                                placeholder={`Description ${i + 1}`}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-primary/50 outline-none transition-all pr-12 min-h-[80px] resize-none"
                                maxLength={90}
                            />
                            <span className={`absolute right-3 bottom-3 text-[10px] font-medium ${d.length > 80 ? 'text-warning' : 'text-text-muted'}`}>
                                {d.length}/90
                            </span>
                        </div>
                    ))}
                    <button
                        onClick={() => addField('description')}
                        className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-all mt-1"
                    >
                        <Plus size={14} /> Add Description
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="card p-4">
                    <label className="text-[10px] font-bold text-text-muted uppercase mb-2 block">Business Name</label>
                    <input
                        type="text"
                        value={adForm.businessName}
                        onChange={(e) => handleFormChange('businessName', null, e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
                    />
                </div>
                <div className="card p-4">
                    <label className="text-[10px] font-bold text-text-muted uppercase mb-2 block">Call to Action</label>
                    <select
                        value={adForm.cta}
                        onChange={(e) => handleFormChange('cta', null, e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
                    >
                        <option>Learn More</option>
                        <option>Contact Us</option>
                        <option>Book Now</option>
                        <option>Get Quote</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-4">
                <button className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                    <Zap size={18} /> Build & Push Ad
                </button>
                <button className="px-6 py-3 border border-white/10 rounded-lg font-bold hover:bg-white/5 transition-all flex items-center gap-2">
                    <Sparkles size={18} className="text-secondary" /> AI Suggestions
                </button>
            </div>
        </div>

        <div className="relative">
            <AdPreview adForm={adForm} />
        </div>
    </div>
);

const CreativeDetailModal = ({ creative, isOpen, onClose, onAction }) => {
    if (!creative || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="bg-card border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            Creative Details
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${creative.status === 'Winning' ? 'bg-success/20 text-success' :
                                creative.status === 'Critical' ? 'bg-danger/20 text-danger' :
                                    'bg-warning/20 text-warning'
                                }`}>
                                {creative.status}
                            </span>
                        </h2>
                        <p className="text-sm text-text-muted font-mono mt-1">ID: {creative.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left: Enhanced Preview */}
                        <div>
                            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Final Ad Appearance</div>
                            <div className="bg-white rounded-xl p-6 text-slate-800 font-sans shadow-lg border border-slate-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400">S</div>
                                    <div className="text-[12px] text-slate-500 truncate">https://{creative.id}.example.com</div>
                                </div>
                                <h3 className="text-blue-700 text-xl font-medium hover:underline cursor-pointer mb-2 leading-tight">
                                    {creative.headlines[0]} | {creative.headlines[1] || creative.headlines[0]}
                                </h3>
                                <div className="text-[14px] text-slate-600 leading-relaxed">
                                    <span className="font-bold text-slate-700 mr-2">Ad · Premium Estates</span>
                                    {creative.descriptions[0]}
                                </div>
                                <div className="mt-4 flex gap-6 text-[14px] text-blue-700 font-medium">
                                    <span className="hover:underline cursor-pointer">View Properties</span>
                                    <span className="hover:underline cursor-pointer">Contact Agent</span>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="card bg-white/[0.02] border-white/5 p-4">
                                    <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Click-Through Rate</div>
                                    <div className="text-2xl font-bold text-primary">{creative.ctr}%</div>
                                    <div className="text-[10px] text-success font-bold mt-1">↑ 12% vs Average</div>
                                </div>
                                <div className="card bg-white/[0.02] border-white/5 p-4">
                                    <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Cost Per Lead</div>
                                    <div className="text-2xl font-bold">₹{creative.cpl}</div>
                                    <div className="text-[10px] text-danger font-bold mt-1">↓ ₹200 vs Campaign</div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Asset Breakdown */}
                        <div className="flex flex-col gap-6">
                            <div>
                                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 border-b border-white/5 pb-2">All Headlines</h4>
                                <div className="flex flex-col gap-2">
                                    {creative.headlines.map((h, i) => (
                                        <div key={i} className="bg-white/5 px-4 py-2.5 rounded-lg text-sm border border-white/10 flex justify-between items-center group">
                                            {h}
                                            <span className="text-[10px] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">Best Performer</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Descriptions</h4>
                                <div className="flex flex-col gap-2">
                                    {creative.descriptions.map((d, i) => (
                                        <div key={i} className="bg-white/5 px-4 py-2.5 rounded-lg text-sm border border-white/10 italic leading-relaxed">
                                            "{d}"
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {creative.recommendation && (
                                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles size={16} className="text-primary" />
                                        <span className="font-bold text-primary text-sm">Optimization Suggestion</span>
                                    </div>
                                    <p className="text-sm text-text leading-relaxed">
                                        <span className="font-bold">{creative.recommendation.action}:</span> {creative.recommendation.reason}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
                    <div className="flex gap-4">
                        <button className="px-6 py-2 border border-white/10 rounded-lg font-bold hover:bg-white/5 transition-all text-sm flex items-center gap-2">
                            <Copy size={16} /> Duplicate to Campaign
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => onAction(creative.status === 'ENABLED' ? 'PAUSE' : 'PLAY', creative)}
                            className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-bold transition-all text-sm flex items-center gap-2"
                        >
                            {creative.status === 'ENABLED' ? <Pause size={16} /> : <Play size={16} />}
                            {creative.status === 'ENABLED' ? 'Pause Ad' : 'Enable Ad'}
                        </button>
                        <button className="btn-primary px-8 py-2 flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                            <Zap size={16} /> Apply AI Optimization
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main View Component ---

const AdCopyView = ({ platform, range, onAction }) => {
    const [activeTab, setActiveTab] = useState('build');
    const [creatives, setCreatives] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCreative, setSelectedCreative] = useState(null);

    // Form state for Build Ad
    const [adForm, setAdForm] = useState({
        headlines: ['', '', ''],
        descriptions: ['', ''],
        finalUrl: 'https://example.com/property',
        businessName: 'Premium Estates',
        cta: 'Learn More'
    });

    const fetchCreatives = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:8000/api/creatives?platform=${platform}&range=${range}`);
            setCreatives(res.data);
        } catch (err) {
            console.error("Error fetching creatives:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'creatives') {
            fetchCreatives();
        }
    }, [activeTab, platform, range]);

    // Handle form changes without triggering re-render of sub-components that cause focus loss
    const handleFormChange = (type, index, value) => {
        if (type === 'headline') {
            const newHeadlines = [...adForm.headlines];
            newHeadlines[index] = value;
            setAdForm({ ...adForm, headlines: newHeadlines });
        } else if (type === 'description') {
            const newDesc = [...adForm.descriptions];
            newDesc[index] = value;
            setAdForm({ ...adForm, descriptions: newDesc });
        } else {
            setAdForm({ ...adForm, [type]: value });
        }
    };

    const addField = (type) => {
        if (type === 'headline' && adForm.headlines.length < 15) {
            setAdForm({ ...adForm, headlines: [...adForm.headlines, ''] });
        } else if (type === 'description' && adForm.descriptions.length < 4) {
            setAdForm({ ...adForm, descriptions: [...adForm.descriptions, ''] });
        }
    };

    const CreativesTab = () => (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg">Performance Analysis</h3>
                    <p className="text-xs text-text-muted">Manage and optimize your active creative assets</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 transition-all">Export Report</button>
                    <button onClick={fetchCreatives} className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs font-bold hover:bg-primary/30 transition-all">Refresh Data</button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="card h-64 animate-pulse"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {creatives.map(ad => (
                        <div
                            key={ad.id}
                            className="card p-0 flex flex-col overflow-hidden group cursor-pointer hover:border-primary/30 transition-all"
                            onClick={() => setSelectedCreative(ad)}
                        >
                            <div className="p-4 border-b border-white/5">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${ad.status === 'PAUSED' ? 'bg-text-muted' : 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
                                        <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${ad.status === 'Winning' ? 'bg-success/20 text-success' :
                                            ad.status === 'Critical' ? 'bg-danger/20 text-danger' :
                                                ad.status === 'PAUSED' ? 'bg-white/10 text-text-muted' :
                                                    'bg-warning/20 text-warning'
                                            }`}>
                                            {ad.status}
                                        </div>
                                    </div>
                                    <button className="text-text-muted hover:text-text"><MoreVertical size={14} /></button>
                                </div>
                                <h4 className="font-bold text-sm mb-1 truncate">{ad.headlines?.[0] || 'Expandable Text Ad'}</h4>
                                <p className="text-[10px] text-text-muted line-clamp-2">{ad.descriptions?.[0] || 'No description available'}</p>
                            </div>

                            <div className="p-4 grid grid-cols-3 gap-4 border-b border-white/5 bg-white/[0.02]">
                                <div>
                                    <div className="text-[8px] font-bold text-text-muted uppercase mb-1">CTR</div>
                                    <div className="text-xs font-bold">{ad.ctr}%</div>
                                </div>
                                <div>
                                    <div className="text-[8px] font-bold text-text-muted uppercase mb-1">Leads</div>
                                    <div className="text-xs font-bold">{ad.leads}</div>
                                </div>
                                <div>
                                    <div className="text-[8px] font-bold text-text-muted uppercase mb-1">Spend</div>
                                    <div className="text-xs font-bold">₹{ad.spend?.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="p-4 flex flex-col gap-3 flex-1">
                                {ad.recommendation && (
                                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-2 flex items-start gap-2">
                                        <Sparkles size={12} className="text-primary mt-0.5 shrink-0" />
                                        <div className="text-[10px] leading-tight text-left">
                                            <span className="font-bold text-primary block mb-0.5">{ad.recommendation.action}</span>
                                            <span className="text-text-muted">{ad.recommendation.reason}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto flex gap-2">
                                    <button
                                        className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-1.5 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAction(ad.status === 'PAUSED' ? 'ENABLE' : 'PAUSE', ad);
                                        }}
                                    >
                                        {ad.status === 'PAUSED' ? <Play size={12} /> : <Pause size={12} />}
                                        {ad.status === 'PAUSED' ? 'Enable' : 'Pause'}
                                    </button>
                                    <button className="flex-1 bg-primary text-background rounded-lg py-1.5 text-[10px] font-bold flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                        <Eye size={12} /> Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => setActiveTab('build')}
                        className="card border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center text-text-muted hover:border-primary/50 hover:text-primary transition-all gap-3 h-auto min-h-[250px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                            <Plus size={24} />
                        </div>
                        <span className="font-bold text-sm tracking-wide">Create New Creative</span>
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('build')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'build' ? 'bg-primary text-background shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-text-muted hover:text-text'}`}
                >
                    <Plus size={16} /> Build Ad
                </button>
                <button
                    onClick={() => setActiveTab('creatives')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'creatives' ? 'bg-primary text-background shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-text-muted hover:text-text'}`}
                >
                    <BarChart3 size={16} /> Creatives
                </button>
            </div>

            {activeTab === 'build' ? (
                <CreateTab
                    adForm={adForm}
                    handleFormChange={handleFormChange}
                    addField={addField}
                />
            ) : (
                <CreativesTab />
            )}

            <CreativeDetailModal
                creative={selectedCreative}
                isOpen={!!selectedCreative}
                onClose={() => setSelectedCreative(null)}
                onAction={onAction}
            />
        </div>
    );
};

export default AdCopyView;
