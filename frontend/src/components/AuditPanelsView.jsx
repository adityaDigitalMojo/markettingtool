import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const AuditPanelsView = ({ platform }) => {
    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-2xl font-bold">Policy & Compliance Audit</h1>
                <p className="text-text-muted">Automated health checks for {platform} account policies and ad standards.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-success/5 border-success/20">
                    <div className="flex items-start gap-4">
                        <div className="bg-success/20 p-2 rounded-lg text-success">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-success mb-1">Landing Page Relevance</h3>
                            <p className="text-sm text-text-muted">All active destination URLs are reachable and match ad copy intent.</p>
                        </div>
                    </div>
                </div>

                <div className="card bg-warning/5 border-warning/20">
                    <div className="flex items-start gap-4">
                        <div className="bg-warning/20 p-2 rounded-lg text-warning">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-warning mb-1">Ad Strength Warning</h3>
                            <p className="text-sm text-text-muted">3 Search ads have 'Fair' strength. Adding more unique headlines could improve IS.</p>
                        </div>
                    </div>
                </div>

                <div className="card bg-danger/5 border-danger/20">
                    <div className="flex items-start gap-4">
                        <div className="bg-danger/20 p-2 rounded-lg text-danger">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-danger mb-1">Policy: Housing Category</h3>
                            <p className="text-sm text-text-muted">Ensure "Special Ad Category" is selected for real estate targeting to avoid disapproval.</p>
                        </div>
                    </div>
                </div>

                <div className="card bg-white/5">
                    <div className="flex items-start gap-4">
                        <div className="bg-white/10 p-2 rounded-lg text-text-muted">
                            <Info size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold mb-1">Pixel/Conversion Health</h3>
                            <p className="text-sm text-text-muted">Lead tracking is firing correctly. Last signal detected 4 minutes ago.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditPanelsView;
