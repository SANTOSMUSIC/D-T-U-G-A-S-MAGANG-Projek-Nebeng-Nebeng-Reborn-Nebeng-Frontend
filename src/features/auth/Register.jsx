import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, ArrowRight, ChevronDown, MapPin } from 'lucide-react';
import AuthInput from '../../components/ui/AuthInput';
import AuthLayout from '../../components/layout/AuthLayout';
import { useToast } from '../../context/ToastContext';
import { registerRequest } from '../../services/authService';
import apiClient from '../../services/apiClient';
import logoImage from '../../assets/logo.png';
import registerIllustration from '../../assets/Daftar.png';

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
    regionId: '',
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
      logo={logoImage}
      brandName="Nebeng"
      title={<>Bergabung dengan Kami</>}
      subtitle="Mulai pengalaman perjalanan yang lebih cerdas, hemat, dan aman."
      illustration={registerIllustration}
      illustrationAlt="Ilustrasi pendaftaran akun Nebeng"
    >
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
          <label htmlFor="register-role" className="block mb-1.5 text-[11px] leading-[1.4] font-normal text-[#999999]">
            Daftar sebagai
          </label>
          <div className="relative">
            <select
              id="register-role"
              value={form.role}
              onChange={handleChange('role')}
              className="w-full h-[40px] sm:h-[41px] appearance-none pl-4 pr-11 bg-white border border-[#E3E3E3] rounded-full text-[10px] sm:text-[10.5px] leading-none font-normal text-[#333333] focus:outline-none focus:border-[#74B4D9] focus:ring-2 focus:ring-[#74B4D9]/15 transition-all duration-200 cursor-pointer"
            >
              <option value="customer">Customer</option>
              <option value="mitra">Mitra (Driver)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute inset-y-0 right-4 my-auto w-[15px] h-[15px] text-[#999999]" />
          </div>
        </div>

        {/* Pilihan Wilayah / Region dengan Status Loading & Validasi Kosong */}
        <div className="w-full">
          <label htmlFor="register-region" className="block mb-1.5 text-[11px] leading-[1.4] font-normal text-[#999999]">
            Pilih Wilayah Operasional (Region)
          </label>
          <div className="relative">
            <select
              id="register-region"
              value={form.regionId}
              onChange={handleChange('regionId')}
              disabled={isLoadingRegions || regions.length === 0}
              className="w-full h-[40px] sm:h-[41px] appearance-none pl-4 pr-11 bg-white border border-[#E3E3E3] rounded-full text-[10px] sm:text-[10.5px] leading-none font-normal text-[#333333] focus:outline-none focus:border-[#74B4D9] focus:ring-2 focus:ring-[#74B4D9]/15 transition-all duration-200 cursor-pointer disabled:bg-[#EBEBEB] disabled:cursor-not-allowed"
            >
              {isLoadingRegions ? (
                <option value="">Memuat wilayah...</option>
              ) : regions.length === 0 ? (
                <option value="">Tidak ada wilayah aktif</option>
              ) : (
                <>
                <option value="" disabled>-- Pilih wilayah operasional Anda --</option>
                {regions.map((reg) => (
                  <option key={reg.id} value={reg.id}>
                    {reg.name} ({reg.code})
                  </option>
                ))}
                </>
              )}
            </select>
            <MapPin className="pointer-events-none absolute inset-y-0 right-4 my-auto w-[15px] h-[15px] text-[#999999]" />
          </div>
          {errors.regionId && <p className="mt-1.5 ml-1 text-[9px] leading-[1.4] font-medium text-[#E57373]">{errors.regionId}</p>}

          {!isLoadingRegions && regions.length === 0 && (
            <p className="mt-2 px-3 py-2 rounded-[14px] bg-[#FFF4E5] border border-[#F5D9A8] text-[9px] leading-[1.4] font-normal text-[#B8791E]">
              Belum ada wilayah operasional yang aktif saat ini. Silakan hubungi admin untuk mengaktifkan region, lalu muat ulang halaman ini.
            </p>
          )}
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
          className="w-full h-[41px] px-4 bg-[#10367D] hover:bg-[#0C2C66] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[12px] leading-none font-medium rounded-full flex items-center justify-center gap-2 transition-colors duration-200 mt-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-[14px] h-[14px] border-2 border-white/40 border-t-white rounded-full animate-spin" />
              MEMPROSES...
            </>
          ) : (
            <>
              Daftar sekarang
              <ArrowRight className="w-[14px] h-[14px]" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-[9px] leading-[1.4] font-normal text-[#999999] mt-5">
        Sudah punya akun?{' '}
        <button onClick={onSwitchToLogin} className="font-medium text-[#10367D] hover:text-[#0C2C66] hover:underline cursor-pointer transition-colors duration-150">
          Masuk di sini
        </button>
      </p>
    </AuthLayout>
  );
}