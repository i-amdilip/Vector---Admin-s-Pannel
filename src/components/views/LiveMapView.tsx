import React, { useState } from 'react';
import {
  RouteItem,
  RiskZone,
  Incident,
  Vehicle,
  GovernmentOffice,
  PoliceStation,
  FireStation,
  RescueTeam,
  WeatherStationData,
} from '../../types/vector';
import { VectorGISMap } from '../map/VectorGISMap';
import {
  Filter,
  MapPin,
  Route as RouteIcon,
  AlertTriangle,
  Layers,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Ban,
} from 'lucide-react';

interface LiveMapViewProps {
  routes: RouteItem[];
  riskZones: RiskZone[];
  incidents: Incident[];
  vehicles: Vehicle[];
  governmentOffices: GovernmentOffice[];
  policeStations: PoliceStation[];
  fireStations: FireStation[];
  rescueTeams: RescueTeam[];
  weatherData: WeatherStationData[];
  onSelectRoute: (route: RouteItem) => void;
  onSelectIncident: (incident: Incident) => void;
  onBlockRoute: (routeId: string) => void;
  onReopenRoute: (routeId: string) => void;
}

export const LiveMapView: React.FC<LiveMapViewProps> = ({
  routes,
  riskZones,
  incidents,
  vehicles,
  governmentOffices,
  policeStations,
  fireStations,
  rescueTeams,
  weatherData,
  onSelectRoute,
  onSelectIncident,
  onBlockRoute,
  onReopenRoute,
}) => {
  const [filterState, setFilterState] = useState<string>('all');
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);

  const filteredRoutes = routes.filter((r) => {
    if (filterState === 'all') return true;
    if (filterState === 'open') return r.status === 'open';
    if (filterState === 'blocked') return r.status === 'blocked';
    if (filterState === 'warning') return r.status === 'warning';
    if (filterState === 'emergency') return r.is_emergency_route;
    return true;
  });

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Filter & Command Strip */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 z-20 text-xs shadow-md">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200 font-mono flex items-center gap-1.5">
            <RouteIcon className="w-4 h-4 text-cyan-400" />
            CORRIDOR FILTER:
          </span>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 font-medium">
            <button
              onClick={() => setFilterState('all')}
              className={`px-2.5 py-1 rounded transition ${
                filterState === 'all'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({routes.length})
            </button>
            <button
              onClick={() => setFilterState('open')}
              className={`px-2.5 py-1 rounded transition ${
                filterState === 'open'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              🟢 Open ({routes.filter((r) => r.status === 'open').length})
            </button>
            <button
              onClick={() => setFilterState('warning')}
              className={`px-2.5 py-1 rounded transition ${
                filterState === 'warning'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              🟡 Warning ({routes.filter((r) => r.status === 'warning').length})
            </button>
            <button
              onClick={() => setFilterState('blocked')}
              className={`px-2.5 py-1 rounded transition ${
                filterState === 'blocked'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              🔴 Blocked ({routes.filter((r) => r.status === 'blocked').length})
            </button>
            <button
              onClick={() => setFilterState('emergency')}
              className={`px-2.5 py-1 rounded transition ${
                filterState === 'emergency'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-cyan-400'
              }`}
            >
              🔵 Emergency ({routes.filter((r) => r.is_emergency_route).length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <span>Data Sync: <strong className="text-emerald-400">Realtime Supabase WebSocket</strong></span>
        </div>
      </div>

      {/* Main Interactive Map Container */}
      <div className="relative flex-1 w-full h-full">
        <VectorGISMap
          routes={filteredRoutes}
          riskZones={riskZones}
          incidents={incidents}
          vehicles={vehicles}
          governmentOffices={governmentOffices}
          policeStations={policeStations}
          fireStations={fireStations}
          rescueTeams={rescueTeams}
          weatherData={weatherData}
          selectedRouteId={selectedRoute?.id}
          onSelectRoute={(r) => {
            setSelectedRoute(r);
            onSelectRoute(r);
          }}
          onSelectIncident={onSelectIncident}
        />
      </div>
    </div>
  );
};
