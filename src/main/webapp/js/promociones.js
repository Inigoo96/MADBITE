// PROMOTIONS.JS - Functionality for the promotions page

document.addEventListener('DOMContentLoaded', function() {
    // DOM element references
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const profileDropdown = document.getElementById('profileDropdown');
    const languageSelector = document.querySelector('.language-selector');
    const faqItems = document.querySelectorAll('.faq-item');
    const filterButtons = document.querySelectorAll('.promo-filter-btn');
    const promoCards = document.querySelectorAll('.promo-card');
    const loadMoreBtn = document.getElementById('loadMorePromos');
    const sliderDots = document.querySelectorAll('.promo-slider-dot');
    const sliderPrev = document.querySelector('.promo-slider-prev');
    const sliderNext = document.querySelector('.promo-slider-next');
    const sliderSlides = document.querySelectorAll('.promo-featured-slide');
    const scrollUpBtn = document.getElementById('scrollUp');

    // ===== MOBILE MENU FUNCTIONALITY =====
    // Basic navigation aspects are imported from main.js
    // But we add page-specific functionality if necessary

    // ===== FAQ FUNCTIONALITY =====
    // Toggle for frequently asked questions
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close all other FAQs
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle the current FAQ
            item.classList.toggle('active');
        });
    });

    // ===== PROMOTIONS FILTERING =====
    // Filtering system for promotions
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get the button's category
            const filterValue = button.getAttribute('data-filter');
            
            // Filter the promotion cards
            promoCards.forEach(card => {
                // If filter is 'all', show all cards
                if (filterValue === 'all') {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    // Check if card has the selected category
                    if (card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 100);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                }
            });
        });
    });

    // ===== LOAD MORE PROMOTIONS =====
    // Simulating loading more promotions (would connect to backend in production)
    if (loadMoreBtn) {
        let isLoading = false;
        loadMoreBtn.addEventListener('click', () => {
            if (isLoading) return;
            
            // Change text and add a spinner during loading
            isLoading = true;
            const originalText = loadMoreBtn.innerHTML;
            loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> LOADING...';
            
            // Simulate loading time
            setTimeout(() => {
                // Real logic to load more promotions would be implemented here
                // For now, just change the text to simulate no more promotions
                loadMoreBtn.innerHTML = 'NO MORE PROMOTIONS';
                loadMoreBtn.disabled = true;
                loadMoreBtn.style.opacity = '0.5';
                isLoading = false;
            }, 1500);
        });
    }

    // ===== FEATURED PROMOTIONS SLIDER =====
    // Initialize the slider
    let currentSlide = 0;
    const totalSlides = sliderSlides.length;
    
    // Initially show only the first slide
    showSlide(currentSlide);
    
    // Function to show a specific slide
    function showSlide(index) {
        // Hide all slides
        sliderSlides.forEach(slide => {
            slide.style.display = 'none';
        });
        
        // Deactivate all dots
        sliderDots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Show the current slide
        sliderSlides[index].style.display = 'block';
        
        // Activate the corresponding dot
        sliderDots[index].classList.add('active');
    }
    
    // Change to next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }
    
    // Change to previous slide
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }
    
    // Events for slider buttons
    if (sliderPrev) {
        sliderPrev.addEventListener('click', prevSlide);
    }
    
    if (sliderNext) {
        sliderNext.addEventListener('click', nextSlide);
    }
    
    // Events for indicator dots
    sliderDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
    
    // Auto-rotation of slider every 5 seconds
    setInterval(nextSlide, 5000);

    // ===== SCROLL UP =====
    // Show/hide scroll up button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollUpBtn.classList.add('show');
        } else {
            scrollUpBtn.classList.remove('show');
        }
    });
    
    // Scroll up functionality
    scrollUpBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ===== ENTRANCE ANIMATIONS =====
    // Detect elements when they enter the viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }
    
    // Animate elements when they appear on screen
    function animateOnScroll() {
        const animatedElements = document.querySelectorAll('.promo-card, .promo-especial-card');
        
        animatedElements.forEach(element => {
            if (isInViewport(element) && !element.classList.contains('animated')) {
                element.classList.add('animated');
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Run animation on load and on scroll
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);

    // ===== SAVE FAVORITE PROMOTIONS =====
    // Add functionality to save favorite promotions
    const promoButtons = document.querySelectorAll('.promo-card-button, .promo-featured-button, .promo-especial-button');
    
    promoButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // If the button says "REDEEM" or similar, do nothing here (let it handle through its link)
            if (this.textContent.includes('REDEEM') || this.textContent.includes('MORE INFO') || this.textContent.includes('SIGN UP')) {
                return;
            }
            
            // For other buttons (like favorites), implement logic here
            e.preventDefault();
            
            // Show confirmation
            const promoName = this.closest('.promo-card, .promo-featured-card, .promo-especial-card').querySelector('h3').textContent;
            
            // Real logic to save to favorites would be implemented here
            alert(`The promotion "${promoName}" has been saved to your favorites.`);
        });
    });

    // ===== PROMOTION CODE TO CLIPBOARD =====
    // Allow users to copy promotion code on click
    const promoCodes = document.querySelectorAll('.promo-card-code strong, .promo-featured-code strong');
    
    promoCodes.forEach(code => {
        code.addEventListener('click', async function() {
            const codeText = this.textContent;
            
            try {
                await navigator.clipboard.writeText(codeText);
                
                // Visual feedback
                const originalText = this.textContent;
                const originalColor = this.style.color;
                
                this.textContent = 'COPIED!';
                this.style.color = '#00F0FF';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.color = originalColor;
                }, 1500);
            } catch (err) {
                console.error('Could not copy text: ', err);
            }
        });
        
        // Change cursor and add tooltip to indicate it's copyable
        code.style.cursor = 'pointer';
        code.setAttribute('title', 'Click to copy');
    });
});