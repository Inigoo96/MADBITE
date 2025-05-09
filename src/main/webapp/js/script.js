/* ====================
  Carrusel Destacados
==================== */
let progress = 50;
let startX   = 0;
let active   = 0;
let isDown   = false;

// Items y cursores (si los usas)
const $items   = document.querySelectorAll('.carousel-item');
const $cursors = document.querySelectorAll('.cursor');

// Velocidades (drag para swiping)
const speedDrag = -0.1;

// Calcula z-index en función del índice “activo”
const getZindex = (arr, i) =>
  arr.map((_, idx) => idx === i
    ? arr.length
    : arr.length - Math.abs(i - idx)
  );

// Asigna las variables CSS a cada item
const displayItems = (item, idx, act) => {
  const z = getZindex([...$items], act)[idx];
  item.style.setProperty('--zIndex', z);
  item.style.setProperty('--active', (idx - act) / $items.length);
};

// Renderiza según `progress`
const animate = () => {
  // límite [0,100]
  progress = Math.max(0, Math.min(progress, 100));
  // índice del ítem activo
  active = Math.floor((progress / 100) * ($items.length - 1));
  // aplicar a cada item
  $items.forEach((it, i) => displayItems(it, i, active));
};
animate();

/*--------------------
  Click en tarjeta
--------------------*/
$items.forEach((item, i) => {
  item.addEventListener('click', () => {
    progress = (i / ($items.length - 1)) * 100;
    animate();
  });
});

/*--------------------
  Botones Anterior / Siguiente
--------------------*/
const step = 100 / ($items.length - 1);

const nextButton = document.querySelector('.carousel-nav--next');
if (nextButton) {
  nextButton.addEventListener('click', () => {
    progress = Math.min(100, progress + step);
    animate();
  });
}

const prevButton = document.querySelector('.carousel-nav--prev');
if (prevButton) {
  prevButton.addEventListener('click', () => {
    progress = Math.max(0, progress - step);
    animate();
  });
}

/*--------------------
  Drag con ratón / touch
--------------------*/
const handleMouseDown = e => {
  isDown   = true;
  startX   = e.clientX || (e.touches?.[0].clientX) || 0;
};
const handleMouseMove = e => {
  if (e.type === 'mousemove') {
    // opcional: mueve cursor custom
    $cursors.forEach($c => {
      $c.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
  }
  if (!isDown) return;
  const x = e.clientX || (e.touches?.[0].clientX) || 0;
  // arrastra
  progress += (x - startX) * speedDrag;
  startX = x;
  animate();
};
const handleMouseUp = () => { isDown = false; };

// Listeners
document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);
document.addEventListener('touchstart', handleMouseDown);
document.addEventListener('touchmove', handleMouseMove);
document.addEventListener('touchend', handleMouseUp);
