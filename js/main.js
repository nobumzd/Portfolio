(function(){
  /* ---- CURSOR ---- */
  const dot  = document.getElementById('cursor-dot');
  let mx = -200, my = -200;
  let isMoving = false;
  let movingTimeout = null;
  let bubbleInterval = null;
  let lastBubbleTime = 0;
  let prevX = null, prevY = null;
  let rocketAngle = -45;

  const isMobile = () => window.innerWidth <= 768;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.opacity = '1';
    dot.style.left  = mx + 'px'; dot.style.top  = my + 'px';

    if (prevX !== null && prevY !== null) {
      const dx = mx - prevX, dy = my - prevY;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        rocketAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      }
    }
    dot.style.transform = `translate(-50%,-50%) rotate(${rocketAngle}deg)`;
    prevX = mx; prevY = my;

    const now = Date.now();
    if (now - lastBubbleTime > 100) {
      spawnBubble(mx, my);
      lastBubbleTime = now;
    }

    isMoving = true;
    clearTimeout(movingTimeout);
    clearInterval(bubbleInterval);

    movingTimeout = setTimeout(() => {
      isMoving = false;
      startBubbles();
    }, 400);
  });

  function startBubbles() {
    clearInterval(bubbleInterval);
    bubbleInterval = setInterval(() => {
      if (isMoving) { clearInterval(bubbleInterval); return; }
      spawnBubble(mx, my);
    }, 180);
  }

  function spawnBubble(x, y) {
    const b = document.createElement('div');
    b.className = 'cursor-bubble';
    const size = 4 + Math.random() * 8;
    const offX = (Math.random() - 0.5) * 24;
    b.style.cssText = `width:${size}px;height:${size}px;left:${x + offX}px;top:${y}px;`;
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 1300);
  }

  document.addEventListener('click', e => {
    const r = document.createElement('div');
    r.className = 'click-ripple';
    r.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:40px;height:40px;`;
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 700);
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    clearInterval(bubbleInterval);
  });

  /* ---- SCROLL EFFECTS ---- */
  const header    = document.getElementById('header');
  const sideNav   = document.getElementById('side-nav');
  const mobBottom = document.getElementById('mobile-bottom-nav');
  const sideItems = document.querySelectorAll('.side-nav-item');
  const sections  = ['about','outline','works','contact'];

  window.addEventListener('scroll', () => {
    const sy = window.scrollY;

    if (sy > 60) header.classList.add('scrolled');
    else header.classList.remove('scrolled');

    if (!isMobile()) {
      if (sy > 200) sideNav.classList.add('visible');
      else sideNav.classList.remove('visible');
    }

    if (isMobile()) {
      if (sy > 120) mobBottom.classList.add('visible');
      else mobBottom.classList.remove('visible');
    }

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.5 && rect.bottom > 0) {
        sideItems.forEach(s => s.classList.toggle('active', s.dataset.target === id));
        document.querySelectorAll('.mob-nav-link').forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#'+id);
        });
      }
    });

    checkReveal();
  });

  /* ---- REVEAL ON SCROLL ---- */
  function checkReveal() {
    const threshold = window.innerHeight * 0.88;

    document.querySelectorAll('.hero-eyebrow, .logo-area, .hero-title, .hero-sub').forEach(el => {
      if (el.getBoundingClientRect().top < threshold) el.classList.add('in');
    });

    document.querySelectorAll('.section-label, .section-title').forEach(el => {
      if (el.getBoundingClientRect().top < threshold) el.classList.add('in');
    });

    document.querySelectorAll('.divider').forEach(el => {
      if (el.getBoundingClientRect().top < threshold) el.classList.add('in');
    });

    document.querySelectorAll('.about-text p').forEach((el, i) => {
      if (el.getBoundingClientRect().top < threshold) {
        setTimeout(() => el.classList.add('in'), i * 120);
      }
    });

    document.querySelectorAll('.about-meta').forEach(el => {
      if (el.getBoundingClientRect().top < threshold) el.classList.add('in');
    });

    document.querySelectorAll('.skill-card').forEach(el => {
      if (el.getBoundingClientRect().top < threshold) el.classList.add('in');
    });

    document.querySelectorAll('.work-card').forEach(el => {
      if (el.getBoundingClientRect().top < threshold) el.classList.add('in');
    });

    document.querySelectorAll('.contact-body').forEach(el => {
      if (el.getBoundingClientRect().top < threshold) el.classList.add('in');
    });

    document.querySelectorAll('footer').forEach(el => {
      if (el.getBoundingClientRect().top < threshold) el.classList.add('in');
    });
  }

  setTimeout(checkReveal, 100);

  /* ---- HAMBURGER / OVERLAY ---- */
  const ham     = document.getElementById('hamburger');
  const overlay = document.getElementById('overlay-menu');

  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    overlay.classList.toggle('open');
  });

  overlay.querySelectorAll('.overlay-menu-link').forEach(link => {
    link.addEventListener('click', () => {
      ham.classList.remove('open');
      overlay.classList.remove('open');
    });
  });

  document.getElementById('overlay-close').addEventListener('click', () => {
    ham.classList.remove('open');
    overlay.classList.remove('open');
  });

  /* ---- SMOOTH SCROLL ---- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();

/* ---- STARS ---- */
(function () {
  const cvs = document.getElementById('stars-canvas');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  const mq  = window.matchMedia('(prefers-color-scheme: dark)');

  let W = 0, H = 0, stars = [], raf = null;

  const LAYERS = [
    { n: 160, speed: 0.06, rMin: 0.4, rMax: 1.1, glow: false },
    { n:  80, speed: 0.15, rMin: 0.9, rMax: 1.8, glow: false },
    { n:  30, speed: 0.30, rMin: 1.6, rMax: 2.8, glow: true  },
  ];

  const COLORS = [
    [214,228,245],[168,196,224],[200,195,255],[255,248,220],[180,215,255],
  ];

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function init() {
    W = cvs.width  = window.innerWidth;
    H = cvs.height = window.innerHeight;
    stars = [];
    LAYERS.forEach(l => {
      for (let i = 0; i < l.n; i++) {
        stars.push({
          x: rnd(0, W), y: rnd(0, H),
          r: rnd(l.rMin, l.rMax),
          speed: l.speed, glow: l.glow,
          phase: rnd(0, Math.PI * 2),
          tspd:  rnd(0.3, 2.2),
          bAlpha: rnd(0.35, 1.0),
          col: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    });
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, W, H);

    cvs.style.transform = 'translateY(' + window.scrollY + 'px)';

    const sy = window.scrollY;
    for (const s of stars) {
      const oy    = (sy * s.speed) % H;
      const sy2   = ((s.y - oy) % H + H) % H;
      const alpha = s.bAlpha * (0.35 + 0.65 * Math.sin(t * 0.001 * s.tspd + s.phase));
      const [r, g, b] = s.col;

      if (s.glow) {
        const gr = s.r * 5;
        const gd = ctx.createRadialGradient(s.x, sy2, 0, s.x, sy2, gr);
        gd.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.55})`);
        gd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(s.x, sy2, gr, 0, Math.PI * 2);
        ctx.fillStyle = gd;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(s.x, sy2, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
    }
  }

  function start() {
    if (raf) return;
    init();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  window.addEventListener('resize', () => { if (mq.matches) init(); });
  mq.addEventListener('change', e => {
    if (e.matches) { cvs.style.display = 'block'; start(); }
    else           { cvs.style.display = 'none';  stop();  }
  });

  if (mq.matches) start();
  else cvs.style.display = 'none';
})();

/* ---- CLOUD PARALLAX ---- */
(function () {
  const SPEED = 1.3;

  const CFG = [
    ['cloud-1', 'hero',    320, 210],
    ['cloud-2', 'about',   360, 230],
    ['cloud-3', 'outline', 320, 210],
    ['cloud-4', 'works',   280, 180],
    ['cloud-5', 'contact',  80,  52],
    ['cloud-6', 'contact', 340, 220],
  ];

  const clouds = CFG.map(([id, secId, vpPC, vpSP]) => ({
    el:  document.getElementById(id),
    sec: document.getElementById(secId),
    vpPC, vpSP,
  })).filter(c => c.el && c.sec);

  clouds.forEach(c => {
    const v = c.el.querySelector('video');
    if (!v) return;
    v.addEventListener('canplay', () => {
      v.currentTime = Math.random() * (v.duration || 6);
    }, { once: true });
  });

  function update() {
    const sy  = window.scrollY;
    const vh  = window.innerHeight;
    const mob = window.innerWidth <= 768;
    clouds.forEach(c => {
      const syCenter = Math.max(0, c.sec.offsetTop - vh / 2);
      const vp       = mob ? c.vpSP : c.vpPC;
      const P0       = vp + SPEED * syCenter;
      c.el.style.transform = `translateY(${P0 - (SPEED - 1) * sy}px)`;
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();

/* ---- CLAY EARTH PARALLAX ---- */
(function () {
  const el      = document.getElementById('clay-earth-parallax');
  const about   = document.getElementById('about');
  const contact = document.getElementById('contact');
  if (!el || !about || !contact) return;

  function update() {
    const sy        = window.scrollY;
    const vh        = window.innerHeight;
    const showStart = about.offsetTop - vh * 0.8;
    const showEnd   = contact.offsetTop + contact.offsetHeight;

    if (sy > showEnd) { el.style.opacity = '0'; return; }
    el.style.opacity = '1';

    const isMobile   = window.innerWidth <= 768;
    const startOffset = isMobile ? 750 : 1000;
    const progress   = sy - showStart;
    const viewportY  = startOffset - progress * 0.35;
    el.style.transform = `translateY(${sy + viewportY}px)`;
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();
