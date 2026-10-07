// Ano dinâmico
  document.getElementById('year').textContent = new Date().getFullYear();
  
  // Scroll progress
  const progress = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    progress.style.width = scrolled + '%';
  }, { passive: true });
  
  // Nav background on scroll
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) nav.classList.add('nav-scrolled');
    else nav.classList.remove('nav-scrolled');
  }, { passive: true });
  
  // Reveal animation
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  
  // Mobile menu
  const menuBtn = document.getElementById('menuBtn');
  const closeMenu = document.getElementById('closeMenu');
  const mobileMenu = document.getElementById('mobileMenu');
  
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  closeMenu.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
  
  // Subtle parallax on hero image
  const heroImg = document.querySelector('.image-frame');
  if (heroImg && window.matchMedia('(min-width: 1024px)').matches) {
    window.addEventListener('scroll', () => {
      const offset = window.scrollY;
      if (offset < 800) {
        heroImg.style.transform = `translateY(${offset * 0.05}px)`;
      }
    }, { passive: true });
  }