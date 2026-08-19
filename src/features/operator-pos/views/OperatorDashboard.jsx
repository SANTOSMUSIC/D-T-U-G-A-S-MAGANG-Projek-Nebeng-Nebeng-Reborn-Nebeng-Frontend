import React, { useState } from 'react';
import { Calendar, ArrowDownLeft, ArrowUpRight, MapPin, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

export default function OperatorDashboard() {
  const [tripsSchedule, setTripsSchedule] = useState([
    {
      id: 'TRIP-9081',
      type: 'Masuk',
      partnerName: 'Budi Santoso',
      service: 'Ride / Transportasi',
      plateNumber: 'AD 1234 XY',
      time: '09:30 WIB',
      status: 'Tiba di Pos',
      notes: 'Penjemputan penumpang reguler Solo Grand Mall.'
    },
    {
      id: 'TRIP-9082',
      type: 'Keluar',
      partnerName: 'Siti Aminah',
      service: 'Kurir / Food',
      plateNumber: 'AD 5678 AB',
      time: '10:15 WIB',
      status: 'Menunggu Keberangkatan',
      notes: 'Pengiriman paket makanan kuliner Solo.'
    },
    {
      id: 'TRIP-9085',
      type: 'Masuk',
      partnerName: 'Joko Widodo',
      service: 'Kurir / Logistik',
      plateNumber: 'H 9876 CD',
      time: '11:00 WIB',
      status: 'Dalam Perjalanan ke Pos',
      notes: 'Transit paket logistik regional Jateng.'
    }
  ]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-8">
      {/* Header Informasi Pos & Tanggal */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#c91882] font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5" /> Pos Mitra Solo Grand Mall | Shift Pagi
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Dashboard Operasional Pos</h1>
          <p className="text-neutral-400 text-xs mt-0.5">Pantau jadwal trip mitra yang masuk dan keluar di pos Anda hari ini.</p>
        </div>

        <div className="flex items-center gap-3 bg-neutral-50 px-4 py-3 rounded-2xl border border-neutral-200">
          <Calendar className="w-4 h-4 text-[#c91882]" />
          <span className="text-xs font-bold text-neutral-700">19 Agu 2026</span>
        </div>
      </div>

      {/* Ringkasan Metrik Kartu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1">Total Trip Masuk Pos</p>
            <h3 className="text-2xl font-extrabold text-neutral-900">2 Trip</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full mt-2">
              <ArrowDownLeft className="w-3 h-3" /> Jadwal aktif hari ini
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#c91882] flex items-center justify-center">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1">Total Trip Keluar Pos</p>
            <h3 className="text-2xl font-extrabold text-neutral-900">1 Trip</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full mt-2">
              <ArrowUpRight className="w-3 h-3" /> Siap diberangkatkan
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1">Status Operasional Pos</p>
            <h3 className="text-xl font-extrabold text-emerald-600">Buka / Normal</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mt-2">
              <ShieldCheck className="w-3 h-3" /> Sistem Terverifikasi
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabel Jadwal Trip Masuk & Keluar Hari Ini */}
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-extrabold text-neutral-900">Jadwal Trip Mitra Masuk & Keluar Hari Ini</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Daftar perjalanan yang dijadwalkan melintasi atau berpusat di pos Anda.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-400 font-extrabold uppercase tracking-wider">
                <th className="py-4 px-3">ID TRIP & WAKTU</th>
                <th className="py-4 px-3">TIPE ARAH</th>
                <th className="py-4 px-3">MITRA & KENDARAAN</th>
                <th className="py-4 px-3">LAYANAN</th>
                <th className="py-4 px-3">STATUS</th>
                <th className="py-4 px-3 text-right">AKSI / KETERANGAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 text-neutral-700 font-medium">
              {tripsSchedule.map((trip) => (
                <tr key={trip.id} className="hover:bg-neutral-50/60 transition group">
                  <td className="py-4 px-3">
                    <p className="font-extrabold text-neutral-900 group-hover:text-[#c91882] transition">{trip.id}</p>
                    <p className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {trip.time}
                    </p>
                  </td>
                  <td className="py-4 px-3">
                    {trip.type === 'Masuk' ? (
                      <span className="inline-flex items-center gap-1 bg-pink-50 text-[#c91882] font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                        <ArrowDownLeft className="w-3 h-3" /> Masuk Pos
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                        <ArrowUpRight className="w-3 h-3" /> Keluar Pos
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-3">
                    <p className="font-bold text-neutral-800">{trip.partnerName}</p>
                    <p className="text-[10px] text-neutral-400 font-semibold">{trip.plateNumber}</p>
                  </td>
                  <td className="py-4 px-3 font-semibold text-neutral-600">{trip.service}</td>
                  <td className="py-4 px-3">
                    <span className="font-extrabold text-neutral-800 bg-neutral-100 px-2.5 py-1 rounded-full text-[10px]">
                      {trip.status}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <span className="text-[11px] text-neutral-500 italic">{trip.notes}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}