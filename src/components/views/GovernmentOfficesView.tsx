import React, { useState } from 'react';
import { GovernmentOffice, OfficeType } from '../../types/vector';
import {
  Building2,
  Plus,
  MapPin,
  Clock,
  Phone,
  Users,
  Search,
  Filter,
} from 'lucide-react';

interface GovernmentOfficesViewProps {
  offices: GovernmentOffice[];
  onCreateOffice: (office: Omit<GovernmentOffice, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  onSelectOnMap: (coords: [number, number], title: string) => void;
}

export const GovernmentOfficesView: React.FC<GovernmentOfficesViewProps> = ({
  offices,
  onCreateOffice,
  onSelectOnMap,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    office_type: 'emergency_control_room' as OfficeType,
    state: 'Assam',
    district: 'Kamrup Metro',
    address: 'Secretariat Complex, Dispur',
    contact_number: '+91 361 223 7000',
    operating_hours: '24x7 Emergency Active',
    officials_count: 24,
    coordinates: '91.789, 26.143',
  });

  const filtered = offices.filter((o) => {
    const matchSearch =
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || o.office_type === filterType;
    return matchSearch && matchType;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const [lng, lat] = formData.coordinates.split(',').map((s) => Number(s.trim()));
    await onCreateOffice({
      name: formData.name,
      office_type: formData.office_type,
      state: formData.state,
      district: formData.district,
      address: formData.address,
      contact_number: formData.contact_number,
      operating_hours: formData.operating_hours,
      officials_count: Number(formData.officials_count),
      coordinates: [lng || 91.78, lat || 26.14],
      is_active: true,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-7xl mx-auto text-slate-900 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span>Government Headquarters, Control Desks & Transit Checkposts</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            District Collectorates, State Emergency Operation Centres (SEOC), and inter-state permit checkposts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Government Office</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by office name, district, or state..."
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
            <option value="all">All Facilities ({offices.length})</option>
            <option value="emergency_control_room">Emergency Control Room (SEOC/DEOC)</option>
            <option value="district_office">District Collectorate</option>
            <option value="transport_office">Transport Office (DTO)</option>
            <option value="border_checkpost">Border / Transit Checkpost</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((office) => (
          <div
            key={office.id}
            className="bg-white border border-slate-200 rounded shadow-xs p-3.5 flex flex-col justify-between hover:border-slate-300 transition space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-600">
                  {(office.office_type || 'office').replace(/_/g, ' ')}
                </span>
                <span className="bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
                  ACTIVE
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">{office.name}</h3>
              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{office.address}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1.5 text-[11px] text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Jurisdiction:</span>
                <span className="text-slate-900 font-medium">
                  {office.district}, {office.state}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operating Schedule:</span>
                <span className="text-blue-700 font-mono font-medium">{office.operating_hours}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Officials on Duty:</span>
                <span className="font-mono font-bold text-slate-900">{office.officials_count} Personnel</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono text-slate-800">{office.contact_number}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => onSelectOnMap(office.coordinates, office.name)}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[11px] shadow-xs transition"
              >
                Locate Facility
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-lg p-5 shadow-2xl space-y-4 text-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" /> Register Government Office / Gate
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Office Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. East Khasi Hills Emergency Control Center"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Office Classification</label>
                  <select
                    value={formData.office_type}
                    onChange={(e) => setFormData({ ...formData, office_type: e.target.value as OfficeType })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="emergency_control_room">Emergency Control Room</option>
                    <option value="district_office">District Office / Collectorate</option>
                    <option value="transport_office">District Transport Office (DTO)</option>
                    <option value="border_checkpost">Border Transit Checkpost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Assam">Assam</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Tripura">Tripura</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Coordinates (lng, lat)</label>
                  <input
                    type="text"
                    required
                    value={formData.coordinates}
                    onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Physical Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Duty Personnel Count</label>
                  <input
                    type="number"
                    value={formData.officials_count}
                    onChange={(e) => setFormData({ ...formData, officials_count: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
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
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow-xs transition"
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
