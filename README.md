# Visual Editor - AI Background Changer

Google Gemini 2.5 Flash ile görsel arka plan değiştirme uygulaması.

## Local Development

### Ön Gereksinimler
- Node.js 18+
- Firebase CLI
- Google Gemini API Key
- (Firestore için) Java 11+

### 1. Dependencies
```
# Backend
cd functions
npm install

# Frontend
cd ../web
npm install
```

### 2. Environment Variables
- `functions/.env` hazır. `GEMINI_API_KEY` değerini ekleyin/güncelleyin.

### 3. Firebase Emulators Başlatma
```
# Ana dizinde
firebase emulators:start --only auth,firestore,functions --project demo-aiproje
```
Bu komut şunları başlatır:
- Functions: http://127.0.0.1:5001
- Firestore: http://127.0.0.1:8080
- UI: http://127.0.0.1:4321
- Auth: http://127.0.0.1:9099

### 4. Frontend Başlatma
```
cd web
npm run dev # 3000 doluysa: npm run dev:3001
```

## Kullanım
1. http://localhost:3000 adresine gidin
2. Bir JPG/PNG dosyası yükleyin (max 10MB)
3. Arka plan tanımını yazın (örn: "deniz kenarı")
4. "Arka Planı Değiştir" butonuna tıklayın
5. İşlem tamamlanınca sonucu görün

## Proje Yapısı
```
/
└─ functions/        # Firebase Functions (Backend)
   ├─ src/
   │  ├─ api/        # API endpoints
   │  ├─ lib/        # Utilities
   │  └─ index.ts    # Main entry
   └─ .env           # Environment variables
└─ web/              # Next.js Frontend
   ├─ app/           # App Router pages
   └─ lib/           # API client
└─ firebase.json     # Firebase config
└─ firestore.rules   # Database rules
└─ Proje_prd.md      # PRD Document
└─ docs/             # Dokümantasyon
```

## API Endpoints
- `POST /media/signed-url` - Upload URL generation
- `POST /media/view-url` - View URL generation
- `POST /images` - Create image record
- `GET /images` - List images
- `POST /edits/background` - Start background edit
- `GET /edits/status` - Check edit status
- `POST /edits/text` - Generate text (Gemini)

## Notlar
- Local geliştirmede R2 yerine `.storage` klasörü kullanılır
- `SKIP_AUTH=1` ile yerelde auth bypass edilebilir

## Troubleshooting
- Daha fazla bilgi ve birleşik kılavuz:
  - `docs/DEVELOPER_GUIDE.md`
