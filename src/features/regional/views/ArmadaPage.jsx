import { useState, useEffect } from 'react';
import { Truck, Search, ShieldAlert } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { useAuth } from '../../../context/AuthContext';
import { regionalService } from '../../../services/regionalService';

export default function FleetCourierPage() {
  const toast = useToast();
  const { user } = useAuth();
  
  const [mitraFleetList, setMitraFleetList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        if (isMounted) setIsLoading(true);
        const currentRegionId = user?.regionId ? String(user.regionId) : null;

        const userRes = await regionalService.getUsersByRole('mitra', currentRegionId).catch(() => []);
        const rawUsers = Array.isArray(userRes) ? userRes : (userRes?.data || []);

        const formatted = rawUsers
          .filter(u => {
            const isMitra = u.role && String(u.role).toLowerCase() === 'mitra';
            if (!isMitra) return false;
            if (!currentRegionId) return true;
            return u.regionId ? String(u.regionId) === currentRegionId : true;
          })
          .map(u => ({
            id: String(u.id),
            name: u.name,
            email: u.email,
            phone: u.phone || '-',
            statusVerification: u.statusVerification || 'pending'
          }));

        if (isMounted) {
          setMitraFleetList(formatted);
        }
      } catch (error) {
        console.error('Gagal memuat data:', error);
        toast.error('Gagal mengambil data dari server.', { title: 'Koneksi Gagal' });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user?.regionId, toast]);

  const filteredData = mitraFleetList.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172]">
              MANAJEMEN ARMADA & KENDARAAN (MITRA)
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">Status Kendaraan & Verifikasi Mitra</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">Kendaraan didaftarkan langsung oleh masing-masing akun Mitra melalui menu panel mereka (Endpoint backend /vehicles dikelola via akun pemilik).</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
        <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-[10px] text-amber-800 space-y-1">
          <p>Halaman ini menampilkan daftar Mitra di wilayah Anda yang berhak mendaftarkan kendaraan.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Cari nama mitra, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-9 pr-8 py-2 text-[10px] sm:text-[11px] font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#4B2172] transition"
          />
        </div>
        <div className="text-[10px] font-semibold text-neutral-400 px-2">
          Total Mitra Wilayah: <span className="font-bold text-neutral-800">{filteredData.length} Orang</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">ID & Nama Mitra Pemilik</th>
                <th className="py-3 px-5">Email Akun</th>
                <th className="py-3 px-5">Nomor Telepon</th>
                <th className="py-3 px-5">Status Verifikasi Akun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[9px]">
              {isLoading ? (
                <SkeletonTableRows rows={4} columns={4} />
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-neutral-800 text-[10px]">{item.name}</div>
                      <div className="text-[8px] font-bold text-[#4B2172] font-mono">ID: {item.id}</div>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-neutral-700">{item.email}</td>
                    <td className="py-3.5 px-5 font-mono text-neutral-800">{item.phone}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-[8px] font-bold ${
                        item.statusVerification === 'approved' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.statusVerification.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">
                    <EmptyState icon={Truck} title="Tidak Ada Mitra" description="Belum ada akun ber-role mitra di database wilayah ini." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}