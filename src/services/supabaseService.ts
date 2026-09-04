import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
  RouteUpdate,
  SystemAlert,
  AuditLog,
  UserProfile,
} from '../types/vector';
import {
  INITIAL_ROUTES,
  INITIAL_RISK_ZONES,
  INITIAL_INCIDENTS,
  INITIAL_VEHICLES,
  INITIAL_GOVERNMENT_OFFICES,
  INITIAL_POLICE_STATIONS,
  INITIAL_FIRE_STATIONS,
  INITIAL_RESCUE_TEAMS,
  INITIAL_WEATHER_DATA,
  INITIAL_ROUTE_UPDATES,
  INITIAL_ALERTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_USER,
} from '../data/nerSeedData';

// Storage keys
const STORAGE_PREFIX = 'vector_supabase_';
const SUPABASE_CONFIG_KEY = 'vector_supabase_config';

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Get configured credentials from env or user storage
export const getSupabaseConfig = (): SupabaseConfig => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.url && parsed.anonKey) return parsed;
      } catch {
        // fallback
      }
    }
  }

  return {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || '',
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
  };
};

export const saveSupabaseConfig = (config: SupabaseConfig) => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  }
  initClient();
};

let supabaseInstance: SupabaseClient | null = null;

const initClient = () => {
  const config = getSupabaseConfig();
  if (config.url && config.anonKey && config.url.startsWith('https://')) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
      console.log('⚡ Connected to Supabase Cloud:', config.url);
    } catch (err) {
      console.warn('Could not initialize live Supabase client, falling back to local PostGIS simulator:', err);
      supabaseInstance = null;
    }
  } else {
    supabaseInstance = null;
  }
};

initClient();

export const isLiveSupabaseConnected = (): boolean => {
  const cfg = getSupabaseConfig();
  return Boolean(cfg.url && cfg.anonKey && cfg.url.startsWith('https://') && supabaseInstance);
};

export const getActiveSupabaseClient = () => supabaseInstance;

// Realtime Event Dispatcher for local fallback & instant UI reactivity
type TableEventCallback = (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: any; old?: any }) => void;
const listeners: Record<string, Set<TableEventCallback>> = {};

export const subscribeToTable = (table: string, callback: TableEventCallback) => {
  if (!listeners[table]) {
    listeners[table] = new Set();
  }
  listeners[table].add(callback);

  // If live Supabase is connected, subscribe via Supabase Realtime Channel
  if (supabaseInstance) {
    const channel = supabaseInstance
      .channel(`realtime_${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          callback({
            eventType: payload.eventType as any,
            new: payload.new,
            old: payload.old,
          });
        }
      )
      .subscribe();

    return () => {
      listeners[table]?.delete(callback);
      supabaseInstance?.removeChannel(channel);
    };
  }

  return () => {
    listeners[table]?.delete(callback);
  };
};

const notifyListeners = (table: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE', data: any, oldData?: any) => {
  listeners[table]?.forEach((cb) => {
    try {
      cb({ eventType, new: data, old: oldData });
    } catch (e) {
      console.error(e);
    }
  });
};

// Local storage persistent database helper
const getStoredCollection = <T>(key: string, initialData: T[]): T[] => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return initialData;
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (!stored) {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(initialData));
      return initialData;
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return initialData;

    // Normalize legacy objects if present
    if (key === 'risk_zones') {
      return parsed.map((item: any) => ({
        ...item,
        zone_type: item.zone_type || item.type || 'landslide',
        type: item.type || item.zone_type || 'landslide',
        name: item.name || item.risk_name || 'Risk Zone',
        risk_name: item.risk_name || item.name || 'Risk Zone',
        zone_id: item.zone_id || item.id,
        is_active: item.is_active !== undefined ? item.is_active : item.status !== 'cleared',
      })) as T[];
    }

    if (key === 'audit_logs') {
      return parsed.map((item: any) => ({
        ...item,
        user_role: item.user_role || item.role || 'super_admin',
        role: item.role || item.user_role || 'super_admin',
        user_name: item.user_name || item.officer_name || 'Command Officer',
        officer_name: item.officer_name || item.user_name || 'Command Officer',
        created_at: item.created_at || item.timestamp || new Date().toISOString(),
        timestamp: item.timestamp || item.created_at || new Date().toISOString(),
        target_table: item.target_table || 'system',
      })) as T[];
    }

    if (key === 'vehicles') {
      return parsed.map((item: any) => ({
        ...item,
        vehicle_number: item.vehicle_number || item.registration_number || item.vehicle_id || 'VEH-001',
        driver_name: item.driver_name || 'Assigned Driver',
        status: item.status || 'in_transit',
        vehicle_type: item.vehicle_type || 'Transport',
      })) as T[];
    }

    return parsed;
  } catch {
    return initialData;
  }
};

const setStoredCollection = <T>(key: string, data: T[]) => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  }
};

// ==========================================
// VECTOR SUPABASE DATABASE SERVICE INTERFACE
// ==========================================

export const vectorDb = {
  // Current Officer Session Profile
  getCurrentUser: async (): Promise<UserProfile> => {
    return INITIAL_USER;
  },

  // 1. ROUTES (CRUD & Geometry)
  getRoutes: async (): Promise<RouteItem[]> => {
    if (supabaseInstance) {
      const { data, error } = await supabaseInstance.from('routes').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as RouteItem[];
    }
    return getStoredCollection<RouteItem>('routes', INITIAL_ROUTES);
  },

  createRoute: async (route: Omit<RouteItem, 'id' | 'created_at' | 'updated_at'>): Promise<RouteItem> => {
    const newRoute: RouteItem = {
      ...route,
      id: 'rt-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabaseInstance) {
      await supabaseInstance.from('routes').insert([newRoute]);
    }

    const current = getStoredCollection<RouteItem>('routes', INITIAL_ROUTES);
    const updated = [newRoute, ...current];
    setStoredCollection('routes', updated);
    notifyListeners('routes', 'INSERT', newRoute);

    // Audit log
    await vectorDb.logAudit({
      officer_name: INITIAL_USER.full_name,
      role: INITIAL_USER.role,
      action: 'ROUTE_CREATED',
      details: `Created new corridor ${newRoute.route_name} (${newRoute.starting_point} → ${newRoute.destination})`,
      affected_entity_type: 'route',
      affected_entity_id: newRoute.id,
    });

    return newRoute;
  },

  updateRouteStatus: async (routeId: string, status: RouteItem['status'], riskLevel?: RouteItem['risk_level'], delayMinutes?: number): Promise<RouteItem | null> => {
    const current = getStoredCollection<RouteItem>('routes', INITIAL_ROUTES);
    const idx = current.findIndex((r) => r.id === routeId);
    if (idx === -1) return null;

    const oldItem = { ...current[idx] };
    const updatedItem: RouteItem = {
      ...oldItem,
      status,
      risk_level: riskLevel || oldItem.risk_level,
      current_delay_minutes: delayMinutes !== undefined ? delayMinutes : oldItem.current_delay_minutes,
      updated_at: new Date().toISOString(),
    };

    current[idx] = updatedItem;
    setStoredCollection('routes', current);

    if (supabaseInstance) {
      await supabaseInstance.from('routes').update(updatedItem).eq('id', routeId);
    }

    notifyListeners('routes', 'UPDATE', updatedItem, oldItem);

    // Audit log
    await vectorDb.logAudit({
      officer_name: INITIAL_USER.full_name,
      role: INITIAL_USER.role,
      action: 'ROUTE_STATUS_CHANGED',
      details: `Route ${updatedItem.route_name} status modified to [${status.toUpperCase()}]. Risk: ${updatedItem.risk_level.toUpperCase()}`,
      affected_entity_type: 'route',
      affected_entity_id: routeId,
    });

    return updatedItem;
  },

  // 2. RISK ZONES (Polygons & Hazards)
  getRiskZones: async (): Promise<RiskZone[]> => {
    if (supabaseInstance) {
      const { data, error } = await supabaseInstance.from('risk_zones').select('*');
      if (!error && data && data.length > 0) return data as RiskZone[];
    }
    return getStoredCollection<RiskZone>('risk_zones', INITIAL_RISK_ZONES);
  },

  createRiskZone: async (zone: Omit<RiskZone, 'id' | 'created_at'>): Promise<RiskZone> => {
    const newZone: RiskZone = {
      ...zone,
      id: 'rz-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };

    if (supabaseInstance) {
      await supabaseInstance.from('risk_zones').insert([newZone]);
    }

    const current = getStoredCollection<RiskZone>('risk_zones', INITIAL_RISK_ZONES);
    const updated = [newZone, ...current];
    setStoredCollection('risk_zones', updated);
    notifyListeners('risk_zones', 'INSERT', newZone);

    await vectorDb.logAudit({
      officer_name: INITIAL_USER.full_name,
      role: INITIAL_USER.role,
      action: 'RISK_ZONE_CREATED',
      details: `Registered ${newZone.severity.toUpperCase()} risk zone: ${newZone.risk_name} at ${newZone.location_name}`,
      affected_entity_type: 'risk_zone',
      affected_entity_id: newZone.id,
    });

    return newZone;
  },

  toggleRiskZone: async (zoneId: string, isActive: boolean): Promise<RiskZone | null> => {
    const current = getStoredCollection<RiskZone>('risk_zones', INITIAL_RISK_ZONES);
    const idx = current.findIndex((z) => z.id === zoneId);
    if (idx === -1) return null;

    current[idx].status = isActive ? 'active' : 'cleared';
    current[idx].is_active = isActive;
    setStoredCollection('risk_zones', current);

    if (supabaseInstance) {
      await supabaseInstance.from('risk_zones').update({ status: current[idx].status }).eq('id', zoneId);
    }

    notifyListeners('risk_zones', 'UPDATE', current[idx]);
    return current[idx];
  },

  // 3. INCIDENTS (Field reports, verification, rescue dispatch)
  getIncidents: async (): Promise<Incident[]> => {
    if (supabaseInstance) {
      const { data, error } = await supabaseInstance.from('incidents').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as Incident[];
    }
    return getStoredCollection<Incident>('incidents', INITIAL_INCIDENTS);
  },

  createIncident: async (incident: Omit<Incident, 'id' | 'created_at' | 'updated_at'>): Promise<Incident> => {
    const newIncident: Incident = {
      ...incident,
      id: 'inc-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabaseInstance) {
      await supabaseInstance.from('incidents').insert([newIncident]);
    }

    const current = getStoredCollection<Incident>('incidents', INITIAL_INCIDENTS);
    const updated = [newIncident, ...current];
    setStoredCollection('incidents', updated);
    notifyListeners('incidents', 'INSERT', newIncident);

    await vectorDb.logAudit({
      officer_name: incident.reporter_name,
      role: 'field_officer',
      action: 'INCIDENT_REPORTED',
      details: `Field Incident ${newIncident.incident_id} filed: ${newIncident.title} (${newIncident.location_name})`,
      affected_entity_type: 'incident',
      affected_entity_id: newIncident.id,
    });

    return newIncident;
  },

  updateIncidentStatus: async (
    incidentId: string,
    status: Incident['status'],
    notes?: string,
    rescueTeamId?: string,
    rescueTeamName?: string
  ): Promise<Incident | null> => {
    const current = getStoredCollection<Incident>('incidents', INITIAL_INCIDENTS);
    const idx = current.findIndex((i) => i.id === incidentId);
    if (idx === -1) return null;

    const old = { ...current[idx] };
    const updated: Incident = {
      ...old,
      status,
      verification_notes: notes || old.verification_notes,
      assigned_rescue_team_id: rescueTeamId || old.assigned_rescue_team_id,
      assigned_rescue_team_name: rescueTeamName || old.assigned_rescue_team_name,
      updated_at: new Date().toISOString(),
      resolved_at: status === 'resolved' || status === 'closed' ? new Date().toISOString() : old.resolved_at,
    };

    current[idx] = updated;
    setStoredCollection('incidents', current);

    if (supabaseInstance) {
      await supabaseInstance.from('incidents').update(updated).eq('id', incidentId);
    }

    notifyListeners('incidents', 'UPDATE', updated, old);

    await vectorDb.logAudit({
      officer_name: INITIAL_USER.full_name,
      role: INITIAL_USER.role,
      action: `INCIDENT_${status.toUpperCase()}`,
      details: `Incident ${updated.incident_id} marked as [${status}]. Notes: ${notes || 'Action verified by Government Portal'}`,
      affected_entity_type: 'incident',
      affected_entity_id: incidentId,
    });

    return updated;
  },

  assignRescueTeam: async (incidentId: string, teamId: string, teamName: string): Promise<Incident | null> => {
    return vectorDb.updateIncidentStatus(incidentId, 'in_progress', `Assigned to ${teamName}`, teamId, teamName);
  },

  // 4. VEHICLES & GPS TRACKING
  getVehicles: async (): Promise<Vehicle[]> => {
    if (supabaseInstance) {
      const { data, error } = await supabaseInstance.from('vehicles').select('*');
      if (!error && data && data.length > 0) return data as Vehicle[];
    }
    return getStoredCollection<Vehicle>('vehicles', INITIAL_VEHICLES);
  },

  rerouteVehicle: async (vehicleId: string, newRouteId: string, newRouteName: string, reason: string): Promise<Vehicle | null> => {
    const current = getStoredCollection<Vehicle>('vehicles', INITIAL_VEHICLES);
    const idx = current.findIndex((v) => v.id === vehicleId);
    if (idx === -1) return null;

    const old = { ...current[idx] };
    const updated: Vehicle = {
      ...old,
      route_id: newRouteId,
      route_name: `${newRouteName} (Rerouted)`,
      status: 'rerouted',
      is_delayed: true,
      delay_reason: reason,
      last_ping: 'Just now',
    };

    current[idx] = updated;
    setStoredCollection('vehicles', current);

    if (supabaseInstance) {
      await supabaseInstance.from('vehicles').update(updated).eq('id', vehicleId);
    }

    notifyListeners('vehicles', 'UPDATE', updated, old);
    return updated;
  },

  // 5. GOVERNMENT OFFICES & CHECKPOSTS
  getGovernmentOffices: async (): Promise<GovernmentOffice[]> => {
    if (supabaseInstance) {
      const { data, error } = await supabaseInstance.from('government_offices').select('*');
      if (!error && data && data.length > 0) return data as GovernmentOffice[];
    }
    return getStoredCollection<GovernmentOffice>('government_offices', INITIAL_GOVERNMENT_OFFICES);
  },

  createGovernmentOffice: async (office: Omit<GovernmentOffice, 'id'>): Promise<GovernmentOffice> => {
    const newOffice: GovernmentOffice = {
      ...office,
      id: 'off-' + Math.random().toString(36).substring(2, 9),
    };
    const current = getStoredCollection<GovernmentOffice>('government_offices', INITIAL_GOVERNMENT_OFFICES);
    const updated = [newOffice, ...current];
    setStoredCollection('government_offices', updated);
    notifyListeners('government_offices', 'INSERT', newOffice);
    return newOffice;
  },

  // 6. POLICE STATIONS
  getPoliceStations: async (): Promise<PoliceStation[]> => {
    if (supabaseInstance) {
      const { data, error } = await supabaseInstance.from('police_stations').select('*');
      if (!error && data && data.length > 0) return data as PoliceStation[];
    }
    return getStoredCollection<PoliceStation>('police_stations', INITIAL_POLICE_STATIONS);
  },

  createPoliceStation: async (station: Omit<PoliceStation, 'id'>): Promise<PoliceStation> => {
    const newStation: PoliceStation = {
      ...station,
      id: 'pol-' + Math.random().toString(36).substring(2, 9),
    };
    const current = getStoredCollection<PoliceStation>('police_stations', INITIAL_POLICE_STATIONS);
    const updated = [newStation, ...current];
    setStoredCollection('police_stations', updated);
    notifyListeners('police_stations', 'INSERT', newStation);
    return newStation;
  },

  // 7. FIRE STATIONS
  getFireStations: async (): Promise<FireStation[]> => {
    if (supabaseInstance) {
      const { data, error } = await supabaseInstance.from('fire_stations').select('*');
      if (!error && data && data.length > 0) return data as FireStation[];
    }
    return getStoredCollection<FireStation>('fire_stations', INITIAL_FIRE_STATIONS);
  },

  createFireStation: async (station: Omit<FireStation, 'id'>): Promise<FireStation> => {
    const newStation: FireStation = {
      ...station,
      id: 'fs-' + Math.random().toString(36).substring(2, 9),
    };
    const current = getStoredCollection<FireStation>('fire_stations', INITIAL_FIRE_STATIONS);
    const updated = [newStation, ...current];
    setStoredCollection('fire_stations', updated);
    notifyListeners('fire_stations', 'INSERT', newStation);
    return newStation;
  },

  // 8. RESCUE TEAMS
  getRescueTeams: async (): Promise<RescueTeam[]> => {
    if (supabaseInstance) {
      const { data, error } = await supabaseInstance.from('rescue_teams').select('*');
      if (!error && data && data.length > 0) return data as RescueTeam[];
    }
    return getStoredCollection<RescueTeam>('rescue_teams', INITIAL_RESCUE_TEAMS);
  },

  updateRescueTeamStatus: async (teamId: string, availability: RescueTeam['availability'], currentAssignment?: string): Promise<RescueTeam | null> => {
    const current = getStoredCollection<RescueTeam>('rescue_teams', INITIAL_RESCUE_TEAMS);
    const idx = current.findIndex((t) => t.id === teamId);
    if (idx === -1) return null;

    const old = { ...current[idx] };
    const updated: RescueTeam = {
      ...old,
      availability,
      current_assignment: currentAssignment || old.current_assignment,
    };

    current[idx] = updated;
    setStoredCollection('rescue_teams', current);
    notifyListeners('rescue_teams', 'UPDATE', updated, old);
    return updated;
  },

  createRescueTeam: async (team: Omit<RescueTeam, 'id'>): Promise<RescueTeam> => {
    const newTeam: RescueTeam = {
      ...team,
      id: 'res-' + Math.random().toString(36).substring(2, 9),
    };
    const current = getStoredCollection<RescueTeam>('rescue_teams', INITIAL_RESCUE_TEAMS);
    const updated = [newTeam, ...current];
    setStoredCollection('rescue_teams', updated);
    notifyListeners('rescue_teams', 'INSERT', newTeam);
    return newTeam;
  },

  // 9. WEATHER INTELLIGENCE
  getWeatherData: async (): Promise<WeatherStationData[]> => {
    if (supabaseInstance) {
      const { data, error } = await supabaseInstance.from('weather_data').select('*');
      if (!error && data && data.length > 0) return data as WeatherStationData[];
    }
    return getStoredCollection<WeatherStationData>('weather_data', INITIAL_WEATHER_DATA);
  },

  // 10. ROUTE UPDATES (PUBLIC & USER MOBILE APP BULLETINS)
  getRouteUpdates: async (): Promise<RouteUpdate[]> => {
    if (supabaseInstance) {
      const { data, error } = await supabaseInstance.from('route_updates').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as RouteUpdate[];
    }
    return getStoredCollection<RouteUpdate>('route_updates', INITIAL_ROUTE_UPDATES);
  },

  publishRouteUpdate: async (update: Omit<RouteUpdate, 'id' | 'created_at'>): Promise<RouteUpdate> => {
    const newUpdate: RouteUpdate = {
      ...update,
      id: 'upd-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };

    if (supabaseInstance) {
      await supabaseInstance.from('route_updates').insert([newUpdate]);
    }

    const current = getStoredCollection<RouteUpdate>('route_updates', INITIAL_ROUTE_UPDATES);
    const updated = [newUpdate, ...current];
    setStoredCollection('route_updates', updated);
    notifyListeners('route_updates', 'INSERT', newUpdate);

    await vectorDb.logAudit({
      officer_name: update.created_by,
      role: INITIAL_USER.role,
      action: 'ROUTE_UPDATE_PUBLISHED',
      details: `Published official road bulletin: "${newUpdate.title}" (Broadcast to Web & Mobile)`,
      affected_entity_type: 'route',
      affected_entity_id: update.route_id,
    });

    return newUpdate;
  },

  // 11. ALERTS
  getAlerts: async (): Promise<SystemAlert[]> => {
    if (supabaseInstance) {
      const { data, error } = await supabaseInstance.from('alerts').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as SystemAlert[];
    }
    return getStoredCollection<SystemAlert>('alerts', INITIAL_ALERTS);
  },

  createAlert: async (alert: Omit<SystemAlert, 'id' | 'created_at' | 'acknowledged'>): Promise<SystemAlert> => {
    const newAlert: SystemAlert = {
      ...alert,
      id: 'alt-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      acknowledged: false,
    };

    if (supabaseInstance) {
      await supabaseInstance.from('alerts').insert([newAlert]);
    }

    const current = getStoredCollection<SystemAlert>('alerts', INITIAL_ALERTS);
    const updated = [newAlert, ...current];
    setStoredCollection('alerts', updated);
    notifyListeners('alerts', 'INSERT', newAlert);

    await vectorDb.logAudit({
      officer_name: INITIAL_USER.full_name,
      role: INITIAL_USER.role,
      action: 'ALERT_BROADCAST',
      details: `Issued ${newAlert.category.toUpperCase()} alert: ${newAlert.title}`,
      affected_entity_type: 'alert',
      affected_entity_id: newAlert.id,
    });

    return newAlert;
  },

  acknowledgeAlert: async (alertId: string): Promise<void> => {
    const current = getStoredCollection<SystemAlert>('alerts', INITIAL_ALERTS);
    const idx = current.findIndex((a) => a.id === alertId);
    if (idx !== -1) {
      current[idx].acknowledged = true;
      setStoredCollection('alerts', current);
      notifyListeners('alerts', 'UPDATE', current[idx]);
    }
  },

  // 12. AUDIT LOGS
  getAuditLogs: async (): Promise<AuditLog[]> => {
    if (supabaseInstance) {
      const { data, error } = await supabaseInstance.from('audit_logs').select('*').order('timestamp', { ascending: false });
      if (!error && data && data.length > 0) return data as AuditLog[];
    }
    return getStoredCollection<AuditLog>('audit_logs', INITIAL_AUDIT_LOGS);
  },

  logAudit: async (entry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> => {
    const newLog: AuditLog = {
      ...entry,
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };

    if (supabaseInstance) {
      try {
        await supabaseInstance.from('audit_logs').insert([newLog]);
      } catch (e) {
        console.warn('Audit log write error:', e);
      }
    }

    const current = getStoredCollection<AuditLog>('audit_logs', INITIAL_AUDIT_LOGS);
    const updated = [newLog, ...current];
    setStoredCollection('audit_logs', updated);
    notifyListeners('audit_logs', 'INSERT', newLog);
    return newLog;
  },

  // Reset database back to default initial state
  resetToDefault: () => {
    localStorage.removeItem(STORAGE_PREFIX + 'routes');
    localStorage.removeItem(STORAGE_PREFIX + 'risk_zones');
    localStorage.removeItem(STORAGE_PREFIX + 'incidents');
    localStorage.removeItem(STORAGE_PREFIX + 'vehicles');
    localStorage.removeItem(STORAGE_PREFIX + 'government_offices');
    localStorage.removeItem(STORAGE_PREFIX + 'police_stations');
    localStorage.removeItem(STORAGE_PREFIX + 'fire_stations');
    localStorage.removeItem(STORAGE_PREFIX + 'rescue_teams');
    localStorage.removeItem(STORAGE_PREFIX + 'weather_data');
    localStorage.removeItem(STORAGE_PREFIX + 'route_updates');
    localStorage.removeItem(STORAGE_PREFIX + 'alerts');
    localStorage.removeItem(STORAGE_PREFIX + 'audit_logs');
    window.location.reload();
  },
};
