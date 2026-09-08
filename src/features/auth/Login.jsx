import { useState } from 'react';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import AuthInput from '../../components/ui/AuthInput';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { loginRequest } from '../../services/authService';
import logoImage from '../../assets/LOGO.png';

export default function Login({ onSwitchToRegister, onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email || errors.general) {
      setErrors((prev) => ({ ...prev, email: undefined, general: undefined }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password || errors.general) {
      setErrors((prev) => ({ ...prev, password: undefined, general: undefined }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'Format email tidak valid';
    }

    if (!password) {
      nextErrors.password = 'Kata sandi wajib diisi';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    const cleanEmail = email.trim();

    try {
      const { role, token, refreshToken, user } = await loginRequest({ email: cleanEmail, password });

      login(role, { token, refreshToken, email: cleanEmail, user }, rememberMe);

      if (onLogin) onLogin(role);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Email atau kata sandi salah. Silakan coba lagi.';
      setErrors({ password: errorMessage });
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={<>Yuk, jalan bareng! 🚗</>}
      subtitle="Cari tumpangan, berbagi perjalanan, dan hemat bareng. Aman, nyaman, dan nggak ribet."
      badgeText="VERIFIED SECURITY SYSTEM"
    >
      <div className="mb-8 w-full flex flex-col items-center text-center">
        <div className="w-full flex items-center justify-center gap-2.5 mb-7">
          <img
            src={logoImage}
            alt="Logo Nebeng"
            className="h-8 w-8 object-contain shrink-0"
          />
          <span className="font-bold text-neutral-800 text-base tracking-wide leading-none">
            Nebeng
          </span>
        </div>

        <h2 className="w-full flex items-center justify-center gap-1.5 text-2xl font-bold text-neutral-800 mb-1.5">
          <span aria-hidden="true" className="invisible">👋</span>
          <span>Halo lagi!</span>
          <span aria-hidden="true">👋</span>
        </h2>

        <p className="text-neutral-500 text-sm">
          Udah siap lanjut perjalanan?
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Email"
          type="email"
          icon={Mail}
          placeholder="nama@email.com"
          autoComplete="email"
          value={email}
          onChange={handleEmailChange}
          error={errors.email}
        />

        <AuthInput
          label="Kata sandi"
          type="password"
          icon={Lock}
          placeholder="Masukkan kata sandimu"
          autoComplete="current-password"
          value={password}
          onChange={handlePasswordChange}
          showPassword={showPassword}
          togglePassword={() => setShowPassword((prev) => !prev)}
          error={errors.password}
        />

        <div className="flex items-center justify-between text-sm pt-1 px-1">
          <label className="flex items-center gap-2 cursor-pointer text-neutral-500 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-[#4B2172] focus:ring-[#4B2172] accent-[#4B2172] cursor-pointer"
            />
            <span className="font-medium">Ingat saya</span>
          </label>
          <button
            type="button"
            disabled
            title="Fitur ini akan segera hadir"
            aria-disabled="true"
            className="font-semibold text-neutral-400 cursor-not-allowed"
          >
            Lupa password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="w-full py-3.5 px-4 bg-[#4B2172] hover:bg-[#371654] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold rounded-full shadow-sm flex items-center justify-center gap-2 transition duration-200 text-sm tracking-wide mt-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              MEMPROSES...
            </>
          ) : (
            <>
              Masuk
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-100"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-neutral-400 text-xs font-normal">atau masuk lewat</span>
        </div>
      </div>

      <button
        type="button"
        disabled
        title="Fitur ini akan segera hadir"
        aria-disabled="true"
        className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-white border border-neutral-200 rounded-full text-neutral-400 text-sm font-semibold cursor-not-allowed"
      >
        <svg className="w-4.5 h-4.5 opacity-60" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 16.1 3 9.3 7.5 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.4 26.7 37 24 37c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.2 40.4 16 45 24 45z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C40.9 36.3 44 30.7 44 24c0-1.4-.1-2.7-.4-3.5z"/>
        </svg>
        Google
      </button>

      <p className="text-center text-sm text-neutral-500 font-normal mt-6">
        Belum punya akun?{' '}
        <button onClick={onSwitchToRegister} className="text-[#4B2172] font-semibold hover:underline cursor-pointer">
          Gabung sekarang!
        </button>
      </p>
    </AuthLayout>
  );
}