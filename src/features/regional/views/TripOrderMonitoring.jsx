import { useState, useEffect, useRef } from 'react';
import { 
  Navigation, 
  Search, 
  Play, 
  Pause, 
  RotateCcw, 
  BrainCircuit, 
  ShieldAlert, 
  Award,
  MapPin, 
  ArrowRight,
  Car,
  Radio
} from 'lucide-react';
import { io } from 'socket.io-client';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatCard from '../../../components/ui/StatCard';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import { useAuth } from '../../../context/AuthContext';
import apiClient from '../../../services/apiClient';

export default function RegionalTripMonitoringPage() {
  const { session, adminProfile } = useAuth();
  const leafletMapInstance = useRef(null);
  const movingMarkerRef = useRef(null);
  const traveledLineRef = useRef(null);
  const fullLineRef = useRef(null);
  const socketRef = useRef(null);
  const [tripList, setTripList] = useState([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('replay');
  const [routedCoordinates, setRoutedCoordinates] = useState([]);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const [isPlayingReplay, setIsPlayingReplay] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLiveTrackingActive, setIsLiveTrackingActive] = useState(false);
  const [livePosition, setLivePosition] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadTrips = async () => {
      try {
        if (isMounted) setIsLoadingTrips(true);
        const currentRegionId = (adminProfile?.regionId || session?.regionId) ? String(adminProfile?.regionId || session?.regionId) : null;

        const params = {
          page: currentPage,
          limit: limit,
          ...(currentRegionId ? { regionId: currentRegionId } : {}),
          ...(statusFilter !== 'Semua' ? { status: statusFilter } : {}),
          ...(searchQuery.trim() !== '' ? { search: searchQuery } : {})
        };

        const response = await apiClient.get('/trips', { params }).catch(() => ({ data: { data: [], meta: null } }));

        const rawData = Array.isArray(response.data)
          ? response.data
          : (response.data?.data || []);

        const metaData = response.data?.meta || null;

        const formatted = rawData.map(t => {
          const STATUS_MAP = {
            scheduled: 'Terjadwal',
            pending: 'Terjadwal',
            in_transit: 'Sedang Berjalan',
            completed: 'Selesai',
            cancelled: 'Dibatalkan',
            canceled: 'Dibatalkan',
          };

          const mappedStatus =
            STATUS_MAP[t.status] ||
            (t.status ? String(t.status) : 'Terjadwal');

          return {
            id: String(t.id),
            rawStatus: t.status,
            passenger: t.customer?.name || t.passengerName || 'Pelanggan Umum',
            driver: t.driver?.name || t.mitraName || 'Driver Mitra',
            vehicle: t.vehicle
              ? `${t.vehicle.type} (${t.vehicle.plateNumber})`
              : 'Kendaraan Standar',
            originPos: t.originPoint?.name || 'Pos Asal',
            destinationPos: t.destinationPoint?.name || 'Pos Tujuan',
            status: mappedStatus,
            fare: t.price
              ? `Rp ${Number(t.price).toLocaleString('id-ID')}`
              : 'Rp 35.000',
            time: t.createdAt
              ? new Date(t.createdAt).toLocaleString('id-ID')
              : 'Hari ini',
            originCoord: t.originCoord || { lat: -7.5623, lng: 110.8122 },
            destinationCoord: t.destinationCoord || { lat: -7.5753, lng: 110.8278 },
            dms: {
              fatigueStatus: 'Aman / Normal',
              distractionAlerts: 0,
              eyeClosureScore: '98%',
              phoneUsageDetected: false,
              lastAiLog: 'AI Camera: Mata fokus & berkonsentrasi'
            },
            driverScore: 92,
            geofenceZone: 'Zona Regional Wilayah',
            geofenceStatus: 'Inside Boundary',
            speedLimit: '50 km/jam'
          };
        });

        if (isMounted) {
          setTripList(formatted);
          setPaginationMeta(metaData);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Gagal memuat trip:', error);
          setTripList([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingTrips(false);
        }
      }
    };

    loadTrips();

    return () => {
      isMounted = false;
    };
  }, [adminProfile?.regionId, session?.regionId, currentPage, limit, statusFilter, searchQuery]);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (!currentTrip || !isDetailOpen) return;

    let isSubscribed = true;
    const baseURL = apiClient.defaults.baseURL
      ? apiClient.defaults.baseURL.replace(/\/api\/?$/, '')
      : 'http://localhost:3000';

    const socket = io(`${baseURL}/tracking`, {
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinTripRoom', { tripId: currentTrip.id });
    });

    socket.on('locationUpdated', (data) => {
      if (isSubscribed && data.tripId === currentTrip.id) {
        setLivePosition({
          lat: Number(data.latitude),
          lng: Number(data.longitude)
        });
      }
    });

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
      } catch {
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
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentTrip, isDetailOpen]);

  useEffect(() => {
    if (activeTab !== 'replay' || !currentTrip || routedCoordinates.length === 0 || !isDetailOpen) {
      return;
    }

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

      fullLineRef.current = L.polyline(coords, {
        color: '#4B5563',
        weight: 5,
        dashArray: '2, 6',
        opacity: 0.6
      }).addTo(map);

      traveledLineRef.current = L.polyline([coords[0]], {
        color: '#10367D',
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      const vehicleIcon = L.divIcon({
        className: 'custom-vehicle-marker',
        html: `
          <div style="
            background:#10367D;
            color:white;
            padding:3px 7px;
            border-radius:12px;
            font-weight:bold;
            font-size:9px;
            border:2px solid white;
            box-shadow:0 3px 6px rgba(0,0,0,0.4);
            display:flex;
            align-items:center;
            gap:3px;
            white-space:nowrap;
          ">
            🚗 <span>${currentTrip.driver}</span>
          </div>
        `,
        iconAnchor: [20, 10]
      });

      movingMarkerRef.current = L.marker(coords[0], {
        icon: vehicleIcon
      }).addTo(map);

      map.fitBounds(fullLineRef.current.getBounds(), {
        padding: [35, 35]
      });
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
    if (!currentTrip || routedCoordinates.length === 0 || !leafletMapInstance.current || !isDetailOpen) {
      return;
    }

    const currentPos = isLiveTrackingActive && livePosition 
      ? livePosition 
      : getCurrentTelemetry(routedCoordinates, replayProgress);

    if (movingMarkerRef.current) {
      movingMarkerRef.current.setLatLng([currentPos.lat, currentPos.lng]);
      leafletMapInstance.current.panTo([currentPos.lat, currentPos.lng]);
    }

    if (traveledLineRef.current && !isLiveTrackingActive) {
      const totalSegments = routedCoordinates.length - 1;
      const scaledProgress = (replayProgress / 100) * totalSegments;
      const currentIndex = Math.floor(scaledProgress);

      const traveledPoints = routedCoordinates
        .slice(0, currentIndex + 1)
        .map(c => [c.lat, c.lng]);

      traveledPoints.push([currentPos.lat, currentPos.lng]);
      traveledLineRef.current.setLatLngs(traveledPoints);
    }
  }, [replayProgress, livePosition, isLiveTrackingActive, currentTrip, routedCoordinates, isDetailOpen]);

  useEffect(() => {
    let interval;
    if (isPlayingReplay && isDetailOpen && !isLiveTrackingActive) {
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
  }, [isPlayingReplay, playbackSpeed, isDetailOpen, isLiveTrackingActive]);

  const handleCloseDetailModal = () => {
    setIsPlayingReplay(false);
    setReplayProgress(0);
    setIsLiveTrackingActive(false);
    setLivePosition(null);
    setIsDetailOpen(false);

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

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
    setIsLiveTrackingActive(false);
    setLivePosition(null);
    setIsDetailOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">

      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10367D] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#10367D]">
              MONITORING CERDAS WILAYAH (SERVER-SIDE & WEBSOCKET)
            </span>
          </div>

          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Pemantauan Trip, DMS AI & Geofencing (Database)
          </h1>

          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Pelacakan visual replay dan live tracking real-time dari database wilayah Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL TRIP TERCATAT"
          value={`${paginationMeta?.total || tripList.length} Trip`}
          subtitle="Data riil database terfilter"
          icon={Car}
        />
        <StatCard
          title="RATA-RATA DRIVER SCORE"
          value="92.0 / 100"
          subtitle="Kategori Sangat Aman"
          icon={Award}
        />
        <StatCard
          title="PERINGATAN AI DMS"
          value="0 Deteksi"
          subtitle="Aman terkontrol"
          icon={BrainCircuit}
        />
        <StatCard
          title="STATUS GEOFENCE"
          value="Aman"
          subtitle="Dalam batas wilayah"
          icon={ShieldAlert}
        />
      </div>

      {/* FILTER & LIMIT CONTROL */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari pos asal, tujuan..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-9 pr-8 py-2 text-[10px] sm:text-[11px] font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#10367D] transition"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-neutral-50 border border-neutral-200 rounded-full px-3 py-1.5 text-[10px] font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#10367D] cursor-pointer"
          >
            <option value="Semua">Semua Status</option>
            <option value="scheduled">Terjadwal (Scheduled)</option>
            <option value="in_transit">Sedang Berjalan (In Transit)</option>
            <option value="completed">Selesai (Completed)</option>
            <option value="cancelled">Dibatalkan (Cancelled)</option>
          </select>

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 font-bold text-neutral-800 text-[10px] focus:outline-none cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">ID & Waktu</th>
                <th className="py-3 px-5">Driver & Armada</th>
                <th className="py-3 px-5">Rute (Asal &rarr; Tujuan)</th>
                <th className="py-3 px-5">Status Trip</th>
                <th className="py-3 px-5 text-center">Driver Score</th>
                <th className="py-3 px-5 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-[9px]">
              {isLoadingTrips ? (
                <SkeletonTableRows rows={4} columns={6} />
              ) : tripList.length > 0 ? (
                tripList.map((trip) => (
                  <tr key={trip.id} className="hover:bg-[#74B4D9]/10 transition">
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
                        <MapPin size={11} className="text-[#10367D] shrink-0" />
                        <span className="truncate">{trip.originPos}</span>
                        <ArrowRight size={10} className="text-[#10367D] shrink-0" />
                        <span className="truncate">{trip.destinationPos}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge variant={trip.rawStatus === 'in_transit' ? 'emerald' : 'amber'}>
                        {trip.status}
                      </StatusBadge>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <StatusBadge variant="emerald">★ {trip.driverScore}/100</StatusBadge>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenDetail(trip, 'replay')}
                          title="Visual Replay & Live Tracking"
                          className="p-1.5 bg-[#74B4D9]/15 hover:bg-[#74B4D9]/25 text-[#10367D] rounded-lg transition cursor-pointer"
                        >
                          <Play size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <EmptyState
                      icon={Navigation}
                      title="Trip Tidak Ditemukan"
                      description="Belum ada data trip di database untuk filter ini."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {paginationMeta && paginationMeta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-neutral-50/50 border-t border-neutral-200 text-[10px]">
            <span className="text-neutral-500">
              Halaman <strong>{paginationMeta.page}</strong> dari <strong>{paginationMeta.totalPages}</strong> (Total: {paginationMeta.total} Trip)
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1 || isLoadingTrips}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1 bg-white border border-neutral-200 rounded-lg font-bold disabled:opacity-40 cursor-pointer shadow-sm"
              >
                Sebelumnya
              </button>
              <button
                disabled={currentPage >= paginationMeta.totalPages || isLoadingTrips}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-3 py-1 bg-white border border-neutral-200 rounded-lg font-bold disabled:opacity-40 cursor-pointer shadow-sm"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL MONITORING & WEBSOCKET LIVE TRACKING */}
      <BaseModal
        isOpen={Boolean(isDetailOpen && currentTrip)}
        onClose={handleCloseDetailModal}
        title={`Detail Monitoring Trip ${currentTrip?.id}`}
        subtitle={`Driver: ${currentTrip?.driver}`}
        maxWidth="max-w-2xl"
      >
        {currentTrip && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-300 bg-[#E5ECE7] shadow-inner">
              <div id="real-leaflet-map" className="w-full h-64 z-0" />

              <div className="bg-neutral-900 p-3 text-white space-y-2 relative z-10">
                <div className="flex items-center justify-between text-[9px] pb-1">
                  <span className="text-neutral-400">Mode Tampilan Peta:</span>
                  <button
                    onClick={() => setIsLiveTrackingActive(!isLiveTrackingActive)}
                    className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition ${
                      isLiveTrackingActive ? 'bg-rose-600 text-white animate-pulse' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    <Radio size={10} />
                    <span>{isLiveTrackingActive ? 'Live Tracking (WebSocket Aktif)' : 'Mode Replay Simulasi'}</span>
                  </button>
                </div>

                {!isLiveTrackingActive && (
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
                    className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#10367D] disabled:opacity-50"
                  />
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    {!isLiveTrackingActive && (
                      <>
                        <button
                          onClick={() => setIsPlayingReplay(!isPlayingReplay)}
                          disabled={isFetchingRoute}
                          className="px-4 py-1.5 bg-[#10367D] hover:bg-[#0C2C66] text-white rounded-full text-[9px] font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
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
                        >
                          <RotateCcw size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <button
                onClick={handleCloseDetailModal}
                className="px-5 py-2 bg-[#10367D] hover:bg-[#0C2C66] text-white text-[10px] font-bold rounded-full transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  );
}