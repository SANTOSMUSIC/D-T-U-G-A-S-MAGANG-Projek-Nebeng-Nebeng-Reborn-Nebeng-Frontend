import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, AlertTriangle } from 'lucide-react';

const SCANNER_ELEMENT_ID = 'nebeng-qr-reader';

/**
 * Modal pemindai QR berbasis kamera perangkat (pakai library `html5-qrcode`).
 *
 * Sebelumnya kotak "kamera" di halaman scanner cuma ikon statis — QR harus
 * diketik manual. Komponen ini menyalakan kamera sungguhan dan otomatis
 * memanggil `onResult(decodedText)` begitu QR terbaca. Kalau kamera tidak
 * tersedia/izin ditolak, tampilkan pesan error dan biarkan user menutup
 * modal lalu memakai input manual sebagai fallback (input manual tetap ada
 * di form utama, tidak dihapus).
 */
export default function QrScannerModal({ label, onResult, onClose }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    let isDone = false;
    const html5Qrcode = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = html5Qrcode;

    html5Qrcode
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          if (isDone) return;
          isDone = true;
          html5Qrcode
            .stop()
            .catch(() => {})
            .finally(() => onResult(decodedText));
        },
        () => {
          // Dipanggil setiap frame yang belum berhasil decode — bukan error fatal, sengaja diabaikan.
        }
      )
      .then(() => {
        if (!isDone) setIsStarting(false);
      })
      .catch(() => {
        if (isDone) return;
        setIsStarting(false);
        setError(
          'Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan pada browser, atau tutup jendela ini dan gunakan input manual.'
        );
      });

    return () => {
      isDone = true;
      const instance = scannerRef.current;
      if (instance) {
        instance
          .stop()
          .catch(() => {})
          .finally(() => {
            instance.clear().catch(() => {});
          });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hanya perlu start sekali saat modal dibuka
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-neutral-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold text-neutral-900">{label}</h3>
          <button
            onClick={onClose}
            aria-label="Tutup pemindai"
            className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center hover:bg-neutral-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div
              id={SCANNER_ELEMENT_ID}
              className="w-full rounded-2xl overflow-hidden bg-neutral-900 min-h-[220px]"
            />
            <p className="text-[11px] text-neutral-500 text-center mt-3">
              {isStarting ? 'Mengaktifkan kamera...' : 'Arahkan kamera ke QR Code hingga terbaca otomatis.'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
