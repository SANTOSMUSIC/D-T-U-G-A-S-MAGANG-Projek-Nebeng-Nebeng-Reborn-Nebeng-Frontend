import React, { useState } from 'react';
import { 
  DollarSign, 
  Settings, 
  Bike, 
  Car, 
  Percent, 
  Save, 
  Info, 
  Layers, 
  Scale, 
  Package,
  CheckCircle2
} from 'lucide-react';

export default function PricingPolicyManagement() {
  // State untuk Tarif Dasar Transportasi
  const [transportPricing, setTransportPricing] = useState({
    motorPerKm: 2500,
    carPerKm: 5000,
    motorBaseFare: 5000,
    carBaseFare: 10000
  });

  // State untuk Komisi Aplikasi (Platform Fee %)
  const [platformFee, setPlatformFee] = useState({
    rideFeePercent: 15,
    parcelFeePercent: 12
  });

  // State untuk Matriks Biaya Pengiriman Paket (Ukuran XXS - XL & Berat per KG)
  const [parcelMatrix, setParcelMatrix] = useState([
    { size: "XXS", maxWeight: "1 KG", baseRate: 6000, description: "Dokumen / Kunci / Flashdisk" },
    { size: "XS", maxWeight: "3 KG", baseRate: 10000, description: "Kotak Kecil / Kosmetik" },
    { size: "S", maxWeight: "5 KG", baseRate: 15000, description: "Tas Kecil / Sepatu" },
    { size: "M", maxWeight: "10 KG", baseRate: 25000, description: "Kardus Sedang / Helm" },
    { size: "L", maxWeight: "20 KG", baseRate: 40000, description: "Kardus Besar / Galon Air" },
    { size: "XL", maxWeight: "> 20 KG", baseRate: 70000, description: "Barang Besar / Elektronik Rumah Tangga" }
  ]);

  const [notification, setNotification] = useState(false);

  // Handle Save All Settings
  const handleSaveAll = (e) => {
    e.preventDefault();
    setNotification(true);
    setTimeout(() => {
      setNotification(false);
    }, 3000);
  };

  // Handle perubahan matriks paket
  const handleMatrixChange = (index, field, value) => {
    const updated = [...parcelMatrix];
    updated[index][field] = value;
    setParcelMatrix(updated);
  };

  return (
    <div className="p-8 pt-10 space-y-8 bg-[#f8f9fa] min-h-screen">
      {/* Header Halaman */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-700">
              GLOBAL PRICING POLICY & COMMISSION SETTINGS
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">Konfigurasi Tarif Global & Komisi</h1>
          <p className="text-xs text-gray-500 mt-0.5">Atur tarif dasar perjalanan, matriks logistik paket, serta potongan komisi platform aplikasi.</p>
        </div>
        
        <button 
          onClick={handleSaveAll}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold px-6 py-3 rounded-2xl transition flex items-center gap-2 shadow-sm shadow-purple-200 cursor-pointer"
        >
          <Save size={16} />
          Simpan Semua Kebijakan Tarif
        </button>
      </div>

      {/* Notifikasi Sukses */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>Kebijakan tarif global dan persentase komisi berhasil diperbarui dan disinkronkan ke seluruh sistem regional!</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-8">
        
        {/* BAGIAN 1: Tarif Dasar Perjalanan (Motor & Mobil) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl">
              <Car size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900">1. Tarif Dasar Perjalanan (Nebeng Motor & Mobil)</h2>
              <p className="text-[11px] text-gray-400">Pengaturan tarif per kilometer dan tarif buka pintu awal layanan transportasi.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nebeng Motor */}
            <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex items-center gap-2 text-purple-700 font-extrabold text-xs">
                <Bike size={16} />
                <span>NEBENG MOTOR</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-600 mb-1">
                    Tarif Dasar / Buka Pintu (Rp)
                  </label>
                  <input 
                    type="number"
                    value={transportPricing.motorBaseFare}
                    onChange={(e) => setTransportPricing({...transportPricing, motorBaseFare: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-600 mb-1">
                    Tarif Per Kilometer / KM (Rp)
                  </label>
                  <input 
                    type="number"
                    value={transportPricing.motorPerKm}
                    onChange={(e) => setTransportPricing({...transportPricing, motorPerKm: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Nebeng Mobil */}
            <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex items-center gap-2 text-purple-700 font-extrabold text-xs">
                <Car size={16} />
                <span>NEBENG MOBIL</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-600 mb-1">
                    Tarif Dasar / Buka Pintu (Rp)
                  </label>
                  <input 
                    type="number"
                    value={transportPricing.carBaseFare}
                    onChange={(e) => setTransportPricing({...transportPricing, carBaseFare: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-600 mb-1">
                    Tarif Per Kilometer / KM (Rp)
                  </label>
                  <input 
                    type="number"
                    value={transportPricing.carPerKm}
                    onChange={(e) => setTransportPricing({...transportPricing, carPerKm: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN 2: Matriks Biaya Pengiriman Paket (Berat & Ukuran XXS - XL) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900">2. Matriks Biaya Pengiriman Paket (Berdasarkan Berat & Ukuran XXS - XL)</h2>
              <p className="text-[11px] text-gray-400">Atur tarif dasar pengiriman logistik berdasarkan kategori ukuran dimensi dan batas berat maksimum (KG).</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-wider font-extrabold">
                  <th className="py-3 px-4">Kategori Ukuran</th>
                  <th className="py-3 px-4">Batas Berat Maksimum (KG)</th>
                  <th className="py-3 px-4">Deskripsi Jenis Barang</th>
                  <th className="py-3 px-4">Tarif Dasar Pengiriman (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-bold text-gray-800">
                {parcelMatrix.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-xl font-black font-mono">
                        {item.size}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Scale size={14} className="text-gray-400" />
                        {item.maxWeight}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-normal">
                      {item.description}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">Rp</span>
                        <input 
                          type="number"
                          value={item.baseRate}
                          onChange={(e) => handleMatrixChange(index, 'baseRate', e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-36 font-bold text-gray-900 focus:outline-none focus:border-purple-500 transition"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BAGIAN 3: Persentase Potongan Komisi Aplikasi (Platform Fee %) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl">
              <Percent size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900">3. Persentase Komisi Aplikasi (Platform Fee %)</h2>
              <p className="text-[11px] text-gray-400">Tentukan persentase potongan pendapatan aplikasi dari setiap transaksi yang masuk.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 space-y-3">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                Komisi Platform Layanan Transportasi (Ride Fee %)
              </label>
              <div className="relative">
                <input 
                  type="number"
                  value={platformFee.rideFeePercent}
                  onChange={(e) => setPlatformFee({...platformFee, rideFeePercent: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-sm font-black text-gray-900 focus:outline-none focus:border-purple-500 transition"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
              </div>
              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                <Info size={12} /> Dipotong langsung dari total tarif perjalanan driver.
              </p>
            </div>

            <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 space-y-3">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                Komisi Platform Layanan Pengiriman Paket (Parcel Fee %)
              </label>
              <div className="relative">
                <input 
                  type="number"
                  value={platformFee.parcelFeePercent}
                  onChange={(e) => setPlatformFee({...platformFee, parcelFeePercent: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-sm font-black text-gray-900 focus:outline-none focus:border-purple-500 transition"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
              </div>
              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                <Info size={12} /> Dipotong langsung dari total tarif ongkir kurir/logistik.
              </p>
            </div>
          </div>
        </div>

        {/* Tombol Simpan Bagian Bawah */}
        <div className="flex justify-end pt-2">
          <button 
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold px-8 py-4 rounded-2xl transition flex items-center gap-2 shadow-sm shadow-purple-200 cursor-pointer"
          >
            <Save size={16} />
            Simpan Semua Kebijakan Tarif Global
          </button>
        </div>

      </form>
    </div>
  );
}