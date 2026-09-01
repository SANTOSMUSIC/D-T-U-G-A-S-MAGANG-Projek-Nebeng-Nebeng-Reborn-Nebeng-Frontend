import { useState, useEffect } from 'react';
import { ShieldCheck, Camera, UserCheck, X as XIcon } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';

export default function OperatorHandover() {
  const toast = useToast();
  const [ticketQr, setTicketQr] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [ktpPhoto, setKtpPhoto] = useState(null);
  const [ktpPreviewUrl, setKtpPreviewUrl] = useState(null);
  const [isLoadingHandover, setIsLoadingHandover] = useState(true);
  
  const [handoverHistory, setHandoverHistory] = useState([
    { id: 'HO-901', recipient: 'Siti Rahma', ticket: 'PKG-88910', otp: '482910', status: 'Berhasil Diserahkan', time: '11:15 WIB' },
    { id: 'HO-902', recipient: 'Ahmad Fauzi', ticket: 'PKG-88912', otp: '992104', status: 'Berhasil Diserahkan', time: '10:30 WIB' }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingHandover(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const handleKtpFileChange = (file) => {
    setKtpPhoto(file || null);
    setKtpPreviewUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const handleHandoverSubmit = (e) => {
    e.preventDefault();
    const cleanOtp = otpCode.trim();

    if (!ticketQr.trim() || !cleanOtp) {
      toast.warning('Mohon masukkan Nomor Resi/QR Paket dan Kode OTP!', { title: 'Data Belum Lengkap' });
      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      toast.error('Kode OTP wajib berupa 6 digit angka numerik!', { title: 'Format OTP Salah' });
      return;
    }

    if (!ktpPhoto) {
      toast.warning('Verifikasi foto KTP penerima wajib dilakukan sebelum penyerahan barang!', { title: 'Verifikasi KTP Diperlukan' });
      return;
    }

    const newLog = {
      id: `HO-${Math.floor(100 + Math.random() * 900)}`,
      recipient: 'Penerima Terverifikasi',
      ticket: ticketQr.trim().toUpperCase(),
      otp: cleanOtp,
      status: 'Berhasil Diserahkan',
      time: 'Baru saja'
    };

    setHandoverHistory([newLog, ...handoverHistory]);
    setTicketQr('');
    setOtpCode('');
    handleKtpFileChange(null);
    toast.success('Verifikasi Handover sukses! OTP & KTP valid, paket berhasil diserahkan kepada penerima.', { title: 'Handover Selesai' });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172] flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> KEAMANAN & VALIDASI AKHIR POS
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Handover Verification & OTP
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Validasi kode OTP 6-digit penerima dan unggah foto KTP fisik sebelum serah terima paket.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
          <h2 className="text-[14px] font-bold text-neutral-800">Form Serah Terima Paket</h2>
          <form onSubmit={handleHandoverSubmit} className="space-y-3.5 text-[10px]">
            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">QR TIKET / RESI PAKET</label>
              <input 
                type="text" 
                required
                placeholder="cth: PKG-88910"
                value={ticketQr}
                onChange={(e) => setTicketQr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-mono font-medium text-[10px]"
              />
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">KODE OTP 6-DIGIT PENERIMA</label>
              <input 
                type="text" 
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="cth: 482910"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-mono tracking-widest text-center text-[12px] font-extrabold"
              />
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">VERIFIKASI FOTO KTP PENERIMA</label>
              {ktpPreviewUrl ? (
                <div className="flex items-center gap-2.5 p-2 rounded-xl border border-neutral-200 bg-neutral-50">
                  <img src={ktpPreviewUrl} alt="Pratinjau KTP" className="w-12 h-12 object-cover rounded-lg border border-neutral-200 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-emerald-600">KTP Terverifikasi</p>
                    <p className="text-[8px] text-neutral-400 truncate">{ktpPhoto?.name}</p>
                  </div>
                  <button type="button" onClick={() => handleKtpFileChange(null)} className="w-6 h-6 rounded-full bg-neutral-800 text-white flex items-center justify-center shrink-0 cursor-pointer">
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-neutral-200 rounded-xl p-3.5 text-center hover:bg-neutral-50 transition cursor-pointer flex flex-col items-center justify-center">
                  <Camera className="w-5 h-5 text-[#4B2172] mb-1" />
                  <p className="font-bold text-neutral-700 text-[10px]">Ambil / Unggah Foto KTP</p>
                  <p className="text-[8px] text-neutral-400">Pastikan wajah & NIK terlihat jelas</p>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleKtpFileChange(e.target.files[0])} />
                </label>
              )}
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-[#4B2172] hover:bg-[#3a1a59] text-white text-[10px] font-bold rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5 mt-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verifikasi OTP & Selesaikan Serah Terima</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
          <h2 className="text-[14px] font-bold text-neutral-800">Riwayat Serah Terima Hari Ini</h2>
          
          <div className="block sm:hidden divide-y divide-neutral-100">
            {isLoadingHandover ? (
              <div className="p-4 space-y-3">
                <SkeletonTableRows rows={3} columns={1} />
              </div>
            ) : handoverHistory.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title="Belum Ada Serah Terima"
                description="Belum ada riwayat serah terima paket hari ini."
              />
            ) : handoverHistory.map((item) => (
              <div key={item.id} className="py-3 space-y-2 text-[10px]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-neutral-800 font-mono">{item.id}</span>
                    <span className="text-[8px] text-neutral-400 block">{item.time}</span>
                  </div>
                  <StatusBadge variant="emerald">{item.status}</StatusBadge>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Tiket: <strong className="font-mono text-neutral-800">{item.ticket}</strong></span>
                  <span>OTP: <strong className="font-mono text-[#4B2172]">{item.otp}</strong></span>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">HANDOVER ID & WAKTU</th>
                  <th className="py-3 px-4">QR TIKET</th>
                  <th className="py-3 px-4">OTP DIGUNAKAN</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-[9px]">
                {isLoadingHandover ? (
                  <SkeletonTableRows rows={3} columns={4} />
                ) : handoverHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState
                        icon={ShieldCheck}
                        title="Belum Ada Serah Terima"
                        description="Belum ada riwayat serah terima paket hari ini."
                      />
                    </td>
                  </tr>
                ) : handoverHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/60 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-neutral-800 font-mono text-[10px]">{item.id}</p>
                      <p className="text-[8px] text-neutral-400 font-semibold">{item.time}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-800">{item.ticket}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#4B2172] tracking-wider">{item.otp}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge variant="emerald">{item.status}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}