import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types/vector';
import {
  Users,
  Shield,
  UserCheck,
  Plus,
  KeyRound,
  Building,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface UserManagementViewProps {
  currentUser: UserProfile;
  onSwitchUserRole: (role: UserRole) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  onSwitchUserRole,
}) => {
  const [users, setUsers] = useState<UserProfile[]>([
    currentUser,
    {
      id: 'usr-02',
      email: 'p.lyngdoh@police.gov.in',
      full_name: 'Inspector P. Lyngdoh',
      role: 'police_officer',
      state: 'Meghalaya',
      district: 'East Jaintia Hills',
      department: 'Meghalaya State Highway Police',
      phone_number: '+91 98620 11223',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'usr-03',
      email: 'capt.d.sharma@ndrf.gov.in',
      full_name: 'Capt. D. Sharma',
      role: 'rescue_officer',
      state: 'Assam',
      district: 'Kamrup Metro',
      department: 'NDRF 1st Battalion Patgaon',
      phone_number: '+91 94350 44556',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'usr-04',
      email: 't.jamir@disaster.nagaland.gov.in',
      full_name: 'T. Jamir, NCS',
      role: 'district_officer',
      state: 'Nagaland',
      district: 'Kohima',
      department: 'Kohima District Emergency Authority',
      phone_number: '+91 94360 77889',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'usr-05',
      email: 'k.gogoi.field@ner.gov.in',
      full_name: 'K. Gogoi',
      role: 'field_officer',
      state: 'Assam',
      district: 'Cachar',
      department: 'Field Highway Hazard Inspection Team',
      phone_number: '+91 98640 99001',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'super_admin', label: 'Super Admin', desc: 'Complete access to all 8 NER states, corridor closures & AI config.' },
    { role: 'state_admin', label: 'State Admin', desc: 'State-level oversight, road approvals, and department coordination.' },
    { role: 'district_officer', label: 'District Officer', desc: 'District Collectorate jurisdiction and checkpoint traffic control.' },
    { role: 'police_officer', label: 'Police Officer', desc: 'Traffic escort deployment, roadblock enforcement, and field verifications.' },
    { role: 'rescue_officer', label: 'Rescue Squad Officer', desc: 'NDRF / SDRF team dispatch, heavy earthmoving equipment deployment.' },
    { role: 'field_officer', label: 'Field Officer', desc: 'Immediate incident reporting with geo-tagged photographic evidence.' },
    { role: 'driver', label: 'Commercial Driver (Mobile Persona)', desc: 'Consumes real-time safe route navigation & emergency alerts.' },
  ];

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-7xl mx-auto text-slate-900 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Role-Based Access Control (RBAC) & Personnel Directory</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Governed by Supabase Auth and PostgreSQL Row Level Security (RLS) policies defined in <code className="text-blue-700 bg-slate-100 px-1 py-0.5 rounded font-mono">profiles</code> table.
          </p>
        </div>
      </div>

      {/* Live Persona Switcher */}
      <div className="bg-white border border-slate-200 rounded shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
              Test Different Government Personas (Live RBAC Switcher)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-green-700 font-medium">
            Current Persona: <strong className="uppercase">{(currentUser?.role || 'super_admin').replace(/_/g, ' ')}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {rolesList.map((r) => {
            const isCurrent = currentUser.role === r.role;
            return (
              <button
                key={r.role}
                onClick={() => onSwitchUserRole(r.role)}
                className={`p-2.5 rounded border text-left transition ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs mb-1">
                  <span>{r.label}</span>
                  {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                  {r.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider font-mono text-[11px]">
          Registered Government Officials (Supabase 'profiles' collection)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                <th className="p-3">Officer Name & ID</th>
                <th className="p-3">RBAC Role</th>
                <th className="p-3">Jurisdiction</th>
                <th className="p-3">Department</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 text-xs">{u.full_name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[10px] uppercase bg-blue-50 text-blue-800 border border-blue-200">
                      {(u.role || 'user').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="text-slate-800">{u.district}</div>
                    <div className="text-slate-500 text-[10px]">{u.state}</div>
                  </td>
                  <td className="p-3 text-slate-700">{u.department}</td>
                  <td className="p-3 font-mono text-slate-600">{u.phone_number}</td>
                  <td className="p-3">
                    <span className="text-green-700 font-mono text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
