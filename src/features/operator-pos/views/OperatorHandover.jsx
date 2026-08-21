import { useState, useEffect } from 'react';
import { ShieldCheck, Camera, CheckCircle2, UserCheck } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';

export default function OperatorHandover() {
  const toast = useToast();
  const [ticketQr, setTicketQr] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [ktpUploaded, setKtpUploaded] = useState(false);
  const [isLoadingHandover, setIsLoadingHandover] = useState(true);
  
  const [handoverHistory, setHandoverHistory] = useState([
    { id: 'HO-901', recipient: 'Siti Rahma', ticket: 'PKG-88910', otp: '482910', status: 'Berhasil Diserahkan', time: '11:15 WIB' },
    { id: 'HO-902', recipient: 'Ahmad Fauzi', ticket: 'PKG-88912', otp: '992104', status: 'Berhasil Diserahkan', time: '10:30 WIB' }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingHandover(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const handleHandoverSubmit = (e) => {
    e.preventDefault();
    if (!ticketQr || !otpCode) {
      toast.warning('Mohon masukkan Nomor Resi/QR Paket dan Kode OTP 6-Digit!', { title: 'Data Belum Lengkap' });
      return;
    }
    if (!ktpUploaded) {
      toast.warning('Verifikasi foto KTP penerima wajib dilakukan sebelum penyerahan barang!', { title: 'Verifikasi KTP Diperlukan' });
      return;
    }

    const newLog = {
      id: `HO-${Math.floor(100 + Math.random() * 900)}`,
      recipient: 'Penerima Terverifikasi',
      ticket: ticketQr,
      otp: otpCode,
      status: 'Berhasil Diserahkan',
      time: 'Baru saja'
    };

    setHandoverHistory([newLog, ...handoverHistory]);
    setTicketQr('');
    setOtpCode('');
    setKtpUploaded(false);
    toast.success('Verifikasi Handover sukses! OTP & KTP valid, paket berhasil diserahkan kepada penerima.', { title: 'Handover Selesai' });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-8">
      {/* Header Halaman */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#c91882] font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <UserCheck className="w-3.5 h-3.5" /> Keamanan & Validasi Akhir Pos
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Handover Verification & OTP</h1>
          <p className="text-neutral-500 text-xs mt-0.5">Validasi kode OTP 6-digit penerima dan unggah foto KTP fisik sebelum serah terima paket.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Input Handover */}
        <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
          <h2 className="text-base font-extrabold text-neutral-900 mb-4">Form Serah Terima Paket</h2>
          <form onSubmit={handleHandoverSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-600 mb-1">QR TIKET / RESI PAKET</label>
              <input 
                type="text" 
                required
                placeholder="cth: PKG-88910"
                value={ticketQr}
                onChange={(e) => setTicketQr(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#c91882] font-mono font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-600 mb-1">KODE OTP 6-DIGIT PENERIMA</label>
              <input 
                type="text" 
                maxLength={6}
                required
                placeholder="cth: 482910"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#c91882] font-mono tracking-widest text-center text-base font-extrabold"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-600 mb-1">VERIFIKASI FOTO KTP PENERIMA</label>
              <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-4 text-center hover:bg-neutral-50 transition cursor-pointer">
                <Camera className="w-6 h-6 text-[#c91882] mx-auto mb-1" />
                <p className="font-bold text-neutral-700">{ktpUploaded ? 'Foto KTP Terverifikasi (1 File)' : 'Ambil / Unggah Foto KTP'}</p>
                <p className="text-[10px] text-neutral-500">Pastikan wajah & NIK pada KTP terlihat jelas</p>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={() => setKtpUploaded(true)} 
                  id="upload-ktp"
                />
                <label htmlFor="upload-ktp" className="mt-2 inline-block px-3 py-1 bg-pink-50 text-[#c91882] font-extrabold rounded-lg text-[10px] cursor-pointer">
                  {ktpUploaded ? 'Ganti Foto KTP' : 'Unggah Foto KTP'}
                </label>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-[#c91882] hover:bg-[#b51474] text-white font-bold rounded-xl shadow-lg shadow-[#c91882]/25 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verifikasi OTP & Selesaikan Serah Terima</span>
            </button>
          </form>
        </div>

        {/* Tabel Riwayat Handover */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
          <h2 className="text-base font-extrabold text-neutral-900 mb-6">Riwayat Serah Terima Hari Ini</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-500 font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-3">HANDOVER ID & WAKTU</th>
                  <th className="py-4 px-3">QR TIKET</th>
                  <th className="py-4 px-3">OTP DIGUNAKAN</th>
                  <th className="py-4 px-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 text-neutral-700 font-medium">
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
                    <td className="py-4 px-3">
                      <p className="font-extrabold text-neutral-900">{item.id}</p>
                      <p className="text-[10px] text-neutral-500 font-semibold">{item.time}</p>
                    </td>
                    <td className="py-4 px-3 font-mono font-bold text-neutral-800">{item.ticket}</td>
                    <td className="py-4 px-3 font-mono font-extrabold text-[#c91882] tracking-wider">{item.otp}</td>
                    <td className="py-4 px-3">
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> {item.status}
                      </span>
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