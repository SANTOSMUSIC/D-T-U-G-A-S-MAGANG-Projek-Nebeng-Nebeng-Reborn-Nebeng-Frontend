import { ShieldCheck } from 'lucide-react';
import authIllustration from '../../assets/AuthIllustration.png';

export default function AuthLayout({ children, title, subtitle, badgeText = "VERIFIED SECURITY SYSTEM" }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-neutral-100 p-4 md:p-8 overflow-hidden font-['Inter']">

      <div className="pointer-events-none absolute -top-32 -left-32 w-[28rem] h-[28rem] md:w-[34rem] md:h-[34rem] bg-purple-300/60 rounded-full blur-[100px]"></div>
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[28rem] h-[28rem] md:w-[34rem] md:h-[34rem] bg-purple-200/60 rounded-full blur-[100px]"></div>
      <div className="pointer-events-none absolute top-1/3 -right-20 w-64 h-64 bg-purple-100/50 rounded-full blur-[80px]"></div>

      <div className="relative z-10 w-full max-w-5xl bg-white rounded-[24px] shadow-sm shadow-neutral-200 border border-neutral-100 overflow-hidden flex flex-col md:flex-row md:min-h-[600px] md:max-h-[90vh]">

        <div className="relative w-full md:w-1/2 m-3 md:m-4 rounded-[18px] overflow-hidden bg-gradient-to-b from-purple-50 to-purple-100/70 shrink-0 flex flex-col justify-between">
          <div className="flex-1 flex items-center justify-center px-6 sm:px-10 pt-8 sm:pt-10">
            <img
              src={authIllustration}
              alt="Ilustrasi layanan berbagi tumpangan dan pengantaran Nebeng"
              className="w-full max-h-56 sm:max-h-72 md:max-h-none h-auto object-contain"
            />
          </div>

          <div className="px-6 sm:px-10 pb-8 sm:pb-10 pt-5">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold leading-snug mb-1.5 text-neutral-800">
              {title}
            </h1>
            <p className="text-neutral-500 text-sm font-normal leading-relaxed mb-4">
              {subtitle}
            </p>
            <div className="inline-flex w-fit items-center gap-1.5 text-[11px] font-medium tracking-wide text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              {badgeText}
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-8 sm:px-10 md:px-12 md:py-10 md:overflow-y-auto">
          <div className="w-full max-w-sm mx-auto my-auto">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}