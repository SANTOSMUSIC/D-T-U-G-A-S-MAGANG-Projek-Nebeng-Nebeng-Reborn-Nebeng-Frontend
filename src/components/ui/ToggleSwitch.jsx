// Saklar toggle kecil dipakai berulang untuk 2FA & preferensi notifikasi.
// Dipindah ke components/ui supaya bisa dipakai bareng oleh MitraProfile
// (Profil Saya) dan MitraAccountSettings (Pengaturan Akun) tanpa duplikasi,
// setelah kedua halaman itu dipisah dari satu file MitraProfile.jsx lama.
export default function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition shrink-0 ${
        checked ? 'bg-[#4B2172]' : 'bg-neutral-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}