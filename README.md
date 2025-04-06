# CV PDF Servis

Bu servis, CV şablonlarını PDF formatına dönüştürmek için geliştirilmiş bir API'dir. Node.js ve Puppeteer kullanılarak oluşturulmuştur.

## Özellikler

- CV verilerini JSON olarak alıp PDF oluşturma
- HTML içeriğini PDF'e dönüştürme
- URL'den PDF oluşturma
- Farklı CV şablonları desteği
- Swagger API dokümantasyonu

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme modunda çalıştır
npm run dev

# Canlı ortamda çalıştır
npm start
```

## API Kullanımı

Swagger dokümantasyonu: `/api-docs`

Temel endpoint'ler:
- `POST /generate-cv`: CV verilerini PDF'e dönüştürür
- `POST /convert-html`: HTML içeriğini PDF'e dönüştürür
- `GET /convert-url`: Belirtilen URL'deki sayfayı PDF'e dönüştürür
- `GET /templates`: Mevcut şablonları listeler

## Canlı Ortama Alma

### Heroku

```bash
# Heroku CLI yükleyin
# Git repo oluşturun
git init
git add .
git commit -m "İlk commit"

# Heroku app oluşturun
heroku create cv-pdf-servis

# Buildpack ekleyin (Puppeteer için gerekli)
heroku buildpacks:add https://github.com/jontewks/puppeteer-heroku-buildpack.git
heroku buildpacks:add heroku/nodejs

# Deploy edin
git push heroku main
```

### Render

1. Render.com'da yeni bir Web Service oluşturun
2. GitHub repo'nuzu bağlayın
3. Aşağıdaki ayarları yapın:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     - `PORT`: 10000
     - `NODE_ENV`: production

### DigitalOcean App Platform

1. DigitalOcean Dashboard'da "Create App" seçin
2. GitHub repo'nuzu bağlayın
3. HTTP port'unu 3001 olarak ayarlayın
4. Environment variables bölümünde PORT değişkenini tanımlayın

## Ortam Değişkenleri

- `PORT`: API'nin çalışacağı port (default: 3001)
- `API_URL`: Swagger dokümantasyonu için API URL'si
- `PUPPETEER_EXECUTABLE_PATH`: Bazı bulut platformları için özel Chrome yolu

## Lisans

MIT 