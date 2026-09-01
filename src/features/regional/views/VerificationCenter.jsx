import { useState } from 'react';
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading';
import { ShieldCheck, Search, Clock, Eye, EyeOff, History, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';

export default function VerificationCenterPage() {
  const toast = useToast();
  const [verificationList, setVerificationList] = useState([
    { 
      id: 'VER-001', 
      name: 'Ahmad Fauzi', 
      phone: '081234567890', 
      role: 'Driver / Mitra', 
      submissionDate: '19 Agu 2026, 08:30', 
      status: 'Menunggu Review',
      rejectionReason: '',
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
      rejectionReason: '',
      docs: {
        ktp: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        sim: null,
        skck: null,
        stnk: null,
        faceId: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
        livenessScore: '96.2%'
      }
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('Foto KTP buram / tidak terbaca');

  // Keamanan PII & Audit Log State
  const [unmaskedPhones, setUnmaskedPhones] = useState({});
  const [verificationAuditLogs, setVerificationAuditLogs] = useState([]);

  const rejectionReasons = [
    'Foto KTP buram / tidak terbaca',
    'Foto wajah Face ID tidak sesuai dengan foto KTP',
    'Masa berlaku SIM / STNK telah kedaluwarsa',
    'Dokumen SKCK tidak valid atau sudah lewat batas waktu',
    'Skor Liveness Scan Face ID di bawah ambang batas minimum'
  ];

  const maskPhone = (phone) => {
    if (!phone || phone.length < 8) return phone;
    return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
  };

  const toggleMaskPhone = (id) => {
    setUnmaskedPhones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenDetail = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const isDecided = (user) => !!user && user.status !== 'Menunggu Review';

  const handleApprove = (id) => {
    const target = verificationList.find(item => item.id === id);
    if (isDecided(target)) {
      toast.warning('Pengajuan ini sudah diputuskan sebelumnya.', { title: 'Sudah Diputuskan' });
      return;
    }

    setVerificationList(prev => prev.map(item => item.id === id ? { ...item, status: 'Disetujui', rejectionReason: '' } : item));

    // Recording Audit Log
    const newLog = {
      id: `LOG-VER-${Date.now().toString().slice(-4)}`,
      verId: id,
      name: target.name,
      decision: 'APPROVED',
      admin: 'Admin Regional Surakarta',
      timestamp: new Date().toLocaleString('id-ID')
    };
    setVerificationAuditLogs([newLog, ...verificationAuditLogs]);

    setIsDetailModalOpen(false);
    toast.success(`Verifikasi untuk ID ${id} berhasil disetujui.`, { title: 'Disetujui' });
  };

  const handleOpenRejectModal = (user) => {
    if (isDecided(user)) {
      toast.warning('Pengajuan ini sudah diputuskan sebelumnya.', { title: 'Sudah Diputuskan' });
      return;
    }
    setSelectedUser(user);
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!selectedUser || isDecided(selectedUser)) return;

    setVerificationList(prev => prev.map(item => item.id === selectedUser.id ? { ...item, status: 'Ditolak', rejectionReason: selectedReason } : item));

    // Recording Audit Log
    const newLog = {
      id: `LOG-VER-${Date.now().toString().slice(-4)}`,
      verId: selectedUser.id,
      name: selectedUser.name,
      decision: 'REJECTED',
      reason: selectedReason,
      admin: 'Admin Regional Surakarta',
      timestamp: new Date().toLocaleString('id-ID')
    };
    setVerificationAuditLogs([newLog, ...verificationAuditLogs]);

    setIsRejectModalOpen(false);
    setIsDetailModalOpen(false);
    toast.error(`Verifikasi ID ${selectedUser.id} ditolak: "${selectedReason}"`, { title: 'Ditolak' });
  };

  const filteredData = verificationList.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoadingVerification = useSimulatedLoading([searchQuery], 700);

  const getStatusVariant = (status) => {
    if (status === 'Menunggu Review') return 'amber';
    if (status === 'Disetujui') return 'emerald';
    return 'rose';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172]">
              PUSAT VERIFIKASI & KEAMANAN REGIONAL
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">Verification Center & Face ID</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">Tinjau antrean berkas identitas pengguna lokal (KTP, SIM, SKCK, STNK) dan Face ID dengan proteksi PII.</p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#4B2172]/10 rounded-full shrink-0">
          <Clock className="w-3.5 h-3.5 text-[#4B2172]" />
          <span className="text-[10px] font-bold text-[#4B2172]">
            {verificationList.filter(v => v.status === 'Menunggu Review').length} Antrean Pending
          </span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Cari nama, nomor HP, atau ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-9 pr-8 py-2 text-[10px] sm:text-[11px] font-medium text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4B2172] transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">ID & Nama Pengguna</th>
                <th className="py-3 px-5">Kontak (PII Protected)</th>
                <th className="py-3 px-5">Peran Akun</th>
                <th className="py-3 px-5">Face ID Score</th>
                <th className="py-3 px-5">Status Review</th>
                <th className="py-3 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[9px]">
              {isLoadingVerification ? (
                <SkeletonTableRows rows={4} columns={6} />
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => {
                  const isUnmasked = unmaskedPhones[item.id];
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-neutral-800 text-[10px]">{item.name}</div>
                        <div className="text-[8px] font-bold text-[#4B2172] font-mono">{item.id}</div>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-neutral-700">
                        <div className="flex items-center gap-1.5">
                          <span>{isUnmasked ? item.phone : maskPhone(item.phone)}</span>
                          <button
                            onClick={() => toggleMaskPhone(item.id)}
                            className="p-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition cursor-pointer"
                            title={isUnmasked ? "Sembunyikan Telepon" : "Buka Masking Telepon"}
                          >
                            {isUnmasked ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-neutral-700">{item.role}</td>
                      <td className="py-3.5 px-5 font-bold text-blue-600">{item.docs.livenessScore}</td>
                      <td className="py-3.5 px-5">
                        <StatusBadge variant={getStatusVariant(item.status)}>
                          {item.status}
                        </StatusBadge>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <button onClick={() => handleOpenDetail(item)} className="px-3 py-1 bg-[#4B2172]/10 hover:bg-[#4B2172]/20 text-[#4B2172] font-bold rounded-full transition cursor-pointer">
                          Review Berkas
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6">
                    <EmptyState icon={ShieldCheck} title="Antrean Kosong" description="Tidak ada berkas verifikasi." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {verificationAuditLogs.length > 0 && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 space-y-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#4B2172]" />
            <h3 className="text-[12px] font-bold text-neutral-800">Catatan Audit Log Verifikasi Sesi Ini</h3>
          </div>
          <div className="space-y-2">
            {verificationAuditLogs.map((log) => (
              <div key={log.id} className="p-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-[9px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-800 font-mono">{log.id}</span>
                  <span className={`px-2 py-0.5 font-bold rounded-full ${log.decision === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {log.decision}
                  </span>
                  <span className="text-neutral-600">ID: <strong>{log.verId}</strong> ({log.name}) {log.reason && `• Alasan: "${log.reason}"`}</span>
                </div>
                <span className="text-[8px] text-neutral-400">{log.timestamp} • {log.admin}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <BaseModal
        isOpen={Boolean(isDetailModalOpen && selectedUser)}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Review Berkas: ${selectedUser?.name}`}
        subtitle={`${selectedUser?.id} • ${selectedUser?.role}`}
        maxWidth="max-w-2xl"
      >
        {selectedUser && (
          <div className="space-y-4">
            {selectedUser.status === 'Ditolak' && selectedUser.rejectionReason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[10px] text-rose-800 font-medium">
                <strong>Catatan Alasan Penolakan:</strong> {selectedUser.rejectionReason}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <span className="text-[8px] font-bold text-neutral-400 uppercase">Face ID ({selectedUser.docs.livenessScore})</span>
                <div className="h-28 bg-white rounded-lg overflow-hidden mt-1">
                  <img src={selectedUser.docs.faceId} alt="Face ID" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <span className="text-[8px] font-bold text-neutral-400 uppercase">KTP</span>
                <div className="h-28 bg-white rounded-lg overflow-hidden mt-1">
                  <img src={selectedUser.docs.ktp} alt="KTP" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <span className="text-[8px] font-bold text-neutral-400 uppercase">SIM</span>
                <div className="h-28 bg-white rounded-lg overflow-hidden mt-1 flex items-center justify-center text-[9px] text-neutral-400">
                  {selectedUser.docs.sim ? <img src={selectedUser.docs.sim} alt="SIM" className="w-full h-full object-cover" /> : 'Tidak ada'}
                </div>
              </div>
            </div>

            {!isDecided(selectedUser) && (
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button onClick={() => handleOpenRejectModal(selectedUser)} className="px-4 py-2 text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-full cursor-pointer transition">
                  Tolak Berkas
                </button>
                <button onClick={() => handleApprove(selectedUser.id)} className="px-4 py-2 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full cursor-pointer transition shadow-sm">
                  Setujui Berkas
                </button>
              </div>
            )}
          </div>
        )}
      </BaseModal>

      <BaseModal
        isOpen={Boolean(isRejectModalOpen && selectedUser)}
        onClose={() => setIsRejectModalOpen(false)}
        title="Alasan Penolakan Berkas"
        subtitle="Pilih alasan spesifik untuk tercatat dalam audit log"
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleConfirmReject} className="space-y-3">
          <div className="space-y-1.5">
            {rejectionReasons.map((reason, idx) => (
              <label key={idx} className="flex items-center gap-2 text-[9px] text-neutral-700 cursor-pointer">
                <input type="radio" name="reason" value={reason} checked={selectedReason === reason} onChange={(e) => setSelectedReason(e.target.value)} />
                <span>{reason}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 pt-3">
            <button type="button" onClick={() => setIsRejectModalOpen(false)} className="px-4 py-2 text-[10px] font-bold text-neutral-500 hover:bg-neutral-100 rounded-full cursor-pointer">Batal</button>
            <button type="submit" className="px-4 py-2 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-full cursor-pointer shadow-sm">Konfirmasi Penolakan</button>
          </div>
        </form>
      </BaseModal>
    </div>
  );
}