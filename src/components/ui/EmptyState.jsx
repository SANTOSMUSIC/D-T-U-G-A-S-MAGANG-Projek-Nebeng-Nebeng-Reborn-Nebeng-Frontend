import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Tampilan standar untuk list/tabel yang datanya kosong.
 * Dipakai di dalam <tbody> (colSpan penuh) atau berdiri sendiri.
 *
 * Contoh pakai di dalam tabel:
 *   {items.length === 0 ? (
 *     <tr><td colSpan={4}><EmptyState title="Belum ada data" /></td></tr>
 *   ) : (
 *     items.map(...)
 *   )}
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Belum ada data',
  description = 'Data akan muncul di sini setelah tersedia.',
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-300 flex items-center justify-center mb-4 border border-gray-100">
        <Icon size={22} />
      </div>
      <p className="text-sm font-bold text-gray-700">{title}</p>
      <p className="text-xs text-gray-400 mt-1 max-w-xs">{description}</p>
    </div>
  );
}
