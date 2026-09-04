-- ==============================================================================
-- VECTOR: Vehicle & Emergency Connectivity for Transport Operations & Routing
-- Unified Backend & Database Specification for Supabase (PostgreSQL + PostGIS)
-- Architecture: Shared by Current Government Portal & Future User Mobile App
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Custom ENUM Types
CREATE TYPE user_role AS ENUM (
    'super_admin',
    'state_admin',
    'district_officer',
    'transport_officer',
    'police',
    'fire',
    'rescue',
    'field_officer',
    'public_driver',
    'citizen'
);

CREATE TYPE route_status AS ENUM ('open', 'warning', 'blocked', 'emergency_only', 'archived');
CREATE TYPE risk_level AS ENUM ('low', 'moderate', 'high', 'critical');
CREATE TYPE road_type AS ENUM ('national_highway', 'state_highway', 'border_road', 'district_road');
CREATE TYPE risk_type AS ENUM ('landslide', 'flood', 'heavy_rainfall', 'road_damage', 'bridge_damage', 'traffic', 'construction', 'security_risk', 'other');
CREATE TYPE incident_type AS ENUM ('landslide', 'flood', 'road_damage', 'bridge_damage', 'accident', 'traffic_blockage', 'heavy_rain', 'vehicle_breakdown', 'infrastructure_failure', 'other');
CREATE TYPE incident_status AS ENUM ('reported', 'under_verification', 'confirmed', 'response_dispatched', 'resolved', 'closed');
CREATE TYPE team_availability AS ENUM ('available', 'deployed', 'unavailable');

-- 3. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    state TEXT NOT NULL,
    helpline TEXT,
    contact_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Profiles (Government Staff + Future Mobile App Drivers & Citizens)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'citizen',
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    badge_number TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Government Offices & Control Rooms
CREATE TABLE IF NOT EXISTS public.government_offices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    office_type TEXT NOT NULL,
    officer_in_charge TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    location GEOMETRY(Point, 4326),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status TEXT DEFAULT 'operational',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Police Stations
CREATE TABLE IF NOT EXISTS public.police_stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_name TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    address TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    station_officer TEXT NOT NULL,
    available_units INT DEFAULT 5,
    operational_status TEXT DEFAULT 'operational',
    location GEOMETRY(Point, 4326),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Fire Stations
CREATE TABLE IF NOT EXISTS public.fire_stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fire_station TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    contact TEXT NOT NULL,
    available_vehicles INT DEFAULT 4,
    personnel INT DEFAULT 20,
    operational_status TEXT DEFAULT 'operational',
    location GEOMETRY(Point, 4326),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Rescue Teams (NDRF, SDRF, BRO Task Forces)
CREATE TABLE IF NOT EXISTS public.rescue_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_name TEXT NOT NULL,
    organization TEXT NOT NULL,
    team_type TEXT NOT NULL,
    base_location TEXT NOT NULL,
    current_location TEXT NOT NULL,
    team_leader TEXT NOT NULL,
    contact TEXT NOT NULL,
    team_size INT NOT NULL,
    equipment TEXT[] DEFAULT '{}',
    availability team_availability DEFAULT 'available',
    current_assignment TEXT,
    location GEOMETRY(Point, 4326),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Routes (NER Strategic Corridors & Arterials)
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id TEXT UNIQUE NOT NULL,
    route_name TEXT NOT NULL,
    starting_point TEXT NOT NULL,
    destination TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    road_type road_type NOT NULL,
    status route_status DEFAULT 'open',
    risk_level risk_level DEFAULT 'low',
    is_emergency_route BOOLEAN DEFAULT FALSE,
    description TEXT,
    maximum_load_tonnes NUMERIC(6,2),
    recommended_vehicle_types TEXT[] DEFAULT '{}',
    path_geometry GEOMETRY(LineString, 4326),
    coordinates JSONB NOT NULL, -- Array of [lng, lat] for web/mobile client ease
    length_km NUMERIC(8,2) NOT NULL,
    average_transit_hours NUMERIC(5,2) NOT NULL,
    current_delay_minutes INT DEFAULT 0,
    elevation_gain_m INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Risk Zones (Polygons for Landslides, Floods, Rockfalls)
CREATE TABLE IF NOT EXISTS public.risk_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_name TEXT NOT NULL,
    type risk_type NOT NULL,
    location_name TEXT NOT NULL,
    polygon_geometry GEOMETRY(Polygon, 4326),
    coordinates JSONB NOT NULL, -- Array of [lng, lat] vertices
    severity risk_level NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    expected_end TIMESTAMPTZ NOT NULL,
    description TEXT NOT NULL,
    evidence_photo_url TEXT,
    responsible_department TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    affected_routes UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Incidents Table (Reported by Field Officers, Police, Citizens via Mobile App)
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    incident_type incident_type NOT NULL,
    location_name TEXT NOT NULL,
    point_geometry GEOMETRY(Point, 4326),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    severity risk_level NOT NULL,
    status incident_status DEFAULT 'reported',
    description TEXT NOT NULL,
    affected_route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
    reporter_name TEXT NOT NULL,
    reporter_role TEXT NOT NULL,
    reporter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    department TEXT NOT NULL,
    assigned_rescue_team_id UUID REFERENCES public.rescue_teams(id) ON DELETE SET NULL,
    verification_notes TEXT,
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 12. Vehicles & Tracking
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id TEXT UNIQUE NOT NULL,
    registration_number TEXT NOT NULL,
    driver_name TEXT NOT NULL,
    driver_phone TEXT NOT NULL,
    driver_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    vehicle_type TEXT NOT NULL,
    current_location_name TEXT NOT NULL,
    current_location GEOMETRY(Point, 4326),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    destination TEXT NOT NULL,
    route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
    speed_kmh NUMERIC(5,1) DEFAULT 0,
    eta TEXT NOT NULL,
    cargo_type TEXT NOT NULL,
    status TEXT DEFAULT 'in_transit',
    is_delayed BOOLEAN DEFAULT FALSE,
    delay_reason TEXT,
    last_ping TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Weather Stations Data
CREATE TABLE IF NOT EXISTS public.weather_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    rainfall_mm NUMERIC(6,1) NOT NULL,
    temperature_c NUMERIC(4,1) NOT NULL,
    visibility_meters INT NOT NULL,
    wind_speed_kmh NUMERIC(5,1) NOT NULL,
    condition TEXT NOT NULL,
    storm_alert BOOLEAN DEFAULT FALSE,
    flood_warning BOOLEAN DEFAULT FALSE,
    landslide_threat_index INT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Road Updates & Public Bulletins (Consumed by Government Portal & Mobile App)
CREATE TABLE IF NOT EXISTS public.route_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    severity risk_level NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    created_by TEXT NOT NULL,
    department TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- 15. Real-Time Emergency Alerts
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL, -- critical, high, warning, info
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    affected_routes UUID[] DEFAULT '{}',
    affected_district TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged BOOLEAN DEFAULT FALSE
);

-- 16. Audit Logs (Government Integrity & Compliance)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    officer_name TEXT NOT NULL,
    role user_role NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    affected_entity_type TEXT NOT NULL,
    affected_entity_id TEXT
);

-- 17. Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Read policies (Public & Mobile App Drivers can read verified routes, alerts, and updates)
CREATE POLICY "Public read active routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Public read active alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Public read route updates" ON public.route_updates FOR SELECT USING (true);
CREATE POLICY "Public read risk zones" ON public.risk_zones FOR SELECT USING (true);
CREATE POLICY "Public read verified incidents" ON public.incidents FOR SELECT USING (status != 'closed');

-- Write policies for Government Authorized Roles
CREATE POLICY "Gov staff manage routes" ON public.routes FOR ALL USING (
  auth.jwt() ->> 'role' IN ('super_admin', 'state_admin', 'transport_officer')
);

CREATE POLICY "Gov staff manage incidents" ON public.incidents FOR ALL USING (
  auth.jwt() ->> 'role' IN ('super_admin', 'state_admin', 'district_officer', 'police', 'field_officer')
);

-- 18. Supabase Realtime Publication Setup
-- Enable real-time websocket broadcasting for the Government Portal and future Mobile App
ALTER PUBLICATION supabase_realtime ADD TABLE public.routes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_zones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.route_updates;

-- End of Supabase Schema
