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

## DigitalOcean App Platform'da Kurulum

### Doğrudan Deployment
1. DigitalOcean hesabı oluşturun (veya giriş yapın)
2. App Platform > Create App seçeneğine tıklayın
3. GitHub veya GitLab üzerinden repo'nuzu bağlayın
4. Node.js servis türünü seçin
5. Aşağıdaki ayarları yapın:
   - HTTP port: 3001
   - Environment Variables:
     - NODE_ENV: production
     - PORT: 3001
6. "Deploy to Production" butonuna tıklayın

### Docker ile Deployment
1. Bu repo'yu GitHub'a push edin
2. DigitalOcean'da Container Registry oluşturun
3. Aşağıdaki komutları kullanarak Docker imajını oluşturun ve push edin:

```bash
# Docker imajı oluştur
docker build -t registry.digitalocean.com/your-registry/cv-pdf-service:latest .

# DigitalOcean'a giriş yap
doctl auth init
doctl registry login

# İmajı push et
docker push registry.digitalocean.com/your-registry/cv-pdf-service:latest
```

4. App Platform > Create App > Docker Hub/Container Registry seçeneğine tıklayın
5. Oluşturduğunuz imajı seçin ve deploy edin

## Ortam Değişkenleri

- `PORT`: API'nin çalışacağı port (default: 3001)
- `NODE_ENV`: Çalışma ortamı (development/production)
- `API_URL`: Swagger dokümantasyonu için API URL'si

## Lisans

MIT 