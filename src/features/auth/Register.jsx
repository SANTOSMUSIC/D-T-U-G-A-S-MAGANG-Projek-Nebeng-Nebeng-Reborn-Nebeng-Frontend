import { useState } from 'react';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import AuthInput from '../../components/ui/AuthInput';
import AuthLayout from '../../components/layout/AuthLayout';
import { useToast } from '../../context/ToastContext';
import { registerRequest } from '../../services/authService';

export default function Register({ onSwitchToLogin }) {
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Customer',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Nama wajib diisi';

    if (!form.email.trim()) {
      nextErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Format email tidak valid';
    }

    if (!form.phone.trim()) {
      nextErrors.phone = 'Nomor telepon wajib diisi';
    } else if (!/^[0-9+\s-]{8,15}$/.test(form.phone)) {
      nextErrors.phone = 'Format nomor telepon tidak valid';
    }

    if (!form.password) {
      nextErrors.password = 'Password wajib diisi';
    } else if (form.password.length < 6) {
      nextErrors.password = 'Password minimal 6 karakter';
    }

    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Konfirmasi password tidak cocok';
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
      // registerRequest() masih simulasi (lihat src/services/authService.js) —
      // ganti isi fungsi itu saat endpoint /auth/register sudah tersedia.
      await registerRequest(form);
      toast.success(`Akun untuk ${form.name} berhasil dibuat. Silakan masuk untuk melanjutkan.`, {
        title: 'Pendaftaran Berhasil',
      });
      onSwitchToLogin();
    } catch {
      toast.error('Pendaftaran gagal. Silakan coba lagi.', { title: 'Terjadi Kesalahan' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout 
      title={<>Bergabung<br />dengan Kami</>}
      subtitle="Mulai pengalaman perjalanan yang lebih cerdas, hemat, dan aman bersama komunitas Nebeng."
      badgeText="DATA PRIVACY GUARANTEED"
    >
      <div className="mb-5 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#992C9F] mb-1">Buat Akun Baru</h2>
        <p className="text-neutral-500 text-xs md:text-sm">Lengkapi data diri Anda untuk memulai perjalanan.</p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit} noValidate>
        <AuthInput 
          label="NAMA PENGGUNA" 
          icon={User} 
          placeholder="...." 
          value={form.name}
          onChange={handleChange('name')}
          error={errors.name}
        />

        <AuthInput 
          label="EMAIL" 
          icon={Mail} 
          type="email" 
          placeholder="...." 
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
        />

        <AuthInput 
          label="NOMOR TELEPON" 
          icon={Phone} 
          type="tel" 
          placeholder="...." 
          value={form.phone}
          onChange={handleChange('phone')}
          error={errors.phone}
        />

        <div>
          <label htmlFor="register-role" className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 mb-1.5">
            DAFTAR SEBAGAI
          </label>
          <select
            id="register-role"
            value={form.role}
            onChange={handleChange('role')}
            className="w-full px-4 py-3 bg-[#f8f9fa] border border-neutral-200/80 rounded-xl text-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white text-sm transition font-medium"
          >
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
            value={form.password}
            onChange={handleChange('password')}
            showPassword={showPassword} 
            togglePassword={() => setShowPassword(!showPassword)}
            error={errors.password}
          />
          <AuthInput 
            label="KONFIRMASI" 
            type="password" 
            placeholder="...." 
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            showPassword={showPassword} 
            togglePassword={() => setShowPassword(!showPassword)}
            error={errors.confirmPassword}
          />
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
              DAFTAR SEKARANG
              <ArrowRight className="w-4 h-4" />
            </>
          )}
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