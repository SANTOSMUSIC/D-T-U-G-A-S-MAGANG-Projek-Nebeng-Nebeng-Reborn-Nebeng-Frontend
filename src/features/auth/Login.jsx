import { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import AuthInput from '../../components/ui/AuthInput';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { loginRequest } from '../../services/authService';

export default function Login({ onSwitchToRegister, onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(''); // State untuk menampung input email
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const validate = () => {
    const nextErrors = {};
    if (!email.trim()) {
      nextErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Format email tidak valid';
    }
    if (!password) {
      nextErrors.password = 'Password wajib diisi';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;
    if (isSubmitting) return; // Cegah submit ganda saat masih diproses

    setIsSubmitting(true);

    try {
      // loginRequest() masih simulasi (lihat src/services/authService.js) —
      // ganti isi fungsi itu saat endpoint /auth/login sudah tersedia,
      // komponen ini tidak perlu diubah.
      const { role, token } = await loginRequest({ email, password });

      // Simpan sesi ke AuthContext supaya ProtectedRoute mengenali user sudah login.
      login(role, { token, email });

      if (onLogin) onLogin(role); // Kirim parameter role ke App.jsx untuk navigasi
    } catch {
      setErrors({ password: 'Email atau password salah. Silakan coba lagi.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout 
      title={<>Hallo,<br />Selamat Datang</>}
      subtitle="Solusi transportasi cerdas yang membantu masyarakat mencari tumpangan yang aman, hemat, dan terpercaya."
      badgeText="VERIFIED SECURITY SYSTEM"
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#69188c] mb-1">Hai... Bagaimana kabarmu?</h2>
        <p className="text-neutral-500 text-xs md:text-sm">Silahkan Masukkan akun Anda untuk melanjutkan</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <AuthInput 
          label="EMAIL" 
          icon={Mail} 
          type="email" 
          placeholder=". . . . " 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        
        <AuthInput 
          label="PASSWORD" 
          icon={Lock} 
          type="password" 
          placeholder=". . . . " 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showPassword={showPassword} 
          togglePassword={() => setShowPassword(!showPassword)}
          error={errors.password}
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-neutral-600 select-none">
            <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-purple-600 focus:ring-purple-500 accent-purple-600" />
            <span className="font-bold text-neutral-500 tracking-wider text-[11px]">INGAT SAYA</span>
          </label>
          <button
            type="button"
            disabled
            title="Fitur ini akan segera hadir"
            aria-disabled="true"
            className="font-bold text-neutral-300 tracking-wider text-[11px] cursor-not-allowed"
          >
            LUPA PASSWORD?
          </button>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition duration-200 text-sm tracking-wide mt-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              MEMPROSES...
            </>
          ) : (
            <>
              MASUK KE AKUN
              <ArrowRight className="w-4 h-4" />
            </>
          )}
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