const products = {
  lipstick: {
    type: 'LIPS',
    name: 'ÉLAN Lipstick',
    description: 'Add a soft touch of colour to your lips. For a more defined look, follow your lip line before filling in the centre.',
    front: 'ÉLAN lipstick, cap and recycled-paper carton',
    alternate: 'ÉLAN lipstick shown from the front and side'
  },
  blush: {
    type: 'CHEEKS',
    name: 'ÉLAN Blush',
    description: 'Sweep a little colour over the apples of your cheeks, then blend outward for a soft flush.',
    front: 'Open ÉLAN pink blush compact beside its carton',
    alternate: 'Open ÉLAN blush compact seen from the front and at an angle'
  },
  powder: {
    type: 'FACE',
    name: 'ÉLAN Compact Powder',
    description: 'Press a light layer over areas you want to set, or take the compact with you for an easy touch-up.',
    front: 'Open ÉLAN compact powder beside its carton',
    alternate: 'Open ÉLAN compact powder seen from the front and at an angle'
  }
};

const imageSources = {
  lipstick: ['assets/elan-lipstick.png', 'assets/elan-lipstick-angle.png'],
  blush: ['assets/elan-blush.png', 'assets/elan-blush-angle.png'],
  powder: ['assets/elan-powder.png', 'assets/elan-powder-angle.png']
};
const buttons = document.querySelectorAll('[data-product]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function setupGallery(gallery) {
  const photo = gallery.querySelector('.photo');
  const dots = [...gallery.querySelectorAll('.dots button')];
  let startX;
  let current = 'lipstick';
  let alternate = false;
  let timer;
  let pending;

  function showImage() {
    const image = new Image();
    const description = products[current];
    pending = image;
    image.alt = alternate ? description.alternate : description.front;
    image.src = imageSources[current][Number(alternate)];
    image.decode().then(() => {
      if (pending !== image) return;
      photo.replaceChildren(image);
      dots.forEach((dot, index) => dot.setAttribute('aria-pressed', String(index === Number(alternate))));
      if (!reducedMotion.matches) {
        image.animate([{ transform: alternate ? 'translateX(7%)' : 'translateX(-7%)', opacity: .5 }, { transform: 'translateX(0)', opacity: 1 }], { duration: 420, easing: 'ease-out' });
      }
    }).catch(() => { /* Keep the current image if the next one fails to load. */ });
  }

  function scheduleSlide() {
    clearTimeout(timer);
    if (reducedMotion.matches || document.hidden) return;
    timer = setTimeout(() => {
      alternate = !alternate;
      showImage();
      scheduleSlide();
    }, 4000);
  }

  function selectSlide(index) {
    alternate = Boolean(index);
    showImage();
    scheduleSlide();
  }
  dots.forEach((dot, index) => dot.addEventListener('click', () => selectSlide(index)));
  photo.addEventListener('pointerdown', event => { startX = event.clientX; });
  photo.addEventListener('pointercancel', () => { startX = undefined; });
  photo.addEventListener('dragstart', event => event.preventDefault());
  photo.addEventListener('pointerup', event => {
    if (Math.abs(event.clientX - startX) > 35) selectSlide(Number(!alternate));
    startX = undefined;
  });
  document.addEventListener('visibilitychange', scheduleSlide);
  reducedMotion.addEventListener('change', scheduleSlide);
  scheduleSlide();

  return key => {
    if (current === key) return;
    current = key;
    alternate = false;
    showImage();
    scheduleSlide();
  };
}
setupGallery(document.querySelector('[data-gallery="hero"]'));
const selectImage = setupGallery(document.querySelector('[data-gallery="product"]'));
for (const button of buttons) {
  button.addEventListener('click', () => {
    const key = button.dataset.product;
    const product = products[key];
    for (const option of buttons) {
      option.setAttribute('aria-pressed', String(option === button));
    }
    document.querySelector('#product-type').textContent = product.type;
    document.querySelector('#product-name').textContent = product.name;
    document.querySelector('#product-description').textContent = product.description;
    selectImage(key);
  });
}

for (const card of document.querySelectorAll('.paper-card')) {
  card.addEventListener('pointerup', event => {
    if (event.pointerType === 'touch' || event.pointerType === 'pen') card.focus({ preventScroll: true });
  });
}