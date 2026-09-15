import { useState, useEffect } from 'react';
import { Users, Search, Eye } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import BaseModal from '../../../components/ui/BaseModal';
import { useAuth } from '../../../context/AuthContext';
import { regionalService } from '../../../services/regionalService';

export default function KurirPage() {
  const toast = useToast();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [kurirList, setKurirList] = useState([]);
  const [isLoadingKurir, setIsLoadingKurir] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadKurirData = async () => {
      try {
        if (isMounted) setIsLoadingKurir(true);

        const currentRegionId = user?.regionId
          ? String(user.regionId)
          : null;

        const userRes = await regionalService
          .getUsersByRole('mitra', currentRegionId)
          .catch(() => []);

        const rawUsers = Array.isArray(userRes)
          ? userRes
          : (userRes?.data || []);

        const mitraOnly = rawUsers.filter(
          u => (u.role || '').toLowerCase() === 'mitra'
        );

        if (mitraOnly.length !== rawUsers.length) {
          console.warn(
            `[Kurir] Backend mengembalikan ${rawUsers.length} user untuk role=mitra, tapi hanya ${mitraOnly.length} yang benar-benar ber-role mitra. Kemungkinan backend endpoint /users mengabaikan filter role.`
          );
        }

        const formatted = mitraOnly.map(u => ({
          id: String(u.id),
          name: u.name,
          email: u.email,
          role: 'Mitra / Driver',
          activeShipments: u.tripsAsMitra?.length || 0,
          status: u.status === 'active' ? 'Aktif' : 'Nonaktif',
          phone: u.phone || '-'
        }));

        if (isMounted) {
          setKurirList(formatted);
        }
      } catch (error) {
        if (isMounted) {
          console.error(
            'Gagal mengambil data kurir/mitra:',
            error
          );

          toast.error(
            'Gagal mengambil data kurir dari server.',
            { title: 'Koneksi Gagal' }
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingKurir(false);
        }
      }
    };

    loadKurirData();

    return () => {
      isMounted = false;
    };
  }, [user?.regionId, toast]);

  const filteredKurir = kurirList.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">

      {/* HEADER */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#66CDAA] animate-pulse"></span>

            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4FBF99]">
              MANAJEMEN SDM & KURIR WILAYAH
            </span>
          </div>

          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Data Kurir & Driver (Role Mitra)
          </h1>

          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Menampilkan data akun riil dengan hak akses role 'mitra' di wilayah regional Anda.
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
          />

          <input
            type="text"
            placeholder="Cari nama kurir, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-9 pr-8 py-2 text-[10px] sm:text-[11px] font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#66CDAA] transition"
          />
        </div>

        <div className="text-[10px] font-semibold text-neutral-400 px-2">
          Total:{' '}
          <span className="font-bold text-neutral-800">
            {filteredKurir.length} Mitra
          </span>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">

            <thead>
              <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">
                  ID & Nama Mitra
                </th>

                <th className="py-3 px-5">
                  Email Kontak
                </th>

                <th className="py-3 px-5">
                  Trip Aktif
                </th>

                <th className="py-3 px-5">
                  Status Akun
                </th>

                <th className="py-3 px-5 text-center">
                  Detail
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-[9px]">
              {isLoadingKurir ? (
                <SkeletonTableRows
                  rows={4}
                  columns={5}
                />
              ) : filteredKurir.length > 0 ? (
                filteredKurir.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#66CDAA]/5 transition"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-neutral-800 text-[10px]">
                        {item.name}
                      </div>

                      <div className="text-[8px] font-bold text-[#4FBF99] font-mono">
                        {item.id} • {item.phone}
                      </div>
                    </td>

                    <td className="py-3.5 px-5 font-semibold text-neutral-700">
                      {item.email}
                    </td>

                    <td className="py-3.5 px-5 font-bold text-blue-600">
                      {item.activeShipments} Trip
                    </td>

                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2 py-0.5 text-[8px] font-bold rounded-full ${
                          item.status === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-center">
                      <button
                        onClick={() => setSelectedDetail(item)}
                        className="p-1.5 bg-[#66CDAA]/10 hover:bg-[#66CDAA]/20 text-[#4FBF99] rounded-lg transition cursor-pointer"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <EmptyState
                      icon={Users}
                      title="Mitra Tidak Ditemukan"
                      description="Tidak ada user dengan role 'mitra' di database untuk wilayah ini."
                    />
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <BaseModal
        isOpen={Boolean(selectedDetail)}
        onClose={() => setSelectedDetail(null)}
        title={selectedDetail?.name}
        subtitle={`ID: ${selectedDetail?.id}`}
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px]">

          <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
            <span className="text-[8px] font-bold text-neutral-400 uppercase">
              Email
            </span>

            <p className="font-bold text-neutral-800">
              {selectedDetail?.email}
            </p>
          </div>

          <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
            <span className="text-[8px] font-bold text-neutral-400 uppercase">
              Nomor Telepon
            </span>

            <p className="font-mono font-bold text-neutral-800">
              {selectedDetail?.phone}
            </p>
          </div>

          <button
            onClick={() => setSelectedDetail(null)}
            className="w-full py-2 bg-[#66CDAA] hover:bg-[#4FBF99] text-white text-[10px] font-bold rounded-full mt-2 cursor-pointer transition"
          >
            Tutup
          </button>

        </div>
      </BaseModal>

    </div>
  );
}