import React, { useState } from 'react';
import {
  Database,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Server,
  FileCode,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  isLiveSupabaseConnected,
  vectorDb,
} from '../../services/supabaseService';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onDataReset,
}) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [activeTab, setActiveTab] = useState<'config' | 'schema' | 'architecture'>('config');
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConnected = isLiveSupabaseConnected();

  const handleSave = () => {
    saveSupabaseConfig({ url: url.trim(), anonKey: anonKey.trim() });
    setSaveStatus('Credentials updated! Connecting to Supabase Cloud...');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const copySqlSchema = () => {
    const sqlContent = `-- VECTOR PostGIS Schema ready for Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Tables: profiles, departments, government_offices, police_stations, fire_stations, 
-- rescue_teams, routes, risk_zones, incidents, vehicles, weather_data, route_updates, alerts, audit_logs.
-- Refer to /supabase_schema.sql in repository root for complete schema and RLS policies.`;
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-xs text-slate-900">
        {/* Header */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-green-50 text-green-700 border border-green-200 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Supabase Backend Platform Configuration
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                PostgreSQL • PostGIS • Supabase Auth • Realtime • Row Level Security
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl p-1 leading-none font-bold">
            &times;
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2 px-3 font-semibold transition border-b-2 ${
              activeTab === 'config'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Connection & Credentials
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2 px-3 font-semibold transition border-b-2 ${
              activeTab === 'schema'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            PostGIS Schema & DDL
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-2 px-3 font-semibold transition border-b-2 ${
              activeTab === 'architecture'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Future Mobile App Architecture
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div
                className={`p-3 rounded border flex items-start gap-3 ${
                  isConnected
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <Server className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-slate-900 text-xs">
                    {isConnected
                      ? 'Live Supabase Cloud Project Connected'
                      : 'Active Mode: High-Fidelity Local PostGIS & Realtime Simulation'}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {isConnected
                      ? 'VECTOR is reading and persisting real-time updates directly to your remote Supabase PostgreSQL database.'
                      : 'All 20+ tables (routes, incidents, risk zones, vehicles, emergency teams, alerts) are operational with persistent local storage. To connect your live Supabase project, enter your credentials below.'}
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-3 bg-slate-50 p-4 rounded border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Supabase Project URL (VITE_SUPABASE_URL)
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-project-id.supabase.co"
                    className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Found in Supabase Project Settings → API → Project URL
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Supabase Anon Public API Key (VITE_SUPABASE_ANON_KEY)
                  </label>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Safe for client-side usage with Row Level Security (RLS) enabled.
                  </span>
                </div>

                {saveStatus && (
                  <div className="text-green-700 text-xs font-semibold">{saveStatus}</div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={handleSave}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-xs transition"
                  >
                    Save & Test Supabase Connection
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Reset all demo data back to initial state?')) {
                        vectorDb.resetToDefault();
                        onDataReset();
                      }
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 flex items-center gap-1.5 transition text-xs font-semibold shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-red-600" />
                    Reset Data to Seed
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  Supabase PostgreSQL / PostGIS DDL File (/supabase_schema.sql)
                </span>
                <button
                  onClick={copySqlSchema}
                  className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200 text-xs font-semibold shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy SQL snippet'}
                </button>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-800 font-mono text-[11px] text-slate-200 max-h-64 overflow-y-auto leading-relaxed">
                <pre>{`-- 1. Enable PostGIS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Core Tables
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id TEXT UNIQUE NOT NULL,
  route_name TEXT NOT NULL,
  status route_status DEFAULT 'open',
  risk_level risk_level DEFAULT 'low',
  coordinates JSONB NOT NULL,
  path_geometry GEOMETRY(LineString, 4326),
  length_km NUMERIC,
  maximum_load_tonnes NUMERIC
);

CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id TEXT UNIQUE NOT NULL,
  incident_type incident_type NOT NULL,
  point_geometry GEOMETRY(Point, 4326),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status incident_status DEFAULT 'reported'
);

CREATE TABLE public.risk_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  polygon_geometry GEOMETRY(Polygon, 4326),
  severity risk_level NOT NULL
);

-- 3. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE routes, incidents, risk_zones, vehicles, alerts;`}</pre>
              </div>
              <p className="text-[11px] text-slate-500">
                The full production-grade script with RLS policies, foreign keys, and indexes is saved in your repository root at <strong className="text-blue-700">supabase_schema.sql</strong>.
              </p>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">
                Unified Single-Database Architecture (Rule 1 & Rule 4)
              </h4>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono text-[11px] text-blue-900 leading-relaxed overflow-x-auto">
                {`                ┌───────────────────────────────┐
                │        SUPABASE CLOUD         │
                │                               │
                │ • PostgreSQL + PostGIS        │
                │ • Row Level Security (RLS)    │
                │ • Realtime WebSocket Pub/Sub  │
                │ • Storage (Incident Photos)   │
                └───────────────┬───────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
        [CURRENT PHASE]                 [FUTURE PHASE]
     VECTOR GOVT WEBSITE                USER MOBILE APP
   • Disaster Command Desk            • Driver Navigation
   • Route Block/Unblock              • Field Incident Report
   • Rescue Squad Dispatch            • Push Emergency Alerts
   • Live GIS Radar                   • Safe Corridor Routing`}
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                <li>When an official blocks a route on VECTOR, the change immediately notifies the future User App via Supabase Realtime.</li>
                <li>When a citizen or driver reports a road hazard on mobile, it flows into the exact same <strong className="text-slate-800">incidents</strong> table for government verification.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
