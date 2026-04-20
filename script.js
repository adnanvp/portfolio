/* =====================================================
   ADNAN VP — ULTIMATE PORTFOLIO  |  script.js

   Features:
   01. Loader with animated progress
   02. Custom dot + ring cursor with hover morph
   03. Hero canvas particle field (gold particles + connections)
   04. Gradient orbs mouse parallax
   05. Typing effect — cycling all titles
   06. Scroll progress bar (top)
   07. Sticky navbar with active section highlight
   08. Mobile hamburger with smooth drawer
   09. Scroll reveal (up / left / right)
   10. Animated skill progress bars (scroll-triggered)
   11. Animated stat counters (metric cards + profile card)
   12. Glassmorphism timeline (CSS-driven, JS-triggered reveal)
   13. 3D tilt on cards (project / service / cert)
   14. Profile card mouse parallax
   15. Contact form with loading state + success toast
   16. Smooth scroll (all anchor links)
   17. Marquee pause on hover
===================================================== */

'use strict';

/* ─────────────────────────────────────────────────────
   UTILITY
───────────────────────────────────────────────────── */
const qs  = (s, ctx = document) => ctx.querySelector(s);
const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ─────────────────────────────────────────────────────
   01. LOADER
───────────────────────────────────────────────────── */
(function initLoader() {
  const loader = qs('#loader');
  const bar    = qs('#loaderBar');
  const pct    = qs('#loaderPct');
  if (!loader) return;

  document.body.style.overflow = 'hidden';
  let p = 0;

  const tick = setInterval(() => {
    p += Math.random() * 16 + 4;
    if (p >= 100) {
      p = 100;
      clearInterval(tick);
      bar.style.width = '100%';
      pct.textContent = '100%';
      setTimeout(() => {
        loader.classList.add('hide');
        document.body.style.overflow = '';
        // Start canvas after loader done
        initHeroCanvas();
        // Kick off reveals
        initReveal();
        // Start counters already in view (hero card)
        setTimeout(() => runVisibleCounters(), 400);
      }, 500);
    }
    bar.style.width = p + '%';
    pct.textContent = Math.round(p) + '%';
  }, 70);
})();


/* ─────────────────────────────────────────────────────
   02. CUSTOM CURSOR — dot + ring with hover morph
───────────────────────────────────────────────────── */
(function initCursor() {
  const dot  = qs('#cursorDot');
  const ring = qs('#cursorRing');
  if (!dot || !ring) return;

  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Ring follows with lag
  (function rafRing() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(rafRing);
  })();

  // Hover morph — add body class
  const interacts = 'a,button,input,textarea,.chip,.cert-card,.srv-card,.proj-card,.tl-glass,.metric-card,.btn-gold,.btn-outline,.btn-ghost,.social-pill,.pcl,.nav-a';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interacts)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interacts)) document.body.classList.remove('cursor-hover');
  });
})();


/* ─────────────────────────────────────────────────────
   03. HERO CANVAS — Gold particle field
───────────────────────────────────────────────────── */
function initHeroCanvas() {
  const canvas = qs('#heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = 75;
  const particles = [];

  class P {
    constructor(init) {
      this.reset(init);
    }
    reset(init) {
      this.x     = Math.random() * (canvas.width  || 1200);
      this.y     = init ? Math.random() * (canvas.height || 800) : canvas.height + 5;
      this.vx    = (Math.random() - 0.5) * 0.45;
      this.vy    = -(Math.random() * 0.55 + 0.18);
      this.size  = Math.random() * 1.4 + 0.4;
      this.life  = 0;
      this.max   = Math.random() * 280 + 180;
      this.hue   = 32 + Math.random() * 22;
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life++;
      if (this.life > this.max || this.y < -5) this.reset(false);
    }
    draw() {
      const a = Math.sin((this.life / this.max) * Math.PI) * 0.65;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue},78%,62%,${a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new P(true));

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 95) {
          const a = (1 - d / 95) * 0.1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(201,151,42,${a})`;
          ctx.lineWidth = 0.55;
          ctx.stroke();
        }
      }
    }
  }

  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  })();
}


/* ─────────────────────────────────────────────────────
   04. GRADIENT ORBS — Mouse parallax
───────────────────────────────────────────────────── */
(function initOrbParallax() {
  const orbs = qsa('.orb');
  if (!orbs.length) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', e => {
    targetX = (e.clientX / window.innerWidth  - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  (function rafOrbs() {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;

    orbs.forEach(orb => {
      const speed = parseFloat(orb.dataset.speed || 0.04);
      const px = currentX * speed * 100;
      const py = currentY * speed * 100;
      orb.style.transform = `translate(${px}px, ${py}px)`;
    });

    requestAnimationFrame(rafOrbs);
  })();
})();


/* ─────────────────────────────────────────────────────
   05. TYPING EFFECT
───────────────────────────────────────────────────── */
(function initTyping() {
  const el = qs('#typedText');
  if (!el) return;

  const phrases = [
    'Python Full Stack Developer',
    'Data Scientist',
    'Data Analyst',
    'Backend Engineer',
    'ML Engineer',
  ];

  let pi = 0, ci = 0, deleting = false;

  function tick() {
    const phrase = phrases[pi];
    el.textContent = deleting ? phrase.slice(0, ci--) : phrase.slice(0, ci++);

    let delay = deleting ? 42 : 108;

    if (!deleting && ci > phrase.length) {
      deleting = true; delay = 1800;
    } else if (deleting && ci < 0) {
      deleting = false;
      ci = 0;
      pi = (pi + 1) % phrases.length;
      delay = 450;
    }
    setTimeout(tick, delay);
  }

  // Start after loader finishes (roughly)
  setTimeout(tick, 2200);
})();


/* ─────────────────────────────────────────────────────
   06. SCROLL PROGRESS BAR
───────────────────────────────────────────────────── */
(function initScrollProgress() {
  const bar = qs('#scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total   = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY / total * 100;
    bar.style.width = Math.min(scrolled, 100) + '%';
  }, { passive: true });
})();


/* ─────────────────────────────────────────────────────
   07. NAVBAR — Sticky + active section highlight
───────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = qs('#navbar');
  const links  = qsa('.nav-a');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 45);
    highlightActive();
  }

  function highlightActive() {
    const offset = 130;
    const sections = qsa('section[id]');
    let current = '';

    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - offset) current = sec.id;
    });

    links.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ─────────────────────────────────────────────────────
   08. HAMBURGER — Mobile drawer
───────────────────────────────────────────────────── */
(function initHamburger() {
  const btn  = qs('#hamburger');
  const menu = qs('#mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });

  // Close on link tap
  qsa('.mob-a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      btn.classList.remove('open');
      menu.classList.remove('open');
    }
  });
})();


/* ─────────────────────────────────────────────────────
   09. SCROLL REVEAL — up / left / right
───────────────────────────────────────────────────── */
function initReveal() {
  const revealEls = qsa('.reveal-up, .reveal-left, .reveal-right');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      // Calculate stagger by sibling position
      const parent   = el.parentElement;
      const siblings = qsa('.reveal-up, .reveal-left, .reveal-right', parent);
      const idx      = siblings.indexOf(el);
      const delay    = idx * 85;

      setTimeout(() => {
        el.classList.add('revealed');
        // Trigger skill bars inside this element
        triggerSkillBarsIn(el);
        // Trigger counters inside
        triggerCountersIn(el);
        // Animate metric card bar
        if (el.classList.contains('metric-card')) el.classList.add('animated');
      }, delay);

      obs.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

  revealEls.forEach(el => obs.observe(el));

  // Also watch sections to trigger global bars/counters
  const secObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      triggerSkillBarsIn(entry.target);
      triggerCountersIn(entry.target);
      // Trigger metric card animations
      qsa('.metric-card', entry.target).forEach(c => c.classList.add('animated'));
    });
  }, { threshold: 0.15 });

  qsa('section, .hero').forEach(s => secObs.observe(s));
}


/* ─────────────────────────────────────────────────────
   10. SKILL PROGRESS BARS — scroll triggered
───────────────────────────────────────────────────── */
function triggerSkillBarsIn(container) {
  qsa('.sb-fill[data-width]', container).forEach(fill => {
    if (fill.dataset.triggered) return;
    fill.dataset.triggered = '1';
    const w = fill.dataset.width;
    requestAnimationFrame(() => {
      setTimeout(() => { fill.style.width = w + '%'; }, 150);
    });
  });
}

// Expose global for use after reveal
window.addEventListener('load', () => {
  setTimeout(() => {
    // Trigger any already-visible skill bars
    qsa('.sb-fill[data-width]').forEach(fill => {
      const rect = fill.closest('.section')?.getBoundingClientRect();
      if (rect && rect.top < window.innerHeight + 100) {
        if (!fill.dataset.triggered) {
          fill.dataset.triggered = '1';
          fill.style.width = fill.dataset.width + '%';
        }
      }
    });
  }, 800);
});


/* ─────────────────────────────────────────────────────
   11. STAT COUNTERS — animated number count-up
───────────────────────────────────────────────────── */
function triggerCountersIn(container) {
  qsa('.counter[data-target]', container).forEach(animateCounter);
}

function animateCounter(el) {
  if (el.dataset.counting) return;
  el.dataset.counting = '1';

  const target   = parseInt(el.dataset.target, 10);
  const duration = 1700;
  const step     = target / (duration / 16);
  let   current  = 0;

  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current);
    if (current >= target) {
      el.textContent = target;
      clearInterval(timer);
    }
  }, 16);
}

// Hero card counters fire after loader
function runVisibleCounters() {
  qsa('.counter[data-target]').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) animateCounter(el);
  });
}


/* ─────────────────────────────────────────────────────
   13. 3D CARD TILT — project / service / cert cards
───────────────────────────────────────────────────── */
(function initTilt() {
  const STRENGTH = 6; // degrees

  function attachTilt(card) {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform  = `perspective(700px) rotateX(${-y * STRENGTH}deg) rotateY(${x * STRENGTH}deg) translateY(-5px)`;
      card.style.transition = 'transform 0.08s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)';
    });
  }

  qsa('.tilt-card').forEach(attachTilt);
})();


/* ─────────────────────────────────────────────────────
   14. PROFILE CARD — Mouse parallax tilt
───────────────────────────────────────────────────── */
(function initProfileParallax() {
  const card = qs('.pc-glass');
  if (!card) return;

  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 14;
    const y = (e.clientY / window.innerHeight - 0.5) * 14;
    card.style.transform  = `perspective(700px) rotateX(${-y * 0.6}deg) rotateY(${x * 0.6}deg)`;
    card.style.transition = 'transform 0.2s ease';
  });

  document.addEventListener('mouseleave', () => {
    card.style.transform  = '';
    card.style.transition = 'transform 0.6s ease';
  });
})();


/* ─────────────────────────────────────────────────────
   15. CONTACT FORM — Loading state + success toast
───────────────────────────────────────────────────── */
(function initContactForm() {
  const form  = qs('#contactForm');
  const btn   = qs('#submitBtn');
  const toast = qs('#toast');
  if (!form || !btn || !toast) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Add loading state
    btn.classList.add('loading');
    btn.disabled = true;

    // Simulate async send (replace with real fetch/EmailJS)
    setTimeout(() => {
      btn.classList.remove('loading');
      btn.disabled = false;
      form.reset();

      // Show toast
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3800);
    }, 1800);
  });
})();


/* ─────────────────────────────────────────────────────
   16. SMOOTH SCROLL — All anchor links
───────────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = qs(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH   = qs('#navbar')?.offsetHeight || 80;
    const top    = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();


/* ─────────────────────────────────────────────────────
   17. MARQUEE — Pause on hover
───────────────────────────────────────────────────── */
(function initMarquee() {
  const track = qs('.marquee-track');
  if (!track) return;
  track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
})();


/* ─────────────────────────────────────────────────────
   BONUS: Mock browser — 3D tilt on scroll entry
───────────────────────────────────────────────────── */
(function initMockBrowser() {
  const mb = qs('.mock-browser');
  if (!mb) return;

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      mb.style.transform = 'perspective(800px) rotateY(-5deg) rotateX(2deg)';
    }
  }, { threshold: 0.3 });
  obs.observe(mb);

  mb.addEventListener('mouseenter', () => {
    mb.style.transform  = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateY(-4px)';
    mb.style.transition = 'transform 0.4s ease';
  });
  mb.addEventListener('mouseleave', () => {
    mb.style.transform  = 'perspective(800px) rotateY(-5deg) rotateX(2deg)';
    mb.style.transition = 'transform 0.5s ease';
  });
})();


/* ─────────────────────────────────────────────────────
   BONUS: Subtle page background rhythm
───────────────────────────────────────────────────── */
(function initBgRhythm() {
  const map = {
    home: '#080706', about: '#0d0b09', skills: '#080706',
    projects: '#0d0b09', experience: '#080706',
    certifications: '#0d0b09', services: '#080706',
    contact: '#0d0b09',
  };

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && map[entry.target.id]) {
        document.body.style.transition = 'background-color 0.9s ease';
        document.body.style.backgroundColor = map[entry.target.id];
      }
    });
  }, { threshold: 0.35 });

  qsa('section[id]').forEach(s => obs.observe(s));
})();
