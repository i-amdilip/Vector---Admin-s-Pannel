import React from 'react';
import { RouteItem, Incident, Vehicle, WeatherStationData } from '../../types/vector';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Truck,
  Route as RouteIcon,
} from 'lucide-react';

interface AnalyticsViewProps {
  routes: RouteItem[];
  incidents: Incident[];
  vehicles: Vehicle[];
  weatherData: WeatherStationData[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  routes,
  incidents,
  vehicles,
  weatherData,
}) => {
  // State distribution
  const stateCounts: Record<string, number> = {};
  routes.forEach((r) => {
    stateCounts[r.state] = (stateCounts[r.state] || 0) + 1;
  });

  // Incident type distribution
  const incidentCounts: Record<string, number> = {};
  incidents.forEach((i) => {
    incidentCounts[i.incident_type] = (incidentCounts[i.incident_type] || 0) + 1;
  });

  // Calculate average transit speed
  const avgSpeed = Math.round(
    vehicles.reduce((acc, v) => acc + v.speed_kmh, 0) / (vehicles.length || 1)
  );

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-7xl mx-auto text-slate-900 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>NER Regional Logistics & Corridor Resilience Analytics</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Operational telemetry aggregated from PostGIS routes, live fleet GPS tracks, and meteorological sensors.
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded shadow-xs">
          <div className="text-slate-500 text-xs mb-1 font-medium">Average Convoy Speed</div>
          <div className="text-2xl font-black text-slate-900 font-mono">{avgSpeed} km/h</div>
          <div className="text-[10px] text-green-700 font-medium mt-1">Across Hill & Valley Sectors</div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded shadow-xs">
          <div className="text-slate-500 text-xs mb-1 font-medium">Total Monitored Corridor Length</div>
          <div className="text-2xl font-black text-blue-700 font-mono">
            {routes.reduce((acc, r) => acc + r.length_km, 0)} km
          </div>
          <div className="text-[10px] text-blue-600 font-medium mt-1">8 North Eastern States</div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded shadow-xs">
          <div className="text-slate-500 text-xs mb-1 font-medium">Corridor Availability Index</div>
          <div className="text-2xl font-black text-green-700 font-mono">
            {Math.round(
              (routes.filter((r) => r.status === 'open').length / (routes.length || 1)) * 100
            )}
            %
          </div>
          <div className="text-[10px] text-green-600 font-medium mt-1">Safe Active Lifelines</div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded shadow-xs">
          <div className="text-slate-500 text-xs mb-1 font-medium">Active Incident Resolution Rate</div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {Math.round(
              (incidents.filter((i) => i.status === 'resolved').length / (incidents.length || 1)) *
                100
            )}
            %
          </div>
          <div className="text-[10px] text-amber-600 font-medium mt-1">SDRF / BRO Pushpak Deployments</div>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* State Breakdown */}
        <div className="bg-white border border-slate-200 rounded shadow-xs p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
            State-Wise Corridor Network Density
          </h3>
          <div className="space-y-2.5">
            {Object.entries(stateCounts).map(([st, count]) => {
              const pct = Math.round((count / routes.length) * 100);
              return (
                <div key={st} className="space-y-1">
                  <div className="flex justify-between text-slate-700 text-xs">
                    <span className="font-medium">{st}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {count} Routes ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                    <div className="bg-blue-600 h-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hazard Types */}
        <div className="bg-white border border-slate-200 rounded shadow-xs p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
            Incident Breakdown by Threat Category
          </h3>
          <div className="space-y-2.5">
            {Object.entries(incidentCounts).map(([type, count]) => {
              const pct = Math.round((count / incidents.length) * 100);
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-slate-700 text-xs capitalize">
                    <span className="font-medium">{(type || 'general').replace(/_/g, ' ')}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {count} Incidents ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                    <div className="bg-red-600 h-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
