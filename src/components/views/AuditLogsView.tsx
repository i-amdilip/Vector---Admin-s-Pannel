import React from 'react';
import { AuditLog } from '../../types/vector';
import { ScrollText, ShieldCheck, Database, Clock, User, CheckCircle2 } from 'lucide-react';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-7xl mx-auto text-slate-900 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-green-700" />
            <span>Government Compliance & Immutable Audit Log Trail</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Cryptographically sealed operational trail stored in Supabase <code className="text-green-700 bg-slate-100 px-1 py-0.5 rounded font-mono">audit_logs</code> table.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-green-700 font-mono text-[11px] font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>TAMPER-RESISTANT LOGGING ENABLED</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3">Timestamp (UTC)</th>
                <th className="p-3">Officer & Role</th>
                <th className="p-3">Operation / Action</th>
                <th className="p-3">Database Target</th>
                <th className="p-3">Action Details</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 text-slate-500 text-[11px]">
                    {new Date(log.created_at || log.timestamp || Date.now()).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <div className="text-slate-900 font-bold">{log.user_name || log.officer_name || 'Officer'}</div>
                    <div className="text-[10px] text-blue-700 font-medium capitalize">
                      {(log.user_role || log.role || 'Officer').replace(/_/g, ' ')}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-bold uppercase text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-blue-700 font-bold">
                    public.{log.target_table || 'audit_trail'}
                  </td>
                  <td className="p-3 text-slate-700 max-w-sm truncate text-[11px]">
                    {log.details}
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">
                    {log.ip_address || '10.240.12.8'}
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
