import React, { useState } from 'react';
import { RiskZone, RiskZoneType, RiskLevel } from '../../types/vector';
import {
  AlertTriangle,
  Plus,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Flame,
  CloudRain,
  Mountain,
} from 'lucide-react';

interface RiskZonesViewProps {
  riskZones: RiskZone[];
  onCreateRiskZone: (zone: Omit<RiskZone, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  onToggleActive: (zoneId: string, current: boolean) => Promise<any>;
}

export const RiskZonesView: React.FC<RiskZonesViewProps> = ({
  riskZones,
  onCreateRiskZone,
  onToggleActive,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    zone_id: '',
    name: '',
    zone_type: 'landslide' as RiskZoneType,
    severity: 'high' as RiskLevel,
    state: 'Meghalaya',
    district: 'East Jaintia Hills',
    coordinates_polygon: '92.34, 25.12; 92.38, 25.12; 92.38, 25.15; 92.34, 25.15',
    affected_routes: 'rt-nh-06',
    department: 'Geological Survey of India & SDRF',
    description: '',
    photo_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const polygonCoords: [number, number][] = formData.coordinates_polygon
      .split(';')
      .map((p) => {
        const [lng, lat] = p.trim().split(',').map(Number);
        return [lng || 92.3, lat || 25.1];
      });

    await onCreateRiskZone({
      zone_id: formData.zone_id.toUpperCase() || `RZ-NER-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name,
      zone_type: formData.zone_type,
      severity: formData.severity,
      state: formData.state,
      district: formData.district,
      coordinates_polygon: polygonCoords,
      affected_routes: formData.affected_routes.split(',').map((s) => s.trim()),
      department: formData.department,
      description: formData.description,
      is_active: true,
      evidence_photo_url: formData.photo_url,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-7xl mx-auto text-slate-900 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>NER Geospatial Risk Zone Geofencing & Monitoring</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            PostGIS spatial hazard zones monitoring active landslide chutes, flood plains, and erosion gullies.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Risk Zone</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {riskZones.map((zone) => (
          <div
            key={zone.id}
            className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden flex flex-col hover:border-slate-300 transition"
          >
            {zone.evidence_photo_url && (
              <div className="h-32 w-full overflow-hidden relative">
                <img
                  src={zone.evidence_photo_url}
                  alt={zone.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                      zone.severity === 'critical'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : zone.severity === 'high'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}
                  >
                    {zone.severity}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                    {zone.zone_id || zone.id}
                  </span>
                </div>
              </div>
            )}

            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider font-mono">
                    {(zone.zone_type || zone.type || 'hazard').replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      zone.is_active !== false && zone.status !== 'cleared'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {zone.is_active !== false && zone.status !== 'cleared' ? 'ACTIVE GEOFENCE' : 'INACTIVE'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-1">{zone.name || zone.risk_name}</h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {zone.description}
                </p>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="text-slate-800 font-medium">
                    {zone.district}, {zone.state}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Monitoring Dept:</span>
                  <span className="text-slate-800 truncate max-w-[140px] font-medium">
                    {zone.department}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Polygon Vertices:</span>
                  <span className="text-blue-700 font-mono font-medium">
                    {zone.coordinates_polygon.length} Geo Points
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => onToggleActive(zone.id, zone.is_active)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                    zone.is_active
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-xs'
                  }`}
                >
                  {zone.is_active ? 'Deactivate Geofence' : 'Activate Geofence'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-xl p-5 shadow-2xl space-y-4 text-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" /> Define New Hazard Risk Zone
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Zone Code</label>
                  <input
                    type="text"
                    placeholder="RZ-MEGH-01"
                    value={formData.zone_id}
                    onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hazard Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sela Pass Avalanche Funnel"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hazard Type</label>
                  <select
                    value={formData.zone_type}
                    onChange={(e) => setFormData({ ...formData, zone_type: e.target.value as RiskZoneType })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="landslide">Landslide / Mudflow</option>
                    <option value="flood">Flash Flood Plain</option>
                    <option value="heavy_rain">High Precipitation Basin</option>
                    <option value="road_damage">Subsidence / Structural Damage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as RiskLevel })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  PostGIS Polygon Coordinates (lng, lat separated by semicolons)
                </label>
                <input
                  type="text"
                  required
                  value={formData.coordinates_polygon}
                  onChange={(e) => setFormData({ ...formData, coordinates_polygon: e.target.value })}
                  placeholder="92.34, 25.12; 92.38, 25.12; 92.38, 25.15; 92.34, 25.15"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Monitoring Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description & Geological History</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow-xs transition"
                >
                  Save to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
