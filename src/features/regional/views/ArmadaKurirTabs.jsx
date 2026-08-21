import React, { useState } from 'react';
import ArmadaPage from './ArmadaPage';
import KurirPage from './KurirPage';

export default function ArmadaKurirTabs() {
  const [subTab, setSubTab] = useState('armada');
  return (
    <div>
      <div className="px-8 pt-6 bg-[#f8f9fa] flex gap-3">
        <button
          onClick={() => setSubTab('armada')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${subTab === 'armada' ? 'bg-purple-700 text-white shadow-sm' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'}`}
        >
          Data Armada Kendaraan
        </button>
        <button
          onClick={() => setSubTab('kurir')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${subTab === 'kurir' ? 'bg-purple-700 text-white shadow-sm' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'}`}
        >
          Data Kurir & Driver
        </button>
      </div>
      {subTab === 'armada' ? <ArmadaPage /> : <KurirPage />}
    </div>
  );
}
