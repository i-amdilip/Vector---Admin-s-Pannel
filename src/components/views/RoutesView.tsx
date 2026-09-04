import React, { useState } from 'react';
import {
  RouteItem,
  RoadType,
  RouteStatus,
  RiskLevel,
} from '../../types/vector';
import {
  Route as RouteIcon,
  Plus,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Archive,
  Edit,
  Shield,
  Search,
  Filter,
  ArrowRight,
  Truck,
  MapPin,
} from 'lucide-react';

interface RoutesViewProps {
  routes: RouteItem[];
  onCreateRoute: (route: Omit<RouteItem, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  onUpdateStatus: (routeId: string, status: RouteStatus, risk?: RiskLevel, delay?: number) => Promise<any>;
  onSelectOnMap: (route: RouteItem) => void;
}

export const RoutesView: React.FC<RoutesViewProps> = ({
  routes,
  onCreateRoute,
  onUpdateStatus,
  onSelectOnMap,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);

  // Form state for New Route
  const [formData, setFormData] = useState({
    route_id: '',
    route_name: '',
    starting_point: '',
    destination: '',
    district: '',
    state: 'Assam',
    road_type: 'national_highway' as RoadType,
    status: 'open' as RouteStatus,
    risk_level: 'low' as RiskLevel,
    is_emergency_route: false,
    description: '',
    maximum_load_tonnes: 30,
    recommended_vehicle_types: 'Heavy Transport Truck, Emergency Ambulance',
    length_km: 150,
    average_transit_hours: 4.5,
    geometryString: '91.736, 26.182; 92.684, 26.347; 92.793, 24.833',
  });

  const filteredRoutes = routes.filter((r) => {
    const matchesSearch =
      r.route_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.route_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.state.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Parse coordinates
    const coords: [number, number][] = formData.geometryString
      .split(';')
      .map((pair) => {
        const [lng, lat] = pair.trim().split(',').map(Number);
        return [lng || 91.7, lat || 26.1];
      });

    await onCreateRoute({
      route_id: formData.route_id.toUpperCase(),
      route_name: formData.route_name,
      starting_point: formData.starting_point,
      destination: formData.destination,
      district: formData.district,
      state: formData.state,
      road_type: formData.road_type,
      status: formData.status,
      risk_level: formData.risk_level,
      is_emergency_route: formData.is_emergency_route,
      description: formData.description,
      maximum_load_tonnes: Number(formData.maximum_load_tonnes),
      recommended_vehicle_types: formData.recommended_vehicle_types.split(',').map((s) => s.trim()),
      geometry: coords,
      length_km: Number(formData.length_km),
      average_transit_hours: Number(formData.average_transit_hours),
      current_delay_minutes: 0,
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-7xl mx-auto text-slate-900 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <RouteIcon className="w-5 h-5 text-blue-600" />
            <span>North Eastern Region Highway & Corridor Management</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Create, monitor, block, reopen, and enforce emergency weight restrictions across all regional arterial lifelines.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Route</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by route code (e.g. NH-06), name, terminal points, or district..."
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
            <option value="all">All Statuses ({routes.length})</option>
            <option value="open">🟢 Open / Safe</option>
            <option value="warning">🟡 Warning / Risk</option>
            <option value="blocked">🔴 Blocked / Impassable</option>
            <option value="emergency_only">🔵 Emergency Corridor</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Routes List Table */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider font-mono">
                <th className="p-3">Route ID & Name</th>
                <th className="p-3">Origin & Destination</th>
                <th className="p-3">Jurisdiction</th>
                <th className="p-3">Status</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Load Limit</th>
                <th className="p-3 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoutes.map((route) => (
                <tr
                  key={route.id}
                  className="hover:bg-slate-50/80 transition group cursor-pointer"
                  onClick={() => setSelectedRoute(route)}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-700 font-mono text-xs bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {route.route_id}
                      </span>
                      {route.is_emergency_route && (
                        <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                          EMERGENCY
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-slate-900 text-xs mt-1">
                      {route.route_name}
                    </div>
                    <div className="text-[10px] text-slate-500 capitalize">
                      {(route.road_type || 'highway').replace(/_/g, ' ')} • {route.length_km} km
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="text-slate-800 font-medium text-xs">
                      {route.starting_point}
                    </div>
                    <div className="text-slate-400 text-[10px] flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 text-blue-600" />
                      <span>{route.destination}</span>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="text-slate-700 text-xs font-medium">{route.district}</div>
                    <div className="text-slate-400 text-[10px]">{route.state}</div>
                  </td>

                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] uppercase font-mono ${
                        route.status === 'open'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : route.status === 'blocked'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : route.status === 'emergency_only'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          route.status === 'open'
                            ? 'bg-green-600'
                            : route.status === 'blocked'
                            ? 'bg-red-600'
                            : 'bg-amber-600'
                        }`}
                      />
                      {(route.status || 'open').replace(/_/g, ' ')}
                    </span>
                    {route.current_delay_minutes > 0 && (
                      <div className="text-[10px] text-red-600 font-mono mt-0.5">
                        +{route.current_delay_minutes}m delay
                      </div>
                    )}
                  </td>

                  <td className="p-3">
                    <span
                      className={`font-bold font-mono text-[10px] uppercase px-1.5 py-0.5 rounded border ${
                        route.risk_level === 'critical'
                          ? 'text-red-700 bg-red-50 border-red-200'
                          : route.risk_level === 'high'
                          ? 'text-amber-700 bg-amber-50 border-amber-200'
                          : route.risk_level === 'moderate'
                          ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
                          : 'text-green-700 bg-green-50 border-green-200'
                      }`}
                    >
                      {route.risk_level}
                    </span>
                  </td>

                  <td className="p-3 font-mono text-slate-700 text-xs">
                    {route.maximum_load_tonnes} Tonnes
                  </td>

                  <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectOnMap(route)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] border border-slate-200 font-semibold transition"
                        title="Locate corridor on GIS Map"
                      >
                        GIS Pin
                      </button>

                      {route.status !== 'blocked' ? (
                        <button
                          onClick={() => onUpdateStatus(route.id, 'blocked', 'critical', 240)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold shadow-xs transition"
                          title="Block Route & Publish Alert"
                        >
                          Block
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateStatus(route.id, 'open', 'low', 0)}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[11px] font-bold shadow-xs transition"
                          title="Reopen Route for traffic"
                        >
                          Reopen
                        </button>
                      )}

                      <button
                        onClick={() => onUpdateStatus(route.id, 'emergency_only', route.risk_level)}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold transition"
                        title="Mark as Emergency Services Only"
                      >
                        Emergency Only
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Route Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" /> Register Strategic Route / Corridor
                </h3>
                <p className="text-[11px] text-slate-500">
                  Saves directly to Supabase PostgreSQL & PostGIS geometry layer.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Route Identifier Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NH-127B-MEGH"
                    value={formData.route_id}
                    onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Route Formal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhubri - Phulbari Bridge Corridor"
                    value={formData.route_name}
                    onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Starting Point (Origin)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Guwahati Transit Junction"
                    value={formData.starting_point}
                    onChange={(e) => setFormData({ ...formData, starting_point: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Destination</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Silchar Logistics Depot"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-900"
                  >
                    <option value="Assam">Assam</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Tripura">Tripura</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kamrup Metro"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Road Classification</label>
                  <select
                    value={formData.road_type}
                    onChange={(e) => setFormData({ ...formData, road_type: e.target.value as RoadType })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-900"
                  >
                    <option value="national_highway">National Highway</option>
                    <option value="state_highway">State Highway</option>
                    <option value="border_road">Border Road (BRO)</option>
                    <option value="district_road">Major District Road</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as RouteStatus })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-900"
                  >
                    <option value="open">🟢 Open / Safe</option>
                    <option value="warning">🟡 Warning / Risk</option>
                    <option value="blocked">🔴 Blocked</option>
                    <option value="emergency_only">🔵 Emergency Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Risk Level</label>
                  <select
                    value={formData.risk_level}
                    onChange={(e) => setFormData({ ...formData, risk_level: e.target.value as RiskLevel })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-900"
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Max Gross Load (Tonnes)</label>
                  <input
                    type="number"
                    value={formData.maximum_load_tonnes}
                    onChange={(e) => setFormData({ ...formData, maximum_load_tonnes: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  PostGIS Geometry Waypoints (lng, lat separated by semicolons)
                </label>
                <input
                  type="text"
                  value={formData.geometryString}
                  onChange={(e) => setFormData({ ...formData, geometryString: e.target.value })}
                  placeholder="91.736, 26.182; 92.684, 26.347; 92.793, 24.833"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Corridor Operational Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Terrain hazards, pass elevation, bridge load caps, security checkposts..."
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_emergency_route"
                  checked={formData.is_emergency_route}
                  onChange={(e) => setFormData({ ...formData, is_emergency_route: e.target.checked })}
                  className="rounded accent-blue-600"
                />
                <label htmlFor="is_emergency_route" className="text-slate-700 font-medium">
                  Designate as Priority NER Emergency Resupply Corridor
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-xs transition"
                >
                  Save Route to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
