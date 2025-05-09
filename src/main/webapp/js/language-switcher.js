/**
 * Index Language Switcher - Adaptado del estilo de menu-language.js
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando selector de idioma index.html');
  
  // Variables básicas
  const STORAGE_KEY = 'madbite-lang';
  const DEFAULT_LANG = 'es';
  const LANG_FILES = {
      'es': '../lang/index-es.json',
      'en': '../lang/index-en.json',
      'fr': '../lang/index-fr.json'
  };
  
  // Elementos DOM
  const languageSelector = document.querySelector('.language-selector');
  const selectedLanguage = document.querySelector('.selected-language');
  const languageOptions = document.querySelectorAll('.language-option');
  
  // Idioma actual
  let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  console.log('Idioma actual:', currentLang);
  
  /* === arranque === */
  // Inicializar el selector con el idioma correcto al cargar la página
  initSelector();
  
  // Si no es el idioma base, cargar las traducciones
  if (currentLang !== DEFAULT_LANG) loadTranslations(currentLang);
  
  // Función para inicializar el selector
  function initSelector() {
      // Establecer la opción activa
      const activeOption = document.querySelector(`.language-option[data-lang="${currentLang}"]`);
      if (activeOption) {
          languageOptions.forEach(opt => opt.classList.remove('active'));
          activeOption.classList.add('active');
          
          // Actualizar el selector visible
          const flag = activeOption.querySelector('img')?.src;
          const text = activeOption.querySelector('span')?.textContent;
          
          if (flag && selectedLanguage.querySelector('img')) {
              selectedLanguage.querySelector('img').src = flag;
          }
          
          if (text && selectedLanguage.querySelector('span')) {
              selectedLanguage.querySelector('span').textContent = text;
          }
      }
  }
  
  // Configurar eventos
  if (selectedLanguage && languageSelector) {
      // Toggle del dropdown
      selectedLanguage.addEventListener('click', e => {
          e.stopPropagation();
          languageSelector.classList.toggle('open');
      });
      
      // Cerrar al hacer clic fuera
      document.addEventListener('click', () => {
          languageSelector.classList.remove('open');
      });
  }
  
// Eventos de opciones
if (languageOptions && languageOptions.length > 0) {
    languageOptions.forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.dataset.lang;
            if (lang === currentLang) return;
            
            // Actualizar UI
            languageOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            const flag = option.querySelector('img').src;
            const label = option.querySelector('span').textContent;
            
            selectedLanguage.querySelector('img').src = flag;
            selectedLanguage.querySelector('span').textContent = label;
            
            // Guardar idioma y recargar
            currentLang = lang;
            localStorage.setItem(STORAGE_KEY, lang);
            
            // Siempre recargar la página al cambiar de idioma para asegurar consistencia
            location.reload();
        });
    });
}
  
  /* === núcleo de traducción === */
  async function loadTranslations(lang) {
      try {
          console.log(`Cargando archivo de idioma: ${LANG_FILES[lang]}`);
          const [base, target] = await Promise.all([
              fetchJSON(LANG_FILES[DEFAULT_LANG]),
              fetchJSON(LANG_FILES[lang])
          ]);
          
          const map = buildMap(base, target);   // diccionario ES → EN/FR
          
          // Aplicar traducciones
          translateNodes(map);
          translatePlaceholders(map);
          translateDataText(map);
          
          // Traducciones específicas de secciones
          translateSpecificSections(target);
          
          console.log('Traducciones aplicadas correctamente');
      } catch (err) {
          console.error('Error de i18n:', err);
      }
  }
  
  function fetchJSON(file) {
      return fetch(file, { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' } 
      }).then(r => {
          if (!r.ok) throw new Error(`No encontrado: ${file}`);
          return r.json();
      });
  }
  
  function buildMap(base, target, out = {}) {
      for (const k in base) {
          const val = base[k];
          if (typeof val === 'string') {
              out[val] = target?.[k] ?? val;
          } else if (typeof val === 'object') {
              buildMap(val, target?.[k] || {}, out);
          }
      }
      return out;
  }
  
  /* --- traducciones DOM --- */
  function translateNodes(map) {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
          const orig = node.nodeValue.trim();
          if (map[orig]) {
              node.nodeValue = node.nodeValue.replace(orig, map[orig]);
          }
      }
  }
  
  function translatePlaceholders(map) {
      document.querySelectorAll('[placeholder]').forEach(el => {
          const ph = el.getAttribute('placeholder').trim();
          if (map[ph]) el.setAttribute('placeholder', map[ph]);
      });
  }
  
  function translateDataText(map) {
      document.querySelectorAll('[data-text]').forEach(el => {
          const dt = el.dataset.text.trim();
          if (map[dt]) el.dataset.text = map[dt];
      });
  }
  
  // Nueva función para traducciones específicas de secciones
  function translateSpecificSections(data) {
      // 1. Título de la página
      if (data.head && data.head.title) {
          document.title = data.head.title;
      }
      
      // 2. Navegación
      if (data.nav) {
          document.querySelectorAll('.nav-item a').forEach(link => {
              const text = link.textContent.trim();
              
              if ((text === 'Inicio' || text === 'Home' || text === 'Accueil') && data.nav.home) {
                  link.textContent = data.nav.home;
              } else if ((text === 'Menú' || text === 'Menu') && data.nav.menu) {
                  link.textContent = data.nav.menu;
              } else if ((text === 'Destacados' || text === 'Featured' || text === 'À la une') && data.nav.featured) {
                  link.textContent = data.nav.featured;
              } else if ((text === 'Nosotros' || text === 'About Us' || text === 'À propos') && data.nav.about) {
                  link.textContent = data.nav.about;
              } else if ((text === 'Locales' || text === 'Locations' || text === 'Emplacements') && data.nav.locations) {
                  link.textContent = data.nav.locations;
              } else if ((text === 'Contacto' || text === 'Contact') && data.nav.contact) {
                  link.textContent = data.nav.contact;
              }
          });
      }
      
      // 3. Hero
      if (data.hero) {
          const heroTitle = document.querySelector('.hero-title');
          const heroSubtitle = document.querySelector('.hero-subtitle');
          
          if (heroTitle && data.hero.title) heroTitle.innerHTML = data.hero.title;
          if (heroSubtitle && data.hero.subtitle) heroSubtitle.textContent = data.hero.subtitle;
      }
      
      // 4. Featured/Destacados
      if (data.featured) {
          translateFeatured(data.featured);
      }
      
      // 5. CTA
      if (data.cta) {
          translateCTA(data.cta);
      }
      
      // 6. Footer
      if (data.footer) {
          translateFooter(data.footer);
      }
      
      // 7. Traducciones específicas adicionales (ejemplo: correcciones especiales)
      if (data.featured && data.featured.card3) {
          const card3 = document.querySelector('.featured-card:nth-child(3)');
          if (card3) {
              const titleEl = card3.querySelector('.featured-card-title');
              const descEl = card3.querySelector('.featured-card-description');
              const priceEl = card3.querySelector('.featured-card-price');
              
              if (titleEl) titleEl.textContent = data.featured.card3.title;
              if (descEl) descEl.textContent = data.featured.card3.description;
              if (priceEl) priceEl.textContent = data.featured.card3.price;
          }
      }
  }
  
  // Funciones específicas para diferentes secciones
  function translateFeatured(featuredData) {
      document.querySelectorAll('.featured-card').forEach((card, index) => {
          const cardData = featuredData[`card${index + 1}`];
          if (!cardData) return;
          
          const titleEl = card.querySelector('.featured-card-title');
          const descEl = card.querySelector('.featured-card-description');
          const priceEl = card.querySelector('.featured-card-price');
          const buttonEl = card.querySelector('.featured-card-button');
          
          if (titleEl && cardData.title) titleEl.innerHTML = cardData.title;
          if (descEl && cardData.description) descEl.textContent = cardData.description;
          if (priceEl && cardData.price) priceEl.textContent = cardData.price;
          if (buttonEl && cardData.button) buttonEl.textContent = cardData.button;
      });
  }
  
  function translateCTA(ctaData) {
      const ctaTitle = document.querySelector('.cta-title');
      const ctaText = document.querySelector('.cta-text');
      const ctaButton = document.querySelector('.cta-button');
      
      if (ctaTitle && ctaData.title) ctaTitle.innerHTML = ctaData.title;
      if (ctaText && ctaData.text) ctaText.textContent = ctaData.text;
      if (ctaButton && ctaData.button) ctaButton.textContent = ctaData.button;
  }
  
  function translateFooter(footerData) {
      // Traducir títulos de secciones del footer
      document.querySelectorAll('.footer-col-title').forEach(title => {
          const text = title.textContent.trim();
          
          if ((text === 'Enlaces' || text === 'Links' || text === 'Liens') && footerData.links_title) {
              title.textContent = footerData.links_title;
          } else if ((text === 'Horario' || text === 'Schedule' || text === 'Horaires') && footerData.schedule_title) {
              title.textContent = footerData.schedule_title;
          } else if ((text === 'Síguenos' || text === 'Follow Us' || text === 'Suivez-nous') && footerData.social_title) {
              title.textContent = footerData.social_title;
          }
      });
      
      // Traducir copyright
      const copyright = document.querySelector('.footer-copyright');
      if (copyright && footerData.copyright) {
          copyright.textContent = footerData.copyright;
      }
  }
});