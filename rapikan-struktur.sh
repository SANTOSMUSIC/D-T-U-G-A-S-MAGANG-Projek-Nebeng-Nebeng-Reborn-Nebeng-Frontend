#!/bin/bash
# Script buat merapikan struktur folder Nebeng-Frontend
# Jalankan dari ROOT project (folder yang ada package.json-nya)
#
# Cara pakai:
#   chmod +x rapikan-struktur.sh
#   ./rapikan-struktur.sh
#
# Pakai `git mv` supaya history file tetap kejaga (bukan delete+create baru).
# Kalau ada file yang gak ketemu, script bakal skip dan kasih warning, bukan error/stop.

set -e

safe_mv() {
  local src="$1"
  local dst="$2"
  if [ -e "$src" ]; then
    mkdir -p "$(dirname "$dst")"
    git mv "$src" "$dst"
    echo "✔ moved: $src -> $dst"
  else
    echo "⚠ skip (not found): $src"
  fi
}

echo "== 1. Pindahin CustomerLayout.jsx keluar dari views/ =="
safe_mv "src/features/customer/views/CustomerLayout.jsx" "src/features/customer/CustomerLayout.jsx"

echo ""
echo "== 2. Bikin folder routes/, pindahin ProtectedRoute.jsx dari components/routing =="
safe_mv "src/components/routing/ProtectedRoute.jsx" "src/routes/ProtectedRoute.jsx"
# Hapus folder routing/ kalau udah kosong
rmdir "src/components/routing" 2>/dev/null && echo "✔ removed empty folder: src/components/routing" || true

echo ""
echo "== 3. Bikin folder constants/ (kosong, siap diisi) =="
# NOTE: utils/ TIDAK dibuat baru karena sudah ada di project (src/utils/) — pakai yang lama.
mkdir -p src/constants
touch src/constants/.gitkeep
echo "✔ created: src/constants/"

echo ""
echo "== 4. Rename asset ke kebab-case konsisten =="
safe_mv "src/assets/AuthIllustration.png" "src/assets/auth-illustration.png"
safe_mv "src/assets/LOGO.png" "src/assets/logo.png"

echo ""
echo "== 5. Hapus App.css (duplikat, isinya cuma @import tailwindcss) =="
if [ -f "src/App.css" ]; then
  git rm "src/App.css"
  echo "✔ removed: src/App.css"
  echo "⚠ JANGAN LUPA hapus manual baris 'import ./App.css' di src/App.jsx"
else
  echo "⚠ skip (not found): src/App.css"
fi

echo ""
echo "== 6. Hapus src/hooks/useMitraData.js (dead code / duplikat) =="
echo "   Terverifikasi via grep: TIDAK ADA import dari path 'hooks/useMitraData'."
echo "   Consumer aktual (MitraBalance.jsx) import useMitraData dari"
echo "   'context/MitraDataContext.jsx' langsung, bukan dari file ini."
if [ -f "src/hooks/useMitraData.js" ]; then
  git rm "src/hooks/useMitraData.js"
  echo "✔ removed: src/hooks/useMitraData.js"
else
  echo "⚠ skip (not found): src/hooks/useMitraData.js"
fi
echo "   NOTE: src/context/mitraDataContextObject.js DIBIARKAN — masih dipakai"
echo "   oleh src/context/MitraDataContext.jsx."

echo ""
echo "== 7. Hapus src/services/pricingPolicyService.js (dead code / duplikat) =="
echo "   Terverifikasi via grep: TIDAK ADA import dari path ini sama sekali."
echo "   Semua fungsinya (updatePricingPolicy, updateRewardPolicy,"
echo "   updateCompletePricingPolicy) adalah duplikat dari pricingService.js"
echo "   yang endpoint-nya sama / persis identik."
if [ -f "src/services/pricingPolicyService.js" ]; then
  git rm "src/services/pricingPolicyService.js"
  echo "✔ removed: src/services/pricingPolicyService.js"
else
  echo "⚠ skip (not found): src/services/pricingPolicyService.js"
fi
echo "   pricingService.js DIBIARKAN sebagai acuan tunggal (paling lengkap)."

echo ""
echo "== 8. Pindahin src/services/mitraPricing.js -> src/utils/fareEstimator.js =="
echo "   (bukan service API call, cuma tabel tarif statis sisi client —"
echo "   jadi tempatnya di utils/, bukan services/)"
safe_mv "src/services/mitraPricing.js" "src/utils/fareEstimator.js"

echo ""
echo "=================================================="
echo "SELESAI perpindahan file. Langkah manual berikutnya"
echo "(TIDAK di-otomatisasi karena butuh review isi kode):"
echo "=================================================="
echo ""
echo "1) Update semua import path yang kena imbas rename/move di atas:"
echo "   - import CustomerLayout dari 'features/customer/views/CustomerLayout'"
echo "     -> 'features/customer/CustomerLayout'"
echo "   - import ProtectedRoute dari 'components/routing/ProtectedRoute'"
echo "     -> 'routes/ProtectedRoute'"
echo "   - import AuthIllustration.png / LOGO.png -> path baru (huruf kecil)"
echo "   Tips cepat cari semua pemakaian lama:"
echo "     grep -rn \"components/routing\" src/"
echo "     grep -rn \"views/CustomerLayout\" src/"
echo "     grep -rn \"AuthIllustration.png\\|LOGO.png\" src/"
echo ""
echo "2) Fix 2 import path yang kena imbas pemindahan mitraPricing.js:"
echo "   - src/context/MitraDataContext.jsx (baris 2)"
echo "   - src/features/mitra/views/MitraTripManagement.jsx (baris 17)"
echo "   Ganti:"
echo "     import { estimateFare } from '.../services/mitraPricing'"
echo "   Jadi:"
echo "     import { estimateFare } from '.../utils/fareEstimator'"
echo "   (path relatif menyesuaikan lokasi masing-masing file, nama fungsi TIDAK berubah)"
echo ""
echo "3) Isi src/constants/roles.js dan src/constants/tripStatus.js"
echo "   dengan enum yang SAMA PERSIS dengan enum Prisma di backend"
echo "   (biar gak ada typo string role/status yang beda antara FE-BE)."
echo ""
echo "4) Pindahin logic <Routes>/<Route> dari App.jsx ke src/routes/routes.jsx"
echo "   kalau App.jsx sudah mulai gemuk berisi banyak <Route> per role."
echo ""
echo "5) Setelah semua import fix, jalankan:"
echo "     npm run dev"
echo "   buat mastiin gak ada import error, lalu commit:"
echo "     git add -A && git commit -m \"chore: rapikan struktur folder frontend\""
