import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, ArrowRight, ChevronDown, MapPin } from 'lucide-react';
import AuthInput from '../../components/ui/AuthInput';
import AuthLayout from '../../components/layout/AuthLayout';
import { useToast } from '../../context/ToastContext';
import { registerRequest } from '../../services/authService';
import apiClient from '../../services/apiClient';
import logoImage from '../../assets/LOGO.png';

export default function Register({ onSwitchToLogin }) {
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regions, setRegions] = useState([]);
  const [isLoadingRegions, setIsLoadingRegions] = useState(true);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
Fix/bug
    regionId: '',

main
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function fetchRegions() {
      try {
        setIsLoadingRegions(true);
        const response = await apiClient.get('/regions?onlyActive=true');
        const regionData = response.data?.data || response.data || [];
        setRegions(regionData);
        
        // Set default region pertama jika ada data
        if (regionData.length > 0) {
          setForm(prev => ({ ...prev, regionId: String(regionData[0].id) }));
        }
      } catch (err) {
        console.error('Gagal memuat daftar region', err);
        toast.error('Gagal memuat daftar wilayah operasional. Silakan muat ulang halaman.', {
          title: 'Kesalahan Sistem',
        });
      } finally {
        setIsLoadingRegions(false);
      }
    }
    fetchRegions();
  }, [toast]);

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    
    if (field === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 15);
    }

    setForm((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedName) nextErrors.name = 'Nama wajib diisi';
    if (!trimmedEmail) nextErrors.email = 'Email wajib diisi';
    if (!form.phone) nextErrors.phone = 'Nomor telepon wajib diisi';
    if (!form.regionId) nextErrors.regionId = 'Wilayah / Region wajib dipilih';
    if (!form.password) nextErrors.password = 'Password wajib diisi';
    if (form.password && form.password.length < 6) nextErrors.password = 'Password minimal 6 karakter';
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Konfirmasi password tidak cocok';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone,
      role: form.role,
      regionId: String(form.regionId),
      password: form.password,
    };

    try {
      await registerRequest(payload);
      toast.success(`Akun untuk ${payload.name} berhasil dibuat. Silakan masuk untuk melanjutkan.`, {
        title: 'Pendaftaran Berhasil',
      });
      onSwitchToLogin();
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.';
      toast.error(errorMessage, { title: 'Terjadi Kesalahan' });
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={<>Bergabung<br />dengan Kami</>}
      subtitle="Mulai pengalaman perjalanan yang lebih cerdas, hemat, dan aman bersama komunitas Nebeng."
      badgeText="DATA PRIVACY GUARANTEED"
    >
      <div className="mb-8 w-full flex flex-col items-center text-center">
        <div className="w-full flex items-center justify-center gap-2.5 mb-7">
          <img src={logoImage} alt="Logo Nebeng" className="h-8 w-8 object-contain shrink-0" />
          <span className="font-bold text-neutral-800 text-base tracking-wide leading-none">Nebeng</span>
        </div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-1.5">Buat akun baru</h2>
        <p className="text-neutral-500 text-sm">Lengkapi data diri Anda untuk memulai perjalanan.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Nama pengguna"
          icon={User}
          placeholder="Masukkan nama lengkapmu"
          value={form.name}
          onChange={handleChange('name')}
          error={errors.name}
        />

        <AuthInput
          label="Email"
          icon={Mail}
          type="email"
          placeholder="nama@email.com"
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
        />

        <AuthInput
          label="Nomor telepon"
          icon={Phone}
          type="tel"
          placeholder="08xxxxxxxxxx"
          value={form.phone}
          onChange={handleChange('phone')}
          error={errors.phone}
        />

        <div className="w-full">
          <label htmlFor="register-role" className="block text-sm font-medium text-neutral-600 mb-2">
            Daftar sebagai
          </label>
          <div className="relative">
            <select
              id="register-role"
              value={form.role}
              onChange={handleChange('role')}
              className="w-full appearance-none pl-4 pr-11 py-3.5 bg-white border border-neutral-200 rounded-full text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172] text-[15px] transition font-normal cursor-pointer"
            >
              <option value="customer">Customer</option>
              <option value="mitra">Mitra (Driver)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute inset-y-0 right-4 my-auto w-4.5 h-4.5 text-zinc-500" />
          </div>
        </div>

        {/* Pilihan Wilayah / Region dengan Status Loading & Validasi Kosong */}
        <div className="w-full">
          <label htmlFor="register-region" className="block text-sm font-medium text-neutral-600 mb-2">
            Pilih Wilayah Operasional (Region)
          </label>
          <div className="relative">
            <select
              id="register-region"
              value={form.regionId}
              onChange={handleChange('regionId')}
              disabled={isLoadingRegions || regions.length === 0}
              className="w-full appearance-none pl-4 pr-11 py-3.5 bg-white border border-neutral-200 rounded-full text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172] text-[15px] transition font-normal cursor-pointer disabled:bg-neutral-100 disabled:cursor-not-allowed"
            >
              {isLoadingRegions ? (
                <option value="">Memuat wilayah...</option>
              ) : regions.length === 0 ? (
                <option value="">Tidak ada wilayah aktif</option>
              ) : (
                regions.map((reg) => (
                  <option key={reg.id} value={reg.id}>
                    {reg.name} ({reg.code})
                  </option>
                ))
              )}
            </select>
            <MapPin className="pointer-events-none absolute inset-y-0 right-4 my-auto w-4.5 h-4.5 text-zinc-500" />
          </div>
          {errors.regionId && <p className="text-xs text-rose-500 mt-1 pl-4">{errors.regionId}</p>}
        </div>

        <AuthInput
          label="Password"
          icon={Lock}
          type="password"
          placeholder="Buat kata sandi (min. 6 karakter)"
          value={form.password}
          onChange={handleChange('password')}
          showPassword={showPassword}
          togglePassword={() => setShowPassword((prev) => !prev)}
          error={errors.password}
        />

        <AuthInput
          label="Konfirmasi password"
          icon={Lock}
          type="password"
          placeholder="Ulangi kata sandimu"
          value={form.confirmPassword}
          onChange={handleChange('confirmPassword')}
          showPassword={showConfirmPassword}
          togglePassword={() => setShowConfirmPassword((prev) => !prev)}
          error={errors.confirmPassword}
        />

        <button
          type="submit"
          disabled={isSubmitting || isLoadingRegions || regions.length === 0}
          className="w-full py-3.5 px-4 bg-[#4B2172] hover:bg-[#371654] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold rounded-full shadow-sm flex items-center justify-center gap-2 transition duration-200 text-sm tracking-wide mt-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              MEMPROSES...
            </>
          ) : (
            <>
              Daftar sekarang
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-500 font-normal mt-6">
        Sudah punya akun?{' '}
        <button onClick={onSwitchToLogin} className="text-[#4B2172] font-semibold hover:underline cursor-pointer">
          Masuk di sini
        </button>
      </p>
    </AuthLayout>
  );
}