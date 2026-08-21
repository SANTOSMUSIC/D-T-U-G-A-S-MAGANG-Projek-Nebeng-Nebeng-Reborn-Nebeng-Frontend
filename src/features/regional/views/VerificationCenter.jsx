import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Eye, CheckCircle2, XCircle, AlertTriangle, FileText, UserCheck, X, Camera, Check, Clock } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';

export default function VerificationCenterPage() {
  const toast = useToast();
  const [isLoadingVerification, setIsLoadingVerification] = useState(true);
  const [verificationList, setVerificationList] = useState([
    { 
      id: 'VER-001', 
      name: 'Ahmad Fauzi', 
      phone: '081234567890', 
      role: 'Driver / Mitra', 
      submissionDate: '19 Agu 2026, 08:30', 
      status: 'Menunggu Review',
      docs: {
        ktp: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        sim: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        skck: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        stnk: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        faceId: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        livenessScore: '98.5%'
      }
    },
    { 
      id: 'VER-002', 
      name: 'Siti Aminah', 
      phone: '085698765432', 
      role: 'Penumpang / Rider', 
      submissionDate: '19 Agu 2026, 09:15', 
      status: 'Menunggu Review',
      docs: {
        ktp: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        sim: null,
        skck: null,
        stnk: null,
        faceId: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
        livenessScore: '96.2%'
      }
    },
    { 
      id: 'VER-003', 
      name: 'Budi Santoso', 
      phone: '081987654321', 
      role: 'Driver / Mitra', 
      submissionDate: '19 Agu 2026, 07:00', 
      status: 'Menunggu Review',
      docs: {
        ktp: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        sim: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        skck: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        stnk: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        faceId: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        livenessScore: '91.0%'
      }
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('Foto KTP buram / tidak terbaca');

  const rejectionReasons = [
    'Foto KTP buram / tidak terbaca',
    'Foto wajah Face ID tidak sesuai dengan foto KTP',
    'Masa berlaku SIM / STNK telah kedaluwarsa',
    'Dokumen SKCK tidak valid atau sudah lewat batas waktu',
    'Skor Liveness Scan Face ID di bawah ambang batas minimum'
  ];

  const handleOpenDetail = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleApprove = (id) => {
    setVerificationList(prev => prev.map(item => item.id === id ? { ...item, status: 'Disetujui' } : item));
    setIsDetailModalOpen(false);
    toast.success(`Verifikasi untuk ID ${id} berhasil disetujui.`, { title: 'Disetujui' });
  };

  const handleOpenRejectModal = (user) => {
    setSelectedUser(user);
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setVerificationList(prev => prev.map(item => item.id === selectedUser.id ? { ...item, status: `Ditolak: ${selectedReason}` } : item));
    setIsRejectModalOpen(false);
    setIsDetailModalOpen(false);
    toast.error(`Verifikasi ID ${selectedUser.id} ditolak dengan alasan: "${selectedReason}"`, { title: 'Ditolak' });
  };

  const filteredData = verificationList.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setIsLoadingVerification(true);
    const timer = setTimeout(() => setIsLoadingVerification(false), 700);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-8">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Pusat Verifikasi & Keamanan
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Verification Center & Face ID Review</h1>
          <p className="text-neutral-500 text-xs mt-0.5">Tinjau antrean berkas identitas pengguna lokal (KTP, SIM, SKCK, STNK) dan validasi Face ID Liveness Scan.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-purple-50 border border-purple-100 px-4 py-2.5 rounded-2xl flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-700" />
            <span className="text-xs font-bold text-purple-900">
              {verificationList.filter(v => v.status === 'Menunggu Review').length} Antrean Pending
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-extrabold text-neutral-900">Antrean Verifikasi Berkas Pengguna</h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Cari nama, nomor HP, atau ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-purple-600 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-fixed">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-500 font-extrabold uppercase tracking-wider">
                <th className="py-4 px-3 w-[20%]">ID & NAMA PENGGUNA</th>
                <th className="py-4 px-3 w-[16%]">PERAN AKUN</th>
                <th className="py-4 px-3 w-[20%]">WAKTU PENGAJUAN</th>
                <th className="py-4 px-3 w-[15%]">FACE ID SCORE</th>
                <th className="py-4 px-3 w-[15%]">STATUS</th>
                <th className="py-4 px-3 w-[14%] text-right">AKSI REVIEW</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 text-neutral-700 font-medium">
              {isLoadingVerification ? (
                <SkeletonTableRows rows={4} columns={6} />
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={ShieldCheck}
                      title="Tidak Ada Pengajuan Verifikasi"
                      description="Tidak ada pengajuan yang cocok dengan pencarian, atau semua sudah diproses."
                    />
                  </td>
                </tr>
              ) : filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/60 transition group">
                  <td className="py-4 px-3 truncate">
                    <p className="font-extrabold text-neutral-900 group-hover:text-purple-700 transition">{item.name}</p>
                    <p className="text-[10px] text-neutral-500 font-semibold">{item.id} • {item.phone}</p>
                  </td>
                  <td className="py-4 px-3 truncate font-bold text-neutral-700">{item.role}</td>
                  <td className="py-4 px-3 truncate font-semibold text-neutral-500">{item.submissionDate}</td>
                  <td className="py-4 px-3 truncate">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                      <Camera className="w-3 h-3" /> {item.docs.livenessScore}
                    </span>
                  </td>
                  <td className="py-4 px-3 truncate">
                    {item.status === 'Menunggu Review' && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                    {item.status === 'Disetujui' && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Disetujui
                      </span>
                    )}
                    {item.status.startsWith('Ditolak') && (
                      <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full truncate" title={item.status}>
                        <XCircle className="w-3 h-3 shrink-0" /> Ditolak
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-3 text-right">
                    <button 
                      onClick={() => handleOpenDetail(item)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold inline-flex items-center gap-1 transition shadow-sm cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Review Berkas
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail & Review Berkas */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-neutral-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
              <div>
                <h2 className="text-base font-extrabold text-neutral-900">Review Berkas Identitas: {selectedUser.name}</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Periksa keaslian KTP, SIM, SKCK, STNK, dan hasil Face ID Liveness Scan secara seksama.</p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid Berkas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Face ID Liveness */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-neutral-800">Face ID Liveness Scan</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">{selectedUser.docs.livenessScore}</span>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden h-40 flex items-center justify-center">
                  <img src={selectedUser.docs.faceId} alt="Face ID" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* KTP */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                <span className="text-xs font-extrabold text-neutral-800 block mb-2">Foto KTP Pengguna</span>
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden h-40 flex items-center justify-center">
                  {selectedUser.docs.ktp ? (
                    <img src={selectedUser.docs.ktp} alt="KTP" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[11px] text-neutral-500">Tidak ada data</span>
                  )}
                </div>
              </div>

              {/* SIM */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                <span className="text-xs font-extrabold text-neutral-800 block mb-2">Foto SIM (Opsional/Driver)</span>
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden h-40 flex items-center justify-center">
                  {selectedUser.docs.sim ? (
                    <img src={selectedUser.docs.sim} alt="SIM" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[11px] text-neutral-500 font-semibold italic">Tidak Diunggah</span>
                  )}
                </div>
              </div>

              {/* SKCK */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                <span className="text-xs font-extrabold text-neutral-800 block mb-2">Dokumen SKCK</span>
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden h-40 flex items-center justify-center">
                  {selectedUser.docs.skck ? (
                    <img src={selectedUser.docs.skck} alt="SKCK" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[11px] text-neutral-500 font-semibold italic">Tidak Diunggah</span>
                  )}
                </div>
              </div>

              {/* STNK */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 md:col-span-2">
                <span className="text-xs font-extrabold text-neutral-800 block mb-2">Dokumen STNK Kendaraan</span>
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden h-40 flex items-center justify-center">
                  {selectedUser.docs.stnk ? (
                    <img src={selectedUser.docs.stnk} alt="STNK" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[11px] text-neutral-500 font-semibold italic">Tidak Diunggah</span>
                  )}
                </div>
              </div>
            </div>

            {/* Aksi Approve / Reject */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
              <button 
                onClick={() => handleOpenRejectModal(selectedUser)}
                className="px-6 py-3 rounded-2xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition cursor-pointer flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Tolak Berkas
              </button>
              <button 
                onClick={() => handleApprove(selectedUser.id)}
                className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Setujui (Approve)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Alasan Penolakan Otomatis */}
      {isRejectModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
              <div>
                <h2 className="text-base font-extrabold text-neutral-900">Konfirmasi Penolakan Berkas</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Pilih alasan penolakan otomatis untuk dikirimkan ke pengguna.</p>
              </div>
              <button onClick={() => setIsRejectModalOpen(false)} className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-2">Pilih Alasan Penolakan Otomatis</label>
                <div className="space-y-2">
                  {rejectionReasons.map((reason, idx) => (
                    <label key={idx} className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition">
                      <input 
                        type="radio" 
                        name="rejectionReason" 
                        value={reason} 
                        checked={selectedReason === reason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="mt-0.5 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs font-semibold text-neutral-800 leading-snug">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 mt-6">
                <button type="button" onClick={() => setIsRejectModalOpen(false)} className="px-5 py-3 rounded-2xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition cursor-pointer">
                  Kirim Penolakan & Alasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}