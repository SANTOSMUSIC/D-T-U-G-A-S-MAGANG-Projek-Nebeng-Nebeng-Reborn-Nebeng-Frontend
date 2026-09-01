import { useState, useEffect, useRef } from 'react';
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading';
import { 
  Navigation, 
  Search, 
  Eye, 
  MapPin, 
  Car, 
  ArrowRight, 
  Play, 
  Pause, 
  RotateCcw, 
  BrainCircuit, 
  ShieldAlert, 
  AlertTriangle,
  Award,
  Map as MapIcon,
  FastForward
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatCard from '../../../components/ui/StatCard';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';

export default function RegionalTripMonitoringPage() {
  const toast = useToast();
  const leafletMapInstance = useRef(null);
  const movingMarkerRef = useRef(null);
  const traveledLineRef = useRef(null);
  const fullLineRef = useRef(null);
  
  const [tripList] = useState([
    {
      id: 'TRIP-9081',
      passenger: 'Siti Aminah',
      driver: 'Rian Hidayat',
      vehicle: 'Motor Logistik (AD 1234 AB)',
      originPos: 'Pos Solo Grand Mall',
      destinationPos: 'Pos Pasar Klewer',
      status: 'Sedang Berjalan',
      fare: 'Rp 35.000',
      time: '19 Agu 2026, 09:30',
      baseSpeed: 42,
      originCoord: { lat: -7.5623, lng: 110.8122 },
      destinationCoord: { lat: -7.5753, lng: 110.8278 },
      checkpoints: [
        { label: 'Start: Solo Grand Mall', street: 'Jl. Slamet Riyadi No. 273', time: '09:30' },
        { label: 'Simpang Gendengan', street: 'Jl. Slamet Riyadi', time: '09:35' },
        { label: 'Simpang Nonongan', street: 'Jl. Yos Sudarso', time: '09:40' },
        { label: 'Finish: Pos Pasar Klewer', street: 'Jl. Dr. Radjiman', time: '09:45' }
      ],
      dms: {
        fatigueStatus: 'Aman / Normal',
        distractionAlerts: 0,
        eyeClosureScore: '98%',
        phoneUsageDetected: false,
        lastAiLog: '09:38 - AI Camera: Mata fokus & tidak mengantuk'
      },
      driverScore: 94,
      behaviorStats: { harshBraking: 1, rapidAcceleration: 0, corneringViolation: 0, speedViolation: 0 },
      geofenceZone: 'Zona Ring 1 Surakarta',
      geofenceStatus: 'Inside Boundary',
      speedLimit: '50 km/jam'
    },
    {
      id: 'TRIP-9082',
      passenger: 'Budi Santoso',
      driver: 'Fajar Nugroho',
      vehicle: 'Mobil MPV (AD 9012 EF)',
      originPos: 'Pos Jebres Stasiun',
      destinationPos: 'Pos Solo Grand Mall',
      status: 'Selesai',
      fare: 'Rp 45.000',
      time: '19 Agu 2026, 08:15',
      baseSpeed: 38,
      originCoord: { lat: -7.5594, lng: 110.8444 },
      destinationCoord: { lat: -7.5623, lng: 110.8122 },
      checkpoints: [
        { label: 'Start: Stasiun Jebres', street: 'Jl. Urip Sumoharjo', time: '08:15' },
        { label: 'Area Panggung', street: 'Jl. Kolonel Sutarto', time: '08:22' },
        { label: 'Simpang Balapan', street: 'Jl. Monginsidi', time: '08:28' },
        { label: 'Finish: Solo Grand Mall', street: 'Jl. Slamet Riyadi', time: '08:35' }
      ],
      dms: {
        fatigueStatus: 'Terdeteksi Kantuk Ringan',
        distractionAlerts: 1,
        eyeClosureScore: '82%',
        phoneUsageDetected: false,
        lastAiLog: '08:28 - AI Camera: Menguap terdeteksi (2x)'
      },
      driverScore: 86,
      behaviorStats: { harshBraking: 2, rapidAcceleration: 1, corneringViolation: 1, speedViolation: 0 },
      geofenceZone: 'Zona Ring 1 Surakarta',
      geofenceStatus: 'Inside Boundary',
      speedLimit: '60 km/jam'
    },
    {
      id: 'TRIP-9083',
      passenger: 'Ahmad Fauzi',
      driver: 'Dewi Lestari',
      vehicle: 'Mobil SUV (AD 5678 CD)',
      originPos: 'Pos Pasar Klewer',
      destinationPos: 'Bypass Ring Luar (Pelanggaran)',
      status: 'Pelanggaran Geofence',
      fare: 'Rp 50.000',
      time: '19 Agu 2026, 09:45',
      baseSpeed: 68,
      originCoord: { lat: -7.5753, lng: 110.8278 },
      destinationCoord: { lat: -7.6020, lng: 110.8240 },
      checkpoints: [
        { label: 'Start: Pasar Klewer', street: 'Jl. Dr. Radjiman', time: '09:45' },
        { label: 'Alun-Alun Selatan', street: 'Jl. Gading', time: '09:48' },
        { label: 'Batas Geofence Ring 1', street: 'Jl. Veteran', time: '09:50' },
        { label: 'OUT OF BOUNDS (BREACH)', street: 'Bypass Sukoharjo Utara', time: '09:55' }
      ],
      dms: {
        fatigueStatus: 'Peringatan Bahaya Main HP',
        distractionAlerts: 3,
        eyeClosureScore: '75%',
        phoneUsageDetected: true,
        lastAiLog: '09:50 - AI Camera: Penggunaan HP > 5 detik saat melaju'
      },
      driverScore: 68,
      behaviorStats: { harshBraking: 4, rapidAcceleration: 3, corneringViolation: 2, speedViolation: 2 },
      geofenceZone: 'Zona Ring 1 Surakarta',
      geofenceStatus: 'OUT OF BOUNDS BREACH',
      speedLimit: '50 km/jam'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [selectedPos, setSelectedPos] = useState('Semua Pos');
  
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('replay');
  const [routedCoordinates, setRoutedCoordinates] = useState([]);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);

  const [isPlayingReplay, setIsPlayingReplay] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentDynamicSpeed, setCurrentDynamicSpeed] = useState(0);

  const posOptions = ['Semua Pos', 'Pos Solo Grand Mall', 'Pos Pasar Klewer', 'Pos Jebres Stasiun'];
  const isLoadingTrips = useSimulatedLoading([searchQuery, statusFilter, selectedPos], 700);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  // Safe OSRM Fetching (Mencegah Unmounted State Update)
  useEffect(() => {
    if (!currentTrip || !isDetailOpen) return;
    let isSubscribed = true;

    const fetchOSRMRoute = async () => {
      setIsFetchingRoute(true);
      try {
        const start = currentTrip.originCoord;
        const end = currentTrip.destinationCoord;
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        
        if (isSubscribed) {
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(c => ({
              lat: c[1],
              lng: c[0]
            }));
            setRoutedCoordinates(coords);
          } else {
            setRoutedCoordinates([start, end]);
          }
        }
      } catch (err) {
        if (isSubscribed) {
          setRoutedCoordinates([currentTrip.originCoord, currentTrip.destinationCoord]);
        }
      } finally {
        if (isSubscribed) setIsFetchingRoute(false);
      }
    };

    fetchOSRMRoute();

    return () => {
      isSubscribed = false;
    };
  }, [currentTrip, isDetailOpen]);

  // Safe Leaflet Initialization (Mencegah Error Container Already Initialized)
  useEffect(() => {
    if (activeTab !== 'replay' || !currentTrip || routedCoordinates.length === 0 || !isDetailOpen) return;

    let isMounted = true;

    const initMap = async () => {
      if (!window.L) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      if (!isMounted) return;
      const L = window.L;
      const container = document.getElementById('real-leaflet-map');
      if (!container) return;

      // Hapus rujukan _leaflet_id secara paksa jika ada sisa dari render sebelumnya
      if (container._leaflet_id) {
        container._leaflet_id = null;
      }

      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }

      const coords = routedCoordinates.map(c => [c.lat, c.lng]);

      const map = L.map('real-leaflet-map', {
        center: coords[0],
        zoom: 14,
        zoomControl: false
      });

      leafletMapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      L.circle(coords[0], {
        color: currentTrip.geofenceStatus.includes('BREACH') ? '#EF4444' : '#10B981',
        fillColor: currentTrip.geofenceStatus.includes('BREACH') ? '#EF4444' : '#10B981',
        fillOpacity: 0.08,
        radius: 2000
      }).addTo(map);

      fullLineRef.current = L.polyline(coords, {
        color: '#4B5563',
        weight: 5,
        dashArray: '2, 6',
        opacity: 0.6
      }).addTo(map);

      traveledLineRef.current = L.polyline([coords[0]], {
        color: '#E02020',
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      const startIcon = L.divIcon({
        className: 'custom-start-marker',
        html: `<div style="background:#10B981; color:white; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:10px; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.4);">A</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });
      L.marker(coords[0], { icon: startIcon }).addTo(map).bindPopup(`<b>Start:</b> ${currentTrip.originPos}`);

      const endIcon = L.divIcon({
        className: 'custom-end-marker',
        html: `<div style="background:#4B2172; color:white; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:10px; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.4);">B</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });
      L.marker(coords[coords.length - 1], { icon: endIcon }).addTo(map).bindPopup(`<b>Finish:</b> ${currentTrip.destinationPos}`);

      const vehicleIcon = L.divIcon({
        className: 'custom-[#E02020]-marker',
        html: `<div style="background:#E02020; color:white; padding:3px 7px; border-radius:12px; font-weight:bold; font-size:9px; border:2px solid white; box-shadow:0 3px 6px rgba(0,0,0,0.4); display:flex; align-items:center; gap:3px; whitespace:nowrap;">
                🚗 <span>${currentTrip.driver}</span>
              </div>`,
        iconAnchor: [20, 10]
      });
      movingMarkerRef.current = L.marker(coords[0], { icon: vehicleIcon }).addTo(map);

      map.fitBounds(fullLineRef.current.getBounds(), { padding: [35, 35] });
    };

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
    };
  }, [activeTab, currentTrip, routedCoordinates, isDetailOpen]);

  const getCurrentTelemetry = (points, progress) => {
    if (!points || points.length === 0) return { lat: -7.5623, lng: 110.8122 };
    if (points.length === 1 || progress <= 0) return points[0];
    if (progress >= 100) return points[points.length - 1];

    const totalSegments = points.length - 1;
    const scaledProgress = (progress / 100) * totalSegments;
    const index = Math.floor(scaledProgress);
    const t = scaledProgress - index;

    const p1 = points[index];
    const p2 = points[Math.min(index + 1, totalSegments)];

    return {
      lat: p1.lat + (p2.lat - p1.lat) * t,
      lng: p1.lng + (p2.lng - p1.lng) * t
    };
  };

  useEffect(() => {
    if (!currentTrip || routedCoordinates.length === 0 || !leafletMapInstance.current || !isDetailOpen) return;
    
    const currentPos = getCurrentTelemetry(routedCoordinates, replayProgress);

    if (movingMarkerRef.current) {
      movingMarkerRef.current.setLatLng([currentPos.lat, currentPos.lng]);
    }

    if (traveledLineRef.current) {
      const totalSegments = routedCoordinates.length - 1;
      const scaledProgress = (replayProgress / 100) * totalSegments;
      const currentIndex = Math.floor(scaledProgress);
      
      const traveledPoints = routedCoordinates.slice(0, currentIndex + 1).map(c => [c.lat, c.lng]);
      traveledPoints.push([currentPos.lat, currentPos.lng]);
      traveledLineRef.current.setLatLngs(traveledPoints);
    }

    if (replayProgress === 0 || replayProgress === 100) {
      setCurrentDynamicSpeed(0);
    } else {
      const speedVariation = Math.sin(replayProgress * 0.2) * 4;
      setCurrentDynamicSpeed(Math.round(currentTrip.baseSpeed + speedVariation));
    }
  }, [replayProgress, currentTrip, routedCoordinates, isDetailOpen]);

  // Replay Timer Safety
  useEffect(() => {
    let interval;
    if (isPlayingReplay && isDetailOpen) {
      interval = setInterval(() => {
        setReplayProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingReplay(false);
            return 100;
          }
          return prev + (0.4 * playbackSpeed);
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlayingReplay, playbackSpeed, isDetailOpen]);

  const handleCloseDetailModal = () => {
    setIsPlayingReplay(false);
    setReplayProgress(0);
    setIsDetailOpen(false);
    if (leafletMapInstance.current) {
      leafletMapInstance.current.remove();
      leafletMapInstance.current = null;
    }
  };

  const handleOpenDetail = (trip, defaultTab = 'replay') => {
    setRoutedCoordinates([]);
    setCurrentTrip(trip);
    setActiveTab(defaultTab);
    setReplayProgress(0);
    setIsPlayingReplay(false);
    setPlaybackSpeed(1);
    setIsDetailOpen(true);
  };

  const filteredTrips = tripList.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.passenger.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.vehicle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || t.status === statusFilter;
    const matchesPos = selectedPos === 'Semua Pos' || t.originPos === selectedPos || t.destinationPos === selectedPos;
    return matchesSearch && matchesStatus && matchesPos;
  });

  const getTripStatusVariant = (status) => {
    if (status === 'Selesai') return 'emerald';
    if (status === 'Pelanggaran Geofence') return 'rose';
    return 'blue';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172]">
              MONITORING CERDAS WILAYAH
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Pemantauan Trip, DMS AI & Geofencing
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Pelacakan visual replay rute real-time pada peta interaktif, kamera AI DMS, driver score, dan geofence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#4B2172]/10 rounded-full">
            <BrainCircuit className="w-3.5 h-3.5 text-[#4B2172]" />
            <span className="text-[10px] font-bold text-[#4B2172]">AI DMS Active</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-700">Geofence Guard</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="TRIP AKTIF BERGERAK" value="1 Trip" subtitle="Status berjalan" icon={Car} />
        <StatCard title="RATA-RATA DRIVER SCORE" value="82.6 / 100" subtitle="Kategori Aman" icon={Award} />
        <StatCard title="PERINGATAN AI DMS" value="4 Deteksi" subtitle="Perlu perhatian" icon={BrainCircuit} />
        <StatCard title="PELANGGARAN GEOFENCE" value="1 Kasus" subtitle="Out of bounds" icon={AlertTriangle} />
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Cari ID, driver, plat nomor, penumpang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-9 pr-8 py-2 text-[10px] sm:text-[11px] font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#4B2172] transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select 
            value={selectedPos}
            onChange={(e) => setSelectedPos(e.target.value)}
            className="bg-neutral-50 border border-neutral-200 rounded-full px-3 py-1.5 text-[10px] font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#4B2172] cursor-pointer"
          >
            {posOptions.map((pos, idx) => (
              <option key={idx} value={pos}>{pos}</option>
            ))}
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-50 border border-neutral-200 rounded-full px-3 py-1.5 text-[10px] font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#4B2172] cursor-pointer"
          >
            <option value="Semua">Semua Status</option>
            <option value="Sedang Berjalan">Sedang Berjalan</option>
            <option value="Pelanggaran Geofence">Pelanggaran Geofence</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="block sm:hidden divide-y divide-gray-100">
          {isLoadingTrips ? (
            <div className="p-4 space-y-3">
              <SkeletonTableRows rows={3} columns={1} />
            </div>
          ) : filteredTrips.length > 0 ? (
            filteredTrips.map((trip) => (
              <div key={trip.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold text-[#4B2172] font-mono">{trip.id}</span>
                  <StatusBadge variant={getTripStatusVariant(trip.status)}>
                    {trip.status}
                  </StatusBadge>
                </div>

                <div className="text-[10px] font-bold text-neutral-800">
                  {trip.passenger} <span className="font-normal text-neutral-500">(Driver: {trip.driver})</span>
                </div>

                <div className="text-[9px] text-neutral-500 flex items-center gap-1">
                  <span>{trip.originPos}</span>
                  <ArrowRight size={10} className="text-[#4B2172] shrink-0"/>
                  <span>{trip.destinationPos}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[10px]">
                  <span className="font-bold text-neutral-800">{trip.fare}</span>
                  <button 
                    onClick={() => handleOpenDetail(trip, 'replay')} 
                    className="px-2.5 py-1 bg-[#4B2172] text-white text-[9px] font-bold rounded-full flex items-center gap-1 cursor-pointer"
                  >
                    <Play size={10} /> Replay Rute
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4">
              <EmptyState icon={Navigation} title="Trip Tidak Ditemukan" description="Tidak ada trip yang cocok dengan filter." />
            </div>
          )}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">ID & Waktu</th>
                <th className="py-3 px-5">Driver & Armada</th>
                <th className="py-3 px-5">Rute (Pos Asal &rarr; Tujuan)</th>
                <th className="py-3 px-5">AI DMS Status</th>
                <th className="py-3 px-5 text-center">Driver Score</th>
                <th className="py-3 px-5">Geofencing Zone</th>
                <th className="py-3 px-5 text-center">Aksi Cerdas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[9px]">
              {isLoadingTrips ? (
                <SkeletonTableRows rows={4} columns={7} />
              ) : filteredTrips.length > 0 ? (
                filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-neutral-800 font-mono text-[10px]">{trip.id}</div>
                      <div className="text-[8px] text-neutral-400">{trip.time}</div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="font-bold text-neutral-800">{trip.driver}</div>
                      <div className="text-[8px] text-neutral-400 font-mono">{trip.vehicle}</div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1 font-semibold text-neutral-700">
                        <MapPin size={11} className="text-[#4B2172] shrink-0" />
                        <span className="truncate">{trip.originPos}</span>
                        <ArrowRight size={10} className="text-[#4B2172] shrink-0" />
                        <span className="truncate">{trip.destinationPos}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <StatusBadge variant={trip.dms.phoneUsageDetected ? 'rose' : trip.dms.distractionAlerts > 0 ? 'amber' : 'emerald'}>
                        {trip.dms.fatigueStatus}
                      </StatusBadge>
                    </td>

                    <td className="py-3.5 px-5 text-center">
                      <StatusBadge variant={trip.driverScore >= 90 ? 'emerald' : trip.driverScore >= 80 ? 'amber' : 'rose'}>
                        ★ {trip.driverScore}/100
                      </StatusBadge>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-neutral-800">{trip.geofenceZone}</div>
                      <span className={`text-[8px] font-bold ${
                        trip.geofenceStatus.includes('BREACH') ? 'text-rose-600 font-mono' : 'text-emerald-600'
                      }`}>
                        {trip.geofenceStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => handleOpenDetail(trip, 'replay')}
                          title="Visual Replay Rute"
                          className="p-1.5 bg-[#4B2172]/10 hover:bg-[#4B2172]/20 text-[#4B2172] rounded-lg transition cursor-pointer"
                        >
                          <Play size={13} />
                        </button>
                        <button 
                          onClick={() => handleOpenDetail(trip, 'dms')}
                          title="AI DMS & Driver Score"
                          className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition cursor-pointer"
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <EmptyState icon={Navigation} title="Trip Tidak Ditemukan" description="Tidak ada trip yang cocok dengan filter." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BaseModal
        isOpen={Boolean(isDetailOpen && currentTrip)}
        onClose={handleCloseDetailModal}
        title={`Detail Monitoring Trip ${currentTrip?.id}`}
        subtitle={`Driver: ${currentTrip?.driver} (${currentTrip?.vehicle})`}
        maxWidth="max-w-2xl"
      >
        {currentTrip && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-full text-[9px] font-bold">
              <button
                onClick={() => setActiveTab('replay')}
                className={`flex-1 py-1.5 rounded-full transition cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'replay' ? 'bg-[#4B2172] text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <MapIcon size={12} /> Visual Replay
              </button>
              <button
                onClick={() => setActiveTab('dms')}
                className={`flex-1 py-1.5 rounded-full transition cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'dms' ? 'bg-[#4B2172] text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <BrainCircuit size={12} /> AI DMS
              </button>
              <button
                onClick={() => setActiveTab('score')}
                className={`flex-1 py-1.5 rounded-full transition cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'score' ? 'bg-[#4B2172] text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Award size={12} /> Driver Score
              </button>
              <button
                onClick={() => setActiveTab('geofence')}
                className={`flex-1 py-1.5 rounded-full transition cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'geofence' ? 'bg-[#4B2172] text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <ShieldAlert size={12} /> Geofencing
              </button>
            </div>

            {activeTab === 'replay' && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-neutral-300 bg-[#E5ECE7] shadow-inner">
                  <div id="real-leaflet-map" className="w-full h-64 z-0" />

                  <div className="bg-neutral-900 p-3 text-white space-y-2 relative z-10">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      disabled={isFetchingRoute}
                      value={replayProgress} 
                      onChange={(e) => {
                        setReplayProgress(Number(e.target.value));
                        setIsPlayingReplay(false);
                      }}
                      className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#E02020] disabled:opacity-50"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setIsPlayingReplay(!isPlayingReplay)}
                          disabled={isFetchingRoute}
                          className="px-4 py-1.5 bg-[#4B2172] hover:bg-[#3b195a] text-white rounded-full text-[9px] font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {isPlayingReplay ? <Pause size={12} /> : <Play size={12} />}
                          <span>{isPlayingReplay ? 'Pause' : 'Mulai Replay'}</span>
                        </button>

                        <button 
                          onClick={() => {
                            setReplayProgress(0);
                            setIsPlayingReplay(false);
                          }}
                          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-full transition cursor-pointer"
                          title="Reset Timeline"
                        >
                          <RotateCcw size={12} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1 bg-neutral-800 p-1 rounded-full text-[8px] font-bold">
                        <FastForward size={11} className="text-neutral-400 ml-1" />
                        {[1, 2, 4].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => setPlaybackSpeed(spd)}
                            className={`px-2 py-0.5 rounded-full transition cursor-pointer ${
                              playbackSpeed === spd ? 'bg-[#4B2172] text-white' : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-2">
                  <h4 className="text-[9px] font-bold text-neutral-700 uppercase tracking-wider">Detail Titik Checkpoint GPS Terlewati</h4>
                  <div className="space-y-1.5">
                    {currentTrip.checkpoints.map((pt, i) => (
                      <div key={i} className="flex items-center justify-between text-[9px] p-2 bg-white rounded-lg border border-neutral-100">
                        <div className="flex items-center gap-2">
                          <MapPin size={12} className={i === 0 ? "text-emerald-600" : i === currentTrip.checkpoints.length - 1 ? "text-[#4B2172]" : "text-rose-600"} />
                          <div>
                            <span className="font-bold text-neutral-800">{pt.label}</span>
                            <span className="text-[8px] text-neutral-400 block">{pt.street}</span>
                          </div>
                        </div>
                        <span className="font-mono text-neutral-400">{pt.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dms' && (
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#4B2172] text-white rounded-lg">
                      <BrainCircuit size={16} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-neutral-800">Status Kamera AI In-Cabin</h4>
                      <p className="text-[8px] text-neutral-500">Deteksi kelelahan mata, kantuk, menguap & penggunaan HP</p>
                    </div>
                  </div>
                  <StatusBadge variant="emerald">Kamera Online</StatusBadge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[9px]">
                  <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-1">
                    <span className="text-neutral-400 font-bold block uppercase">Skor Keterbukaan Mata</span>
                    <span className="text-[14px] font-bold text-neutral-800">{currentTrip.dms.eyeClosureScore}</span>
                    <p className="text-[8px] text-emerald-600">Terdeteksi fokus & alert</p>
                  </div>

                  <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-1">
                    <span className="text-neutral-400 font-bold block uppercase">Penggunaan HP Saat Melaju</span>
                    <span className={`text-[14px] font-bold ${currentTrip.dms.phoneUsageDetected ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {currentTrip.dms.phoneUsageDetected ? 'TERDETEKSI' : 'Tidak Ada'}
                    </span>
                    <p className="text-[8px] text-neutral-400">Total peringatan: {currentTrip.dms.distractionAlerts}x</p>
                  </div>
                </div>

                <div className="bg-neutral-900 text-white p-3 rounded-xl space-y-1 text-[9px]">
                  <span className="text-purple-300 font-bold uppercase block text-[8px]">Log Terakhir AI Camera Engine</span>
                  <p className="font-mono text-neutral-300">{currentTrip.dms.lastAiLog}</p>
                </div>
              </div>
            )}

            {activeTab === 'score' && (
              <div className="space-y-3">
                <div className="p-4 bg-white border border-neutral-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-bold text-neutral-400 uppercase">Skor Keselamatan Total</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-[22px] font-bold text-[#4B2172]">{currentTrip.driverScore}</span>
                      <span className="text-[10px] text-neutral-400 font-bold">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge variant={currentTrip.driverScore >= 90 ? 'emerald' : currentTrip.driverScore >= 80 ? 'amber' : 'rose'}>
                      {currentTrip.driverScore >= 90 ? 'Sangat Aman' : currentTrip.driverScore >= 80 ? 'Cukup Aman' : 'Perlu Evaluasi'}
                    </StatusBadge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 flex justify-between items-center">
                    <span className="text-neutral-600">Rem Mendadak (Harsh Brake)</span>
                    <span className="font-bold text-neutral-800">{currentTrip.behaviorStats.harshBraking}x</span>
                  </div>

                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 flex justify-between items-center">
                    <span className="text-neutral-600">Akselerasi Tiba-tiba</span>
                    <span className="font-bold text-neutral-800">{currentTrip.behaviorStats.rapidAcceleration}x</span>
                  </div>

                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 flex justify-between items-center">
                    <span className="text-neutral-600">Tikungan Tajam (Sharp Turn)</span>
                    <span className="font-bold text-neutral-800">{currentTrip.behaviorStats.corneringViolation}x</span>
                  </div>

                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 flex justify-between items-center">
                    <span className="text-neutral-600">Melanggar Speed Limit</span>
                    <span className="font-bold text-neutral-800">{currentTrip.behaviorStats.speedViolation}x</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'geofence' && (
              <div className="space-y-3">
                <div className={`p-3.5 rounded-xl border flex items-center justify-between text-[9px] ${
                  currentTrip.geofenceStatus.includes('BREACH') ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={16} />
                    <div>
                      <h4 className="font-bold text-[10px]">Status Batas Geofence</h4>
                      <p>{currentTrip.geofenceStatus}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[10px]">{currentTrip.geofenceZone}</span>
                </div>

                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-2 text-[9px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Batas Kecepatan Maksimal Zona:</span>
                    <span className="font-bold text-neutral-800">{currentTrip.speedLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Kecepatan Saat Ini:</span>
                    <span className="font-bold text-[#4B2172] font-mono">{currentDynamicSpeed} km/jam</span>
                  </div>
                </div>

                {currentTrip.geofenceStatus.includes('BREACH') && (
                  <button 
                    onClick={() => toast.error(`Peringatan darurat terkirim ke driver ${currentTrip.driver}`, { title: 'Peringatan Geofence Dikirim' })}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-[9px] font-bold transition shadow-sm cursor-pointer"
                  >
                    Kirim Peringatan Darurat Keluar Zona
                  </button>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <button 
                onClick={handleCloseDetailModal}
                className="px-5 py-2 bg-[#4B2172] hover:bg-[#3b195a] text-white text-[10px] font-bold rounded-full transition cursor-pointer"
              >
                Tutup Monitoring
              </button>
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  );
}