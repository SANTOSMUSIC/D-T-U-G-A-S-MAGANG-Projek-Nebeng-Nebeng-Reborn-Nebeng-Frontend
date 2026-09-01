import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Compass, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  PhoneCall,
  History,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { Skeleton } from '../../../components/ui/Skeleton';
import StatCard from '../../../components/ui/StatCard';
import BaseModal from '../../../components/ui/BaseModal';

export default function AdminRegionalDashboard() {
  const toast = useToast();
  const [isLoadingDisrupted, setIsLoadingDisrupted] = useState(true);

  const [disruptedTrips, setDisruptedTrips] = useState([
    { 
      id: 'TRIP-701', 
      origin: 'Solo (Pos Pusat)', 
      destination: 'Yogyakarta', 
      mitra: 'Budi Santoso', 
      phone: '081234567890',
      vehicle: 'Motor (AD 1234 XX)', 
      issue: 'Kendaraan Mogok / Mesin Rusak', 
      location: 'Km 15 Jalur Solo-Jogja', 
      time: '15 menit lalu',
      assistanceStatus: 'Penanganan Awal'
    },
    { 
      id: 'TRIP-804', 
      origin: 'Solo', 
      destination: 'Semarang', 
      mitra: 'Siti Aminah', 
      phone: '081398765432',
      vehicle: 'Mobil (H 5678 YY)', 
      issue: 'Ban Bocor / Kempes', 
      location: 'Bypass Bawen', 
      time: '40 menit lalu',
      assistanceStatus: 'Menunggu Bantuan'
    }
  ]);

  const [selectedResolveTrip, setSelectedResolveTrip] = useState(null);
  const [selectedAssistTrip, setSelectedAssistTrip] = useState(null);
  const [unmaskedPhone, setUnmaskedPhone] = useState(false);
  const [emergencyLogs, setEmergencyLogs] = useState([]);

  const [recentRegionalActivities] = useState([
    { id: 1, text: 'Pos Mitra Solo Grand Mall melaporkan 12 paket masuk.', time: '10 menit lalu', type: 'Pos' },
    { id: 2, text: 'Trip TRIP-901 (Solo → Jogja) berhasil berangkat dari pos.', time: '25 menit lalu', type: 'Trip' },
    { id: 3, text: 'Verifikasi berkas kurir atas nama Agus Setiawan disetujui.', time: '1 jam lalu', type: 'Verifikasi' },
    { id: 4, text: 'Transaksi lokal senilai Rp 145.000 tercatat di Pos Pasar Klewer.', time: '2 jam lalu', type: 'Transaksi' },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingDisrupted(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const maskPhone = (phone) => {
    if (!phone || phone.length < 8) return phone;
    return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
  };

  const handleConfirmResolveTrip = () => {
    if (!selectedResolveTrip) return;

    const newLog = {
      id: `LOG-EMG-${Date.now().toString().slice(-4)}`,
      tripId: selectedResolveTrip.id,
      mitra: selectedResolveTrip.mitra,
      action: 'RUTE RESOLVED',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      admin: 'Admin Regional Surakarta'
    };
    setEmergencyLogs([newLog, ...emergencyLogs]);

    setDisruptedTrips(disruptedTrips.filter(t => t.id !== selectedResolveTrip.id));
    toast.success(`Kendala Trip ${selectedResolveTrip.id} telah diselesaikan dan rute dinyatakan normal kembali.`, { title: 'Trip Dipulihkan' });
    setSelectedResolveTrip(null);
  };

  const handleDispatchAssistance = () => {
    if (!selectedAssistTrip) return;

    const newLog = {
      id: `LOG-EMG-${Date.now().toString().slice(-4)}`,
      tripId: selectedAssistTrip.id,
      mitra: selectedAssistTrip.mitra,
      action: 'DISPATCH ASSISTANCE',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      admin: 'Admin Regional Surakarta'
    };
    setEmergencyLogs([newLog, ...emergencyLogs]);

    setDisruptedTrips(disruptedTrips.map(t => {
      if (t.id === selectedAssistTrip.id) {
        return { ...t, assistanceStatus: 'Tim Darurat Menuju Lokasi' };
      }
      return t;
    }));
    toast.info(`Tim Pos terdekat telah dikirim ke lokasi ${selectedAssistTrip.location}.`, { title: 'Bantuan Dikirim' });
    setSelectedAssistTrip(null);
    setUnmaskedPhone(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172]">
              PORTAL ADMIN REGIONAL
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">Dashboard Wilayah Operasional</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Pemantauan pos mitra, arus trip, kendala rute, dan verifikasi pengguna wilayah.
          </p>
        </div>

        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-[#4B2172]/10 border border-[#4B2172]/20 rounded-full shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#4B2172] text-white flex items-center justify-center font-bold shrink-0">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[8px] font-bold text-[#4B2172] uppercase tracking-wider">WILAYAH AKTIF</p>
            <p className="text-[10px] font-bold text-neutral-800">Jawa Tengah - Surakarta</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="JUMLAH POS AKTIF" value="14 Pos" subtitle="+2 pos baru bulan ini" icon={MapPin} />
        <StatCard title="TRIP BERANGKAT / TIBA" value="42 Trip" subtitle="18 berangkat, 24 tiba hari ini" icon={Compass} />
        <StatCard title="TRIP DISRUPTED (KENDALA)" value={`${disruptedTrips.length} Trip`} subtitle={disruptedTrips.length > 0 ? 'Butuh Penanganan Rute' : 'Aman Lancar'} icon={AlertTriangle} />
        <StatCard title="ANTEAN VERIFIKASI" value="5 Berkas" subtitle="Menunggu review KTP & Face ID" icon={ShieldCheck} />
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-neutral-800">Pemantauan Trip Disrupted (Kendala Rute)</h2>
              <p className="text-[10px] text-neutral-400">Daftar perjalanan mitra yang mengalami hambatan darurat di lapangan.</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 rounded-full text-[9px] font-bold self-start sm:self-auto">
            {disruptedTrips.length} Aktif Membutuhkan Respon
          </span>
        </div>

        {isLoadingDisrupted ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : disruptedTrips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {disruptedTrips.map((trip) => (
              <div key={trip.id} className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">{trip.id}</span>
                    <span className="text-[8px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{trip.assistanceStatus}</span>
                  </div>
                  <div className="text-[11px] font-bold text-neutral-800 flex items-center gap-1.5">
                    <span>{trip.origin}</span>
                    <span className="text-rose-600">&rarr;</span>
                    <span>{trip.destination}</span>
                  </div>
                  <p className="text-[10px] text-neutral-600">Mitra: <strong className="text-neutral-800">{trip.mitra}</strong> ({trip.vehicle})</p>
                  <div className="p-2 bg-white rounded-lg border border-rose-100 text-[9px] space-y-0.5">
                    <p className="text-rose-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Kendala: {trip.issue}
                    </p>
                    <p className="text-neutral-400">📍 Posisi: {trip.location} ({trip.time})</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-rose-100">
                  <button 
                    onClick={() => { setSelectedAssistTrip(trip); setUnmaskedPhone(false); }}
                    className="flex-1 py-1.5 px-3 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-full text-[9px] font-bold transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3 text-[#4B2172]" /> Kirim Bantuan
                  </button>
                  <button 
                    onClick={() => setSelectedResolveTrip(trip)}
                    className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[9px] font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Selesaikan
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-neutral-50 rounded-xl border border-neutral-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
            <h3 className="text-[11px] font-bold text-neutral-800">Semua Perjalanan Berjalan Normal</h3>
            <p className="text-[9px] text-neutral-400 mt-0.5">Tidak ada laporan trip disrupted di wilayah ini.</p>
          </div>
        )}
      </div>

      {emergencyLogs.length > 0 && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 space-y-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#4B2172]" />
            <h3 className="text-[12px] font-bold text-neutral-800">Log Respon Darurat Regional Sesi Ini</h3>
          </div>
          <div className="space-y-2">
            {emergencyLogs.map((log) => (
              <div key={log.id} className="p-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-[9px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-800 font-mono">{log.id}</span>
                  <span className="px-2 py-0.5 bg-[#4B2172]/10 text-[#4B2172] font-bold rounded-full">{log.action}</span>
                  <span className="text-neutral-600">Trip: <strong>{log.tripId}</strong> ({log.mitra})</span>
                </div>
                <span className="text-[8px] text-neutral-400">{log.timestamp} • {log.admin}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200">
          <h2 className="text-[14px] font-bold text-neutral-800 mb-3">Aktivitas & Logistik Regional Terbaru</h2>
          <div className="space-y-3">
            {recentRegionalActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100 hover:bg-neutral-100/60 transition">
                <div className="w-7 h-7 rounded-lg bg-[#4B2172]/10 text-[#4B2172] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {act.type[0]}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-neutral-800">{act.text}</p>
                  <p className="text-[8px] text-neutral-400 mt-0.5">{act.time}</p>
                </div>
                <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-[#4B2172]/10 text-[#4B2172]">
                  {act.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#4B2172] to-[#2a1042] rounded-2xl p-5 text-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold mb-3">
              <ShieldCheck className="w-4 h-4 text-purple-200" />
            </div>
            <h2 className="text-[14px] font-bold tracking-tight">Kepatuhan & Keamanan</h2>
            <p className="text-purple-200 text-[10px] mt-1.5 leading-relaxed">
              Pastikan verifikasi Face ID dan identitas kurir diselesaikan tepat waktu untuk kelancaran operasional.
            </p>
          </div>
          <div className="pt-4 border-t border-white/10 mt-4">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-purple-200 font-medium">Tingkat Kepatuhan Pos</span>
              <span className="font-bold text-white">98.4%</span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-full w-[98.4%] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <BaseModal
        isOpen={Boolean(selectedResolveTrip)}
        onClose={() => setSelectedResolveTrip(null)}
        title="Konfirmasi Resolusi Trip"
        subtitle={`Trip ${selectedResolveTrip?.id}`}
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px] text-center">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-neutral-600">
            Apakah Anda yakin ingin menandai rute untuk <strong>{selectedResolveTrip?.mitra}</strong> ({selectedResolveTrip?.id}) telah kembali normal dan teratasi?
          </p>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setSelectedResolveTrip(null)} className="flex-1 py-2 bg-neutral-100 text-neutral-700 rounded-full font-bold cursor-pointer">Batal</button>
            <button onClick={handleConfirmResolveTrip} className="flex-1 py-2 bg-emerald-600 text-white rounded-full font-bold cursor-pointer shadow-sm">Ya, Selesaikan</button>
          </div>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={Boolean(selectedAssistTrip)}
        onClose={() => { setSelectedAssistTrip(null); setUnmaskedPhone(false); }}
        title="Koordinasi Bantuan Lapangan"
        subtitle={`Trip ${selectedAssistTrip?.id}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-3 text-[10px]">
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
            <p className="text-neutral-500">Mitra: <strong className="text-neutral-800">{selectedAssistTrip?.mitra}</strong> ({selectedAssistTrip?.vehicle})</p>
            <div className="flex items-center justify-between text-neutral-500">
              <span>Kontak Darurat: <strong className="text-neutral-800 font-mono">{unmaskedPhone ? selectedAssistTrip?.phone : maskPhone(selectedAssistTrip?.phone)}</strong></span>
              <button
                onClick={() => setUnmaskedPhone(!unmaskedPhone)}
                className="p-1 rounded bg-neutral-200 hover:bg-neutral-300 text-neutral-700 transition cursor-pointer"
                title={unmaskedPhone ? "Sembunyikan Telepon" : "Buka Masking Telepon"}
              >
                {unmaskedPhone ? <EyeOff size={11} /> : <Eye size={11} />}
              </button>
            </div>
            <p className="text-neutral-500">Kendala: <strong className="text-rose-600">{selectedAssistTrip?.issue}</strong></p>
            <p className="text-neutral-500">Posisi Kendala: <strong className="text-neutral-800">{selectedAssistTrip?.location}</strong></p>
          </div>
          <p className="text-neutral-600">Sistem akan menugaskan Tim Pos Lapangan terdekat untuk membawa kendaraan pengganti atau bantuan teknis.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setSelectedAssistTrip(null); setUnmaskedPhone(false); }} className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-full font-bold cursor-pointer">Batal</button>
            <button onClick={handleDispatchAssistance} className="px-4 py-2 bg-[#4B2172] text-white rounded-full font-bold cursor-pointer shadow-sm">Kirim Tim Bantuan</button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}