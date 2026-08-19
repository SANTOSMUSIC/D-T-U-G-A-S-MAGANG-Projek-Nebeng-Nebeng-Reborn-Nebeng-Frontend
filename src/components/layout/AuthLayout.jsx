import React from 'react';
import { ShieldCheck } from 'lucide-react';
import logoImage from '../../assets/LOGO.png';

export default function AuthLayout({ children, title, subtitle, badgeText = "VERIFIED SECURITY SYSTEM" }) {
  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-white overflow-hidden m-0 p-0">
      
      {/* Sisi Kiri: Banner Gradient 60% */}
      <div className="relative w-full md:w-[60%] h-full bg-gradient-to-br from-[#322C85] via-[#B019B8] to-[#FC156A] p-10 md:p-16 lg:p-20 flex flex-col justify-between text-white overflow-hidden">
        {/* Efek Blur Cahaya Dekoratif */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col">
          {/* Logo Diperbesar & Spacing Disesuaikan */}
          <div className="mb-8 md:mb-10 lg:mb-12">
            <img 
              src={logoImage} 
              alt="Logo Nebeng" 
              className="h-20 md:h-24 lg:h-28 w-auto object-contain drop-shadow-lg filter brightness-0 invert" 
            />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-[1.15] max-w-2xl">
            {title}
          </h1>
          <p className="text-purple-100 text-sm md:text-base lg:text-lg leading-relaxed max-w-xl">
            {subtitle}
          </p>
        </div>

        <div className="relative z-10 mt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-semibold tracking-wider text-purple-100 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-purple-200" />
            {badgeText}
          </div>
        </div>
      </div>

      {/* Sisi Kanan: Konten Form 40% */}
      <div className="w-full md:w-[40%] h-full p-8 md:p-12 lg:p-16 flex flex-col justify-center items-center bg-white overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </div>

    </div>
  );
}