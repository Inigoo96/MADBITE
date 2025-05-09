document.addEventListener('DOMContentLoaded', () => {

    /* === GOOGLE MAPS === */
    document.querySelectorAll('.location-map-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const { lat, lng } = btn.dataset;
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank', 'noopener');
      });
    });
  
    /* === MODAL === */
    const modal        = document.getElementById('locationModal'),
          modalName    = document.getElementById('modalName'),
          modalAddress = document.getElementById('modalAddress'),
          modalHours   = document.getElementById('modalHours'),
          modalPhone   = document.getElementById('modalPhone'),
          modalImg     = document.getElementById('modalImg'),
          closeBtn     = modal.querySelector('.modal-close');
  
    const openModal = (btn) => {
      modalName.textContent = btn.dataset.name;
      modalAddress.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${btn.dataset.address}`;
      modalHours.innerHTML   = `<i class="far fa-clock"></i> ${btn.dataset.hours}`;
      modalPhone.innerHTML   = `<i class="fas fa-phone-alt"></i> ${btn.dataset.phone}`;
      modalImg.src           = btn.dataset.img;
      modalImg.alt           = btn.dataset.name;
  
      modal.classList.add('is-visible');
      modal.setAttribute('aria-hidden', 'false');
    };
  
    document.querySelectorAll('.location-details-btn').forEach(btn =>
      btn.addEventListener('click', () => openModal(btn))
    );
  
    const closeModal = () => {
      modal.classList.remove('is-visible');
      modal.setAttribute('aria-hidden', 'true');
    };
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keyup', e => { if (e.key === 'Escape') closeModal(); });
  });
  