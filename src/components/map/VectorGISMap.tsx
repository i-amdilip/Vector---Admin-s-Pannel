import React, { useEffect, useRef, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
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
} from '../../types/vector';
import {
  Layers,
  Eye,
  EyeOff,
  Navigation,
  Shield,
  Flame,
  LifeBuoy,
  Building2,
  CloudRain,
  Truck,
  AlertTriangle,
  Compass,
  Maximize2,
  ZoomIn,
  ZoomOut,
  MapPin,
  CheckCircle2,
  Ban,
  Activity,
  Zap,
} from 'lucide-react';

interface VectorGISMapProps {
  routes: RouteItem[];
  riskZones: RiskZone[];
  incidents: Incident[];
  vehicles: Vehicle[];
  governmentOffices: GovernmentOffice[];
  policeStations: PoliceStation[];
  fireStations: FireStation[];
  rescueTeams: RescueTeam[];
  weatherData: WeatherStationData[];
  selectedRouteId?: string | null;
  onSelectRoute?: (route: RouteItem) => void;
  onSelectIncident?: (incident: Incident) => void;
  isDrawingMode?: boolean;
  drawingType?: 'route' | 'risk_polygon';
  onCoordinatesCaptured?: (coords: [number, number][]) => void;
  onClearDrawing?: () => void;
}

export const VectorGISMap: React.FC<VectorGISMapProps> = ({
  routes,
  riskZones,
  incidents,
  vehicles,
  governmentOffices,
  policeStations,
  fireStations,
  rescueTeams,
  weatherData,
  selectedRouteId,
  onSelectRoute,
  onSelectIncident,
  isDrawingMode = false,
  drawingType = 'route',
  onCoordinatesCaptured,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maptilersdk.Map | null>(null);
  const markersRef = useRef<maptilersdk.Marker[]>([]);
  const drawnCoordsRef = useRef<[number, number][]>([]);

  // MapTiler API Key detection
  const maptilerApiKey =
    (import.meta as any).env?.VITE_MAPTILER_API_KEY ||
    (import.meta as any).env?.VITE_MAPTILER_TOKEN ||
    '';
  const hasMaptilerKey = Boolean(maptilerApiKey && maptilerApiKey.trim().length > 0);

  // Basemap style state
  const [currentMapStyle, setCurrentMapStyle] = useState<'outdoor' | 'streets' | 'dataviz' | 'hybrid'>('outdoor');

  // Layer toggles
  const [layers, setLayers] = useState({
    routes: true,
    blockedRoutes: true,
    riskZones: true,
    incidents: true,
    vehicles: true,
    police: true,
    fire: true,
    rescue: true,
    offices: true,
    weather: true,
    emergencyCorridorsOnly: false,
  });

  const [activeInspector, setActiveInspector] = useState<{
    type: 'route' | 'incident' | 'vehicle' | 'facility';
    data: any;
  } | null>(null);

  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);

  // Initialize MapTiler map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (hasMaptilerKey) {
      maptilersdk.config.apiKey = maptilerApiKey;
    }

    // High performance Carto Voyager light basemap fallback when API key is not yet set
    const fallbackTileStyle: any = {
      version: 8,
      sources: {
        'carto-voyager': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO &copy; MapTiler',
        },
      },
      layers: [
        {
          id: 'carto-voyager-layer',
          type: 'raster',
          source: 'carto-voyager',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };

    const initialStyle = hasMaptilerKey ? maptilersdk.MapStyle.OUTDOOR : fallbackTileStyle;

    const map = new maptilersdk.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [92.6, 26.2], // Centered over Assam / North Eastern Region
      zoom: 6.8,
      pitch: 25,
      attributionControl: { compact: true },
    });

    map.addControl(new maptilersdk.NavigationControl({ showCompass: true }), 'top-right');
    mapRef.current = map;

    // Handle map click for drawing mode
    map.on('click', (e) => {
      const coord: [number, number] = [Number(e.lngLat.lng.toFixed(4)), Number(e.lngLat.lat.toFixed(4))];
      if (isDrawingMode) {
        const next = [...drawnCoordsRef.current, coord];
        drawnCoordsRef.current = next;
        setDrawnPoints(next);
        if (onCoordinatesCaptured) onCoordinatesCaptured(next);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Drawing Mode state
  useEffect(() => {
    drawnCoordsRef.current = [];
    setDrawnPoints([]);
  }, [isDrawingMode]);

  // Render Routes and Risk Polygons as GeoJSON layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const renderGeoJSON = () => {
      // 1. Clean existing sources/layers
      if (map.getLayer('drawn-line-layer')) map.removeLayer('drawn-line-layer');
      if (map.getSource('drawn-data')) map.removeSource('drawn-data');

      if (map.getLayer('risk-polygons-fill')) map.removeLayer('risk-polygons-fill');
      if (map.getLayer('risk-polygons-line')) map.removeLayer('risk-polygons-line');
      if (map.getSource('risk-zones-source')) map.removeSource('risk-zones-source');

      routes.forEach((r) => {
        const layerId = `route-line-${r.id}`;
        const glowId = `route-glow-${r.id}`;
        const sourceId = `route-source-${r.id}`;
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getLayer(glowId)) map.removeLayer(glowId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      });

      // 2. Add Risk Zones
      if (layers.riskZones && riskZones.length > 0) {
        const features = riskZones.map((rz) => ({
          type: 'Feature',
          properties: {
            id: rz.id,
            name: rz.risk_name,
            severity: rz.severity,
            color: rz.severity === 'critical' ? '#ef4444' : rz.severity === 'high' ? '#f97316' : '#eab308',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [rz.coordinates],
          },
        }));

        map.addSource('risk-zones-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: features as any,
          },
        });

        map.addLayer({
          id: 'risk-polygons-fill',
          type: 'fill',
          source: 'risk-zones-source',
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.28,
          },
        });

        map.addLayer({
          id: 'risk-polygons-line',
          type: 'line',
          source: 'risk-zones-source',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 2,
            'line-dasharray': [2, 2],
          },
        });
      }

      // 3. Add Routes
      if (layers.routes) {
        routes.forEach((route) => {
          if (layers.emergencyCorridorsOnly && !route.is_emergency_route) return;
          if (!layers.blockedRoutes && route.status === 'blocked') return;

          let lineColor = '#10b981'; // 🟢 Open
          let lineWidth = 3.5;
          let lineDash: number[] | undefined = undefined;

          if (route.status === 'blocked') {
            lineColor = '#ef4444'; // 🔴 Blocked
            lineWidth = 4.5;
            lineDash = [2, 1.5];
          } else if (route.status === 'warning') {
            lineColor = '#f59e0b'; // 🟡 Warning
            lineWidth = 3.8;
          } else if (route.status === 'emergency_only') {
            lineColor = '#06b6d4'; // 🔵 Info / Emergency
            lineWidth = 4;
          }

          if (selectedRouteId === route.id) {
            lineWidth = 6;
          }

          const sourceId = `route-source-${route.id}`;
          const layerId = `route-line-${route.id}`;
          const glowId = `route-glow-${route.id}`;

          map.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: { id: route.id, name: route.route_name, status: route.status },
              geometry: {
                type: 'LineString',
                coordinates: route.geometry,
              },
            },
          });

          // Glow backdrop
          map.addLayer({
            id: glowId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
            },
            paint: {
              'line-color': lineColor,
              'line-width': lineWidth + 4,
              'line-opacity': selectedRouteId === route.id ? 0.6 : 0.25,
            },
          });

          // Main line
          const paintObj: any = {
            'line-color': lineColor,
            'line-width': lineWidth,
            'line-opacity': 0.95,
          };
          if (lineDash) {
            paintObj['line-dasharray'] = lineDash;
          }

          map.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
            },
            paint: paintObj,
          });

          // Click on route
          map.on('click', layerId, () => {
            setActiveInspector({ type: 'route', data: route });
            if (onSelectRoute) onSelectRoute(route);
          });
        });
      }

      // 4. Render user drawn line if in drawing mode
      if (drawnPoints.length > 1) {
        map.addSource('drawn-data', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: drawingType === 'route' ? 'LineString' : 'Polygon',
              coordinates: drawingType === 'route' ? drawnPoints : [drawnPoints],
            },
          },
        });

        map.addLayer({
          id: 'drawn-line-layer',
          type: 'line',
          source: 'drawn-data',
          paint: {
            'line-color': '#06b6d4',
            'line-width': 3,
            'line-dasharray': [1, 1],
          },
        });
      }
    };

    if (map.isStyleLoaded()) {
      renderGeoJSON();
    } else {
      map.once('load', renderGeoJSON);
    }

    const onStyleLoad = () => {
      renderGeoJSON();
    };
    map.on('style.load', onStyleLoad);

    return () => {
      map.off('style.load', onStyleLoad);
    };
  }, [routes, riskZones, layers, selectedRouteId, drawnPoints, isDrawingMode, drawingType]);

  // Basemap style switcher handler
  const changeBasemapStyle = (styleKey: 'outdoor' | 'streets' | 'dataviz' | 'hybrid') => {
    setCurrentMapStyle(styleKey);
    const map = mapRef.current;
    if (!map) return;

    if (hasMaptilerKey) {
      let chosenStyle: any = maptilersdk.MapStyle.OUTDOOR;
      if (styleKey === 'streets') chosenStyle = maptilersdk.MapStyle.STREETS;
      if (styleKey === 'dataviz') chosenStyle = maptilersdk.MapStyle.DATAVIZ.LIGHT;
      if (styleKey === 'hybrid') chosenStyle = maptilersdk.MapStyle.HYBRID;
      map.setStyle(chosenStyle);
    }
  };

  // Render Interactive Markers (Incidents, Vehicles, Police, Fire, Rescue, Offices)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Helper to create element marker
    const createMarker = (
      coords: [number, number],
      htmlIcon: string,
      title: string,
      subtitle: string,
      badgeColor: string,
      onClick: () => void
    ) => {
      const el = document.createElement('div');
      el.className = 'cursor-pointer transform hover:scale-125 transition-transform duration-150 relative group';
      el.innerHTML = `
        <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 ${badgeColor} shadow-lg shadow-black/80 bg-slate-900 text-white text-xs font-bold">
          ${htmlIcon}
        </div>
        <div class="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-10 z-50 bg-slate-900/95 border border-slate-700 px-2.5 py-1.5 rounded shadow-xl text-xs whitespace-nowrap pointer-events-none">
          <div class="font-bold text-slate-100">${title}</div>
          <div class="text-[10px] text-slate-400">${subtitle}</div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
      });

      const marker = new maptilersdk.Marker({ element: el })
        .setLngLat(coords)
        .addTo(map);

      markersRef.current.push(marker);
    };

    // 1. Incidents
    if (layers.incidents) {
      incidents.forEach((inc) => {
        const isCritical = inc.severity === 'critical';
        const isResolved = inc.status === 'resolved' || inc.status === 'closed';
        const colorClass = isResolved ? 'border-emerald-500 text-emerald-400' : isCritical ? 'border-rose-500 text-rose-400 animate-pulse' : 'border-amber-500 text-amber-400';
        createMarker(
          inc.coordinates,
          '⚠️',
          inc.title,
          `Status: ${(inc.status || 'reported').toUpperCase()} | ${(inc.severity || 'moderate').toUpperCase()}`,
          colorClass,
          () => {
            setActiveInspector({ type: 'incident', data: inc });
            if (onSelectIncident) onSelectIncident(inc);
          }
        );
      });
    }

    // 2. Vehicles
    if (layers.vehicles) {
      vehicles.forEach((veh) => {
        const isDelayed = veh.is_delayed;
        const colorClass = isDelayed ? 'border-amber-500 text-amber-300' : 'border-cyan-500 text-cyan-300';
        createMarker(
          veh.coordinates,
          '🚚',
          `${veh.vehicle_id} (${veh.cargo_type})`,
          `Driver: ${veh.driver_name} | ${veh.speed_kmh} km/h | ETA: ${veh.eta}`,
          colorClass,
          () => setActiveInspector({ type: 'vehicle', data: veh })
        );
      });
    }

    // 3. Police Stations
    if (layers.police) {
      policeStations.forEach((pol) => {
        createMarker(
          pol.coordinates,
          '🚓',
          pol.station_name,
          `Officer: ${pol.station_officer} | Patrol Units: ${pol.available_units}`,
          'border-blue-500 text-blue-300',
          () => setActiveInspector({ type: 'facility', data: { ...pol, facilityType: 'Police Station' } })
        );
      });
    }

    // 4. Fire Stations
    if (layers.fire) {
      fireStations.forEach((fs) => {
        createMarker(
          fs.coordinates,
          '🚒',
          fs.fire_station,
          `Tenders: ${fs.available_vehicles} | Crew: ${fs.personnel}`,
          'border-orange-500 text-orange-300',
          () => setActiveInspector({ type: 'facility', data: { ...fs, facilityType: 'Fire Department Station' } })
        );
      });
    }

    // 5. Rescue Teams
    if (layers.rescue) {
      rescueTeams.forEach((res) => {
        createMarker(
          res.coordinates,
          '⛑️',
          res.team_name,
          `${res.organization} | Status: ${(res.availability || 'standby').toUpperCase()}`,
          res.availability === 'deployed' ? 'border-red-500 text-red-300' : 'border-emerald-500 text-emerald-300',
          () => setActiveInspector({ type: 'facility', data: { ...res, facilityType: 'Emergency Rescue Team' } })
        );
      });
    }

    // 6. Government Offices & Checkposts
    if (layers.offices) {
      governmentOffices.forEach((off) => {
        createMarker(
          off.coordinates,
          '🏛️',
          off.name,
          `${off.office_type} | ${off.district}`,
          'border-indigo-500 text-indigo-300',
          () => setActiveInspector({ type: 'facility', data: { ...off, facilityType: off.office_type } })
        );
      });
    }

    // 7. Weather Stations
    if (layers.weather) {
      weatherData.forEach((w) => {
        createMarker(
          w.coordinates,
          '🌧️',
          `${w.district} (${w.rainfall_mm} mm)`,
          `Landslide Threat: ${w.landslide_threat_index}/100 | ${w.condition}`,
          w.landslide_threat_index > 75 ? 'border-red-400 text-red-300' : 'border-sky-400 text-sky-300',
          () => setActiveInspector({ type: 'facility', data: { ...w, facilityType: 'Weather & Landslide Sensor' } })
        );
      });
    }
  }, [incidents, vehicles, policeStations, fireStations, rescueTeams, governmentOffices, weatherData, layers]);

  // Camera jump helpers
  const flyTo = (lng: number, lat: number, zoom = 9) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom,
      essential: true,
      pitch: 35,
      duration: 1500,
    });
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden flex">
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Map Bar: Status, Coordinates and Quick Camera Jumps */}
      <div className="absolute top-3 left-3 right-14 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-white/95 border border-slate-200 backdrop-blur-xs px-3 py-1.5 rounded shadow-md pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
            <span className="text-xs font-bold tracking-wider text-slate-900">MAPTILER GIS RADAR</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-200 mx-1" />
          <div className="text-[11px] text-slate-600">
            Active Corridors: <span className="text-green-700 font-mono font-bold">{routes.filter(r => r.status === 'open').length}</span>
            <span className="text-slate-300 mx-1.5">|</span>
            Blocked: <span className="text-red-700 font-mono font-bold">{routes.filter(r => r.status === 'blocked').length}</span>
            <span className="text-slate-300 mx-1.5">|</span>
            Incidents: <span className="text-amber-700 font-mono font-bold">{incidents.filter(i => i.status !== 'resolved').length}</span>
          </div>
          {hasMaptilerKey ? (
            <>
              <div className="h-3 w-[1px] bg-slate-200 mx-1" />
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                MapTiler Active
              </span>
            </>
          ) : (
            <>
              <div className="h-3 w-[1px] bg-slate-200 mx-1" />
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded">
                Basemap Ready
              </span>
            </>
          )}
        </div>

        {/* Quick Camera Jump Buttons */}
        <div className="hidden lg:flex items-center gap-1 bg-white/95 border border-slate-200 backdrop-blur-xs p-1 rounded shadow-md pointer-events-auto text-[11px]">
          <span className="text-[10px] text-slate-500 font-bold px-2 uppercase tracking-wider">NER Sectors:</span>
          <button
            onClick={() => flyTo(92.6, 26.2, 6.8)}
            className="px-2 py-0.5 rounded hover:bg-slate-100 text-slate-700 font-medium transition"
          >
            All NER
          </button>
          <button
            onClick={() => flyTo(91.75, 26.18, 10.5)}
            className="px-2 py-0.5 rounded hover:bg-slate-100 text-blue-700 transition font-bold"
          >
            Guwahati Hub
          </button>
          <button
            onClick={() => flyTo(92.15, 27.52, 9.5)}
            className="px-2 py-0.5 rounded hover:bg-slate-100 text-amber-800 transition font-medium"
          >
            Sela Pass / Tawang (NH-13)
          </button>
          <button
            onClick={() => flyTo(92.35, 25.13, 10.5)}
            className="px-2 py-0.5 rounded hover:bg-slate-100 text-red-700 transition font-bold"
          >
            Sonapur Landslide (NH-06)
          </button>
          <button
            onClick={() => flyTo(88.55, 27.20, 9.8)}
            className="px-2 py-0.5 rounded hover:bg-slate-100 text-slate-700 transition font-medium"
          >
            Sikkim (NH-10)
          </button>
          <button
            onClick={() => flyTo(94.05, 25.40, 9.2)}
            className="px-2 py-0.5 rounded hover:bg-slate-100 text-slate-700 transition font-medium"
          >
            Nagaland / Manipur (NH-29)
          </button>
        </div>
      </div>

      {/* Drawing Mode Banner */}
      {isDrawingMode && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-white border-2 border-blue-600 px-4 py-2 rounded shadow-2xl backdrop-blur-xs flex items-center gap-3 text-slate-900 text-xs animate-bounce">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>
            <strong>Interactive Coordinate Drawing:</strong> Click on the map to define{' '}
            {drawingType === 'route' ? 'Route Waypoints' : 'Risk Area Boundary'}. (Points captured: {drawnPoints.length})
          </span>
          {drawnPoints.length > 0 && (
            <button
              onClick={() => {
                drawnCoordsRef.current = [];
                setDrawnPoints([]);
                if (onCoordinatesCaptured) onCoordinatesCaptured([]);
              }}
              className="bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-[11px] border border-slate-300 font-semibold text-slate-700"
            >
              Reset Points
            </button>
          )}
        </div>
      )}

      {/* Layer Controls Toggle Button */}
      <button
        id="toggle-map-layers-btn"
        onClick={() => setShowLayerPanel(!showLayerPanel)}
        className="absolute top-16 right-3 z-20 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 p-2 rounded shadow-md flex items-center gap-2 text-xs font-bold transition"
      >
        <Layers className="w-4 h-4 text-blue-600" />
        <span className="hidden sm:inline">GIS Layers</span>
      </button>

      {/* Layer Control Drawer / Dropdown */}
      {showLayerPanel && (
        <div className="absolute top-28 right-3 z-30 w-72 bg-white/98 border border-slate-200 rounded-lg shadow-2xl p-3.5 backdrop-blur-md text-xs text-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
            <span className="font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Operational Map Layers
            </span>
            <button
              onClick={() => setShowLayerPanel(false)}
              className="text-slate-400 hover:text-slate-700 text-base leading-none font-bold"
            >
              &times;
            </button>
          </div>

          <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
            <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-50 rounded">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-3 h-1 bg-green-500 rounded-full" />
                Corridors & Highways
              </span>
              <input
                type="checkbox"
                checked={layers.routes}
                onChange={(e) => setLayers({ ...layers, routes: e.target.checked })}
                className="accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-50 rounded">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-3 h-1 bg-red-500 rounded-full" />
                Blocked Routes Only
              </span>
              <input
                type="checkbox"
                checked={layers.blockedRoutes}
                onChange={(e) => setLayers({ ...layers, blockedRoutes: e.target.checked })}
                className="accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-50 rounded">
              <span className="flex items-center gap-2 text-slate-700">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Active Risk Zones (Polygons)
              </span>
              <input
                type="checkbox"
                checked={layers.riskZones}
                onChange={(e) => setLayers({ ...layers, riskZones: e.target.checked })}
                className="accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-50 rounded">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="text-xs">⚠️</span>
                Reported Incidents
              </span>
              <input
                type="checkbox"
                checked={layers.incidents}
                onChange={(e) => setLayers({ ...layers, incidents: e.target.checked })}
                className="accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-50 rounded">
              <span className="flex items-center gap-2 text-slate-700">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                Active Logistics & Cargo Trucks
              </span>
              <input
                type="checkbox"
                checked={layers.vehicles}
                onChange={(e) => setLayers({ ...layers, vehicles: e.target.checked })}
                className="accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-50 rounded">
              <span className="flex items-center gap-2 text-slate-700">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                Police Stations & Patrols
              </span>
              <input
                type="checkbox"
                checked={layers.police}
                onChange={(e) => setLayers({ ...layers, police: e.target.checked })}
                className="accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-50 rounded">
              <span className="flex items-center gap-2 text-slate-700">
                <Flame className="w-3.5 h-3.5 text-orange-600" />
                Fire & Rescue Stations
              </span>
              <input
                type="checkbox"
                checked={layers.fire}
                onChange={(e) => setLayers({ ...layers, fire: e.target.checked })}
                className="accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-50 rounded">
              <span className="flex items-center gap-2 text-slate-700">
                <LifeBuoy className="w-3.5 h-3.5 text-rose-600" />
                NDRF / SDRF Rescue Squads
              </span>
              <input
                type="checkbox"
                checked={layers.rescue}
                onChange={(e) => setLayers({ ...layers, rescue: e.target.checked })}
                className="accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-50 rounded">
              <span className="flex items-center gap-2 text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                District Collectorates & Checkposts
              </span>
              <input
                type="checkbox"
                checked={layers.offices}
                onChange={(e) => setLayers({ ...layers, offices: e.target.checked })}
                className="accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-50 rounded">
              <span className="flex items-center gap-2 text-slate-700">
                <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                Rainfall & Landslide Threat Sensors
              </span>
              <input
                type="checkbox"
                checked={layers.weather}
                onChange={(e) => setLayers({ ...layers, weather: e.target.checked })}
                className="accent-blue-600 rounded"
              />
            </label>

            <div className="pt-2 border-t border-slate-200 mt-2">
              <label className="flex items-center justify-between cursor-pointer p-1.5 bg-blue-50/50 rounded border border-blue-200">
                <span className="flex items-center gap-2 text-blue-900 font-semibold">
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                  Emergency Corridors Only
                </span>
                <input
                  type="checkbox"
                  checked={layers.emergencyCorridorsOnly}
                  onChange={(e) => setLayers({ ...layers, emergencyCorridorsOnly: e.target.checked })}
                  className="accent-blue-600 rounded"
                />
              </label>
            </div>

            {/* MapTiler Basemap Engine Picker */}
            <div className="pt-2 border-t border-slate-200 mt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  MapTiler Basemap Style
                </span>
                {hasMaptilerKey ? (
                  <span className="text-[9px] font-bold text-green-700 bg-green-50 px-1.5 py-0.2 rounded border border-green-200">
                    Vector
                  </span>
                ) : (
                  <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                    Fallback
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => changeBasemapStyle('outdoor')}
                  className={`px-2 py-1 rounded text-left border transition ${
                    currentMapStyle === 'outdoor'
                      ? 'bg-blue-50 border-blue-500 text-blue-800 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  🏔️ Outdoor Topo
                </button>
                <button
                  type="button"
                  onClick={() => changeBasemapStyle('streets')}
                  className={`px-2 py-1 rounded text-left border transition ${
                    currentMapStyle === 'streets'
                      ? 'bg-blue-50 border-blue-500 text-blue-800 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  🛣️ Streets
                </button>
                <button
                  type="button"
                  onClick={() => changeBasemapStyle('dataviz')}
                  className={`px-2 py-1 rounded text-left border transition ${
                    currentMapStyle === 'dataviz'
                      ? 'bg-blue-50 border-blue-500 text-blue-800 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  📊 Dataviz Light
                </button>
                <button
                  type="button"
                  onClick={() => changeBasemapStyle('hybrid')}
                  className={`px-2 py-1 rounded text-left border transition ${
                    currentMapStyle === 'hybrid'
                      ? 'bg-blue-50 border-blue-500 text-blue-800 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  🛰️ Satellite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Legend (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 border border-slate-200 p-2.5 rounded shadow-md backdrop-blur-xs text-[11px] text-slate-700 hidden md:block">
        <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1.5">Route Legend</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-green-500 rounded-full inline-block" />
            <span>🟢 Open / Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-amber-500 rounded-full inline-block" />
            <span>🟡 Warning / Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-red-500 rounded-full inline-block" />
            <span>🔴 Blocked / Impassable</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-blue-600 rounded-full inline-block" />
            <span>🔵 Emergency Arterial</span>
          </div>
        </div>
      </div>

      {/* Active Inspector Floating Card */}
      {activeInspector && (
        <div className="absolute bottom-6 right-4 z-30 w-80 sm:w-96 bg-white border border-slate-200 rounded-lg shadow-2xl p-3.5 backdrop-blur-lg animate-in fade-in slide-in-from-bottom-4 text-slate-900">
          <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2 mb-2.5">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-700">
                {activeInspector.type === 'route'
                  ? 'Strategic Route Overview'
                  : activeInspector.type === 'incident'
                  ? 'Field Incident Report'
                  : activeInspector.type === 'vehicle'
                  ? 'Logistics Telemetry'
                  : activeInspector.data.facilityType || 'Government Facility'}
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                {activeInspector.type === 'route'
                  ? activeInspector.data.route_name
                  : activeInspector.type === 'incident'
                  ? activeInspector.data.title
                  : activeInspector.type === 'vehicle'
                  ? `${activeInspector.data.vehicle_id} - ${activeInspector.data.driver_name}`
                  : activeInspector.data.name || activeInspector.data.station_name || activeInspector.data.team_name}
              </h4>
            </div>
            <button
              onClick={() => setActiveInspector(null)}
              className="text-slate-400 hover:text-slate-700 text-lg p-1 font-bold leading-none"
            >
              &times;
            </button>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            {activeInspector.type === 'route' && (
              <>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Status:</span>
                    <span
                      className={`font-bold uppercase ${
                        activeInspector.data.status === 'open'
                          ? 'text-green-700'
                          : activeInspector.data.status === 'blocked'
                          ? 'text-red-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {activeInspector.data.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Risk Rating:</span>
                    <span className="font-bold text-amber-800 uppercase">
                      {activeInspector.data.risk_level}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Corridor Length:</span>
                    <span className="font-medium text-slate-900">{activeInspector.data.length_km} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Current Delay:</span>
                    <span className="font-medium text-red-700 font-mono">
                      +{activeInspector.data.current_delay_minutes} mins
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {activeInspector.data.description}
                </p>
                <div className="text-[10px] text-slate-500">
                  Terminal points: <strong className="text-slate-800">{activeInspector.data.starting_point}</strong> → <strong className="text-slate-800">{activeInspector.data.destination}</strong>
                </div>
              </>
            )}

            {activeInspector.type === 'incident' && (
              <>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-50 text-red-700 border border-red-200">
                    {activeInspector.data.severity}
                  </span>
                  <span className="text-slate-500 text-[11px]">{activeInspector.data.location_name}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded border border-slate-200">
                  {activeInspector.data.description}
                </p>
                <div className="text-[10px] text-slate-500">
                  Reporter: <span className="text-slate-800 font-medium">{activeInspector.data.reporter_name}</span> ({activeInspector.data.department})
                </div>
                {activeInspector.data.assigned_rescue_team_name && (
                  <div className="text-[10px] text-blue-700">
                    Dispatched Unit: <strong>{activeInspector.data.assigned_rescue_team_name}</strong>
                  </div>
                )}
              </>
            )}

            {activeInspector.type === 'vehicle' && (
              <>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Cargo:</span>
                    <span className="font-semibold text-blue-700">{activeInspector.data.cargo_type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Speed:</span>
                    <span className="font-mono text-green-700 font-bold">{activeInspector.data.speed_kmh} km/h</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Destination:</span>
                    <span className="text-slate-900 truncate block">{activeInspector.data.destination}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ETA:</span>
                    <span className="text-amber-800 font-medium">{activeInspector.data.eta}</span>
                  </div>
                </div>
                {activeInspector.data.delay_reason && (
                  <div className="text-[10px] text-red-700 bg-red-50 p-1.5 rounded border border-red-200">
                    {activeInspector.data.delay_reason}
                  </div>
                )}
              </>
            )}

            {activeInspector.type === 'facility' && (
              <>
                <div className="text-[11px] text-slate-700 space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
                  <div>District: <strong className="text-slate-900">{activeInspector.data.district}</strong>, {activeInspector.data.state}</div>
                  {activeInspector.data.officer_in_charge && (
                    <div>In-Charge: <strong className="text-slate-900">{activeInspector.data.officer_in_charge}</strong></div>
                  )}
                  {activeInspector.data.contact_number && (
                    <div>Emergency Line: <strong className="text-blue-700 font-mono">{activeInspector.data.contact_number}</strong></div>
                  )}
                  {activeInspector.data.phone && (
                    <div>Phone: <strong className="text-blue-700 font-mono">{activeInspector.data.phone}</strong></div>
                  )}
                  {activeInspector.data.rainfall_mm !== undefined && (
                    <div>
                      Rainfall: <strong className="text-blue-700 font-mono">{activeInspector.data.rainfall_mm} mm</strong> | Threat Index: <strong className="text-red-700 font-mono">{activeInspector.data.landslide_threat_index}/100</strong>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
