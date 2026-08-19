import React, { useState } from 'react';
import { 
  ShieldAlert, 
  UserX, 
  UserCheck, 
  Lock, 
  Unlock, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  User,
  Mail,
  Phone,
  Filter
} from 'lucide-react';

export default function UserGovernance() {
  // Mock Data Pengguna Sistem (Super-override Management)
  const [users, setUsers] = useState([
    { id: "USR-001", name: "Budi Santoso", email: "budi@nebeng.com", role: "Driver Motor", phone: "+62 812-3456-7890", status: "Active", riskLevel: "Low" },
    { id: "USR-002", name: "Siti Rahma", email: "siti.rahma@gmail.com", role: "Passenger", phone: "+62 813-9876-5432", status: "Suspended", riskLevel: "Medium" },
    { id: "USR-003", name: "Joko Susilo", email: "joko.susilo@nebeng.com", role: "Driver Mobil", phone: "+62 811-2233-4455", status: "Blocked", riskLevel: "High" },
    { id: "USR-004", name: "Dewi Lestari", email: "dewi.l@nebeng.com", role: "Admin Wilayah", phone: "+62 815-5566-7788", status: "Active", riskLevel: "Low" },
    { id: "USR-005", name: "Ahmad Fauzi", email: "fauzi.ahmad@gmail.com", role: "Passenger", phone: "+62 819-1122-3344", status: "Active", riskLevel: "Low" }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState(null); // 'Block', 'Suspend', 'Unblock'
  const [reason, setReason] = useState('');

  // Filter Pengguna
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Eksekusi Aksi Super-override
  const handleExecuteAction = () => {
    if (!selectedUser) return;

    let newStatus = 'Active';
    if (actionModal === 'Block') newStatus = 'Blocked';
    if (actionModal === 'Suspend') newStatus = 'Suspended';
    if (actionModal === 'Unblock') newStatus = 'Active';

    setUsers(users.map(u => {
      if (u.id === selectedUser.id) {
        return { ...u, status: newStatus };
      }
      return u;
    }));

    // Reset Modal
    setActionModal(null);
    setSelectedUser(null);
    setReason('');
  };

  return (
    <div className="p-8 pt-10 space-y-8 bg-[#f8f9fa] min-h-screen">
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-700">
              SUPERADMIN GOVERNANCE & CONTROL
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">User Governance (Super-Override)</h1>
          <p className="text-xs text-gray-500 mt-0.5">Kelola akses akun secara sistemik: Blokir, Suspend, atau Pulihkan akun pengguna lintas wilayah.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-purple-50 border border-purple-100 rounded-2xl text-xs font-extrabold text-purple-700 flex items-center gap-2">
            <ShieldCheck size={16} />
            Hak Akses: Level Tertinggi (Super-Override)
          </div>
        </div>
      </div>

      {/* Ringkasan Status Akun */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <UserCheck size={24} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Akun Aktif</span>
            <h3 className="text-lg font-black text-gray-900 mt-0.5">
              {users.filter(u => u.status === 'Active').length} Pengguna
            </h3>
            <span className="text-[11px] font-bold text-emerald-600">Beroperasi normal</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Akun Disuspend</span>
            <h3 className="text-lg font-black text-gray-900 mt-0.5">
              {users.filter(u => u.status === 'Suspended').length} Pengguna
            </h3>
            <span className="text-[11px] font-bold text-amber-600">Ditangguhkan sementara</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
            <UserX size={24} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Akun Diblokir Permanen</span>
            <h3 className="text-lg font-black text-gray-900 mt-0.5">
              {users.filter(u => u.status === 'Blocked').length} Pengguna
            </h3>
            <span className="text-[11px] font-bold text-rose-600">Akses dicabut sistemik</span>
          </div>
        </div>
      </div>

      {/* Kontrol & Filter */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari nama, email, atau ID pengguna..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <Filter size={16} /> Filter Status:
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition cursor-pointer"
          >
            <option value="All">Semua Status</option>
            <option value="Active">Active (Aktif)</option>
            <option value="Suspended">Suspended (Ditangguhkan)</option>
            <option value="Blocked">Blocked (Diblokir)</option>
          </select>
        </div>
      </div>

      {/* Tabel Manajemen Pengguna */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-gray-400 text-[11px] uppercase tracking-wider font-extrabold">
                <th className="py-4 px-6">ID & Nama Pengguna</th>
                <th className="py-4 px-6">Peran (Role)</th>
                <th className="py-4 px-6">Kontak</th>
                <th className="py-4 px-6">Status Akun</th>
                <th className="py-4 px-6 text-right">Aksi Super-Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{user.name}</div>
                      <div className="text-[11px] font-bold text-purple-600 font-mono">{user.id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-[11px] font-extrabold rounded-xl">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <Mail size={12} className="text-gray-400" /> {user.email}
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                        <Phone size={12} className="text-gray-400" /> {user.phone}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-[10px] font-extrabold rounded-xl inline-flex items-center gap-1.5 ${
                        user.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                          : user.status === 'Suspended'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'Active' ? 'bg-emerald-500' : user.status === 'Suspended' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></span>
                        {user.status === 'Active' ? 'Aktif' : user.status === 'Suspended' ? 'Disuspend' : 'Diblokir'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.status !== 'Blocked' && (
                          <button
                            onClick={() => { setSelectedUser(user); setActionModal('Block'); }}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1"
                          >
                            <Lock size={14} /> Blokir
                          </button>
                        )}
                        {user.status !== 'Suspended' && user.status !== 'Blocked' && (
                          <button
                            onClick={() => { setSelectedUser(user); setActionModal('Suspend'); }}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1"
                          >
                            <ShieldAlert size={14} /> Suspend
                          </button>
                        )}
                        {(user.status === 'Blocked' || user.status === 'Suspended') && (
                          <button
                            onClick={() => { setSelectedUser(user); setActionModal('Unblock'); }}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1"
                          >
                            <Unlock size={14} /> Pulihkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-xs font-bold text-gray-400">
                    Tidak ada data pengguna ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi Super-Override */}
      {actionModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`p-2 rounded-xl text-white ${
                  actionModal === 'Block' ? 'bg-rose-600' : actionModal === 'Suspend' ? 'bg-amber-600' : 'bg-emerald-600'
                }`}>
                  {actionModal === 'Block' ? <Lock size={20} /> : actionModal === 'Suspend' ? <ShieldAlert size={20} /> : <Unlock size={20} />}
                </span>
                <h3 className="text-lg font-black text-gray-900">
                  Konfirmasi {actionModal} Akun
                </h3>
              </div>
              <p className="text-xs text-gray-500">
                Anda akan melakukan tindakan <strong className="text-gray-900">{actionModal}</strong> secara sistemik (Super-override) pada akun <strong className="text-gray-900">{selectedUser.name}</strong> ({selectedUser.id}).
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider">Alasan / Catatan Override Sistem</label>
              <textarea 
                rows="3"
                placeholder="Masukkan alasan administratif tindakan ini..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                onClick={() => { setActionModal(null); setSelectedUser(null); setReason(''); }}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-gray-500 hover:bg-gray-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={handleExecuteAction}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold text-white transition cursor-pointer shadow-sm ${
                  actionModal === 'Block' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : actionModal === 'Suspend' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                }`}
              >
                Ya, Konfirmasi {actionModal}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}