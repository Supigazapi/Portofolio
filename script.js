  // Projects carousel
  const track = document.getElementById('carouselTrack');
  const slides = Array.from(track.children);
  const dotsWrap = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let current = 0;

  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'dot';
    d.setAttribute('aria-label', 'Go to project ' + (i + 1));
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });
  const dots = Array.from(dotsWrap.children);

  function updateDots() {
    dots.forEach((d, i) => d.setAttribute('aria-current', i === current ? 'true' : 'false'));
  }

  function goTo(i) {
    current = (i + slides.length) % slides.length;
    slides[current].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    updateDots();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const trackLeft = track.scrollLeft;
      let closest = 0, min = Infinity;
      slides.forEach((s, i) => {
        const dist = Math.abs(s.offsetLeft - trackLeft);
        if (dist < min) { min = dist; closest = i; }
      });
      current = closest;
      updateDots();
    }, 100);
  });

  updateDots();

  // Reveal sections gently as they scroll into view
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // Scroll-spy: highlight the current section in the floating nav
  const navLinks = Array.from(document.querySelectorAll('.floating-nav a'));
  const spySections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function setActiveNav(id) {
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window && spySections.length) {
    const visibleRatios = new Map();
    const spyIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        visibleRatios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });
      let bestId = null, bestRatio = 0;
      visibleRatios.forEach((ratio, id) => {
        if (ratio > bestRatio) { bestRatio = ratio; bestId = id; }
      });
      if (bestId) setActiveNav(bestId);
    }, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1], rootMargin: '-15% 0px -15% 0px' });
    spySections.forEach((section) => spyIO.observe(section));
  }

  // Thumbnail click swaps the image into the main preview frame
  document.addEventListener('click', (e) => {
    const thumbImg = e.target.closest('.doc-thumb img');
    if (thumbImg) {
      const thumb = thumbImg.closest('.doc-thumb');
      const thumbsRow = thumb.parentElement;
      const wrapper = thumbsRow.parentElement;
      const frame = wrapper.querySelector('.doc-frame');
      const frameImg = frame ? frame.querySelector('img') : null;
      if (frameImg) {
        frameImg.src = thumbImg.src;
        frameImg.alt = thumbImg.alt;
      }
      thumbsRow.querySelectorAll('.doc-thumb').forEach((t) => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
    }
  });

  // Highlight the first thumbnail as active by default in every gallery
  document.querySelectorAll('.doc-thumbs').forEach((row) => {
    if (!row.querySelector('.doc-thumb.is-active')) {
      const first = row.querySelector('.doc-thumb');
      if (first) first.classList.add('is-active');
    }
  });

  // Click-to-zoom lightbox for the main project preview image
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');

  document.addEventListener('click', (e) => {
    const img = e.target.closest('.doc-frame img');
    if (img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
      lightbox.classList.add('is-open');
    }
  });

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightboxImg.src = '';
  }
  lightbox.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
