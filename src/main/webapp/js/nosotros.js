// FRONT/js/nosotros.js
document.addEventListener('DOMContentLoaded', function() {
    initYearBadge();
    initScrollAnimations();
});

function initYearBadge() {
    const badge = document.getElementById('yearBadge');
    if (!badge) return;

    badge.addEventListener('click', function() {
        this.classList.toggle('flipped');
    });
    
    let floatValue = 0;
    let floatDirection = 1;
    
    function animateFloat() {
        if (!badge.classList.contains('flipped')) {
            floatValue += 0.1 * floatDirection;

            if (floatValue > 5 || floatValue < -5) {
                floatDirection *= -1;
            }
            
            badge.style.transform = `translateY(${floatValue}px)`;
        }
        
        requestAnimationFrame(animateFloat);
    }
    animateFloat();
}

function initScrollAnimations() {
    const elements = [
        '.stat-box',
        '.about-text p',
        '.image-container'
    ];

    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }

    function animateVisibleElements() {
        elements.forEach(selector => {
            const items = document.querySelectorAll(selector);
            
            items.forEach(item => {
                if (isInViewport(item) && !item.classList.contains('animated')) {
                    item.classList.add('animated');

                    if (item.classList.contains('stat-box')) {
                        animateCounter(item.querySelector('.stat-value'));
                    }
                }
            });
        });
    }
    
    const style = document.createElement('style');
    style.textContent = `
        .stat-box, .about-text p, .image-container {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .stat-box.animated, .about-text p.animated, .image-container.animated {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
    
    window.addEventListener('scroll', animateVisibleElements);
    
    animateVisibleElements();
}

function animateCounter(element) {
    if (!element) return;
    
    const text = element.textContent;
    const hasK = text.includes('K');
    const hasPlus = text.includes('+');

    let finalValue = parseFloat(text.replace(/[^\d.-]/g, ''));
    let startValue = 0;
    let duration = 1500; // ms
    let startTime = null;
    
    function updateCounter(timestamp) {
        if (!startTime) startTime = timestamp;
        
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        const easeOutQuad = 1 - (1 - progress) * (1 - progress);
        let currentValue = startValue + (finalValue - startValue) * easeOutQuad;
        
        let formattedValue;
        if (Number.isInteger(finalValue)) {
            formattedValue = Math.floor(currentValue);
        } else {
            formattedValue = currentValue.toFixed(1);
        }
        
        let suffix = '';
        if (hasK) suffix += 'K';
        if (hasPlus) suffix += '+';
        
        const plusElement = element.querySelector('.stat-plus');
        if (plusElement) {
            element.childNodes[0].nodeValue = formattedValue;
        } else {
            element.textContent = formattedValue + suffix;
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}