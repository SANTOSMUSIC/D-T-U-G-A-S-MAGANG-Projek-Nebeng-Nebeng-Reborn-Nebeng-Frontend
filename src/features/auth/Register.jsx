import React, { useState } from 'react';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import AuthInput from '../../components/ui/AuthInput';
import AuthLayout from '../../components/layout/AuthLayout';

export default function Register({ onSwitchToLogin }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout 
      title={<>Bergabung<br />dengan Kami</>}
      subtitle="Mulai pengalaman perjalanan yang lebih cerdas, hemat, dan aman bersama komunitas Nebeng."
      badgeText="DATA PRIVACY GUARANTEED"
    >
      <div className="mb-5 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#992C9F] mb-1">Buat Akun Baru</h2>
        <p className="text-neutral-400 text-xs md:text-sm">Lengkapi data diri Anda untuk memulai perjalanan.</p>
      </div>

      <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
        <AuthInput 
          label="NAMA PENGGUNA" 
          icon={User} 
          placeholder="...." 
        />

        <AuthInput 
          label="EMAIL" 
          icon={Mail} 
          type="email" 
          placeholder="...." 
        />

        <AuthInput 
          label="NOMOR TELEPON" 
          icon={Phone} 
          type="tel" 
          placeholder="...." 
        />

        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
            DAFTAR SEBAGAI
          </label>
          <select className="w-full px-4 py-3 bg-[#f8f9fa] border border-neutral-200/80 rounded-xl text-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white text-sm transition font-medium">
            <option value="Customer">Customer</option>
            <option value="Mitra">Mitra (Driver)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AuthInput 
            label="PASSWORD" 
            icon={Lock} 
            type="password" 
            placeholder="...." 
            showPassword={showPassword} 
            togglePassword={() => setShowPassword(!showPassword)}
          />
          <AuthInput 
            label="KONFIRMASI" 
            type="password" 
            placeholder="...." 
            showPassword={showPassword} 
            togglePassword={() => setShowPassword(!showPassword)}
          />
        </div>

        <button 
          type="submit" 
          className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition duration-200 text-sm tracking-wide mt-2"
        >
          DAFTAR SEKARANG
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-xs md:text-sm text-neutral-500 font-medium mt-5">
        Sudah memiliki akun?{' '}
        <button onClick={onSwitchToLogin} className="text-purple-700 font-extrabold hover:underline">
          MASUK DISINI
        </button>
      </p>
    </AuthLayout>
  );
}