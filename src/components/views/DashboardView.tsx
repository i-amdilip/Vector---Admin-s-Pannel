import React from 'react';
import {
  RouteItem,
  RiskZone,
  Incident,
  Vehicle,
  GovernmentOffice,
  PoliceStation,
  FireStation,
  RescueTeam,
  SystemAlert,
  WeatherStationData,
} from '../../types/vector';
import {
  Route as RouteIcon,
  CheckCircle2,
  Ban,
  AlertTriangle,
  AlertOctagon,
  Truck,
  Clock,
  LifeBuoy,
  Shield,
  Flame,
  Building2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  MapPin,
  Compass,
} from 'lucide-react';
import { VectorGISMap } from '../map/VectorGISMap';

interface DashboardViewProps {
  routes: RouteItem[];
  riskZones: RiskZone[];
  incidents: Incident[];
  vehicles: Vehicle[];
  governmentOffices: GovernmentOffice[];
  policeStations: PoliceStation[];
  fireStations: FireStation[];
  rescueTeams: RescueTeam[];
  weatherData: WeatherStationData[];
  alerts: SystemAlert[];
  onNavigate: (view: any) => void;
  onSelectRoute: (route: RouteItem) => void;
  onVerifyIncident: (incidentId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  routes,
  riskZones,
  incidents,
  vehicles,
  governmentOffices,
  policeStations,
  fireStations,
  rescueTeams,
  weatherData,
  alerts,
  onNavigate,
  onSelectRoute,
  onVerifyIncident,
}) => {
  // Live cards data calculated from Supabase collections
  const totalRoutes = routes.length;
  const openRoutes = routes.filter((r) => r.status === 'open').length;
  const blockedRoutes = routes.filter((r) => r.status === 'blocked').length;
  const highRiskRoutes = routes.filter((r) => r.risk_level === 'high' || r.risk_level === 'critical').length;
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed').length;
  const activeVehicles = vehicles.filter((v) => v.status === 'in_transit' || v.status === 'rerouted').length;
  const delayedVehicles = vehicles.filter((v) => v.is_delayed).length;
  const emergencyTeams = rescueTeams.length;
  const totalPolice = policeStations.length;
  const totalFire = fireStations.length;
  const totalOffices = governmentOffices.length;

  const pendingIncidents = incidents.filter((i) => i.status === 'reported' || i.status === 'under_verification');
  const criticalAlerts = alerts.filter((a) => a.category === 'critical' && !a.acknowledged);

  return (
    <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-w-7xl mx-auto text-slate-900">
      {/* Top Banner / Emergency Flash */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-3 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center text-white shrink-0">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white font-bold text-[10px] px-1.5 py-0.2 rounded uppercase font-mono">
                  CRITICAL OPERATIONAL ALERT
                </span>
                <span className="text-xs font-semibold text-red-900">
                  {criticalAlerts[0].title}
                </span>
              </div>
              <p className="text-xs text-red-700 mt-0.5 max-w-2xl truncate">
                {criticalAlerts[0].message}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('Alerts')}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shrink-0 shadow-xs transition"
          >
            Review & Broadcast
          </button>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>NER Unified Logistics & Disaster Command Center</span>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              SECTOR LIVE
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-state monitoring across Assam, Arunachal Pradesh, Meghalaya, Sikkim, Nagaland, Manipur, Mizoram & Tripura.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('Live Map')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs transition"
          >
            <Compass className="w-3.5 h-3.5" />
            Full GIS Map
          </button>
        </div>
      </div>

      {/* 11 Live Cards (High Density Theme) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Routes */}
        <div
          onClick={() => onNavigate('Routes')}
          className="bg-white p-3 border border-slate-200 rounded shadow-xs hover:border-blue-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-tight mb-1">
            <span>Total Routes</span>
            <RouteIcon className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalRoutes}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">Inter-State Corridors</div>
        </div>

        {/* Open Routes */}
        <div
          onClick={() => onNavigate('Routes')}
          className="bg-white p-3 border border-slate-200 rounded shadow-xs hover:border-emerald-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-tight mb-1">
            <span>Open Routes</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">{openRoutes}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">🟢 Safe Transit Passable</div>
        </div>

        {/* Blocked Routes */}
        <div
          onClick={() => onNavigate('Routes')}
          className="bg-white p-3 border border-slate-200 rounded shadow-xs hover:border-red-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-tight mb-1">
            <span>Blocked Routes</span>
            <Ban className="w-3.5 h-3.5 text-red-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-red-600 font-mono">{blockedRoutes}</div>
          <div className="text-[10px] text-red-600 font-semibold mt-1">🔴 Impassable / Diverted</div>
        </div>

        {/* High-Risk Routes */}
        <div
          onClick={() => onNavigate('Routes')}
          className="bg-white p-3 border border-slate-200 rounded shadow-xs hover:border-amber-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-tight mb-1">
            <span>High-Risk Routes</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono">{highRiskRoutes}</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1">🟡 Caution Advisory</div>
        </div>

        {/* Active Incidents */}
        <div
          onClick={() => onNavigate('Incidents')}
          className="bg-white p-3 border border-slate-200 rounded shadow-xs hover:border-red-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-tight mb-1">
            <span>Active Incidents</span>
            <AlertOctagon className="w-3.5 h-3.5 text-red-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-red-600 font-mono">{activeIncidents}</div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">Landslides / Washouts</div>
        </div>

        {/* Active Vehicles */}
        <div
          onClick={() => onNavigate('Vehicles')}
          className="bg-white p-3 border border-slate-200 rounded shadow-xs hover:border-blue-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-tight mb-1">
            <span>Active Vehicles</span>
            <Truck className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-blue-600 font-mono">{activeVehicles}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">GPS Monitored Transports</div>
        </div>

        {/* Delayed Vehicles */}
        <div
          onClick={() => onNavigate('Vehicles')}
          className="bg-white p-3 border border-slate-200 rounded shadow-xs hover:border-amber-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-tight mb-1">
            <span>Delayed Vehicles</span>
            <Clock className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono">{delayedVehicles}</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1">Corridor Bottlenecks</div>
        </div>

        {/* Emergency Teams */}
        <div
          onClick={() => onNavigate('Emergency Resources')}
          className="bg-white p-3 border border-slate-200 rounded shadow-xs hover:border-red-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-tight mb-1">
            <span>Emergency Teams</span>
            <LifeBuoy className="w-3.5 h-3.5 text-red-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{emergencyTeams}</div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">NDRF / SDRF / BRO</div>
        </div>

        {/* Police Stations */}
        <div
          onClick={() => onNavigate('Emergency Resources')}
          className="bg-white p-3 border border-slate-200 rounded shadow-xs hover:border-blue-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-tight mb-1">
            <span>Police Stations</span>
            <Shield className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalPolice}</div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">Highway Patrol Units</div>
        </div>

        {/* Fire Stations */}
        <div
          onClick={() => onNavigate('Emergency Resources')}
          className="bg-white p-3 border border-slate-200 rounded shadow-xs hover:border-orange-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-tight mb-1">
            <span>Fire Stations</span>
            <Flame className="w-3.5 h-3.5 text-orange-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalFire}</div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">Crash Tenders Ready</div>
        </div>

        {/* Government Offices */}
        <div
          onClick={() => onNavigate('Government Offices')}
          className="bg-white p-3 border border-slate-200 rounded shadow-xs hover:border-blue-400 transition cursor-pointer group col-span-2 sm:col-span-1 lg:col-span-2"
        >
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-tight mb-1">
            <span>Govt Offices & Gates</span>
            <Building2 className="w-3.5 h-3.5 text-slate-700 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalOffices}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">Checkpoints Operational</div>
        </div>
      </div>

      {/* Main Grid: GIS Preview + Actionable Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: GIS Interactive Map Preview */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Live GIS Operational View (NER Corridors)
              </h3>
            </div>
            <button
              onClick={() => onNavigate('Live Map')}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              Expand Full Map <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-[390px] w-full relative">
            <VectorGISMap
              routes={routes}
              riskZones={riskZones}
              incidents={incidents}
              vehicles={vehicles}
              governmentOffices={governmentOffices}
              policeStations={policeStations}
              fireStations={fireStations}
              rescueTeams={rescueTeams}
              weatherData={weatherData}
              onSelectRoute={onSelectRoute}
            />
          </div>
        </div>

        {/* Right 1 Col: Urgent Pending Actions & Field Incidents */}
        <div className="space-y-4">
          {/* Quick AI Risk Assessment Snapshot (Dark Accent Card from Design) */}
          <div className="bg-slate-900 text-white rounded p-4 flex flex-col shadow-xs border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                AI Risk Early Warning
              </h3>
              <span className="text-[10px] font-mono bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.5 rounded font-bold">
                SELA PASS CRITICAL
              </span>
            </div>

            <div className="space-y-2.5 text-xs mt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-200 text-[11px]">NH-06 Meghalaya Sonapur</span>
                  <span className="text-red-400 font-bold font-mono text-[11px]">92/100 (CRITICAL)</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                  <div className="bg-red-500 h-full w-[92%]" />
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Active landslide washouts. Alternate route SH-19 Haflong activated for convoys.
                </p>
              </div>

              <div className="border-t border-slate-800 pt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-200 text-[11px]">NH-13 Sela Pass Corridor</span>
                  <span className="text-amber-400 font-bold font-mono text-[11px]">68/100 (HIGH)</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                  <div className="bg-amber-500 h-full w-[68%]" />
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Severe alpine fog & black ice hazard. BRO salt spreading team operating continuously.
                </p>
              </div>
            </div>
          </div>

          {/* Pending Field Reports Verification Box */}
          <div className="bg-white border border-slate-200 rounded p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-amber-500" />
                Field Reports for Verification ({pendingIncidents.length})
              </h3>
              <button
                onClick={() => onNavigate('Incidents')}
                className="text-[10px] text-blue-600 font-semibold hover:underline"
              >
                All Reports
              </button>
            </div>

            {pendingIncidents.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                No unverified field incidents.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingIncidents.slice(0, 3).map((inc) => (
                  <div
                    key={inc.id}
                    className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[11px] font-bold text-slate-800 leading-snug line-clamp-1">
                        {inc.title}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-red-100 text-red-700 border border-red-200 uppercase shrink-0">
                        {inc.severity}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {inc.location_name} • Reported by {inc.reporter_name}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-amber-700 font-mono font-semibold capitalize">
                        ● {(inc.status || 'reported').replace(/_/g, ' ')}
                      </span>
                      <button
                        onClick={() => onVerifyIncident(inc.id)}
                        className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded shadow-xs transition"
                      >
                        Verify & Action
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
