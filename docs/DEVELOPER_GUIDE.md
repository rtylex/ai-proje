# Geliştirici Kılavuzu (Tek Dosya)

Bu belge, projedeki dağınık notları tek yerde toplar: yerel çalışma, emülatörler, ortam değişkenleri, akışlar (chat/editor), sorun giderme ve son yapılan iyileştirmeler.

## Hızlı Başlangıç
- Gerekli yazılımlar: Node 18+, Firebase CLI, (Firestore için) Java 11+, Google Gemini API key.
- Emülatörler (kök dizin):
  - Auth+Firestore+Functions: `firebase emulators:start --only auth,firestore,functions --project demo-aiproje`
  - Sadece Auth+Functions (Java yoksa): `firebase emulators:start --only auth,functions --project demo-aiproje`
- Web (ayrı terminal):
  - `cd web && npm run dev` (3000 doluysa: `npm run dev:3001`)
- Kontroller:
  - Emulator UI: `http://127.0.0.1:4321`
  - Auth: `http://127.0.0.1:9099`
  - Web: `http://localhost:3000`

## Ortam Değişkenleri
- Frontend (`web/.env.local`):
  - `NEXT_PUBLIC_API_URL=http://127.0.0.1:5001/demo-aiproje/europe-west1/api`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-aiproje`
  - `NEXT_PUBLIC_FIREBASE_LOCATION=europe-west1`
  - `NEXT_PUBLIC_USE_EMULATORS=1`
  - `NEXT_PUBLIC_AUTH_EMULATOR_HOST=127.0.0.1`
  - `NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=127.0.0.1`
- Backend (`functions/.env`):
  - `GEMINI_API_KEY=<anahtarınız>`
  - `APP_PROJECT_ID=demo-aiproje`, `APP_REGION=europe-west1`
  - `LOCAL_STORAGE_PATH=.storage` (varsayılan)
  - `CORS_ORIGIN=http://localhost:3000`
  - Localde auth atlamak için: `SKIP_AUTH=1`

Not: Functions tarafında `.env` dosyası dotenv ile otomatik yüklenir (hem `functions/.env` hem kök `.env`).

## Emülatör Portları
- Auth: 9099
- Functions: 5001
- Firestore: 8080
- Emulator UI: 4321

## Akışlar
- Sohbet (Chat): Web → `/edits/text` → Functions → Gemini text modeli → yanıt döner.
- Görsel Düzenleme (Editor):
  1) Web, `/media/signed-url` ile upload URL alır (lokalde storage mock).
  2) Dosya yüklenir, `/images` ile kayıt oluşturulur (Firestore).
  3) `/edits/background` ile iş başlatılır → Gemini image modeli → çıktı dosyası → Firestore `versions` kaydı.
  4) `/edits/status` poll ile sonuç izlenir.

## Sorun Giderme (Kısa)
- “Could not find config (firebase.json)”: Komutu proje kökünden çalıştırın.
- Proje ID yazım hatası: `demo-aiproje` (aproje değil).
- 9099/5001 erişilemiyor: VPN/Firewall kapatın, `Test-NetConnection 127.0.0.1 -Port 9099/5001` ile doğrulayın.
- Firestore sekmesi yok: Java 11+ kurulu mu? Emülatörü `--only auth,firestore,functions` ile başlatın.
- “Missing env: GEMINI_API_KEY”: `functions/.env` içine anahtarı ekleyin ve emülatörü yeniden başlatın. Geçici test: aynı terminalde `setx GEMINI_API_KEY "..."` ve yeni terminal açın.

## Komutlar ve Scriptler
- Manuel:
  - `cd functions && npm install && npm run build`
  - `cd .. && firebase emulators:start --only auth,firestore,functions --project demo-aiproje`
  - `cd web && npm run dev`
- PowerShell scriptleri:
  - `scripts/dev.ps1` → Emülatörleri ayrı pencerede açar, web’i başlatır.
  - `scripts/start-emulators.ps1` → Java varsa Firestore’u da başlatır.

## Yapılan İyileştirmeler (Özet)
- Auth emülatörü ön-kontrolü: Signin/Signup öncesi 9099 ping; ulaşılamazsa net uyarı (web/lib/firebase.ts → `verifyAuthEmulator`).
- Next proxy hedefi: `localhost` → `127.0.0.1` ile hizalandı (IPv6/localhost sorunları için).
- Web env düzenlemeleri: `.env.local` değerleri doğrulandı ve Firestore host eklendi.
- Firestore istemcisi: `getFirestoreDb()` eklendi ve emülatöre bağlanacak şekilde ayarlandı.
- Functions routing: Mock uçlar kaldırıldı, gerçek router’lar (`/media`, `/images`, `/edits`, `/storage`) bağlandı; `authMiddleware` eklendi.
- Sohbet ucu gerçeklendi: `/edits/text` artık `lib/gemini.generateText` kullanıyor.
- Görsel düzenleme gerçeklendi: `/edits/background` → Gemini image modeli + local storage.
- Env yükleme: `functions` tarafında dotenv eklendi; ayrıca `gemini.ts` modülünde de güvenceye alındı.
- `@google/genai` ESM uyumu: Dinamik import + REST fallback ile Windows/CJS ortamlarında güvenilir çalışır.

