import { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Search, Clock, Eye, EyeOff, CreditCard, Truck, Camera, ZoomIn } from 'lucide-react';
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
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('Foto KTP buram / tidak terbaca');
  const [selectedVerification, setSelectedVerification] = useState(null);
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
          const allFiles = rawFiles.map(f => ({ ...f, filePath: getFullFileUrl(f.filePath) }));

          return {
            id: String(item.id),
            userId: String(item.userId || item.user?.id),
            name: item.user?.name || 'Pengguna Tanpa Nama',
            phone: item.user?.phone || '-',
            role: item.user?.role
              ? item.user.role.toUpperCase()
              : ((item.user?.vehicles?.length > 0) ? 'MITRA' : 'CUSTOMER'),
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

      toast.success(`Verifikasi ID ${id} berhasil disetujui dan akun diaktifkan.`, { title: 'Disetujui' });
    } catch (error) {
      console.error('Gagal menyetujui verifikasi:', error);
      toast.error(error.response?.data?.message || 'Gagal menyetujui dokumen di server.', { title: 'Error' });
    }
  };

  const groupedByUser = useMemo(() => {
    const map = new Map();
    verificationList.forEach((item) => {
      if (!map.has(item.userId)) {
        map.set(item.userId, {
          userId: item.userId,
          name: item.name,
          phone: item.phone,
          role: item.role,
          regionId: item.regionId,
          identity: item.identity,
          vehicle: item.vehicle,
          documents: [],
        });
      }
      map.get(item.userId).documents.push(item);
    });
    return Array.from(map.values());
  }, [verificationList]);

  const selectedUserGroup = useMemo(
    () => groupedByUser.find((g) => g.userId === selectedUserId) || null,
    [groupedByUser, selectedUserId],
  );

  // Status gabungan untuk badge di tabel: Menunggu kalau masih ada dokumen
  // pending (paling perlu perhatian admin), Disetujui kalau semua sudah
  // approved, selain itu Ditolak (ada yang ditolak, sisanya sudah diputuskan).
  const getGroupStatus = (group) => {
    const statuses = group.documents.map((d) => d.status);
    if (statuses.some((s) => s === 'Menunggu Review')) return 'Menunggu Review';
    if (statuses.every((s) => s === 'Disetujui')) return 'Disetujui';
    return 'Ditolak';
  };

  const getGroupPendingCount = (group) =>
    group.documents.filter((d) => d.status === 'Menunggu Review').length;

  const maskPhone = (phone) => {
    if (!phone || phone.length < 8) return phone;
    return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
  };

  const toggleMaskPhone = (id) => {
    setUnmaskedPhones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenDetail = (group) => {
    setSelectedUserId(group.userId);
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
      toast.error(`Verifikasi ID ${selectedVerification.id} ditolak.`, { title: 'Ditolak' });
    } catch (error) {
      console.error('Gagal menolak verifikasi:', error);
      toast.error(error.response?.data?.message || 'Gagal menolak dokumen di server.', { title: 'Error' });
    }
  };

  const filteredData = groupedByUser.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.userId.toLowerCase().includes(searchQuery.toLowerCase())
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
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">Tinjau antrean berkas identitas, rekening, dan kendaraan wilayah Anda.</p>
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
                <th className="py-3 px-5">Dokumen</th>
                <th className="py-3 px-5">Status Review</th>
                <th className="py-3 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[9px]">
              {isLoadingVerification ? (
                <SkeletonTableRows rows={4} columns={6} />
              ) : filteredData.length > 0 ? (
                filteredData.map((group) => {
                  const isUnmasked = unmaskedPhones[group.userId];
                  const groupStatus = getGroupStatus(group);
                  const pendingCount = getGroupPendingCount(group);
                  return (
                    <tr key={group.userId} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-neutral-800 text-[10px]">{group.name}</div>
                        <div className="text-[8px] font-bold text-[#4B2172] font-mono">ID: {group.userId}</div>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-neutral-700">
                        <div className="flex items-center gap-1.5">
                          <span>{isUnmasked ? group.phone : maskPhone(group.phone)}</span>
                          <button
                            onClick={() => toggleMaskPhone(group.userId)}
                            className="p-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition cursor-pointer"
                            title={isUnmasked ? "Sembunyikan Telepon" : "Buka Masking Telepon"}
                          >
                            {isUnmasked ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-neutral-700">{group.role}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-wrap gap-1">
                          {group.documents.map((doc) => (
                            <span
                              key={doc.id}
                              title={doc.status}
                              className={`px-2 py-0.5 rounded-full text-[8px] font-bold border ${
                                doc.status === 'Disetujui'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : doc.status === 'Ditolak'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {doc.type?.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge variant={getStatusVariant(groupStatus)}>
                          {groupStatus}
                        </StatusBadge>
                        {pendingCount > 0 && groupStatus === 'Menunggu Review' && (
                          <div className="text-[8px] text-neutral-400 mt-0.5">{pendingCount} dokumen menunggu</div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <button onClick={() => handleOpenDetail(group)} className="px-3 py-1 bg-[#4B2172]/10 hover:bg-[#4B2172]/20 text-[#4B2172] font-bold rounded-full transition cursor-pointer">
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
        isOpen={Boolean(isDetailModalOpen && selectedUserGroup)}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Review Berkas: ${selectedUserGroup?.name}`}
        subtitle={`ID Pengguna: ${selectedUserGroup?.userId} • ${selectedUserGroup?.documents.length || 0} Dokumen`}
        maxWidth="max-w-3xl"
      >
        {selectedUserGroup && (
          <div className="space-y-4 text-[11px] max-h-[65vh] overflow-y-auto overscroll-contain pr-1 -mr-1">
            {/* Strip ringkasan cepat: peran & status keseluruhan pengajuan */}
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-1 bg-[#4B2172]/10 text-[#4B2172] text-[9px] font-bold rounded-full uppercase tracking-wide">
                {selectedUserGroup.role}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-neutral-400 font-medium">Status Keseluruhan:</span>
                <StatusBadge variant={getStatusVariant(getGroupStatus(selectedUserGroup))}>
                  {getGroupStatus(selectedUserGroup)}
                </StatusBadge>
              </div>
            </div>

            {/* Grid Informasi Utama (sama untuk semua dokumen milik user ini) */}
            <div className={`grid grid-cols-1 ${selectedUserGroup.identity.faceImageUrl ? 'sm:grid-cols-[1.2fr_1.2fr_auto]' : 'sm:grid-cols-2'} gap-2.5 items-stretch`}>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                <span className="text-[9px] font-bold text-[#4B2172] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Identitas & KTP Pengguna
                </span>
                <div className="space-y-1 text-neutral-700">
                  <div><strong className="text-neutral-400">NIK:</strong> <span className="font-mono font-bold">{selectedUserGroup.identity.ktpNumber}</span></div>
                  <div><strong className="text-neutral-400">Nama KTP:</strong> <span className="font-bold">{selectedUserGroup.identity.fullNameKtp}</span></div>
                  <div><strong className="text-neutral-400">Alamat KTP:</strong> {selectedUserGroup.identity.addressKtp}</div>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                {selectedUserGroup.role === 'MITRA' ? (
                  <>
                    <span className="text-[9px] font-bold text-[#4B2172] uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" /> Kendaraan & Rekening Bank
                    </span>
                    <div className="space-y-1 text-neutral-700">
                      <div><strong className="text-neutral-400">Kendaraan:</strong> {selectedUserGroup.vehicle.type} - {selectedUserGroup.vehicle.model} ({selectedUserGroup.vehicle.plateNumber})</div>
                      <div><strong className="text-neutral-400">Bank:</strong> {selectedUserGroup.identity.bankName} ({selectedUserGroup.identity.bankAccountNumber})</div>
                      <div><strong className="text-neutral-400">Pemilik Rek:</strong> {selectedUserGroup.identity.bankAccountHolder}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-[9px] font-bold text-[#4B2172] uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" /> Status Akun Customer
                    </span>
                    <div className="space-y-1 text-neutral-700">
                      <div><strong className="text-neutral-400">Peran:</strong> Customer Terverifikasi</div>
                      <div><strong className="text-neutral-400">Kontak HP:</strong> <span className="font-mono">{selectedUserGroup.phone}</span></div>
                    </div>
                  </>
                )}
              </div>

              {selectedUserGroup.identity.faceImageUrl && (
                <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden flex flex-col gap-1.5 w-full sm:w-28">
                  <span className="text-[7px] font-bold text-[#4B2172] uppercase tracking-wider flex items-center gap-1">
                    <Camera className="w-3 h-3 shrink-0" /> Face ID
                  </span>
                  <div className="relative w-full aspect-square bg-white rounded-lg overflow-hidden border border-neutral-200 shadow-inner group">
                    <img
                      src={selectedUserGroup.identity.faceImageUrl}
                      alt="Face ID Liveness Scan"
                      className="absolute inset-0 w-full h-full object-cover cursor-zoom-in transition duration-300 group-hover:scale-105"
                      onClick={() => window.open(selectedUserGroup.identity.faceImageUrl, '_blank')}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <a
                      href={selectedUserGroup.identity.faceImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-1 right-1 bg-white/90 text-[#4B2172] p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition"
                      title="Buka ukuran penuh"
                    >
                      <ZoomIn size={9} />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Satu blok per dokumen, dengan status & aksinya masing-masing */}
            <div className="space-y-3">
              {selectedUserGroup.documents.map((doc) => (
                <div key={doc.id} className="border border-neutral-200 rounded-xl p-3 space-y-2.5 bg-white">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-neutral-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] font-bold text-neutral-800 uppercase tracking-wide">{doc.type}</span>
                      <span className="text-[8px] text-neutral-400 font-mono">#{doc.id}</span>
                    </div>
                    <StatusBadge variant={getStatusVariant(doc.status)}>{doc.status}</StatusBadge>
                  </div>

                  {doc.status === 'Ditolak' && doc.rejectionReason && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 font-medium text-[8px]">
                      <strong>Alasan Penolakan:</strong> {doc.rejectionReason}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2.5">
                    {doc.files.length > 0 ? (
                      doc.files.map((file, idx) => {
                        const validFileUrl = file.filePath;
                        return (
                          <div key={idx} className="w-24 shrink-0">
                            <div className="relative w-24 h-24 bg-white rounded-lg overflow-hidden border border-neutral-200 shadow-sm group">
                              {validFileUrl ? (
                                <img
                                  src={validFileUrl}
                                  alt="Lampiran Dokumen"
                                  className="w-full h-full object-cover cursor-zoom-in transition duration-300 group-hover:scale-105"
                                  onClick={() => window.open(validFileUrl, '_blank')}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.className = "w-full h-full object-contain p-3 opacity-60";
                                    e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='1.5'><rect width='18' height='18' x='3' y='3' rx='2'/><circle cx='9' cy='9' r='2'/><path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/></svg>";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-center px-1.5">
                                  <span className="text-[7px] text-neutral-400 italic leading-tight">File tidak tersedia</span>
                                </div>
                              )}
                              <span className="absolute top-1 left-1 bg-black/55 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                {idx + 1}
                              </span>
                              {validFileUrl && (
                                <a
                                  href={validFileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute top-1 right-1 bg-white/90 text-[#4B2172] p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition"
                                  title="Buka ukuran penuh"
                                >
                                  <Eye size={9} />
                                </a>
                              )}
                            </div>
                            <div className="mt-1 text-[7px] font-semibold text-neutral-400 text-center truncate">
                              Lampiran {idx + 1}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-[9px] text-neutral-500 italic text-center py-3 w-full">Tidak ada berkas file terlampir.</p>
                    )}
                  </div>

                  {!isDecided(doc) && (
                    <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-neutral-100">
                      <button
                        onClick={() => handleOpenRejectModal(doc)}
                        className="px-3 py-1.5 text-[8px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer transition shadow-xs"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => handleApprove(doc.id)}
                        className="px-3 py-1.5 text-[8px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition shadow-md"
                      >
                        Setujui
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </BaseModal>

      {/* Modal Penolakan Berkas */}
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