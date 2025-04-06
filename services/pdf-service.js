const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Geçici dosyalar için dizin yolu
const tempDir = path.join(__dirname, '..', 'temp');

/**
 * PDF servisi - HTML'i PDF'e dönüştürür
 */
class PDFService {
  /**
   * HTML içeriğini PDF'e dönüştürür
   * @param {string} html - HTML içeriği
   * @param {object} options - PDF oluşturma seçenekleri
   * @returns {Promise<Buffer>} - PDF içeriği buffer olarak
   */
  async convertHTMLToPDF(html, options = {}) {
    // Varsayılan ayarlar
    const pdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1.5cm',
        right: '1cm',
        bottom: '1.5cm',
        left: '1cm'
      },
      displayHeaderFooter: false,
      scale: 0.98,
      preferCSSPageSize: true,
      ...options
    };
    
    // Geçici dosya oluştur
    const tempFile = this.createTempFile(html);
    
    try {
      // Puppeteer başlatma seçenekleri - canlı ortam için optimize edildi
      const browserOptions = {
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage', // Bellek tüketimini azalt
          '--disable-gpu', // GPU kullanımını kapat (bazı cloud ortamları için gerekli)
          '--disable-web-security'
        ]
      };

      // Heroku gibi platformlar için buildpack kontrolü
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        browserOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      }

      const browser = await puppeteer.launch(browserOptions);
      
      // Yeni sayfa oluştur
      const page = await browser.newPage();
      
      // Sayfayı ayarla
      await page.setViewport({
        width: 794, // A4 genişliği piksel olarak (72dpi'da)
        height: 1123, // A4 yüksekliği piksel olarak (72dpi'da)
        deviceScaleFactor: 2 // Daha yüksek kalite için
      });
      
      // Geçici HTML dosyasına git
      const fileUrl = `file://${tempFile}`;
      await page.goto(fileUrl, { 
        waitUntil: 'networkidle0', 
        timeout: 60000 // 60 saniye timeout
      });
      
      // Sayfanın tam yüklenmesini bekle
      await page.evaluateHandle('document.fonts.ready');
      
      // PDF'e dönüştür
      const pdf = await page.pdf(pdfOptions);
      
      // Tarayıcıyı kapat
      await browser.close();
      
      return pdf;
    } catch (error) {
      throw new Error(`PDF oluşturma hatası: ${error.message}`);
    } finally {
      // Geçici dosyayı temizle
      this.cleanupTempFile(tempFile);
    }
  }
  
  /**
   * HTML içeriğiyle geçici dosya oluşturur
   * @param {string} html - HTML içeriği
   * @returns {string} - Geçici dosya yolu
   */
  createTempFile(html) {
    // Geçici dosya klasörünün var olduğundan emin ol
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFile = path.join(tempDir, `temp-${Date.now()}.html`);
    fs.writeFileSync(tempFile, html, 'utf8');
    return tempFile;
  }
  
  /**
   * Geçici dosyayı temizler
   * @param {string} filePath - Temizlenecek dosya yolu 
   */
  cleanupTempFile(filePath) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

module.exports = new PDFService(); 