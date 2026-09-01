import { useState, useRef, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MapPin,
  Search,
  Bell,
  SlidersHorizontal,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  LineChart as LineChartIcon,
  BarChart3,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  X,
  Info
} from 'lucide-react';
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading';
import { Skeleton, SkeletonStatCard, SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';

export default function SuperadminDashboard() {
  const isLoading = useSimulatedLoading();

  // State Pencarian Utama (Header) & Pencarian Grafik
  const [mainQuery, setMainQuery] = useState('');
  const [chartQuery, setChartQuery] = useState('');

  // State Interaktif untuk Header (Warning & Notifikasi)
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Data Notifikasi
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Duplikasi Akun Mitra', desc: '3 akun mitra terdeteksi ganda di Surabaya', time: '10 menit lalu', unread: true },
    { id: 2, title: 'Lonjakan Refund', desc: 'Beban operasional Region Jakarta meningkat 18%', time: '1 jam lalu', unread: true },
    { id: 3, title: 'Pencairan Komisi', desc: 'Pencairan komisi Jakarta berhasil diproses', time: '3 jam lalu', unread: false }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllNotifsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  // State Filter Data Wilayah
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterSortBy, setFilterSortBy] = useState('default');

  const regionalActivities = useMemo(() => [
    { id: "JKT-001", name: "Region Jakarta", activeOrders: 150, revenueVal: 150000000, revenue: "Rp 150.000.000", category: "Metropolitan", change: 18 },
    { id: "YOG-001", name: "Region Yogyakarta", activeOrders: 120, revenueVal: 120000000, revenue: "Rp 120.000.000", category: "Kota Besar", change: 9 },
    { id: "BANY-001", name: "Region Banyumas", activeOrders: 110, revenueVal: 100000000, revenue: "Rp 100.000.000", category: "Kota Sedang", change: -4 },
    { id: "SBY-001", name: "Region Surabaya", activeOrders: 90, revenueVal: 80000000, revenue: "Rp 80.000.000", category: "Metropolitan", change: 22 }
  ], []);

  const [selectedChartRegion, setSelectedChartRegion] = useState('Semua');

  const targetRevenueJt = useMemo(() => {
    if (selectedChartRegion === 'Semua') {
      return regionalActivities.reduce((sum, r) => sum + r.revenueVal, 0) / 1_000_000;
    }
    const reg = regionalActivities.find(r => r.name === selectedChartRegion);
    return reg ? reg.revenueVal / 1_000_000 : 450;
  }, [selectedChartRegion, regionalActivities]);

  const insights = [
    {
      icon: TrendingDown,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      title: 'Peluang Efisiensi Tarif',
      desc: 'Margin komisi Region Banyumas di bawah rata-rata nasional. Tinjau ulang skema tarif dasarnya.',
      label: 'Potensi Penghematan',
      value: 'Rp 18,4 Jt / Bulan',
    },
    {
      icon: TrendingUp,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      title: 'Kenaikan Biaya Operasional',
      desc: 'Beban refund & operasional Region Jakarta naik cukup tajam bulan ini dibanding rata-rata.',
      label: 'Perubahan Bulanan',
      value: '+ Rp 6,2 Jt',
    },
    {
      icon: AlertTriangle,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      title: 'Duplikasi Akun Mitra',
      desc: 'Terdeteksi lebih dari satu akun mitra terdaftar dengan data yang sama di Region Surabaya.',
      label: 'Potensi Risiko',
      value: '3 Akun',
    },
  ];

  const maxOrders = Math.max(...regionalActivities.map((r) => r.activeOrders));
  const totalOrders = regionalActivities.reduce((sum, r) => sum + r.activeOrders, 0);

  const [recentActivity] = useState([
    { time: "20 Jun 2026", title: "Pencairan Komisi Wilayah Jakarta", desc: "Pencairan komisi mitra bulanan untuk hub Jakarta", status: "Completed", amount: "Rp 12.500.000" },
    { time: "18 Jun 2026", title: "Penyesuaian Tarif Zona Banyumas", desc: "Perubahan skema tarif dasar untuk trip penumpang", status: "Canceled", amount: "Rp 0" },
    { time: "15 Jun 2026", title: "Audit Rutin Region Yogyakarta", desc: "Pemeriksaan rekonsiliasi transaksi bulanan hub", status: "Pending", amount: "Rp 8.200.000" },
  ]);

  const [showPemasukanTotal, setShowPemasukanTotal] = useState(true);
  const [showPemasukanBersih, setShowPemasukanBersih] = useState(true);
  const [activeRange, setActiveRange] = useState('Bulan');
  const [chartType, setChartType] = useState('line');
  const [regionTab, setRegionTab] = useState('Semua');

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const categoryTabs = ['Semua', 'Metropolitan', 'Kota Besar', 'Kota Sedang'];

  const filteredRegions = useMemo(() => {
    const q = mainQuery.toLowerCase().trim();
    let list = regionalActivities
      .filter((r) => regionTab === 'Semua' || r.category === regionTab)
      .filter((r) => {
        if (!q) return true;
        return (
          r.name.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.revenue.toLowerCase().includes(q)
        );
      });

    if (filterSortBy === 'revenue-desc') {
      list = [...list].sort((a, b) => b.revenueVal - a.revenueVal);
    } else if (filterSortBy === 'orders-desc') {
      list = [...list].sort((a, b) => b.activeOrders - a.activeOrders);
    } else if (filterSortBy === 'change-positive') {
      list = list.filter((a) => a.change >= 0);
    } else if (filterSortBy === 'change-negative') {
      list = list.filter((a) => a.change < 0);
    }

    return list;
  }, [regionalActivities, regionTab, mainQuery, filterSortBy]);

  const filteredActivities = useMemo(() => {
    const q = mainQuery.toLowerCase().trim();
    if (!q) return recentActivity;
    return recentActivity.filter((act) =>
      act.title.toLowerCase().includes(q) ||
      act.desc.toLowerCase().includes(q) ||
      act.status.toLowerCase().includes(q) ||
      act.amount.toLowerCase().includes(q) ||
      act.time.toLowerCase().includes(q)
    );
  }, [recentActivity, mainQuery]);

  const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const MONTHS_ID_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const formatTanggalSingkat = (d) => String(d.getDate()).padStart(2, '0');
  const formatTanggalPenuh = (d) => `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
  const formatRupiahFull = (jt) => `Rp ${Math.round(jt * 1_000_000).toLocaleString('id-ID')}`;

  const getWeightForRegion = (baseWeight, index, regionName) => {
    if (regionName === 'Semua') return baseWeight;
    const seed = regionName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const factor = Math.sin((index + seed) * 0.55) * 0.45 + 1;
    return Math.max(0.1, baseWeight * factor);
  };

  const generateHarian = () => {
    const baseWeights = [1.2, 0.9, 0.7, 0.6, 0.8, 1.4, 2.6, 4.5, 6.8, 8.2, 9.0, 9.6, 9.2, 8.6, 8.0, 8.4, 9.4, 10.2, 10.8, 9.6, 7.4, 5.2, 3.4, 2.0];
    const weights = baseWeights.map((w, i) => getWeightForRegion(w, i, selectedChartRegion));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    return weights.map((w, i) => {
      const totalVal = (w / totalWeight) * targetRevenueJt;
      return {
        date: new Date(2026, 7, 27, i),
        label: `${String(i).padStart(2, '0')}:00`,
        fullLabel: `27 Agu 2026, ${String(i).padStart(2, '0')}:00`,
        pemasukanTotal: totalVal,
        pemasukanBersih: totalVal * 0.8,
      };
    });
  };

  const generateMingguan = () => {
    const baseWeights = [95, 108, 101, 122, 138, 119, 131, 150];
    const weights = baseWeights.map((w, i) => getWeightForRegion(w, i, selectedChartRegion));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    return weights.map((w, i) => {
      const totalVal = (w / totalWeight) * targetRevenueJt;
      const mulai = new Date(2026, 5, 8 + i * 7);
      const akhir = new Date(2026, 5, 14 + i * 7);
      return {
        date: mulai,
        label: `M${i + 1}`,
        fullLabel: `${mulai.getDate()}–${akhir.getDate()} ${MONTHS_ID[akhir.getMonth()]} ${akhir.getFullYear()}`,
        pemasukanTotal: totalVal,
        pemasukanBersih: totalVal * 0.8,
      };
    });
  };

  const generateBulanan = () => {
    const baseWeights = [12, 13, 15, 14, 16, 18, 20, 15, 14, 13, 17, 19, 22, 24, 16, 15, 14, 18, 21, 23, 25, 17, 16, 15, 19, 22, 24, 26, 18, 17];
    const weights = baseWeights.map((w, i) => getWeightForRegion(w, i, selectedChartRegion));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    return weights.map((w, i) => {
      const totalVal = (w / totalWeight) * targetRevenueJt;
      const date = new Date(2026, 5, i + 1);
      return {
        date,
        label: formatTanggalSingkat(date),
        fullLabel: formatTanggalPenuh(date),
        pemasukanTotal: totalVal,
        pemasukanBersih: totalVal * 0.8,
      };
    });
  };

  const generateTahunan = () => {
    const baseWeights = [320, 295, 350, 380, 410, 452, 470, 431, 462, 508, 480, 538];
    const weights = baseWeights.map((w, i) => getWeightForRegion(w, i, selectedChartRegion));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    return weights.map((w, i) => {
      const totalVal = (w / totalWeight) * targetRevenueJt;
      return {
        date: new Date(2026, i, 1),
        label: MONTHS_ID[i],
        fullLabel: `${MONTHS_ID_FULL[i]} 2026`,
        pemasukanTotal: totalVal,
        pemasukanBersih: totalVal * 0.8,
      };
    });
  };

  const RANGE_GENERATORS = { Hari: generateHarian, Minggu: generateMingguan, Bulan: generateBulanan, Tahun: generateTahunan };
  const RANGE_LABEL_STEP = { Hari: 4, Minggu: 1, Bulan: 4, Tahun: 1 };

  const rawChartData = useMemo(() => RANGE_GENERATORS[activeRange](), [activeRange, targetRevenueJt, selectedChartRegion]);

  const chartData = useMemo(() => {
    const q = chartQuery.toLowerCase().trim();
    if (!q) return rawChartData;
    return rawChartData.filter(
      (d) =>
        d.label.toLowerCase().includes(q) ||
        d.fullLabel.toLowerCase().includes(q)
    );
  }, [rawChartData, chartQuery]);

  const xLabelStep = chartQuery.trim() ? 1 : RANGE_LABEL_STEP[activeRange] || 1;

  const CHART_MAX = useMemo(() => {
    if (chartData.length === 0) return 10;
    const maxVal = Math.max(...chartData.map((d) => d.pemasukanTotal));
    const step = maxVal <= 5 ? 1 : maxVal <= 30 ? 5 : maxVal <= 150 ? 25 : 50;
    return Math.max(step, Math.ceil(maxVal / step) * step);
  }, [chartData]);

  const totalPemasukanTotalPeriode = formatRupiahFull(chartData.reduce((sum, d) => sum + d.pemasukanTotal, 0));
  const totalPemasukanBersihPeriode = formatRupiahFull(chartData.reduce((sum, d) => sum + d.pemasukanBersih, 0));

  const rangeSummaryLabel = useMemo(() => {
    if (chartData.length === 0) return 'Data Tidak Ditemukan';
    if (activeRange === 'Hari') return `27 Agustus 2026 · Per Jam`;
    if (activeRange === 'Minggu') return `${chartData.length} Minggu Terfilter`;
    if (activeRange === 'Bulan') return `${formatTanggalSingkat(chartData[0].date)} – ${formatTanggalPenuh(chartData[chartData.length - 1].date)}`;
    return `Tahun ${chartData[0].date.getFullYear()}`;
  }, [activeRange, chartData]);

  const CW = 700, CH = 220, PAD_L = 64, PAD_R = 35, PAD_T = 16, PAD_B = 26;
  const plotW = CW - PAD_L - PAD_R;
  const plotH = CH - PAD_T - PAD_B;
  const xFor = (i) => {
    if (chartData.length <= 1) return PAD_L + plotW / 2;
    return PAD_L + (i / (chartData.length - 1)) * plotW;
  };
  const yFor = (v) => PAD_T + plotH - (v / CHART_MAX) * plotH;

  const toPoints = (key) => chartData.map((d, i) => ({ x: xFor(i), y: yFor(d[key]) }));
  const smoothLinePath = (pts) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M${pts[0].x},${pts[0].y} L${pts[0].x + 1},${pts[0].y}`;
    let d = `M${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const pemasukanTotalPointsArr = toPoints('pemasukanTotal');
  const pemasukanBersihPointsArr = toPoints('pemasukanBersih');
  const pemasukanTotalLinePath = smoothLinePath(pemasukanTotalPointsArr);
  const pemasukanBersihLinePath = smoothLinePath(pemasukanBersihPointsArr);
  const areaPathFor = (linePath) => {
    if (chartData.length === 0) return '';
    const lastX = chartData.length === 1 ? xFor(0) + 1 : xFor(chartData.length - 1);
    return `${linePath} L${lastX},${PAD_T + plotH} L${xFor(0)},${PAD_T + plotH} Z`;
  };
  const pemasukanTotalAreaPath = areaPathFor(pemasukanTotalLinePath);
  const pemasukanBersihAreaPath = areaPathFor(pemasukanBersihLinePath);

  const barGroupW = chartData.length > 0 ? plotW / chartData.length : plotW;
  const barW = Math.min(barGroupW * 0.32, 20);

  useEffect(() => {
    setHoveredIndex(null);
  }, [activeRange, selectedChartRegion, chartQuery]);

  const chartSvgRef = useRef(null);
  const handleMouseMove = (e) => {
    if (chartData.length === 0) return;
    const svg = chartSvgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const svgX = relX * CW;
    let nearest = 0;
    let minDist = Infinity;
    chartData.forEach((_, i) => {
      const dist = Math.abs(xFor(i) - svgX);
      if (dist < minDist) { minDist = dist; nearest = i; }
    });
    setHoveredIndex(nearest);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const activeIndex = hoveredIndex;
  const selectedX = activeIndex !== null && chartData[activeIndex] ? xFor(activeIndex) : 0;
  const selectedY = activeIndex !== null && chartData[activeIndex] ? yFor(chartData[activeIndex].pemasukanTotal) : 0;
  const selectedPct = (selectedX / CW) * 100;
  const tooltipAnchor = selectedPct < 20 ? 'left' : selectedPct > 70 ? 'right' : 'center';

  const statusStyle = {
    Completed: { icon: CheckCircle2, text: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500', label: 'Selesai' },
    Canceled: { icon: XCircle, text: 'text-rose-600', bg: 'bg-rose-50', dot: 'bg-rose-500', label: 'Dibatalkan' },
    Pending: { icon: Clock, text: 'text-[#4B2172]', bg: 'bg-[#4B2172]/10', dot: 'bg-[#4B2172]', label: 'Menunggu' },
  };

  const rowAccents = [
    { bg: 'bg-[#4B2172]/10', text: 'text-[#4B2172]' },
    { bg: 'bg-[#4B2172]/[0.16]', text: 'text-[#4B2172]' },
    { bg: 'bg-neutral-100', text: 'text-neutral-500' },
    { bg: 'bg-[#4B2172]/[0.08]', text: 'text-[#4B2172]/80' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      {/* Header Utama Simetris (Baris 1: Mobile Icons & Desktop Inline | Baris 2: Mobile Search Input Full Width) */}
      <div className="flex flex-col gap-3 pb-3 border-b border-neutral-100">
        <div className="flex items-center justify-between gap-3 pl-14 lg:pl-0 h-11">
          {/* Desktop Search Bar (Hanya tampil di Tablet/Desktop) */}
          <div className="hidden sm:block relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={mainQuery}
              onChange={(e) => setMainQuery(e.target.value)}
              placeholder="Search here..."
              className="w-full pl-10 pr-8 py-2 bg-white border border-neutral-200 rounded-full text-[11px] text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4B2172] transition shadow-sm"
            />
            {mainQuery && (
              <button
                onClick={() => setMainQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Action Controls Kanan (Warning, Notifikasi, Profile) */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto relative">
            {/* Tombol Warning */}
            <button
              onClick={() => {
                setShowWarningModal(true);
                setShowNotifDropdown(false);
              }}
              aria-label="Peringatan Sistem"
              className="relative w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-amber-600 transition shadow-sm cursor-pointer shrink-0"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            </button>

            {/* Tombol Notifikasi */}
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowWarningModal(false);
              }}
              aria-label="Notifikasi"
              className="relative w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-[#4B2172] transition shadow-sm cursor-pointer shrink-0"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              )}
            </button>

            {/* Profil Gibyan */}
            <div className="flex items-center gap-2.5 cursor-pointer shrink-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-[#4B2172] text-white flex items-center justify-center font-bold text-[13px]">
                  G
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[12px] font-bold text-neutral-800 leading-tight">Gibyan</span>
                <span className="text-[10px] text-neutral-400 leading-tight">Superadmin</span>
              </div>
            </div>

            {/* Dropdown Notifikasi */}
            {showNotifDropdown && (
              <div className="absolute right-0 top-12 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-neutral-200 z-50 overflow-hidden animate-in fade-in duration-150">
                <div className="p-3.5 border-b border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-neutral-800">Notifikasi</span>
                    {unreadCount > 0 && (
                      <span className="text-[9px] font-semibold bg-[#4B2172]/10 text-[#4B2172] px-2 py-0.5 rounded-full">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotifsAsRead}
                      className="text-[10px] font-medium text-[#4B2172] hover:underline"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-neutral-50">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-3 hover:bg-neutral-50 transition cursor-pointer ${n.unread ? 'bg-purple-50/30' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-[11px] font-semibold text-neutral-800">{n.title}</p>
                        <span className="text-[8px] text-neutral-400">{n.time}</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 leading-tight">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Only Search Input (Tampil rapi full-width di baris 2 layar HP) */}
        <div className="sm:hidden relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={mainQuery}
            onChange={(e) => setMainQuery(e.target.value)}
            placeholder="Search here..."
            className="w-full pl-10 pr-8 py-2 bg-white border border-neutral-200 rounded-full text-[11px] text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4B2172] transition shadow-sm"
          />
          {mainQuery && (
            <button
              onClick={() => setMainQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Modal Warning Peringatan */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-gray-900">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle size={20} />
                <h3 className="text-[14px] font-bold text-neutral-800">Peringatan Sistem Terbaru</h3>
              </div>
              <button
                onClick={() => setShowWarningModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
                <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-amber-900">Lonjakan Refund Region Jakarta</p>
                  <p className="text-[10px] text-amber-700 mt-0.5">Beban refund naik +18% melampaui ambang batas operasional bulanan.</p>
                </div>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-3">
                <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-rose-900">Duplikasi Akun Terdeteksi</p>
                  <p className="text-[10px] text-rose-700 mt-0.5">3 Mitra teridentifikasi memiliki data ganda di Region Surabaya.</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-2.5 bg-[#4B2172] text-white text-[11px] font-semibold rounded-full hover:bg-[#3b195a] transition"
            >
              Tutup & Evaluasi
            </button>
          </div>
        </div>
      )}

      {/* Greetings */}
      <div className="pt-1">
        <h1 className="text-[18px] font-bold text-neutral-800">Halo Gibyan, selamat datang kembali! 👋</h1>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {isLoading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          insights.map((insight, idx) => {
            const InsightIcon = insight.icon;
            return (
              <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${insight.iconBg} ${insight.iconColor} p-2 rounded-xl shrink-0`}>
                    <InsightIcon size={16} />
                  </div>
                  <h3 className="text-[14px] font-semibold text-neutral-800 leading-snug">{insight.title}</h3>
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed mb-4">{insight.desc}</p>
                <div className="mt-auto pt-1">
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">{insight.label}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[18px] font-bold text-neutral-800">{insight.value}</span>
                    <button className="flex items-center gap-0.5 text-[10px] font-semibold text-[#4B2172] hover:underline cursor-pointer">
                      Lihat Detail <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Kartu Grafik Rekap Pemasukan */}
      {isLoading ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[14px] font-semibold text-neutral-800">Rekap Pemasukan</h2>
              <span className="flex items-center gap-1 text-[8px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live
              </span>
            </div>

            <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 rounded-full p-1">
              {['Hari', 'Minggu', 'Bulan', 'Tahun'].map((range) => (
                <button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  className={`text-[10px] font-semibold px-3 py-1 rounded-full transition cursor-pointer ${
                    activeRange === range ? 'bg-white text-[#4B2172] shadow-sm' : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedChartRegion}
                  onChange={(e) => setSelectedChartRegion(e.target.value)}
                  className="pl-8 pr-7 py-1.5 bg-neutral-50 border border-neutral-200 rounded-full text-[10px] font-semibold text-neutral-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#4B2172] cursor-pointer"
                >
                  <option value="Semua">Semua Wilayah</option>
                  {regionalActivities.map((r) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              </div>

              <div className="relative flex-1 sm:w-60">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={chartQuery}
                  onChange={(e) => setChartQuery(e.target.value)}
                  placeholder="Cari & filter pemasukan..."
                  className="w-full pl-9 pr-8 py-1.5 bg-neutral-50 border border-neutral-200 rounded-full text-[10px] text-neutral-600 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4B2172] transition"
                />
                {chartQuery && (
                  <button
                    onClick={() => setChartQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-full text-[10px] font-semibold text-neutral-600">
                <Calendar size={13} />
                {rangeSummaryLabel}
              </button>
              <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 rounded-full p-1">
                <button
                  onClick={() => setChartType('line')}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition cursor-pointer ${
                    chartType === 'line' ? 'bg-white text-[#4B2172] shadow-sm' : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  <LineChartIcon size={13} />
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition cursor-pointer ${
                    chartType === 'bar' ? 'bg-white text-[#4B2172] shadow-sm' : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  <BarChart3 size={13} />
                </button>
              </div>
              <button className="w-7 h-7 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-[#4B2172] transition">
                <Download size={13} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-8 pt-1">
            <button
              onClick={() => setShowPemasukanTotal(!showPemasukanTotal)}
              className={`text-left cursor-pointer transition-opacity ${showPemasukanTotal ? 'opacity-100' : 'opacity-40'}`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#4B2172]"></span>
                <span className="text-[10px] font-medium text-neutral-500">Total Pemasukan</span>
              </div>
              <p className="text-[18px] font-bold text-neutral-800">{totalPemasukanTotalPeriode}</p>
            </button>
            <button
              onClick={() => setShowPemasukanBersih(!showPemasukanBersih)}
              className={`text-left cursor-pointer transition-opacity ${showPemasukanBersih ? 'opacity-100' : 'opacity-40'}`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-violet-300"></span>
                <span className="text-[10px] font-medium text-neutral-500">Pemasukan Bersih</span>
              </div>
              <p className="text-[18px] font-bold text-neutral-800">{totalPemasukanBersihPeriode}</p>
            </button>
          </div>

          <div className="relative pt-2">
            {chartData.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-center p-4 bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
                <p className="text-[12px] font-semibold text-neutral-700">Data Pemasukan Tidak Ditemukan</p>
                <p className="text-[10px] text-neutral-400 mt-1">Tidak ada titik data pemasukan yang sesuai kata kunci "{chartQuery}".</p>
                <button
                  onClick={() => setChartQuery('')}
                  className="mt-3 text-[10px] font-semibold text-[#4B2172] hover:underline"
                >
                  Bersihkan Pencarian
                </button>
              </div>
            ) : (
              <svg
                ref={chartSvgRef}
                viewBox={`0 0 ${CW} ${CH}`}
                className="w-full h-56 cursor-crosshair overflow-visible"
                preserveAspectRatio="none"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <defs>
                  <linearGradient id="pemasukanTotalFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4B2172" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#4B2172" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="pemasukanBersihFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {[0, 1, 2, 3].map((g) => {
                  const gy = PAD_T + (g * plotH) / 3;
                  const gValue = CHART_MAX - (g * CHART_MAX) / 3;
                  const formattedValue =
                    gValue === 0
                      ? 'Rp 0'
                      : `Rp ${Number.isInteger(gValue) ? gValue : gValue.toFixed(1).replace('.', ',')} Jt`;
                  return (
                    <g key={g}>
                      <line x1={PAD_L} x2={CW - PAD_R} y1={gy} y2={gy} stroke="#E7E5EE" strokeWidth="1" strokeDasharray="2 4" />
                      <text
                        x={PAD_L - 10}
                        y={gy}
                        dominantBaseline="middle"
                        fontSize="8"
                        fontFamily="Inter, sans-serif"
                        fontWeight="500"
                        fill="#A3A3A3"
                        textAnchor="end"
                      >
                        {formattedValue}
                      </text>
                    </g>
                  );
                })}

                {chartType === 'line' ? (
                  <>
                    {showPemasukanBersih && (
                      <>
                        <path d={pemasukanBersihAreaPath} fill="url(#pemasukanBersihFill)" />
                        <path d={pemasukanBersihLinePath} fill="none" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </>
                    )}
                    {showPemasukanTotal && (
                      <>
                        <path d={pemasukanTotalAreaPath} fill="url(#pemasukanTotalFill)" />
                        <path d={pemasukanTotalLinePath} fill="none" stroke="#4B2172" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </>
                    )}

                    {activeIndex !== null && chartData[activeIndex] && (
                      <g>
                        {showPemasukanTotal && (
                          <circle
                            cx={xFor(activeIndex)}
                            cy={yFor(chartData[activeIndex].pemasukanTotal)}
                            r={5}
                            fill="#4B2172"
                            stroke="white"
                            strokeWidth="2"
                          />
                        )}
                        {showPemasukanBersih && (
                          <circle
                            cx={xFor(activeIndex)}
                            cy={yFor(chartData[activeIndex].pemasukanBersih)}
                            r={4.5}
                            fill="#c4b5fd"
                            stroke="white"
                            strokeWidth="2"
                          />
                        )}
                      </g>
                    )}
                  </>
                ) : (
                  <>
                    {chartData.map((d, i) => (
                      <g key={i}>
                        {showPemasukanTotal && (
                          <rect
                            x={xFor(i) - barW - 1.5}
                            y={yFor(d.pemasukanTotal)}
                            width={barW}
                            height={(PAD_T + plotH) - yFor(d.pemasukanTotal)}
                            rx={2}
                            fill="#4B2172"
                            opacity={i === activeIndex ? 1 : 0.85}
                          />
                        )}
                        {showPemasukanBersih && (
                          <rect
                            x={xFor(i) + 1.5}
                            y={yFor(d.pemasukanBersih)}
                            width={barW}
                            height={(PAD_T + plotH) - yFor(d.pemasukanBersih)}
                            rx={2}
                            fill="#c4b5fd"
                            opacity={i === activeIndex ? 1 : 0.85}
                          />
                        )}
                      </g>
                    ))}
                  </>
                )}

                {activeIndex !== null && chartData[activeIndex] && (
                  <line
                    x1={selectedX}
                    x2={selectedX}
                    y1={PAD_T}
                    y2={PAD_T + plotH}
                    stroke="#27272a"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.7"
                  />
                )}

                {chartData.map((d, i) => (
                  (i % xLabelStep === 0 || i === chartData.length - 1) && (
                    <text
                      key={i}
                      x={xFor(i)}
                      y={CH - 6}
                      fontSize="8"
                      fontFamily="Inter, sans-serif"
                      fontWeight="500"
                      fill="#A3A3A3"
                      textAnchor="middle"
                    >
                      {d.label}
                    </text>
                  )
                ))}
              </svg>
            )}

            {chartType === 'line' && activeIndex !== null && chartData[activeIndex] && (
              <div
                className="hidden sm:block absolute bg-[#1c1c22] rounded-2xl shadow-xl p-3 w-44 pointer-events-none transition-all duration-75 z-10"
                style={{
                  left: `${selectedPct}%`,
                  top: `${(selectedY / CH) * 100}%`,
                  transform:
                    tooltipAnchor === 'left' ? 'translate(10px, -110%)' :
                    tooltipAnchor === 'right' ? 'translate(-105%, -110%)' :
                    'translate(-50%, -120%)'
                }}
              >
                <p className="text-[9px] font-semibold text-white mb-1.5">{chartData[activeIndex].fullLabel}</p>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="flex items-center gap-1 text-[9px] text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] shrink-0"></span>Total Pemasukan
                  </span>
                  <span className="text-[9px] font-bold text-white whitespace-nowrap">{formatRupiahFull(chartData[activeIndex].pemasukanTotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 text-[9px] text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c4b5fd] shrink-0"></span>Pemasukan Bersih
                  </span>
                  <span className="text-[9px] font-bold text-white whitespace-nowrap">{formatRupiahFull(chartData[activeIndex].pemasukanBersih)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Baris 3: Data Wilayah (Kartu di HP, Tabel di Desktop) & Riwayat Aktivitas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <SkeletonTableRows rows={4} columns={4} />
          </div>
        ) : (
          <>
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-[#4B2172]/10 text-[#4B2172] p-1.5 rounded-xl">
                      <MapPin size={15} />
                    </div>
                    <h2 className="text-[14px] font-semibold text-neutral-800">Data Wilayah</h2>
                    <span className="text-[9px] text-neutral-400">· {filteredRegions.length} Wilayah</span>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition cursor-pointer border ${
                        filterSortBy !== 'default'
                          ? 'bg-[#4B2172] text-white border-[#4B2172]'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      <SlidersHorizontal size={12} />
                      Filter {filterSortBy !== 'default' && '•'}
                    </button>

                    {showFilterDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-neutral-200 py-2 z-30 animate-in fade-in duration-150">
                        <p className="px-3 py-1 text-[8px] font-semibold text-neutral-400 uppercase tracking-wider">Urutkan & Filter</p>
                        <button
                          onClick={() => { setFilterSortBy('default'); setShowFilterDropdown(false); }}
                          className={`w-full text-left px-3 py-1.5 text-[10px] hover:bg-neutral-50 ${filterSortBy === 'default' ? 'font-bold text-[#4B2172]' : 'text-neutral-700'}`}
                        >
                          Default
                        </button>
                        <button
                          onClick={() => { setFilterSortBy('revenue-desc'); setShowFilterDropdown(false); }}
                          className={`w-full text-left px-3 py-1.5 text-[10px] hover:bg-neutral-50 ${filterSortBy === 'revenue-desc' ? 'font-bold text-[#4B2172]' : 'text-neutral-700'}`}
                        >
                          Pendapatan Tertinggi
                        </button>
                        <button
                          onClick={() => { setFilterSortBy('orders-desc'); setShowFilterDropdown(false); }}
                          className={`w-full text-left px-3 py-1.5 text-[10px] hover:bg-neutral-50 ${filterSortBy === 'orders-desc' ? 'font-bold text-[#4B2172]' : 'text-neutral-700'}`}
                        >
                          Pesanan Terbanyak
                        </button>
                        <button
                          onClick={() => { setFilterSortBy('change-positive'); setShowFilterDropdown(false); }}
                          className={`w-full text-left px-3 py-1.5 text-[10px] hover:bg-neutral-50 ${filterSortBy === 'change-positive' ? 'font-bold text-[#4B2172]' : 'text-neutral-700'}`}
                        >
                          Perubahan Positif (+)
                        </button>
                        <button
                          onClick={() => { setFilterSortBy('change-negative'); setShowFilterDropdown(false); }}
                          className={`w-full text-left px-3 py-1.5 text-[10px] hover:bg-neutral-50 ${filterSortBy === 'change-negative' ? 'font-bold text-[#4B2172]' : 'text-neutral-700'}`}
                        >
                          Perubahan Negatif (-)
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 overflow-x-auto">
                  {categoryTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setRegionTab(tab)}
                      className={`pb-1.5 text-[10px] font-semibold whitespace-nowrap transition cursor-pointer border-b-2 ${
                        regionTab === tab
                          ? 'text-[#4B2172] border-[#4B2172]'
                          : 'text-neutral-400 border-transparent hover:text-neutral-600'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tampilan Kartu Responsif Khusus Layar HP (<640px) */}
              <div className="block sm:hidden divide-y divide-gray-100">
                {filteredRegions.length === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      title="Belum ada aktivitas wilayah"
                      description={`Tidak ada wilayah yang sesuai dengan kriteria pencarian.`}
                    />
                  </div>
                ) : (
                  filteredRegions.map((region, index) => {
                    const accent = rowAccents[index % rowAccents.length];
                    const share = Math.round((region.activeOrders / totalOrders) * 100);
                    const barWidth = Math.round((region.activeOrders / maxOrders) * 100);
                    const isUp = region.change >= 0;
                    return (
                      <div key={region.id} className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 ${accent.bg} ${accent.text} rounded-xl shrink-0`}>
                              <MapPin size={14} />
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                <span className="font-semibold text-neutral-800 text-[11px]">{region.name}</span>
                              </div>
                              <div className="text-[9px] text-neutral-400">{region.category}</div>
                            </div>
                          </div>
                          <span className={`flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${isUp ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(region.change)}%
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="text-neutral-400 font-medium">Pesanan Aktif</span>
                            <span className="font-semibold text-neutral-700">{share}% ({region.activeOrders} trip)</span>
                          </div>
                          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#4B2172] rounded-full" style={{ width: `${barWidth}%` }} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-dashed border-neutral-100 text-[10px]">
                          <span className="text-neutral-400">Pendapatan</span>
                          <span className="font-bold text-neutral-800">{region.revenue}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Tampilan Tabel Klasik untuk Layar Tablet & Desktop (>=640px) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-medium">
                      <th className="py-3 px-5">Wilayah</th>
                      <th className="py-3 px-5">% Pesanan Aktif</th>
                      <th className="py-3 px-5">Pendapatan</th>
                      <th className="py-3 px-5">% Perubahan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRegions.length === 0 ? (
                      <tr>
                        <td colSpan={4}>
                          <EmptyState
                            title="Belum ada aktivitas wilayah"
                            description={`Tidak ada wilayah yang sesuai dengan kriteria pencarian.`}
                          />
                        </td>
                      </tr>
                    ) : (
                      filteredRegions.map((region, index) => {
                        const accent = rowAccents[index % rowAccents.length];
                        const share = Math.round((region.activeOrders / totalOrders) * 100);
                        const barWidth = Math.round((region.activeOrders / maxOrders) * 100);
                        const isUp = region.change >= 0;
                        return (
                          <tr key={region.id} className="hover:bg-gray-50/50 transition-colors text-[9px]">
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2.5">
                                <div className={`p-2 ${accent.bg} ${accent.text} rounded-xl shrink-0`}>
                                  <MapPin size={14} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                    <span className="font-semibold text-neutral-800 truncate text-[9px]">{region.name}</span>
                                  </div>
                                  <div className="text-[8px] text-neutral-400">{region.category}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2.5 min-w-[120px]">
                                <span className="text-[9px] font-semibold text-neutral-600 w-8 shrink-0">{share}%</span>
                                <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#4B2172] rounded-full"
                                    style={{ width: `${barWidth}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-5 font-bold text-neutral-800 whitespace-nowrap text-[9px]">
                              {region.revenue}
                            </td>
                            <td className="py-3.5 px-5">
                              <span className={`flex items-center gap-0.5 text-[9px] font-semibold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {Math.abs(region.change)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-semibold text-neutral-800">Riwayat Aktivitas</h2>
                <button className="text-[10px] font-semibold text-[#4B2172] hover:underline cursor-pointer">Lihat Semua</button>
              </div>

              <div className="space-y-3 flex-1">
                {filteredActivities.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400 text-[10px]">
                    Tidak ada aktivitas yang sesuai dengan pencarian.
                  </div>
                ) : (
                  filteredActivities.map((activity, idx) => {
                    const s = statusStyle[activity.status];
                    const StatusIcon = s.icon;
                    return (
                      <div key={idx} className={idx !== filteredActivities.length - 1 ? "pb-3 border-b border-gray-100" : ""}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                          <span className="text-[8px] text-neutral-400 font-medium">{activity.time}</span>
                        </div>
                        <p className="text-[9px] font-semibold text-neutral-800 mb-0.5">{activity.title}</p>
                        <p className="text-[8px] text-neutral-400 mb-2 line-clamp-1">{activity.desc}</p>
                        <div className="flex items-center justify-between">
                          <span className={`flex items-center gap-1 text-[8px] font-semibold ${s.text} ${s.bg} px-2 py-0.5 rounded-full`}>
                            <StatusIcon size={10} /> {s.label}
                          </span>
                          <span className="text-[9px] font-bold text-neutral-800">{activity.amount}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}