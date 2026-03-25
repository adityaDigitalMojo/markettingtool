import React, { useState, useEffect } from 'react';
import { Save, Plus, Globe, Key, Shield, User } from 'lucide-react';
import axios from 'axios';

const Settings = () => {
    const [clients, setClients] = useState({});
    const [selectedClient, setSelectedClient] = useState(null);
    const [status, setStatus] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/config/clients');
            setClients(res.data);
            if (Object.keys(res.data).length > 0 && !selectedClient) {
                setSelectedClient(Object.keys(res.data)[0]);
            }
        } catch (err) {
            console.error("Error fetching clients:", err);
        }
    };

    const handleSave = async (id, config) => {
        try {
            setStatus('Saving...');
            await axios.post('http://localhost:8000/api/config/clients', { id, config });
            setStatus('Saved successfully!');
            setTimeout(() => setStatus(''), 3000);
            fetchClients();
        } catch (err) {
            setStatus('Error saving settings');
        }
    };

    const updateField = (clientId, platform, field, value) => {
        setClients(prev => ({
            ...prev,
            [clientId]: {
                ...prev[clientId],
                [platform]: {
                    ...prev[clientId][platform],
                    [field]: value
                }
            }
        }));
    };

    return (
        <div className="flex flex-col gap-8 max-w-4xl">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Client Settings</h1>
                    <p className="text-text-muted">Manage API credentials and platforms for your marketing accounts.</p>
                </div>
                {status && <span className="bg-primary/20 text-primary px-4 py-2 rounded-lg text-sm font-bold">{status}</span>}
            </header>

            <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
                {Object.entries(clients).map(([id, c]) => (
                    <button
                        key={id}
                        onClick={() => setSelectedClient(id)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${selectedClient === id ? 'bg-primary text-background' : 'bg-white/5 text-text-muted hover:bg-white/10'
                            }`}
                    >
                        <User size={16} /> {c.name}
                    </button>
                ))}
                <button className="bg-white/5 text-primary border border-primary/20 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                    <Plus size={16} /> Add Client
                </button>
            </div>

            {selectedClient && clients[selectedClient] && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Meta Configuration */}
                    <div className="card flex flex-col gap-6">
                        <div className="flex items-center gap-2 text-primary">
                            <Globe size={20} />
                            <h3 className="font-bold">Meta Ads API</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase">App ID</label>
                                <input
                                    type="text"
                                    value={clients[selectedClient].meta?.appId || ''}
                                    onChange={(e) => updateField(selectedClient, 'meta', 'appId', e.target.value)}
                                    placeholder="Enter Meta App ID"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase">Access Token</label>
                                <input
                                    type="password"
                                    value={clients[selectedClient].meta?.accessToken || ''}
                                    onChange={(e) => updateField(selectedClient, 'meta', 'accessToken', e.target.value)}
                                    placeholder="EAA..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase">Ad Account ID</label>
                                <input
                                    type="text"
                                    value={clients[selectedClient].meta?.adAccountId || ''}
                                    onChange={(e) => updateField(selectedClient, 'meta', 'adAccountId', e.target.value)}
                                    placeholder="act_..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Google Configuration */}
                    <div className="card flex flex-col gap-6">
                        <div className="flex items-center gap-2 text-google">
                            <Globe size={20} />
                            <h3 className="font-bold">Google Ads API</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase">Developer Token</label>
                                <input
                                    type="text"
                                    value={clients[selectedClient].google?.developerToken || ''}
                                    onChange={(e) => updateField(selectedClient, 'google', 'developerToken', e.target.value)}
                                    placeholder="Enter Dev Token"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-google transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase">Customer ID</label>
                                <input
                                    type="text"
                                    value={clients[selectedClient].google?.customerId || ''}
                                    onChange={(e) => updateField(selectedClient, 'google', 'customerId', e.target.value)}
                                    placeholder="123-456-7890"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-google transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase">Client ID</label>
                                <input
                                    type="text"
                                    value={clients[selectedClient].google?.clientId || ''}
                                    onChange={(e) => updateField(selectedClient, 'google', 'clientId', e.target.value)}
                                    placeholder="...apps.googleusercontent.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-google transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase">Client Secret</label>
                                <input
                                    type="password"
                                    value={clients[selectedClient].google?.clientSecret || ''}
                                    onChange={(e) => updateField(selectedClient, 'google', 'clientSecret', e.target.value)}
                                    placeholder="GOCSPX-..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-google transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase">Refresh Token</label>
                                <input
                                    type="password"
                                    value={clients[selectedClient].google?.refreshToken || ''}
                                    onChange={(e) => updateField(selectedClient, 'google', 'refreshToken', e.target.value)}
                                    placeholder="1//..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-google transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => handleSave(selectedClient, clients[selectedClient])}
                        className="md:col-span-2 btn-primary flex items-center justify-center gap-2 py-3"
                    >
                        <Save size={20} /> Save Configuration for {clients[selectedClient].name}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Settings;
