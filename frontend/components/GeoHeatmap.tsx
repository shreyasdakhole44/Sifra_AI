'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Navigation, ShieldAlert, Filter, RefreshCw, MapPin } from 'lucide-react';
import { getRiskColor, RISK_HEX, RISK_LABEL } from '@/lib/riskColors';
import 'leaflet/dist/leaflet.css';

interface WorkerLocationPoint {
  worker_id: string;
  lat: number;
  lng: number;
  timestamp: string;
  zone: string;
  risk_score: number;
  last_incident?: string;
}

interface SiteData {
  site_id: string;
  name: string;
  lat: number;
  lng: number;
  district: string;
  incident_count: number;
  high_risk_count: number;
  risk_score: number;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface GeoHeatmapProps {
  sites: SiteData[];
  workerPoints?: WorkerLocationPoint[];
  onSelectSite?: (siteId: string) => void;
}

const DEFAULT_WORKER_POINTS: WorkerLocationPoint[] = [
  { worker_id: "OIL-W-101", lat: 27.3562, lng: 95.3214, timestamp: "2026-09-11 10:15", zone: "Duliajan Headquarters Rig Site", risk_score: 78.5, last_incident: "Gas surge at manifold" },
  { worker_id: "OIL-W-102", lat: 27.3575, lng: 95.3230, timestamp: "2026-09-11 10:20", zone: "Duliajan Headquarters Rig Site", risk_score: 64.0, last_incident: "Pressure relief valve audit" },
  { worker_id: "OIL-W-103", lat: 27.3550, lng: 95.3198, timestamp: "2026-09-11 09:45", zone: "Duliajan Station A", risk_score: 18.0, last_incident: "Standard inspection" },
  { worker_id: "OIL-W-104", lat: 27.3814, lng: 95.6311, timestamp: "2026-09-11 10:00", zone: "Digboi Oil Field & Refinery", risk_score: 84.0, last_incident: "Missing mechanical LOTO pin" },
  { worker_id: "OIL-W-105", lat: 27.3825, lng: 95.6325, timestamp: "2026-09-11 08:30", zone: "Digboi Oil Field & Refinery", risk_score: 45.0, last_incident: "Minor electrical clearance" },
  { worker_id: "OIL-W-106", lat: 27.1856, lng: 94.9213, timestamp: "2026-09-11 09:10", zone: "Moran Production Site", risk_score: 22.0, last_incident: "Routine line maintenance" },
  { worker_id: "OIL-W-107", lat: 27.1870, lng: 94.9230, timestamp: "2026-09-11 07:55", zone: "Moran Production Site", risk_score: 12.0, last_incident: "General safety audit" },
];

export const GeoHeatmap: React.FC<GeoHeatmapProps> = ({
  sites,
  workerPoints = DEFAULT_WORKER_POINTS,
  onSelectSite,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const heatLayerRef = useRef<any>(null);
  const markersGroupRef = useRef<any[]>([]);

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days'>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Filter worker points based on UI dropdown filters
  const filteredPoints = workerPoints.filter((pt) => {
    if (zoneFilter !== 'all' && !pt.zone.toLowerCase().includes(zoneFilter.toLowerCase())) {
      return false;
    }
    const colorBand = getRiskColor(pt.risk_score);
    if (riskFilter === 'high' && colorBand.color !== 'red') return false;
    if (riskFilter === 'medium' && colorBand.color !== 'orange') return false;
    if (riskFilter === 'low' && colorBand.color !== 'green') return false;
    return true;
  });

  // Calculate live legend counts matching visible markers
  const legendCounts = {
    red: filteredPoints.filter(p => getRiskColor(p.risk_score).color === 'red').length,
    orange: filteredPoints.filter(p => getRiskColor(p.risk_score).color === 'orange').length,
    green: filteredPoints.filter(p => getRiskColor(p.risk_score).color === 'green').length,
  };

  useEffect(() => {
    let isMounted = true;

    async function initLeafletMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      try {
        const L = await import('leaflet');
        require('leaflet.heat');

        if (!isMounted) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [27.35, 95.32],
          zoom: 9,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap | Oil India Limited HSE Division',
          maxZoom: 18,
        }).addTo(map);

        mapInstanceRef.current = map;
        setLeafletLoaded(true);
      } catch (e) {
        console.error('Error initializing Leaflet heatmap:', e);
      }
    }

    initLeafletMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render heatmap overlay + circle markers
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    const L = (window as any).L || require('leaflet');

    // Clear previous heat layer & circle markers
    if (heatLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
    markersGroupRef.current.forEach((m) => mapInstanceRef.current.removeLayer(m));
    markersGroupRef.current = [];

    // 1. Heat density data tuples [lat, lng, intensity]
    const heatData = filteredPoints.map((pt) => [
      pt.lat,
      pt.lng,
      Math.min(1.0, Math.max(0.2, pt.risk_score / 100)),
    ]);

    if (L.heatLayer && heatData.length > 0) {
      const heatLayer = (L as any).heatLayer(heatData, {
        radius: 28,
        blur: 18,
        maxZoom: 15,
        gradient: {
          0.2: RISK_HEX.green,
          0.5: RISK_HEX.orange,
          0.8: RISK_HEX.red,
        },
      });
      heatLayer.addTo(mapInstanceRef.current);
      heatLayerRef.current = heatLayer;
    }

    // 2. Render individual colored Circle Markers (L.circleMarker) per worker/site
    filteredPoints.forEach((pt) => {
      const band = getRiskColor(pt.risk_score);
      const colorHex = band.hex;

      const marker = L.circleMarker([pt.lat, pt.lng], {
        radius: 8,
        fillColor: colorHex,
        color: '#FFFFFF',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(mapInstanceRef.current);

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
          <div style="font-weight: bold; color: #0f172a; margin-bottom: 2px;">
            Worker ID: ${pt.worker_id}
          </div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 4px;">
            Zone: ${pt.zone}
          </div>
          <div style="margin-bottom: 4px;">
            <span style="
              background-color: ${colorHex};
              color: white;
              font-weight: bold;
              font-size: 10px;
              padding: 2px 6px;
              border-radius: 4px;
            ">
              ${band.color.toUpperCase()} RISK (${pt.risk_score.toFixed(1)}%)
            </span>
          </div>
          <div style="font-size: 11px; color: #334155; margin-top: 4px;">
            <strong>Last Activity:</strong> "${pt.last_incident || 'Routine operation log'}"
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 2px; font-family: monospace;">
            Logged: ${pt.timestamp}
          </div>
        </div>
      `);

      markersGroupRef.current.push(marker);
    });

  }, [filteredPoints, leafletLoaded]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900">Geospatial Risk Heatmap & Compliance Markers</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive Leaflet map with compliance risk color coding (Red = High Risk, Orange = Needs Attention, Green = Compliant).
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e: any) => setDateFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-700"
          >
            <option value="all">Date: All Time</option>
            <option value="today">Date: Today</option>
            <option value="7days">Date: Past 7 Days</option>
          </select>

          {/* Zone Filter */}
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-700"
          >
            <option value="all">Zone: All Operational Sites</option>
            <option value="duliajan">Zone: Duliajan HQ</option>
            <option value="digboi">Zone: Digboi Refinery</option>
            <option value="moran">Zone: Moran Fields</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e: any) => setRiskFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-700 font-bold"
          >
            <option value="all">Risk Level: Show All</option>
            <option value="high">High Risk (&gt;70%) — Red</option>
            <option value="medium">Needs Attention (40-70%) — Orange</option>
            <option value="low">Compliant (&lt;40%) — Green</option>
          </select>
        </div>
      </div>

      {/* Main Map & Category Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Leaflet Canvas */}
        <div className="lg:col-span-3 h-[380px] w-full rounded-lg border border-slate-300 overflow-hidden relative shadow-inner">
          <div ref={mapContainerRef} className="h-full w-full z-0" />
        </div>

        {/* Live Category Legend Card */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-3 pb-2 border-b border-slate-200">
              Risk Category Breakdown
            </span>

            <div className="space-y-3 text-xs">
              {/* High Risk (Red) */}
              <div className="p-2.5 bg-white rounded border border-rose-200 shadow-2xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full inline-block shrink-0" style={{ backgroundColor: RISK_HEX.red }} />
                  <div>
                    <span className="font-bold text-rose-700 block">High Risk (&gt;70%)</span>
                    <span className="text-[10px] text-slate-500">Non-compliant / Action Required</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-rose-700 text-sm px-2 py-0.5 bg-rose-50 rounded border border-rose-200">
                  {legendCounts.red}
                </span>
              </div>

              {/* Needs Attention (Orange) */}
              <div className="p-2.5 bg-white rounded border border-amber-200 shadow-2xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full inline-block shrink-0" style={{ backgroundColor: RISK_HEX.orange }} />
                  <div>
                    <span className="font-bold text-amber-700 block">Needs Attention (40-70%)</span>
                    <span className="text-[10px] text-slate-500">Medium SIF / Monitoring</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-amber-700 text-sm px-2 py-0.5 bg-amber-50 rounded border border-amber-200">
                  {legendCounts.orange}
                </span>
              </div>

              {/* Compliant (Green) */}
              <div className="p-2.5 bg-white rounded border border-emerald-200 shadow-2xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full inline-block shrink-0" style={{ backgroundColor: RISK_HEX.green }} />
                  <div>
                    <span className="font-bold text-emerald-700 block">Compliant (&lt;40%)</span>
                    <span className="text-[10px] text-slate-500">Low Risk / Normal</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-700 text-sm px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">
                  {legendCounts.green}
                </span>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-teal-50 text-teal-800 rounded border border-teal-200 text-[11px]">
            <span className="font-semibold block mb-0.5">Live Marker Filtering:</span>
            Circle markers are rendered directly from backend worker risk scores.
          </div>
        </div>
      </div>
    </div>
  );
};
