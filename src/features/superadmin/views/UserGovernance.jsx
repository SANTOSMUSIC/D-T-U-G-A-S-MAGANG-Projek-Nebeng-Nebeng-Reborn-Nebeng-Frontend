import { useState } from 'react';
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading';
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
  History
} from 'lucide-react';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';

export default function UserGovernance() {
  const [users, setUsers] = useState([
    { id: "USR-001", name: "Budi Santoso", email: "budi@nebeng.com", role: "Driver Motor", phone: "081234567890", status: "Active", riskLevel: "Low" },
    { id: "USR-002", name: "Siti Rahma", email: "siti.rahma@gmail.com", role: "Passenger", phone: "081398765432", status: "Suspended", riskLevel: "Medium" },
    { id: "USR-003", name: "Joko Susilo", email: "joko.susilo@nebeng.com", role: "Driver Mobil", phone: "081122334455", status: "Blocked", riskLevel: "High" },
    { id: "USR-004", name: "Dewi Lestari", email: "dewi.l@nebeng.com", role: "Admin Wilayah", phone: "081555667788", status: "Active", riskLevel: "Low" },
    { id: "USR-005", name: "Ahmad Fauzi", email: "fauzi.ahmad@gmail.com", role: "Passenger", phone: "081911223344", status: "Active", riskLevel: "Low" }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [reason, setReason] = useState('');

  const [unmaskedUsers, setUnmaskedUsers] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Passenger', phone: '' });

  const toggleMaskPII = (userId) => {
    setUnmaskedUsers(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const maskEmail = (email) => {
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    return `${name[0]}***${name[name.length - 1]}@${domain}`;
  };

  const maskPhone = (phone) => {
    if (phone.length < 8) return phone;
    return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isLoadingUsers = useSimulatedLoading([searchTerm, statusFilter], 700);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const generatedId = `USR-${Date.now().toString().slice(-4)}`;
    const userToAdd = {
      id: generatedId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone || '081200000000',
      status: 'Active',
      riskLevel: 'Low'
    };

    setUsers([userToAdd, ...users]);
    setShowAddModal(false);
    setNewUser({ name: '', email: '', role: 'Passenger', phone: '' });
  };

  const handleExecuteAction = () => {
    if (!selectedUser || !reason.trim()) return;

    let newStatus = 'Active';
    if (actionModal === 'Block') newStatus = 'Blocked';
    if (actionModal === 'Suspend') newStatus = 'Suspended';
    if (actionModal === 'Unblock') newStatus = 'Active';

    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: newStatus } : u));

    const logEntry = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleString('id-ID'),
      admin: 'Gibyan (Superadmin)',
      targetId: selectedUser.id,
      targetName: selectedUser.name,
      action: `${actionModal.toUpperCase()} ACCOUNT`,
      reason: reason.trim()
    };
    setAuditLogs([logEntry, ...auditLogs]);

    setActionModal(null);
    setSelectedUser(null);
    setReason('');
  };

  const getStatusVariant = (status) => {
    if (status === 'Active') return 'emerald';
    if (status === 'Suspended') return 'amber';
    return 'rose';
  };

  const getRiskBadge = (risk) => {
    if (risk === 'High') return 'bg-rose-50 text-rose-600 border-rose-200';
    if (risk === 'Medium') return 'bg-amber-50 text-amber-600 border-amber-200';
    return 'bg-emerald-50 text-emerald-600 border-emerald-200';
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
              {users.filter(u => u.status === 'Active').length} Pengguna
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
              {users.filter(u => u.status === 'Suspended').length} Pengguna
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
              {users.filter(u => u.status === 'Blocked').length} Pengguna
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
        {/* Tampilan Kartu Mobile */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {isLoadingUsers ? (
            <div className="p-4"><SkeletonTableRows rows={3} columns={1} /></div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const isUnmasked = unmaskedUsers[user.id];
              return (
                <div key={user.id} className="p-4 space-y-3 text-[10px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-neutral-800">{user.name}</h4>
                      <span className="text-[8px] font-bold text-[#4B2172] font-mono">{user.id}</span>
                    </div>
                    <StatusBadge variant={getStatusVariant(user.status)}>
                      {user.status}
                    </StatusBadge>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600 font-mono">
                    <span>{isUnmasked ? user.email : maskEmail(user.email)}</span>
                    <button onClick={() => toggleMaskPII(user.id)} className="p-1 bg-neutral-100 rounded">
                      {isUnmasked ? <EyeOff size={11} /> : <Eye size={11} />}
                    </button>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                    {user.status !== 'Blocked' && (
                      <button onClick={() => { setSelectedUser(user); setActionModal('Block'); }} className="px-2.5 py-1 bg-rose-50 text-rose-600 font-bold rounded-full text-[9px]">Blokir</button>
                    )}
                    {user.status !== 'Suspended' && user.status !== 'Blocked' && (
                      <button onClick={() => { setSelectedUser(user); setActionModal('Suspend'); }} className="px-2.5 py-1 bg-amber-50 text-amber-600 font-bold rounded-full text-[9px]">Suspend</button>
                    )}
                    {(user.status === 'Blocked' || user.status === 'Suspended') && (
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

        {/* Tabel Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">ID & Nama Pengguna</th>
                <th className="py-3 px-5">Peran & Risiko</th>
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
                        <div className="text-[8px] font-bold text-[#4B2172] font-mono">{user.id}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 bg-neutral-100 text-neutral-700 font-semibold rounded-lg text-[9px]">
                            {user.role}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border ${getRiskBadge(user.riskLevel)}`}>
                            {user.riskLevel} Risk
                          </span>
                        </div>
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
                          {user.status === 'Active' ? 'Aktif' : user.status === 'Suspended' ? 'Disuspend' : 'Diblokir'}
                        </StatusBadge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.status !== 'Blocked' && (
                            <button
                              onClick={() => { setSelectedUser(user); setActionModal('Block'); }}
                              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[9px] font-bold rounded-full transition cursor-pointer flex items-center gap-1"
                            >
                              <Lock size={12} /> Blokir
                            </button>
                          )}
                          {user.status !== 'Suspended' && user.status !== 'Blocked' && (
                            <button
                              onClick={() => { setSelectedUser(user); setActionModal('Suspend'); }}
                              className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 text-[9px] font-bold rounded-full transition cursor-pointer flex items-center gap-1"
                            >
                              <ShieldAlert size={12} /> Suspend
                            </button>
                          )}
                          {(user.status === 'Blocked' || user.status === 'Suspended') && (
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
        onClose={() => setShowAddModal(false)}
        title="Tambah Pengguna Baru"
        subtitle="Formulir Pendaftaran Manual Admin"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddUser} className="space-y-3 text-[10px]">
          <div>
            <label className="font-bold text-neutral-600 block mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2"
              placeholder="Masukkan nama pengguna..."
            />
          </div>
          <div>
            <label className="font-bold text-neutral-600 block mb-1">Email</label>
            <input
              type="email"
              required
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2"
              placeholder="nama@email.com"
            />
          </div>
          <div>
            <label className="font-bold text-neutral-600 block mb-1">Peran Pengguna</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 font-medium"
            >
              <option value="Passenger">Passenger</option>
              <option value="Driver Motor">Driver Motor</option>
              <option value="Driver Mobil">Driver Mobil</option>
              <option value="Admin Wilayah">Admin Wilayah</option>
            </select>
          </div>
          <div>
            <label className="font-bold text-neutral-600 block mb-1">Nomor Telepon</label>
            <input
              type="tel"
              value={newUser.phone}
              onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2"
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 font-bold text-neutral-500">Batal</button>
            <button type="submit" className="px-4 py-2 bg-[#4B2172] text-white font-bold rounded-full">Simpan User</button>
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
            Anda akan melakukan tindakan <strong className="text-neutral-800">{actionModal}</strong> secara sistemik pada akun <strong className="text-neutral-800">{selectedUser?.name}</strong> ({selectedUser?.id}).
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