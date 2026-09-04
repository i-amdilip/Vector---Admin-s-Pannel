import React, { useState } from 'react';
import {
  Incident,
  IncidentStatus,
  IncidentType,
  RiskLevel,
  RescueTeam,
  RouteItem,
} from '../../types/vector';
import {
  AlertOctagon,
  Plus,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Ban,
  Clock,
  User,
  Building2,
  MapPin,
  LifeBuoy,
  Eye,
  Filter,
  Search,
} from 'lucide-react';

interface IncidentsViewProps {
  incidents: Incident[];
  rescueTeams: RescueTeam[];
  routes: RouteItem[];
  onUpdateStatus: (incidentId: string, status: IncidentStatus) => Promise<any>;
  onAssignTeam: (incidentId: string, teamId: string, teamName: string) => Promise<any>;
  onBlockRoute: (routeId: string) => Promise<any>;
  onCreateIncident: (incident: Omit<Incident, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  rescueTeams,
  routes,
  onUpdateStatus,
  onAssignTeam,
  onBlockRoute,
  onCreateIncident,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const [formData, setFormData] = useState({
    incident_id: '',
    title: '',
    incident_type: 'landslide' as IncidentType,
    severity: 'critical' as RiskLevel,
    location_name: '',
    coordinates: '92.356, 25.132',
    affected_route_id: routes[0]?.id || '',
    reporter_name: 'Inspector R. Marak',
    reporter_role: 'District Highway Patrol Officer',
    department: 'Meghalaya Police Disaster Cell',
    description: '',
    photos: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
  });

  const filteredIncidents = incidents.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.incident_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || i.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const [lng, lat] = formData.coordinates.split(',').map((s) => Number(s.trim()));
    const targetRoute = routes.find((r) => r.id === formData.affected_route_id);

    await onCreateIncident({
      incident_id: formData.incident_id.toUpperCase() || `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      title: formData.title,
      incident_type: formData.incident_type,
      severity: formData.severity,
      location_name: formData.location_name,
      coordinates: [lng || 92.35, lat || 25.13],
      status: 'reported',
      affected_route_id: formData.affected_route_id,
      affected_route_name: targetRoute?.route_name,
      reporter_name: formData.reporter_name,
      reporter_role: formData.reporter_role,
      department: formData.department,
      description: formData.description,
      photos: formData.photos ? [formData.photos] : [],
    });

    setIsCreateModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-7xl mx-auto text-slate-900 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-600" />
            <span>Incident Command & Verification Desk</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Ingest field officer and citizen hazard transmissions, verify integrity, dispatch rescue teams, and trigger corridor closures.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Incident Report</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search incident ID, title, highway sector, or reporter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses ({incidents.length})</option>
            <option value="reported">🟡 Reported (Pending Verification)</option>
            <option value="verified">🟢 Verified by Govt</option>
            <option value="in_progress">🔵 In Progress (Clearing)</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Incidents List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIncidents.map((incident) => (
          <div
            key={incident.id}
            className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden flex flex-col hover:border-slate-300 transition"
          >
            {incident.photos && incident.photos.length > 0 && (
              <div className="h-32 w-full overflow-hidden relative">
                <img
                  src={incident.photos[0]}
                  alt={incident.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                      incident.severity === 'critical'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : incident.severity === 'high'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {incident.severity}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                    {incident.incident_id}
                  </span>
                </div>
              </div>
            )}

            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider font-mono">
                    {(incident.incident_type || 'incident').replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      incident.status === 'reported'
                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        : incident.status === 'verified'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : incident.status === 'resolved'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {(incident.status || 'reported').replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                  {incident.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {incident.description}
                </p>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sector:</span>
                  </span>
                  <span className="text-slate-800 font-medium truncate max-w-[170px]">
                    {incident.location_name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Affected Route:</span>
                  <span className="text-blue-700 font-mono font-medium">
                    {incident.affected_route_name || 'Corridor Link'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reporter:</span>
                  <span className="text-slate-700 truncate max-w-[170px]">
                    {incident.reporter_name} ({incident.reporter_role})
                  </span>
                </div>
                {incident.assigned_rescue_team_name && (
                  <div className="flex items-center justify-between text-green-700 font-medium">
                    <span>Assigned Squad:</span>
                    <span>{incident.assigned_rescue_team_name}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 justify-end">
                {incident.status === 'reported' && (
                  <>
                    <button
                      onClick={() => onUpdateStatus(incident.id, 'verified')}
                      className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded flex items-center gap-1 shadow-xs transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify</span>
                    </button>
                    <button
                      onClick={() => onUpdateStatus(incident.id, 'rejected')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded flex items-center gap-1 transition"
                    >
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>Reject</span>
                    </button>
                  </>
                )}

                {incident.status === 'verified' && (
                  <>
                    {incident.affected_route_id && (
                      <button
                        onClick={() => onBlockRoute(incident.affected_route_id!)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center gap-1 shadow-xs transition"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Block Route</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const team = rescueTeams[0];
                        if (team) onAssignTeam(incident.id, team.id, team.name);
                      }}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex items-center gap-1 shadow-xs transition"
                    >
                      <LifeBuoy className="w-3.5 h-3.5" />
                      <span>Dispatch Team</span>
                    </button>
                    <button
                      onClick={() => onUpdateStatus(incident.id, 'in_progress')}
                      className="px-2 py-1 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded transition"
                    >
                      Mark In Progress
                    </button>
                  </>
                )}

                {incident.status === 'in_progress' && (
                  <button
                    onClick={() => onUpdateStatus(incident.id, 'resolved')}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded flex items-center gap-1 shadow-xs transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Incident Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto p-5 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-600" /> Log Emergency Incident Report
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Incident Code</label>
                  <input
                    type="text"
                    placeholder="INC-2026-09"
                    value={formData.incident_id}
                    onChange={(e) => setFormData({ ...formData, incident_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Incident Type</label>
                  <select
                    value={formData.incident_type}
                    onChange={(e) => setFormData({ ...formData, incident_type: e.target.value as IncidentType })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-900"
                  >
                    <option value="landslide">Landslide / Mudflow</option>
                    <option value="flood">Flash Flood / Waterlogging</option>
                    <option value="accident">Major Transport Collision</option>
                    <option value="road_closure">Emergency Road Closure</option>
                    <option value="fallen_tree">Fallen Tree / Powerline</option>
                    <option value="roadblock">Civil Roadblock</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Incident Title / Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saturated Slope Failure at Sonapur Outfall"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as RiskLevel })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-900"
                  >
                    <option value="critical">Critical (Complete Obstruction)</option>
                    <option value="high">High (Single Lane Blocked)</option>
                    <option value="moderate">Moderate</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Affected Route</label>
                  <select
                    value={formData.affected_route_id}
                    onChange={(e) => setFormData({ ...formData, affected_route_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 font-mono"
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.route_id} - {r.route_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Location Sector</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KM 142 Sonapur Tunnel"
                    value={formData.location_name}
                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Coordinates (lng, lat)</label>
                  <input
                    type="text"
                    required
                    value={formData.coordinates}
                    onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                    placeholder="92.356, 25.132"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Reporting Officer / Citizen</label>
                  <input
                    type="text"
                    value={formData.reporter_name}
                    onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Officer Role</label>
                  <input
                    type="text"
                    value={formData.reporter_role}
                    onChange={(e) => setFormData({ ...formData, reporter_role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Detailed Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Estimated debris volume, stranded vehicles, casualty risk, equipment needed..."
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-xs transition"
                >
                  Transmit Report to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
