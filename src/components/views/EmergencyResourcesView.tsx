import React, { useState } from 'react';
import {
  PoliceStation,
  FireStation,
  RescueTeam,
  Incident,
} from '../../types/vector';
import {
  Shield,
  Flame,
  LifeBuoy,
  Plus,
  MapPin,
  Phone,
  Users,
  CheckCircle2,
  Wrench,
  Search,
} from 'lucide-react';

interface EmergencyResourcesViewProps {
  policeStations: PoliceStation[];
  fireStations: FireStation[];
  rescueTeams: RescueTeam[];
  incidents: Incident[];
  onUpdateRescueStatus: (
    teamId: string,
    status: 'standby' | 'deployed' | 'returning' | 'off_duty'
  ) => Promise<any>;
  onSelectOnMap: (coords: [number, number], title: string) => void;
}

export const EmergencyResourcesView: React.FC<EmergencyResourcesViewProps> = ({
  policeStations,
  fireStations,
  rescueTeams,
  incidents,
  onUpdateRescueStatus,
  onSelectOnMap,
}) => {
  const [activeTab, setActiveTab] = useState<'rescue' | 'police' | 'fire'>('rescue');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-7xl mx-auto text-slate-900 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-red-600" />
            <span>NER Disaster Response Logistics & Emergency Assets</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Command NDRF Battalions, SDRF Units, BRO Pushpak heavy earthmoving equipment, highway police, and fire tenders.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border border-slate-200 gap-1 bg-slate-100 p-1 rounded">
        <button
          onClick={() => setActiveTab('rescue')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
            activeTab === 'rescue'
              ? 'bg-white text-red-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Rescue Teams & NDRF/BRO ({rescueTeams.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('police')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
            activeTab === 'police'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Police Stations ({policeStations.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('fire')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
            activeTab === 'fire'
              ? 'bg-white text-amber-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Fire & Emergency Stations ({fireStations.length})</span>
        </button>
      </div>

      {/* Rescue Teams Tab */}
      {activeTab === 'rescue' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rescueTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white border border-slate-200 rounded shadow-xs p-3.5 flex flex-col justify-between hover:border-slate-300 transition space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-blue-700">
                    {(team.team_type || 'Rescue Team').toUpperCase()}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      team.current_status === 'standby'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : team.current_status === 'deployed'
                        ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    ● {team.current_status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-1">{team.name}</h3>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{team.base_location}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1.5 text-[11px] text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Personnel:</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">{team.personnel_count} Specialists</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hotline:</span>
                  </span>
                  <span className="font-mono text-slate-900">{team.contact_number}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Equipment Deployed:</span>
                  <div className="flex flex-wrap gap-1">
                    {team.equipment.map((eq, i) => (
                      <span
                        key={i}
                        className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] text-blue-800 font-medium"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => onSelectOnMap(team.coordinates, team.name)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold transition"
                >
                  GIS Radar
                </button>

                <div className="flex gap-1">
                  {team.current_status === 'standby' ? (
                    <button
                      onClick={() => onUpdateRescueStatus(team.id, 'deployed')}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[11px] shadow-xs transition"
                    >
                      Deploy Squad
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateRescueStatus(team.id, 'standby')}
                      className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded text-[11px] shadow-xs transition"
                    >
                      Return to Standby
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Police Stations Tab */}
      {activeTab === 'police' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {policeStations.map((station) => (
            <div
              key={station.id}
              className="bg-white border border-slate-200 rounded shadow-xs p-3.5 flex flex-col justify-between hover:border-slate-300 transition space-y-3"
            >
              <div>
                <span className="text-[10px] font-mono text-blue-700 font-bold uppercase">
                  POLICE DISASTER INTERCEPT UNIT
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{station.name}</h3>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {station.district}, {station.state}
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1.5 text-[11px] text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patrol Interceptors:</span>
                  <span className="font-mono font-bold text-slate-900">{station.vehicles_available} Units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Station Strength:</span>
                  <span className="font-mono font-bold text-slate-900">{station.officers_count} Officers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Control Desk:</span>
                  <span className="font-mono text-blue-700 font-medium">{station.contact_number}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => onSelectOnMap(station.coordinates, station.name)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[11px] shadow-xs transition"
                >
                  Locate on Live Map
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fire Stations Tab */}
      {activeTab === 'fire' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fireStations.map((station) => (
            <div
              key={station.id}
              className="bg-white border border-slate-200 rounded shadow-xs p-3.5 flex flex-col justify-between hover:border-slate-300 transition space-y-3"
            >
              <div>
                <span className="text-[10px] font-mono text-amber-700 font-bold uppercase">
                  FIRE & HYDRAULIC CRASH RESCUE
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{station.name}</h3>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {station.district}, {station.state}
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1.5 text-[11px] text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Water Bowsers & Tenders:</span>
                  <span className="font-mono font-bold text-slate-900">{station.fire_engines} Heavy Tenders</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rescue Firemen:</span>
                  <span className="font-mono font-bold text-slate-900">{station.officers_count} Personnel</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Emergency Dispatch:</span>
                  <span className="font-mono text-amber-700 font-medium">{station.contact_number}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => onSelectOnMap(station.coordinates, station.name)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[11px] shadow-xs transition"
                >
                  Locate on Live Map
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
