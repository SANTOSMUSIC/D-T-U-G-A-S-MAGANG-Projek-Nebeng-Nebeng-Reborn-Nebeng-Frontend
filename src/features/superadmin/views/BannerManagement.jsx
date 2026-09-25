import { BASE_URL } from '../../../config/env';
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import { bannerService } from '../../../services/bannerService';
import BaseModal from '../../../components/ui/BaseModal';
import { useToast } from '../../../context/ToastContext';

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    targetRole: '',
    isActive: true,
  });

  const loadBanners = async () => {
    setIsLoading(true);
    try {
      const data = await bannerService.getBanners();
      setBanners(data);
    } catch (error) {
      toast.error('Gagal memuat banner');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl || '',
        targetRole: banner.targetRole || '',
        isActive: banner.isActive,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        imageUrl: '',
        linkUrl: '',
        targetRole: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await bannerService.uploadBannerImage(file);
      const baseUrl = import.meta.env.VITE_API_BASE_URL 
        ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') 
        : BASE_URL;
      setFormData({ ...formData, imageUrl: `${baseUrl}${result.filePath}` });
      toast.success('Gambar berhasil diunggah');
    } catch (error) {
      toast.error('Gagal mengunggah gambar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      toast.error('URL gambar wajib diisi');
      return;
    }
    try {
      const payload = {
        title: formData.title,
        imageUrl: formData.imageUrl,
        linkUrl: formData.linkUrl || undefined,
        targetRole: formData.targetRole || null,
        isActive: formData.isActive,
      };

      if (editingBanner) {
        await bannerService.updateBanner(editingBanner.id, payload);
        toast.success('Banner berhasil diperbarui');
      } else {
        await bannerService.createBanner(payload);
        toast.success('Banner berhasil dibuat');
      }
      setIsModalOpen(false);
      loadBanners();
    } catch (error) {
      toast.error('Gagal menyimpan banner');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus banner ini?')) return;
    try {
      await bannerService.deleteBanner(id);
      toast.success('Banner dihapus');
      loadBanners();
    } catch (error) {
      toast.error('Gagal menghapus banner');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Manajemen Banner</h1>
          <p className="text-sm text-neutral-500">Kelola banner iklan di dashboard pengguna.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#10367D] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#0C2C66] transition"
        >
          <Plus size={16} /> Tambah Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-neutral-500">Memuat...</p>
        ) : banners.length === 0 ? (
          <p className="text-neutral-500">Belum ada banner.</p>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col">
              <div className="h-40 bg-neutral-100 flex items-center justify-center relative overflow-hidden group">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleOpenModal(banner)}
                    className="p-2 bg-white rounded-full text-blue-600 hover:scale-110 transition"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 bg-white rounded-full text-rose-600 hover:scale-110 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-neutral-800 truncate">{banner.title}</h3>
                <div className="flex justify-between items-center text-xs">
                  <span className={`px-2 py-1 rounded-full font-bold ${banner.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-200 text-neutral-600'}`}>
                    {banner.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                    Target: {banner.targetRole ? banner.targetRole : 'Semua'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? 'Edit Banner' : 'Tambah Banner Baru'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Judul Banner</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm"
              placeholder="Contoh: Promo Lebaran"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Gambar Banner</label>
            <div className="flex flex-col gap-2">
              {formData.imageUrl && (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 flex items-center justify-center">
                  <img src={formData.imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="flex-1 p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm"
                  placeholder="https://example.com/image.jpg atau Upload"
                />
                
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 bg-[#10367D] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#0C2C66] transition disabled:opacity-50"
                >
                  {isUploading ? '...' : <Upload size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Link URL (Opsional)</label>
            <input
              type="url"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm"
              placeholder="https://example.com/promo"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Target Pengguna</label>
              <select
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm"
              >
                <option value="">Semua (Publik)</option>
                <option value="customer">Customer</option>
                <option value="mitra">Mitra</option>
                <option value="operator">Operator</option>
              </select>
            </div>
            <div className="flex items-center justify-end">
              <label className="flex items-center gap-2 cursor-pointer mt-5">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#10367D] rounded"
                />
                <span className="text-sm font-bold text-neutral-700">Aktifkan Banner</span>
              </label>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-sm font-bold hover:bg-neutral-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-[#10367D] text-white rounded-xl text-sm font-bold hover:bg-[#0C2C66] disabled:opacity-50"
            >
              Simpan
            </button>
          </div>
        </form>
      </BaseModal>
    </div>
  );
}
