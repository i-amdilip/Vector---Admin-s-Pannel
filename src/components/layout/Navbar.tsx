import React from 'react';
import {
  ShieldAlert,
  Database,
  Radio,
  Bell,
  PlayCircle,
  KeyRound,
  UserCheck,
  CheckCircle2,
  AlertOctagon,
  ExternalLink,
} from 'lucide-react';
import { UserProfile, SystemAlert } from '../../types/vector';
import { isLiveSupabaseConnected } from '../../services/supabaseService';

interface NavbarProps {
  user: UserProfile;
  alerts: SystemAlert[];
  onOpenDemoFlow: () => void;
  onOpenSupabaseConfig: () => void;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  alerts,
  onOpenDemoFlow,
  onOpenSupabaseConfig,
  onNavigate,
}) => {
  const isConnected = isLiveSupabaseConnected();
  const unreadAlerts = alerts.filter((a) => !a.acknowledged);
  const criticalCount = alerts.filter((a) => a.category === 'critical' && !a.acknowledged).length;

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between z-30 select-none shadow-xs text-slate-900">
      {/* Brand & Emblem */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-xs shrink-0">
          V
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-wider text-slate-900 font-mono">
              VECTOR
            </h1>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200 uppercase tracking-wider">
              NER COMMAND
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
              SYSTEMS ONLINE
            </span>
          </div>
          <span className="hidden 2xl:inline text-[11px] text-slate-500 border-l border-slate-200 pl-2">
            Vehicle & Emergency Connectivity for Transport Operations & Routing
          </span>
        </div>
      </div>

      {/* Center/Right Action Bar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Weather & Time Telemetry (High Density Theme) */}
        <div className="hidden xl:flex items-center gap-3 text-right">
          <div>
            <p className="text-xs font-semibold text-slate-700">Guwahati, AS</p>
            <p className="text-[10px] text-slate-500">22°C • High Precipitation Alert</p>
          </div>
          <div className="w-px h-6 bg-slate-200"></div>
          <div className="text-[10px] font-mono text-slate-400">
            {new Date().toLocaleTimeString('en-US', { hour12: false })} UTC
          </div>
          <div className="w-px h-6 bg-slate-200"></div>
        </div>

        {/* Hackathon Primary Demo Button */}
        <button
          id="btn-run-incident-demo"
          onClick={onOpenDemoFlow}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow-xs transition active:scale-95"
          title="Run primary demonstration: Field Report → Supabase → Govt Verify → Route Block → Safe Route Engine"
        >
          <PlayCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Emergency Response Flow</span>
          <span className="sm:hidden">Demo</span>
        </button>

        {/* Supabase Status Pill */}
        <button
          id="btn-supabase-status"
          onClick={onOpenSupabaseConfig}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-medium transition ${
            isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
          title="Inspect Supabase PostgreSQL / PostGIS schema, tables, and credentials"
        >
          <Database className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-600' : 'text-blue-600'}`} />
          <span className="hidden md:inline font-mono text-[11px] font-semibold">
            {isConnected ? 'Supabase Live' : 'PostGIS Mode'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
            }`}
          />
        </button>

        {/* Alerts Bell */}
        <button
          id="btn-nav-alerts"
          onClick={() => onNavigate('Alerts')}
          className="relative p-1.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
          title={`${unreadAlerts.length} Unacknowledged Alerts`}
        >
          <Bell className="w-4 h-4" />
          {criticalCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
              {criticalCount}
            </span>
          )}
        </button>

        {/* Officer Profile Badge */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
          <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center text-white text-xs font-bold">
            AB
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">
              {user.full_name}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Super Admin • {user.district}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
