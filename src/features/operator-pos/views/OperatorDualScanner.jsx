import React, { useState } from 'react';
import { QrCode, Camera, ArrowRightLeft, CheckCircle2, ShieldCheck, Lock, Unlock } from 'lucide-react';

export default function OperatorDualScanner() {
  const [scanMode, setScanMode] = useState('origin'); // 'origin' (Scan 1) atau 'destination' (Scan 2)
  
  // State Input Form Simulasi Scanner
  const [tripQr, setTripQr] = useState('');
  const [ticketQr, setTicketQr] = useState('');
  
  // Riwayat Scan
  const [scanHistory, setScanHistory] = useState([
    { id: 'LOG-881', type: 'Scan 2 (Destination)', trip: 'TRIP-9081', ticket: 'PKG-44910', status: 'ARRIVED_DESTINATION & Escrow Released', time: '11:30 WIB' },
    { id: 'LOG-880', type: 'Scan 1 (Origin)', trip: 'TRIP-9082', ticket: 'PKG-44911', status: 'IN_TRANSIT', time: '10:00 WIB' }
  ]);

  const handleProcessScan = (e) => {
    e.preventDefault();
    if (!tripQr || !ticketQr) {
      alert('Mohon pastikan QR Trip Mitra dan QR Tiket/Paket Customer telah terisi!');
      return;
    }

    if (scanMode === 'origin') {
      const newLog = {
        id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
        type: 'Scan 1 (Origin)',
        trip: tripQr,
        ticket: ticketQr,
        status: 'IN_TRANSIT (Berangkat)',
        time: 'Baru saja'
      };
      setScanHistory([newLog, ...scanHistory]);
      alert('Scan 1 Berhasil! Status trip diperbarui menjadi IN_TRANSIT.');
    } else {
      const newLog = {
        id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
        type: 'Scan 2 (Destination)',
        trip: tripQr,
        ticket: ticketQr,
        status: 'ARRIVED_DESTINATION & Escrow Released',
        time: 'Baru saja'
      };
      setScanHistory([newLog, ...scanHistory]);
      alert('Scan 2 Berhasil! Status ARRIVED_DESTINATION tercatat & Dana Escrow berhasil dilepaskan.');
    }

    setTripQr('');
    setTicketQr('');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-8">
      {/* Header Halaman */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#c91882] font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <QrCode className="w-3.5 h-3.5" /> Sistem Keamanan Pos & Escrow
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Dual QR Code Scanner</h1>
          <p className="text-neutral-400 text-xs mt-0.5">Pemindai kamera pos untuk validasi berurutan (Origin & Destination Check-in).</p>
        </div>

        {/* Tab Pemilih Mode Scan */}
        <div className="flex bg-neutral-100 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setScanMode('origin')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              scanMode === 'origin' ? 'bg-[#c91882] text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Scan 1 (Origin / Asal)
          </button>
          <button
            onClick={() => setScanMode('destination')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              scanMode === 'destination' ? 'bg-[#c91882] text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Scan 2 (Destination / Tujuan)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Area Simulasi Kamera & Form Input QR */}
        <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-neutral-900">
              {scanMode === 'origin' ? 'Check-in Pos Asal (Scan 1)' : 'Check-in Pos Tujuan (Scan 2)'}
            </h2>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${scanMode === 'origin' ? 'bg-pink-50 text-[#c91882]' : 'bg-blue-50 text-blue-700'}`}>
              {scanMode === 'origin' ? 'Triggers: IN_TRANSIT' : 'Triggers: Escrow Release'}
            </span>
          </div>

          {/* Kotak Simulasi Kamera */}
          <div className="relative w-full h-48 bg-neutral-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-white mb-4 border-2 border-dashed border-neutral-700">
            <Camera className="w-10 h-10 text-neutral-400 mb-2 animate-pulse" />
            <p className="text-xs font-bold text-neutral-300">Kamera Pemindai Aktif</p>
            <p className="text-[10px] text-neutral-400 mt-1">Arahkan kamera ke QR Code Trip & Paket</p>
            <div className="absolute inset-x-8 top-1/2 border-t-2 border-[#c91882]/80"></div>
          </div>

          <form onSubmit={handleProcessScan} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-600 mb-1">QR CODE TRIP MITRA</label>
              <input 
                type="text" 
                required
                placeholder="cth: TRIP-9081"
                value={tripQr}
                onChange={(e) => setTripQr(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#c91882] font-mono font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-600 mb-1">QR TIKET / PAKET CUSTOMER</label>
              <input 
                type="text" 
                required
                placeholder="cth: PKG-44910"
                value={ticketQr}
                onChange={(e) => setTicketQr(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#c91882] font-mono font-medium"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-[#c91882] hover:bg-[#b51474] text-white font-bold rounded-xl shadow-lg shadow-[#c91882]/25 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {scanMode === 'origin' ? <ArrowRightLeft className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              <span>{scanMode === 'origin' ? 'Proses Scan 1 (Set In-Transit)' : 'Proses Scan 2 (Release Escrow)'}</span>
            </button>
          </form>
        </div>

        {/* Tabel Riwayat Dual Scan */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-extrabold text-neutral-900">Riwayat Log Dual Scan Pos</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Catatan seluruh pemindaian trip masuk dan keluar di pos hari ini.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-3">LOG ID & WAKTU</th>
                  <th className="py-4 px-3">TIPE SCAN</th>
                  <th className="py-4 px-3">QR TRIP</th>
                  <th className="py-4 px-3">QR TIKET/PAKET</th>
                  <th className="py-4 px-3">STATUS & ESCROW</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 text-neutral-700 font-medium">
                {scanHistory.map((log) => {
                  const isScan2 = log.type.includes('Scan 2');
                  return (
                    <tr key={log.id} className="hover:bg-neutral-50/60 transition">
                      <td className="py-4 px-3">
                        <p className="font-extrabold text-neutral-900">{log.id}</p>
                        <p className="text-[10px] text-neutral-400 font-semibold">{log.time}</p>
                      </td>
                      <td className="py-4 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${isScan2 ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-[#c91882]'}`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-4 px-3 font-mono font-bold text-neutral-800">{log.trip}</td>
                      <td className="py-4 px-3 font-mono font-bold text-neutral-800">{log.ticket}</td>
                      <td className="py-4 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-fit ${isScan2 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {isScan2 ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}