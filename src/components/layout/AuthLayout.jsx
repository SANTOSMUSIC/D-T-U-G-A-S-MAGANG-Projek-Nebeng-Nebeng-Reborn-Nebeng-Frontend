import { ShieldCheck } from 'lucide-react';
import authIllustration from '../../assets/auth-illustration.png';

export default function AuthLayout({
  children,
  title,
  subtitle,
  badgeText = "VERIFIED SECURITY SYSTEM",
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 md:p-8 overflow-hidden font-['Inter']">

      {/* Background Decorative Glow */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[28rem] h-[28rem] md:w-[34rem] md:h-[34rem] bg-indigo-100/70 rounded-full blur-[100px]" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[28rem] h-[28rem] md:w-[34rem] md:h-[34rem] bg-indigo-100/70 rounded-full blur-[100px]" />

      <div className="pointer-events-none absolute top-1/3 -right-20 w-64 h-64 bg-sky-100/80 rounded-full blur-[80px]" />

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-[24px] shadow-sm shadow-slate-200 border border-slate-200 overflow-hidden flex flex-col md:flex-row md:min-h-[600px] md:max-h-[90vh]">

        {/* LEFT SIDE - Illustration */}
        <div className="relative w-full md:w-1/2 m-3 md:m-4 rounded-[18px] overflow-hidden bg-gradient-to-br from-indigo-50 via-indigo-100/60 to-sky-100/70 shrink-0 flex flex-col justify-between">

          {/* Soft Decorative Circles */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-52 h-52 bg-white/60 rounded-full blur-2xl" />

          <div className="pointer-events-none absolute -bottom-20 -left-20 w-52 h-52 bg-indigo-200/40 rounded-full blur-2xl" />

          {/* Illustration */}
          <div className="relative z-10 flex-1 flex items-center justify-center px-6 sm:px-10 pt-8 sm:pt-10">
            <img
              src={authIllustration}
              alt="Ilustrasi layanan berbagi tumpangan dan pengantaran Nebeng"
              className="w-full max-h-56 sm:max-h-72 md:max-h-none h-auto object-contain"
            />
          </div>

          {/* Left Information */}
          <div className="relative z-10 px-6 sm:px-10 pb-8 sm:pb-10 pt-5">

            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold leading-snug mb-1.5 text-indigo-950">
              {title}
            </h1>

            <p className="text-slate-500 text-sm font-normal leading-relaxed mb-4">
              {subtitle}
            </p>

            <div className="inline-flex w-fit items-center gap-1.5 text-[11px] font-medium tracking-wide text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
              {badgeText}
            </div>

          </div>
        </div>

        {/* RIGHT SIDE - Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-8 sm:px-10 md:px-12 md:py-10 md:overflow-y-auto">

          <div className="w-full max-w-sm mx-auto my-auto">
            {children}
          </div>

        </div>

      </div>
    </div>
  );
}