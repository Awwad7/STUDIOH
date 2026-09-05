(() => {
  'use strict';

  const root = document;
  const isMobile = () => window.matchMedia('(max-width: 820px)').matches;
  const isTouch = () => window.matchMedia('(hover: none)').matches;
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Data-saver / slow-connection guard for video weight on mobile —
  // see README "Still needs attention" #1. Falls back to the poster
  // frame + gradient instead of pulling multi-MB video on a metered link.
  const isDataSaver = () => {
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return false;
    if (c.saveData) return true;
    return /^(slow-2g|2g|3g)$/.test(c.effectiveType || '');
  };
  const shouldAutoLoadVideo = () => !(isMobile() && isDataSaver());

  const loadVideo = (video) => {
    if (!video || video.src) return;
    const src = video.dataset.src;
    if (!src) return;
    video.src = src;
  };

  let scrollVel = 0;
  let lastY = null;

  /* ============================================================
     Intro / loading sequence
     ============================================================ */
  function initIntro() {
    const intro = root.querySelector('[data-intro]');
    if (!intro) return;
    const count = intro.querySelector('[data-intro-count]');
    const bar = intro.querySelector('[data-intro-bar]');
    const status = intro.querySelector('[data-intro-status]');

    if (prefersReducedMotion()) { intro.style.display = 'none'; return; }

    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    const dur = 4200;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 2);
      const pct = Math.round(eased * 100);
      if (count) count.textContent = pct;
      if (bar) bar.style.width = pct + '%';
      if (status && pct > 70) status.textContent = 'Ready';
      if (p < 1) requestAnimationFrame(tick);
      else {
        intro.style.opacity = '0';
        intro.style.visibility = 'hidden';
        document.body.style.overflow = '';
        setTimeout(autoScroll, 900);
      }
    };
    requestAnimationFrame(tick);
  }

  function autoScroll() {
    if (isMobile() || prefersReducedMotion()) return;
    const target = Math.round(window.innerHeight * 0.75);
    const startY = window.scrollY, dist = target - startY;
    if (dist <= 0) return;
    const dur = 2400, t0 = performance.now();
    let cancelled = false;
    const stop = () => { cancelled = true; };
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((ev) =>
      window.addEventListener(ev, stop, { once: true, passive: true }));
    const step = (now) => {
      if (cancelled) return;
      const p = Math.min(1, (now - t0) / dur);
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      window.scrollTo(0, startY + dist * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ============================================================
     Nav / chapter menu
     ============================================================ */
  function initMenu() {
    const menu = root.querySelector('[data-menu]');
    const toggleBtn = root.querySelector('[data-menu-toggle]');
    if (!menu || !toggleBtn) return;
    const open = () => { menu.classList.add('is-open'); toggleBtn.setAttribute('aria-expanded', 'true'); };
    const close = () => { menu.classList.remove('is-open'); toggleBtn.setAttribute('aria-expanded', 'false'); };
    toggleBtn.addEventListener('click', () => {
      menu.classList.contains('is-open') ? close() : open();
    });
    menu.querySelectorAll('[data-menu-close]').forEach((el) => el.addEventListener('click', close));
  }

  /* ============================================================
     Chapter rail — active-section tracking
     ============================================================ */
  function initRail() {
    const dots = Array.from(root.querySelectorAll('[data-rail-dot]'));
    if (!dots.length) return;
    const setDot = (dot, active) => {
      const mark = dot.querySelector('[data-rail-mark]');
      const label = dot.querySelector('[data-rail-label]');
      if (mark) mark.classList.toggle('is-active', active);
      if (label) label.classList.toggle('is-active', active);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) dots.forEach((d) => setDot(d, d.dataset.target === e.target.id));
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    ['origin', 'moat', 'services', 'work', 'start'].forEach((id) => {
      const sec = root.getElementById(id);
      if (sec) io.observe(sec);
    });
  }

  /* ============================================================
     Hero: sticky pin, wordmark dock, video pop
     ============================================================ */
  function initHeroVideo() {
    const video = root.querySelector('[data-hero-video]');
    const white = root.querySelector('[data-white-head]');
    if (!video) return;
    if (!shouldAutoLoadVideo()) return; // stays on poster/gradient
    loadVideo(video);
    video.style.display = 'block';
    const atTop = () => window.scrollY < window.innerHeight * 0.1;
    const play = () => { const p = video.play(); if (p && p.catch) p.catch(() => {}); };
    play();
    video.addEventListener('ended', () => {
      window._heroLogoPop = true;
      if (white && atTop()) { white.style.opacity = '1'; white.style.transform = 'scale(1)'; }
      setTimeout(() => {
        window._heroLogoPop = false;
        if (white && atTop()) { white.style.opacity = '0'; white.style.transform = 'scale(.8)'; }
        try { video.currentTime = 0; play(); } catch (e) {}
      }, 2000);
    });
  }

  function onScroll() {
    const y = window.scrollY;
    if (lastY != null) scrollVel = Math.min(6, scrollVel + Math.abs(y - lastY) * 0.012);
    lastY = y;

    const track = root.querySelector('[data-hero-track]');
    if (track) {
      const r = track.getBoundingClientRect();
      const total = track.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;

      const light = root.querySelector('[data-hero-light]');
      const white = root.querySelector('[data-white-head]');
      const clip = root.querySelector('[data-clip-head]');
      const wrap = root.querySelector('[data-head-wrap]');
      const cue = root.querySelector('[data-cue]');
      const heroRays = root.querySelector('[data-hero-rays]');
      const pageRays = root.querySelector('[data-rays]');
      const navLogo = root.querySelector('[data-nav-logo]');

      const lp = Math.min(1, p / 0.55);
      if (light) light.style.opacity = lp;
      const cross = Math.min(1, Math.max(0, (p - 0.62) / 0.34));
      if (heroRays) heroRays.style.opacity = lp * (1 - cross);
      if (pageRays) pageRays.style.opacity = cross;
      if (white) {
        if (p > 0.04) white.style.opacity = String(Math.max(0, 1 - p / 0.4));
        else white.style.opacity = window._heroLogoPop ? '1' : '0';
      }
      if (clip) clip.style.opacity = String(Math.min(1, Math.max(0, (p - 0.32) / 0.4)));

      if (wrap && navLogo && white) {
        const nr = navLogo.getBoundingClientRect();
        const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        const big = parseFloat(getComputedStyle(white).fontSize) || 180;
        // Clamp so the dock never scales to (near) zero at very narrow
        // widths where the hero wordmark is proportionally huge — see
        // README "Still needs attention" #3.
        const s = Math.min(1, Math.max(0.12, nr.height / big));
        const scale = 1 - (1 - s) * p;
        const tx = (nr.left + nr.width / 2 - cx) * p;
        const ty = (nr.top + nr.height / 2 - cy) * p;
        wrap.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
        wrap.style.opacity = String(1 - Math.min(1, Math.max(0, (p - 0.9) / 0.1)));
        navLogo.style.opacity = String(Math.min(1, Math.max(0, (p - 0.88) / 0.12)));
      }
      if (cue) cue.style.opacity = String(Math.max(0, 1 - p / 0.12));
    }

    if (!isMobile()) {
      root.querySelectorAll('[data-parallax]').forEach((el) => {
        const speed = parseFloat(el.dataset.speed) || 0.08;
        const cap = parseFloat(el.dataset.cap) || 60;
        const rc = el.getBoundingClientRect();
        const center = rc.top + rc.height / 2;
        const raw = (window.innerHeight / 2 - center) * speed;
        const off = Math.max(-cap, Math.min(cap, raw));
        el.style.transform = `translateY(${off}px)`;
      });
    }
  }

  function initScroll() {
    let raf = null;
    const handler = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = null; onScroll(); });
    };
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler, { passive: true });
    onScroll();
  }

  /* ============================================================
     Scroll reveal
     ============================================================ */
  function motionConfig() {
    if (prefersReducedMotion()) return { dist: 0, dur: 0 };
    return { dist: 38, dur: 1250 };
  }

  function initReveals() {
    const { dist, dur } = motionConfig();
    const els = root.querySelectorAll('[data-reveal]');
    if (dur === 0) { els.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; }); return; }
    const ease = 'cubic-bezier(.16,1,.3,1)';
    const settle = (el) => { el.style.opacity = '1'; el.style.transform = 'none'; };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { settle(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -12% 0px' });
    els.forEach((el) => {
      const sec = el.closest('section');
      const sibs = sec ? Array.from(sec.querySelectorAll('[data-reveal]')) : [el];
      const delay = Math.min(sibs.indexOf(el), 5) * 110;
      const r = el.getBoundingClientRect();
      el.style.transition = `opacity ${dur}ms ${ease} ${delay}ms, transform ${dur}ms ${ease} ${delay}ms`;
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) { settle(el); }
      else { el.style.opacity = '0'; el.style.transform = `translateY(${dist}px)`; io.observe(el); }
    });
  }

  function initImageReveals() {
    const els = root.querySelectorAll('[data-img]');
    const settle = (el) => { const c = el.firstElementChild; if (c) { c.style.transform = 'scale(1)'; c.style.opacity = '1'; } };
    if (prefersReducedMotion()) { els.forEach(settle); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { settle(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach((el) => {
      const c = el.firstElementChild; if (!c) return;
      c.style.transformOrigin = 'center';
      c.style.transition = 'transform 1600ms cubic-bezier(.16,1,.3,1), opacity 1200ms ease';
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0) { c.style.transform = 'scale(1)'; c.style.opacity = '1'; }
      else { c.style.transform = 'scale(1.16)'; c.style.opacity = '0.001'; io.observe(el); }
    });
  }

  /* ============================================================
     Word rotator (moat headline)
     ============================================================ */
  function initWordRotator() {
    const el = root.querySelector('[data-rotate]');
    if (!el || prefersReducedMotion()) return;
    const words = ['simple', 'premium', 'current', 'inventive'];
    let i = 0;
    setInterval(() => { i = (i + 1) % words.length; el.textContent = words[i]; }, 1100);
  }

  /* ============================================================
     Canvas: ray field (page-level backdrop + hero cross-fade)
     ============================================================ */
  function makeRayField(cv) {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, cx = 0, cy = 0, maxR = 1;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const COLORS = ['#4cbb17', '#3ad13a', '#2f6bff', '#1e4fd6', '#7de08a'];
    const N = 150;
    const rays = [];
    const spawn = () => ({
      ang: Math.random() * Math.PI * 2,
      r: Math.random() * maxR,
      len: (0.12 + Math.random() * 0.28) * maxR,
      w: (0.6 + Math.random() * 1.8) * dpr,
      v: 0.6 + Math.random() * 1.4,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      a: 0.25 + Math.random() * 0.55,
    });
    const resize = () => {
      const r = cv.getBoundingClientRect();
      W = cv.width = Math.max(1, r.width * dpr);
      H = cv.height = Math.max(1, r.height * dpr);
      cx = W / 2; cy = H / 2; maxR = Math.hypot(W, H);
    };
    resize();
    for (let i = 0; i < N; i++) rays.push(spawn());
    const step = () => {
      ctx.clearRect(0, 0, W, H);
      const boost = 1 + scrollVel * 0.9;
      ctx.lineCap = 'round';
      for (const ray of rays) {
        ray.r += ray.v * 1.4 * boost * dpr;
        if (ray.r - ray.len > maxR * 0.62) { Object.assign(ray, spawn()); ray.r = Math.random() * maxR * 0.2; }
        const dx = Math.cos(ray.ang), dy = Math.sin(ray.ang);
        const x1 = cx + dx * ray.r, y1 = cy + dy * ray.r;
        const x2 = cx + dx * (ray.r - ray.len), y2 = cy + dy * (ray.r - ray.len);
        const depth = Math.min(1, ray.r / (maxR * 0.62));
        const g = ctx.createLinearGradient(x2, y2, x1, y1);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(1, ray.c);
        ctx.strokeStyle = g;
        ctx.globalAlpha = ray.a * depth * Math.min(1, boost);
        ctx.lineWidth = ray.w * (0.5 + depth);
        ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x1, y1); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };
    return { resize, step };
  }

  let rayFields = [];
  function initRays() {
    if (prefersReducedMotion()) return;
    const pageCv = root.querySelector('[data-rays]');
    const heroCv = root.querySelector('[data-hero-rays]');
    const cvs = [pageCv, heroCv].filter(Boolean);
    if (isMobile()) {
      // Single static paint on phones — no rAF loop.
      cvs.forEach((cv) => makeRayField(cv).step());
      return;
    }
    rayFields = cvs.map(makeRayField);
    const loop = () => {
      requestAnimationFrame(loop);
      rayFields.forEach((f) => f.step());
      scrollVel *= 0.9;
    };
    loop();
  }

  /* ============================================================
     Canvas: live-frame placeholder streaks
     ============================================================ */
  const THEMES = {
    green: ['#4cbb17', '#3ad13a', '#7de08a'],
    blue: ['#2f6bff', '#1e4fd6', '#5b47ee'],
    mix: ['#4cbb17', '#2f6bff', '#3ad13a', '#5b47ee'],
  };

  function drawLiveFrame(s, still, boost) {
    const { ctx, W, H, span } = s;
    ctx.clearRect(0, 0, W, H);
    const ca = Math.cos(s.ang), sa = Math.sin(s.ang);
    const nx = -sa, ny = ca;
    const cx = W / 2, cy = H / 2;
    ctx.lineCap = 'round';
    for (const st of s.streaks) {
      if (!still) st.p += st.v * (boost || 1);
      if (st.p > 1.2) st.p -= 1.4;
      const t = (st.p - 0.5) * span * 1.4;
      const bx = cx + ca * t + nx * st.off;
      const by = cy + sa * t + ny * st.off;
      const x1 = bx - ca * st.len / 2, y1 = by - sa * st.len / 2;
      const x2 = bx + ca * st.len / 2, y2 = by + sa * st.len / 2;
      const g = ctx.createLinearGradient(x1, y1, x2, y2);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.5, st.c);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = g;
      ctx.globalAlpha = st.a;
      ctx.lineWidth = st.w;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  let liveFrames = [];
  function initLiveFrames() {
    const frames = Array.from(root.querySelectorAll('[data-live-frame]'));
    const noTilt = isMobile() || isTouch();
    liveFrames = frames.map((f) => {
      f.style.overflow = 'hidden';
      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
      f.appendChild(cv);
      const vig = document.createElement('div');
      vig.style.cssText = 'position:absolute;inset:0;background:radial-gradient(120% 100% at 50% 0%, transparent 40%, #08070daa 100%);pointer-events:none;';
      f.appendChild(vig);
      const cols = THEMES[f.dataset.theme] || THEMES.mix;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const ctx = cv.getContext('2d');
      const state = { cv, ctx, dpr, cols, W: 0, H: 0, streaks: [], ang: -0.6 + Math.random() * 0.3 };
      const resize = () => {
        const r = f.getBoundingClientRect();
        state.W = cv.width = Math.max(1, r.width * dpr);
        state.H = cv.height = Math.max(1, r.height * dpr);
        const span = Math.hypot(state.W, state.H);
        state.span = span;
        if (!state.streaks.length) {
          for (let i = 0; i < 26; i++) state.streaks.push({
            p: Math.random(), off: (Math.random() - 0.5) * span * 1.2,
            len: (0.15 + Math.random() * 0.5) * span, w: (0.6 + Math.random() * 2.4) * dpr,
            v: 0.0008 + Math.random() * 0.0022, c: cols[(Math.random() * cols.length) | 0],
            a: 0.15 + Math.random() * 0.5,
          });
        }
      };
      resize();
      state.resize = resize;
      if (!noTilt) {
        const tiltMove = (e) => {
          const r = f.getBoundingClientRect();
          const tx = ((e.clientX - r.left) / r.width - 0.5);
          const ty = ((e.clientY - r.top) / r.height - 0.5);
          f.parentElement.style.transition = 'transform .15s ease';
          f.parentElement.style.transform = `perspective(900px) rotateY(${tx * 6}deg) rotateX(${-ty * 6}deg)`;
        };
        const tiltLeave = () => { f.parentElement.style.transform = ''; };
        f.addEventListener('mousemove', tiltMove);
        f.addEventListener('mouseleave', tiltLeave);
      }
      return state;
    });

    if (prefersReducedMotion() || isMobile()) { liveFrames.forEach((s) => drawLiveFrame(s, true)); return; }
    const loop = () => {
      requestAnimationFrame(loop);
      const boost = 1 + scrollVel * 0.5;
      liveFrames.forEach((s) => drawLiveFrame(s, false, boost));
    };
    loop();
  }

  /* ============================================================
     Origin: DVD-bounce "the machine" + RESHAPED color sync
     ============================================================ */
  function initMachineBounce() {
    if (prefersReducedMotion() || isMobile()) return;
    const box = root.querySelector('[data-machine-box]');
    const txt = root.querySelector('[data-machine-text]');
    if (!box || !txt) return;
    const COLORS = ['#4cbb17', '#2f6bff', '#5b47ee', '#14e1e6', '#ff5719', '#ff3b5c', '#ffffff', '#3ad13a'];
    let ci = 0, x = 20, y = 20, vx = 2.1, vy = 1.7;
    const reshaped = root.querySelector('[data-reshaped]');
    const bump = () => { ci = (ci + 1) % COLORS.length; txt.style.color = COLORS[ci]; if (reshaped) reshaped.style.color = COLORS[ci]; };
    const step = () => {
      requestAnimationFrame(step);
      const bw = box.clientWidth, bh = box.clientHeight;
      const tw = txt.offsetWidth, th = txt.offsetHeight;
      x += vx; y += vy;
      if (x <= 0) { x = 0; vx = Math.abs(vx); bump(); } else if (x + tw >= bw) { x = bw - tw; vx = -Math.abs(vx); bump(); }
      if (y <= 0) { y = 0; vy = Math.abs(vy); bump(); } else if (y + th >= bh) { y = bh - th; vy = -Math.abs(vy); bump(); }
      txt.style.transform = `translate(${x}px, ${y}px)`;
    };
    step();
  }

  function initMachineVideo() {
    const video = root.querySelector('[data-machine-video]');
    if (!video || !shouldAutoLoadVideo()) return;
    loadVideo(video);
    const p = video.play(); if (p && p.catch) p.catch(() => {});
  }

  function initMoatCard() {
    const card = root.querySelector('[data-moat-card]');
    const banner = root.querySelector('[data-moat-banner]');
    const modal = root.querySelector('[data-moat-modal]');
    const close = modal && modal.querySelector('[data-moat-close]');
    if (!card || !banner || !modal) return;
    if (!isTouch()) {
      card.addEventListener('mouseenter', () => banner.classList.add('is-visible'));
      card.addEventListener('mouseleave', () => banner.classList.remove('is-visible'));
    }
    const hide = () => { modal.classList.remove('is-open'); document.body.style.overflow = ''; };
    card.addEventListener('click', () => { modal.classList.add('is-open'); document.body.style.overflow = 'hidden'; });
    if (close) close.addEventListener('click', hide);
    modal.addEventListener('click', (e) => { if (e.target === modal) hide(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
  }

  /* ============================================================
     Story video: timed READY?, hover-to-read cue, moat panel
     ============================================================ */
  function initStoryVideo() {
    const v = root.querySelector('[data-story-video]');
    if (!v) return;
    const sec = root.querySelector('[data-storyvid-sec]');
    const ready = root.querySelector('[data-ready]');
    const zone = root.querySelector('[data-hover-zone]');
    const note = root.querySelector('[data-hover-note]');
    const moat = root.querySelector('[data-hover-moat]');
    const line = root.querySelector('[data-hover-line]');

    let reading = false;
    let cueActive = false;
    let cueFired = false;
    let cueTimer = null;
    let loaded = false;

    const ensureLoaded = () => {
      if (loaded) return;
      loaded = true;
      loadVideo(v);
      v.loop = true;
    };

    const resumeFromCue = () => {
      if (reading) return;
      cueActive = false;
      if (zone) { zone.style.opacity = '0'; zone.style.pointerEvents = 'none'; }
      if (line) line.style.transform = 'scaleX(0)';
      const p = v.play(); if (p && p.catch) p.catch(() => {});
    };

    const fireCue = () => {
      cueFired = true; cueActive = true;
      v.pause();
      if (zone) { zone.style.opacity = '1'; zone.style.pointerEvents = 'auto'; }
      requestAnimationFrame(() => { if (line) line.style.transform = 'scaleX(1)'; });
      cueTimer = setTimeout(resumeFromCue, 4500);
    };

    v.addEventListener('timeupdate', () => {
      const t = v.currentTime;
      if (ready) ready.style.opacity = (t >= 1.08 && t <= 2.1) ? '1' : '0';
      if (t < 1.5) cueFired = false;
      if (!cueFired && !reading && t >= 2) fireCue();
    });

    if (sec) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            ensureLoaded();
            if (!reading && !cueActive) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
          } else {
            v.pause();
            try { v.currentTime = 0; } catch (err) {}
            cueFired = false; cueActive = false;
            if (cueTimer) clearTimeout(cueTimer);
            if (zone) { zone.style.opacity = '0'; zone.style.pointerEvents = 'none'; }
            if (line) line.style.transform = 'scaleX(0)';
            if (moat) moat.classList.remove('is-open');
            reading = false;
          }
        });
      }, { threshold: 0.01, rootMargin: '600px 0px 600px 0px' });
      io.observe(sec);
    }

    if (note && moat) {
      const show = () => {
        if (!cueActive) return;
        reading = true;
        if (cueTimer) clearTimeout(cueTimer);
        v.pause();
        if (zone) zone.style.opacity = '0';
        moat.classList.add('is-open');
      };
      const hide = () => {
        reading = false;
        moat.classList.remove('is-open');
        if (line) line.style.transform = 'scaleX(0)';
        const p = v.play(); if (p && p.catch) p.catch(() => {});
      };
      note.addEventListener('mouseenter', show);
      note.addEventListener('click', show);
      if (!isTouch()) moat.addEventListener('mouseleave', hide);
      moat.addEventListener('click', (e) => { if (e.target === moat) hide(); });
      const tapClose = moat.querySelector('[data-moat-tapclose]');
      if (tapClose) tapClose.addEventListener('click', (e) => { e.stopPropagation(); hide(); });
    }
  }

  /* ============================================================
     Work: brand marquee, tile hover/tap preview, lightbox
     ============================================================ */
  const BRANDS = ['Dyson', 'Coca-Cola', 'Philip Morris', 'JTI', 'Emirates', 'Deliveroo', 'Mondelez', 'Visit Qatar', 'Dubai Tourism'];
  function fillLogos() {
    const html = BRANDS.map((b) => `<span>${b}</span>`).join('');
    root.querySelectorAll('[data-logos]').forEach((el) => { if (!el.childElementCount) el.innerHTML = html; });
  }

  function initWorkTiles() {
    const lb = root.querySelector('[data-lightbox]');
    const lbVideo = lb && lb.querySelector('[data-lb-video]');
    const lbTitle = lb && lb.querySelector('[data-lb-title]');
    const lbClient = lb && lb.querySelector('[data-lb-client]');
    const btnPlay = lb && lb.querySelector('[data-lb-play]');
    const btnMute = lb && lb.querySelector('[data-lb-mute]');
    const btnClose = lb && lb.querySelector('[data-lb-close]');

    const close = () => {
      if (!lb) return;
      lb.classList.remove('is-open');
      if (lbVideo) { lbVideo.pause(); lbVideo.removeAttribute('src'); }
      document.body.style.overflow = '';
    };
    const open = (src, title, client) => {
      if (!lb || !src) return;
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      if (lbTitle) lbTitle.textContent = title || '';
      if (lbClient) lbClient.textContent = client || '';
      if (lbVideo) {
        lbVideo.src = src; lbVideo.muted = false; lbVideo.currentTime = 0;
        const p = lbVideo.play(); if (p && p.catch) p.catch(() => { lbVideo.muted = true; lbVideo.play(); });
      }
      if (btnPlay) btnPlay.textContent = 'Pause';
      if (btnMute) btnMute.textContent = 'Mute';
    };

    if (btnClose) btnClose.addEventListener('click', close);
    if (lb) lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    if (btnPlay && lbVideo) btnPlay.addEventListener('click', () => {
      if (lbVideo.paused) { lbVideo.play(); btnPlay.textContent = 'Pause'; }
      else { lbVideo.pause(); btnPlay.textContent = 'Play'; }
    });
    if (btnMute && lbVideo) btnMute.addEventListener('click', () => {
      lbVideo.muted = !lbVideo.muted;
      btnMute.textContent = lbVideo.muted ? 'Unmute' : 'Mute';
    });

    root.querySelectorAll('[data-tile]').forEach((tile) => {
      const src = tile.dataset.src;
      const vid = tile.querySelector('[data-tile-video]');
      if (src && vid && !isTouch()) {
        tile.addEventListener('mouseenter', () => {
          if (!vid.src) vid.src = src;
          vid.style.opacity = '1';
          const p = vid.play(); if (p && p.catch) p.catch(() => {});
        });
        tile.addEventListener('mouseleave', () => { vid.style.opacity = '0'; vid.pause(); });
      }
      tile.addEventListener('click', () => open(src, tile.dataset.title, tile.dataset.client));
    });
  }

  // Touch devices get no hover — autoplay each tile's preview muted
  // once ~35% of it is on screen instead, matching the reference build.
  function initTouchFallbacks() {
    if (!isTouch()) return;
    const banner = root.querySelector('[data-moat-banner]');
    if (banner) banner.classList.add('is-visible');
    root.querySelectorAll('[data-tile]').forEach((tile) => {
      const vid = tile.querySelector('[data-tile-video]');
      const src = tile.dataset.src;
      if (!vid || !src) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (!vid.src) vid.src = src;
            vid.muted = true; vid.playsInline = true;
            vid.style.opacity = '1';
            const p = vid.play(); if (p && p.catch) p.catch(() => {});
          } else { vid.pause(); vid.style.opacity = '0'; }
        });
      }, { threshold: 0.35 });
      io.observe(tile);
    });
  }

  /* ============================================================
     Video autoplay unlock (mobile browsers require a user gesture)
     ============================================================ */
  function initVideoUnlock() {
    const prep = () => {
      root.querySelectorAll('video').forEach((v) => {
        v.muted = true; v.defaultMuted = true;
        v.setAttribute('muted', '');
        v.setAttribute('playsinline', '');
        v.setAttribute('webkit-playsinline', '');
        v.playsInline = true;
      });
    };
    prep();
    const unlock = () => {
      prep();
      root.querySelectorAll('video').forEach((v) => {
        if (!v.src) return;
        const p = v.play(); if (p && p.catch) p.catch(() => {});
      });
    };
    ['touchstart', 'pointerdown', 'click', 'scroll'].forEach((ev) =>
      window.addEventListener(ev, unlock, { once: true, passive: true }));
  }

  /* ============================================================
     Boot
     ============================================================ */
  function boot() {
    initIntro();
    initMenu();
    initRail();
    initVideoUnlock();
    initTouchFallbacks();
    initHeroVideo();
    initMachineVideo();
    initMoatCard();
    initStoryVideo();
    initLiveFrames();
    initRays();
    initMachineBounce();
    fillLogos();
    initWorkTiles();
    initWordRotator();
    initReveals();
    initImageReveals();
    initScroll();

    let resizeRaf = null;
    window.addEventListener('resize', () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        rayFields.forEach((f) => f.resize());
        liveFrames.forEach((s) => s.resize());
      });
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
