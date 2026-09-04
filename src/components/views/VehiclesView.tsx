import React, { useState } from 'react';
import { Vehicle, RouteItem, VehicleStatus } from '../../types/vector';
import {
  Truck,
  Search,
  Filter,
  MapPin,
  Clock,
  AlertTriangle,
  Route as RouteIcon,
  Shield,
  LifeBuoy,
  Send,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface VehiclesViewProps {
  vehicles: Vehicle[];
  routes: RouteItem[];
  onRerouteVehicle: (
    vehicleId: string,
    alternateRouteId: string,
    alternateRouteName: string,
    reason: string
  ) => Promise<any>;
  onSelectOnMap: (coords: [number, number], title: string) => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  vehicles,
  routes,
  onRerouteVehicle,
  onSelectOnMap,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [rerouteModalVehicle, setRerouteModalVehicle] = useState<Vehicle | null>(null);
  const [selectedAltRouteId, setSelectedAltRouteId] = useState('');
  const [rerouteReason, setRerouteReason] = useState('Diverted via Safe Corridor due to active route blockage');

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.current_route_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.cargo_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || v.vehicle_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleExecuteReroute = async () => {
    if (!rerouteModalVehicle || !selectedAltRouteId) return;
    const targetAltRoute = routes.find((r) => r.id === selectedAltRouteId);
    if (!targetAltRoute) return;

    await onRerouteVehicle(
      rerouteModalVehicle.id,
      targetAltRoute.id,
      targetAltRoute.route_name,
      rerouteReason
    );
    setRerouteModalVehicle(null);
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-7xl mx-auto text-slate-900 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <span>NER Freight, Tanker & Emergency Vehicle Telemetry</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Active GPS tracking for critical fuel tankers, medical supplies, food grain convoys, and emergency response units.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded font-mono text-[11px] font-bold">
            ● {vehicles.length} Units Connected
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search registration number, driver, route, cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Vehicle Types ({vehicles.length})</option>
            <option value="fuel_tanker">Fuel Tanker (POL)</option>
            <option value="truck">Heavy Cargo Truck</option>
            <option value="ambulance">Ambulance (Emergency)</option>
            <option value="police_vehicle">Police Escort</option>
            <option value="bus">Inter-State Passenger Bus</option>
          </select>
        </div>
      </div>

      {/* Vehicle Telemetry Table */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider font-mono">
                <th className="p-3">Vehicle & Driver</th>
                <th className="p-3">Type & Cargo</th>
                <th className="p-3">Current Route & Sector</th>
                <th className="p-3">Telemetry (Speed / Delay)</th>
                <th className="p-3">Destination & ETA</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Command Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="hover:bg-slate-50/80 transition group"
                >
                  <td className="p-3">
                    <div className="font-bold text-blue-700 font-mono text-xs">
                      {vehicle.vehicle_number || vehicle.registration_number || vehicle.vehicle_id}
                    </div>
                    <div className="text-slate-900 text-xs font-medium mt-0.5">
                      {vehicle.driver_name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {vehicle.driver_phone}
                    </div>
                  </td>

                  <td className="p-3">
                    <span className="capitalize px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      {(vehicle.vehicle_type || 'transport').replace(/_/g, ' ')}
                    </span>
                    <div className="text-slate-800 text-xs font-medium mt-1">
                      {vehicle.cargo_type}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="text-slate-900 font-semibold text-xs">
                      {vehicle.current_route_name}
                    </div>
                    <div className="text-slate-500 text-[10px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span>{vehicle.current_location_name}</span>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="font-mono text-slate-800 text-xs font-medium">
                      {vehicle.speed_kmh} km/h
                    </div>
                    {vehicle.is_delayed ? (
                      <div className="text-red-600 font-mono text-[10px] font-bold">
                        +{vehicle.delay_minutes} min delay
                      </div>
                    ) : (
                      <div className="text-green-600 font-mono text-[10px] font-medium">
                        On Schedule
                      </div>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="text-slate-800 font-medium text-xs">
                      {vehicle.destination}
                    </div>
                    <div className="text-slate-400 text-[10px] font-mono">
                      ETA: {vehicle.eta}
                    </div>
                  </td>

                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] uppercase font-mono ${
                        vehicle.status === 'in_transit'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : vehicle.status === 'rerouted'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : vehicle.status === 'stalled'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {(vehicle.status || 'active').replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() =>
                          onSelectOnMap(
                            vehicle.coordinates,
                            `${vehicle.vehicle_number || vehicle.registration_number || vehicle.vehicle_id} (${vehicle.driver_name || 'Driver'})`
                          )
                        }
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] border border-slate-200 font-semibold transition"
                        title="Locate vehicle on GIS Radar"
                      >
                        GIS Pin
                      </button>

                      <button
                        onClick={() => {
                          setRerouteModalVehicle(vehicle);
                          setSelectedAltRouteId(routes[1]?.id || routes[0]?.id || '');
                        }}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[11px] shadow-xs transition"
                        title="Issue Autonomous Reroute Order"
                      >
                        Reroute
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reroute Modal */}
      {rerouteModalVehicle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-lg p-5 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span>Issue Safe Corridor Reroute Dispatch</span>
              </h3>
              <button
                onClick={() => setRerouteModalVehicle(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1 text-slate-700 text-xs">
              <div>
                Target Unit:{' '}
                <strong className="text-blue-700">
                  {rerouteModalVehicle.vehicle_number} ({rerouteModalVehicle.driver_name})
                </strong>
              </div>
              <div>Cargo: {rerouteModalVehicle.cargo_type}</div>
              <div>Currently on: {rerouteModalVehicle.current_route_name}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Select Approved Alternate Corridor
                </label>
                <select
                  value={selectedAltRouteId}
                  onChange={(e) => setSelectedAltRouteId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.route_id} - {r.route_name} ({r.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Administrative Reroute Directive
                </label>
                <textarea
                  rows={2}
                  value={rerouteReason}
                  onChange={(e) => setRerouteReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="text-[11px] text-slate-500">
                This operation directly updates Supabase. In production, this pushes real-time turn-by-turn navigation alerts to the driver's User Mobile App.
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRerouteModalVehicle(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteReroute}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-xs transition"
                >
                  Transmit Reroute Order to Supabase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
