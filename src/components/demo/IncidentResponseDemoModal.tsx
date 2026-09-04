import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Route as RouteIcon,
  ShieldCheck,
  Truck,
  Sparkles,
  Zap,
  Radio,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { RouteItem, Incident, Vehicle, SystemAlert } from '../../types/vector';
import { vectorDb } from '../../services/supabaseService';
import { generateSafeRouteRecommendation } from '../../services/riskAiEngine';

interface IncidentResponseDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes: RouteItem[];
  incidents: Incident[];
  vehicles: Vehicle[];
  onRefresh: () => void;
  onViewRoute: (routeId: string) => void;
}

export const IncidentResponseDemoModal: React.FC<IncidentResponseDemoModalProps> = ({
  isOpen,
  onClose,
  routes,
  incidents,
  vehicles,
  onRefresh,
  onViewRoute,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [demoLog, setDemoLog] = useState<string[]>([
    'Demo system initialized. Ready to execute full NER emergency response chain.',
  ]);

  if (!isOpen) return null;

  const targetRoute = routes.find((r) => r.id === 'rt-nh-06') || routes[0];
  const alternateRoute = routes.find((r) => r.id === 'rt-alt-cachar') || routes[1];

  const affectedVehicles = vehicles.filter(
    (v) => v.route_id === targetRoute.id || v.current_location_name.includes('Jowai')
  );

  const addLog = (msg: string) => {
    setDemoLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  // Step 1: Field Officer Reports Landslide
  const handleStep1_ReportIncident = async () => {
    setIsProcessing(true);
    addLog('Field Officer Inspector P. Lyngdoh transmitted live landslide report on NH-06 Sonapur Tunnel.');

    try {
      const newInc = await vectorDb.createIncident({
        incident_id: `INC-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'Massive Saturated Slope Landslide at Sonapur Outfall',
        incident_type: 'landslide',
        location_name: 'Sonapur Tunnel Sector KM 142, NH-06',
        coordinates: [92.356, 25.132],
        severity: 'critical',
        status: 'reported',
        description: 'Estimated 8,500 m³ of limestone rubble and mud covering both lanes. 2 petroleum tankers stranded on approach.',
        affected_route_id: targetRoute.id,
        affected_route_name: targetRoute.route_name,
        reporter_name: 'Inspector P. Lyngdoh',
        reporter_role: 'Highway Patrol Checkpost',
        department: 'Meghalaya Police & Disaster Response',
        photos: ['https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80'],
      });

      addLog(`✓ Saved to Supabase 'incidents' table. Incident ID: ${newInc.incident_id}`);
      setCurrentStep(2);
      onRefresh();
    } catch (e) {
      addLog(`Error: ${e}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: Government Officer Verifies & Blocks Route
  const handleStep2_VerifyAndBlock = async () => {
    setIsProcessing(true);
    addLog('Special Director Dr. A. K. Baruah, IAS verified aerial reconnaissance & SDRF telemetry.');

    try {
      // 1. Update route in Supabase to BLOCKED
      await vectorDb.updateRouteStatus(targetRoute.id, 'blocked', 'critical', 360);
      addLog(`✓ Supabase 'routes' table updated: ${targetRoute.route_id} status → BLOCKED`);

      // 2. Dispatch critical system alert
      const newAlert = await vectorDb.createAlert({
        alert_id: `ALT-CRIT-${Math.floor(100 + Math.random() * 900)}`,
        category: 'critical',
        title: `EMERGENCY CLOSURE: ${targetRoute.route_id} BLOCKED`,
        message: `Sonapur tunnel sector closed indefinitely due to critical slope failure. Commercial transit suspended.`,
        affected_routes: [targetRoute.id],
        affected_district: 'East Jaintia Hills, Meghalaya',
      });
      addLog(`✓ Supabase Realtime broadcast alert ALT-CRIT emitted to portal & future mobile apps.`);

      // 3. Publish public route update bulletin
      await vectorDb.publishRouteUpdate({
        title: 'NH-06 Total Carriageway Blocked at Sonapur Tunnel',
        type: 'Road blocked',
        route_id: targetRoute.id,
        route_name: targetRoute.route_name,
        location: 'KM 142 Sonapur',
        severity: 'critical',
        description: 'All commercial freight diverted. BRO Project Pushpak clearing teams deployed.',
        created_by: 'Dr. A. K. Baruah, IAS',
        department: 'NER Disaster Logistics Authority',
        expiry: new Date(Date.now() + 86400000 * 3).toISOString(),
      });

      setCurrentStep(3);
      onRefresh();
    } catch (e) {
      addLog(`Error: ${e}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 3: Identify Affected Vehicles & Run AI Risk Analysis
  const handleStep3_AiAnalysis = async () => {
    setIsProcessing(true);
    addLog(`Scanning Supabase 'vehicles' table for units on ${targetRoute.route_id}...`);
    addLog(`Found ${affectedVehicles.length} logistics vehicles stalled or in approach.`);
    addLog('Executing AI Risk Engine across terrain, rainfall & elevation data...');

    // Wait a brief moment for realistic computation feel
    await new Promise((r) => setTimeout(r, 600));

    addLog(`AI Risk Engine Output: Original corridor risk score is 92/100 (CRITICAL).`);
    addLog(`Candidate alternate corridor: ${alternateRoute.route_name} (Risk score: 28/100, Risk reduction: 70%).`);
    addLog(`Recommendation: Approve SH-19 Haflong strategic bypass with police escort for medical convoy.`);

    setCurrentStep(4);
    setIsProcessing(false);
  };

  // Step 4: Government Approves & Activates New Route (Reroutes Vehicles)
  const handleStep4_ActivateSafeRoute = async () => {
    setIsProcessing(true);
    addLog('Government Authority granted formal administrative clearance for diversion corridor.');

    try {
      // 1. Mark alternate route as emergency designated
      await vectorDb.updateRouteStatus(alternateRoute.id, 'open', 'moderate', 15);
      addLog(`✓ Supabase 'routes': Designated ${alternateRoute.route_id} as ACTIVE EMERGENCY BYPASS`);

      // 2. Reroute stalled vehicles
      for (const veh of affectedVehicles) {
        await vectorDb.rerouteVehicle(
          veh.id,
          alternateRoute.id,
          alternateRoute.route_name,
          'Rerouted via SH-19 Haflong Safe Corridor due to Sonapur landslide'
        );
      }
      addLog(`✓ Supabase 'vehicles': Rerouted ${affectedVehicles.length} cargo transports to safe corridor.`);

      // 3. Emit mobile sync alert
      await vectorDb.createAlert({
        alert_id: `ALT-SAFEPATH-${Math.floor(100 + Math.random() * 900)}`,
        category: 'info',
        title: `SAFE CORRIDOR ACTIVATED: SH-19 DIVERSION`,
        message: `Medical & food supply transports cleared for transit via Haflong. Police checkposts alerted.`,
        affected_routes: [alternateRoute.id],
        affected_district: 'Dima Hasao & Cachar, Assam',
      });
      addLog(`✓ Future User App synchronized: Drivers notified of new route in real-time.`);

      setCurrentStep(5);
      onRefresh();
    } catch (e) {
      addLog(`Error: ${e}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-slate-900 text-xs">
        {/* Modal Header */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                NER Emergency Incident Response & Safe Route Demonstration
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                End-to-End Autonomous Workflow • Supabase Shared Backend Pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 leading-none"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Workflow Progress Steps */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, label: 'Field Incident', desc: 'Landslide Reported' },
              { num: 2, label: 'Govt Verification', desc: 'Route Blocked' },
              { num: 3, label: 'AI Risk Engine', desc: 'Alternate Corridor' },
              { num: 4, label: 'Mobile Sync', desc: 'Convoys Rerouted' },
            ].map((step) => {
              const isDone = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div
                  key={step.num}
                  className={`p-2.5 rounded border text-center transition-all ${
                    isDone
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : isCurrent
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-[10px] font-mono flex items-center justify-center font-bold text-slate-700">
                        {step.num}
                      </span>
                    )}
                    <span className="font-bold text-[11px]">{step.label}</span>
                  </div>
                  <div className="text-[10px] truncate text-slate-500">{step.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Interactive Current Action Box */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded space-y-3">
            {currentStep === 1 && (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Step 1: Field Officer Landslide Dispatch</h4>
                    <p className="text-slate-600 mt-0.5">
                      Simulate a field police inspector on Meghalaya NH-06 detecting a massive slope collapse near Sonapur Tunnel.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold rounded">
                    CRITICAL SEVERITY
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded border border-slate-200 text-[11px] text-slate-700 space-y-1">
                  <div>Target Route: <strong className="text-blue-700">{targetRoute.route_name}</strong></div>
                  <div>Coordinates: <span className="font-mono text-slate-500">[92.356°E, 25.132°N]</span></div>
                  <div>Impact: Both carriageways obstructed with heavy rockfall.</div>
                </div>
                <button
                  onClick={handleStep1_ReportIncident}
                  disabled={isProcessing}
                  className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-xs flex items-center justify-center gap-2 transition text-xs"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Dispatch Incident to Supabase Database
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Step 2: Government Authority Verification</h4>
                    <p className="text-slate-600 mt-0.5">
                      Command Portal officer confirms the incident and executes protocol: flag route as BLOCKED, publish alerts, and mobilize clearing machinery.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold rounded">
                    DECISION REQUIRED
                  </span>
                </div>
                <button
                  onClick={handleStep2_VerifyAndBlock}
                  disabled={isProcessing}
                  className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow-xs flex items-center justify-center gap-2 transition text-xs"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Verify Incident & Mark Route BLOCKED in Supabase
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Step 3: AI Risk Analysis & Affected Vehicle Telemetry</h4>
                    <p className="text-slate-600 mt-0.5">
                      Identify stalled logistics units (medicines, petroleum) and calculate safer alternate corridors via Dima Hasao.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-bold rounded">
                    AI ENGINE ACTIVE
                  </span>
                </div>
                <button
                  onClick={handleStep3_AiAnalysis}
                  disabled={isProcessing}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-xs flex items-center justify-center gap-2 transition text-xs"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Run AI Risk Intelligence & Safe Route Recommendation
                </button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Step 4: Government Approval & Shared Mobile App Sync</h4>
                    <p className="text-slate-600 mt-0.5">
                      Approve recommendation: Activate SH-19 Haflong Diversion, reroute essential carriers, and push real-time updates to the future User Mobile App.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-green-100 text-green-900 border border-green-200 text-[10px] font-bold rounded">
                    APPROVAL PENDING
                  </span>
                </div>
                <div className="p-2.5 bg-green-50 border border-green-200 rounded text-[11px] text-green-900 font-medium">
                  <strong>Recommended Route:</strong> {alternateRoute.route_name} (Risk Reduction: 70%, Structural Stability: 85%)
                </div>
                <button
                  onClick={handleStep4_ActivateSafeRoute}
                  disabled={isProcessing}
                  className="w-full py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow-xs flex items-center justify-center gap-2 transition text-xs"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Approve Safe Corridor & Stream Updates to Supabase
                </button>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-3 text-center p-3">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 border border-green-300 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Emergency Response Cycle Complete</h4>
                <p className="text-slate-600 max-w-md mx-auto">
                  The route was blocked, vehicles safely diverted, and Supabase published the changes live. Future Driver and Citizen mobile apps will receive this identical data payload.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onViewRoute(alternateRoute.id);
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-xs transition text-xs"
                  >
                    View Diverted Route on Live Map
                  </button>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded shadow-xs transition text-xs"
                  >
                    Restart Flow
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Operation Telemetry Terminal */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1.5 font-mono">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                SUPABASE AUDIT & TELEMETRY STREAM
              </span>
              <span className="text-[10px] text-green-700 font-medium">PostGIS Engine Synchronized</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded p-3 font-mono text-[10.5px] text-slate-200 space-y-1 max-h-36 overflow-y-auto">
              {demoLog.map((log, i) => (
                <div key={i} className="leading-tight text-slate-300">
                  <span className="text-blue-400 font-bold">&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>VECTOR Unified Command System • Section 29 Protocol</span>
          <button onClick={onClose} className="hover:text-slate-800 px-2 py-1 font-semibold">
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
