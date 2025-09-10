# 📌 PRD – Görsel Arka Plan Değiştirme Uygulaması (Gemini 2.5 Flash)

## 1) Amaç

Kullanıcıların `.jpg/.png` fotoğraflarını yükleyip, **prompt** yazarak **Google Gemini 2.5 Flash** ile **arka planı değiştirmesi**; ortaya çıkan **versiyonları** güvenli şekilde saklama, görüntüleme, indirme ve **kalıcı silme**.

## 2) Hedefler (OKR/KPI)

- **O:** MVP’de uçtan uca düzenleme akışı.
  - **KR1:** Yüklemeden indirilebilir çıktıya **≤ 5 sn p95** işleme süresi.
  - **KR2:** İlk hafta 100 kullanıcı, KBA (komut/işlem) başına **%90+** başarılı düzenleme.
  - **KR3:** Hata oranı (5xx + app-level) **< %1**.
  - **KR4:** Veri sızıntısı: **0**; yetkisiz erişim: **0**.

## 3) Kapsam (MVP)

- E-posta & şifre ile giriş (Firebase Auth).
- Görsel yükleme: `.jpg/.png`, **maks 10 MB**, **maks çözünürlük 4096 px** (uzun kenar).
- Prompt bazlı arka plan değiştirme (Gemini 2.5 Flash).
- Versiyon kaydı (sınırsız, deneme aşaması).
- R2’de **private** saklama + **signed URL** ile sadece sahibine görünürlük.
- **Kalıcı silme** (orijinal → tüm versiyonlar silinir).
- Basit listeleme/paginasyon ve indirme.

### Kapsam Dışı (MVP)

- Mobil native uygulamalar.
- Hazır arka plan preset’leri, blur/segmentation/diğer ileri düzenlemeler.
- Abonelik & ödeme.
- Gelişmiş moderasyon/NSFW filtreleri (not: riskler bölümünde tedbir).

## 4) Kullanıcı Akışları (Özet)

1. **Kayıt/Giriş** → Dashboard.
2. **Yükle** (drag&drop/seç) → dosya kural kontrolü → **orijinal** R2’ye.
3. **Prompt gir** → “Arka Planı Değiştir” → Gemini → versiyon R2’ye.
4. **Listele** (Orijinaller / Düzenlenmişler) → Önizle/İndir/Sil.
5. **Sil** (onaylı, anında ve kalıcı).

## 5) Veri Modeli (Firestore & Tablo/Koleksiyon İsimleri)

### Koleksiyonlar (Tablolar)

- **Users**

  - Alanlar: `userId`, `email`, `passwordHash`, `name`, `surname`, `createdAt`, `lastLogin`

- **Images**

  - Alanlar: `imageId`, `userId`, `originalUrl`, `createdAt`

- **Versions**

  - Alanlar: `versionId`, `imageId`, `userId`, `editedUrl`, `editType=backgroundChange`, `prompt`, `createdAt`

- **ActivityLogs** (opsiyonel)

  - Alanlar: `logId`, `userId`, `action`, `targetId (imageId/versionId)`, `timestamp`, `meta`

### Firestore Path Örneği

```
users/{userId}
users/{userId}/images/{imageId}
users/{userId}/images/{imageId}/versions/{versionId}
activityLogs/{logId}
```

## 6) R2 Yapısı (Depolama Şeması)

### Bucket: `visual-editor`

- **users/** → Her kullanıcı için klasör
  - **{userId}/images/** → Kullanıcının tüm görselleri
    - **{imageId}/original.jpg** → Orijinal görsel
    - **{imageId}/versions/{versionId}.jpg** → Düzenlenmiş versiyon görselleri

### Metadata (Firestore’da saklanacak)

- `r2Key` → R2’deki dosya yolu (`users/{userId}/images/{imageId}/original.jpg`)
- `mimeType` → `image/jpeg` veya `image/png`
- `size` → dosya boyutu (byte)
- `resolution` → width x height

## 7) Teknik Mimari

### Frontend

- **Next.js (React)**, TypeScript.
- Auth: Firebase Auth (ID token).
- Görsel yükleme: doğrudan R2’ye **pre-signed PUT URL** (backend’ten alınır).
- Görüntüleme: **short-lived signed GET URL**.
- İletişim: REST API (JSON) + fetch; düzenleme işlemi için **polling** (2s aralıkla 30s’e kadar).

### Backend (MVP tercihi)

- **Firebase Cloud Functions** (Node 20).
- Görevler:
  - `/media/signed-url` → R2 için PUT/GET signed URL üretimi.
  - `/images` CRUD → Firestore senkronizasyonu.
  - `/edits/background` → Gemini çağrısı, çıktı R2’ye yükleme, versiyon kaydı.
  - **Silme**: Firestore + R2 **transactional** mantık.
- Entegrasyonlar: Cloudflare R2 (scoped access token), Firebase Admin SDK.

### AI Katmanı

- **Google Gemini 2.5 Flash** görsel düzenleme.
- Prompt şablonu (server-side):\
  `"Replace the background of the attached image according to: '{USER_PROMPT}'"`

## 8) Silme Politikası

- **Düzenlenmiş görsel silme:** Onay → Firestore kaydı + R2 dosyası silinir.
- **Orijinal silme:** Onay → orijinal + tüm versiyonlar Firestore’dan ve R2’den silinir.
- **Geri dönüş yok.**

## 9) Kullanıcı Arayüzleri

- **Giriş/Kayıt**: E-posta & şifre, giriş/kayıt/şifre reset.
- **Dashboard**: Görsel yükle, son görseller önizleme.
- **Yükleme Ekranı**: Drag&drop alanı, yükleme sonrası düzenlemeye geçiş.
- **Arka Plan Düzenleme**: Sol orijinal, sağ düzenlenmiş, prompt girişi, kaydet/indir.
- **Orijinal Görseller**: Liste, düzenle/sil.
- **Düzenlenmiş Görseller**: Liste, önizle/indir/sil.
- **Profil**: Kullanıcı bilgileri, ileride abonelik/istatistikler.

## 10) Başarı Metrikleri

- Ortalama işleme süresi ≤ 5 sn p95.
- Kullanıcı başına ortalama görsel yükleme sayısı.
- Versiyon başına ortalama indirme sayısı.
- Hata oranı < %1.

## 11) Varsayımlar & Kısıtlamalar

- Kullanıcı sadece kendi görsellerine erişir (signed URL).
- Desteklenen formatlar: `.jpg`, `.png`.
- Maks 10MB dosya, uzun kenar 4096 px.
- MVP: sınırsız depolama, sadece web.
- Silme işlemleri kalıcıdır.



---

## 12) Güvenlik & Erişim Kontrolü

**Kimlik Doğrulama:** Firebase Auth (e‑posta/şifre). Tüm API çağrıları `Authorization: Bearer <Firebase ID token>` ile yapılır.

**Yetkilendirme:** Owner‑only erişim.

- **Firestore Rules (örnek):**

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /images/{imageId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        match /versions/{versionId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
    match /activityLogs/{logId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read: if false; // sadece backend okur
    }
  }
}
```

**R2 Erişimi:** Bucket **private**. İstemci hiçbir zaman R2 anahtarlarını görmez.

- **Signed URL (GET/PUT)** üretimi sadece backend’te.
- **TTL:** 10 dakika (konfigüre edilebilir).
- **CORS:** Sadece `https://{app-domain}` kökenine izin; methodlar: `GET, PUT`.

**Girdi Doğrulama:**

- Dosya: MIME türü (`image/jpeg|image/png`), boyut ≤ 10MB, çözünürlük uzun kenar ≤ 4096px.
- Prompt: 0–200 karakter, XSS kaçışı/sanitize.

**Çıktı Sertleştirme:**

- EXIF/metadata strip (PII sızıntısını azaltır).
- Sunucu tarafı dosya türü doğrulaması (sihirli bayt kontrolü).

**Rate Limit (MVP):**

- `/edits/background`: kullanıcı başına **10 istek/dk**, **200/gün**.
- Global Functions **max instances**: 5.

**İdempotensi:** Silme ve işleme başlatma uçlarında `Idempotency-Key` desteklenir (tekrarlanan isteklerde yinelenen iş oluşturulmaz).

---

## 13) API Sözleşmeleri (v1)

> Tüm yanıtlarda `Content-Type: application/json`. Başarılı olmayan durumlarda `error.code`, `error.message` döner.

### 13.1 Upload Akışı

**POST** `/media/signed-url`

- **Headers:** `Authorization`
- **Body:** `{ "type": "original"|"version", "imageId": "?", "mime": "image/jpeg|image/png" }`
- **200:** `{ "uploadUrl": "...", "key": "users/{uid}/images/{imageId}/original.jpg" }`

**POST** `/images`

- **Body:** `{ "key": "users/{uid}/images/{imageId}/original.jpg", "size": 123456, "mimeType":"image/jpeg", "resolution": {"w":1200, "h":1600} }`
- **201:** `{ "imageId": "...", "originalUrl": "users/{uid}/images/{imageId}/original.jpg" }`

### 13.2 Arka Plan Değiştirme

**POST** `/edits/background`

- **Body:** `{ "imageId":"...", "prompt":"deniz kenarı" }`
- **202:** `{ "jobId":"...", "status":"processing" }`

**GET** `/edits/status?jobId=...`

- **200 (done):** `{ "status":"done", "versionId":"...", "editedUrl":"users/{uid}/images/{imageId}/versions/{versionId}.jpg" }`
- **200 (processing):** `{ "status":"processing" }`
- **200 (failed):** `{ "status":"failed", "error":"model_timeout" }`

### 13.3 Listeleme

**GET** `/images?cursor=...&limit=20` → `{ "items":[{ "imageId":"...", "createdAt":123456789 }], "nextCursor":"..." }`

**GET** `/images/{imageId}/versions?cursor=...&limit=20` → `{ "items":[{ "versionId":"...", "createdAt":123456789 }], "nextCursor":"..." }`

### 13.4 Görüntüleme URL’i

**POST** `/media/view-url`

- **Body:** `{ "key":"users/{uid}/images/{imageId}/versions/{versionId}.jpg" }`
- **200:** `{ "url":"https://r2...sig=...", "expiresIn":600 }`

### 13.5 Silme

**DELETE** `/versions/{versionId}` → `{ "ok": true }`

**DELETE** `/images/{imageId}?cascade=true` → `{ "ok": true, "deletedVersions": N }`

---

## 14) Non‑Functional Requirements (NFR)

- **Performans:** p95 işleme ≤ **5 sn**, p50 ≤ 2.5 sn. API p95 ≤ 500 ms.
- **Kapasite:** 50 eşzamanlı işleme / proje (MVP). Gerektiğinde yatay ölçek.
- **Uptime:** ≥ %99 (Firebase + Cloudflare SLA’leriyle).
- **Uyumluluk:** Chrome/Edge/Firefox son 2 sürüm, Safari 15+.
- **Erişilebilirlik:** Kontrast ≥ 4.5:1, klavye ile gezinme, alt text.
- **i18n:** TR varsayılan, metinler `i18n` kaynak dosyalarında.

---

## 15) Hata Senaryoları & UX Mesajları

| Kod | Durum             | Mesaj (kullanıcı)             | Teknik Not                   |
| --- | ----------------- | ----------------------------- | ---------------------------- |
| 400 | Bad Request       | Dosya formatı/ölçüsü geçersiz | MIME, size, çözünürlük reddi |
| 401 | Unauthorized      | Lütfen giriş yapın            | ID token eksik/expired       |
| 403 | Forbidden         | Bu içeriğe erişim izniniz yok | Sahiplik kontrolü            |
| 404 | Not Found         | İçerik bulunamadı             | Yanlış ID/R2 key             |
| 408 | Timeout           | İşlem zaman aşımına uğradı    | Gemini/Network               |
| 429 | Too Many Requests | Hız limiti aşıldı             | Rate limit                   |
| 500 | Sunucu Hatası     | Bir şeyler ters gitti         | Log + alarm                  |

UI: non‑blocking toast + durum rozetleri (`processing/done/failed`).

---

## 16) Gözlemlenebilirlik & Operasyon

- **Loglar:** istek kimliği, kullanıcı kimliği (hash), süre, boyut, model yanıt durumu (PII yok).
- **Metrikler:** istek/s, p50/p95, hata oranı, R2 hata oranı, ort. dosya boyutu.
- **Alarmlar:** p95 > 5 sn (5 dk), 5xx > %1 (5 dk), R2 hatası > %0.5.
- **Sürümleme:** API `v1`; kırıcı değişiklikte `v2`.

---

## 17) Maliyet Guardrail’leri

- Functions **max instances**: 5.
- Günlük edit kotası: **10k** global.
- Dosya limiti: 10MB (büyük dosya reddi).
- R2 yaşam döngüsü: Yetim dosya tarayıcısı (günlük cron) → hedef 0.

---

## 18) Test & Kabul Kriterleri

**Fonksiyonel**

-

**Güvenlik**

-

**Dayanıklılık**

-

**Performans**

-

---

## 19) Yol Haritası (MVP)

- **Sprint 1:** Auth, upload, signed PUT/GET, Firestore kayıt.
- **Sprint 2:** `/edits/background` + Gemini entegrasyonu, versiyon akışı.
- **Sprint 3:** Listeleme/pagination, indirme, silme (cascade + idempotent).
- **Sprint 4:** Gözlemlenebilirlik, rate limit, a11y sertleştirme, prod setup.

---

## 20) Riskler & Azaltım

- **Model gecikmesi/hata:** Kuyruk + retry + kullanıcıya durum.
- **Maliyet artışı:** Rate limit + dosya limit + max instances.
- **Yetim dosya:** Transactional silme + günlük tarayıcı.
- **Prompt kötüye kullanım:** Sistem prompt sabit; içerik politikası; ileride moderasyon.

---

## 21) Uygulama Notları

- **İsimlendirme:** `UUIDv4` kullan; tahmin edilebilir artan ID yok.
- **İmza:** Signed URL’lerde `content-type` ve `content-md5` sabitle.
- **Doğrulama:** Upload sonrası `HEAD` ile boyut/MIME doğrula.
- **Formatlama:** Çıktıyı mümkünse `.jpg` (şeffaflık gerekmiyorsa) kaydet.
- **Eşzamanlılık:** Silme sırasında çalışan job varsa job iptal/skip.
- **CORS:** R2 ve API için köken/başlık kısıtları.

---

## 22) Ek (JSON Şemalar – Örnek)

**Images (Firestore)**

```json
{
  "imageId": "uuid",
  "userId": "uid",
  "originalUrl": "users/{uid}/images/{imageId}/original.jpg",
  "createdAt": 1717171717,
  "size": 123456,
  "mimeType": "image/jpeg",
  "resolution": { "w": 1200, "h": 1600 }
}
```

**Versions (Firestore)**

```json
{
  "versionId": "uuid",
  "imageId": "uuid",
  "userId": "uid",
  "editedUrl": "users/{uid}/images/{imageId}/versions/{versionId}.jpg",
  "editType": "backgroundChange",
  "prompt": "deniz kenarı",
  "createdAt": 1717171818
}
```

**ActivityLogs (Firestore)**

```json
{
  "logId": "uuid",
  "userId": "uid",
  "action": "editBackground|upload|delete",
  "targetId": "imageId|versionId",
  "timestamp": 1717171919,
  "meta": { "ip": "hash", "ua": "hash" }
}
```

**R2 Anahtarları (örnek)**

```json
{
  "originalKey": "users/{uid}/images/{imageId}/original.jpg",
  "versionKey": "users/{uid}/images/{imageId}/versions/{versionId}.jpg"
}
```



---

## 23) Ek A — Uygulama Başlangıç Paketi (AI‑hazır)

### A1) Son Kontrol Listesi

- Functions çalışma zamanı: **Node 20**, bölge: ``
- R2 S3 endpoint: `` (AWS SDK v3 için `region: "auto"`)
- Signed URL ömrü: **600 sn** (GET/PUT)
- Limitler: **10MB** dosya, uzun kenar **4096 px**, prompt **0–200** karakter
- Zaman damgaları: **epoch (saniye)**
- Sayfalama: `limit=20`, yanıt `nextCursor` döndürür
- **Idempotency-Key**: `/edits/background` ve **DELETE** uçlarında zorunlu
- Firestore Rules: **owner‑only**, `activityLogs` **read****:false** (sadece backend okur)

### A2) `.env.example`

```bash
# Firebase
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_LOCATION=europe-west1
NODE_ENV=production

# Cloudflare R2 (S3 uyumlu)
R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxx
R2_BUCKET=visual-editor
R2_ACCESS_KEY_ID=AKIA...
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxx
R2_S3_ENDPOINT=https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com

# AI
GEMINI_API_KEY=ya29....

# Uygulama politikaları
SIGNED_URL_TTL_SECONDS=600
MAX_IMAGE_MB=10
MAX_IMAGE_LONG_EDGE_PX=4096
RATE_LIMIT_PER_MINUTE=10
RATE_LIMIT_PER_DAY=200
CORS_ORIGIN=https://yourapp.com
```

> **Not:** Production’da gizli anahtarları Functions **Secrets** ya da CI gizli değişkenleri ile yönetin.

### A3) Önerilen Dizin Yapısı

```
/functions
  /src
    /api
      images.ts         # /images CRUD
      media.ts          # /media/signed-url, /media/view-url
      edits.ts          # /edits/background, /edits/status
    /lib
      r2.ts             # S3 client, signed URL helpers
      gemini.ts         # Gemini çağrıları
      validation.ts     # mime/size/dimension/prompt kontrolleri
      auth.ts           # Firebase token doğrulama (middleware)
      rateLimit.ts      # kullanıcı başına limitler
    index.ts            # Express app -> functions.https.onRequest
  package.json
  firebase.json
  firestore.rules
/web
  /pages
    index.tsx          # dashboard
    /images/[id].tsx   # düzenleme + prompt
    /auth/*.tsx        # login/register
  /lib/api.ts          # fetch wrapper (Bearer token)
```

### A4) Kurulum & Dağıtım (özet)

1. **Firebase CLI**: `npm i -g firebase-tools` → `firebase login`
2. Proje başlat: `firebase init` (Functions, Firestore, Hosting opsiyonel)
3. R2’da bucket ve anahtarları oluştur (Account ID, Access/Secret)
4. Functions dizininde bağımlılıklar: `cd functions && npm i`
5. Ortam değişkenleri: `.env` veya **functions****:secrets** ile tanımla
6. Yerelde çalıştır (opsiyonel): `firebase emulators:start`
7. Dağıt: `firebase deploy --only functions` (Hosting kullanıyorsan ekle)

### A5) Done Definition (MVP)

Aşağıdaki maddeler \*\*"kabul kriterleri"\*\*dir. Her madde; **Given/When/Then** (Ön Koşul / Ne Zaman / Beklenen) mantığıyla ve mümkün olduğunca **ölçülebilir** şekilde tanımlanmıştır.

---

#### 1) Fonksiyonel

-

---

#### 2) Güvenlik & Erişim

-

---

#### 3) Performans & Güvenilirlik

-

---

#### 4) Gözlemlenebilirlik

-

---

#### 5) Dokümantasyon & Operasyon

-

---

#### 6) Yayınlama

-

---

#### 7) UX & Erişilebilirlik

-

