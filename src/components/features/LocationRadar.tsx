import React, { useState, useEffect, useRef } from 'react';
import { Compass, MapPin, Wand2, Battery, RefreshCw, Layers, Zap, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCouple } from '../../context/CoupleContext';
import { appStorage } from '../../services/storage';

// Mathematical Geodesy Utilities
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  return (Math.round((theta * 180) / Math.PI) + 360) % 360;
}

export const LocationRadar: React.FC = () => {
  const { sendEvent, onEvent, myRole, partnerRole, partnerOnline, pairingCode, setShowPairingModal } = useCouple();

  const [viewMode, setViewMode] = useState<'compass' | 'map'>('compass');

  // Real GPS Coordinates with persistence
  const [myCoords, setMyCoords] = useState<{ lat: number; lng: number }>(() => {
    const saved = appStorage.getMyLocation();
    return saved ? { lat: saved.lat, lng: saved.lng } : { lat: 30.6586, lng: 104.0648 };
  });

  const [herCoords, setHerCoords] = useState<{ lat: number; lng: number }>(() => {
    const saved = appStorage.getPartnerLocation();
    return saved ? { lat: saved.lat, lng: saved.lng } : { lat: 30.6486, lng: 104.0758 };
  });

  const [myAddress, setMyAddress] = useState(() => {
    const saved = appStorage.getMyLocation();
    return saved?.address || '尚未校准定位 · 点击下方按钮获取真机GPS';
  });

  const [herAddress, setHerAddress] = useState(() => {
    const saved = appStorage.getPartnerLocation();
    return saved?.address || '尚未接入定位 · 对方上线后自动同步';
  });

  const [isLocating, setIsLocating] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [distanceMeters, setDistanceMeters] = useState(() => {
    return calculateDistanceMeters(myCoords.lat, myCoords.lng, herCoords.lat, herCoords.lng);
  });
  const [trueBearing, setTrueBearing] = useState(() => {
    return calculateBearing(myCoords.lat, myCoords.lng, herCoords.lat, herCoords.lng);
  });
  const [isPulsing, setIsPulsing] = useState(false);

  // Weasley Clock 9-state life status system
  const WEASLEY_STATUSES = [
    { id: 'home', label: '家宅安歇', icon: '🏰', desc: '炉火融融 · 守候身心' },
    { id: 'transit', label: '归途漫漫', icon: '🚂', desc: '疾驰于长街晚风之中' },
    { id: 'work', label: '全神贯注', icon: '📜', desc: '深思研习 · 墨香未干' },
    { id: 'tea', label: '茶歇漫步', icon: '☕', desc: '品尝甜点与黄油啤酒' },
    { id: 'sleep', label: '梦境漫游', icon: '🌙', desc: '星夜深沉 · 入梦相见' },
    { id: 'miss', label: '极度想你', icon: '💫', desc: '心弦微颤 · 同频感应' }
  ];

  const [myStatusIndex, setMyStatusIndex] = useState(1); // 归途漫漫
  const [herStatusIndex, setHerStatusIndex] = useState(5); // 极度想你

  // Listen for partner real-time updates
  useEffect(() => {
    const unsubLocation = onEvent<{ lat: number; lng: number; address?: string }>('LOCATION_UPDATE', (payload) => {
      if (payload?.lat && payload?.lng) {
        setHerCoords({ lat: payload.lat, lng: payload.lng });
        if (payload.address) setHerAddress(payload.address);
        appStorage.setPartnerLocation({
          lat: payload.lat,
          lng: payload.lng,
          address: payload.address,
          updatedAt: Date.now()
        });
        setDistanceMeters(calculateDistanceMeters(myCoords.lat, myCoords.lng, payload.lat, payload.lng));
        setTrueBearing(calculateBearing(myCoords.lat, myCoords.lng, payload.lat, payload.lng));
      }
    });

    const unsubStatus = onEvent<{ statusIndex: number }>('WEASLEY_STATUS', (payload) => {
      if (typeof payload?.statusIndex === 'number') {
        setHerStatusIndex(payload.statusIndex);
      }
    });

    const unsubPulse = onEvent('LUMOS_PULSE', () => {
      setIsPulsing(true);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([30, 40, 50, 40, 80]);
        } catch {}
      }
      setTimeout(() => setIsPulsing(false), 2400);
    });

    return () => {
      unsubLocation();
      unsubStatus();
      unsubPulse();
    };
  }, [onEvent, myCoords]);

  const handleToggleMyStatus = (idx: number) => {
    setMyStatusIndex(idx);
    sendEvent('WEASLEY_STATUS', { statusIndex: idx });
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 20]); // Mechanical gear tick
      } catch {}
    }
  };

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ me?: L.Marker; her?: L.Marker; line?: L.Polyline; steps?: L.Marker[] }>({});

  // Acquire real GPS position of current device
  const requestRealLocation = () => {
    if (!navigator.geolocation) {
      setMyAddress('此环境不支持原生定位，已使用高精经纬度');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setMyCoords({ lat: latitude, lng: longitude });

        const dist = calculateDistanceMeters(latitude, longitude, herCoords.lat, herCoords.lng);
        const bear = calculateBearing(latitude, longitude, herCoords.lat, herCoords.lng);
        setDistanceMeters(dist);
        setTrueBearing(bear);

        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([20, 30, 40]);
          } catch {}
        }

        confetti({
          particleCount: 25,
          spread: 55,
          origin: { y: 0.35 },
          colors: ['#D4AF37', '#FFF2CE', '#AA822A']
        });

        let finalAddr = `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
            { headers: { 'Accept-Language': 'zh-CN,zh' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr =
              data.address?.suburb ||
              data.address?.road ||
              data.address?.city ||
              data.display_name?.split(',')[0] ||
              finalAddr;
            finalAddr = `${addr} · GPS已锁定`;
          } else {
            finalAddr = `纬度 ${latitude.toFixed(4)}°, 经度 ${longitude.toFixed(4)}°`;
          }
        } catch {
          finalAddr = `纬度 ${latitude.toFixed(4)}°, 经度 ${longitude.toFixed(4)}°`;
        }

        setMyAddress(finalAddr);

        // Persist local and broadcast to partner
        appStorage.setMyLocation({ lat: latitude, lng: longitude, address: finalAddr, updatedAt: Date.now() });
        sendEvent('LOCATION_UPDATE', { lat: latitude, lng: longitude, address: finalAddr });

        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setMyAddress('请在手机或浏览器设置中允许定位权限');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Calibration Wand Ceremony
  const handleCalibrate = () => {
    if (isCalibrating) return;
    setIsCalibrating(true);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 35, 45, 80]);
      } catch {}
    }

    setTrueBearing((prev) => prev + 720);

    confetti({
      particleCount: 28,
      spread: 60,
      origin: { y: 0.4 },
      colors: ['#FFE599', '#D4AF37', '#FFF2CE', '#AA822A', '#8C1D35']
    });

    setTimeout(() => {
      setIsCalibrating(false);
    }, 1200);
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (viewMode !== 'map') {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = {};
      }
      return;
    }

    if (!mapContainerRef.current) return;

    // Create map centered between ME and HER
    const centerLat = (myCoords.lat + herCoords.lat) / 2;
    const centerLng = (myCoords.lng + herCoords.lng) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // High-resolution, crisp GaoDe (AutoNavi) Vector Dark/Night map tiles (Free, fast in CN, clear road labels)
    // style: 7 = standard road map, style: 8 = night/dark high-contrast mode (no watermark, clean vector look)
    L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      maxZoom: 18,
      minZoom: 3,
      subdomains: ['1', '2', '3', '4'],
      className: 'gaode-dark-tiles'
    }).addTo(map);

    mapInstanceRef.current = map;

    const meIcon = L.divIcon({
      className: 'custom-map-avatar-me',
      html: `
        <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; inset:-4px; border-radius:50%; background:rgba(212,175,55,0.3); animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="width:38px; height:38px; border-radius:50%; border:2px solid #D4AF37; overflow:hidden; box-shadow:0 0 12px rgba(212,175,55,0.8); background:#101A29;">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" style="width:100%; height:100%; object-fit:cover;" />
          </div>
          <span style="position:absolute; bottom:-6px; background:#182638; border:1px solid #D4AF37; color:#FFE599; font-size:8px; font-family:serif; font-weight:bold; padding:0 4px; border-radius:8px;">我</span>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const herIcon = L.divIcon({
      className: 'custom-map-avatar-her',
      html: `
        <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; inset:-4px; border-radius:50%; background:rgba(140,29,53,0.4); animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="width:38px; height:38px; border-radius:50%; border:2px solid #FFE599; overflow:hidden; box-shadow:0 0 14px rgba(140,29,53,0.85); background:#101A29;">
            <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" style="width:100%; height:100%; object-fit:cover;" />
          </div>
          <span style="position:absolute; bottom:-6px; background:#8C1D35; border:1px solid #FFE599; color:#FFFDF5; font-size:8px; font-family:serif; font-weight:bold; padding:0 4px; border-radius:8px;">她</span>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const meMarker = L.marker([myCoords.lat, myCoords.lng], { icon: meIcon }).addTo(map);
    const herMarker = L.marker([herCoords.lat, herCoords.lng], { icon: herIcon }).addTo(map);

    // Dynamic Ink Footstep path between ME and HER
    const stepsCount = 5;
    const footstepMarkers: L.Marker[] = [];
    const angleRad = Math.atan2(herCoords.lat - myCoords.lat, herCoords.lng - myCoords.lng);
    const angleDeg = (angleRad * 180) / Math.PI;

    for (let i = 1; i <= stepsCount; i++) {
      const frac = i / (stepsCount + 1);
      const stepLat = myCoords.lat + (herCoords.lat - myCoords.lat) * frac;
      const stepLng = myCoords.lng + (herCoords.lng - myCoords.lng) * frac;
      const isLeft = i % 2 === 1;

      const footIcon = L.divIcon({
        className: 'ink-footstep-icon',
        html: `
          <div style="transform: rotate(${angleDeg + 90}deg); opacity: 0.85; display: flex; flex-direction: column; align-items: center;">
            <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
              <!-- Left or Right Foot Sole -->
              <ellipse cx="${isLeft ? 6 : 8}" cy="13" rx="4.5" ry="5.5" fill="#D4AF37" opacity="0.8" />
              <!-- Heel -->
              <ellipse cx="${isLeft ? 6 : 8}" cy="5" rx="3.5" ry="3.8" fill="#D4AF37" opacity="0.9" />
              <!-- Toes arc -->
              <circle cx="${isLeft ? 4 : 6}" cy="18" r="1.2" fill="#FFE599" />
              <circle cx="${isLeft ? 6.5 : 8.5}" cy="18.5" r="1.3" fill="#FFE599" />
              <circle cx="${isLeft ? 9 : 10.5}" cy="17.5" r="1.1" fill="#FFE599" />
            </svg>
          </div>
        `,
        iconSize: [16, 22],
        iconAnchor: [8, 11]
      });

      const stepMarker = L.marker([stepLat, stepLng], { icon: footIcon }).addTo(map);
      footstepMarkers.push(stepMarker);
    }

    const polyline = L.polyline(
      [
        [myCoords.lat, myCoords.lng],
        [herCoords.lat, herCoords.lng]
      ],
      {
        color: '#D4AF37',
        weight: 1.8,
        opacity: 0.65,
        dashArray: '4, 8'
      }
    ).addTo(map);

    markersRef.current = { me: meMarker, her: herMarker, line: polyline, steps: footstepMarkers };

    const bounds = L.latLngBounds([
      [myCoords.lat, myCoords.lng],
      [herCoords.lat, herCoords.lng]
    ]);
    map.fitBounds(bounds, { padding: [45, 45], maxZoom: 16 });

    return () => {
      if (mapInstanceRef.current) {
        if (markersRef.current.steps) {
          markersRef.current.steps.forEach((s) => mapInstanceRef.current?.removeLayer(s));
        }
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = {};
      }
    };
  }, [viewMode, myCoords, herCoords]);

  useEffect(() => {
    // Initial fetch
    requestRealLocation();

    // High-frequency continuous watch for background & moving tracking
    let watchId: number | null = null;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setMyCoords({ lat: latitude, lng: longitude });
            const dist = calculateDistanceMeters(latitude, longitude, herCoords.lat, herCoords.lng);
            const bear = calculateBearing(latitude, longitude, herCoords.lat, herCoords.lng);
            setDistanceMeters(dist);
            setTrueBearing(bear);
            appStorage.setMyLocation({ lat: latitude, lng: longitude, updatedAt: Date.now() });
            sendEvent('LOCATION_UPDATE', { lat: latitude, lng: longitude });
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
        );
      } catch {}
    }

    // Periodic heartbeat pulse to ensure persistent syncing even when static (every 45s)
    const heartbeatTimer = setInterval(() => {
      requestRealLocation();
    }, 45000);

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
      clearInterval(heartbeatTimer);
    };
  }, []);

  // Mathematical positioning of HER avatar on the celestial orbit
  // Bearing: 0° is North (up), 90° East (right)
  const bearingNormalized = (trueBearing % 360 + 360) % 360;
  const bearingRad = ((bearingNormalized - 90) * Math.PI) / 180;
  const orbitRadius = 86; // radius on the 280x280 svg
  const herNodeX = 140 + orbitRadius * Math.cos(bearingRad);
  const herNodeY = 140 + orbitRadius * Math.sin(bearingRad);

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-5 font-serif select-none space-y-3.5">
      
      {/* ========================================================
          1. HEADER BAR: REAL-TIME DISTANCE & DUAL-VIEW TOGGLE
      ======================================================== */}
      <div className="relative rounded-3xl border border-[#D4AF37]/45 bg-[#09101A] shadow-[0_20px_50px_-10px_rgba(2,6,12,0.95)] p-5 text-[#F5EBD9] overflow-hidden">
        
        {/* Top Header Information */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#D4AF37]/25">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#142032] border border-[#D4AF37]/50 text-[#F5E8BE] flex items-center justify-center shadow-md">
              <Compass className={`w-4 h-4 text-[#D4AF37] ${isCalibrating || isLocating ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-cinzel tracking-[0.2em] text-[#C5A059] block leading-none">
                  MARAUDER'S ASTROLABE · 活点灵犀
                </span>
                <button
                  onClick={() => setShowPairingModal(true)}
                  className="text-[8px] px-1.5 py-0.2 rounded bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-[#FFE599] font-cinzel border border-[#D4AF37]/30 transition-colors cursor-pointer flex items-center gap-1"
                  title="点击配置双向同步魔法暗号与身份"
                >
                  <span>{pairingCode}</span>
                  <span className="text-[7px]">⚡</span>
                </button>
              </div>
              <h2 className="text-xs font-bold text-[#F5EBD9] font-serif mt-0.5">
                相距 {distanceMeters > 1000 ? `${(distanceMeters / 1000).toFixed(2)} 公里` : `${distanceMeters} 米`} · 灵犀同频
              </h2>
            </div>
          </div>

          {/* Toggle between Compass and Live Map */}
          <div className="flex items-center gap-1 bg-[#121B2B] p-1 rounded-xl border border-[#D4AF37]/30">
            <button
              onClick={() => setViewMode('compass')}
              className={`px-2 py-1 rounded-lg text-[9px] font-cinzel flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'compass'
                  ? 'bg-[#8C1D35] text-[#FFFDF5] font-bold shadow-xs'
                  : 'text-[#A8987E] hover:text-[#FFFDF5]'
              }`}
            >
              <Compass className="w-2.5 h-2.5" />
              <span>ORBIT 罗盘</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-2 py-1 rounded-lg text-[9px] font-cinzel flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-[#8C1D35] text-[#FFFDF5] font-bold shadow-xs'
                  : 'text-[#A8987E] hover:text-[#FFFDF5]'
              }`}
            >
              <Layers className="w-2.5 h-2.5" />
              <span>MAP 实况</span>
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------
            2. THE HERO STAGE: ROYAL HOGWARTS ASTROLABE (浑天皇家星盘)
        -------------------------------------------------------- */}
        <div className="relative w-full h-[330px] rounded-2xl bg-gradient-to-b from-[#0D1626] to-[#070D18] border border-[#D4AF37]/30 overflow-hidden mt-3.5 shadow-inner flex items-center justify-center">
          
          {/* A. MAP LAYER (Always rendered, hidden via absolute visibility so Leaflet never destroys DOM or leaks markers) */}
          <div className={`absolute inset-0 z-10 transition-opacity duration-300 ${viewMode === 'map' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div ref={mapContainerRef} className="w-full h-full" />

            <button
              onClick={requestRealLocation}
              disabled={isLocating}
              className="absolute top-2.5 right-2.5 z-20 px-2.5 py-1 rounded-lg bg-[#09101A] hover:bg-[#121C2B] border border-[#D4AF37]/50 text-[#FFE599] text-[9.5px] font-cinzel flex items-center gap-1 shadow-md cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3 h-3 text-[#D4AF37] ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'GPS定位中...' : '刷新真机位置'}</span>
            </button>

            <div className="absolute bottom-2.5 inset-x-2.5 z-20 p-2 rounded-xl bg-[#09101A] border border-[#D4AF37]/40 flex items-center justify-between text-[9.5px]">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span className="text-[#F5EBD9] font-serif truncate">
                  {myAddress}
                </span>
              </div>
              <span className="text-[#FFE599] font-cinzel shrink-0 pl-1.5 font-bold">
                {distanceMeters}M
              </span>
            </div>
          </div>

          {/* B. COMPASS LAYER (Always clean, isolated z-20) */}
          <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-300 ${viewMode === 'compass' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            
            {/* Core Astrolabe Stage (280x280) */}
            <div className="relative w-[280px] h-[280px] flex items-center justify-center">
              
              {/* 1. Deep Celestial Starry Background & Amber Core */}
              <svg viewBox="0 0 280 280" className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <radialGradient id="astrolabeCoreGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.28" />
                    <stop offset="60%" stopColor="#101C30" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#070D18" stopOpacity="0.95" />
                  </radialGradient>
                  <linearGradient id="wandGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#7A5612" />
                    <stop offset="50%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#FFF9E6" />
                  </linearGradient>
                </defs>

                {/* Celestial Core Circle */}
                <circle cx="140" cy="140" r="126" fill="url(#astrolabeCoreGlow)" />

                {/* Concentric Coordinate Grids */}
                <circle cx="140" cy="140" r="124" fill="none" stroke="#D4AF37" strokeWidth="1.4" opacity="0.6" />
                <circle cx="140" cy="140" r="118" fill="none" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.4" />
                <circle cx="140" cy="140" r="86" fill="none" stroke="#D4AF37" strokeWidth="1" strokeDasharray="3 4" opacity="0.5" />
                <circle cx="140" cy="140" r="48" fill="none" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="2 4" opacity="0.3" />

                {/* Cross Axes with Gold Diamond Tips */}
                <line x1="140" y1="18" x2="140" y2="262" stroke="#D4AF37" strokeWidth="0.6" strokeDasharray="4 6" opacity="0.4" />
                <line x1="18" y1="140" x2="262" y2="140" stroke="#D4AF37" strokeWidth="0.6" strokeDasharray="4 6" opacity="0.4" />

                {/* Constellation Star Clusters */}
                <circle cx="85" cy="78" r="1.5" fill="#FFE599" />
                <circle cx="98" cy="62" r="2" fill="#FFFFFF" />
                <circle cx="120" cy="72" r="1.5" fill="#FFE599" />
                <circle cx="195" cy="180" r="1.5" fill="#FFE599" />
                <circle cx="210" cy="198" r="2" fill="#FFFFFF" />
                <circle cx="180" cy="210" r="1.2" fill="#FFE599" />

                {/* 360-degree Fine Brass Ticks */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = i * 15;
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 140 + 124 * Math.sin(rad);
                  const y1 = 140 - 124 * Math.cos(rad);
                  const len = i % 2 === 0 ? 6 : 3.5;
                  const x2 = 140 + (124 - len) * Math.sin(rad);
                  const y2 = 140 - (124 - len) * Math.cos(rad);
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#D4AF37"
                      strokeWidth={i % 2 === 0 ? '1.2' : '0.8'}
                      opacity={i % 2 === 0 ? '0.75' : '0.4'}
                    />
                  );
                })}

                {/* Cardinal Points Typography */}
                <text x="140" y="32" textAnchor="middle" className="font-cinzel text-[9.5px] fill-[#FFE599] font-bold">N · 0°</text>
                <text x="140" y="254" textAnchor="middle" className="font-cinzel text-[8.5px] fill-[#C5A059] font-bold">S · 180°</text>
                <text x="32" y="143" textAnchor="middle" className="font-cinzel text-[8.5px] fill-[#C5A059] font-bold">W</text>
                <text x="248" y="143" textAnchor="middle" className="font-cinzel text-[8.5px] fill-[#C5A059] font-bold">E</text>

                {/* Resonance Light Ray & Marauder Footsteps from ME to HER */}
                <line
                  x1="140"
                  y1="140"
                  x2={herNodeX}
                  y2={herNodeY}
                  stroke="#D4AF37"
                  strokeWidth="1.2"
                  strokeDasharray="3 4"
                  opacity="0.5"
                />

                {/* 3 Golden Ink Footstep Nodes along the ray */}
                {[0.28, 0.52, 0.76].map((frac, idx) => {
                  const stepX = 140 + (herNodeX - 140) * frac;
                  const stepY = 140 + (herNodeY - 140) * frac;
                  const angle = (Math.atan2(herNodeY - 140, herNodeX - 140) * 180) / Math.PI;
                  const isLeft = idx % 2 === 0;
                  return (
                    <g
                      key={`ray-step-${idx}`}
                      transform={`translate(${stepX}, ${stepY}) rotate(${angle + 90}) scale(0.65)`}
                      opacity={0.85}
                    >
                      <ellipse cx={isLeft ? -2 : 2} cy="3" rx="2.5" ry="3.5" fill="#FFE599" />
                      <ellipse cx={isLeft ? -2 : 2} cy="-3" rx="2" ry="2.2" fill="#D4AF37" />
                    </g>
                  );
                })}

                {/* Dynamic Lumos Pulse Shockwaves flowing from ME to HER (Continuous Fluid Beam Animation) */}
                {isPulsing && (
                  <g>
                    {/* Pulsing Guide Line */}
                    <line
                      x1="140"
                      y1="140"
                      x2={herNodeX}
                      y2={herNodeY}
                      stroke="#FFE599"
                      strokeWidth="2.5"
                      opacity="0.8"
                      strokeDasharray="6 4"
                      className="animate-pulse"
                    />

                    {/* Animated Light Orbs Traveling along the beam */}
                    {[0, 0.25, 0.5, 0.75].map((_, orbIdx) => (
                      <circle
                        key={`pulse-travel-${orbIdx}`}
                        r="4.5"
                        fill="#FFFDF5"
                        stroke="#FFE599"
                        strokeWidth="1.5"
                        opacity="0.95"
                      >
                        <animateMotion
                          path={`M 140,140 L ${herNodeX},${herNodeY}`}
                          begin={`${orbIdx * 0.35}s`}
                          dur="1.4s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.2;1;1;0"
                          keyTimes="0;0.2;0.8;1"
                          begin={`${orbIdx * 0.35}s`}
                          dur="1.4s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="r"
                          values="3;5.5;4.5;3"
                          keyTimes="0;0.3;0.7;1"
                          begin={`${orbIdx * 0.35}s`}
                          dur="1.4s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    ))}
                  </g>
                )}
              </svg>

              {/* 2. Slow Rotating Latin Astrolabe Ring */}
              <div
                className="absolute inset-0 pointer-events-none flex items-center justify-center animate-spin"
                style={{ animationDuration: '80s', transform: 'translateZ(0)' }}
              >
                <svg viewBox="0 0 280 280" className="w-full h-full">
                  <defs>
                    <path
                      id="astrolabeLatinPath"
                      d="M 140, 140 m -102, 0 a 102,102 0 1,1 204,0 a 102,102 0 1,1 -204,0"
                    />
                  </defs>
                  <text className="font-cinzel text-[8.5px] fill-[#C5A059] tracking-[0.24em] font-bold opacity-75">
                    <textPath href="#astrolabeLatinPath" startOffset="0%">
                      · POINT ME · COMPASS OF TWO SOULS · LUMOS ALWAYS · HARMONY ·
                    </textPath>
                  </text>
                </svg>
              </div>

              {/* 3. The Sculpted Wand Needle (Centered, Rotating to True Bearing with GPU acceleration) */}
              <div
                className="absolute z-20 w-2 h-[172px] pointer-events-none flex flex-col items-center justify-between mobile-gpu-layer"
                style={{
                  transformOrigin: 'center center',
                  transform: `rotate(${trueBearing}deg) translateZ(0)`,
                  transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {/* Lumos Wand Tip pointing directly at HER node */}
                <div className="w-4 h-4 rounded-full bg-[#FFFDF5] shadow-[0_0_18px_#FFE599,0_0_8px_#FFF] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                </div>
                {/* Sculpted Golden Wand Shaft */}
                <div className="w-1.5 h-full bg-gradient-to-b from-[#FFFDF5] via-[#D4AF37] to-[#7A5612] rounded-full shadow-xs" />
                {/* Counterweight Jewel Tail */}
                <div className="w-3 h-3 rounded-full bg-[#8C1D35] border border-[#FFE599] shadow-xs" />
              </div>

              {/* 4. HER AVATAR NODE (Positioned Precisely on the Celestial Orbit) */}
              <div
                className={`absolute z-30 flex flex-col items-center mobile-gpu-layer ${isPulsing ? 'animate-bounce' : ''}`}
                style={{
                  left: `${herNodeX}px`,
                  top: `${herNodeY}px`,
                  transform: 'translate(-50%, -50%) translateZ(0)',
                  transition: 'left 0.4s ease, top 0.4s ease'
                }}
              >
                <div className="relative group cursor-pointer">
                  {/* Breathing Aura */}
                  <div className={`absolute inset-[-4px] rounded-full bg-[#8C1D35] pointer-events-none ${isPulsing ? 'animate-ping opacity-80' : 'opacity-40 animate-ping'}`} />
                  {/* Portrait Medallion */}
                  <div className={`w-10 h-10 rounded-full border-2 p-0.5 bg-[#101A29] overflow-hidden transition-all ${isPulsing ? 'border-[#FFFDF5] shadow-[0_0_25px_#FFE599]' : 'border-[#FFE599] shadow-[0_0_16px_rgba(140,29,53,0.9)]'}`}>
                    <img
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop"
                      alt="Her"
                      className="w-full h-full rounded-full object-cover filter contrast-105"
                    />
                  </div>
                  {/* Mini Tag */}
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-[#8C1D35] border border-[#FFE599] text-[#FFFDF5] text-[7.5px] font-cinzel font-bold shadow-xs whitespace-nowrap">
                    {partnerRole} · {WEASLEY_STATUSES[herStatusIndex].label} {partnerOnline ? '✨' : ''}
                  </span>
                </div>
              </div>

              {/* 5. ME AVATAR NODE (Anchor Center Pivot) */}
              <div
                className={`absolute z-30 flex flex-col items-center mobile-gpu-layer ${isPulsing ? 'scale-110' : ''}`}
                style={{ transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              >
                <div className="relative group cursor-pointer">
                  <div className={`w-10 h-10 rounded-full border-2 p-0.5 bg-[#101A29] overflow-hidden transition-all ${isPulsing ? 'border-[#FFFDF5] shadow-[0_0_24px_#D4AF37]' : 'border-[#D4AF37] shadow-[0_0_16px_rgba(212,175,55,0.7)]'}`}>
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                      alt="Me"
                      className="w-full h-full rounded-full object-cover filter contrast-105"
                    />
                  </div>
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-[#182638] border border-[#D4AF37] text-[#FFE599] text-[7.5px] font-cinzel font-bold shadow-xs whitespace-nowrap">
                    ME ({myRole}) · {WEASLEY_STATUSES[myStatusIndex].label}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Calibrate & Bearing Pill */}
            <div className="absolute bottom-2 inset-x-0 flex items-center justify-between px-3.5 z-30">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#131F33] border border-[#D4AF37]/50 text-[#FFE599] text-[9.5px] font-cinzel tracking-wider">
                <Sparkles className="w-3 h-3 text-[#FFE599]" />
                <span>方位角 {bearingNormalized}° · 东南</span>
              </div>

              <button
                onClick={handleCalibrate}
                disabled={isCalibrating}
                className="px-3 py-1 rounded-full bg-[#8C1D35] hover:bg-[#A51D38] border border-[#FFE599] text-[#FFFDF5] text-[9.5px] font-cinzel tracking-wider flex items-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Wand2 className={`w-3 h-3 text-[#FFE599] ${isCalibrating ? 'animate-spin' : ''}`} />
                <span>CALIBRATE 校准</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Lore */}
        <div className="mt-3 pt-2.5 border-t border-[#D4AF37]/20 flex items-center justify-between text-[9px] text-[#A8987E]">
          <span className="flex items-center gap-1 font-serif text-[#DCC7A7]">
            <Wand2 className="w-3 h-3 text-[#D4AF37]" />
            魔杖尖端已校准 · 精准直指她在天穹的星宿坐标
          </span>
          <span className="font-cinzel text-[#FFE599] tracking-wider">
            POINT ME · ALWAYS
          </span>
        </div>
      </div>

      {/* ========================================================
          3. REAL-TIME ADDRESS & DETAILED LOCATION CARDS
      ======================================================== */}
      <div className="rounded-3xl border border-[#D4AF37]/40 bg-[#FCF9F2] shadow-[0_12px_32px_-6px_rgba(45,30,15,0.08)] p-4 select-none font-serif text-[#2C241E]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#D9C89E]/60 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#8C1D35] text-[#F5E8BE] flex items-center justify-center shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-[#FFE599]" />
            </div>
            <div>
              <span className="text-[9px] font-cinzel tracking-[0.18em] text-[#8C7658] block leading-none">
                LOCATION DETAILS · 实时位置
              </span>
              <h3 className="text-xs font-bold text-[#2C241E] font-serif mt-0.5">
                双方物理所在与动态状态
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[9px] text-[#8C7658] font-cinzel">
            <Battery className="w-3 h-3 text-[#2E7D32]" />
            <span>88% 电量</span>
          </div>
        </div>

        {/* Detailed Address Grid */}
        <div className="space-y-2.5 text-xs">
          {/* Her Location & Weasley Status Card */}
          <div className="p-3.5 rounded-2xl bg-[#FAF5EB] border border-[#D4AF37]/50 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-cinzel font-bold text-[#8C1D35] flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${partnerOnline ? 'bg-emerald-500 animate-ping' : 'bg-[#8C1D35]'}`} />
                {partnerRole} · 对方实时所在与韦斯莱钟态 {partnerOnline ? '· 在线同频' : '· 离线等候'}
              </span>
              <span className="text-[8.5px] font-mono text-[#8C7658]">
                {herCoords.lat.toFixed(4)}°N, {herCoords.lng.toFixed(4)}°E
              </span>
            </div>
            <div className="text-[12px] font-bold text-[#2C241E] font-serif">
              {herAddress}
            </div>
            
            {/* Weasley Clock Badge for Her */}
            <div className="flex items-center justify-between pt-1 border-t border-[#D9C89E]/40 text-[9.5px]">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#8C1D35]/10 text-[#8C1D35] font-serif font-bold border border-[#8C1D35]/20">
                <span>{WEASLEY_STATUSES[herStatusIndex].icon}</span>
                <span>{WEASLEY_STATUSES[herStatusIndex].label}</span>
                <span className="text-[8.5px] text-[#8C7658] font-normal">({WEASLEY_STATUSES[herStatusIndex].desc})</span>
              </div>
              <span className="text-[#8C1D35] font-serif font-bold text-[8.5px]">黄铜指针锁定</span>
            </div>
          </div>

          {/* My Location & Interactive Weasley Status Selector */}
          <div className="p-3.5 rounded-2xl bg-[#FAF5EB] border border-[#D9C89E]/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-cinzel font-bold text-[#2C241E] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                ME · 本机实时所在与拨动齿轮
              </span>
              <span className="text-[8.5px] font-mono text-[#8C7658]">
                {myCoords.lat.toFixed(4)}°N, {myCoords.lng.toFixed(4)}°E
              </span>
            </div>
            <div className="text-[12px] font-bold text-[#2C241E] font-serif truncate">
              {myAddress}
            </div>

            {/* Weasley Clock Dial Options (Interactive Gears) */}
            <div className="pt-1.5 border-t border-[#D9C89E]/40 space-y-1">
              <div className="flex items-center justify-between text-[8.5px] font-cinzel text-[#8C7658]">
                <span>WEASLEY CLOCK · 拨动你的时针状态</span>
                <button
                  onClick={requestRealLocation}
                  className="text-[#8C1D35] font-serif font-bold hover:underline cursor-pointer"
                >
                  刷新GPS
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {WEASLEY_STATUSES.map((st, i) => {
                  const isActive = myStatusIndex === i;
                  return (
                    <button
                      key={st.id}
                      onClick={() => handleToggleMyStatus(i)}
                      className={`px-2 py-1.5 rounded-xl text-[9.5px] font-serif flex items-center justify-center gap-1 transition-transform duration-100 active:scale-95 cursor-pointer border select-none ${
                        isActive
                          ? 'bg-[#182638] text-[#FFE599] border-[#D4AF37] shadow-xs font-bold'
                          : 'bg-[#FFFDF9] text-[#7A6750] border-[#D9C89E]/60 active:bg-[#F2E8D5]'
                      }`}
                      style={{ touchAction: 'manipulation' }}
                    >
                      <span>{st.icon}</span>
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button: Send Lumos Pulse */}
        <div className="mt-3 pt-2.5 border-t border-[#D9C89E]/40 flex items-center justify-between">
          <button
            onClick={() => {
              setIsPulsing(true);
              sendEvent('LUMOS_PULSE', { timestamp: Date.now() });
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                try {
                  navigator.vibrate([30, 40, 70, 90]);
                } catch {}
              }
              confetti({
                particleCount: 30,
                spread: 70,
                origin: { y: 0.7 },
                colors: ['#FFE599', '#D4AF37', '#FFF2CE', '#8C1D35']
              });
              setTimeout(() => setIsPulsing(false), 3000);
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8C1D35] to-[#6B1226] text-[#FFFDF5] text-xs font-serif font-bold flex items-center justify-center gap-1.5 shadow-sm hover:brightness-105 transition-all cursor-pointer border border-[#D4AF37]/50"
          >
            <Zap className={`w-3.5 h-3.5 text-[#FFE599] ${isPulsing ? 'animate-bounce' : ''}`} />
            <span>{isPulsing ? '✨ 荧光脉冲引力波穿透天穹抵达对方！' : '向对方发射心灵荧光脉冲 · LUMOS PULSE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
