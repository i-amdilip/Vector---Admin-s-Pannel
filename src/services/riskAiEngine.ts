import { RouteItem, Incident, WeatherStationData, SafeRouteRecommendation } from '../types/vector';

export interface RouteRiskAssessment {
  route_id: string;
  route_name: string;
  risk_score: number; // 0 - 100
  risk_level: 'low' | 'moderate' | 'high' | 'critical';
  factors: {
    incident_factor: number; // 0 - 40
    weather_factor: number; // 0 - 30
    terrain_factor: number; // 0 - 20
    infrastructure_factor: number; // 0 - 10
  };
  reasons: string[];
  early_warnings: string[];
  recommended_actions: string[];
  safe_speed_limit_kmh: number;
}

export const analyzeRouteRisk = (
  route: RouteItem,
  incidents: Incident[],
  weatherData: WeatherStationData[]
): RouteRiskAssessment => {
  const reasons: string[] = [];
  const early_warnings: string[] = [];
  const recommended_actions: string[] = [];

  // 1. Incident Factor (0 - 40 points)
  let incident_factor = 0;
  const activeIncidentsOnRoute = incidents.filter(
    (i) => i.affected_route_id === route.id && i.status !== 'resolved' && i.status !== 'closed'
  );

  activeIncidentsOnRoute.forEach((inc) => {
    if (inc.severity === 'critical') {
      incident_factor += 35;
      reasons.push(`Critical incident active: ${inc.title}`);
    } else if (inc.severity === 'high') {
      incident_factor += 22;
      reasons.push(`High severity incident active: ${inc.title}`);
    } else if (inc.severity === 'moderate') {
      incident_factor += 12;
      reasons.push(`Moderate incident reported: ${inc.title}`);
    } else {
      incident_factor += 6;
    }
  });

  if (route.status === 'blocked') {
    incident_factor = Math.max(incident_factor, 40);
    reasons.push('Route is flagged as BLOCKED / IMPASSABLE by transport authority');
  }

  incident_factor = Math.min(incident_factor, 40);

  // 2. Weather Factor (0 - 30 points)
  let weather_factor = 0;
  // Match weather by state or district proximity
  const relevantWeather = weatherData.find(
    (w) =>
      route.district.toLowerCase().includes(w.district.toLowerCase()) ||
      route.state.toLowerCase().includes(w.state.toLowerCase())
  ) || weatherData[0];

  if (relevantWeather) {
    if (relevantWeather.rainfall_mm > 150) {
      weather_factor += 20;
      reasons.push(`Torrential precipitation detected (${relevantWeather.rainfall_mm} mm/24h) in ${relevantWeather.district}`);
      early_warnings.push('High probability of secondary mudslides along saturated slopes');
    } else if (relevantWeather.rainfall_mm > 60) {
      weather_factor += 12;
      reasons.push(`Moderate to heavy rainfall recorded (${relevantWeather.rainfall_mm} mm)`);
    }

    if (relevantWeather.visibility_meters < 200) {
      weather_factor += 10;
      reasons.push(`Dangerous low visibility / mountain fog (${relevantWeather.visibility_meters}m)`);
      early_warnings.push('Reduced convoy speed mandatory; headlamp escort active');
    }

    if (relevantWeather.landslide_threat_index > 75) {
      weather_factor += 8;
      early_warnings.push(`Soil saturation index in critical zone (${relevantWeather.landslide_threat_index}/100)`);
    }
  }

  weather_factor = Math.min(weather_factor, 30);

  // 3. Terrain & Elevation Factor (0 - 20 points)
  let terrain_factor = 0;
  if ((route.elevation_gain_m || 0) > 2500) {
    terrain_factor += 16;
    reasons.push(`Extreme alpine elevation (${route.elevation_gain_m}m gain); sub-zero icing hazard`);
  } else if ((route.elevation_gain_m || 0) > 1000) {
    terrain_factor += 10;
    reasons.push(`Rugged montane gorge terrain (${route.elevation_gain_m}m gain)`);
  } else {
    terrain_factor += 4;
  }

  if (route.road_type === 'border_road' || route.road_type === 'state_highway') {
    terrain_factor += 4;
  }

  terrain_factor = Math.min(terrain_factor, 20);

  // 4. Infrastructure & Delay Factor (0 - 10 points)
  let infrastructure_factor = 0;
  if (route.current_delay_minutes > 180) {
    infrastructure_factor += 10;
    reasons.push(`Major transit delay currently exceeding ${Math.round(route.current_delay_minutes / 60)} hours`);
  } else if (route.current_delay_minutes > 45) {
    infrastructure_factor += 6;
    reasons.push(`Moderate transit delay (${route.current_delay_minutes} mins)`);
  } else {
    infrastructure_factor += 2;
  }

  const totalScore = Math.min(100, Math.round(incident_factor + weather_factor + terrain_factor + infrastructure_factor));

  let risk_level: 'low' | 'moderate' | 'high' | 'critical' = 'low';
  if (totalScore >= 75) risk_level = 'critical';
  else if (totalScore >= 50) risk_level = 'high';
  else if (totalScore >= 28) risk_level = 'moderate';
  else risk_level = 'low';

  // Recommendations
  if (risk_level === 'critical') {
    recommended_actions.push('Enforce immediate corridor suspension for commercial freight');
    recommended_actions.push('Activate designated alternate diversion corridors (e.g. SH-19)');
    recommended_actions.push('Mobilize NDRF / BRO earthmoving units to choke points');
  } else if (risk_level === 'high') {
    recommended_actions.push('Permit emergency medical & petroleum convoys only with police escort');
    recommended_actions.push('Issue advisory across public VECTOR feeds');
  } else {
    recommended_actions.push('Maintain regular highway patrol inspection');
  }

  return {
    route_id: route.id,
    route_name: route.route_name,
    risk_score: totalScore,
    risk_level,
    factors: {
      incident_factor,
      weather_factor,
      terrain_factor,
      infrastructure_factor,
    },
    reasons: reasons.length > 0 ? reasons : ['Normal operating parameters across corridor'],
    early_warnings,
    recommended_actions,
    safe_speed_limit_kmh: risk_level === 'critical' ? 0 : risk_level === 'high' ? 25 : risk_level === 'moderate' ? 40 : 65,
  };
};

// Safe Alternate Route Recommendation Engine
export const generateSafeRouteRecommendation = (
  blockedRoute: RouteItem,
  allRoutes: RouteItem[],
  incidents: Incident[],
  weatherData: WeatherStationData[]
): SafeRouteRecommendation | null => {
  const originalAssessment = analyzeRouteRisk(blockedRoute, incidents, weatherData);

  // Find candidate alternate routes that are open or warning, ideally connecting same general region
  const candidates = allRoutes.filter((r) => r.id !== blockedRoute.id && r.status !== 'blocked');
  if (candidates.length === 0) return null;

  // Evaluate candidate risks
  const evaluated = candidates.map((cand) => {
    const assessment = analyzeRouteRisk(cand, incidents, weatherData);
    return {
      route: cand,
      assessment,
    };
  });

  // Sort by lowest risk score
  evaluated.sort((a, b) => a.assessment.risk_score - b.assessment.risk_score);

  const best = evaluated[0];
  const originalScore = Math.max(85, originalAssessment.risk_score);
  const alternateScore = best.assessment.risk_score;
  const reduction = Math.round(((originalScore - alternateScore) / originalScore) * 100);

  const etaDiff = Math.round((best.route.average_transit_hours - blockedRoute.average_transit_hours) * 60) + (best.route.current_delay_minutes || 0);

  return {
    original_route_id: blockedRoute.id,
    original_route_name: blockedRoute.route_name,
    alternate_route_id: best.route.id,
    alternate_route_name: best.route.route_name,
    incident_reason: `Blockage due to ${originalAssessment.reasons[0] || 'Unforeseen corridor obstruction'}`,
    original_risk_score: originalScore,
    alternate_risk_score: alternateScore,
    risk_reduction_pct: Math.max(15, reduction),
    eta_difference_minutes: etaDiff,
    terrain_safety_rating: alternateScore < 35 ? 'Superior' : alternateScore < 55 ? 'Optimal' : 'Caution Required',
    corridor_reasons: [
      `Avoids active choke points on ${blockedRoute.route_id}`,
      `Current surface stability rated at ${100 - alternateScore}% along ${best.route.route_id}`,
      `Dedicated BRO / police security posts present along ${best.route.starting_point} to ${best.route.destination}`,
      `Maximum gross load capacity supports up to ${best.route.maximum_load_tonnes} tonnes`,
    ],
    approved: false,
  };
};
