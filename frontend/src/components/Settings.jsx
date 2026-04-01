import React, { useState, useEffect } from 'react';
import { Save, Plus, Globe, Key, Shield, User, Trash2, MapPin } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Settings = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [status, setStatus] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newClient, setNewClient] = useState({ clientId: '', name: '', location: '' });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/clients`);
            setClients(res.data);
            if (res.data.length > 0 && !selectedClient) {
                // Fetch full details for the first client
                fetchClientDetails(res.data[0].id);
            }
        } catch (err) {
            console.error("Error fetching clients:", err);
        }
    };

    const fetchClientDetails = async (id) => {
        try {
            const res = await axios.get(`${API_BASE}/api/clients/${id}?clientId=${id}`);
            setSelectedClient(res.data);
        } catch (err) {
            console.error("Error fetching client details:", err);
        }
    };

    const handleSave = async () => {
        if (!selectedClient) return;
        try {
            setStatus('Saving...');
            await axios.put(`${API_BASE}/api/clients/${selectedClient.id}?clientId=${selectedClient.id}`, selectedClient);
            setStatus('Saved successfully!');
            setTimeout(() => setStatus(''), 3000);
            fetchClients();
        } catch (err) {
            setStatus('Error saving settings');
        }
    };

    const handleAddClient = async () => {
        if (!newClient.clientId || !newClient.name) {
            setStatus('ID and Name are required');
            return;
        }
        try {
            setStatus('Adding...');
            await axios.post(`${API_BASE}/api/clients`, newClient);
            setStatus('Client added!');
            setIsAdding(false);
            setNewClient({ clientId: '', name: '', location: '' });
            fetchClients();
        } catch (err) {
            setStatus('Error adding client: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteClient = async (id) => {
        if (!window.confirm('Are you sure you want to delete this client?')) return;
        try {
            setStatus('Deleting...');
            await axios.delete(`${API_BASE}/api/clients/${id}?clientId=${id}`);
            setStatus('Client deleted');
            setSelectedClient(null);
            fetchClients();
        } catch (err) {
            setStatus('Error deleting client');
        }
    };

    const updateField = (platform, field, value) => {
        setSelectedClient(prev => ({
            ...prev,
            [platform]: {
                ...prev[platform],
                [field]: value
            }
        }));
    };

    const updateClientInfo = (field, value) => {
        setSelectedClient(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="flex flex-col gap-8 max-w-4xl pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Client Settings</h1>
                    <p className="text-text-muted text-sm">Manage API credentials and platforms for your marketing accounts.</p>
                </div>
                {status && <span className="bg-primary/20 text-primary px-4 py-2 rounded-lg text-sm font-bold animate-pulse">{status}</span>}
            </header>

            <div className="flex gap-4 mb-4 overflow-x-auto pb-2 scrollbar-none font-inter">
                {clients.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => fetchClientDetails(c.id)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${selectedClient?.id === c.id
                            ? 'bg-primary text-background border-primary shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                            : 'bg-white/5 text-text-muted border-white/5 hover:bg-white/10 hover:border-white/10'
                            }`}
                    >
                        <User size={16} /> {c.name}
                    </button>
                ))}
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-white/5 text-primary border border-primary/20 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/10 transition-all font-inter"
                >
                    <Plus size={16} /> Add Client
                </button>
            </div>

            {isAdding && (
                <div className="card bg-primary/5 border-primary/20 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2 text-primary">
                            <Plus size={20} /> Create New Client
                        </h3>
                        <button onClick={() => setIsAdding(false)} className="text-text-muted hover:text-text text-sm uppercase font-bold">Cancel</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase">Client ID (Unique)</label>
                            <input
                                type="text"
                                value={newClient.clientId}
                                onChange={(e) => setNewClient({ ...newClient, clientId: e.target.value })}
                                placeholder="e.g. lotus_homes"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none text-white"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase">Display Name</label>
                            <input
                                type="text"
                                value={newClient.name}
                                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                placeholder="e.g. Lotus Homes"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none text-white"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase">Location</label>
                            <input
                                type="text"
                                value={newClient.location}
                                onChange={(e) => setNewClient({ ...newClient, location: e.target.value })}
                                placeholder="e.g. Bangalore"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none text-white"
                            />
                        </div>
                    </div>
                    <button onClick={handleAddClient} className="btn-primary py-3 font-bold">Initialize Client</button>
                </div>
            )}

            {selectedClient && (
                <div className="flex flex-col gap-8 animate-in fade-in duration-500">
                    {/* Basic Info */}
                    <div className="card flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2 text-text-muted uppercase text-xs">
                                <Shield size={16} /> Basic Information
                            </h3>
                            <button
                                onClick={() => handleDeleteClient(selectedClient.id)}
                                className="text-red-400 hover:text-red-300 flex items-center gap-2 text-xs font-bold uppercase"
                            >
                                <Trash2 size={14} /> Delete Client
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase">Name</label>
                                <input
                                    type="text"
                                    value={selectedClient.name || ''}
                                    onChange={(e) => updateClientInfo('name', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none text-white"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase">Location</label>
                                <input
                                    type="text"
                                    value={selectedClient.location || ''}
                                    onChange={(e) => updateClientInfo('location', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Meta Configuration */}
                        <div className="card flex flex-col gap-6">
                            <div className="flex items-center gap-2 text-[#0668E1]">
                                <Globe size={20} />
                                <h3 className="font-bold">Meta Ads API</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted uppercase">App ID</label>
                                    <input
                                        type="text"
                                        value={selectedClient.meta?.appId || ''}
                                        onChange={(e) => updateField('meta', 'appId', e.target.value)}
                                        placeholder="Enter Meta App ID"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted uppercase">Access Token</label>
                                    <input
                                        type="password"
                                        value={selectedClient.meta?.accessToken || ''}
                                        onChange={(e) => updateField('meta', 'accessToken', e.target.value)}
                                        placeholder="EAA..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted uppercase">Ad Account ID</label>
                                    <input
                                        type="text"
                                        value={selectedClient.meta?.adAccountId || ''}
                                        onChange={(e) => updateField('meta', 'adAccountId', e.target.value)}
                                        placeholder="act_..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none text-white"
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
                                        value={selectedClient.google?.developerToken || ''}
                                        onChange={(e) => updateField('google', 'developerToken', e.target.value)}
                                        placeholder="Enter Dev Token"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-google outline-none text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted uppercase">Customer ID (Client)</label>
                                    <input
                                        type="text"
                                        value={selectedClient.google?.customerId || ''}
                                        onChange={(e) => updateField('google', 'customerId', e.target.value)}
                                        placeholder="123-456-7890"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-google outline-none text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted uppercase">Login Customer ID (Manager)</label>
                                    <input
                                        type="text"
                                        value={selectedClient.google?.loginCustomerId || ''}
                                        onChange={(e) => updateField('google', 'loginCustomerId', e.target.value)}
                                        placeholder="766-897-0885"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-google outline-none text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted uppercase">Client ID</label>
                                    <input
                                        type="text"
                                        value={selectedClient.google?.clientId || ''}
                                        onChange={(e) => updateField('google', 'clientId', e.target.value)}
                                        placeholder="...apps.googleusercontent.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-google outline-none text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted uppercase">Client Secret</label>
                                    <input
                                        type="password"
                                        value={selectedClient.google?.clientSecret || ''}
                                        onChange={(e) => updateField('google', 'clientSecret', e.target.value)}
                                        placeholder="GOCSPX-..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-google outline-none text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted uppercase">Refresh Token</label>
                                    <input
                                        type="password"
                                        value={selectedClient.google?.refreshToken || ''}
                                        onChange={(e) => updateField('google', 'refreshToken', e.target.value)}
                                        placeholder="1//..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-google outline-none text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            className="md:col-span-2 btn-primary flex items-center justify-center gap-2 py-4 text-lg font-bold"
                        >
                            <Save size={20} /> Save Configuration for {selectedClient.name}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
