/**
 * Menu Language Switcher - Versión simplificada
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando selector de idioma menu.html');
    
    // Variables básicas
    const STORAGE_KEY = 'madbite-lang';
    const DEFAULT_LANG = 'es';
    const LANG_FILES = {
        'es': '../lang/menu-es.json',
        'en': '../lang/menu-en.json',
        'fr': '../lang/menu-fr.json'
    };
      
    
    // Elementos DOM
    const languageSelector = document.querySelector('.language-selector');
    const selectedLanguage = document.querySelector('.selected-language');
    const languageOptions = document.querySelectorAll('.language-option');
    const downloadBtn = document.querySelector('.download-btn');
    
    // Idioma actual
    const currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    console.log('Idioma actual:', currentLang);
    
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
    
    // Configurar eventos - limpiar los anteriores primero
    function setupEvents() {
        if (selectedLanguage && languageSelector) {
            // Toggle del dropdown
            selectedLanguage.onclick = function(e) {
                e.stopPropagation();
                languageSelector.classList.toggle('open');
                console.log('Toggle dropdown:', languageSelector.classList.contains('open'));
            };
            
            // Cerrar al hacer clic fuera
            document.onclick = function() {
                languageSelector.classList.remove('open');
            };
        }
        
        // Eventos de opciones
        if (languageOptions && languageOptions.length > 0) {
            languageOptions.forEach(option => {
                option.onclick = function(e) {
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
                    
                    // Recargar página
                    window.location.reload();
                };
            });
        }
    }
    
    // Si hay un selector de idioma, iniciarlo
    if (languageSelector && selectedLanguage && languageOptions.length > 0) {
        initSelector();
        setupEvents();
        console.log('Selector de idioma inicializado');
    } else {
        console.warn('No se encontraron elementos del selector de idioma');
    }
    
    // Si no es el idioma base, cargar traducciones
    if (currentLang !== DEFAULT_LANG) {
        console.log(`Cargando archivo de idioma: ${LANG_FILES[currentLang]}`);
        fetch(LANG_FILES[currentLang])
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al cargar archivo de idioma (${response.status})`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Traducciones cargadas');
                applyTranslations(data);
            })
            .catch(error => {
                console.error('Error cargando traducciones:', error);
            });
    }
    
    // Función para aplicar traducciones
    function applyTranslations(data) {
        // 1. Título de la página
        document.title = data.head.title;
        
        // 2. Navegación
        document.querySelectorAll('.nav-item a').forEach(link => {
            const text = link.textContent.trim();
            
            if (text === 'Inicio' || text === 'Home' || text === 'Accueil') {
                link.textContent = data.nav.home;
            } else if (text === 'Menú' || text === 'Menu') {
                link.textContent = data.nav.menu;
            } else if (text === 'Destacados' || text === 'Featured' || text === 'À la une') {
                link.textContent = data.nav.featured;
            } else if (text === 'Nosotros' || text === 'About Us' || text === 'À propos') {
                link.textContent = data.nav.about;
            } else if (text === 'Locales' || text === 'Locations' || text === 'Emplacements') {
                link.textContent = data.nav.locations;
            } else if (text === 'Contacto' || text === 'Contact') {
                link.textContent = data.nav.contact;
            }
        });
        
        // 3. Hero
        const heroTitle = document.querySelector('.menu-hero-title');
        const heroSubtitle = document.querySelector('.menu-hero-subtitle');
        
        if (heroTitle) heroTitle.innerHTML = data.menuHero.title;
        if (heroSubtitle) heroSubtitle.textContent = data.menuHero.subtitle;
        
        // 3.1 Botón de descarga en el hero
        if (downloadBtn && data.menuHero.downloadButton) {
            downloadBtn.innerHTML = data.menuHero.downloadButton;
        }
        
        // 4. Categorías
        document.querySelectorAll('.category-link').forEach(link => {
            const text = link.textContent.trim();
            
            if (text === 'Hamburguesas' || text === 'Burgers') {
                link.textContent = data.categories.burgers;
            } else if (text === 'Pollo' || text === 'Chicken' || text === 'Poulet') {
                link.textContent = data.categories.chicken;
            } else if (text === 'Veggie') {
                link.textContent = data.categories.veggie;
            } else if (text === 'Para Picar' || text === 'Sides' || text === 'Accompagnements') {
                link.textContent = data.categories.sides;
            } else if (text === 'Postres' || text === 'Desserts') {
                link.textContent = data.categories.desserts;
            } else if (text === 'Bebidas' || text === 'Beverages' || text === 'Boissons') {
                link.textContent = data.categories.beverages;
            } else if (text === 'Salsas' || text === 'Sauces') {
                link.textContent = data.categories.sauces;
            } else if (text === 'Combos' || text === 'Menus') {
                link.textContent = data.categories.combos;
            }
        });
        
        // 5. Títulos de sección
        document.querySelectorAll('.section-title').forEach(title => {
            const section = title.closest('.menu-section');
            if (!section) return;
            
            const id = section.id;
            if (id === 'hamburguesas' && data.sections.burgers) {
                title.innerHTML = data.sections.burgers.title;
            } else if (id === 'pollo' && data.sections.chicken) {
                title.innerHTML = data.sections.chicken.title;
            } else if (id === 'veggie' && data.sections.veggie) {
                title.innerHTML = data.sections.veggie.title;
            } else if (id === 'para-picar' && data.sections.sides) {
                title.innerHTML = data.sections.sides.title;
            } else if (id === 'postres' && data.sections.desserts) {
                title.innerHTML = data.sections.desserts.title;
            } else if (id === 'bebidas' && data.sections.beverages) {
                title.innerHTML = data.sections.beverages.title;
            } else if (id === 'salsas' && data.sections.sauces) {
                title.innerHTML = data.sections.sauces.title;
            } else if (id === 'combos' && data.sections.combos) {
                title.innerHTML = data.sections.combos.title;
            }
        });
        
        // 6. Badges/etiquetas
        document.querySelectorAll('.menu-item-badge').forEach(badge => {
            const text = badge.textContent.trim().toLowerCase();
            
            if (text === 'bestseller' && data.badges.bestseller) {
                badge.textContent = data.badges.bestseller;
            } else if ((text === 'nueva' || text === 'nuevo' || text === 'new' || text === 'nouveau') && data.badges.new) {
                badge.textContent = data.badges.new;
            } else if ((text === 'picante' || text === 'spicy' || text === 'épicé') && data.badges.spicy) {
                badge.textContent = data.badges.spicy;
            } else if (text === 'veggie' && data.badges.veggie) {
                badge.textContent = data.badges.veggie;
            }
        });
        
        // 7. Traducciones de los elementos del menú
        translateMenuItems(data);
        
        // 8. Traducciones del footer
        translateFooter(data);
        
        console.log('Traducciones aplicadas correctamente');
    }
    
    // Función para traducir el footer
    function translateFooter(data) {
        if (!data.footer) return;
        
        // Descripción
        const footerDesc = document.querySelector('.footer-description');
        if (footerDesc && data.footer.description) {
            footerDesc.textContent = data.footer.description;
        }
        
        // Enlaces y títulos de sección
        document.querySelectorAll('.footer-heading').forEach(heading => {
            const text = heading.textContent.trim();
            
            if ((text === 'Enlaces' || text === 'Links' || text === 'Liens') && data.footer.links) {
                heading.textContent = data.footer.links;
            } else if ((text === 'Legal' || text === 'Légal') && data.footer.legal) {
                heading.textContent = data.footer.legal;
            } else if ((text === 'Newsletter') && data.footer.newsletter) {
                heading.textContent = data.footer.newsletter;
            }
        });
        
        // Links de navegación
        document.querySelectorAll('.footer-links li a').forEach(link => {
            const text = link.textContent.trim().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
            
            // Enlaces de navegación
            if (text.includes('Inicio') || text.includes('Home') || text.includes('Accueil')) {
                link.textContent = `${link.textContent.replace(/Inicio|Home|Accueil/g, data.nav.home)}`;
            } else if (text.includes('Menú') || text.includes('Menu')) {
                link.textContent = `${link.textContent.replace(/Menú|Menu/g, data.nav.menu)}`;
            } else if (text.includes('Destacados') || text.includes('Featured') || text.includes('À la une')) {
                link.textContent = `${link.textContent.replace(/Destacados|Featured|À la une/g, data.nav.featured)}`;
            } else if (text.includes('Nosotros') || text.includes('About Us') || text.includes('À propos')) {
                link.textContent = `${link.textContent.replace(/Nosotros|About Us|À propos/g, data.nav.about)}`;
            } else if (text.includes('Locales') || text.includes('Locations') || text.includes('Emplacements')) {
                link.textContent = `${link.textContent.replace(/Locales|Locations|Emplacements/g, data.nav.locations)}`;
            } else if (text.includes('Contacto') || text.includes('Contact')) {
                link.textContent = `${link.textContent.replace(/Contacto|Contact/g, data.nav.contact)}`;
            }
            
            // Enlaces legales
            else if (text.includes('Términos') || text.includes('Terms') || text.includes('Conditions')) {
                link.textContent = `${link.textContent.replace(/Términos.*|Terms.*/g, data.footer.terms)}`;
            } else if (text.includes('Privacidad') || text.includes('Privacy') || text.includes('Confidentialité')) {
                link.textContent = `${link.textContent.replace(/Política de Privacidad|Privacy Policy|Politique de Confidentialité/g, data.footer.privacy)}`;
            } else if (text.includes('Cookies')) {
                link.textContent = `${link.textContent.replace(/Política de Cookies|Cookies Policy|Politique de Cookies/g, data.footer.cookies)}`;
            } else if (text.includes('FAQ')) {
                link.textContent = `${link.textContent.replace(/FAQ/g, data.footer.faq)}`;
            }
        });
        
        // Newsletter
        const newsletterText = document.querySelector('.newsletter-text');
        if (newsletterText && data.footer.subscribeText) {
            newsletterText.textContent = data.footer.subscribeText;
        }
        
        // Input placeholder
        const newsletterInput = document.querySelector('.newsletter-input');
        if (newsletterInput && data.footer.emailPlaceholder) {
            newsletterInput.placeholder = data.footer.emailPlaceholder;
        }
        
        // Disclaimer
        const formDisclaimer = document.querySelector('.form-disclaimer');
        if (formDisclaimer && data.footer.disclaimer) {
            formDisclaimer.textContent = data.footer.disclaimer;
        }
        
        // Copyright
        const copyright = document.querySelector('.copyright .container');
        if (copyright && data.footer.copyright) {
            // Mantener el año y la marca
            const year = new Date().getFullYear();
            copyright.innerHTML = `&copy; ${year} <span>MADBITE</span>. ${data.footer.copyright}`;
        }
    }
    
    // Nueva función para traducir elementos de menú
    function translateMenuItems(data) {
        // Método directo: traducir directamente por secciones
        translateBurgers(data);
        translateChicken(data);
        translateVeggie(data);
        translateSides(data);
        translateDesserts(data);
        translateBeverages(data);
        translateSauces(data);
        translateCombos(data);
        
        console.log('Traducciones de elementos de menú completadas');
    }
  
    // Funciones específicas por sección
    function translateBurgers(data) {
        if (!data.burgers) return;
        
        // The Classic MADBITE
        translateSpecificItem('#hamburguesas .menu-item:nth-child(1)', 
            data.burgers.classic);
        
        // Cheese Lover
        translateSpecificItem('#hamburguesas .menu-item:nth-child(2)', 
            data.burgers.cheese);
        
        // Diablo
        translateSpecificItem('#hamburguesas .menu-item:nth-child(3)', 
            data.burgers.diablo);
        
        // BBQ Deluxe
        translateSpecificItem('#hamburguesas .menu-item:nth-child(4)', 
            data.burgers.bbq);
    }
  
    function translateChicken(data) {
        if (!data.chicken) return;
        
        // Inferno Chicken
        translateSpecificItem('#pollo .menu-item:nth-child(1)', 
            data.chicken.inferno);
        
        // Crispy Ranch
        translateSpecificItem('#pollo .menu-item:nth-child(2)', 
            data.chicken.crispy);
        
        // Buffalo Chicken
        translateSpecificItem('#pollo .menu-item:nth-child(3)', 
            data.chicken.buffalo);
        
        // Double Crispy
        translateSpecificItem('#pollo .menu-item:nth-child(4)', 
            data.chicken.double);
        
        // Spicy Asian
        translateSpecificItem('#pollo .menu-item:nth-child(5)', 
            data.chicken.asian);
    }
  
    function translateVeggie(data) {
        if (!data.veggie) return;
        
        // Falafel Burger
        translateSpecificItem('#veggie .menu-item:nth-child(1)', 
            data.veggie.falafel);
        
        // Beyond Classic
        translateSpecificItem('#veggie .menu-item:nth-child(2)', 
            data.veggie.beyond);
    }
  
    function translateSides(data) {
        if (!data.sides) return;
        
        // Spicy Wings
        translateSpecificItem('#para-picar .menu-item:nth-child(1)', 
            data.sides.wings);
        
        // Wings with Fries
        translateSpecificItem('#para-picar .menu-item:nth-child(2)', 
            data.sides.wings_fries);
        
        // Onion Rings
        translateSpecificItem('#para-picar .menu-item:nth-child(3)', 
            data.sides.onion_rings);
        
        // Caesar Salad
        translateSpecificItem('#para-picar .menu-item:nth-child(4)', 
            data.sides.caesar);
        
        // Fresh Salad
        translateSpecificItem('#para-picar .menu-item:nth-child(5)', 
            data.sides.fresh_salad);
        
        // Chicken Nuggets
        translateSpecificItem('#para-picar .menu-item:nth-child(6)', 
            data.sides.nuggets);
        
        // Potato Wedges
        translateSpecificItem('#para-picar .menu-item:nth-child(7)', 
            data.sides.wedges);
        
        // Rustic Fries
        translateSpecificItem('#para-picar .menu-item:nth-child(8)', 
            data.sides.fries);
    }
  
    function translateDesserts(data) {
        if (!data.desserts) return;
        
        // Chocolate Coulant
        translateSpecificItem('#postres .menu-item:nth-child(1)', 
            data.desserts.chocolate);
        
        // MADBITE Sundae
        translateSpecificItem('#postres .menu-item:nth-child(2)', 
            data.desserts.sundae);
        
        // Chocolate Cake
        translateSpecificItem('#postres .menu-item:nth-child(3)', 
            data.desserts.cake);
        
        // Cheesecake
        translateSpecificItem('#postres .menu-item:nth-child(4)', 
            data.desserts.cheesecake);
        
        // Tiramisu
        translateSpecificItem('#postres .menu-item:nth-child(5)', 
            data.desserts.tiramisu);
    }
  
    function translateBeverages(data) {
        if (!data.beverages) return;
        
        const beverageSelectors = [
            { selector: '#bebidas .menu-item:nth-child(1)', key: 'sparkling' },
            { selector: '#bebidas .menu-item:nth-child(2)', key: 'water' },
            { selector: '#bebidas .menu-item:nth-child(3)', key: 'amber' },
            { selector: '#bebidas .menu-item:nth-child(4)', key: 'aquarius_lemon' },
            { selector: '#bebidas .menu-item:nth-child(5)', key: 'aquarius_orange' },
            { selector: '#bebidas .menu-item:nth-child(6)', key: 'budweiser' },
            { selector: '#bebidas .menu-item:nth-child(7)', key: 'corona' },
            { selector: '#bebidas .menu-item:nth-child(8)', key: 'desperados' },
            { selector: '#bebidas .menu-item:nth-child(9)', key: 'estrella' },
            { selector: '#bebidas .menu-item:nth-child(10)', key: 'coke_zero' },
            { selector: '#bebidas .menu-item:nth-child(11)', key: 'coke' },
            { selector: '#bebidas .menu-item:nth-child(12)', key: 'fanta_lemon' },
            { selector: '#bebidas .menu-item:nth-child(13)', key: 'fanta_orange' },
            { selector: '#bebidas .menu-item:nth-child(14)', key: 'redbull' },
            { selector: '#bebidas .menu-item:nth-child(15)', key: 'sprite' }
        ];
        
        beverageSelectors.forEach(item => {
            if (data.beverages[item.key]) {
                translateSpecificItem(item.selector, data.beverages[item.key]);
            }
        });
    }
  
    function translateSauces(data) {
        if (!data.sauces) return;
        
        // Aioli
        translateSpecificItem('#salsas .menu-item:nth-child(1)', 
            data.sauces.aioli);
        
        // Barbecue
        translateSpecificItem('#salsas .menu-item:nth-child(2)', 
            data.sauces.bbq);
        
        // Brava
        translateSpecificItem('#salsas .menu-item:nth-child(3)', 
            data.sauces.brava);
        
        // Ketchup
        translateSpecificItem('#salsas .menu-item:nth-child(4)', 
            data.sauces.ketchup);
        
        // MADBITE Secret
        translateSpecificItem('#salsas .menu-item:nth-child(5)', 
            data.sauces.secret);
        
        // Ranch
        translateSpecificItem('#salsas .menu-item:nth-child(6)', 
            data.sauces.ranch);
    }
  
    function translateCombos(data) {
        if (!data.combos) return;
        
        // Classic Combo
        translateSpecificItem('#combos .menu-item:nth-child(1)', 
            data.combos.classic);
        
        // Cheese Combo
        translateSpecificItem('#combos .menu-item:nth-child(2)', 
            data.combos.cheese);
        
        // Diablo Combo
        translateSpecificItem('#combos .menu-item:nth-child(3)', 
            data.combos.diablo);
        
        // Chicken Combo
        translateSpecificItem('#combos .menu-item:nth-child(4)', 
            data.combos.chicken);
        
        // Veggie Combo
        translateSpecificItem('#combos .menu-item:nth-child(5)', 
            data.combos.veggie);
        
        // Family Combo
        translateSpecificItem('#combos .menu-item:nth-child(6)', 
            data.combos.family);
    }
  
    // Función auxiliar para traducir un elemento específico
    function translateSpecificItem(selector, itemData) {
        if (!itemData) return;
        
        const item = document.querySelector(selector);
        if (!item) {
            console.warn(`No se encontró el elemento con selector: ${selector}`);
            return;
        }
        
        const titleEl = item.querySelector('.menu-item-title');
        const descEl = item.querySelector('.menu-item-description');
        const priceEl = item.querySelector('.menu-item-price');
        
        if (titleEl && itemData.title) {
            titleEl.textContent = itemData.title;
        }
        
        if (descEl && itemData.description) {
            descEl.textContent = itemData.description;
        }
        
        if (priceEl && itemData.price) {
            priceEl.textContent = itemData.price;
        }
    }
});