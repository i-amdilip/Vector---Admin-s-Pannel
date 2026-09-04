import React from 'react';
import {
  LayoutDashboard,
  Map as MapIcon,
  Route as RouteIcon,
  AlertTriangle,
  AlertOctagon,
  Truck,
  LifeBuoy,
  Building2,
  CloudRain,
  Bell,
  BarChart3,
  FileText,
  Users,
  ScrollText,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';

export type NavView =
  | 'Dashboard'
  | 'Live Map'
  | 'Routes'
  | 'Risk Zones'
  | 'Incidents'
  | 'Vehicles'
  | 'Emergency Resources'
  | 'Government Offices'
  | 'Weather'
  | 'Alerts'
  | 'Analytics'
  | 'Reports'
  | 'User Management'
  | 'Audit Logs'
  | 'Settings';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  blockedRoutesCount: number;
  activeIncidentsCount: number;
  criticalAlertsCount: number;
  activeVehiclesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  blockedRoutesCount,
  activeIncidentsCount,
  criticalAlertsCount,
  activeVehiclesCount,
}) => {
  const navItems: {
    id: NavView;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
    section?: string;
  }[] = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'COMMAND' },
    { id: 'Live Map', label: 'Live GIS Map', icon: MapIcon, section: 'COMMAND' },
    { id: 'Routes', label: 'Routes & Corridors', icon: RouteIcon, badge: blockedRoutesCount > 0 ? `${blockedRoutesCount} Blocked` : undefined, badgeColor: 'bg-rose-950 text-rose-300 border border-rose-800' },
    { id: 'Risk Zones', label: 'Risk Zones', icon: AlertTriangle },
    { id: 'Incidents', label: 'Incidents', icon: AlertOctagon, badge: activeIncidentsCount > 0 ? activeIncidentsCount : undefined, badgeColor: 'bg-amber-950 text-amber-300 border border-amber-800' },
    { id: 'Vehicles', label: 'Vehicle Tracking', icon: Truck, badge: activeVehiclesCount, badgeColor: 'bg-cyan-950 text-cyan-300 border border-cyan-800' },
    
    { id: 'Emergency Resources', label: 'Emergency Teams', icon: LifeBuoy, section: 'LOGISTICS & ASSETS' },
    { id: 'Government Offices', label: 'Govt Offices & Gates', icon: Building2 },
    { id: 'Weather', label: 'Weather Intelligence', icon: CloudRain },
    { id: 'Alerts', label: 'Alert Center', icon: Bell, badge: criticalAlertsCount > 0 ? criticalAlertsCount : undefined, badgeColor: 'bg-red-600 text-white font-bold animate-pulse' },
    
    { id: 'Analytics', label: 'Analytics & Trends', icon: BarChart3, section: 'INTELLIGENCE & ADMIN' },
    { id: 'Reports', label: 'Government Reports', icon: FileText },
    { id: 'User Management', label: 'User & Roles (RBAC)', icon: Users },
    { id: 'Audit Logs', label: 'Audit Compliance', icon: ScrollText },
    { id: 'Settings', label: 'Supabase & Settings', icon: Settings },
  ];

  return (
    <aside className="w-[240px] bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 select-none z-20 h-full border-r border-slate-800">
      {/* Sidebar header tag */}
      <div className="p-4 bg-slate-950 border-b border-slate-800">
        <h1 className="text-white font-bold tracking-widest text-base mb-0.5 font-mono">VECTOR</h1>
        <p className="text-[10px] uppercase text-slate-400 leading-tight tracking-wider">Govt. Command Dashboard</p>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const showSection = item.section && (idx === 0 || navItems[idx - 1]?.section !== item.section);

          return (
            <React.Fragment key={item.id}>
              {showSection && (
                <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {item.section}
                </div>
              )}
              <button
                id={`nav-${item.id.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2 cursor-pointer transition-colors text-xs text-left ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {isActive ? (
                    <span className="w-2 h-2 rounded-full bg-white shrink-0" />
                  ) : (
                    <span className="w-2 h-2 border border-slate-600 rounded-full shrink-0" />
                  )}
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0 ml-1.5 ${
                      isActive
                        ? 'bg-white text-blue-800'
                        : item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* User Card Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <div className="flex items-center">
          <div className="w-7 h-7 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
            AB
          </div>
          <div className="ml-2.5 min-w-0">
            <p className="text-xs font-medium text-white truncate">Dr. A. K. Baruah, IAS</p>
            <p className="text-[10px] text-slate-400 truncate">NER Command Director</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
