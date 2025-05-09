/**
 * Logo Animation Script - MADBITE
 * Controls the bite sequence animation of the logo
 */
document.addEventListener('DOMContentLoaded', function() {
  // Get logo element
  const logoLink = document.querySelector('.logo-link');
  
  // Animation state variables
  let isAnimating = false;
  let currentBite = 0;
  let animationTimeout;
  let autoAnimationInterval;

  // Animation sequence configuration
  const biteSequence = ['', 'bite-1', 'bite-2', 'bite-3'];
  const biteDelays = [300, 180, 180, 1200]; // Adjusted timings for smoother animation
  
  /**
   * Advances to the next bite in the sequence
   */
  function nextBite() {
    if (isAnimating) return;
    
    isAnimating = true;
    
    // Remove current bite class
    logoLink.classList.remove(...biteSequence.filter(Boolean));
    
    // Advance to next bite
    currentBite = (currentBite + 1) % biteSequence.length;
    
    // Apply current bite class
    if (currentBite > 0) {
      logoLink.classList.add(biteSequence[currentBite]);
    }
    
    // Schedule next bite
    animationTimeout = setTimeout(() => {
      isAnimating = false;
      
      // Handle end of sequence
      if (currentBite === biteSequence.length - 1) {
        setTimeout(() => {
          logoLink.classList.remove(...biteSequence.filter(Boolean));
          currentBite = 0;
          isAnimating = false;
        }, 1200); // Slightly longer pause at the end
      } else if (currentBite > 0) {
        // Continue sequence automatically
        nextBite();
      }
    }, biteDelays[currentBite]);
  }
  
  /**
   * Starts automatic animation cycle
   */
  function startAutoAnimation() {
    clearInterval(autoAnimationInterval);
    autoAnimationInterval = setInterval(() => {
      if (!isAnimating) {
        nextBite();
      }
    }, 6000); // Slightly longer interval between animations
  }
  
  // Event listeners
  
  // Click to trigger animation
  logoLink.addEventListener('click', (e) => {
    // Only prevent default if it's a link to #
    if (logoLink.getAttribute('href') === '#') {
      e.preventDefault();
    }
    
    // Reset animation state
    clearTimeout(animationTimeout);
    clearInterval(autoAnimationInterval);
    logoLink.classList.remove(...biteSequence.filter(Boolean));
    currentBite = 0;
    isAnimating = false;
    
    // Start animation
    nextBite();
    
    // Restart auto animation after sequence completes
    setTimeout(startAutoAnimation, 3000);
  });
  
  // Hover interactions
  logoLink.addEventListener('mouseenter', () => {
    if (!isAnimating && currentBite === 0) {
      clearInterval(autoAnimationInterval);
      nextBite();
    }
  });
  
  logoLink.addEventListener('mouseleave', () => {
    if (!isAnimating && currentBite > 0) {
      // Complete the sequence if we're in the middle of it
      nextBite();
    }
  });
  
  // Start automatic animation on page load
  startAutoAnimation();
});