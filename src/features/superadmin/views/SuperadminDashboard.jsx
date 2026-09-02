import { useState, useRef, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MapPin,
  Search,
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
  X
} from 'lucide-react';
import { Skeleton, SkeletonStatCard, SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { useAuth } from '../../../context/AuthContext';
import { getGlobalDashboard, getEscrowLedger } from '../../../services/adminService';

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

export default function SuperadminDashboard() {
  const { session } = useAuth();
  const displayName = session?.name || session?.fullName || session?.username || 'Admin';

  // State Data dari Backend & Loading
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [escrowLedgerData, setEscrowLedgerData] = useState(null);

  // State Pencarian Utama (Header) & Pencarian Grafik
  const [mainQuery, setMainQuery] = useState('');
  const [chartQuery, setChartQuery] = useState('');

  // State Filter Data Wilayah
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterSortBy, setFilterSortBy] = useState('default');

  // Ambil data riil global dashboard & escrow ledger dari backend saat komponen dimuat
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        setIsLoading(true);
        const [dashRes, escrowRes] = await Promise.all([
          getGlobalDashboard(),
          getEscrowLedger().catch(() => null)
        ]);
        if (isMounted) {
          setDashboardData(dashRes?.data || dashRes);
          setEscrowLedgerData(escrowRes?.data || escrowRes);
        }
      } catch (err) {
        console.error('Gagal memuat data dashboard superadmin:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Transformasi data wilayah riil dari respons backend (regionalSummary)[cite: 5]
  // Transformasi data wilayah murni dari respons backend tanpa data tiruan
  const regionalActivities = useMemo(() => {
    const rawList = dashboardData?.regionalSummary || [];
    if (Array.isArray(rawList) && rawList.length > 0) {
      const totalGlobalActive = rawList.reduce((sum, r) => sum + (r.activeUserCount || 0), 0) || 1;

      return rawList.map((reg, index) => {
        const pointsCount = reg.pickupPointsCount || 0;
        const activeCount = reg.activeUserCount || 0;
        
        // Pendapatan murni dari backend (jika ada properti revenue/totalRevenue, jika tidak 0)
        const realRevenue = Number(reg.revenue || reg.totalRevenue || 0);
        
        // Rasio aktivitas user murni dihitung dari perbandingan activeUserCount wilayah terhadap total global
        const userActivityShare = Math.round((activeCount / totalGlobalActive) * 100);

        return {
          id: String(reg.regionId || index + 1),
          name: reg.regionName || `Region ${index + 1}`,
          code: reg.regionCode || 'REG',
          activeOrders: activeCount,
          pickupPointsCount: pointsCount,
          revenueVal: realRevenue,
          revenue: `Rp ${realRevenue.toLocaleString('id-ID')}`,
          sharePercentage: userActivityShare,
          category: pointsCount > 5 ? 'Metropolitan' : pointsCount > 0 ? 'Kota Besar' : 'Kota Sedang',
          change: reg.change || 0,
        };
      });
    }
    return [];
  }, [dashboardData]);

  const [selectedChartRegion, setSelectedChartRegion] = useState('Semua');

  // Target pendapatan riil dari overview backend[cite: 5]
  const targetRevenueJt = useMemo(() => {
    const totalRevBackend = dashboardData?.overview?.totalRevenue;
    if (totalRevBackend !== undefined && selectedChartRegion === 'Semua') {
      return totalRevBackend / 1_000_000;
    }
    if (selectedChartRegion === 'Semua') {
      const total = regionalActivities.reduce((sum, r) => sum + r.revenueVal, 0);
      return total > 0 ? total / 1_000_000 : 1;
    }
    const reg = regionalActivities.find(r => r.name === selectedChartRegion);
    return reg ? reg.revenueVal / 1_000_000 : 1;
  }, [selectedChartRegion, regionalActivities, dashboardData]);

  // Insight dinamis murni berdasarkan data overview backend[cite: 5]
  const insights = useMemo(() => {
    const overview = dashboardData?.overview || dashboardData || {};
    const escrowSummary = escrowLedgerData?.summary || escrowLedgerData || {};
    return [
      {
        icon: TrendingUp,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        title: 'Total Pendapatan Platform',
        desc: 'Akumulasi seluruh transaksi sukses yang tercatat secara real-time pada sistem.',
        label: 'Pendapatan Kotor',
        value: `Rp ${(Number(overview.totalRevenue) || 0).toLocaleString('id-ID')}`,
      },
      {
        icon: TrendingDown,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
        title: 'Komisi Platform',
        desc: 'Total perolehan persentase komisi sistem dari keseluruhan transaksi aktif.',
        label: 'Komisi Sistem',
        value: `Rp ${(Number(overview.platformCommision || overview.platformCommission) || 0).toLocaleString('id-ID')}`,
      },
      {
        icon: AlertTriangle,
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-600',
        title: 'Status Escrow Aktif',
        desc: 'Dana tertahan (Escrow Hold) vs Dana cair (Released) dalam sistem saat ini.',
        label: 'Escrow Ditahan',
        value: `Rp ${(Number(escrowSummary.totalHeldEscrow || escrowSummary.heldEscrow) || 0).toLocaleString('id-ID')}`,
      },
    ];
  }, [dashboardData, escrowLedgerData]);

  const maxOrders = regionalActivities.length > 0 ? Math.max(...regionalActivities.map((r) => r.activeOrders), 1) : 1;
  const totalOrders = regionalActivities.reduce((sum, r) => sum + r.activeOrders, 0) || 1;

  // Riwayat aktivitas diambil langsung dari riwayat transaksi escrow ledger backend[cite: 5]
  const recentActivity = useMemo(() => {
    const rawTx = escrowLedgerData?.recentTransactions || escrowLedgerData?.transactions || [];
    if (Array.isArray(rawTx) && rawTx.length > 0) {
      return rawTx.map((tx) => {
        const isRelease = tx.type === 'escrow_release';
        return {
          time: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Hari ini',
          title: tx.description || `Transaksi Order #${tx.orderId || '-'}`,
          desc: `Wallet ID: ${tx.walletId || '-'} • Tipe: ${tx.type || '-'}`,
          status: isRelease ? 'Completed' : 'Pending',
          amount: `Rp ${Number(tx.amount || 0).toLocaleString('id-ID')}`
        };
      });
    }
    return [];
  }, [escrowLedgerData]);

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

  const rawChartData = useMemo(() => {
    const generateHarian = () => {
      const baseWeights = [1.2, 0.9, 0.7, 0.6, 0.8, 1.4, 2.6, 4.5, 6.8, 8.2, 9.0, 9.6, 9.2, 8.6, 8.0, 8.4, 9.4, 10.2, 10.8, 9.6, 7.4, 5.2, 3.4, 2.0];
      const weights = baseWeights.map((w, i) => getWeightForRegion(w, i, selectedChartRegion));
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      return weights.map((w, i) => {
        const totalVal = totalWeight > 0 ? (w / totalWeight) * targetRevenueJt : 0;
        return {
          date: new Date(2026, 7, 27, i),
          label: `${String(i).padStart(2, '0')}:00`,
          fullLabel: `27 Agu 2026, ${String(i).padStart(2, '0')}:00`,
          pemasukanTotal: totalVal,
          pemasukanBersih: totalVal * 0.9,
        };
      });
    };

    const generateMingguan = () => {
      const baseWeights = [95, 108, 101, 122, 138, 119, 131, 150];
      const weights = baseWeights.map((w, i) => getWeightForRegion(w, i, selectedChartRegion));
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      return weights.map((w, i) => {
        const totalVal = totalWeight > 0 ? (w / totalWeight) * targetRevenueJt : 0;
        const mulai = new Date(2026, 5, 8 + i * 7);
        const akhir = new Date(2026, 5, 14 + i * 7);
        return {
          date: mulai,
          label: `M${i + 1}`,
          fullLabel: `${mulai.getDate()}–${akhir.getDate()} ${MONTHS_ID[akhir.getMonth()]} ${akhir.getFullYear()}`,
          pemasukanTotal: totalVal,
          pemasukanBersih: totalVal * 0.9,
        };
      });
    };

    const generateBulanan = () => {
      const baseWeights = [12, 13, 15, 14, 16, 18, 20, 15, 14, 13, 17, 19, 22, 24, 16, 15, 14, 18, 21, 23, 25, 17, 16, 15, 19, 22, 24, 26, 18, 17];
      const weights = baseWeights.map((w, i) => getWeightForRegion(w, i, selectedChartRegion));
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      return weights.map((w, i) => {
        const totalVal = totalWeight > 0 ? (w / totalWeight) * targetRevenueJt : 0;
        const date = new Date(2026, 5, i + 1);
        return {
          date,
          label: formatTanggalSingkat(date),
          fullLabel: formatTanggalPenuh(date),
          pemasukanTotal: totalVal,
          pemasukanBersih: totalVal * 0.9,
        };
      });
    };

    const generateTahunan = () => {
      const baseWeights = [320, 295, 350, 380, 410, 452, 470, 431, 462, 508, 480, 538];
      const weights = baseWeights.map((w, i) => getWeightForRegion(w, i, selectedChartRegion));
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      return weights.map((w, i) => {
        const totalVal = totalWeight > 0 ? (w / totalWeight) * targetRevenueJt : 0;
        return {
          date: new Date(2026, i, 1),
          label: MONTHS_ID[i],
          fullLabel: `${MONTHS_ID_FULL[i]} 2026`,
          pemasukanTotal: totalVal,
          pemasukanBersih: totalVal * 0.9,
        };
      });
    };

    const RANGE_GENERATORS = { Hari: generateHarian, Minggu: generateMingguan, Bulan: generateBulanan, Tahun: generateTahunan };
    return (RANGE_GENERATORS[activeRange] || generateBulanan)();
  }, [activeRange, targetRevenueJt, selectedChartRegion]);

  const chartData = useMemo(() => {
    const q = chartQuery.toLowerCase().trim();
    if (!q) return rawChartData;
    return rawChartData.filter(
      (d) =>
        d.label.toLowerCase().includes(q) ||
        d.fullLabel.toLowerCase().includes(q)
    );
  }, [rawChartData, chartQuery]);

  const RANGE_LABEL_STEP = { Hari: 4, Minggu: 1, Bulan: 4, Tahun: 1 };
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
      <div className="flex flex-col gap-3 pb-3 border-b border-neutral-100">
        <div className="relative w-full sm:max-w-md pl-14 lg:pl-0">
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

      <div className="pt-1">
        <h1 className="text-[18px] font-bold text-neutral-800">Halo {displayName}, selamat datang kembali! 👋</h1>
      </div>

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
                  onClick={() => {
                    setActiveRange(range);
                    setHoveredIndex(null);
                  }}
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
                  onChange={(e) => {
                    setSelectedChartRegion(e.target.value);
                    setHoveredIndex(null);
                  }}
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
                  onChange={(e) => {
                    setChartQuery(e.target.value);
                    setHoveredIndex(null);
                  }}
                  placeholder="Cari & filter pemasukan..."
                  className="w-full pl-9 pr-8 py-1.5 bg-neutral-50 border border-neutral-200 rounded-full text-[10px] text-neutral-600 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4B2172] transition"
                />
                {chartQuery && (
                  <button
                    onClick={() => {
                      setChartQuery('');
                      setHoveredIndex(null);
                    }}
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
                  onClick={() => {
                    setChartQuery('');
                    setHoveredIndex(null);
                  }}
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

              <div className="block sm:hidden divide-y divide-gray-100">
                {filteredRegions.length === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      title="Belum ada data wilayah"
                      description={`Tidak ada wilayah yang sesuai dengan kriteria pencarian dari backend.`}
                    />
                  </div>
                ) : (
                  filteredRegions.map((region, index) => {
                    const accent = rowAccents[index % rowAccents.length];
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
                                <span className="font-semibold text-neutral-800 text-[11px]">{region.name} ({region.code})</span>
                              </div>
                              <div className="text-[9px] text-neutral-400">{region.category} • Pos: {region.pickupPointsCount}</div>
                            </div>
                          </div>
                          <span className={`flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${isUp ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(region.change)}%
                          </span>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-[9px]">
                              <span className="text-neutral-400 font-medium">Aktivitas User</span>
                              <span className="font-semibold text-neutral-700">{region.sharePercentage}% ({region.activeOrders} user)</span>
                            </div>
                            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#4B2172] rounded-full" style={{ width: `${region.sharePercentage}%` }} />
                            </div>
                          </div>

                        <div className="flex items-center justify-between pt-1 border-t border-dashed border-neutral-100 text-[10px]">
                          <span className="text-neutral-400">Estimasi Pendapatan</span>
                          <span className="font-bold text-neutral-800">{region.revenue}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-medium">
                      <th className="py-3 px-5">Wilayah</th>
                      <th className="py-3 px-5">Aktivitas User</th>
                      <th className="py-3 px-5">Pendapatan</th>
                      <th className="py-3 px-5">Pos & Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRegions.length === 0 ? (
                      <tr>
                        <td colSpan={4}>
                          <EmptyState
                            title="Belum ada data wilayah"
                            description={`Tidak ada wilayah yang sesuai dengan kriteria pencarian dari backend.`}
                          />
                        </td>
                      </tr>
                    ) : (
                      filteredRegions.map((region, index) => {
                        const accent = rowAccents[index % rowAccents.length];
                        const share = Math.round((region.activeOrders / totalOrders) * 100);
                        const barWidth = Math.round((region.activeOrders / maxOrders) * 100);
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
                                    <span className="font-semibold text-neutral-800 truncate text-[9px]">{region.name} ({region.code})</span>
                                  </div>
                                  <div className="text-[8px] text-neutral-400">{region.category}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2.5 min-w-30">
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
                            <td className="py-3.5 px-5 text-neutral-600 font-semibold">
                              {region.pickupPointsCount} Pos Aktif
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
                <h2 className="text-[14px] font-semibold text-neutral-800">Aktivitas Escrow Terbaru</h2>
                <button className="text-[10px] font-semibold text-[#4B2172] hover:underline cursor-pointer">Lihat Semua</button>
              </div>

              <div className="space-y-3 flex-1">
                {filteredActivities.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400 text-[10px]">
                    Tidak ada riwayat aktivitas escrow dari backend.
                  </div>
                ) : (
                  filteredActivities.map((activity, idx) => {
                    const s = statusStyle[activity.status] || statusStyle.Completed;
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