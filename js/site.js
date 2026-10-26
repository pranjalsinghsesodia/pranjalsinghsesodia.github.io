// Smooth scrolling, the entrance, photographs and their readout, the lightbox, and quiet page changes.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  const motion = !!gsap && !reduced;
  if (gsap && ST) gsap.registerPlugin(ST);

  // ---------- scrolling ----------

  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new window.Lenis({ lerp: .11 });
    if (gsap) {
      if (ST) lenis.on('scroll', ST.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const el = id.length > 1 && document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: -28 });
        history.replaceState(null, '', id);
      });
    });
  }

  // ---------- entrance ----------

  const intro = document.querySelectorAll('.intro:not(.continued)');
  if (motion) {
    // on the first page of a visit, start as the loading screen lifts
    const delay = document.documentElement.classList.contains('loader-on') ? .62 : .05;
    gsap.fromTo(intro, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: .085, delay, clearProps: 'transform' });
  } else {
    intro.forEach((el) => { el.style.opacity = 1; });
  }

  if (motion && ST) {
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      gsap.from(el, { opacity: 0, y: 16, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
  }

  // ---------- photographs open like a lens: a six-bladed iris ----------

  function iris(el, p, w, h) {
    const R = (Math.hypot(w, h) / 2 / Math.cos(Math.PI / 6)) * p;
    const turn = (1 - p) * -1.1;
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = turn + (i * Math.PI) / 3;
      pts.push(`${(w / 2 + R * Math.cos(a)).toFixed(1)}px ${(h / 2 + R * Math.sin(a)).toFixed(1)}px`);
    }
    el.style.clipPath = `polygon(${pts.join(',')})`;
  }

  if (motion && ST) {
    document.querySelectorAll('.rows .row').forEach((row) => {
      const imgs = [...row.querySelectorAll('img')];
      imgs.forEach((img) => iris(img, 0, 1, 1));
      ST.create({
        trigger: row,
        start: 'top 88%',
        once: true,
        onEnter: () => imgs.forEach((img, i) => {
          const w = img.clientWidth, h = img.clientHeight, s = { p: 0 };
          gsap.to(s, {
            p: 1, duration: 1.15, delay: i * .09, ease: 'power2.inOut',
            onUpdate: () => iris(img, s.p, w, h),
            onComplete: () => { img.style.clipPath = ''; },
          });
        }),
      });
    });
  }

  // ---------- the readout under the photographs, like the info line in a viewfinder ----------

  const meta = (el) => [el.dataset.date, el.dataset.camera, el.dataset.exp].filter(Boolean).join(' · ');
  const readout = document.querySelector('.readout');
  if (readout) {
    const t = readout.querySelector('.ro-t'), m = readout.querySelector('.ro-m');
    if (matchMedia('(hover: none)').matches) m.textContent = 'Tap one to see it large.';
    const rest = [t.textContent, m.textContent];
    const show = (title, info) => {
      if (t.textContent === title) return;
      t.textContent = title;
      m.textContent = info;
      if (motion) gsap.fromTo([t, m], { opacity: .2 }, { opacity: 1, duration: .45, ease: 'power1.out', overwrite: true });
    };
    const rows = document.querySelector('.rows');
    rows.querySelectorAll('.ph').forEach((ph) => {
      ph.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(ph.dataset.title, meta(ph)); });
      ph.addEventListener('focus', () => show(ph.dataset.title, meta(ph)));
    });
    rows.addEventListener('pointerleave', () => show(...rest));
    rows.addEventListener('focusout', (e) => { if (!rows.contains(e.relatedTarget)) show(...rest); });
  }

  // ---------- lightbox ----------

  const lb = document.querySelector('.lb');
  if (lb) {
    const img = lb.querySelector('img');
    const title = lb.querySelector('.lb-cap .t');
    const info = lb.querySelector('.lb-cap .m');
    let list = [], at = 0;

    const fill = () => {
      const el = list[at];
      const src = el.dataset.full || el.currentSrc || el.src || el.querySelector('img').currentSrc;
      img.src = src;
      img.alt = (el.querySelector('img') || el).alt || '';
      title.textContent = el.dataset.title || '';
      info.textContent = meta(el);
      if (motion) gsap.fromTo(img, { opacity: 0 }, { opacity: 1, duration: .5, ease: 'power1.out' });
    };
    const open = (el) => {
      const group = el.dataset.group;
      list = group ? [...document.querySelectorAll(`[data-zoom][data-group="${group}"]`)] : [el];
      at = Math.max(0, list.indexOf(el));
      lb.toggleAttribute('data-single', list.length < 2);
      fill();
      lb.showModal();
      if (lenis) lenis.stop();
      if (motion) gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: .35, ease: 'power1.out' });
    };
    const close = () => {
      if (!lb.open) return;
      const done = () => { lb.close(); if (lenis) lenis.start(); };
      if (motion) gsap.to(lb, { opacity: 0, duration: .22, ease: 'power1.in', onComplete: done });
      else done();
    };
    const step = (d) => { at = (at + d + list.length) % list.length; fill(); };

    document.querySelectorAll('[data-zoom]').forEach((el) => {
      if (el.tagName === 'IMG') { el.tabIndex = 0; el.setAttribute('role', 'button'); }
      el.addEventListener('click', () => open(el));
      el.addEventListener('keydown', (e) => { if (el.tagName === 'IMG' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(el); } });
    });
    lb.querySelector('.lb-x').addEventListener('click', close);
    lb.querySelector('.lb-p').addEventListener('click', () => step(-1));
    lb.querySelector('.lb-n').addEventListener('click', () => step(1));
    lb.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lb-fig')) close(); });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  // ---------- copy the citation ----------

  document.querySelectorAll('.copy[data-copy]').forEach((b) => {
    const label = b.textContent;
    b.addEventListener('click', async () => {
      const src = document.querySelector(b.dataset.copy);
      try { await navigator.clipboard.writeText(src.textContent.trim()); b.textContent = 'Copied'; }
      catch (e) { b.textContent = 'Select it above to copy'; }
      setTimeout(() => { b.textContent = label; }, 2000);
    });
  });

  // ---------- leaving a page fades it, so the roll seems to carry on to the next ----------

  if (motion) {
    const page = document.querySelector('.page');
    document.querySelectorAll('a[href$=".html"], a[href$="/"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target) return;
        const url = new URL(a.href, location.href);
        if (url.origin !== location.origin) return;
        e.preventDefault();
        gsap.to(page, { opacity: 0, duration: .28, ease: 'power1.in', onComplete: () => { location.href = url.href; } });
      });
    });
    addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(page, { opacity: 1 }); });
  }
})();
