/* ═══════════════════════════════════════════════
   ELEV8 FITNESS GYM — interactions
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ── Sticky nav state ───────────────────────── */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Mobile menu ────────────────────────────── */
  const burger = $('#burger');
  const menu   = $('#mobileMenu');

  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };

  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
  });

  /* ── Scroll reveal ────────────────────────────
     One observer for the whole page; each element is unobserved the moment
     it lands, so this costs nothing after the first pass. Once an element has
     finished animating its reveal classes are stripped — otherwise the .8s
     reveal transition keeps overriding each card's own (faster) hover
     transition for the rest of the session. */
  const reveals = $$('.reveal');
  const settle = (el) => {
    const cs = getComputedStyle(el);
    const dur = (parseFloat(cs.transitionDuration) + parseFloat(cs.transitionDelay)) * 1000;
    window.setTimeout(() => el.classList.remove('reveal', 'reveal--fade', 'is-in'),
                      Number.isFinite(dur) ? dur + 60 : 1200);
  };

  if ('IntersectionObserver' in window) {
    const show = (el) => {
      el.classList.add('is-in');
      settle(el);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        show(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    reveals.forEach((el) => io.observe(el));

    // Failsafe. A document that loads hidden (background tab, prerender) gets
    // no observer callbacks at all, which would leave content stuck at
    // opacity 0. Sweep anything already on screen when we become visible.
    const sweep = () => {
      $$('.reveal:not(.is-in)').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          io.unobserve(el);
          show(el);
        }
      });
    };
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) sweep();
    });
    window.setTimeout(sweep, 2500);
  } else {
    reveals.forEach((el) => el.classList.remove('reveal', 'reveal--fade'));
  }

  /* ── Active nav link on scroll ──────────────── */
  const sections  = ['about', 'progress', 'pricing', 'contact'];
  const navLinks  = new Map();
  sections.forEach((id) => {
    const link = $(`.nav__links a[href="#${id}"]`);
    const sec  = document.getElementById(id);
    if (link && sec) navLinks.set(sec, link);
  });

  if ('IntersectionObserver' in window && navLinks.size) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const link = navLinks.get(en.target);
        if (!link) return;
        if (en.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach((_, sec) => spy.observe(sec));
  }

  /* ── Hero video: fade in over the stills, or stay on the stills ── */
  const heroVideo = $('#heroVideo');
  const heroMedia = $('.hero__media');
  if (heroVideo && heroMedia) {
    const kill = () => {
      heroVideo.classList.add('is-dead');
      heroMedia.classList.remove('has-video');
    };
    const live = () => heroMedia.classList.add('has-video');

    heroVideo.addEventListener('playing', live);
    heroVideo.addEventListener('error', kill);
    $('source', heroVideo)?.addEventListener('error', kill);
    // If nothing has buffered after a fair wait, assume the file is missing.
    setTimeout(() => { if (heroVideo.readyState === 0) kill(); }, 3500);

    const play = heroVideo.play();
    if (play && typeof play.catch === 'function') play.catch(kill);

    // Browsers pause background-tab video; pick the loop back up on return.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && heroVideo.paused && !heroVideo.classList.contains('is-dead')) {
        const p = heroVideo.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    });
  }

  /* ── Instagram reel facades → embed on click ── */
  $$('.reel__frame').forEach((frame) => {
    const code = frame.dataset.reel;
    const btn  = $('.reel__play', frame);
    if (!code || !btn) return;

    btn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.instagram.com/reel/${code}/embed/`;
      iframe.title = 'Instagram progress reel from @elev8_fitnessgym';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      frame.replaceChildren(iframe);
    });
  });

  /* ── Pricing stack: ease each card back as the next covers it ──
     Sticky alone just occludes one card with the next. Feeding a 0→1
     "cover" ratio into CSS lets the buried card scale and dim smoothly,
     so the hand-off reads as depth rather than a hard swap. */
  const pkgs = $$('.pkg');
  if (pkgs.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const inners = pkgs.map((p) => $('.pkg__inner', p));
    let raf = 0;

    const paint = () => {
      raf = 0;
      // Below the stacking breakpoint the cards are a plain list — leave them be.
      if (getComputedStyle(pkgs[0]).position !== 'sticky') {
        inners.forEach((el) => el.style.removeProperty('--cover'));
        return;
      }
      for (let i = 0; i < pkgs.length; i++) {
        const next = pkgs[i + 1];
        if (!next) { inners[i].style.setProperty('--cover', '0'); continue; }
        const me = pkgs[i].getBoundingClientRect();
        const over = next.getBoundingClientRect();
        // 0 while the next card is a full card-height away, 1 once it has landed
        const travel = me.height || 1;
        const ratio = 1 - (over.top - me.top) / travel;
        inners[i].style.setProperty('--cover', String(Math.min(1, Math.max(0, ratio))));
      }
    };

    // Supersede rather than latch: a dropped frame (background tab, throttled
    // iframe) must not leave a flag set that blocks every later scroll.
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paint);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) onScroll();
    });
    paint();
  }

  /* ── Footer year ────────────────────────────── */
  const yr = $('#yr');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
