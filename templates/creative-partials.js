/**
 * Creative CV şablonu için HTML parçacıkları
 */

// Deneyim öğesi şablonu
const experienceItemTemplate = `
<div class="timeline-item">
<div class="timeline-dot"></div>
<div class="timeline-title">{title}</div>
<div class="timeline-subtitle">{company}</div>
<div class="timeline-meta">{date}</div>
<div class="timeline-description">
{descriptions}
</div>
</div>
`;

// Deneyim açıklama öğesi
const experienceDescriptionTemplate = `<div>• {description}</div>`;

// Eğitim öğesi şablonu
const educationItemTemplate = `
<div class="timeline-item">
<div class="timeline-dot"></div>
<div class="timeline-title">{degree}</div>
<div class="timeline-subtitle">{school}</div>
<div class="timeline-meta">{date}</div>
{descriptions}
</div>
`;

// Beceri öğesi şablonu
const skillItemTemplate = `<span class="skill-tag">{skill}</span>`;

// Dil öğesi şablonu
const languageItemTemplate = `<span class="language-tag">{language}</span>`;

// Hobi öğesi şablonu
const hobbyItemTemplate = `<span class="hobby-tag">{hobby}</span>`;

// Proje bölümü şablonu
const projectSectionTemplate = `
<section class="section">
<h2 class="section-title">
<div class="section-title-line"></div>
Projelerim
</h2>
<div class="timeline">
{projectItems}
</div>
</section>
`;

// Proje öğesi şablonu
const projectItemTemplate = `
<div class="timeline-item">
<div class="timeline-dot"></div>
<div class="timeline-title">{title}</div>
<div class="timeline-subtitle">{company}</div>
<div class="timeline-meta">{date}</div>
<div class="timeline-description">
{descriptions}
</div>
</div>
`;

// Sertifika bölümü şablonu
const certificatesSectionTemplate = `
<section class="section">
<h2 class="section-title">Sertifikalar</h2>
<div class="timeline">
{certificateItems}
</div>
</section>
`;

// Sertifika öğesi şablonu
const certificateItemTemplate = `
<div class="timeline-item">
<div class="timeline-dot"></div>
<div class="timeline-title">{title}</div>
<div class="timeline-meta">{date}</div>
</div>
`;

// Ödüller bölümü şablonu
const awardsSectionTemplate = `
<section class="section">
<h2 class="section-title">Ödüller</h2>
<div class="timeline">
{awardItems}
</div>
</section>
`;

// Ödül öğesi şablonu
const awardItemTemplate = `
<div class="timeline-item">
<div class="timeline-dot"></div>
<div class="timeline-title">{title}</div>
<div class="timeline-meta">{date}</div>
</div>
`;

module.exports = {
  experienceItemTemplate,
  experienceDescriptionTemplate,
  educationItemTemplate,
  skillItemTemplate,
  languageItemTemplate,
  hobbyItemTemplate,
  projectSectionTemplate,
  projectItemTemplate,
  certificatesSectionTemplate,
  certificateItemTemplate,
  awardsSectionTemplate,
  awardItemTemplate
}; 