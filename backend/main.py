from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import pandas as pd
import os
import json
import sys


from engine.meta_diagnostic import MetaDiagnosticEngine, DEFAULT_BENCHMARKS

app = FastAPI(title="Mojo Performance Agent API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Campaign(BaseModel):
    id: str
    name: str
    leads: int
    cpl: float
    ctr: float
    cpc: float
    cpm: float
    freq: float
    budget: float
    utilization: float
    status: str

class Recommendation(BaseModel):
    id: str
    type: str
    title: str
    description: str
    ice_score: float
    priority: str
    status: str
    impact_adsets: int

# Configuration
CONFIG_PATH = "data/clients.json"
BASE_DATA_DIR = "../"

def load_clients():
    try:
        with open(CONFIG_PATH, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading clients: {e}")
        return {}

def get_client_or_404(clients: dict, clientId: str) -> dict:
    client_config = clients.get(clientId)
    if client_config is None:
        raise HTTPException(status_code=404, detail=f"Client '{clientId}' not found")
    return client_config

def get_data_path_or_404(client_config: dict, platform: str) -> str:
    csv_rel_path = client_config.get("dataPaths", {}).get(platform)
    if not csv_rel_path:
        raise HTTPException(status_code=404, detail=f"No data path configured for platform '{platform}'")
    data_path = os.path.join(BASE_DATA_DIR, csv_rel_path)
    if not os.path.exists(data_path):
        raise HTTPException(status_code=404, detail=f"Data file not found at {data_path}")
    return data_path

@app.get("/api/config/clients")
def get_clients():
    return load_clients()

@app.get("/api/config/clients/summary")
def get_clients_summary():
    clients = load_clients()
    return [
        {
            "clientId": k,
            "name": v.get("name"),
            "location": v.get("location"),
            "platforms": list(v.get("dataPaths", {}).keys())
        }
        for k, v in clients.items()
    ]

@app.get("/health")
def health():
    return {"status": "UP", "platform": "Python", "clients": len(load_clients())}

@app.get("/api/dashboard")
def get_dashboard(platform: str = "Meta", clientId: str = "amara"):
    clients = load_clients()
    client_config = get_client_or_404(clients, clientId)
    data_path = get_data_path_or_404(client_config, platform)

    df = pd.read_csv(data_path)
    total_leads = int(df['leads'].sum())
    avg_ctr = float(df['ctr'].mean())

    return {
        "client": client_config["name"],
        "location": client_config["location"],
        "platform": platform,
        "metrics": {
            "leads": total_leads,
            "leads_delta": -9.1 if platform == "Meta" else 5.4,
            "ctr": round(avg_ctr, 2),
            "ctr_delta": 10.7 if platform == "Meta" else -2.1,
            "active_alerts": 3 if platform == "Meta" else 2
        },
        "adsets_summary": {
            "total": len(df),
            "winners": len(df[df['cpl'] < (800 if platform == 'Meta' else 1200)]),
            "watch": len(df[df['cpl'] >= (800 if platform == 'Meta' else 1200)]),
            "underperformers": 0
        }
    }

@app.get("/api/campaigns", response_model=List[Campaign])
def get_campaigns(platform: str = "Meta", clientId: str = "amara"):
    clients = load_clients()
    client_config = get_client_or_404(clients, clientId)
    data_path = get_data_path_or_404(client_config, platform)

    df = pd.read_csv(data_path)
    campaigns = []
    for _, row in df.iterrows():
        campaigns.append(Campaign(
            id=str(row['campaign_id']),
            name=row['campaign_name'],
            leads=int(row['leads']),
            cpl=float(row['cpl']),
            ctr=float(row['ctr']),
            cpc=float(row['cpc']),
            cpm=float(row['cpm']),
            freq=float(row['freq']),
            budget=float(row['budget_per_day']),
            utilization=24.4,
            status="ACTIVE"
        ))
    return campaigns

@app.get("/api/recommendations", response_model=List[Recommendation])
def get_recommendations(platform: str = "Meta", clientId: str = "amara"):
    clients = load_clients()
    client_config = get_client_or_404(clients, clientId)
    data_path = get_data_path_or_404(client_config, platform)

    df = pd.read_csv(data_path)
    engine = MetaDiagnosticEngine(DEFAULT_BENCHMARKS)

    all_recs = []
    for _, row in df.iterrows():
        campaign_recs = engine.analyze_campaign({str(k): v for k, v in row.to_dict().items()})
        for r in campaign_recs:
            r['id'] = f"rec_{platform}_{row['campaign_id']}_{r['title'][:5]}".replace(" ", "_")
            r['impact_adsets'] = 1
            r['status'] = 'PENDING'
            all_recs.append(Recommendation(**r))

    return all_recs

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)