const fs = require('fs');
const path = require('path');

/**
 * Template servisi - CV şablonlarını yönetir ve verileri yerleştirir
 */
class TemplateService {
  constructor() {
    this.templatesDir = path.join(__dirname, '..', 'templates');
    this.templateTypes = ['creative']; // Desteklenen şablon tipleri
    this.partialsCache = {};
    
    // Şablon parçacıklarını önbelleğe al
    this.loadPartials();
  }
  
  /**
   * Şablon parçacıklarını önbelleğe yükler
   */
  loadPartials() {
    this.templateTypes.forEach(type => {
      try {
        // Şablon tipi için parçacıkları yükle
        const partialsPath = path.join(this.templatesDir, `${type}-partials.js`);
        if (fs.existsSync(partialsPath)) {
          this.partialsCache[type] = require(partialsPath);
        }
      } catch (err) {
        console.error(`Şablon parçacıkları yüklenirken hata: ${type}`, err);
      }
    });
  }
  
  /**
   * Belirlenen şablon tipini ve CV verilerini kullanarak HTML oluşturur
   * @param {string} templateType - Şablon tipi (ör. "creative")
   * @param {object} cvData - CV verileri
   * @returns {Promise<string>} - Oluşturulan HTML
   */
  async generateHTML(templateType, cvData) {
    // Şablon tipi destekleniyor mu?
    if (!this.templateTypes.includes(templateType)) {
      throw new Error(`Desteklenmeyen şablon tipi: ${templateType}`);
    }
    
    // Şablon dosyasını oku
    const templatePath = path.join(this.templatesDir, `${templateType}.html`);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Şablon dosyası bulunamadı: ${templatePath}`);
    }
    
    let templateHTML = fs.readFileSync(templatePath, 'utf8');
    
    // Parçacıkları kullanarak dinamik içerik oluştur
    templateHTML = await this.fillTemplate(templateType, templateHTML, cvData);
    
    return templateHTML;
  }
  
  /**
   * Şablona dinamik verileri yerleştirir
   * @param {string} type - Şablon tipi
   * @param {string} template - HTML şablonu
   * @param {object} data - CV verileri
   * @returns {Promise<string>} - Dinamik içerikle doldurulmuş HTML
   */
  async fillTemplate(type, template, data) {
    // Temel alanları doldur (name, title, email, vb.)
    Object.keys(data).forEach(key => {
      // Eğer dizi veya nesne değilse, doğrudan yerleştir
      if (typeof data[key] !== 'object') {
        template = template.replace(new RegExp(`{${key}}`, 'g'), data[key] || '');
      }
    });
    
    // Dinamik parçaları oluştur
    template = await this.generateDynamicSections(type, template, data);
    
    // Kalan boş alanları temizle
    template = template.replace(/{[^}]+}/g, '');
    
    return template;
  }
  
  /**
   * Dinamik bölümleri oluşturur (deneyimler, eğitim, beceriler, vb.)
   * @param {string} type - Şablon tipi
   * @param {string} template - HTML şablonu
   * @param {object} data - CV verileri
   * @returns {Promise<string>} - Dinamik bölümlerle doldurulmuş HTML
   */
  async generateDynamicSections(type, template, data) {
    // Şablon parçacıklarını al
    const partials = this.partialsCache[type];
    if (!partials) {
      return template;
    }
    
    // --- Deneyim öğelerini oluştur ---
    if (data.experience && Array.isArray(data.experience)) {
      let experienceItemsHtml = '';
      
      for (const exp of data.experience) {
        let descriptionsHtml = '';
        if (exp.descriptions && Array.isArray(exp.descriptions)) {
          exp.descriptions.forEach(desc => {
            descriptionsHtml += partials.experienceDescriptionTemplate.replace('{description}', desc);
          });
        }
        
        let expItemHtml = partials.experienceItemTemplate
          .replace('{title}', exp.title || '')
          .replace('{company}', exp.company || '')
          .replace('{date}', exp.date || '')
          .replace('{descriptions}', descriptionsHtml);
          
        experienceItemsHtml += expItemHtml;
      }
      
      template = template.replace('{experienceItems}', experienceItemsHtml);
    }
    
    // --- Eğitim öğelerini oluştur ---
    if (data.education && Array.isArray(data.education)) {
      let educationItemsHtml = '';
      
      for (const edu of data.education) {
        let descriptionsHtml = '';
        if (edu.descriptions && Array.isArray(edu.descriptions)) {
          edu.descriptions.forEach(desc => {
            descriptionsHtml += partials.experienceDescriptionTemplate.replace('{description}', desc);
          });
        }
        
        let eduItemHtml = partials.educationItemTemplate
          .replace('{degree}', edu.degree || '')
          .replace('{school}', edu.school || '')
          .replace('{date}', edu.date || '')
          .replace('{descriptions}', descriptionsHtml);
          
        educationItemsHtml += eduItemHtml;
      }
      
      template = template.replace('{educationItems}', educationItemsHtml);
    }
    
    // --- Beceri öğelerini oluştur ---
    if (data.skills && Array.isArray(data.skills)) {
      let skillItemsHtml = '';
      
      data.skills.forEach(skill => {
        skillItemsHtml += partials.skillItemTemplate.replace('{skill}', skill);
      });
      
      template = template.replace('{skillItems}', skillItemsHtml);
    }
    
    // --- Dil öğelerini oluştur ---
    if (data.languages && Array.isArray(data.languages)) {
      let languageItemsHtml = '';
      
      data.languages.forEach(lang => {
        languageItemsHtml += partials.languageItemTemplate.replace('{language}', lang);
      });
      
      template = template.replace('{languageItems}', languageItemsHtml);
    }
    
    // --- Hobi öğelerini oluştur ---
    if (data.hobbies && Array.isArray(data.hobbies)) {
      let hobbyItemsHtml = '';
      
      data.hobbies.forEach(hobby => {
        hobbyItemsHtml += partials.hobbyItemTemplate.replace('{hobby}', hobby);
      });
      
      template = template.replace('{hobbyItems}', hobbyItemsHtml);
    }
    
    // --- Proje bölümünü oluştur (varsa) ---
    if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
      let projectItemsHtml = '';
      
      for (const project of data.projects) {
        let descriptionsHtml = '';
        if (project.descriptions && Array.isArray(project.descriptions)) {
          project.descriptions.forEach(desc => {
            descriptionsHtml += partials.experienceDescriptionTemplate.replace('{description}', desc);
          });
        }
        
        let projectItemHtml = partials.projectItemTemplate
          .replace('{title}', project.title || '')
          .replace('{company}', project.company || '')
          .replace('{date}', project.date || '')
          .replace('{descriptions}', descriptionsHtml);
          
        projectItemsHtml += projectItemHtml;
      }
      
      const projectSectionHtml = partials.projectSectionTemplate.replace('{projectItems}', projectItemsHtml);
      template = template.replace('{projectSection}', projectSectionHtml);
    } else {
      template = template.replace('{projectSection}', '');
    }
    
    // --- Sertifika bölümünü oluştur (varsa) ---
    if (data.certificates && Array.isArray(data.certificates) && data.certificates.length > 0) {
      let certificateItemsHtml = '';
      
      for (const cert of data.certificates) {
        let certItemHtml = partials.certificateItemTemplate
          .replace('{title}', cert.title || '')
          .replace('{date}', cert.date || '');
          
        certificateItemsHtml += certItemHtml;
      }
      
      const certificateSectionHtml = partials.certificatesSectionTemplate.replace('{certificateItems}', certificateItemsHtml);
      template = template.replace('{certificatesSection}', certificateSectionHtml);
    } else {
      template = template.replace('{certificatesSection}', '');
    }
    
    // --- Ödül bölümünü oluştur (varsa) ---
    if (data.awards && Array.isArray(data.awards) && data.awards.length > 0) {
      let awardItemsHtml = '';
      
      for (const award of data.awards) {
        let awardItemHtml = partials.awardItemTemplate
          .replace('{title}', award.title || '')
          .replace('{date}', award.date || '');
          
        awardItemsHtml += awardItemHtml;
      }
      
      const awardSectionHtml = partials.awardsSectionTemplate.replace('{awardItems}', awardItemsHtml);
      template = template.replace('{awardsSection}', awardSectionHtml);
    } else {
      template = template.replace('{awardsSection}', '');
    }
    
    return template;
  }
}

module.exports = new TemplateService(); 