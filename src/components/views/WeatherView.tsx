import React from 'react';
import { WeatherStationData } from '../../types/vector';
import {
  CloudRain,
  CloudFog,
  Sun,
  Wind,
  Droplets,
  Eye,
  AlertTriangle,
  MapPin,
  TrendingUp,
  Thermometer,
} from 'lucide-react';

interface WeatherViewProps {
  weatherData: WeatherStationData[];
  onTriggerAlert: (station: WeatherStationData) => void;
  onSelectOnMap: (coords: [number, number], title: string) => void;
}

export const WeatherView: React.FC<WeatherViewProps> = ({
  weatherData,
  onTriggerAlert,
  onSelectOnMap,
}) => {
  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-7xl mx-auto text-slate-900 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-blue-600" />
            <span>NER Hydro-Meteorological & Landslide Threat Telemetry</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Real-time automatic weather stations (AWS) monitoring high precipitation corridors across the Himalayan foothills and Meghalaya plateau.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {weatherData.map((station) => {
          const isExtreme = station.landslide_risk_index >= 70;
          return (
            <div
              key={station.id}
              className={`bg-white border rounded shadow-xs p-3.5 flex flex-col justify-between space-y-3 transition ${
                isExtreme
                  ? 'border-red-300 ring-1 ring-red-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-blue-700 uppercase font-bold">
                    AWS-{(station.district || 'NER').toUpperCase().slice(0, 4)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                      station.condition === 'heavy_rain' || station.condition === 'storm'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : station.condition === 'fog' || station.condition === 'snow'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}
                  >
                    {(station.condition || 'clear').replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-1">{station.location_name}</h3>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {station.district}, {station.state}
                  </span>
                </div>
              </div>

              {/* Weather Data Metrics */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-100 text-[11px]">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-slate-500 text-[10px]">Rainfall Rate</div>
                    <div className="font-bold text-slate-900 font-mono">
                      {station.rainfall_mm_per_hour} mm/hr
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="text-slate-500 text-[10px]">Temperature</div>
                    <div className="font-bold text-slate-900 font-mono">
                      {station.temperature_celsius}°C
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="text-slate-500 text-[10px]">Visibility</div>
                    <div className="font-bold text-slate-900 font-mono">
                      {station.visibility_meters} m
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-sky-600" />
                  <div>
                    <div className="text-slate-500 text-[10px]">Wind Gust</div>
                    <div className="font-bold text-slate-900 font-mono">
                      {station.wind_speed_kmh} km/h
                    </div>
                  </div>
                </div>
              </div>

              {/* Landslide Threat Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Calculated Landslide Hazard Index:</span>
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      isExtreme ? 'text-red-600' : 'text-amber-600'
                    }`}
                  >
                    {station.landslide_risk_index} / 100
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isExtreme ? 'bg-red-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${station.landslide_risk_index}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => onSelectOnMap(station.coordinates, station.location_name)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold transition"
                >
                  Locate AWS
                </button>

                <button
                  onClick={() => onTriggerAlert(station)}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[11px] shadow-xs transition"
                >
                  Broadcast Weather Warning
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
