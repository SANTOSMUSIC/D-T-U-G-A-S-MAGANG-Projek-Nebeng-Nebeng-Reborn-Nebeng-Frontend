import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import AuthInput from '../../components/ui/AuthInput';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { loginRequest } from '../../services/authService';
import logoImage from '../../assets/logo.png';

export default function Login({ onSwitchToRegister, onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();

  /* =========================================
     EMAIL CHANGE
  ========================================= */
  const handleEmailChange = (e) => {
    setEmail(e.target.value);

    if (errors.email || errors.general) {
      setErrors((prev) => ({
        ...prev,
        email: undefined,
        general: undefined,
      }));
    }
  };

  /* =========================================
     PASSWORD CHANGE
  ========================================= */
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);

    if (errors.password || errors.general) {
      setErrors((prev) => ({
        ...prev,
        password: undefined,
        general: undefined,
      }));
    }
  };

  /* =========================================
     VALIDATION
  ========================================= */
  const validate = () => {
    const nextErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = 'Email wajib diisi';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
    ) {
      nextErrors.email = 'Format email tidak valid';
    }

    if (!password) {
      nextErrors.password = 'Kata sandi wajib diisi';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /* =========================================
     SUBMIT LOGIN
  ========================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    const cleanEmail = email.trim();

    try {
      const {
        role,
        token,
        refreshToken,
        user,
      } = await loginRequest({
        email: cleanEmail,
        password,
      });

      login(
        role,
        {
          token,
          refreshToken,
          email: cleanEmail,
          user,
        },
        rememberMe
      );

      if (onLogin) {
        onLogin(role);
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        'Email atau kata sandi salah. Silakan coba lagi.';

      setErrors({
        password: errorMessage,
      });

      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      logo={logoImage}
      brandName="Nebeng"
      title={<>Halo lagi!</>}
      subtitle="Udah siap lanjut perjalanan?"
    >
      {/* =====================================
          LOGIN FORM
      ====================================== */}
      <form
        className="space-y-4"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* EMAIL */}
        <AuthInput
          label="Email"
          type="email"
          placeholder="nama@email.com"
          autoComplete="email"
          value={email}
          onChange={handleEmailChange}
          error={errors.email}
        />

        {/* PASSWORD */}
        <AuthInput
          label="Kata sandi"
          type="password"
          placeholder="Masukkan kata sandimu"
          autoComplete="current-password"
          value={password}
          onChange={handlePasswordChange}
          showPassword={showPassword}
          togglePassword={() =>
            setShowPassword((prev) => !prev)
          }
          error={errors.password}
        />

        {/* =================================
            REMEMBER ME + FORGOT PASSWORD
        ================================== */}
        <div
          className="
            flex
            items-center
            justify-between
            px-1
            pt-0.5
          "
        >
          {/* Remember Me */}
          <label
            className="
              flex
              items-center
              gap-1.5
              cursor-pointer
              select-none
              text-[9px]
              leading-none
              font-normal
              text-[#999999]
            "
          >
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) =>
                setRememberMe(e.target.checked)
              }
              className="
                w-3
                h-3
                shrink-0
                rounded-sm
                border-[#D5D5D5]
                accent-[#10367D]
                cursor-pointer
              "
            />

            <span>
              Ingat saya
            </span>
          </label>

          {/* Forgot Password */}
          <button
            type="button"
            disabled
            title="Fitur ini akan segera hadir"
            aria-disabled="true"
            className="
              text-[9px]
              leading-none
              font-medium
              text-[#10367D]
              underline
              opacity-70
              cursor-not-allowed
            "
          >
            Lupa password?
          </button>
        </div>

        {/* =================================
            LOGIN BUTTON
        ================================== */}
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="
            w-full
            h-10.25

            px-4

            rounded-full

            bg-[#10367D]
            hover:bg-[#0C2C66]

            text-white
            text-[12px]
            leading-none
            font-medium

            flex
            items-center
            justify-center
            gap-2

            transition-colors
            duration-200

            disabled:opacity-60
            disabled:cursor-not-allowed

            cursor-pointer
          "
        >
          {isSubmitting ? (
            <>
              <span
                className="
                  w-3.5
                  h-3.5
                  border-2
                  border-white/40
                  border-t-white
                  rounded-full
                  animate-spin
                "
              />

              <span>
                Memproses...
              </span>
            </>
          ) : (
            <>
              <span>
                Masuk
              </span>

              <ArrowRight
                className="
                  w-3.5
                  h-3.5
                  shrink-0
                "
              />
            </>
          )}
        </button>
      </form>

      {/* =====================================
          REGISTER LINK
      ====================================== */}
      <p
        className="
          text-center
          mt-5

          text-[9px]
          leading-[1.4]
          font-normal

          text-[#999999]
        "
      >
        Belum punya akun?{' '}

        <button
          type="button"
          onClick={onSwitchToRegister}
          className="
            font-medium
            text-[#10367D]

            hover:text-[#0C2C66]
            hover:underline

            transition-colors
            duration-150

            cursor-pointer
          "
        >
          Gabung sekarang!
        </button>
      </p>
    </AuthLayout>
  );
}