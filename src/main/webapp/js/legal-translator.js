/**
 * Legal Pages Language Translator
 * Maneja traducciones para las páginas legales: términos, política, cookies y FAQ
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando traductor para páginas legales');
    
    // Variables básicas
    const STORAGE_KEY = 'madbite-lang';
    const DEFAULT_LANG = 'es';
    const LANG_FILES = {
      'es': '../lang/legal-es.json',
      'en': '../lang/legal-en.json', 
      'fr': '../lang/legal-fr.json'
    };
    
    // Nombres de idiomas
    const LANG_NAMES = {
      'es': 'Español',
      'en': 'English',
      'fr': 'Français'
    };
    
    // Mapeo de idiomas a banderas
    const FLAG_FILES = {
      'es': 'españa.png',
      'en': 'uk.png',
      'fr': 'francia.png'
    };
    
    // Elementos DOM
    const languageSelector = document.querySelector('.language-selector');
    const selectedLanguage = document.querySelector('.selected-language');
    const languageOptions = document.querySelectorAll('.language-option');
    
    // Identificar qué página estamos traduciendo
    const pageId = identifyCurrentPage();
    
    // Idioma actual
    const currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    console.log('Idioma actual:', currentLang);
    
    // Aplicar estilos necesarios para el dropdown
    applyDropdownStyles();
    
    // Función para inicializar el selector
    function initSelector() {
      console.log("Inicializando selector de idioma con idioma: " + currentLang);
      
      // Establecer la opción activa
      const activeOption = document.querySelector(`.language-option[data-lang="${currentLang}"]`);
      if (activeOption) {
        console.log("Opción activa encontrada:", activeOption);
        languageOptions.forEach(opt => opt.classList.remove('active'));
        activeOption.classList.add('active');
        
        // Mostrar el nombre completo del idioma, no las siglas
        if (selectedLanguage.querySelector('span')) {
          selectedLanguage.querySelector('span').textContent = LANG_NAMES[currentLang] || currentLang.toUpperCase();
        }
      }
      
      // Corregir las rutas de las banderas
      fixFlagPaths();
      
      // Si no es el idioma base, cargar traducciones
      if (currentLang !== DEFAULT_LANG && pageId) {
        console.log(`Cargando archivo de idioma: ${LANG_FILES[currentLang]}`);
        loadTranslations(currentLang);
      }
    }
    
    // Función para cargar las traducciones
    function loadTranslations(lang) {
      if (!LANG_FILES[lang]) {
        console.error(`No hay archivo definido para el idioma: ${lang}`);
        return;
      }
      
      // Intentar cargar desde la ruta relativa
      fetch(LANG_FILES[lang])
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error al cargar archivo de idioma (${response.status})`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Traducciones cargadas correctamente:', lang);
          applyTranslations(data);
        })
        .catch(error => {
          console.error('Error cargando traducciones:', error);
          
          // Si falla, intentar con una ruta alternativa
          const altPath = LANG_FILES[lang].replace('../', './');
          console.log('Intentando ruta alternativa:', altPath);
          
          fetch(altPath)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Error al cargar archivo alternativo de idioma (${response.status})`);
              }
              return response.json();
            })
            .then(data => {
              console.log('Traducciones cargadas desde ruta alternativa');
              applyTranslations(data);
            })
            .catch(altError => {
              console.error('Error en ruta alternativa:', altError);
              
              // Tercer intento con otra ruta
              const thirdPath = `/js/${lang === 'es' ? 'legales' : 'legal' + lang}.json`;
              console.log('Intentando tercera ruta:', thirdPath);
              
              fetch(thirdPath)
                .then(response => {
                  if (!response.ok) throw new Error(`Error en tercera ruta (${response.status})`);
                  return response.json();
                })
                .then(data => {
                  console.log('Traducciones cargadas desde tercera ruta');
                  applyTranslations(data);
                })
                .catch(thirdError => {
                  console.error('Todos los intentos fallaron:', thirdError);
                });
            });
        });
    }
    
    // Corregir las rutas de las banderas (problema con las rutas relativas)
    function fixFlagPaths() {
      // Obtener la ruta base (probando varias posibilidades)
      const pathOptions = [
        '../assets/images/flags/',
        './assets/images/flags/',
        '/assets/images/flags/'
      ];
      
      // Elegir la bandera correcta basada en el idioma actual
      const flagFile = FLAG_FILES[currentLang] || 'españa.png';
      console.log(`Bandera seleccionada para ${currentLang}: ${flagFile}`);
      
      // Función para verificar si una imagen existe
      function imageExists(url) {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });
      }
      
      // Comprobar qué ruta funciona
      async function findWorkingPath() {
        for (const path of pathOptions) {
          const exists = await imageExists(path + flagFile);
          if (exists) {
            console.log('Ruta de banderas encontrada:', path);
            return path;
          }
        }
        console.warn('No se encontró una ruta válida para las banderas, usando ruta por defecto');
        return pathOptions[0]; // Usar la primera por defecto
      }
      
      // Aplicar la ruta correcta
      findWorkingPath().then(basePath => {
        // Actualizar bandera en el selector principal
        const selectedFlag = selectedLanguage.querySelector('img');
        if (selectedFlag) {
          selectedFlag.src = basePath + flagFile;
          console.log("Bandera actualizada en selector: " + basePath + flagFile);
        }
        
        // Actualizar banderas en las opciones
        languageOptions.forEach(option => {
          const optionLang = option.getAttribute('data-lang');
          const optionFlag = FLAG_FILES[optionLang] || 'españa.png';
          const flagImg = option.querySelector('img');
          if (flagImg) {
            flagImg.src = basePath + optionFlag;
            console.log(`Bandera actualizada en opción ${optionLang}: ${basePath + optionFlag}`);
          }
        });
      });
    }
    
    // Aplicar estilos necesarios para el dropdown
    function applyDropdownStyles() {
      // Verificar si ya existen estos estilos para no duplicar
      if (!document.getElementById('dropdown-styles')) {
        const style = document.createElement('style');
        style.id = 'dropdown-styles';
        style.textContent = `
          .language-selector {
            position: relative;
            z-index: 2000;
          }
          .language-selector.open .language-dropdown {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
            pointer-events: auto;
          }
          .language-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            width: 150px;
            background: rgba(0, 0, 0, 0.85);
            border-radius: 10px;
            padding: 10px 0;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-8px);
            transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s ease;
            pointer-events: none;
          }
          .selected-language {
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.35rem;
          }
          .selected-language i {
            transition: transform 0.25s ease;
          }
          .language-selector.open .selected-language i {
            transform: rotate(180deg);
          }
        `;
        document.head.appendChild(style);
      }
    }
    
    // Configurar eventos del selector de idioma
    function setupEvents() {
      if (selectedLanguage && languageSelector) {
        // Toggle del dropdown
        selectedLanguage.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          languageSelector.classList.toggle('open');
          console.log('Toggle dropdown:', languageSelector.classList.contains('open'));
        });
        
        // Cerrar al hacer clic fuera
        document.addEventListener('click', function(e) {
          if (!languageSelector.contains(e.target)) {
            languageSelector.classList.remove('open');
          }
        });
      }
      
      // Eventos de opciones
      if (languageOptions && languageOptions.length > 0) {
        languageOptions.forEach(option => {
          option.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const lang = this.getAttribute('data-lang');
            console.log('Cambio de idioma a:', lang);
            
            if (lang === currentLang) {
              languageSelector.classList.remove('open');
              return;
            }
            
            // Guardar idioma
            localStorage.setItem(STORAGE_KEY, lang);
            
            // Cerrar dropdown
            languageSelector.classList.remove('open');
            
            // Recargar página para aplicar el nuevo idioma
            window.location.reload();
          });
        });
      }
    }
    
    // Identificar la página actual basada en el id del container principal
    function identifyCurrentPage() {
      if (document.getElementById('cookies')) return 'cookies';
      if (document.getElementById('faq')) return 'faq';
      if (document.getElementById('privacidad')) return 'privacy';
      if (document.getElementById('terminos')) return 'terms';
      
      // Si no coincide con ninguna de las anteriores, buscar por la URL
      const currentUrl = window.location.href.toLowerCase();
      if (currentUrl.includes('cookies')) return 'cookies';
      if (currentUrl.includes('faq')) return 'faq';
      if (currentUrl.includes('privacidad') || currentUrl.includes('privacy')) return 'privacy';
      if (currentUrl.includes('terminos') || currentUrl.includes('terms')) return 'terms';
      
      return null;
    }
    
    // Si hay un selector de idioma, iniciarlo
    if (languageSelector && selectedLanguage && languageOptions.length > 0) {
      initSelector();
      setupEvents();
      console.log(`Selector de idioma inicializado para página: ${pageId || 'desconocida'}`);
    } else {
      console.warn('No se encontraron elementos del selector de idioma o no se pudo inicializar correctamente');
    }
    
    // Función principal para aplicar traducciones
    function applyTranslations(data) {
      if (!data) {
        console.error('No hay datos de traducción disponibles');
        return;
      }
      
      try {
        // 1. Traducir elementos globales (header y footer)
        if (data.global) {
          translateGlobalElements(data.global);
        }
        
        // 2. Traducir elementos específicos de la página
        if (pageId && data[pageId]) {
          translatePageElements(data[pageId], pageId);
        } else {
          console.warn(`No se encontraron traducciones para la página: ${pageId}`);
        }
        
        console.log('Traducciones aplicadas correctamente');
      } catch (error) {
        console.error('Error al aplicar traducciones:', error);
      }
    }
    
    // Traducir elementos globales (header y footer)
    function translateGlobalElements(globalData) {
      if (!globalData) return;
      
      try {
        // Traducir navegación
        if (globalData.header && globalData.header.nav) {
          const navItems = document.querySelectorAll('.nav-item a');
          const navData = globalData.header.nav;
          
          navItems.forEach(link => {
            // Determinar qué elemento de navegación es
            if (link.href.includes('#home') || link.href.includes('index.html#home')) {
              link.textContent = navData.home;
            } else if (link.href.includes('#featured') || link.href.includes('index.html#featured')) {
              link.textContent = navData.featured;
            } else if (link.href.includes('#about') || link.href.includes('index.html#about')) {
              link.textContent = navData.about;
            } else if (link.href.includes('#locations') || link.href.includes('index.html#locations')) {
              link.textContent = navData.locations;
            } else if (link.href.includes('#contact') || link.href.includes('index.html#contact')) {
              link.textContent = navData.contact;
            } else if (link.href.includes('menu.html') || link.classList.contains('menu-highlight')) {
              link.textContent = navData.menu;
            }
          });
        }
      
        // Traducir footer
        if (globalData.footer) {
          // Descripción
          const footerDesc = document.querySelector('.footer-description');
          if (footerDesc && globalData.footer.description) {
            footerDesc.textContent = globalData.footer.description;
          }
          
          // Títulos
          const footerHeadings = document.querySelectorAll('.footer-heading');
          if (footerHeadings.length && globalData.footer.headings) {
            for (let i = 0; i < Math.min(footerHeadings.length, globalData.footer.headings.length); i++) {
              footerHeadings[i].textContent = globalData.footer.headings[i];
            }
          }
          
          // Enlaces
          const footerLinks = document.querySelectorAll('.footer-links li a');
          if (footerLinks.length && globalData.footer.links) {
            for (let i = 0; i < Math.min(footerLinks.length, globalData.footer.links.length); i++) {
              // Preservar el icono
              const icon = footerLinks[i].querySelector('i');
              footerLinks[i].innerHTML = '';
              if (icon) footerLinks[i].appendChild(icon);
              footerLinks[i].innerHTML += ' ' + globalData.footer.links[i];
            }
          }
          
          // Newsletter
          const newsletterText = document.querySelector('.newsletter-text');
          if (newsletterText && globalData.footer.newsletterText) {
            newsletterText.textContent = globalData.footer.newsletterText;
          }
          
          // Placeholder
          const newsletterInput = document.querySelector('.newsletter-input');
          if (newsletterInput && globalData.footer.emailPlaceholder) {
            newsletterInput.placeholder = globalData.footer.emailPlaceholder;
          }
          
          // Disclaimer
          const formDisclaimer = document.querySelector('.form-disclaimer');
          if (formDisclaimer && globalData.footer.formDisclaimer) {
            formDisclaimer.textContent = globalData.footer.formDisclaimer;
          }
          
          // Copyright
          const copyright = document.querySelector('.copyright .container');
          if (copyright && globalData.footer.copyright) {
            copyright.innerHTML = globalData.footer.copyright;
          }
        }
        
        // Botón volver
        const backButton = document.querySelector('.btn-back');
        if (backButton && globalData.backButton) {
          // Preservar el icono
          const icon = backButton.querySelector('i');
          backButton.innerHTML = '';
          if (icon) backButton.appendChild(icon);
          backButton.appendChild(document.createTextNode(' ' + globalData.backButton));
        }
      } catch (error) {
        console.error('Error al traducir elementos globales:', error);
      }
    }
    
    // Traducir elementos específicos de la página
    function translatePageElements(pageData, pageType) {
      try {
        // Título del documento
        if (pageData.title) {
          document.title = pageData.title;
        }
        
        // Encabezado principal
        const heading = document.querySelector('h1');
        if (heading && pageData.heading) {
          heading.innerHTML = pageData.heading;
        }
        
        // Fecha de actualización
        const updateDate = document.querySelector('.update-date');
        if (updateDate && pageData.updateDate) {
          updateDate.innerHTML = pageData.updateDate;
        }
        
        // Información de la empresa
        if (pageData.company) {
          const companyName = document.querySelector('h2');
          if (companyName && companyName.textContent.includes('MADBITE BURGER') && pageData.company.name) {
            companyName.textContent = pageData.company.name;
          }
          
          const companyInfo = document.querySelectorAll('p');
          if (companyInfo.length > 2 && pageData.company.address) {
            // Buscar el párrafo que contiene la dirección
            for (let i = 0; i < companyInfo.length; i++) {
              if (companyInfo[i].innerHTML.includes('Broadway')) {
                companyInfo[i].innerHTML = pageData.company.address;
                break;
              }
            }
          }
          
          if (companyInfo.length > 3 && pageData.company.website) {
            // Buscar el párrafo que contiene el sitio web
            for (let i = 0; i < companyInfo.length; i++) {
              if (companyInfo[i].textContent.includes('madbite.com')) {
                companyInfo[i].textContent = pageData.company.website;
                break;
              }
            }
          }
        }
        
        // Secciones H2
        if (pageData.sections) {
          const h2Sections = Array.from(document.querySelectorAll('h2')).filter(h2 => 
            !h2.textContent.includes('MADBITE BURGER')
          );
          
          for (let i = 0; i < Math.min(h2Sections.length, pageData.sections.length); i++) {
            h2Sections[i].innerHTML = pageData.sections[i].title;
          }
        }
        
        // Subsecciones H3
        if (pageData.subsections) {
          const h3Sections = document.querySelectorAll('h3');
          for (let i = 0; i < Math.min(h3Sections.length, pageData.subsections.length); i++) {
            h3Sections[i].innerHTML = pageData.subsections[i].title;
          }
        }
        
        // Párrafos
        if (pageData.paragraphs) {
          // Excluir los párrafos que ya se han traducido
          const paragraphs = Array.from(document.querySelectorAll('p')).filter(p => 
            !p.classList.contains('footer-description') && 
            !p.classList.contains('newsletter-text') && 
            !p.classList.contains('form-disclaimer') &&
            !p.classList.contains('update-date') &&
            !p.innerHTML.includes('Broadway') &&
            !p.textContent.includes('madbite.com')
          );
          
          for (let i = 0; i < Math.min(paragraphs.length, pageData.paragraphs.length); i++) {
            paragraphs[i].innerHTML = pageData.paragraphs[i];
          }
        }
        
        // Elementos de lista
        if (pageData.listItems) {
          const listItems = Array.from(document.querySelectorAll('li')).filter(li => 
            !li.classList.contains('nav-item') && 
            !li.parentElement.classList.contains('footer-links') &&
            !li.parentElement.classList.contains('language-dropdown')
          );
          
          for (let i = 0; i < Math.min(listItems.length, pageData.listItems.length); i++) {
            listItems[i].innerHTML = pageData.listItems[i];
          }
        }
        
        // Tabla de cookies (para página de cookies)
        if (pageType === 'cookies' && pageData.cookieTable) {
          const table = document.querySelector('.cookie-table');
          if (table) {
            // Traducir encabezados
            const headers = table.querySelectorAll('th');
            for (let i = 0; i < Math.min(headers.length, pageData.cookieTable.headers.length); i++) {
              headers[i].textContent = pageData.cookieTable.headers[i];
            }
            
            // Traducir filas
            const rows = table.querySelectorAll('tr:not(:first-child)');
            for (let i = 0; i < Math.min(rows.length, pageData.cookieTable.rows.length); i++) {
              const cells = rows[i].querySelectorAll('td');
              const rowData = pageData.cookieTable.rows[i];
              
              for (let j = 0; j < Math.min(cells.length, rowData.length); j++) {
                cells[j].innerHTML = rowData[j];
              }
            }
          }
        }
        
        // Enlaces a navegadores (para página de cookies)
        if (pageType === 'cookies' && pageData.browserLinks) {
          const links = document.querySelectorAll('ul:not(.nav-list):not(.language-dropdown):not(.footer-links) a');
          for (let i = 0; i < Math.min(links.length, pageData.browserLinks.length); i++) {
            const parentLi = links[i].closest('li');
            if (parentLi) {
              parentLi.innerHTML = pageData.browserLinks[i];
            }
          }
        }
        
        // Elementos específicos para FAQ
        if (pageType === 'faq') {
          translateFAQElements(pageData);
        }
      } catch (error) {
        console.error('Error al traducir elementos de página:', error);
      }
    }
    
    // Función específica para traducir elementos de FAQ
    function translateFAQElements(pageData) {
      try {
        // Traducir el campo de búsqueda
        const searchInput = document.getElementById('faqSearch');
        if (searchInput && pageData.searchPlaceholder) {
          searchInput.placeholder = pageData.searchPlaceholder;
        }
        
        // Traducir botones de categoría
        const categoryButtons = document.querySelectorAll('.faq-category');
        if (categoryButtons.length && pageData.categories) {
          for (let i = 0; i < Math.min(categoryButtons.length, pageData.categories.length); i++) {
            categoryButtons[i].textContent = pageData.categories[i];
          }
        }
        
        // Traducir preguntas y respuestas
        if (pageData.questions) {
          const questions = document.querySelectorAll('.faq-question');
          const answers = document.querySelectorAll('.faq-answer-content');
          
          for (let i = 0; i < Math.min(questions.length, pageData.questions.length); i++) {
            // Preservar icono de la pregunta
            const icon = questions[i].querySelector('i');
            questions[i].textContent = pageData.questions[i].q;
            if (icon) questions[i].appendChild(icon);
            
            // Traducir respuesta
            if (i < answers.length) {
              answers[i].innerHTML = pageData.questions[i].a;
            }
          }
        }
      } catch (error) {
        console.error('Error al traducir elementos de FAQ:', error);
      }
    }
  });