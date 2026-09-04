import React, { useState } from 'react';
import { SystemAlert, AlertCategory } from '../../types/vector';
import {
  Bell,
  Plus,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Radio,
  Send,
  Trash2,
  ShieldAlert,
} from 'lucide-react';

interface AlertsViewProps {
  alerts: SystemAlert[];
  onCreateAlert: (alert: Omit<SystemAlert, 'id' | 'created_at' | 'acknowledged'>) => Promise<any>;
  onAcknowledgeAlert: (alertId: string) => Promise<any>;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onCreateAlert,
  onAcknowledgeAlert,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'critical' as AlertCategory,
    affected_district: 'East Jaintia Hills, Meghalaya',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateAlert({
      alert_id: `ALT-MANUAL-${Math.floor(100 + Math.random() * 900)}`,
      title: formData.title,
      message: formData.message,
      category: formData.category,
      affected_district: formData.affected_district,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-7xl mx-auto text-slate-900 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-600" />
            <span>Emergency Broadcast Network & Alert Notification Center</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Broadcast life-safety warnings, landslide flash bulletins, and route closures to all disaster cells and the shared mobile app layer.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow-xs transition active:scale-95"
        >
          <Radio className="w-4 h-4" />
          <span>Broadcast Public Alert</span>
        </button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const isCritical = alert.category === 'critical';
          const isHigh = alert.category === 'high';
          return (
            <div
              key={alert.id}
              className={`p-3.5 rounded border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                alert.acknowledged
                  ? 'bg-slate-50 border-slate-200 text-slate-500'
                  : isCritical
                  ? 'bg-red-50/70 border-red-200 text-slate-900 shadow-xs'
                  : isHigh
                  ? 'bg-amber-50/70 border-amber-200 text-slate-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-800 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div
                  className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                    isCritical
                      ? 'bg-red-600 text-white'
                      : isHigh
                      ? 'bg-amber-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {isCritical ? (
                    <AlertOctagon className="w-4 h-4" />
                  ) : isHigh ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                        isCritical
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : isHigh
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-blue-100 text-blue-900 border border-blue-200'
                      }`}
                    >
                      {alert.category}
                    </span>
                    <span className="font-mono text-[10px] text-blue-700 font-bold">
                      {alert.alert_id}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs">{alert.title}</h3>
                  </div>

                  <p className="text-[11px] text-slate-700">{alert.message}</p>

                  <div className="text-[10px] text-slate-500 flex items-center gap-3 pt-0.5">
                    {alert.affected_district && <span>Jurisdiction: {alert.affected_district}</span>}
                    <span>Timestamp: {new Date(alert.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {alert.acknowledged ? (
                  <span className="text-[11px] text-green-700 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Acknowledged
                  </span>
                ) : (
                  <button
                    onClick={() => onAcknowledgeAlert(alert.id)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded text-[11px] shadow-xs transition"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Broadcast Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-lg p-5 shadow-2xl space-y-4 text-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-600" /> Dispatch Emergency Public Broadcast
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
                <label className="block text-slate-700 font-semibold mb-1">Alert Classification</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as AlertCategory })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="critical">CRITICAL (Immediate Evacuation / Route Lockdown)</option>
                  <option value="high">HIGH (Severe Weather / Landslide Hazard)</option>
                  <option value="warning">WARNING (Traffic Delay / Reduced Speed)</option>
                  <option value="info">INFO (General Highway Advisory)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Broadcast Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH CLOSURE: NH-06 Sonapur Inundation"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Affected Region / District</label>
                <input
                  type="text"
                  required
                  value={formData.affected_district}
                  onChange={(e) => setFormData({ ...formData, affected_district: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Public Alert Body</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Official instructions for drivers, transporters, and district administration..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-xs transition"
                >
                  Push Real-Time Alert to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
