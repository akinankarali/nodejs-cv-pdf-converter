const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const helmet = require('helmet');

// Custom servisler
const templateService = require('./services/template-service');
const pdfService = require('./services/pdf-service');

const app = express();
const port = process.env.PORT || 3001;

// Swagger tanımlaması
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CV PDF Servis API',
      version: '1.0.0',
      description: 'CV şablonlarını PDF formatına dönüştüren bir API',
      contact: {
        name: 'API Destek',
      },
    },
    servers: [
      {
        url: process.env.API_URL || `http://localhost:${port}`,
        description: 'API Sunucusu',
      },
    ],
  },
  apis: ['./index.js'], // API rotalarının bulunduğu dosyaları belirt
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware kurulumu
app.use(cors()); // Cross-origin isteklerine izin ver
app.use(helmet({ contentSecurityPolicy: false })); // Swagger UI için CSP'yi devre dışı bırak
app.use(bodyParser.json({ limit: '50mb' })); // JSON isteklerini işle, büyük HTML için limit arttırıldı
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// HTML'i görüntüleyebilmek için statik dosyaları serve et
app.use('/static', express.static(path.join(__dirname, 'public')));

// Geçici HTML dosyalarını saklamak için dizin
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * @swagger
 * /generate-cv:
 *   post:
 *     summary: CV verilerini kullanarak PDF oluşturur
 *     description: Belirtilen şablon tipine göre CV verilerini PDF formatına dönüştürür
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 description: CV şablon tipi (örn. creative)
 *               filename:
 *                 type: string
 *                 description: İsteğe bağlı dosya adı
 *               name:
 *                 type: string
 *                 description: CV sahibinin adı
 *               title:
 *                 type: string
 *                 description: Meslek/Unvan
 *               education:
 *                 type: array
 *                 description: Eğitim bilgileri
 *               experience:
 *                 type: array
 *                 description: İş tecrübesi
 *               skills:
 *                 type: array
 *                 description: Yetenekler
 *     responses:
 *       200:
 *         description: Başarılı - PDF dosyası dönüş
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Geçersiz istek
 *       500:
 *         description: Sunucu hatası
 */
app.post('/generate-cv', async (req, res) => {
  try {
    // İstek gövdesinden verileri al
    const { type, ...cvData } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: 'Şablon tipi (type) gerekli' });
    }
    
    // Opsiyonel dosya adı
    const filename = cvData.filename || `${type}-cv.pdf`;
    
    // Şablon seç ve HTML oluştur
    const html = await templateService.generateHTML(type, cvData);
    
    // HTML'i PDF'e dönüştür
    const pdf = await pdfService.convertHTMLToPDF(html);
    
    // PDF'i döndür
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdf);
  } catch (error) {
    console.error('CV oluşturma hatası:', error);
    res.status(500).json({ error: 'CV oluşturulurken bir hata oluştu', details: error.message });
  }
});

/**
 * @swagger
 * /convert-html:
 *   post:
 *     summary: HTML içeriğini PDF'e dönüştürür
 *     description: Verilen HTML string içeriğini PDF formatına dönüştürür
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - html
 *             properties:
 *               html:
 *                 type: string
 *                 description: Dönüştürülecek HTML içeriği
 *               filename:
 *                 type: string
 *                 description: İsteğe bağlı PDF dosya adı
 *     responses:
 *       200:
 *         description: Başarılı - PDF dosyası dönüş
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Geçersiz istek
 *       500:
 *         description: Sunucu hatası
 */
app.post('/convert-html', async (req, res) => {
  try {
    const { html, filename = 'document.pdf' } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'HTML içeriği gerekli' });
    }
    
    // HTML'i PDF'e dönüştür
    const pdf = await pdfService.convertHTMLToPDF(html);
    
    // PDF'i gönder
    res.contentType('application/pdf');
    // İndirilebilir dosya için header ekle
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdf);
  } catch (error) {
    console.error('PDF dönüşümünde hata:', error);
    res.status(500).json({ error: 'PDF oluşturulurken bir hata oluştu', details: error.message });
  }
});

/**
 * @swagger
 * /convert-url:
 *   get:
 *     summary: URL'deki sayfayı PDF'e dönüştürür
 *     description: Verilen URL adresindeki sayfayı PDF formatına dönüştürür
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: PDF'e dönüştürülecek sayfanın URL'si
 *       - in: query
 *         name: filename
 *         schema:
 *           type: string
 *         description: İsteğe bağlı PDF dosya adı
 *     responses:
 *       200:
 *         description: Başarılı - PDF dosyası dönüş
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Geçersiz istek
 *       500:
 *         description: Sunucu hatası
 */
app.get('/convert-url', async (req, res) => {
  try {
    const { url } = req.query;
    const filename = req.query.filename || 'document.pdf';
    
    if (!url) {
      return res.status(400).json({ error: 'URL parametresi gerekli' });
    }
    
    // Puppeteer ile tarayıcı başlat
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    
    // Yeni sayfa oluştur
    const page = await browser.newPage();
    
    // Sayfayı ayarla
    await page.setViewport({
      width: 794, // A4 genişliği piksel olarak (72dpi'da)
      height: 1123, // A4 yüksekliği piksel olarak (72dpi'da)
      deviceScaleFactor: 2, // Daha yüksek kalite için
    });
    
    // URL'ye git ve tüm kaynakların yüklenmesini bekle
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 60000 // 60 saniye timeout
    });
    
    // Sayfanın tam yüklenmesini bekle
    await page.evaluateHandle('document.fonts.ready');
    
    // PDF'e dönüştür - optimize edilmiş ayarlar
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1.5cm',
        right: '1cm',
        bottom: '1.5cm',
        left: '1cm'
      },
      displayHeaderFooter: false,
      scale: 0.98, // Ölçeği biraz küçült, içerik daha iyi sığsın
      preferCSSPageSize: true, // CSS @page boyutlarını kullan
      pageRanges: '', // Tüm sayfaları yazdır
    });
    
    await browser.close();
    
    res.contentType('application/pdf');
    // İndirilebilir dosya için header ekle
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdf);
  } catch (error) {
    console.error('PDF dönüşümünde hata:', error);
    res.status(500).json({ error: 'PDF oluşturulurken bir hata oluştu', details: error.message });
  }
});

/**
 * @swagger
 * /html-sayfa:
 *   get:
 *     summary: Örnek HTML sayfasını gösterir
 *     description: Test amaçlı örnek HTML sayfasını görüntüler
 *     responses:
 *       200:
 *         description: HTML sayfası
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
app.get('/html-sayfa', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ornek.html'));
});

/**
 * @swagger
 * /creative-cv:
 *   get:
 *     summary: Creative CV şablonunu gösterir
 *     description: Modern tasarımlı Creative CV şablonunu görüntüler
 *     responses:
 *       200:
 *         description: HTML şablonu
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
app.get('/creative-cv', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'creative_template.html'));
});

/**
 * @swagger
 * /templates:
 *   get:
 *     summary: Kullanılabilir CV şablonlarını listeler
 *     description: Sistemde bulunan tüm CV şablonlarının listesini döndürür
 *     responses:
 *       200:
 *         description: Şablonların listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 templates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       preview:
 *                         type: string
 *                       description:
 *                         type: string
 */
app.get('/templates', (req, res) => {
  try {
    const templates = [
      { id: 'creative', name: 'Modern CV', preview: '/static/previews/creative.png', description: 'Yaratıcı ve modern tasarımlı CV şablonu' }
      // Diğer şablonlar burada eklenecek
    ];
    
    res.json({ templates });
  } catch (error) {
    console.error('Şablonları getirirken hata:', error);
    res.status(500).json({ error: 'Şablonlar yüklenirken bir hata oluştu' });
  }
});

// Ana sayfa için bilgilendirme
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>CV PDF Servis</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #3498db; }
          ul { list-style-type: none; padding: 0; }
          li { margin-bottom: 10px; }
          a { color: #3498db; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .endpoint { background: #f8f9fa; padding: 5px 10px; border-radius: 4px; font-family: monospace; }
          pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
          .swagger-link { display: block; margin: 20px 0; padding: 10px; background: #3498db; color: white; text-align: center; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>CV PDF Servis</h1>
        <p>Bu servis CV şablonlarını dinamik içerikle doldurup PDF formatına dönüştürmek için kullanılır.</p>
        
        <a href="/api-docs" class="swagger-link">Swagger API Dokümantasyonu</a>
        
        <h2>CV Şablonları:</h2>
        <ul>
          <li><span class="endpoint">GET <a href="/templates">/templates</a></span> - Kullanılabilir şablonların listesini döndürür</li>
          <li><span class="endpoint">GET <a href="/creative-cv">/creative-cv</a></span> - Creative CV şablonunu görüntüler</li>
        </ul>
        
        <h2>PDF Dönüştürme API'leri:</h2>
        <ul>
          <li><span class="endpoint">POST /generate-cv</span> - CV verilerini ve şablon tipini alarak PDF oluşturur</li>
          <li><span class="endpoint">POST /convert-html</span> - HTML içeriğini PDF'e dönüştürür</li>
          <li><span class="endpoint">GET /convert-url?url=...</span> - Verilen URL'deki sayfayı PDF'e dönüştürür</li>
        </ul>
        
        <h2>Örnek Kullanım:</h2>
        <pre>
fetch('http://localhost:${port}/generate-cv', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'creative',
    name: 'Ayşe Yılmaz',
    title: 'UI/UX Designer',
    email: 'ayse.yilmaz@ornek.com',
    phone: '+90 555 123 4567',
    location: 'İstanbul, Türkiye',
    summary: 'Kullanıcı odaklı tasarımcı...',
    linkedin: 'linkedin.com/in/ayseyilmaz',
    linkedinUrl: 'https://linkedin.com/in/ayseyilmaz',
    website: 'ayseyilmaz.com',
    websiteUrl: 'https://ayseyilmaz.com',
    photoUrl: 'https://example.com/photo.jpg',
    experience: [
      {
        title: 'Senior UI/UX Designer',
        company: 'Creative Labs A.Ş.',
        date: '2020 - Günümüz',
        descriptions: [
          'E-ticaret uygulamasının kullanıcı deneyimini yeniden tasarlayarak dönüşüm oranında %30 artış sağladım',
          '4 kişilik tasarım ekibine liderlik ederek, sektörde ödül kazanan mobil uygulamalar geliştirdim'
        ]
      }
    ],
    skills: ['UI/UX Design', 'Figma', 'Adobe XD', 'Sketch'],
    // diğer veriler...
  })
})
.then(response => {
  if (response.ok) {
    return response.blob();
  }
  throw new Error('PDF oluşturulamadı');
})
.then(blob => {
  // PDF'i indirmek için
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'cv.pdf';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
});
        </pre>
      </body>
    </html>
  `);
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`CV-PDF servis http://localhost:${port} adresinde çalışıyor`);
});