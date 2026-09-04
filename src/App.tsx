import React, { useState, useEffect, useCallback } from 'react';
import {
  RouteItem,
  RiskZone,
  Incident,
  Vehicle,
  GovernmentOffice,
  PoliceStation,
  FireStation,
  RescueTeam,
  WeatherStationData,
  SystemAlert,
  AuditLog,
  UserProfile,
  UserRole,
  RouteStatus,
  RiskLevel,
  IncidentStatus,
} from './types/vector';
import { vectorDb, subscribeToTable } from './services/supabaseService';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { LiveMapView } from './components/views/LiveMapView';
import { RoutesView } from './components/views/RoutesView';
import { RiskZonesView } from './components/views/RiskZonesView';
import { IncidentsView } from './components/views/IncidentsView';
import { VehiclesView } from './components/views/VehiclesView';
import { EmergencyResourcesView } from './components/views/EmergencyResourcesView';
import { GovernmentOfficesView } from './components/views/GovernmentOfficesView';
import { WeatherView } from './components/views/WeatherView';
import { AlertsView } from './components/views/AlertsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ReportsView } from './components/views/ReportsView';
import { UserManagementView } from './components/views/UserManagementView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { IncidentResponseDemoModal } from './components/demo/IncidentResponseDemoModal';
import { SupabaseConfigModal } from './components/config/SupabaseConfigModal';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<NavView>('Dashboard');

  // Supabase Data Collections State
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [governmentOffices, setGovernmentOffices] = useState<GovernmentOffice[]>([]);
  const [policeStations, setPoliceStations] = useState<PoliceStation[]>([]);
  const [fireStations, setFireStations] = useState<FireStation[]>([]);
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherStationData[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // User State
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'usr-admin-01',
    email: 'special.director@vector.ner.gov.in',
    full_name: 'Dr. A. K. Baruah, IAS',
    role: 'super_admin',
    state: 'Assam',
    district: 'Kamrup Metro',
    department: 'North Eastern Regional Disaster Logistics Command',
    phone_number: '+91 361 223 8899',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Modals
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [selectedRouteForMap, setSelectedRouteForMap] = useState<RouteItem | null>(null);

  // Load all collections from Supabase Service
  const loadAllData = useCallback(async () => {
    try {
      const [
        r,
        rz,
        inc,
        v,
        go,
        ps,
        fs,
        rt,
        w,
        alt,
        logs,
      ] = await Promise.all([
        vectorDb.getRoutes(),
        vectorDb.getRiskZones(),
        vectorDb.getIncidents(),
        vectorDb.getVehicles(),
        vectorDb.getGovernmentOffices(),
        vectorDb.getPoliceStations(),
        vectorDb.getFireStations(),
        vectorDb.getRescueTeams(),
        vectorDb.getWeatherData(),
        vectorDb.getAlerts(),
        vectorDb.getAuditLogs(),
      ]);

      setRoutes(r);
      setRiskZones(rz);
      setIncidents(inc);
      setVehicles(v);
      setGovernmentOffices(go);
      setPoliceStations(ps);
      setFireStations(fs);
      setRescueTeams(rt);
      setWeatherData(w);
      setAlerts(alt);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Error loading Supabase collections:', err);
    }
  }, []);

  useEffect(() => {
    loadAllData();

    // Subscribe to Supabase Realtime updates
    const unsubRoutes = subscribeToTable('routes', () => {
      vectorDb.getRoutes().then(setRoutes);
    });
    const unsubIncidents = subscribeToTable('incidents', () => {
      vectorDb.getIncidents().then(setIncidents);
    });
    const unsubVehicles = subscribeToTable('vehicles', () => {
      vectorDb.getVehicles().then(setVehicles);
    });
    const unsubAlerts = subscribeToTable('alerts', () => {
      vectorDb.getAlerts().then(setAlerts);
    });

    return () => {
      unsubRoutes();
      unsubIncidents();
      unsubVehicles();
      unsubAlerts();
    };
  }, [loadAllData]);

  // Actions
  const handleCreateRoute = async (routeData: any) => {
    await vectorDb.createRoute(routeData);
    await loadAllData();
  };

  const handleUpdateRouteStatus = async (
    routeId: string,
    status: RouteStatus,
    riskLevel?: RiskLevel,
    delayMinutes?: number
  ) => {
    await vectorDb.updateRouteStatus(routeId, status, riskLevel, delayMinutes);
    await loadAllData();
  };

  const handleCreateRiskZone = async (zoneData: any) => {
    await vectorDb.createRiskZone(zoneData);
    await loadAllData();
  };

  const handleToggleRiskZone = async (zoneId: string, currentActive: boolean) => {
    await vectorDb.toggleRiskZone(zoneId, !currentActive);
    await loadAllData();
  };

  const handleCreateIncident = async (incidentData: any) => {
    await vectorDb.createIncident(incidentData);
    await loadAllData();
  };

  const handleUpdateIncidentStatus = async (incidentId: string, status: IncidentStatus) => {
    await vectorDb.updateIncidentStatus(incidentId, status);
    await loadAllData();
  };

  const handleAssignRescueTeam = async (incidentId: string, teamId: string, teamName: string) => {
    await vectorDb.assignRescueTeam(incidentId, teamId, teamName);
    await loadAllData();
  };

  const handleBlockRouteDirectly = async (routeId: string) => {
    await vectorDb.updateRouteStatus(routeId, 'blocked', 'critical', 300);
    await loadAllData();
  };

  const handleRerouteVehicle = async (
    vehicleId: string,
    alternateRouteId: string,
    alternateRouteName: string,
    reason: string
  ) => {
    await vectorDb.rerouteVehicle(vehicleId, alternateRouteId, alternateRouteName, reason);
    await loadAllData();
  };

  const handleCreateAlert = async (alertData: any) => {
    await vectorDb.createAlert(alertData);
    await loadAllData();
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    await vectorDb.acknowledgeAlert(alertId);
    await loadAllData();
  };

  const handleSwitchUserRole = (role: UserRole) => {
    setCurrentUser((prev) => ({ ...prev, role }));
  };

  const handleSelectRouteForMap = (route: RouteItem) => {
    setSelectedRouteForMap(route);
    setCurrentView('Live Map');
  };

  const handleSelectOnMap = (coords: [number, number], title: string) => {
    setCurrentView('Live Map');
  };

  const handleUpdateRescueStatus = async (
    teamId: string,
    status: 'standby' | 'deployed' | 'returning' | 'off_duty'
  ) => {
    await vectorDb.updateRescueTeamStatus(teamId, status);
    await loadAllData();
  };

  const handleCreateOffice = async (officeData: any) => {
    await vectorDb.createGovernmentOffice(officeData);
    await loadAllData();
  };

  // Trigger weather warning alert
  const handleTriggerWeatherAlert = async (station: WeatherStationData) => {
    await vectorDb.createAlert({
      alert_id: `ALT-WX-${Math.floor(100 + Math.random() * 900)}`,
      category: station.landslide_risk_index >= 70 ? 'critical' : 'high',
      title: `WEATHER WARNING: ${station.location_name}`,
      message: `Extreme precipitation (${station.rainfall_mm_per_hour} mm/hr) recorded. Landslide Threat Index at ${station.landslide_risk_index}/100. Highway transit advisory in effect.`,
      affected_district: `${station.district}, ${station.state}`,
    });
    await loadAllData();
  };

  // Counts for Badges
  const blockedRoutesCount = routes.filter((r) => r.status === 'blocked').length;
  const activeIncidentsCount = incidents.filter(
    (i) => i.status !== 'resolved' && i.status !== 'closed'
  ).length;
  const criticalAlertsCount = alerts.filter(
    (a) => a.category === 'critical' && !a.acknowledged
  ).length;
  const activeVehiclesCount = vehicles.filter(
    (v) => v.status === 'in_transit' || v.status === 'rerouted'
  ).length;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* Government Command Header */}
      <Navbar
        user={currentUser}
        alerts={alerts}
        onOpenDemoFlow={() => setIsDemoModalOpen(true)}
        onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
        onNavigate={(v) => setCurrentView(v as NavView)}
      />

      {/* Main App Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar Navigation */}
        <Sidebar
          currentView={currentView}
          onSelectView={(v) => {
            if (v === 'Settings') {
              setIsSupabaseModalOpen(true);
            } else {
              setCurrentView(v);
            }
          }}
          blockedRoutesCount={blockedRoutesCount}
          activeIncidentsCount={activeIncidentsCount}
          criticalAlertsCount={criticalAlertsCount}
          activeVehiclesCount={activeVehiclesCount}
        />

        {/* Center Main Workspace */}
        <main className="flex-1 overflow-y-auto bg-slate-100 text-slate-900">
          {currentView === 'Dashboard' && (
            <DashboardView
              routes={routes}
              riskZones={riskZones}
              incidents={incidents}
              vehicles={vehicles}
              governmentOffices={governmentOffices}
              policeStations={policeStations}
              fireStations={fireStations}
              rescueTeams={rescueTeams}
              weatherData={weatherData}
              alerts={alerts}
              onNavigate={(v) => setCurrentView(v as NavView)}
              onSelectRoute={handleSelectRouteForMap}
              onVerifyIncident={(incId) => {
                handleUpdateIncidentStatus(incId, 'verified');
                setCurrentView('Incidents');
              }}
            />
          )}

          {currentView === 'Live Map' && (
            <LiveMapView
              routes={routes}
              riskZones={riskZones}
              incidents={incidents}
              vehicles={vehicles}
              governmentOffices={governmentOffices}
              policeStations={policeStations}
              fireStations={fireStations}
              rescueTeams={rescueTeams}
              weatherData={weatherData}
              onSelectRoute={(r) => setSelectedRouteForMap(r)}
              onSelectIncident={(inc) => {
                setCurrentView('Incidents');
              }}
              onBlockRoute={handleBlockRouteDirectly}
              onReopenRoute={(id) => handleUpdateRouteStatus(id, 'open', 'low', 0)}
            />
          )}

          {currentView === 'Routes' && (
            <RoutesView
              routes={routes}
              onCreateRoute={handleCreateRoute}
              onUpdateStatus={handleUpdateRouteStatus}
              onSelectOnMap={handleSelectRouteForMap}
            />
          )}

          {currentView === 'Risk Zones' && (
            <RiskZonesView
              riskZones={riskZones}
              onCreateRiskZone={handleCreateRiskZone}
              onToggleActive={handleToggleRiskZone}
            />
          )}

          {currentView === 'Incidents' && (
            <IncidentsView
              incidents={incidents}
              rescueTeams={rescueTeams}
              routes={routes}
              onUpdateStatus={handleUpdateIncidentStatus}
              onAssignTeam={handleAssignRescueTeam}
              onBlockRoute={handleBlockRouteDirectly}
              onCreateIncident={handleCreateIncident}
            />
          )}

          {currentView === 'Vehicles' && (
            <VehiclesView
              vehicles={vehicles}
              routes={routes}
              onRerouteVehicle={handleRerouteVehicle}
              onSelectOnMap={handleSelectOnMap}
            />
          )}

          {currentView === 'Emergency Resources' && (
            <EmergencyResourcesView
              policeStations={policeStations}
              fireStations={fireStations}
              rescueTeams={rescueTeams}
              incidents={incidents}
              onUpdateRescueStatus={handleUpdateRescueStatus}
              onSelectOnMap={handleSelectOnMap}
            />
          )}

          {currentView === 'Government Offices' && (
            <GovernmentOfficesView
              offices={governmentOffices}
              onCreateOffice={handleCreateOffice}
              onSelectOnMap={handleSelectOnMap}
            />
          )}

          {currentView === 'Weather' && (
            <WeatherView
              weatherData={weatherData}
              onTriggerAlert={handleTriggerWeatherAlert}
              onSelectOnMap={handleSelectOnMap}
            />
          )}

          {currentView === 'Alerts' && (
            <AlertsView
              alerts={alerts}
              onCreateAlert={handleCreateAlert}
              onAcknowledgeAlert={handleAcknowledgeAlert}
            />
          )}

          {currentView === 'Analytics' && (
            <AnalyticsView
              routes={routes}
              incidents={incidents}
              vehicles={vehicles}
              weatherData={weatherData}
            />
          )}

          {currentView === 'Reports' && (
            <ReportsView
              routes={routes}
              incidents={incidents}
              vehicles={vehicles}
            />
          )}

          {currentView === 'User Management' && (
            <UserManagementView
              currentUser={currentUser}
              onSwitchUserRole={handleSwitchUserRole}
            />
          )}

          {currentView === 'Audit Logs' && (
            <AuditLogsView logs={auditLogs} />
          )}
        </main>
      </div>

      {/* Primary Hackathon Demonstration Modal */}
      <IncidentResponseDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        routes={routes}
        incidents={incidents}
        vehicles={vehicles}
        onRefresh={loadAllData}
        onViewRoute={(rId) => {
          const r = routes.find((item) => item.id === rId);
          if (r) handleSelectRouteForMap(r);
        }}
      />

      {/* Supabase Schema & Credentials Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onDataReset={loadAllData}
      />
    </div>
  );
}
