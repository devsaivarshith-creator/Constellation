import { useState, useRef, useEffect, useCallback } from 'react';
import { Maximize2, Plus, Minus, RotateCcw } from 'lucide-react';
import './Globe3D.css';

// Geographic Coordinates for intelligence hubs
const HUBS = [
  { id: 'mumbai', name: 'Mumbai', lat: 19.076, lon: 72.877, type: 'syndicate', activeCases: 6, risk: 'High', links: 48 },
  { id: 'delhi', name: 'New Delhi', lat: 28.6139, lon: 77.209, type: 'syndicate', activeCases: 4, risk: 'High', links: 39 },
  { id: 'dubai', name: 'Dubai', lat: 25.2048, lon: 55.2708, type: 'hawala', activeCases: 9, risk: 'Critical', links: 82 },
  { id: 'singapore', name: 'Singapore', lat: 1.3521, lon: 103.8198, type: 'maritime', activeCases: 5, risk: 'Medium', links: 64 },
  { id: 'tokyo', name: 'Tokyo', lat: 35.6762, lon: 139.6503, type: 'syndicate', activeCases: 3, risk: 'Medium', links: 29 },
  { id: 'nairobi', name: 'Nairobi', lat: -1.2921, lon: 36.8219, type: 'hawala', activeCases: 4, risk: 'High', links: 31 },
  { id: 'london', name: 'London', lat: 51.5074, lon: -0.1278, type: 'maritime', activeCases: 7, risk: 'Medium', links: 55 },
];

// Transit links connecting hubs
const ROUTES = [
  { from: 'mumbai', to: 'dubai', type: 'hawala', color: '#f59e0b' },
  { from: 'mumbai', to: 'delhi', type: 'syndicate', color: '#ff4d4f' },
  { from: 'dubai', to: 'nairobi', type: 'hawala', color: '#f59e0b' },
  { from: 'mumbai', to: 'singapore', type: 'maritime', color: '#06b6d4' },
  { from: 'singapore', to: 'tokyo', type: 'syndicate', color: '#ff4d4f' },
  { from: 'dubai', to: 'london', type: 'maritime', color: '#06b6d4' },
  { from: 'delhi', to: 'dubai', type: 'hawala', color: '#f59e0b' },
];

function latLonToSphere(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return {
    x: -(radius * Math.sin(phi) * Math.cos(theta)),
    z: radius * Math.sin(phi) * Math.sin(theta),
    y: radius * Math.cos(phi)
  };
}

function rotate3D(p, rotX, rotY) {
  // Rotate around Y (yaw)
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x1 = p.x * cosY + p.z * sinY;
  const z1 = -p.x * sinY + p.z * cosY;

  // Rotate around X (pitch)
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const y2 = p.y * cosX - z1 * sinX;
  const z2 = p.y * sinX + z1 * cosX;

  return { x: x1, y: y2, z: z2 };
}

export default function Globe3D() {
  const canvasRef = useRef(null);
  const rotationRef = useRef({ x: 0.25, y: -1.35 });
  const zoomRef = useRef(1);
  const hoveredHubRef = useRef(null);

  const [hoveredHub, setHoveredHub] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const pulsePhaseRef = useRef(0);
  const animFrameRef = useRef(null);
  const projectedHubsRef = useRef([]);

  // Default reset position
  const resetRotation = () => {
    rotationRef.current = { x: 0.25, y: -1.35 };
    zoomRef.current = 1;
  };

  const zoomIn = () => {
    zoomRef.current = Math.min(zoomRef.current + 0.2, 1.8);
  };

  const zoomOut = () => {
    zoomRef.current = Math.max(zoomRef.current - 0.2, 0.6);
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      rotationRef.current = {
        x: Math.max(-1.2, Math.min(1.2, rotationRef.current.x + dy * 0.006)),
        y: rotationRef.current.y + dx * 0.006
      };
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    } else {
      // Check hover on projected hubs
      let found = null;
      for (const h of projectedHubsRef.current) {
        if (h.z > 0) { // Only front hemisphere
          const dist = Math.hypot(h.screenX - mouseX, h.screenY - mouseY);
          if (dist < 18) {
            found = h;
            break;
          }
        }
      }
      if (found?.id !== hoveredHubRef.current?.id) {
        hoveredHubRef.current = found;
        setHoveredHub(found);
      }
      if (found) {
        setTooltipPos({ x: found.screenX, y: found.screenY });
      }
    }
  }, []);

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    zoomRef.current = Math.max(0.6, Math.min(1.8, zoomRef.current + delta));
  }, []);

  // Main Canvas Render Loop (silky smooth, zero React state re-renders per frame)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let isRunning = true;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const baseRadius = Math.min(width, height) * 0.42;

    const render = () => {
      if (!isRunning) return;
      pulsePhaseRef.current = (pulsePhaseRef.current + 0.02) % (Math.PI * 2);

      // Auto gentle yaw rotation when not dragging
      if (!isDraggingRef.current) {
        rotationRef.current.y += 0.0015;
      }

      const r = baseRadius * zoomRef.current;
      const rot = rotationRef.current;

      ctx.clearRect(0, 0, width, height);

      // 1. Ambient Glow Halo
      const gradient = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 1.35);
      gradient.addColorStop(0, 'rgba(0, 230, 138, 0.16)');
      gradient.addColorStop(0.5, 'rgba(0, 230, 138, 0.05)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // 2. Wireframe Sphere Rings (Latitude & Longitude)
      ctx.lineWidth = 1;

      // Latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let first = true;
        for (let lon = 0; lon <= 360; lon += 8) {
          const sp = latLonToSphere(lat, lon, r);
          const rp = rotate3D(sp, rot.x, rot.y);
          const screenX = cx + rp.x;
          const screenY = cy + rp.y;

          if (rp.z > 0) {
            ctx.strokeStyle = `rgba(0, 230, 138, ${0.12 + (rp.z / r) * 0.18})`;
          } else {
            ctx.strokeStyle = 'rgba(0, 230, 138, 0.03)';
          }

          if (first) {
            ctx.moveTo(screenX, screenY);
            first = false;
          } else {
            ctx.lineTo(screenX, screenY);
          }
        }
        ctx.stroke();
      }

      // Longitude lines
      for (let lon = 0; lon < 360; lon += 40) {
        ctx.beginPath();
        let first = true;
        for (let lat = -90; lat <= 90; lat += 6) {
          const sp = latLonToSphere(lat, lon, r);
          const rp = rotate3D(sp, rot.x, rot.y);
          const screenX = cx + rp.x;
          const screenY = cy + rp.y;

          if (rp.z > 0) {
            ctx.strokeStyle = `rgba(0, 230, 138, ${0.1 + (rp.z / r) * 0.16})`;
          } else {
            ctx.strokeStyle = 'rgba(0, 230, 138, 0.03)';
          }

          if (first) {
            ctx.moveTo(screenX, screenY);
            first = false;
          } else {
            ctx.lineTo(screenX, screenY);
          }
        }
        ctx.stroke();
      }

      // Outer Rim Glow
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 230, 138, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 3. Project Hub Coordinates
      const projected = HUBS.map(hub => {
        const sp = latLonToSphere(hub.lat, hub.lon, r);
        const rp = rotate3D(sp, rot.x, rot.y);
        return {
          ...hub,
          screenX: cx + rp.x,
          screenY: cy + rp.y,
          z: rp.z
        };
      });
      projectedHubsRef.current = projected;

      // 4. Draw Curved Transit Routes
      ROUTES.forEach(route => {
        const fromHub = projected.find(h => h.id === route.from);
        const toHub = projected.find(h => h.id === route.to);
        if (!fromHub || !toHub) return;

        if (fromHub.z > -r * 0.3 || toHub.z > -r * 0.3) {
          ctx.beginPath();
          ctx.moveTo(fromHub.screenX, fromHub.screenY);

          const midX = (fromHub.screenX + toHub.screenX) / 2;
          const midY = (fromHub.screenY + toHub.screenY) / 2;
          const dist = Math.hypot(toHub.screenX - fromHub.screenX, toHub.screenY - fromHub.screenY);
          const elevation = dist * 0.22;
          const cpX = midX;
          const cpY = midY - elevation;

          ctx.quadraticCurveTo(cpX, cpY, toHub.screenX, toHub.screenY);
          ctx.strokeStyle = route.color;
          ctx.lineWidth = 1.4;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Animated moving pulse particle along the curve
          const t = (pulsePhaseRef.current / (Math.PI * 2) + (route.from.charCodeAt(0) % 5) * 0.2) % 1;
          const pulseX = (1 - t) * (1 - t) * fromHub.screenX + 2 * (1 - t) * t * cpX + t * t * toHub.screenX;
          const pulseY = (1 - t) * (1 - t) * fromHub.screenY + 2 * (1 - t) * t * cpY + t * t * toHub.screenY;

          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 3, 0, Math.PI * 2);
          ctx.fillStyle = route.color;
          ctx.shadowColor = route.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // 5. Draw Hub Nodes
      projected.forEach(hub => {
        if (hub.z > -r * 0.1) {
          const alpha = Math.max(0.2, (hub.z + r * 0.1) / (r * 1.1));

          let nodeColor = '#ff4d4f';
          if (hub.type === 'hawala') nodeColor = '#f59e0b';
          if (hub.type === 'maritime') nodeColor = '#06b6d4';

          const ringRadius = 5 + (Math.sin(pulsePhaseRef.current * 2) + 1) * 3;
          ctx.beginPath();
          ctx.arc(hub.screenX, hub.screenY, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = nodeColor;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(hub.screenX, hub.screenY, 4, 0, Math.PI * 2);
          ctx.fillStyle = nodeColor;
          ctx.shadowColor = nodeColor;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.font = '600 11px Inter, sans-serif';
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
          ctx.fillText(hub.name, hub.screenX + 8, hub.screenY + 3);
        }
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="globe-container">
      {/* Category Pills Header */}
      <div className="globe-legend">
        <div className="legend-tag tag-syndicate">
          <span className="legend-dot dot-red" />
          <span>Syndicate Hubs</span>
        </div>
        <div className="legend-tag tag-hawala">
          <span className="legend-dot dot-amber" />
          <span>Hawala Corridor</span>
        </div>
        <div className="legend-tag tag-maritime">
          <span className="legend-dot dot-cyan" />
          <span>Maritime Transit</span>
        </div>
      </div>

      {/* Floating Control Toolbar */}
      <div className="globe-controls">
        <button className="control-btn" title="Expand View">
          <Maximize2 size={14} />
        </button>
        <button className="control-btn" onClick={zoomIn} title="Zoom In">
          <Plus size={15} />
        </button>
        <button className="control-btn" onClick={zoomOut} title="Zoom Out">
          <Minus size={15} />
        </button>
        <button className="control-btn" onClick={resetRotation} title="Reset Rotation">
          <RotateCcw size={14} />
        </button>
      </div>

      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        width={440}
        height={380}
        className="globe-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Hub Intel Hover Card */}
      {hoveredHub && (
        <div
          className="hub-tooltip"
          style={{
            left: `${tooltipPos.x + 16}px`,
            top: `${tooltipPos.y - 30}px`,
          }}
        >
          <div className="hub-tooltip-title">
            <span className={`status-dot dot-${hoveredHub.type === 'syndicate' ? 'red' : hoveredHub.type === 'hawala' ? 'amber' : 'cyan'}`} />
            <strong>{hoveredHub.name}</strong>
          </div>
          <div className="hub-tooltip-row">
            <span>Threat Score:</span>
            <span className={`threat-${hoveredHub.risk.toLowerCase()}`}>{hoveredHub.risk}</span>
          </div>
          <div className="hub-tooltip-row">
            <span>Active Cases:</span>
            <span>{hoveredHub.activeCases}</span>
          </div>
          <div className="hub-tooltip-row">
            <span>Network Links:</span>
            <span>{hoveredHub.links} detected</span>
          </div>
        </div>
      )}

      {/* Interactive Guidance Footer */}
      <div className="globe-footer-caption">
        <span className="status-dot dot-green pulse-indicator" />
        <span>Drag to rotate 3D globe • Scroll to zoom • Hover hubs to inspect</span>
      </div>
    </div>
  );
}
