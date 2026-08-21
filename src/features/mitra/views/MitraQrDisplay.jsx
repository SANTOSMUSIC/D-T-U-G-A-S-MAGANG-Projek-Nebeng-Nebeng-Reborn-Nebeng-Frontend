import React, { useState } from 'react';
import { Smartphone, RefreshCw, ShieldCheck, QrCode } from 'lucide-react';

export default function MitraQrDisplay() {
  const [selectedTrip, setSelectedTrip] = useState('TRIP-701');
  
  const activeTrips = [
    { id: 'TRIP-701', route: 'Solo (Pos Pusat) → Yogyakarta', vehicle: 'Motor (AD 1234 XX)', time: '08:00 WIB, 25 Jun 2026' },
    { id: 'TRIP-702', route: 'Solo → Semarang', vehicle: 'Mobil (H 5678 YZ)', time: '10:00 WIB, 26 Jun 2026' }
  ];

  const current = activeTrips.find(t => t.id === selectedTrip) || activeTrips[0];

  // URL API QR Code valid yang otomatis mengenkode ID Trip dan Rute agar bisa diskan asli
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`ID:${current.id}|Rute:${current.route}|Kendaraan:${current.vehicle}`)}`;

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-8">
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-pink-600 font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <Smartphone className="w-3.5 h-3.5" /> Tampilan Layar Perangkat Mitra
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Digital QR Trip Display</h1>
          <p className="text-neutral-500 text-xs mt-0.5">Tunjukkan QR Code trip aktif ini kepada Operator Pos saat melakukan verifikasi keberangkatan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pilihan Trip */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 lg:col-span-1">
          <h2 className="text-base font-extrabold text-neutral-900 mb-4 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-pink-600" /> Pilih Trip Aktif
          </h2>
          <div className="space-y-3">
            {activeTrips.map((trip) => (
              <button
                key={trip.id}
                onClick={() => setSelectedTrip(trip.id)}
                className={`w-full text-left p-4 rounded-2xl border transition cursor-pointer ${
                  selectedTrip === trip.id 
                    ? 'border-pink-500 bg-pink-50/50 shadow-sm' 
                    : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-neutral-900">{trip.id}</span>
                  <span className="text-[10px] font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">Aktif</span>
                </div>
                <p className="text-xs font-bold text-neutral-700">{trip.route}</p>
                <p className="text-[10px] text-neutral-500 mt-1">{trip.vehicle}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Simulasi Layar HP Menampilkan QR Code Asli (Bisa Discan) */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 lg:col-span-2 flex flex-col items-center justify-center text-center">
          <div className="w-full max-w-sm bg-gradient-to-b from-neutral-900 to-neutral-800 p-6 rounded-3xl text-white shadow-xl border-4 border-neutral-800 relative">
            
            {/* Status Bar Simulasi HP */}
            <div className="flex justify-between items-center text-[10px] text-neutral-500 mb-4 px-2">
              <span>Nebeng App Driver</span>
              <span className="flex items-center gap-1 text-emerald-400"><ShieldCheck className="w-3 h-3" /> Secure</span>
            </div>

            {/* Kotak QR Code Berbasis Gambar API Asli */}
            <div className="bg-white p-5 rounded-2xl shadow-inner my-2 flex flex-col items-center">
              <div className="w-48 h-48 bg-white p-2 rounded-xl flex items-center justify-center relative shadow-sm border border-neutral-100">
                <img 
                  src={qrCodeUrl} 
                  alt={`QR Code ${current.id}`} 
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-neutral-900 font-extrabold text-sm mt-3">{current.id}</p>
              <p className="text-neutral-500 text-[11px] font-medium">{current.route}</p>
            </div>

            {/* Informasi Detail */}
            <div className="mt-4 bg-white/10 p-3 rounded-xl border border-white/10 text-left">
              <p className="text-[10px] text-pink-300 font-bold uppercase">Detail Jadwal:</p>
              <p className="text-xs text-white font-semibold mt-0.5">{current.time}</p>
              <p className="text-[11px] text-neutral-300 mt-0.5">{current.vehicle}</p>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20">
              <RefreshCw className="w-3 h-3 animate-spin" /> QR Code Aktif & Siap Discan Operator Pos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}