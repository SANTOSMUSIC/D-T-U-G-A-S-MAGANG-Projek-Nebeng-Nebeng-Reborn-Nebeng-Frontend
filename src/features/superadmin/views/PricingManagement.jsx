import { useState } from 'react';
import { 
  Bike, 
  Car, 
  Percent, 
  Save, 
  Scale, 
  Package,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { updatePlatformCommission, updateRewardSetting } from '../../../services/pricingService';

export default function PricingPolicyManagement() {
  const [transportPricing, setTransportPricing] = useState({
    motorPerKm: 2500,
    carPerKm: 5000,
    motorBaseFare: 5000,
    carBaseFare: 10000
  });

  const [platformFee, setPlatformFee] = useState({
    rideFeePercent: 15,
    parcelFeePercent: 12
  });

  // Matriks paket disesuaikan dengan batas berat (maxWeightNum) agar bisa dikonfigurasi dan disimpan
  const [parcelMatrix, setParcelMatrix] = useState([
    { size: "XXS", maxWeightNum: 1, baseRate: 6000, description: "Dokumen / Kunci / Flashdisk" },
    { size: "XS", maxWeightNum: 3, baseRate: 10000, description: "Kotak Kecil / Kosmetik" },
    { size: "S", maxWeightNum: 5, baseRate: 15000, description: "Tas Kecil / Sepatu" },
    { size: "M", maxWeightNum: 10, baseRate: 25000, description: "Kardus Sedang / Helm" },
    { size: "L", maxWeightNum: 20, baseRate: 40000, description: "Kardus Besar / Galon Air" },
    { size: "XL", maxWeightNum: 25, baseRate: 70000, description: "Barang Besar / Elektronik" }
  ]);

  const [notification, setNotification] = useState(false);
  const [formErrors, setFormErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MIN_FARE = 0;
  const MAX_FARE = 1000000;
  const MIN_FEE_PERCENT = 0;
  const MAX_FEE_PERCENT = 50;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const handleFareChange = (field) => (e) => {
    const raw = e.target.value;
    if (raw === '') {
      setTransportPricing(prev => ({ ...prev, [field]: '' }));
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) return;
    setTransportPricing(prev => ({ ...prev, [field]: clamp(num, MIN_FARE, MAX_FARE) }));
  };

  const handleFeeChange = (field) => (e) => {
    const raw = e.target.value;
    if (raw === '') {
      setPlatformFee(prev => ({ ...prev, [field]: '' }));
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) return;
    setPlatformFee(prev => ({ ...prev, [field]: clamp(num, MIN_FEE_PERCENT, MAX_FEE_PERCENT) }));
  };

  const handleMatrixChange = (index, field, value) => {
    if (value === '') {
      const updated = [...parcelMatrix];
      updated[index] = { ...updated[index], [field]: '' };
      setParcelMatrix(updated);
      return;
    }
    const num = Number(value);
    if (Number.isNaN(num)) return;
    const updated = [...parcelMatrix];
    updated[index] = { ...updated[index], [field]: clamp(num, MIN_FARE, MAX_FARE) };
    setParcelMatrix(updated);
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    const errors = [];
    Object.entries(transportPricing).forEach(([key, value]) => {
      if (value === '' || Number.isNaN(Number(value)) || Number(value) < MIN_FARE) {
        errors.push(`Nilai tarif "${key}" tidak valid.`);
      }
    });
    Object.entries(platformFee).forEach(([key, value]) => {
      if (value === '' || Number.isNaN(Number(value)) || Number(value) < MIN_FEE_PERCENT || Number(value) > MAX_FEE_PERCENT) {
        errors.push(`Komisi "${key}" harus di antara ${MIN_FEE_PERCENT}% - ${MAX_FEE_PERCENT}%.`);
      }
    });

    if (errors.length > 0) {
      setFormErrors(errors);
      setNotification(false);
      return;
    }

    setFormErrors([]);
    setIsSubmitting(true);

    try {
      // 1. Update komisi global platform ke backend NestJS
      await updatePlatformCommission(Number(platformFee.rideFeePercent));
      
      // 2. Sinkronkan bobot/tarif barang dengan fungsi update reward/fare per kg backend
      const avgBaseRate = parcelMatrix.length > 0 ? parcelMatrix[0].baseRate : 6000;
      await updateRewardSetting(Number(avgBaseRate));

      setNotification(true);
      setTimeout(() => setNotification(false), 3000);
    } catch (err) {
      console.error('Gagal menyimpan kebijakan tarif:', err);
      setFormErrors([err.response?.data?.message || 'Terjadi kesalahan saat menyimpan ke database.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172]">
              GLOBAL PRICING POLICY & COMMISSION SETTINGS
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">Konfigurasi Tarif Global & Komisi</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">Atur tarif dasar perjalanan, matriks logistik paket berdasarkan batas berat, serta potongan komisi.</p>
        </div>
        
        <button 
          type="button"
          onClick={handleSaveAll}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-[#4B2172] hover:bg-[#3b195a] text-white rounded-full text-[10px] sm:text-[11px] font-bold transition cursor-pointer shadow-sm shrink-0 disabled:opacity-50"
        >
          <Save size={14} />
          <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Kebijakan Tarif'}</span>
        </button>
      </div>

      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-[10px] font-bold">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Kebijakan tarif global dan matriks berat paket berhasil disinkronkan ke database!</span>
        </div>
      )}

      {formErrors.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-rose-800 text-[10px] font-bold">
          <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="mb-0.5">Gagal menyimpan, periksa nilai berikut:</p>
            <ul className="list-disc list-inside font-medium text-[9px]">
              {formErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* BAGIAN 1: Tarif Dasar Perjalanan */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
            <div className="p-2 bg-[#4B2172]/10 text-[#4B2172] rounded-xl">
              <Car size={16} />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-neutral-800">1. Tarif Dasar Perjalanan</h2>
              <p className="text-[9px] text-neutral-400">Pengaturan tarif per kilometer dan buka pintu awal.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 space-y-3">
              <div className="flex items-center gap-1.5 text-[#4B2172] font-bold text-[10px]">
                <Bike size={14} /> <span>NEBENG MOTOR</span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-[8px] font-bold uppercase text-neutral-400 mb-1">Tarif Dasar / Buka Pintu (Rp)</label>
                  <input 
                    type="number"
                    value={transportPricing.motorBaseFare}
                    onChange={handleFareChange('motorBaseFare')}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold uppercase text-neutral-400 mb-1">Tarif Per KM (Rp)</label>
                  <input 
                    type="number"
                    value={transportPricing.motorPerKm}
                    onChange={handleFareChange('motorPerKm')}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 space-y-3">
              <div className="flex items-center gap-1.5 text-[#4B2172] font-bold text-[10px]">
                <Car size={14} /> <span>NEBENG MOBIL</span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-[8px] font-bold uppercase text-neutral-400 mb-1">Tarif Dasar / Buka Pintu (Rp)</label>
                  <input 
                    type="number"
                    value={transportPricing.carBaseFare}
                    onChange={handleFareChange('carBaseFare')}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold uppercase text-neutral-400 mb-1">Tarif Per KM (Rp)</label>
                  <input 
                    type="number"
                    value={transportPricing.carPerKm}
                    onChange={handleFareChange('carPerKm')}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN 2: Matriks Biaya Pengiriman Paket Berbasis Batas Berat */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
            <div className="p-2 bg-[#4B2172]/10 text-[#4B2172] rounded-xl">
              <Package size={16} />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-neutral-800">2. Matriks Biaya Pengiriman Paket & Batas Berat</h2>
              <p className="text-[9px] text-neutral-400">Atur batas berat (Kg) dan tarif dasar sesuai kapasitas muatan.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-4">Ukuran</th>
                  <th className="py-2.5 px-4">Batas Berat Maksimum (KG)</th>
                  <th className="py-2.5 px-4">Deskripsi</th>
                  <th className="py-2.5 px-4">Tarif Dasar (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[9px]">
                {parcelMatrix.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 bg-[#4B2172]/10 text-[#4B2172] rounded-md font-bold font-mono">
                        {item.size}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-neutral-700">
                      <div className="flex items-center gap-1.5">
                        <Scale size={11} className="text-neutral-400" />
                        <input 
                          type="number"
                          value={item.maxWeightNum}
                          onChange={(e) => handleMatrixChange(index, 'maxWeightNum', e.target.value)}
                          className="bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-0.5 w-20 font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]"
                        />
                        <span>KG</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-neutral-500">{item.description}</td>
                    <td className="py-2.5 px-4">
                      <input 
                        type="number"
                        value={item.baseRate}
                        onChange={(e) => handleMatrixChange(index, 'baseRate', e.target.value)}
                        className="bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 w-28 font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BAGIAN 3: Persentase Komisi Platform */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
            <div className="p-2 bg-[#4B2172]/10 text-[#4B2172] rounded-xl">
              <Percent size={16} />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-neutral-800">3. Persentase Komisi Platform</h2>
              <p className="text-[9px] text-neutral-400">Potongan komisi aplikasi dari setiap transaksi.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 space-y-2">
              <label className="block text-[9px] font-bold uppercase text-neutral-500">Komisi Transportasi (%)</label>
              <input 
                type="number"
                value={platformFee.rideFeePercent}
                onChange={handleFeeChange('rideFeePercent')}
                className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]"
              />
            </div>
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 space-y-2">
              <label className="block text-[9px] font-bold uppercase text-neutral-500">Komisi Pengiriman Paket (%)</label>
              <input 
                type="number"
                value={platformFee.parcelFeePercent}
                onChange={handleFeeChange('parcelFeePercent')}
                className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}