import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-sm'
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-150 font-['Inter']"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl p-5 sm:p-6 w-full ${maxWidth} shadow-xl border border-neutral-200 space-y-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || subtitle) && (
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              {title && <h3 className="text-[14px] font-bold text-neutral-800">{title}</h3>}
              {subtitle && <p className="text-[9px] text-neutral-400 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Tutup Modal"
              className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center hover:bg-neutral-200 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div className="text-[10px]">{children}</div>
      </div>
    </div>
  );
}