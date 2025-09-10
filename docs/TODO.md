# Yapılanlar ve Plan

## Yapılanlar
- Next.js 14 (App Router) + TypeScript + Tailwind yapılandırıldı (`web/`).
- Tailwind tema: `brand` paleti, `darkMode: 'class'`, özel `shadow` ve `radius` eklendi.
- Global stiller (`web/app/globals.css`) ve arka plan/hover/scrollbar iyileştirmeleri eklendi.
- Tema anahtarı (`web/components/ThemeToggle.tsx`): dark-mode toggle + `localStorage` saklama.
- UI bileşenleri: `Button`, `Card`, `TextArea`, `Banner`.
- Ana sayfa ve galeri tasarımı (`web/app/page.tsx`).
- Editör sayfası (`web/app/editor/page.tsx`):
  - Drag&drop ve dosya input; JPG/PNG ve 10MB sınırı.
  - Önizleme, prompt alanı, hazır şablonlar.
  - Akış: imzalı URL → upload → görsel kaydı → arka plan düzenleme → polling → sonuç/indir.
- API istemcisi (`web/lib/api.ts`):
  - Uçlar: `/media/signed-url`, `/media/view-url`, `/images`, `/images/:id/versions`, `/edits/background`, `/edits/status`, `/edits/text`.
  - Yardımcı: `uploadFile(file)`.
- Next.js `rewrites` (`web/next.config.js`): `/api/*` çağrılarını emülatör Functions’a yönlendirir (veya `NEXT_PUBLIC_API_URL`).
- Firebase Auth entegrasyonu:
  - `web/lib/firebase.ts`: client init + `connectAuthEmulator` (env: `NEXT_PUBLIC_USE_EMULATORS=1`).
  - Giriş/Kayıt sayfaları: `web/app/auth/signin/page.tsx`, `web/app/auth/signup/page.tsx`.
  - Navbar kullanıcı menüsü: `web/components/UserMenu.tsx` (giriş/çıkış & linkler).
  - `AuthGuard`: `web/components/AuthGuard.tsx`; `/editor` yalnızca girişliyken erişilebilir.
  - `api.ts` artık ID token ve `x-user-id` header’larını ekliyor.
- Firebase Functions (mock backend) eklendi:
  - `firebase.json`, `.firebaserc`.
  - `functions/` (TypeScript/Express): `/upload`, `/media/*`, `/images*`, `/edits/*`, `/edits/text`.
  - Yerel dosya saklama: `%TEMP%/visual-editor-storage`.
  - Başlatma aracı: `scripts/start-local.ps1` (emülatörler + dev sunucu).

## Yapılacaklar
- Backend’te ID token doğrulaması ve `SKIP_AUTH` kaldırılması.
- Gerçek arka plan düzenleme entegrasyonu (Gemini/R2 gerçek ayarlarla).
- Üretim R2 ve Firebase projeye deploy adımları.
- README’ye kısa “Auth & Functions (Local)” rehberi ekleme.

