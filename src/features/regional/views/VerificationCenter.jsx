import { useState, useEffect } from 'react';
import { ShieldCheck, Search, Clock, Eye, EyeOff, CreditCard, Truck } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import { useAuth } from '../../../context/AuthContext';
import apiClient from '../../../services/apiClient';
import { regionalService } from '../../../services/regionalService';

export default function VerificationCenterPage() {
  const toast = useToast();
  const { user } = useAuth();
  
  const [verificationList, setVerificationList] = useState([]);
  const [isLoadingVerification, setIsLoadingVerification] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('Foto KTP buram / tidak terbaca');

  const [unmaskedPhones, setUnmaskedPhones] = useState({});
  const [verificationAuditLogs, setVerificationAuditLogs] = useState([]);

  const rejectionReasons = [
    'Foto KTP buram / tidak terbaca',
    'Foto wajah Face ID tidak sesuai dengan foto KTP',
    'Masa berlaku SIM / STNK telah kedaluwarsa',
    'Dokumen SKCK tidak valid atau sudah lewat batas waktu',
    'Skor Liveness Scan Face ID di bawah ambang batas minimum'
  ];

  const getFullFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('blob:')) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const baseURL = apiClient.defaults.baseURL 
      ? apiClient.defaults.baseURL.replace('/api', '') 
      : 'http://localhost:3000';
    return `${baseURL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  useEffect(() => {
    let isMounted = true;

    const loadVerificationData = async () => {
      try {
        if (isMounted) setIsLoadingVerification(true);
        const currentRegionId = user?.regionId ? String(user.regionId) : null;
        
        const responseData = await regionalService.getVerifications(undefined, currentRegionId);

        const formatted = responseData.map(item => {
          const profile = item.user?.profile || {};
          const vehicle = item.user?.vehicles?.[0] || {};
          
          const rawFiles = item.files || [];
          
          let allFiles = rawFiles.map(f => ({ ...f, filePath: getFullFileUrl(f.filePath) }));
          
          if (profile.faceImageUrl && !allFiles.some(f => f.filePath === getFullFileUrl(profile.faceImageUrl))) {
            allFiles.unshift({
              id: 'face-id',
              fileType: 'image/jpeg',
              filePath: getFullFileUrl(profile.faceImageUrl),
              isFaceId: true
            });
          }

          return {
            id: String(item.id),
            userId: String(item.userId || item.user?.id),
            name: item.user?.name || 'Pengguna Tanpa Nama',
            phone: item.user?.phone || '-',
            role: item.user?.role ? item.user.role.toUpperCase() : 'MITRA',
            regionId: item.user?.regionId ? String(item.user.regionId) : null,
            submissionDate: item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : 'Baru saja',
            status: item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : 'Menunggu Review',
            rejectionReason: item.rejectionReason || '',
            type: item.type,
            files: allFiles,
            identity: {
              ktpNumber: profile.ktpNumber || '-',
              fullNameKtp: profile.fullNameKtp || item.user?.name || '-',
              addressKtp: profile.addressKtp || '-',
              faceImageUrl: getFullFileUrl(profile.faceImageUrl),
              bankName: profile.bankName || '-',
              bankAccountNumber: profile.bankAccountNumber || '-',
              bankAccountHolder: profile.bankAccountHolder || '-',
            },
            vehicle: {
              type: vehicle.type || '-',
              model: vehicle.model || '-',
              plateNumber: vehicle.plateNumber || '-',
            }
          };
        });

        if (isMounted) {
          setVerificationList(formatted);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Gagal mengambil data verifikasi:', error);
          toast.error('Gagal mengambil antrean verifikasi dari server.', { title: 'Koneksi Gagal' });
        }
      } finally {
        if (isMounted) {
          setIsLoadingVerification(false);
        }
      }
    };

    loadVerificationData();

    return () => {
      isMounted = false;
    };
  }, [user?.regionId, toast]);

  const handleApprove = async (id) => {
    const target = verificationList.find(item => item.id === id);
    if (isDecided(target)) {
      toast.warning('Pengajuan ini sudah diputuskan sebelumnya.', { title: 'Sudah Diputuskan' });
      return;
    }

    try {
      await regionalService.reviewVerification(id, 'approved');
      setVerificationList(prev => prev.map(item => item.id === id ? { ...item, status: 'Disetujui', rejectionReason: '' } : item));

      const logIndex = verificationAuditLogs.length + 1;
      const newLog = {
        id: `LOG-VER-${logIndex}`,
        verId: id,
        name: target.name,
        decision: 'APPROVED',
        admin: user?.name || 'Admin Regional',
        timestamp: new Date().toLocaleString('id-ID')
      };
      setVerificationAuditLogs(prevLogs => [newLog, ...prevLogs]);

      setIsDetailModalOpen(false);
      toast.success(`Verifikasi ID ${id} berhasil disetujui dan akun mitra diaktifkan.`, { title: 'Disetujui' });
    } catch (error) {
      console.error('Gagal menyetujui verifikasi:', error);
      toast.error(error.response?.data?.message || 'Gagal menyetujui dokumen di server.', { title: 'Error' });
    }
  };

  const maskPhone = (phone) => {
    if (!phone || phone.length < 8) return phone;
    return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
  };

  const toggleMaskPhone = (id) => {
    setUnmaskedPhones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenDetail = (item) => {
    setSelectedVerification(item);
    setIsDetailModalOpen(true);
  };

  const isDecided = (item) => !!item && item.status !== 'Menunggu Review';

  const handleOpenRejectModal = (item) => {
    if (isDecided(item)) {
      toast.warning('Pengajuan ini sudah diputuskan sebelumnya.', { title: 'Sudah Diputuskan' });
      return;
    }
    setSelectedVerification(item);
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!selectedVerification || isDecided(selectedVerification)) return;

    if (!selectedReason) {
      toast.warning('Alasan penolakan wajib dipilih.', { title: 'Peringatan' });
      return;
    }

    try {
      await apiClient.patch(`/verifications/${selectedVerification.id}/review`, {
        status: 'rejected',
        rejectionReason: selectedReason
      });

      setVerificationList(prev => prev.map(item => item.id === selectedVerification.id ? { ...item, status: 'Ditolak', rejectionReason: selectedReason } : item));

      setIsRejectModalOpen(false);
      setIsDetailModalOpen(false);
      toast.error(`Verifikasi ID ${selectedVerification.id} ditolak.`, { title: 'Ditolak' });
    } catch (error) {
      console.error('Gagal menolak verifikasi:', error);
      toast.error(error.response?.data?.message || 'Gagal menolak dokumen di server.', { title: 'Error' });
    }
  };

  const filteredData = verificationList.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">Tinjau antrean berkas identitas, rekening, dan kendaraan mitra wilayah Anda.</p>
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
                <th className="py-3 px-5">Tipe Dokumen</th>
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
                        <div className="text-[8px] font-bold text-[#4B2172] font-mono">ID: {item.id}</div>
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
                      <td className="py-3.5 px-5 font-bold uppercase text-[#4B2172]">{item.type}</td>
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
                    <EmptyState icon={ShieldCheck} title="Antrean Kosong" description="Tidak ada antrean verifikasi di wilayah ini." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BaseModal
        isOpen={Boolean(isDetailModalOpen && selectedVerification)}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Review Berkas: ${selectedVerification?.name}`}
        subtitle={`ID Verifikasi: ${selectedVerification?.id} • Tipe: ${selectedVerification?.type}`}
        maxWidth="max-w-2xl"
      >
        {selectedVerification && (
          <div className="space-y-4">
            {/* Informasi Identitas Pengguna */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
              <span className="text-[9px] font-bold text-neutral-500 uppercase">Informasi Identitas Pengguna</span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div><strong>NIK:</strong> {selectedVerification.identity.ktpNumber}</div>
                <div><strong>Nama KTP:</strong> {selectedVerification.identity.fullNameKtp}</div>
                <div className="col-span-2"><strong>Alamat KTP:</strong> {selectedVerification.identity.addressKtp}</div>
              </div>
            </div>

            {/* Informasi Rekening Bank (Hanya Ditampilkan Jika Role Mitra) */}
            {selectedVerification.role === 'mitra' && (
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                <span className="text-[9px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-[#4B2172]" /> Informasi Rekening Bank (Pencairan)
                </span>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div><strong>Bank:</strong> {selectedVerification.identity.bankName}</div>
                  <div><strong>No. Rekening:</strong> {selectedVerification.identity.bankAccountNumber}</div>
                  <div><strong>Pemilik:</strong> {selectedVerification.identity.bankAccountHolder}</div>
                </div>
              </div>
            )}

            {/* Informasi Kendaraan Terdaftar (Hanya Ditampilkan Jika Role Mitra) */}
            {selectedVerification.role === 'mitra' && (
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                <span className="text-[9px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                  <Truck className="w-3 h-3 text-[#4B2172]" /> Informasi Kendaraan Terdaftar
                </span>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div><strong>Jenis:</strong> {selectedVerification.vehicle.type}</div>
                  <div><strong>Model:</strong> {selectedVerification.vehicle.model}</div>
                  <div><strong>Plat Nomor:</strong> {selectedVerification.vehicle.plateNumber}</div>
                </div>
              </div>
            )}

            {selectedVerification.status === 'Ditolak' && selectedVerification.rejectionReason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[10px] text-rose-800 font-medium">
                <strong>Catatan Alasan Penolakan:</strong> {selectedVerification.rejectionReason}
              </div>
            )}

            <div className="space-y-2">
            <span className="text-[9px] font-bold text-neutral-500 uppercase">Berkas Lampiran & Face ID</span>
            <div className="grid grid-cols-3 gap-3">
              {selectedVerification.files.length > 0 ? (
                selectedVerification.files.map((file, idx) => {
                  const validFileUrl = file.filePath;
                  return (
                    <div key={idx} className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 space-y-1">
                      <span className="text-[8px] font-bold text-[#4B2172] uppercase">
                        {file.isFaceId ? 'Face ID Scan' : (file.fileType || `Dokumen ${idx + 1}`)}
                      </span>
                      <div className="h-32 bg-white rounded-lg overflow-hidden border border-neutral-100 flex items-center justify-center">
                        {validFileUrl ? (
                          <a href={validFileUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full block">
                            <img 
                              src={validFileUrl} 
                              alt="Lampiran" 
                              className="w-full h-full object-cover hover:scale-105 transition" 
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='1.5'><rect width='18' height='18' x='3' y='3' rx='2'/><circle cx='9' cy='9' r='2'/><path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/></svg>";
                              }} 
                            />
                          </a>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-400">File tidak valid</div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[10px] text-neutral-500 italic">Tidak ada berkas file terlampir.</p>
              )}
            </div>
          </div>

            {!isDecided(selectedVerification) && (
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button onClick={() => handleOpenRejectModal(selectedVerification)} className="px-4 py-2 text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-full cursor-pointer transition">
                  Tolak Berkas
                </button>
                <button onClick={() => handleApprove(selectedVerification.id)} className="px-4 py-2 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full cursor-pointer transition shadow-sm">
                  Setujui Berkas & Aktifkan Mitra
                </button>
              </div>
            )}
          </div>
        )}
      </BaseModal>

      <BaseModal
        isOpen={Boolean(isRejectModalOpen && selectedVerification)}
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