import React from 'react';
import { FileText, DollarSign, Printer, ArrowUpRight } from 'lucide-react';

export default function OperatorFinancial() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5" /> Rekapitulasi Kas & Pendapatan Pos
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Laporan Finansial Pos</h1>
          <p className="text-neutral-400 text-xs mt-0.5">Kelola setoran tunai harian dan pantau pendapatan total pos Anda.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-purple-700/20 cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Cetak Laporan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1">Total Pendapatan Pos</p>
            <h3 className="text-2xl font-extrabold text-neutral-900">Rp 155.000</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1">Setoran Kas ke Regional (15%)</p>
            <h3 className="text-2xl font-extrabold text-emerald-600">Rp 23.250</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}