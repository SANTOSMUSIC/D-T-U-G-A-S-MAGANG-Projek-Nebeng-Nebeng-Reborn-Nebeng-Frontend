import React, { useEffect, useState } from 'react';
import { bannerService } from '../../services/bannerService';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const BannerSlider = ({ role }) => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await bannerService.getBanners(role);
        setBanners(data);
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, [role]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  if (loading || banners.length === 0) return null;

  return (
    <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-6 group bg-gray-100">
      {banners.map((banner, index) => (
        <a
          key={banner.id}
          href={banner.linkUrl || '#'}
          target={banner.linkUrl ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          onClick={(e) => !banner.linkUrl && e.preventDefault()}
        >
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
        </a>
      ))}

      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-1.5 md:p-2 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-1.5 md:p-2 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
