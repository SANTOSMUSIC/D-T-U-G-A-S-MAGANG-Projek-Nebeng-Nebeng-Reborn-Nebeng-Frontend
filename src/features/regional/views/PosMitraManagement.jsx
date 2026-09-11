import { useState, useEffect } from 'react';
import { MapPin, Search, Plus, QrCode, Trash2, Pencil, AlertTriangle, Building2, UserCheck } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import BaseModal from '../../../components/ui/BaseModal';
import { regionalService } from '../../../services/regionalService';
import { useAuth } from '../../../context/AuthContext';
import apiClient from '../../../services/apiClient';
import { getRegionId } from '../../../utils/regionId';
import wilayahIndonesia from '../../../features/regional/wilayah-indonesia.json';

const toTitleCase = (str) =>
  String(str || '')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());

export default function PosMitraManagement() {
  const toast = useToast();
  const { user } = useAuth();
  
  const [activeRegionId, setActiveRegionId] = useState(null);
  const [posList, setPosList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [operatorList, setOperatorList] = useState([]); 
  const [isLoadingPos, setIsLoadingPos] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  
  const [currentPos, setCurrentPos] = useState(null);
  const [posToDelete, setPosToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '', address: '', latitude: '', longitude: '', cityId: '', operatorId: '', regionId: ''
  });

  const [cityFormData, setCityFormData] = useState({
    provinceId: '', provinceName: '', regencyId: '', regencyName: ''
  });
  const [provinceList, setProvinceList] = useState([]);
  const [regencyList, setRegencyList] = useState([]);
  const formatAndScopePos = (rawPos, regId) => {
    const list = Array.isArray(rawPos) ? rawPos : (rawPos?.data || []);
    return list
      .map(p => ({
        id: String(p.id),
        name: p.name,
        address: p.address,
        lat: String(p.latitude),
        long: String(p.longitude),
        cityId: p.cityId ? String(p.cityId) : '',
        cityName: p.city?.name || '-',
        regionId: getRegionId(p) || getRegionId(p.city),
        operatorId: p.operatorId ? String(p.operatorId) : '',
        operatorName: p.operator ? p.operator.name : 'Belum Ditugaskan',
        status: p.isActive !== false ? 'Aktif' : 'Nonaktif',
        qrCodePos: p.qrCodePos
      }))

      .filter(p => !regId || !p.regionId || p.regionId === String(regId));
  };

  // useEffect yang diperbarui: Tanpa guard ketat agar request tetap terkirim dan mudah dipantau
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        if (isMounted) setIsLoadingPos(true);
        const regId = user?.regionId ? String(user.regionId) : null;
        // Eksekusi pemanggilan data secara paralel dengan penanganan error mandiri
        const [posData, cityRes, userRes] = await Promise.all([
          regionalService.getPickupPoints(regId).catch(() => {
            return [];
          }),
          apiClient.get('/cities').catch(() => {
            return { data: [] };
          }),
          apiClient.get('/users', { params: { role: 'operator' } }).catch(() => {
            return { data: [] };
          })
        ]);

        const formattedPos = formatAndScopePos(posData, regId);

        const citiesData = Array.isArray(cityRes.data) ? cityRes.data : (cityRes.data?.data || []);

        const rawUsers = Array.isArray(userRes.data) 
          ? userRes.data 
          : (userRes.data?.data || userRes.data?.users || []);

        const validOperators = rawUsers.filter(op => {
          const opRegion = getRegionId(op);
          if (op.status !== 'active') return false;
          return !regId || !opRegion || opRegion === String(regId);
        });

        if (isMounted) {
          setPosList(formattedPos);
          setCityList(citiesData);
          setOperatorList(validOperators);
          setActiveRegionId(regId);
        }
      } catch (error) {
        if (isMounted) {
          console.error('[DEBUG POS] Gagal memuat data pos:', error);
          toast.error('Gagal mengambil data dari server.', { title: 'Koneksi Gagal' });
        }
      } finally {
        if (isMounted) {
          setIsLoadingPos(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };

  }, [user?.regionId]);
  useEffect(() => {
    if (!isCityModalOpen || provinceList.length > 0) return;
    setProvinceList(Array.isArray(wilayahIndonesia?.provinces) ? wilayahIndonesia.provinces : []);
  }, [isCityModalOpen, provinceList.length]);

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    const province = provinceList.find((p) => p.id === provinceId);

    setCityFormData({
      provinceId,
      provinceName: province ? toTitleCase(province.name) : '',
      regencyId: '',
      regencyName: ''
    });

    if (!provinceId) {
      setRegencyList([]);
      return;
    }

    const regencies = wilayahIndonesia?.regenciesByProvince?.[provinceId];
    setRegencyList(Array.isArray(regencies) ? regencies : []);
  };

  const handleRegencyChange = (e) => {
    const regencyId = e.target.value;
    const regency = regencyList.find((r) => r.id === regencyId);
    setCityFormData((prev) => ({
      ...prev,
      regencyId,
      regencyName: regency ? toTitleCase(regency.name) : ''
    }));
  };

  const resetCityModal = () => {
    setIsCityModalOpen(false);
    setCityFormData({ provinceId: '', provinceName: '', regencyId: '', regencyName: '' });
    setRegencyList([]);
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    const regId = activeRegionId || user?.regionId || '1';

    const defaultCityId = cityList.length > 0 ? String(cityList[0].id) : '';
    
    setFormData({ 
      name: '', 
      address: '', 
      latitude: '', 
      longitude: '', 
      cityId: defaultCityId, 
      operatorId: '',
      regionId: String(regId)
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pos) => {
    setIsEditing(true);
    setCurrentPos(pos);
    setFormData({ 
      name: pos.name, 
      address: pos.address, 
      latitude: pos.lat, 
      longitude: pos.long,
      cityId: pos.cityId ? String(pos.cityId) : (cityList.length > 0 ? String(cityList[0].id) : ''),
      operatorId: pos.operatorId || '',
      regionId: String(activeRegionId || user?.regionId || '1')
    });
    setIsModalOpen(true);
  };

  const handleSaveCity = async (e) => {
    e.preventDefault();
    if (!cityFormData.provinceId || !cityFormData.regencyId) {
      toast.warning('Pilih provinsi dan kota/kabupaten resmi terlebih dahulu!', { title: 'Form Belum Lengkap' });
      return;
    }

    const normalizedName = cityFormData.regencyName.trim().toLowerCase();
    const duplicate = cityList.find((c) => String(c.name).trim().toLowerCase() === normalizedName);

    if (duplicate) {
      toast.warning(`${cityFormData.regencyName} sudah terdaftar di sistem.`, { title: 'Kota Sudah Ada' });
      setFormData((prev) => ({ ...prev, cityId: String(duplicate.id) }));
      resetCityModal();
      return;
    }

    try {
      const response = await apiClient.post('/cities', {
        name: cityFormData.regencyName,
        province: cityFormData.provinceName
      });
      
      toast.success(`Kota ${cityFormData.regencyName} berhasil ditambahkan!`, { title: 'Berhasil' });
      resetCityModal();
      
      const cityRes = await apiClient.get('/cities');
      setCityList(Array.isArray(cityRes.data) ? cityRes.data : (cityRes.data?.data || []));
      
      const newCityId = response.data?.id || response.data?.data?.id;
      if (newCityId) {
        setFormData(prev => ({ ...prev, cityId: String(newCityId) }));
      }
    } catch (error) {
      console.error('Gagal menambah kota:', error);
      toast.error(error.response?.data?.message || 'Gagal menambahkan kota baru.', { title: 'Error' });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.cityId) {
      toast.warning('Nama Pos, Alamat, dan Kota wajib diisi!', { title: 'Form Belum Lengkap' });
      return;
    }

    try {
      const regId = activeRegionId || user?.regionId || '1';

      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        regionId: String(regId),
        cityId: String(formData.cityId),
        operatorId: formData.operatorId ? String(formData.operatorId) : null
      };

      if (isEditing && currentPos) {
        await regionalService.updatePickupPoint(currentPos.id, payload);
        toast.success(`Pos berhasil diperbarui.`, { title: 'Berhasil' });
      } else {
        await regionalService.createPickupPoint(payload);
        toast.success('Pos resmi baru berhasil ditambahkan.', { title: 'Berhasil' });
      }
      setIsModalOpen(false);
      
      const posData = await regionalService.getPickupPoints(regId);
      setPosList(formatAndScopePos(posData, regId));

    } catch (error) {
      console.error('Gagal menyimpan pos:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan data pos ke server.', { title: 'Error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!posToDelete) return;
    try {
      await regionalService.deletePickupPoint(posToDelete.id);
      toast.success(`Pos berhasil dinonaktifkan.`, { title: 'Berhasil' });
      setPosToDelete(null);
      
      const regId = activeRegionId || user?.regionId;
      const posData = await regionalService.getPickupPoints(regId);
      setPosList(formatAndScopePos(posData, regId));
    } catch (error) {
      toast.error('Gagal menghapus pos.', { title: error });
    }
  };

  const handleShowQr = (pos) => {
    setCurrentPos(pos);
    setIsQrModalOpen(true);
  };

  const filteredPos = posList.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.operatorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172]">
              MANAJEMEN POS CHECKPOINT & TERMINAL
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">Manajemen Pos Mitra & Terminal</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">Kelola lokasi pos, koordinat lat/long, penugasan operator wilayah, serta cetak QR Code.</p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#4B2172] hover:bg-[#3b195a] text-white rounded-full text-[10px] sm:text-[11px] font-bold transition cursor-pointer shadow-sm shrink-0"
        >
          <Plus size={14} />
          <span>Tambah Pos Baru</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Cari pos, alamat, operator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-9 pr-8 py-2 text-[10px] sm:text-[11px] font-medium text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4B2172] transition"
          />
        </div>
        <div className="text-[10px] font-semibold text-neutral-400 px-2">
          Total: <span className="font-bold text-neutral-800">{filteredPos.length} Pos</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">Nama & Kode Pos</th>
                <th className="py-3 px-5">Alamat Lokasi</th>
                <th className="py-3 px-5">Kota / Wilayah</th>
                <th className="py-3 px-5">Operator Pos</th>
                <th className="py-3 px-5 text-center">Aksi & QR Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[9px]">
              {isLoadingPos ? (
                <SkeletonTableRows rows={4} columns={5} />
              ) : filteredPos.length > 0 ? (
                filteredPos.map((pos) => (
                  <tr key={pos.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-neutral-800 text-[10px]">{pos.name}</div>
                      <div className="text-[8px] font-bold text-[#4B2172] font-mono">{pos.id}</div>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-neutral-600">{pos.address}</td>
                    <td className="py-3.5 px-5 font-mono font-bold text-neutral-700">{pos.cityName}</td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold ${pos.operatorName !== 'Belum Ditugaskan' ? 'bg-purple-50 text-[#4B2172] border border-purple-200' : 'bg-neutral-100 text-neutral-500'}`}>
                        <UserCheck size={11} /> {pos.operatorName}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleShowQr(pos)} className="p-1.5 bg-[#4B2172]/10 hover:bg-[#4B2172]/20 text-[#4B2172] rounded-lg transition cursor-pointer" title="Lihat QR Code">
                          <QrCode size={13} />
                        </button>
                        <button onClick={() => handleOpenEdit(pos)} className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition cursor-pointer" title="Edit Pos">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setPosToDelete(pos)} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer" title="Hapus Pos">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <EmptyState icon={MapPin} title="Pos Tidak Ditemukan" description="Tidak ada pos yang terdaftar di database untuk wilayah ini." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Pos */}
      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Ubah Data Pos' : 'Tambah Pos Checkpoint Baru'}
        subtitle="Sistem Manajemen Wilayah & Terminal"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Nama Pos / Terminal</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]" />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Alamat Lengkap</label>
            <textarea rows="2" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172] resize-none" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-bold text-neutral-500 uppercase">Pilih Kota / Kabupaten</label>
              <button 
                type="button" 
                onClick={() => setIsCityModalOpen(true)}
                className="text-[9px] font-bold text-[#4B2172] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Building2 size={11} /> + Tambah Kota Baru
              </button>
            </div>
            <select 
              value={formData.cityId} 
              onChange={(e) => setFormData({...formData, cityId: e.target.value})} 
              required
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172] cursor-pointer"
            >
              {cityList.length === 0 ? (
                <option value="">Belum ada data kota.</option>
              ) : (
                cityList.map((city) => (
                  <option key={city.id} value={city.id}>{city.name} ({city.province})</option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Tugaskan Operator Pos</label>
            <select 
              value={formData.operatorId} 
              onChange={(e) => setFormData({...formData, operatorId: e.target.value})} 
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172] cursor-pointer"
            >
              <option value="">-- Belum Ditugaskan --</option>
              {operatorList.map((op) => (
                <option key={op.id} value={op.id}>{op.name} ({op.email})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-500 uppercase">Latitude</label>
              <input type="number" step="any" required placeholder="Contoh: -7.5666" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-mono font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-500 uppercase">Longitude</label>
              <input type="number" step="any" required placeholder="Contoh: 110.8283" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-mono font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[10px] font-bold text-neutral-500 hover:bg-neutral-100 rounded-full cursor-pointer">Batal</button>
            <button type="submit" className="px-4 py-2 text-[10px] font-bold text-white bg-[#4B2172] rounded-full cursor-pointer shadow-sm">Simpan</button>
          </div>
        </form>
      </BaseModal>

      {/* Modal Tambah Kota */}
      <BaseModal
        isOpen={isCityModalOpen}
        onClose={resetCityModal}
        title="Tambah Kota Baru"
        subtitle="Master Data Wilayah"
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleSaveCity} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Provinsi</label>
            <select
              required
              value={cityFormData.provinceId}
              onChange={handleProvinceChange}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172] cursor-pointer"
            >
              <option value="">
                {provinceList.length === 0 ? 'Data provinsi tidak tersedia' : '-- Pilih Provinsi --'}
              </option>
              {provinceList.map((p) => (
                <option key={p.id} value={p.id}>{toTitleCase(p.name)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Kota / Kabupaten</label>
            <select
              required
              value={cityFormData.regencyId}
              onChange={handleRegencyChange}
              disabled={!cityFormData.provinceId}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {cityFormData.provinceId
                  ? '-- Pilih Kota/Kabupaten --'
                  : 'Pilih provinsi terlebih dahulu'}
              </option>
              {regencyList.map((r) => (
                <option key={r.id} value={r.id}>{toTitleCase(r.name)}</option>
              ))}
            </select>
            <p className="text-[8px] text-neutral-400 pt-0.5">
              Daftar resmi 514 kab/kota Indonesia (Kemendagri/BPS) — mencegah nama ganda atau tidak baku.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button type="button" onClick={resetCityModal} className="px-4 py-2 text-[10px] font-bold text-neutral-500 hover:bg-neutral-100 rounded-full cursor-pointer">Batal</button>
            <button type="submit" disabled={!cityFormData.regencyId} className="px-4 py-2 text-[10px] font-bold text-white bg-[#4B2172] rounded-full cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Simpan Kota</button>
          </div>
        </form>
      </BaseModal>

      {/* Modal QR Code */}
      <BaseModal
        isOpen={Boolean(isQrModalOpen && currentPos)}
        onClose={() => setIsQrModalOpen(false)}
        title={`QR Code ${currentPos?.id}`}
        subtitle={currentPos?.name}
        maxWidth="max-w-xs"
      >
        {currentPos && (
          <div className="text-center space-y-4">
            <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(currentPos.qrCodePos || currentPos.id)}`} 
                alt="QR Code"
                className="w-32 h-32 mx-auto object-contain"
              />
              <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full inline-block">
                {currentPos.qrCodePos || currentPos.id}
              </span>
              <div>
                <h4 className="text-[11px] font-bold text-neutral-800">{currentPos.name}</h4>
                <p className="text-[9px] text-neutral-500">{currentPos.address}</p>
              </div>
            </div>
            <button onClick={() => setIsQrModalOpen(false)} className="w-full py-2 bg-neutral-100 text-neutral-600 text-[10px] font-bold rounded-full cursor-pointer">Tutup</button>
          </div>
        )}
      </BaseModal>

      {/* Modal Konfirmasi Hapus */}
      <BaseModal
        isOpen={Boolean(posToDelete)}
        onClose={() => setPosToDelete(null)}
        title="Konfirmasi Hapus Pos"
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px] text-center">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={20} />
          </div>
          <p className="text-neutral-600">Apakah Anda yakin ingin menonaktifkan pos <strong>{posToDelete?.name}</strong>?</p>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setPosToDelete(null)} className="flex-1 py-2 bg-neutral-100 text-neutral-700 rounded-full font-bold cursor-pointer">Batal</button>
            <button onClick={handleConfirmDelete} className="flex-1 py-2 bg-rose-600 text-white rounded-full font-bold cursor-pointer shadow-sm">Ya, Nonaktifkan</button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}