import { useState } from 'react';
import FleetCourierPage from './ArmadaPage';
import KurirPage from './KurirPage';

export default function ArmadaKurirTabs() {
  const [subTab, setSubTab] = useState('armada');

  return (
    <div className="font-['Inter']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex items-center gap-2">
        <button
          onClick={() => setSubTab('armada')}
          className={`px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold transition cursor-pointer ${
            subTab === 'armada'
              ? 'bg-[#4B2172] text-white shadow-sm'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          Data Armada Kendaraan
        </button>
        <button
          onClick={() => setSubTab('kurir')}
          className={`px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold transition cursor-pointer ${
            subTab === 'kurir'
              ? 'bg-[#4B2172] text-white shadow-sm'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          Data Kurir & Driver
        </button>
      </div>

      {subTab === 'armada' ? <FleetCourierPage /> : <KurirPage />}
    </div>
  );
}