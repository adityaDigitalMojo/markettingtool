import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  History,
  ChevronDown,
  Calendar
} from 'lucide-react';
import axios from 'axios';

// Component Imports
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import CampaignsView from './components/CampaignsView';
import AdsetsView from './components/AdsetsView';
import BiddingView from './components/BiddingView';
import QualityScoreView from './components/QualityScoreView';
import SearchTermsView from './components/SearchTermsView';
import RecommendationsView from './components/RecommendationsView';
import BreakdownsView from './components/BreakdownsView';
import AuditPanelsView from './components/AuditPanelsView';
import CommandCenter from './components/CommandCenter';
import ExecutionLog from './components/ExecutionLog';
import SettingsPage from './components/Settings';
import BenchmarksView from './components/BenchmarksView';
import CampaignDetailModal from './components/CampaignDetailModal';
import ActionNoteModal from './components/ActionNoteModal';
import AdCopyView from './components/AdCopyView';

const clients = {
  amara: { name: 'Amara', location: 'Hyderabad' },
  client2: { name: 'Lotus Homes', location: 'Bangalore' }
};

function App() {
  const [view, setView] = useState('dashboard');
  const [platform, setPlatform] = useState('Google');
  const [clientId, setClientId] = useState('amara');
  const [range, setRange] = useState('LAST_30_DAYS'); // Default to 30D
  const [data, setData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [adgroups, setAdgroups] = useState([]);
  const [recs, setRecs] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([
        axios.get(`http://localhost:8000/api/dashboard?platform=${platform}&clientId=${clientId}&range=${range}`),
        axios.get(`http://localhost:8000/api/campaigns?platform=${platform}&clientId=${clientId}&range=${range}`),
        axios.get(`http://localhost:8000/api/adsets?platform=${platform}&clientId=${clientId}&range=${range}`),
        axios.get(`http://localhost:8000/api/recommendations?platform=${platform}&clientId=${clientId}&range=${range}`)
      ]);

      if (results[0].status === 'fulfilled') setData(results[0].value.data);
      else console.error("Error fetching dashboard data:", results[0].reason);

      if (results[1].status === 'fulfilled') setCampaigns(results[1].value.data);
      else console.error("Error fetching campaigns:", results[1].reason);

      if (results[2].status === 'fulfilled') setAdgroups(results[2].value.data);
      else console.error("Error fetching adsets:", results[2].reason);

      if (results[3].status === 'fulfilled') setRecs(results[3].value.data);
      else console.error("Error fetching recommendations:", results[3].reason);

      // If dashboard data failed but campaigns succeeded, we might still want to show something
      // or at least stop the loading state if we have enough data.
      if (results[0].status === 'rejected' && results[1].status === 'fulfilled') {
        // Fallback or handle appropriately
        setData({}); // Set empty data to stop loading if dashboard failed
      }

    } catch (err) {
      console.error("Critical error fetching data:", err);
      setData({}); // Prevent indefinite loading
    }
  };

  useEffect(() => {
    fetchData();
  }, [platform, clientId, range]);

  const syncData = async () => {
    setData(null);
    await fetchData();
  };

  const handleAction = async (type, campaign, note = null) => {
    if (!note) {
      setPendingAction({ type, campaign });
      setIsNoteModalOpen(true);
      return;
    }

    try {
      let endpoint;
      const payload = { id: campaign.id, note };

      if (platform === 'Meta') {
        const metaEndpointMap = {
          'PAUSE': 'http://localhost:8000/api/meta/campaign/status',
          'ADSET_PAUSE': 'http://localhost:8000/api/meta/adset/status',
          'ADSET_ENABLE': 'http://localhost:8000/api/meta/adset/status',
        };
        endpoint = metaEndpointMap[type] || 'http://localhost:8000/api/meta/campaign/status';
        payload.status = type === 'ADSET_ENABLE' ? 'ACTIVE' : (type === 'ADSET_PAUSE' ? 'PAUSED' : (campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'));
      } else {
        const googleEndpointMap = {
          'PAUSE': 'http://localhost:8000/api/google/campaign/status',
          'UPSCALE': 'http://localhost:8000/api/google/campaign/upscale',
          'DOWNSCALE': 'http://localhost:8000/api/google/campaign/downscale',
          'AD_PAUSE': 'http://localhost:8000/api/google/ad/status',
          'AD_ENABLE': 'http://localhost:8000/api/google/ad/status'
        };
        endpoint = googleEndpointMap[type];
        if (type === 'PAUSE' || type === 'AD_PAUSE' || type === 'AD_ENABLE') {
          const targetStatus = type === 'AD_ENABLE' ? 'ENABLED' : (type === 'AD_PAUSE' ? 'PAUSED' : (campaign.status === 'ENABLED' ? 'PAUSED' : 'ENABLED'));
          payload.status = targetStatus;
        } else {
          payload.currentBudget = campaign.budget;
        }
      }

      await axios.post(endpoint, payload);
      await fetchData();

      // Update selected campaign in modal if open
      if (selectedCampaign && selectedCampaign.id === campaign.id) {
        const updated = (await axios.get(`http://localhost:8000/api/campaigns?platform=${platform}&clientId=${clientId}&range=${range}`)).data.find(c => c.id === campaign.id);
        setSelectedCampaign(updated);
      }
    } catch (err) {
      console.error("Error performing action:", err);
    }
  };

  const onCampaignClick = (campaign) => {
    if (campaign && campaign.id && !campaign.spend) {
      // It's a partial object, try to find the full one
      const fullCampaign = campaigns.find(c => c.id === campaign.id);
      if (fullCampaign) {
        setSelectedCampaign(fullCampaign);
      } else {
        setSelectedCampaign(campaign);
      }
    } else {
      setSelectedCampaign(campaign);
    }
    setIsModalOpen(true);
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardView data={data} campaigns={campaigns} platform={platform} clientId={clientId} clients={clients} syncData={syncData} range={range} onCampaignClick={onCampaignClick} onAction={handleAction} setView={setView} />;
      case 'campaigns':
        return <CampaignsView campaigns={campaigns} alerts={data?.metrics?.alerts || []} platform={platform} onCampaignClick={onCampaignClick} onAction={handleAction} />;
      case 'bidding':
        return <BiddingView platform={platform} range={range} onCampaignClick={onCampaignClick} onAction={handleAction} />;
      case 'adsets':
        return <AdsetsView adgroups={adgroups} platform={platform} onCampaignClick={onCampaignClick} onAction={handleAction} />;
      case 'qs':
        return <QualityScoreView platform={platform} range={range} onAction={handleAction} />;
      case 'search':
        return <SearchTermsView platform={platform} range={range} onAction={handleAction} />;
      case 'recommendations':
        return <RecommendationsView recs={recs} handleAction={handleAction} platform={platform} campaigns={campaigns} onCampaignClick={onCampaignClick} />;
      case 'adcopy':
        return <AdCopyView platform={platform} range={range} onAction={handleAction} />;
      case 'breakdowns':
        return <BreakdownsView platform={platform} campaigns={campaigns} range={range} />;
      case 'audit':
        return <AuditPanelsView platform={platform} />;
      case 'command':
        return <CommandCenter platform={platform} />;
      case 'exec_log':
        return <ExecutionLog />;
      case 'benchmarks':
        return <BenchmarksView platform={platform} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-text-muted py-20">
            <LayoutDashboard size={48} className="mb-4 opacity-20" />
            <h2 className="text-xl font-bold">View for {view} is under construction (Real Data Coming)</h2>
          </div>
        );
    }
  };

  return (
    <div className="flex bg-background min-h-screen text-text font-inter tracking-tight">
      <Sidebar currentView={view} setView={setView} />
      <main className="flex-1 overflow-y-auto h-screen p-8">
        <header className="flex justify-between items-center mb-8 bg-white/2 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="bg-white/5 p-1 rounded-xl flex gap-1">
              <button onClick={() => setRange('LAST_7_DAYS')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${range === 'LAST_7_DAYS' ? 'bg-primary text-background' : 'text-text-muted hover:text-text'}`}>7D</button>
              <button onClick={() => setRange('LAST_30_DAYS')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${range === 'LAST_30_DAYS' ? 'bg-primary text-background' : 'text-text-muted hover:text-text'}`}>30D</button>
              <button onClick={() => setRange('ALL_TIME')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${range === 'ALL_TIME' ? 'bg-primary text-background' : 'text-text-muted hover:text-text'}`}>All</button>
            </div>
            <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
            <div className="flex items-center gap-2 text-text-muted text-[10px] font-bold uppercase">
              <Calendar size={14} />
              {range === 'LAST_7_DAYS' ? 'Last Week' : range === 'LAST_30_DAYS' ? 'Last Month' : 'Total Performance'}
            </div>
          </div>

          <div className="flex bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setPlatform('Meta')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${platform === 'Meta' ? 'bg-primary text-background shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-text-muted hover:text-text'}`}
            >Meta</button>
            <button
              onClick={() => setPlatform('Google')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${platform === 'Google' ? 'bg-[#4285F4] text-white shadow-[0_0_15px_rgba(66,133,244,0.3)]' : 'text-text-muted hover:text-text'}`}
            >Google</button>
          </div>
        </header>

        <div className="max-w-[1400px] mx-auto">
          {renderContent()}
        </div>

        <CampaignDetailModal
          campaign={selectedCampaign}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAction={handleAction}
        />

        <ActionNoteModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          onConfirm={(note) => {
            handleAction(pendingAction.type, pendingAction.campaign, note);
            setIsNoteModalOpen(false); // Close modal after confirmation
          }}
          actionType={pendingAction?.type || ''}
          campaignName={pendingAction?.campaign?.name || ''}
        />
      </main>
    </div>
  );
}

export default App;
