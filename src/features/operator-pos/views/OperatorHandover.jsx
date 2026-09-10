import { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, AlertTriangle, Unlock, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import apiClient from '../../../services/apiClient';

export default function OperatorHandover() {
  const toast = useToast();
  const [recipientName, setRecipientName] = useState('');
  const [tripQr, setTripQr] = useState('');
  const [ticketQr, setTicketQr] = useState('');
  const [posId, setPosId] = useState('');
  const [assignedPosName, setAssignedPosName] = useState('Memuat Pos...');
  const [otpCode, setOtpCode] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [handoverHistory, setHandoverHistory] = useState([]);

  const [showForceModal, setShowForceModal] = useState(false);
  const [forceTicket, setForceTicket] = useState('');
  const [forceOtp, setForceOtp] = useState('');
  const [isForcing, setIsForcing] = useState(false);

  // Auto-detect Pos ID dan Nama Pos dari profil operator yang login
  useEffect(() => {
    const fetchOperatorPos = async () => {
      try {
        const userRes = await apiClient.get('/auth/me');
        const userId = userRes.data?.id;

        const pointsRes = await apiClient.get('/pickup-points');
        const allPoints = pointsRes.data?.data || pointsRes.data || [];
        
        const myPos = allPoints.find(p => String(p.operatorId) === String(userId)) || allPoints[0];

        if (myPos) {
          setPosId(String(myPos.id));
          setAssignedPosName(myPos.name || `Pos ID: ${myPos.id}`);
        } else {
          setPosId('1');
          setAssignedPosName('Pos Utama (ID: 1)');
        }
      } catch (err) {
        console.error('Gagal mendeteksi pos operator otomatis:', err);
        setPosId('1');
        setAssignedPosName('Pos Utama (ID: 1)');
      }
    };

    fetchOperatorPos();
  }, []);

  const handleHandoverSubmit = async (e) => {
    e.preventDefault();
    const cleanOtp = otpCode.trim();

    if (!recipientName.trim() || !tripQr.trim() || !ticketQr.trim() || !cleanOtp) {
      toast.warning('Mohon lengkapi Nama, QR Trip, QR Resi Paket, dan Kode OTP!', { title: 'Data Belum Lengkap' });
      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      toast.error('Kode OTP wajib berupa 6 digit angka numerik!', { title: 'Format OTP Salah' });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        qrCodeTrip: tripQr.trim().toUpperCase(),
        qrCodeTicket: ticketQr.trim().toUpperCase(),
        posId: String(posId),
        scanType: 'checkin_destination',
        otpClaim: cleanOtp
      };

      const res = await apiClient.post('/checkpoints/scan', payload);

      const newLog = {
        id: String(res.data?.checkpoint?.id || `HO-${Math.floor(900 + Math.random() * 90)}`),
        recipient: recipientName.trim(),
        ticket: ticketQr.trim().toUpperCase(),
        otp: cleanOtp,
        status: 'Escrow Released & Selesai',
        time: 'Baru saja'
      };

      setHandoverHistory([newLog, ...handoverHistory]);
      setRecipientName('');
      setTripQr('');
      setTicketQr('');
      setOtpCode('');
      toast.success(res.data?.message || 'Verifikasi Handover sukses! Dana escrow dicairkan ke Mitra.', { title: 'Handover Selesai' });
    } catch (error) {
      console.error('Gagal mengirim data handover:', error);
      toast.error(error.response?.data?.message || 'Gagal memproses verifikasi ke server.', { title: 'Error Server' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForceReleaseSubmit = async (e) => {
    e.preventDefault();
    if (!forceTicket.trim()) {
      toast.warning('Nomor Tiket wajib diisi untuk force release!', { title: 'Data Kurang' });
      return;
    }

    try {
      setIsForcing(true);
      const payload = {
        qrCodeTicket: forceTicket.trim().toUpperCase(),
        posId: String(posId),
        ...(forceOtp ? { otpClaim: forceOtp.trim() } : {})
      };

      const res = await apiClient.post('/checkpoints/manual-force-release', payload);
      toast.success(res.data?.message || 'Intervensi darurat berhasil! Escrow dicairkan secara manual.', { title: 'Force Release Berhasil' });
      
      setShowForceModal(false);
      setForceTicket('');
      setForceOtp('');
    } catch (error) {
      console.error('Gagal force release:', error);
      toast.error(error.response?.data?.message || 'Gagal melakukan intervensi darurat.', { title: 'Gagal' });
    } finally {
      setIsForcing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172] flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> KEAMANAN & VALIDASI AKHIR POS (CHECKPOINT)
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Handover Verification & OTP
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Validasi kode OTP 6-digit penerima untuk mencairkan dana escrow paket di pos tujuan melalui backend.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Indikator Pos Otomatis */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-purple-50 border border-purple-100 rounded-xl shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[#4B2172]" />
            <div>
              <p className="text-[8px] font-bold text-neutral-400 uppercase">Pos Penugasan</p>
              <p className="text-[10px] font-bold text-[#4B2172]">{assignedPosName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowForceModal(true)}
            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Bantuan Darurat</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
          <h2 className="text-[14px] font-bold text-neutral-800">Form Serah Terima Paket</h2>
          <form onSubmit={handleHandoverSubmit} className="space-y-3.5 text-[10px]">
            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">NAMA PENERIMA</label>
              <input
                type="text"
                required
                placeholder="cth: Siti Rahma"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-medium text-[10px]"
              />
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">QR CODE TRIP MITRA</label>
              <input 
                type="text" 
                required
                placeholder="cth: TRIP-A2D4CS13"
                value={tripQr}
                onChange={(e) => setTripQr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-mono font-medium text-[10px] uppercase"
              />
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">QR TIKET / RESI PAKET</label>
              <input 
                type="text" 
                required
                placeholder="cth: TKT-SDJF12H"
                value={ticketQr}
                onChange={(e) => setTicketQr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-mono font-medium text-[10px] uppercase"
              />
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">KODE OTP 6-DIGIT PENERIMA</label>
              <input 
                type="text" 
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="cth: 876543"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-mono tracking-widest text-center text-[12px] font-extrabold"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#4B2172] hover:bg-[#3a1a59] disabled:opacity-50 text-white text-[10px] font-bold rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5 mt-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Memproses...' : 'Verifikasi OTP & Selesaikan Serah Terima'}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
          <h2 className="text-[14px] font-bold text-neutral-800">Riwayat Serah Terima Sesi Ini</h2>
          
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">HANDOVER ID & WAKTU</th>
                  <th className="py-3 px-4">PENERIMA</th>
                  <th className="py-3 px-4">QR TIKET</th>
                  <th className="py-3 px-4">OTP DIGUNAKAN</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-[9px]">
                {handoverHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        icon={ShieldCheck}
                        title="Belum Ada Serah Terima"
                        description="Belum ada riwayat serah terima paket yang diproses pada sesi ini."
                      />
                    </td>
                  </tr>
                ) : (
                  handoverHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/60 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-neutral-800 font-mono text-[10px]">{item.id}</p>
                        <p className="text-[8px] text-neutral-400 font-semibold">{item.time}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-neutral-800">{item.recipient}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-800">{item.ticket}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#4B2172] tracking-wider">{item.otp}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge variant="emerald">{item.status}</StatusBadge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <BaseModal
        isOpen={showForceModal}
        onClose={() => setShowForceModal(false)}
        title="Intervensi Darurat (Force Release)"
        subtitle="Gunakan fitur ini hanya jika perangkat penerima bermasalah (HP mati/rusak)."
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleForceReleaseSubmit} className="space-y-3 text-[10px]">
          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-800 text-[9px]">
            <strong>Perhatian:</strong> Tindakan ini akan memaksa pencairan dana escrow berdasarkan verifikasi manual KTP di pos.
          </div>

          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">NOMOR TIKET / RESI PAKET</label>
            <input
              type="text"
              required
              placeholder="cth: TKT-SDJF12H"
              value={forceTicket}
              onChange={(e) => setForceTicket(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 font-mono text-[10px] uppercase"
            />
          </div>

          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">KODE OTP MANUAL (JIKA ADA)</label>
            <input
              type="text"
              placeholder="Opsional jika verifikasi manual KTP"
              value={forceOtp}
              onChange={(e) => setForceOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 font-mono text-[10px]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForceModal(false)}
              className="flex-1 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isForcing}
              className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>{isForcing ? 'Memproses...' : 'Eksekusi Force Release'}</span>
            </button>
          </div>
        </form>
      </BaseModal>
    </div>
  );
}