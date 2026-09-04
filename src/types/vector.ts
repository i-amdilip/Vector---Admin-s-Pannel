export type UserRole =
  | 'super_admin'
  | 'state_admin'
  | 'district_officer'
  | 'transport_officer'
  | 'police'
  | 'police_officer'
  | 'fire'
  | 'fire_officer'
  | 'rescue'
  | 'rescue_officer'
  | 'field_officer'
  | 'public_driver'
  | 'driver'
  | 'citizen';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department: string;
  state: string;
  district: string;
  badge_number?: string;
  phone?: string;
  phone_number?: string;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export type RouteStatus = 'open' | 'warning' | 'blocked' | 'emergency_only' | 'archived';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type RoadType = 'national_highway' | 'state_highway' | 'border_road' | 'district_road';

export interface RouteItem {
  id: string;
  route_id: string;
  route_name: string;
  starting_point: string;
  destination: string;
  district: string;
  state: string;
  road_type: RoadType;
  status: RouteStatus;
  risk_level: RiskLevel;
  is_emergency_route: boolean;
  description: string;
  maximum_load_tonnes: number;
  recommended_vehicle_types: string[];
  geometry: [number, number][]; // [longitude, latitude] coordinates
  length_km: number;
  average_transit_hours: number;
  current_delay_minutes: number;
  elevation_gain_m?: number;
  created_at: string;
  updated_at: string;
}

export type RiskType =
  | 'landslide'
  | 'flood'
  | 'heavy_rainfall'
  | 'heavy_rain'
  | 'road_damage'
  | 'bridge_damage'
  | 'traffic'
  | 'construction'
  | 'security_risk'
  | 'other';

export type RiskZoneType = RiskType;

export interface RiskZone {
  id: string;
  zone_id?: string;
  name?: string;
  risk_name: string;
  type: RiskType;
  zone_type?: RiskType;
  location_name: string;
  coordinates: [number, number][]; // polygon [lng, lat]
  coordinates_polygon?: [number, number][];
  severity: RiskLevel;
  start_date: string;
  expected_end: string;
  description: string;
  evidence_photo_url?: string;
  responsible_department: string;
  department?: string;
  state?: string;
  district?: string;
  status: 'active' | 'mitigating' | 'cleared';
  is_active?: boolean;
  affected_routes: string[];
  created_at: string;
}

export type IncidentType =
  | 'landslide'
  | 'flood'
  | 'road_damage'
  | 'bridge_damage'
  | 'accident'
  | 'traffic_blockage'
  | 'road_closure'
  | 'fallen_tree'
  | 'roadblock'
  | 'heavy_rain'
  | 'vehicle_breakdown'
  | 'infrastructure_failure'
  | 'other';

export type IncidentStatus =
  | 'reported'
  | 'under_verification'
  | 'confirmed'
  | 'verified'
  | 'response_dispatched'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'rejected';

export interface Incident {
  id: string;
  incident_id: string;
  title: string;
  incident_type: IncidentType;
  location_name: string;
  coordinates: [number, number]; // [lng, lat]
  severity: RiskLevel;
  status: IncidentStatus;
  description: string;
  affected_route_id?: string;
  affected_route_name?: string;
  reporter_name: string;
  reporter_role: string;
  department: string;
  assigned_rescue_team_id?: string;
  assigned_rescue_team_name?: string;
  verification_notes?: string;
  photos: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export type VehicleStatus =
  | 'in_transit'
  | 'delayed'
  | 'rerouted'
  | 'halted'
  | 'arrived'
  | 'stalled';

export interface Vehicle {
  id: string;
  vehicle_id: string;
  registration_number: string;
  vehicle_number?: string;
  driver_name: string;
  driver_phone: string;
  vehicle_type: string;
  current_location_name: string;
  coordinates: [number, number]; // [lng, lat]
  destination: string;
  route_id: string;
  route_name: string;
  current_route_name?: string;
  speed_kmh: number;
  eta: string;
  cargo_type: string;
  status: VehicleStatus;
  is_delayed: boolean;
  delay_minutes?: number;
  delay_reason?: string;
  last_ping: string;
}

export type OfficeType =
  | 'District Collectorate'
  | 'Transport Authority'
  | 'Emergency Control Room'
  | 'Border Checkpost'
  | 'Disaster Management HQ'
  | 'district_office'
  | 'transport_office'
  | 'emergency_control_room'
  | 'police_hq'
  | 'border_checkpost';

export interface GovernmentOffice {
  id: string;
  name: string;
  department: string;
  office_type: OfficeType;
  officer_in_charge?: string;
  phone?: string;
  contact_number?: string;
  email?: string;
  address: string;
  district: string;
  state: string;
  operating_hours?: string;
  officials_count?: number;
  coordinates: [number, number];
  status?: 'operational' | 'high_alert' | 'standby';
  is_active?: boolean;
}

export interface PoliceStation {
  id: string;
  name?: string;
  station_name: string;
  district: string;
  state: string;
  address: string;
  coordinates: [number, number];
  contact_number: string;
  station_officer?: string;
  available_units?: number;
  vehicles_available?: number;
  officers_count?: number;
  operational_status: 'operational' | 'high_alert' | 'restricted';
}

export interface FireStation {
  id: string;
  name?: string;
  fire_station: string;
  district: string;
  state: string;
  coordinates: [number, number];
  contact?: string;
  contact_number?: string;
  available_vehicles?: number;
  fire_engines?: number;
  personnel?: number;
  officers_count?: number;
  operational_status: 'operational' | 'deployed' | 'standby';
}

export type RescueTeamType =
  | 'Disaster Response'
  | 'Mountain Rescue'
  | 'Flood Rescue'
  | 'Medical Emergency'
  | 'Local Rescue'
  | 'Other'
  | string;

export interface RescueTeam {
  id: string;
  name?: string;
  team_name: string;
  organization: string; // e.g., 'NDRF 1st Bn', 'SDRF Assam', 'BRO Task Force'
  team_type: RescueTeamType;
  base_location: string;
  current_location: string;
  coordinates: [number, number];
  team_leader?: string;
  contact?: string;
  contact_number?: string;
  team_size?: number;
  personnel_count?: number;
  equipment: string[];
  availability: 'available' | 'deployed' | 'unavailable' | 'standby' | 'returning' | 'off_duty';
  current_status?: 'standby' | 'deployed' | 'returning' | 'off_duty';
  current_assignment?: string;
}

export interface WeatherStationData {
  id: string;
  location_name?: string;
  district: string;
  state: string;
  coordinates: [number, number];
  rainfall_mm: number;
  rainfall_mm_per_hour?: number;
  temperature_c: number;
  temperature_celsius?: number;
  visibility_meters: number;
  wind_speed_kmh: number;
  condition: string;
  storm_alert: boolean;
  flood_warning: boolean;
  landslide_threat_index: number; // 0-100
  landslide_risk_index?: number;
  updated_at: string;
}

export interface RouteUpdate {
  id: string;
  title: string;
  type:
    | 'Road blocked'
    | 'Road reopened'
    | 'Bridge damaged'
    | 'Diversion active'
    | 'Construction'
    | 'Weather warning'
    | 'Emergency route activated'
    | 'Clearance completed'
    | 'Traffic restriction';
  route_id: string;
  route_name: string;
  location: string;
  severity: RiskLevel;
  description: string;
  image_url?: string;
  created_by: string;
  department: string;
  created_at: string;
  expiry: string;
}

export type AlertCategory = 'critical' | 'high' | 'warning' | 'info';

export interface SystemAlert {
  id: string;
  alert_id: string;
  category: AlertCategory;
  title: string;
  message: string;
  affected_routes?: string[];
  affected_district: string;
  created_at: string;
  acknowledged: boolean;
}

export interface AuditLog {
  id: string;
  timestamp?: string;
  created_at?: string;
  officer_name?: string;
  user_name?: string;
  role?: UserRole;
  user_role?: string;
  action: string;
  details: string;
  target_table?: string;
  ip_address?: string;
  affected_entity_type?: 'route' | 'risk_zone' | 'incident' | 'vehicle' | 'emergency_resource' | 'alert' | 'system';
  affected_entity_id?: string;
}

export interface SafeRouteRecommendation {
  original_route_id: string;
  original_route_name: string;
  alternate_route_id: string;
  alternate_route_name: string;
  incident_reason: string;
  original_risk_score: number;
  alternate_risk_score: number;
  risk_reduction_pct: number;
  eta_difference_minutes: number;
  terrain_safety_rating: 'Superior' | 'Optimal' | 'Caution Required';
  corridor_reasons: string[];
  approved: boolean;
  approval_timestamp?: string;
}
