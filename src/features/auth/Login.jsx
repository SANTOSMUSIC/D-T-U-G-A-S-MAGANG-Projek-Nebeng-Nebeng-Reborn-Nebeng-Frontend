import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import AuthInput from '../../components/ui/AuthInput';
import AuthLayout from '../../components/layout/AuthLayout';

export default function Login({ onSwitchToRegister, onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(''); // State untuk menampung input email

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const lowerEmail = email.toLowerCase();
    let role = 'admin'; // Default role

    // Tentukan role berdasarkan teks email
    if (lowerEmail.includes('regional')) {
      role = 'regional';
    } else if (lowerEmail.includes('operator') || lowerEmail.includes('pos')) {
      role = 'operator'; // Role untuk Operator Pos
    } else if (lowerEmail.includes('mitra')) {
      role = 'mitra'; // Role untuk Mitra Pos
    } else if (lowerEmail.includes('customer')) {
      role = 'customer'; // Role untuk customer
    }
    
    
    if (onLogin) onLogin(role); // Kirim parameter role ke App.jsx[cite: 7]
  };

  return (
    <AuthLayout 
      title={<>Hallo,<br />Selamat Datang</>}
      subtitle="Solusi transportasi cerdas yang membantu masyarakat mencari tumpangan yang aman, hemat, dan terpercaya."
      badgeText="VERIFIED SECURITY SYSTEM"
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#69188c] mb-1">Hai... Bagaimana kabarmu?</h2>
        <p className="text-neutral-400 text-xs md:text-sm">Silahkan Masukkan akun Anda untuk melanjutkan</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthInput 
          label="EMAIL" 
          icon={Mail} 
          type="email" 
          placeholder="cth: mitra@nebeng.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <AuthInput 
          label="PASSWORD" 
          icon={Lock} 
          type="password" 
          placeholder=". . . . " 
          showPassword={showPassword} 
          togglePassword={() => setShowPassword(!showPassword)}
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-neutral-600 select-none">
            <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-purple-600 focus:ring-purple-500 accent-purple-600" />
            <span className="font-bold text-neutral-500 tracking-wider text-[11px]">INGAT SAYA</span>
          </label>
          <a href="#" className="font-bold text-purple-700 hover:underline tracking-wider text-[11px]">LUPA PASSWORD?</a>
        </div>

        <button 
          type="submit" 
          className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition duration-200 text-sm tracking-wide mt-2"
        >
          MASUK KE AKUN
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-100"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-neutral-300 font-extrabold tracking-widest text-[10px]">ATAU</span>
        </div>
      </div>

      <p className="text-center text-xs md:text-sm text-neutral-500 font-medium">
        Belum memiliki akun?{' '}
        <button onClick={onSwitchToRegister} className="text-purple-700 font-extrabold hover:underline">
          DAFTAR SEKARANG
        </button>
      </p>
    </AuthLayout>
  );
}