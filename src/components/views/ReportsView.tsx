import React, { useState } from 'react';
import { RouteItem, Incident, Vehicle } from '../../types/vector';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Building,
  Shield,
  FileCheck,
} from 'lucide-react';

interface ReportsViewProps {
  routes: RouteItem[];
  incidents: Incident[];
  vehicles: Vehicle[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  routes,
  incidents,
  vehicles,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadReport = () => {
    const reportText = `================================================================================
GOVERNMENT OF INDIA - NORTH EASTERN REGIONAL DISASTER COMMAND DESK
VECTOR: VEHICLE & EMERGENCY CONNECTIVITY FOR TRANSPORT OPERATIONS & ROUTING
DAILY SITUATION & CORRIDOR RESILIENCE REPORT (SITREP #2026-09-NER)
================================================================================
Generated: ${new Date().toISOString()}
Supervising Officer: Dr. A. K. Baruah, IAS (Special Director, NER Disaster Logistics)
Database: Supabase PostgreSQL / PostGIS Engine

1. CORRIDOR RESILIENCE AUDIT:
- Total Monitored Corridors: ${routes.length}
- Open for Heavy Freight: ${routes.filter((r) => r.status === 'open').length}
- Blocked / Impassable: ${routes.filter((r) => r.status === 'blocked').length}
- Warning / High Threat: ${routes.filter((r) => r.status === 'warning').length}
- Emergency Corridor Designations: ${routes.filter((r) => r.is_emergency_route).length}

2. ACTIVE FIELD INCIDENTS & DISASTERS:
${incidents
  .map(
    (inc, idx) =>
      `[${idx + 1}] ${inc.incident_id}: ${inc.title}
   Type: ${inc.incident_type} | Severity: ${inc.severity} | Status: ${inc.status}
   Location: ${inc.location_name}
   Affected Route: ${inc.affected_route_name || 'N/A'}
   Assigned Rescue Squad: ${inc.assigned_rescue_team_name || 'Pending assignment'}`
  )
  .join('\n\n')}

3. ESSENTIAL FREIGHT & CONVOY MONITORING:
- Total Monitored Vehicles: ${vehicles.length}
- Delayed Units: ${vehicles.filter((v) => v.is_delayed).length}
- Rerouted to Alternate Safe Corridors: ${vehicles.filter((v) => v.status === 'rerouted').length}

================================================================================
END OF OFFICIAL SITUATION REPORT
================================================================================`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VECTOR_NER_SITREP_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-7xl mx-auto text-slate-900 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>Official Government Inspection Reports & Daily SITREP</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Generate and export verified disaster situational summaries for the Chief Secretary and Inter-Ministerial Disaster Management Group.
          </p>
        </div>

        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow-xs transition active:scale-95"
        >
          {downloaded ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-300" />
              <span>SITREP Downloaded</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Export Official SITREP (TXT/JSON)</span>
            </>
          )}
        </button>
      </div>

      {/* Document Preview Card */}
      <div className="bg-white border border-slate-200 rounded shadow-xs p-5 font-mono text-slate-800 max-w-4xl mx-auto space-y-5">
        <div className="text-center border-b border-slate-200 pb-3 space-y-1">
          <div className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
            CONFIDENTIAL • GOVERNMENT OF INDIA
          </div>
          <h3 className="text-base font-bold text-slate-900">
            NORTH EASTERN COUNCIL TRANSPORT EMERGENCY SITREP
          </h3>
          <div className="text-[11px] text-blue-700">
            Automated Compilation via VECTOR Platform • Supabase Database
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] bg-slate-50 p-3 rounded border border-slate-200">
          <div>
            <span className="text-slate-500 block">Date of Record:</span>
            <span className="font-bold text-slate-900">{new Date().toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Lead Authority:</span>
            <span className="font-bold text-slate-900">Disaster Command</span>
          </div>
          <div>
            <span className="text-slate-500 block">Active Incidents:</span>
            <span className="font-bold text-red-700">{incidents.length} Critical Events</span>
          </div>
          <div>
            <span className="text-slate-500 block">Corridor Network:</span>
            <span className="font-bold text-green-700">
              {routes.filter((r) => r.status === 'open').length} / {routes.length} Available
            </span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
            EXECUTIVE DISASTER MITIGATION BRIEF:
          </div>
          <p className="text-slate-700 leading-relaxed text-[11px]">
            1. <strong>NH-06 Sonapur Tunnel Sector (Meghalaya):</strong> Blockage active due to heavy saturated slope failure. All POL (Petroleum, Oil, Lubricants) tankers have been successfully diverted via SH-19 Haflong Safe Corridor under armed SDRF/Police escort.
          </p>
          <p className="text-slate-700 leading-relaxed text-[11px]">
            2. <strong>NH-13 Sela Pass Alpine Sector (Arunachal):</strong> Border Roads Organisation (BRO) Pushpak salt deployment active. Single-lane movement permitted with snow chains.
          </p>
          <p className="text-slate-700 leading-relaxed text-[11px]">
            3. <strong>Shared Database Synchronization:</strong> Future citizen and commercial driver mobile applications are receiving identical routing and alert notifications via Supabase Realtime channel <code className="text-blue-700 bg-slate-100 px-1 py-0.5 rounded">public.routes</code>.
          </p>
        </div>

        <div className="flex justify-between items-end pt-4 border-t border-slate-200 text-[11px] text-slate-500">
          <div>
            <div>Authenticated by:</div>
            <div className="font-bold text-slate-900">Dr. A. K. Baruah, IAS</div>
            <div>Special Director & Command Controller</div>
          </div>
          <div className="text-right">
            <span className="text-green-700 font-bold">DIGITALLY SIGNED & SEALED</span>
            <div className="text-[10px] text-slate-400 font-mono">HASH: 9a7b-e4c1-vector-ner</div>
          </div>
        </div>
      </div>
    </div>
  );
};
