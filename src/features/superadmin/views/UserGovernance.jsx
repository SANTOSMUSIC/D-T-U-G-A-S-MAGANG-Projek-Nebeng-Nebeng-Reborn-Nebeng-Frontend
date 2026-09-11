import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  UserX, 
  UserCheck, 
  Lock, 
  Unlock, 
  Search, 
  AlertTriangle, 
  ShieldCheck, 
  User,
  Mail,
  Phone,
  Filter,
  X,
  UserPlus,
  Eye,
  EyeOff,
  History,
  Car,
  MapPin,
  Settings2,
  KeyRound
} from 'lucide-react';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import { useAuth } from '../../../context/AuthContext';
import { getAllUsers, createUser, updateUserStatus } from '../../../services/userService';

// Konfigurasi terpusat untuk setiap peran (role) pengguna di sistem.
// Menyertakan 'mitra' agar konsisten dengan role riil yang dipakai di seluruh aplikasi
// (lihat App.jsx, KurirPage.jsx, ArmadaPage.jsx, VerificationCenter.jsx).
const ROLE_CONFIG = {
  customer: { label: 'Customer (Penumpang)', shortLabel: 'Customer', icon: User, variant: 'default' },
  mitra: { label: 'Mitra (Driver)', shortLabel: 'Mitra', icon: Car, variant: 'purple' },
  regional: { label: 'Admin Wilayah (Regional)', shortLabel: 'Regional', icon: MapPin, variant: 'blue' },
  operator: { label: 'Operator', shortLabel: 'Operator', icon: Settings2, variant: 'amber' },
  admin: { label: 'Superadmin (Admin)', shortLabel: 'Superadmin', icon: ShieldCheck, variant: 'rose' },
};

function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || { shortLabel: role || 'N/A', icon: User, variant: 'default' };
  const Icon = config.icon;
  return (
    <StatusBadge variant={config.variant} icon={Icon}>
      {config.shortLabel}
    </StatusBadge>
  );
}

export default function UserGovernance() {
  const { session: currentAdminSession, role: currentAdminRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // State Paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [reason, setReason] = useState('');

  const [unmaskedUsers, setUnmaskedUsers] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    role: 'customer', 
    phone: '', 
    password: '' 
  });

  const fetchUsersData = async (page = 1) => {
    try {
      setIsLoadingUsers(true);
      const res = await getAllUsers(page, 20);
      
      // Menyesuaikan struktur jika API mengembalikan objek pagination atau array langsung
      const listData = res?.data || res;
      setUsers(Array.isArray(listData) ? listData : []);
      if (res?.meta) {
        setPaginationMeta(res.meta);
      }
    } catch (err) {
      console.error('Gagal memuat data pengguna:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadUsersData() {
      try {
        setIsLoadingUsers(true);
        const res = await getAllUsers(currentPage, 20);
        if (isMounted) {
          const listData = res?.data || res;
          setUsers(Array.isArray(listData) ? listData : []);
          if (res?.meta) {
            setPaginationMeta(res.meta);
          }
        }
      } catch (err) {
        console.error('Gagal memuat data pengguna:', err);
      } finally {
        if (isMounted) {
          setIsLoadingUsers(false);
        }
      }
    }

    loadUsersData();

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const toggleMaskPII = (userId) => {
    setUnmaskedUsers(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const maskEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    return `${name[0]}***${name[name.length - 1]}@${domain}`;
  };

  const maskPhone = (phone) => {
    if (!phone || phone.length < 8) return phone || '-';
    return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (user.id && String(user.id).toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'Active' && user.status === 'active') ||
                          (statusFilter === 'Suspended' && user.status === 'suspended') ||
                          (statusFilter === 'Blocked' && user.status === 'blocked');
    return matchesSearch && matchesStatus;
  });

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) return;

    try {
      const payload = {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || `08${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        password: newUser.password,
        role: newUser.role,
        status: 'active'
      };

      await createUser(payload);
      setShowAddModal(false);
      setShowAddPassword(false);
      setNewUser({ name: '', email: '', role: 'customer', phone: '', password: '' });
      await fetchUsersData(currentPage);
    } catch (err) {
      console.error('Gagal membuat user:', err);
      alert(err.response?.data?.message || 'Terjadi kesalahan saat membuat pengguna.');
    }
  };

  const handleExecuteAction = async () => {
    if (!selectedUser || !reason.trim()) return;

    try {
      let newStatus = 'active';
      if (actionModal === 'Block') newStatus = 'blocked';
      if (actionModal === 'Suspend') newStatus = 'suspended';
      if (actionModal === 'Unblock') newStatus = 'active';

      await updateUserStatus(selectedUser.id, newStatus);

      const logEntry = {
        id: `LOG-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toLocaleString('id-ID'),
        admin: `${currentAdminSession?.name || currentAdminSession?.fullName || 'Superadmin'} (${currentAdminRole || 'admin'})`,
        targetId: selectedUser.id,
        targetName: selectedUser.name,
        action: `${actionModal.toUpperCase()} ACCOUNT`,
        reason: reason.trim()
      };
      setAuditLogs([logEntry, ...auditLogs]);

      setActionModal(null);
      setSelectedUser(null);
      setReason('');
      await fetchUsersData(currentPage);
    } catch (err) {
      console.error('Gagal memperbarui status user:', err);
      alert(err.response?.data?.message || 'Gagal mengubah status akun.');
    }
  };

  const getStatusVariant = (status) => {
    if (status === 'active') return 'emerald';
    if (status === 'suspended') return 'amber';
    return 'rose';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172]">
              SUPERADMIN GOVERNANCE & CONTROL
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">User Governance (Super-Override)</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Kelola akses akun secara sistemik dengan proteksi PII dan pencatatan audit log otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden md:flex px-3.5 py-2 bg-[#4B2172]/10 border border-[#4B2172]/20 rounded-full text-[10px] font-bold text-[#4B2172] items-center gap-2">
            <ShieldCheck size={14} />
            Level Akses: Super-Override (Enkripsi PII)
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#4B2172] hover:bg-[#3b195a] text-white rounded-full text-[10px] sm:text-[11px] font-bold transition cursor-pointer shadow-sm"
          >
            <UserPlus size={14} />
            <span>Tambah User</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Akun Aktif</p>
            <h3 className="text-[18px] font-bold text-neutral-800 mt-0.5">
              {users.filter(u => u.status === 'active').length} Pengguna
            </h3>
            <span className="text-[10px] font-semibold text-emerald-600">Beroperasi normal</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Akun Disuspend</p>
            <h3 className="text-[18px] font-bold text-neutral-800 mt-0.5">
              {users.filter(u => u.status === 'suspended').length} Pengguna
            </h3>
            <span className="text-[10px] font-semibold text-amber-600">Ditangguhkan sementara</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <UserX size={20} />
          </div>
          <div>
            <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Akun Diblokir</p>
            <h3 className="text-[18px] font-bold text-neutral-800 mt-0.5">
              {users.filter(u => u.status === 'blocked').length} Pengguna
            </h3>
            <span className="text-[10px] font-semibold text-rose-600">Akses dicabut sistemik</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Cari nama, email, atau ID pengguna..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-9 pr-8 py-2 text-[10px] sm:text-[11px] font-medium text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4B2172] transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[10px] font-semibold text-neutral-500 flex items-center gap-1">
            <Filter size={12} /> Status:
          </span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-50 border border-neutral-200 rounded-full px-3 py-1.5 text-[10px] font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#4B2172] cursor-pointer"
          >
            <option value="All">Semua Status</option>
            <option value="Active">Active (Aktif)</option>
            <option value="Suspended">Suspended (Ditangguhkan)</option>
            <option value="Blocked">Blocked (Diblokir)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="block sm:hidden divide-y divide-gray-100">
          {isLoadingUsers ? (
            <div className="p-4 space-y-2">
              <div className="h-16 bg-neutral-100 animate-pulse rounded-xl"></div>
              <div className="h-16 bg-neutral-100 animate-pulse rounded-xl"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const isUnmasked = unmaskedUsers[user.id];
              return (
                <div key={user.id} className="p-4 space-y-3 text-[10px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-neutral-800">{user.name}</h4>
                      <span className="text-[8px] font-bold text-[#4B2172] font-mono">ID: {String(user.id)}</span>
                    </div>
                    <StatusBadge variant={getStatusVariant(user.status)}>
                      {user.status}
                    </StatusBadge>
                  </div>
                  <RoleBadge role={user.role} />
                  <div className="flex items-center gap-2 text-neutral-600 font-mono">
                    <span>{isUnmasked ? user.email : maskEmail(user.email)}</span>
                    <button onClick={() => toggleMaskPII(user.id)} className="p-1 bg-neutral-100 rounded">
                      {isUnmasked ? <EyeOff size={11} /> : <Eye size={11} />}
                    </button>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                    {user.status !== 'blocked' && (
                      <button onClick={() => { setSelectedUser(user); setActionModal('Block'); }} className="px-2.5 py-1 bg-rose-50 text-rose-600 font-bold rounded-full text-[9px]">Blokir</button>
                    )}
                    {user.status !== 'suspended' && user.status !== 'blocked' && (
                      <button onClick={() => { setSelectedUser(user); setActionModal('Suspend'); }} className="px-2.5 py-1 bg-amber-50 text-amber-600 font-bold rounded-full text-[9px]">Suspend</button>
                    )}
                    {(user.status === 'blocked' || user.status === 'suspended') && (
                      <button onClick={() => { setSelectedUser(user); setActionModal('Unblock'); }} className="px-2.5 py-1 bg-emerald-50 text-emerald-600 font-bold rounded-full text-[9px]">Pulihkan</button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4"><EmptyState icon={User} title="Pengguna Tidak Ditemukan" description="Tidak ada data." /></div>
          )}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">ID & Nama Pengguna</th>
                <th className="py-3 px-5">Peran (Role)</th>
                <th className="py-3 px-5">Kontak PII (Protected)</th>
                <th className="py-3 px-5">Status Akun</th>
                <th className="py-3 px-5 text-right">Aksi Super-Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[9px]">
              {isLoadingUsers ? (
                <SkeletonTableRows rows={4} columns={5} />
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isUnmasked = unmaskedUsers[user.id];
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-neutral-800 text-[10px]">{user.name}</div>
                        <div className="text-[8px] font-bold text-[#4B2172] font-mono">ID: {String(user.id)}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium text-neutral-700 flex items-center gap-1.5">
                              <Mail size={11} className="text-neutral-400" /> 
                              {isUnmasked ? user.email : maskEmail(user.email)}
                            </div>
                            <div className="text-[8px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                              <Phone size={11} className="text-neutral-400" /> 
                              {isUnmasked ? user.phone : maskPhone(user.phone)}
                            </div>
                          </div>
                          <button
                            onClick={() => toggleMaskPII(user.id)}
                            title={isUnmasked ? "Sembunyikan PII" : "Tampilkan PII (Buka Masking)"}
                            className="p-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition cursor-pointer"
                          >
                            {isUnmasked ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge variant={getStatusVariant(user.status)}>
                          {user.status === 'active' ? 'Aktif' : user.status === 'suspended' ? 'Disuspend' : 'Diblokir'}
                        </StatusBadge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.status !== 'blocked' && (
                            <button
                              onClick={() => { setSelectedUser(user); setActionModal('Block'); }}
                              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[9px] font-bold rounded-full transition cursor-pointer flex items-center gap-1"
                            >
                              <Lock size={12} /> Blokir
                            </button>
                          )}
                          {user.status !== 'suspended' && user.status !== 'blocked' && (
                            <button
                              onClick={() => { setSelectedUser(user); setActionModal('Suspend'); }}
                              className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 text-[9px] font-bold rounded-full transition cursor-pointer flex items-center gap-1"
                            >
                              <ShieldAlert size={12} /> Suspend
                            </button>
                          )}
                          {(user.status === 'blocked' || user.status === 'suspended') && (
                            <button
                              onClick={() => { setSelectedUser(user); setActionModal('Unblock'); }}
                              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[9px] font-bold rounded-full transition cursor-pointer flex items-center gap-1"
                            >
                              <Unlock size={12} /> Pulihkan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5">
                    <EmptyState
                      icon={User}
                      title="Pengguna Tidak Ditemukan"
                      description="Tidak ada pengguna yang cocok dengan pencarian atau filter status yang dipilih."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bar Navigasi Paginasi */}
        {paginationMeta && paginationMeta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-neutral-50/50 border-t border-neutral-200 text-[10px]">
            <span className="text-neutral-500">
              Halaman <strong>{paginationMeta.currentPage}</strong> dari <strong>{paginationMeta.totalPages}</strong> (Total: {paginationMeta.totalData} Pengguna)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1 bg-white border border-neutral-200 rounded-lg font-bold disabled:opacity-40 cursor-pointer shadow-sm"
              >
                Sebelumnya
              </button>
              <button
                disabled={currentPage >= paginationMeta.totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-3 py-1 bg-white border border-neutral-200 rounded-lg font-bold disabled:opacity-40 cursor-pointer shadow-sm"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {auditLogs.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200 space-y-3">
          <div className="flex items-center gap-2">
            <History size={16} className="text-[#4B2172]" />
            <h3 className="text-[12px] font-bold text-neutral-800">Catatan Audit Log Override Sistem Sesi Ini</h3>
          </div>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl text-[9px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-800 font-mono">{log.id}</span>
                    <span className="text-[8px] font-bold px-2 py-0.5 bg-purple-100 text-[#4B2172] rounded-full">{log.action}</span>
                    <span className="text-neutral-500">Target: <strong>{log.targetName}</strong> ({log.targetId})</span>
                  </div>
                  <p className="text-neutral-500 mt-0.5">Alasan: <em>"{log.reason}"</em></p>
                </div>
                <div className="text-right text-[8px] text-neutral-400 shrink-0">
                  {log.timestamp} • Admin: {log.admin}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BaseModal
        isOpen={Boolean(showAddModal)}
        onClose={() => { setShowAddModal(false); setShowAddPassword(false); }}
        title="Tambah Pengguna Baru"
        subtitle="Formulir Pendaftaran Manual Admin"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddUser} className="space-y-4 text-[10px]">
          <div>
            <label className="font-bold text-neutral-600 block mb-1.5">Nama Lengkap</label>
            <div className="relative">
              <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                required
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172] focus:bg-white transition"
                placeholder="Masukkan nama pengguna..."
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-neutral-600 block mb-1.5">Email</label>
            <div className="relative">
              <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172] focus:bg-white transition"
                placeholder="nama@email.com"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-neutral-600 block mb-1.5">Password Akun</label>
            <div className="relative">
              <KeyRound size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type={showAddPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-9 py-2.5 font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172] focus:bg-white transition"
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowAddPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                aria-label={showAddPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showAddPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          <div>
            <label className="font-bold text-neutral-600 block mb-1.5">Nomor Telepon</label>
            <div className="relative">
              <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="tel"
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172] focus:bg-white transition"
                placeholder="08xxxxxxxxxx (opsional)"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-neutral-600 block mb-1.5">Peran Pengguna (Role)</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ROLE_CONFIG).map(([roleKey, config]) => {
                const Icon = config.icon;
                const isSelected = newUser.role === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => setNewUser({...newUser, role: roleKey})}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#4B2172]/10 border-[#4B2172] text-[#4B2172] ring-1 ring-[#4B2172]'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <Icon size={13} className="shrink-0" />
                    <span className="leading-tight">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 mt-1">
            <button
              type="button"
              onClick={() => { setShowAddModal(false); setShowAddPassword(false); }}
              className="px-4 py-2 font-bold text-neutral-500 hover:text-neutral-700 transition cursor-pointer"
            >
              Batal
            </button>
            <button type="submit" className="px-5 py-2 bg-[#4B2172] hover:bg-[#3b195a] text-white font-bold rounded-full transition cursor-pointer shadow-sm">
              Simpan User
            </button>
          </div>
        </form>
      </BaseModal>

      <BaseModal
        isOpen={Boolean(actionModal && selectedUser)}
        onClose={() => { setActionModal(null); setSelectedUser(null); setReason(''); }}
        title={`Konfirmasi ${actionModal} Akun`}
        subtitle="Otentikasi Tindakan Super-Override & Log Audit"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-neutral-800 text-[10px]">
          <p className="text-neutral-500">
            Anda akan melakukan tindakan <strong className="text-neutral-800">{actionModal}</strong> secara sistemik pada akun <strong className="text-neutral-800">{selectedUser?.name}</strong> (ID: {selectedUser ? String(selectedUser.id) : ''}).
          </p>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
              Alasan Override Sistem <span className="text-rose-600">*Wajib Diisi untuk Audit Log</span>
            </label>
            <textarea 
              rows="3"
              required
              placeholder="Sebutkan alasan administratif atau kendala keamanan..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-3 text-[10px] font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172] transition resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button 
              onClick={() => { setActionModal(null); setSelectedUser(null); setReason(''); }}
              className="px-4 py-2 rounded-full text-[10px] font-bold text-neutral-500 hover:bg-neutral-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button 
              onClick={handleExecuteAction}
              disabled={!reason.trim()}
              className={`px-4 py-2 rounded-full text-[10px] font-bold text-white transition cursor-pointer shadow-sm ${
                !reason.trim()
                  ? 'bg-neutral-300 cursor-not-allowed'
                  : actionModal === 'Block' ? 'bg-rose-600 hover:bg-rose-700' : actionModal === 'Suspend' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              Ya, Konfirmasi {actionModal}
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}