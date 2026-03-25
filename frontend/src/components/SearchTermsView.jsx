import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, ArrowUpRight, ChevronDown, CheckCircle2, PlusCircle, MinusCircle } from 'lucide-react';

const SearchTermsView = ({ platform, range, onAction }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:8000/api/search_terms?platform=${platform}&range=${range}`);
                setData(res.data);
            } catch (err) {
                console.error("Error fetching search terms:", err);
            }
            setLoading(false);
        };
        fetchData();
    }, [platform, range]);

    if (loading) return <div className="animate-pulse flex items-center justify-center h-64 text-text-muted transition-all">Analyzing Search Terms...</div>;

    const filteredData = data.map(group => ({
        ...group,
        terms: group.terms.filter(t => t.term.toLowerCase().includes(searchTerm.toLowerCase()))
    })).filter(group => group.terms.length > 0);

    return (
        <div className="flex flex-col gap-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Search className="text-primary" />
                        {platform === 'Meta' ? 'Placement & Audience Analysis' : 'Search Terms Analysis'}
                    </h1>
                    <p className="text-text-muted text-xs uppercase font-bold tracking-widest mt-1">
                        {platform === 'Meta' ? 'Performance by publisher platform and placement position' : 'Direct user queries matched to your keywords'}
                    </p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input
                        type="text"
                        placeholder="Filter search terms..."
                        className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm w-64 focus:border-primary outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="flex flex-col gap-6">
                {filteredData.map((group, idx) => (
                    <div key={idx} className="card p-0 overflow-hidden border-white/5">
                        <div className="bg-white/5 px-6 py-4 flex justify-between items-center border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-6 bg-primary/40 rounded-full"></div>
                                <div>
                                    <div className="text-sm font-bold">{group.name}</div>
                                    <div className="text-[10px] text-text-muted uppercase font-bold">{group.terms.length} terms • Campaign: {group.campaign}</div>
                                </div>
                            </div>
                            <ChevronDown size={14} className="text-text-muted" />
                        </div>

                        <table className="w-full text-left text-[10px]">
                            <thead className="bg-white/2 border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-3 font-bold uppercase text-text-muted">{platform === 'Meta' ? 'Placement' : 'Search Term'}</th>
                                    <th className="px-4 py-3 font-bold uppercase text-text-muted">{platform === 'Meta' ? 'Platform' : 'Status'}</th>
                                    <th className="px-4 py-3 font-bold uppercase text-text-muted text-right">Impr.</th>
                                    <th className="px-4 py-3 font-bold uppercase text-text-muted text-right">Clicks</th>
                                    <th className="px-4 py-3 font-bold uppercase text-text-muted text-right">Conv.</th>
                                    <th className="px-4 py-3 font-bold uppercase text-text-muted text-right">Cost</th>
                                    <th className="px-4 py-3 font-bold uppercase text-text-muted text-right">CTR</th>
                                    <th className="px-6 py-3 font-bold uppercase text-text-muted text-center text-primary italic">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.terms.map((t, tIdx) => (
                                    <tr key={tIdx} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white">{t.term}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-0.5 rounded-[3px] font-bold uppercase text-[8px] ${t.status === 'ADDED' ? 'bg-success/20 text-success' : 'bg-white/5 text-text-muted'}`}>
                                                {t.status === 'ADDED' ? 'Added' : 'None'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right text-text-muted">{t.impressions.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right text-text-muted">{t.clicks.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right font-bold text-success">{t.leads}</td>
                                        <td className="px-4 py-4 text-right font-bold">₹{t.spend.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right">{t.ctr}%</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                {t.status !== 'ADDED' && (
                                                    <button
                                                        onClick={() => onAction('ADD_KEYWORD', { term: t.term, adGroup: group.name })}
                                                        className="p-1.5 hover:bg-success/20 text-text-muted hover:text-success rounded transition-all"
                                                        title="Add as Keyword"
                                                    >
                                                        <PlusCircle size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => onAction('ADD_NEGATIVE', { term: t.term, adGroup: group.name })}
                                                    className="p-1.5 hover:bg-danger/20 text-text-muted hover:text-danger rounded transition-all"
                                                    title="Add as Negative"
                                                >
                                                    <MinusCircle size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchTermsView;
