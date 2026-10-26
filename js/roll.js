// The whole page is a player-piano roll. Its keyboard runs down the left edge and the paper is everything else.
// A hole's height on the page picks the key; its length is how long the key is held. The paper drifts toward
// the keys on its own, runs faster while the page scrolls, and backwards when it scrolls back up.
// It has the opening screen to itself. Once you're reading it goes soft and quiet, and comes back into focus,
// a little louder, while the cursor is near the keys. On a phone it always stays soft, and only the keys play.
// Click the paper to punch a note, or the keys to play them. With sound on, A to ; play and record too.
// A note a visitor adds plays once as it reaches the keys, then it's gone.
(() => {
  const paperCv = document.querySelector('.roll-paper');
  const canvas = document.querySelector('.roll-canvas');
  if (!paperCv || !canvas) return;
  const g = canvas.getContext('2d');
  const fog = document.querySelector('.fog');
  const keysHit = document.querySelector('.keys-hit');
  const cap = document.querySelector('.roll-cap');
  const hint = cap.querySelector('.roll-hint');
  const soundBtn = cap.querySelector('.roll-sound');
  const clearBtn = cap.querySelector('.roll-clear');

  const LOW = 21, KEYS = 88;          // the full keyboard, A0 to C8, bass at the bottom of the page
  const BEATS = 24;                   // eight bars of 3/4, then the roll comes round again
  const PENTA = [2, 4, 6, 9, 11];     // D major pentatonic, so punched notes sit well with the waltz
  const BLACK = [1, 3, 6, 8, 10];
  const TEMPO = 56 / 60;              // beats a second while it plays: slow, for listening with half an ear
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DRIFT = reduced ? 0 : .18;    // beats a second while it's quiet
  const PEDAL = -1;                   // the sustain pedal's perforation: it's read, not drawn
  const TYPE = { a: 62, s: 64, d: 66, f: 69, g: 71, h: 74, j: 76, k: 78, l: 81, ';': 83 };
  const MASTER = .12;                 // overall loudness: kept very low, a background murmur even with speakers at full
  const QUIET = .5;                   // how strongly the soft roll shows once you're reading below the opening screen
  const HUSH = .35;                   // the volume while it's soft, as a share of MASTER
  const NEAR = 70;                    // within this many px of the keys the roll is fully in focus; it fades over 150 more
  const STORE = 'pss-roll-2', SOUND = 'pss-sound', OFFSET = 'pss-offset';
  const MAX_MINE = 200;
  // Where a click lands on something to read or press, it isn't punching the paper.
  const SOLID = 'a,button,input,textarea,select,label,p,h1,h2,h3,h4,li,dt,dd,figure,img,video,pre,blockquote,dialog,.roll-cap,.readout,.links,.mark,.keys-hit';

  const mod = (a, n) => ((a % n) + n) % n;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const isBlack = (m) => BLACK.includes(mod(m, 12));
  const coarse = matchMedia('(hover: none)').matches;

  // An original waltz in D, written for this page: slow and quiet, a singing line over a soft low accompaniment.
  // Chords, a bar each: D, Bm, G, A, then D, F#m, G, A7, which leads back home to D.
  // Left hand: the root on the barline and the chord's third an octave up a beat later, both held to the end of the bar.
  const LEFT = [[38, 54], [35, 50], [43, 59], [45, 61], [38, 54], [42, 57], [43, 59], [45, 55]];
  // Right hand, around the middle of the keyboard, chord tones on the strong beats: [bar, beat, beats held, note]
  const RIGHT = [
    [0, 0, 2, 66], [0, 2, 1, 69],
    [1, 0, 2, 74], [1, 2, 1, 73],
    [2, 0, 3, 71],
    [3, 0, 2, 69], [3, 2, 1, 64],
    [4, 0, 2, 66], [4, 2, 1, 69],
    [5, 0, 2, 73], [5, 2, 1, 69],
    [6, 0, 1, 71], [6, 1, 1, 74], [6, 2, 1, 71],
    [7, 0, 2, 69], [7, 2, 1, 64],
  ];

  // Every hole: k is the key (0 = A0), s and e are where it starts and ends along the roll, in beats.
  const holes = [];
  LEFT.forEach((chord, bar) => chord.forEach((m, i) => holes.push({ k: m - LOW, s: bar * 3 + i, e: bar * 3 + 2.9, v: .34 })));
  RIGHT.forEach(([bar, beat, len, m]) => holes.push({ k: m - LOW, s: bar * 3 + beat, e: bar * 3 + beat + len - .1, v: .5 }));
  for (let bar = 0; bar < 8; bar++) holes.push({ k: PEDAL, s: bar * 3 + .05, e: bar * 3 + 2.85 });

  try {
    (JSON.parse(localStorage.getItem(STORE)) || []).forEach(([k, s, len]) => {
      if (k >= 0 && k < KEYS && s >= 0 && s < BEATS && len > 0 && len <= 8) holes.push({ k, s, e: s + len, v: .55, mine: true });
    });
  } catch (e) { /* storage blocked: the roll starts clean */ }

  // ---------- geometry ----------
  // x runs along the roll (the keys read it at x = KB); y picks the key, bass at the bottom.

  let W = 0, H = 0, dpr = 1, KB = 46, rh = 10, beatPx = 60, L = 1440, colors, narrow = false;
  const tile = document.createElement('canvas');
  const PAD = 32;                     // the soft copy of the roll carries this much of its own other end on each side
  const softCvs = [0, 1, 2, 3].map(() => document.createElement('canvas'));
  const keysCv = document.createElement('canvas');
  const keyRects = [];

  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    W = w; H = h;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    narrow = W < 760;
    KB = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--kb')) || 46;
    rh = H / KEYS;
    beatPx = clamp(Math.round(W / 24), 40, 64);
    L = BEATS * beatPx;
    for (const c of [canvas, paperCv]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    colors = palette();
    measureKeys();
    drawPaper();
    drawTile();
    drawKeys();
    placeFog();
    placeTabs();
    draw(introT()); // paint now, not on the next frame, so the page never shows bare paper
  }

  const rowY = (k) => H - (k + .5) * rh;
  const holeH = () => Math.max(2.5, rh * .6);

  function measureKeys() {
    keyRects.length = 0;
    for (let k = 0; k < KEYS; k++) {
      const m = LOW + k;
      if (isBlack(m)) { keyRects[k] = { black: true, y0: H - (k + 1) * rh, y1: H - k * rh }; continue; }
      // a white key reaches halfway into the black keys beside it, as on a real keyboard
      const lo = k > 0 && isBlack(m - 1) ? k - .5 : k;
      const hi = k < KEYS - 1 && isBlack(m + 1) ? k + 1.5 : k + 1;
      keyRects[k] = { black: false, y0: H - hi * rh, y1: H - lo * rh };
    }
  }

  function palette() {
    const paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim() || '#f0e8d8';
    return {
      paper, fibreA: 'rgba(255,255,255,.45)', fibreB: 'rgba(100,70,25,.06)',
      hole: 'rgba(43,34,25,.86)', line: 'rgba(160,52,38,.38)', print: 'rgba(116,90,52,.6)',
      ivory: ['#e6dcc6', '#fbf7ee'], seam: 'rgba(90,70,40,.3)', ebony: ['#12100d', '#3b342c'], felt: '#8e2b22', label: 'rgba(90,76,56,.8)',
      press: 'rgba(196,140,60,', wash: 'rgba(150,112,40,', ghost: 'rgba(43,34,25,.5)', chad: '#d9cbad', shade: 'rgba(60,40,15,.16)', fog: .94,
    };
  }

  function rgba(hex, a) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  function seeded(n) {
    return () => { n = (n * 16807) % 2147483647; return (n - 1) / 2147483646; };
  }

  // The paper itself: still, with its fibres running the way it travels.
  function drawPaper() {
    const c = paperCv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = colors.paper;
    c.fillRect(0, 0, W, H);
    const rnd = seeded(11);
    const n = Math.round(W * H / 140);
    c.lineWidth = .6;
    for (let i = 0; i < n; i++) {
      const x = rnd() * W, y = rnd() * H, len = 3 + rnd() * 9, a = (rnd() - .5) * .35;
      c.strokeStyle = rnd() < .5 ? colors.fibreA : colors.fibreB;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      c.stroke();
    }
  }

  // What travels: the holes, and what's printed on the roll. One loop long, so it tiles.
  function drawTile() {
    tile.width = Math.round(L * dpr);
    tile.height = Math.round(H * dpr);
    const c = tile.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    // the expression line, printed in red: a guide to tempo and loudness for whoever sits at the pedals
    // kept below the caption in the corner, however short the window
    const base = Math.max(H * .17, 190);
    const lineY = (x) => { const t = (x / L) * Math.PI * 2; return base + H * (.04 * Math.sin(t) + .022 * Math.sin(3 * t + 1.3) + .01 * Math.sin(7 * t + .4)); };
    c.strokeStyle = colors.line;
    c.lineWidth = 1.1;
    c.beginPath();
    for (let x = -3; x <= L + 3; x += 3) { if (x < 0) c.moveTo(x, lineY(x)); else c.lineTo(x, lineY(x)); }
    c.stroke();
    c.fillStyle = colors.print;
    c.font = 'italic 400 13px Newsreader, Georgia, serif';
    c.fillText('Adagio, dolce', beatPx * .4, lineY(beatPx * .4) - 9);
    c.font = '400 8px "Fragment Mono", ui-monospace, monospace';
    if ('letterSpacing' in c) c.letterSpacing = '2px';
    c.fillText('ROLL Nº 1 · WALTZ IN D · ♩ = 56 · FOR P. S. SESODIA', beatPx * 1.2, H - 6);
    if ('letterSpacing' in c) c.letterSpacing = '0px';

    holes.forEach((h) => cut(c, h));
    soften();
  }

  function cut(c, h) {
    if (h.k === PEDAL) return;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = colors.hole;
    const hh = holeH(), y = rowY(h.k) - hh / 2;
    const x = h.s * beatPx, len = Math.max(hh, (h.e - h.s) * beatPx);
    for (const o of [0, -L]) slot(c, x + o, y, len, hh, true);
  }

  // The roll out of focus: shrunk in halves to an eighth of its size, then a step back up, and stretched to full
  // size as it's drawn. A blur any browser does quickly. The roll wraps round, so it's softened with a margin of
  // its own other end on each side, or the join would show.
  function soften() {
    const w = L + PAD * 2;
    const [half, quarter, eighth, back] = softCvs;
    const fit = (cv, d) => {
      const cw = Math.max(1, Math.round(w / d)), ch = Math.max(1, Math.round(H / d));
      if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
      const c = cv.getContext('2d');
      c.clearRect(0, 0, cw, ch);
      c.imageSmoothingQuality = 'high';
      return c;
    };
    const c = fit(half, 2);
    for (const o of [-L, 0, L]) c.drawImage(tile, (PAD + o) / 2, 0, L / 2, H / 2);
    fit(quarter, 4).drawImage(half, 0, 0, quarter.width, quarter.height);
    fit(eighth, 8).drawImage(quarter, 0, 0, eighth.width, eighth.height);
    fit(back, 4).drawImage(eighth, 0, 0, back.width, back.height);
  }

  function slot(c, x, y, w, h, fill) {
    c.beginPath();
    const r = Math.min(w, h) / 2;
    if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h);
    if (fill) c.fill(); else c.stroke();
  }

  // The keyboard, at rest. Pressed keys are drawn over it each frame.
  function drawKeys() {
    const w = KB + 14;
    keysCv.width = Math.round(w * dpr);
    keysCv.height = Math.round(H * dpr);
    const c = keysCv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sh = c.createLinearGradient(KB, 0, KB + 14, 0);
    sh.addColorStop(0, colors.shade);
    sh.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = sh;
    c.fillRect(KB, 0, 14, H);

    const wg = c.createLinearGradient(0, 0, KB, 0);
    wg.addColorStop(0, colors.ivory[0]);
    wg.addColorStop(.82, colors.ivory[1]);
    wg.addColorStop(1, colors.ivory[0]);
    keyRects.forEach((r) => {
      if (r.black) return;
      c.fillStyle = wg;
      c.fillRect(0, r.y0, KB, r.y1 - r.y0);
      c.fillStyle = colors.seam;
      c.fillRect(0, r.y1 - .6, KB, .6);
    });

    const bw = KB * .6;
    const bg = c.createLinearGradient(0, 0, bw, 0);
    bg.addColorStop(0, colors.ebony[0]);
    bg.addColorStop(.88, colors.ebony[1]);
    bg.addColorStop(1, colors.ebony[0]);
    c.fillStyle = bg;
    keyRects.forEach((r) => {
      if (!r.black) return;
      c.beginPath();
      if (c.roundRect) c.roundRect(0, r.y0 + .4, bw, r.y1 - r.y0 - .8, [0, 1.5, 1.5, 0]); else c.rect(0, r.y0 + .4, bw, r.y1 - r.y0 - .8);
      c.fill();
    });

    // felt along the back of the keys, and the line of their front edge
    c.fillStyle = colors.felt;
    c.fillRect(0, 0, 2.5, H);
    c.fillStyle = 'rgba(0,0,0,.2)';
    c.fillRect(KB - .8, 0, .8, H);

    // the Cs, numbered as on a keyboard
    c.fillStyle = colors.label;
    c.font = `400 ${narrow ? 6 : 7}px "Fragment Mono", ui-monospace, monospace`;
    c.textAlign = 'right';
    keyRects.forEach((r, k) => {
      if (mod(LOW + k, 12) === 0) c.fillText('C' + (Math.floor((LOW + k) / 12) - 1), KB - 3, (r.y0 + r.y1) / 2 + 2.4);
    });
  }

  // A quiet patch of paper behind the reading column, so text never sits on a busy roll.
  function placeFog() {
    const col = document.querySelector('[data-fog]');
    if (!fog || !col) return;
    const r = col.getBoundingClientRect();
    const feather = 72;
    const left = Math.max(KB, r.left - feather), right = Math.min(W, r.right + feather);
    const a = colors.fog - (narrow ? .05 : 0);
    const solid = rgba(colors.paper.length > 3 ? colors.paper : '#f0e8d8', a);
    const fl = Math.max(0, r.left - left), fr = Math.max(0, right - r.right);
    fog.style.left = left + 'px';
    fog.style.width = (right - left) + 'px';
    fog.style.background = `linear-gradient(to right, ${rgba(colors.paper, 0)}, ${solid} ${fl}px, ${solid} calc(100% - ${fr}px), ${rgba(colors.paper, 0)})`;
  }

  // ---------- playing ----------

  let off = 0, kept = false;
  try { kept = sessionStorage.getItem(OFFSET) !== null; off = parseFloat(sessionStorage.getItem(OFFSET)) || 0; } catch (e) { /* a fresh roll */ }
  // On the first page of a visit the keys slide in and the paper threads through; after that it simply carries on.
  let shown = off;
  // the first page of a visit opens with a short loading screen; the keys slide in as it lifts
  const introAt = performance.now() + (document.documentElement.classList.contains('loader-on') ? 600 : 0);
  const INTRO = reduced || kept ? 0 : 2400;
  const introT = (now = performance.now()) => (INTRO ? clamp((now - introAt) / INTRO, 0, 1) : 1);
  const glow = new Float32Array(KEYS);
  const down = new Int16Array(KEYS);
  let pedal = false;
  let speed = DRIFT, scrollV = 0, lastY = window.scrollY, last = performance.now();
  let hover = null, dirty = 0, frame = 0;
  // How the roll shows: presence (how strongly), clarity (1 in focus, 0 soft), and the volume. They follow focus,
  // which is 1 on the opening screen, while the cursor is near the keys, and for a moment after a visitor punches
  // or plays a note (attn), so they can see what they did; 0 while reading.
  // Phones and tablets have no hover: there the roll always stays soft and quiet.
  const heroEl = document.querySelector('.page > .hero');
  let presence = -1, clarity = 1, attn = 0, near = 0;
  let pAim = 1, cAim = 1, vAim = MASTER;
  const chads = [];
  const live = new Map();             // notes being held right now, at the keys: they grow as the paper moves

  function covers(h, x) {
    return mod(x - h.s, BEATS) <= h.e - h.s;
  }
  function crosses(h, lo, hi) {
    if (hi - lo >= BEATS) return true;
    const r = mod(lo - h.s, BEATS);
    return r <= h.e - h.s || lo + BEATS - r <= hi;
  }

  // direct: the note comes from a click or key press, so if the sound is still waking up it plays the moment it can
  function start(h, gain, direct) {
    if (h.k === PEDAL) { pedal = true; return; }
    down[h.k]++;
    glow[h.k] = 1;
    if (playing() || !direct) { h.voice = sound(LOW + h.k, h.v * gain); return; }
    whenAwake(() => {
      const v = sound(LOW + h.k, h.v * gain);
      if (h.on && !h.voice) h.voice = v; else release(v, .3);
    });
  }
  function stop(h) {
    if (h.k === PEDAL) {
      pedal = false;
      sustained.forEach((v) => release(v, .35));
      sustained.clear();
      return;
    }
    down[h.k] = Math.max(0, down[h.k] - 1);
    if (h.voice) {
      if (pedal) sustained.add(h.voice); else release(h.voice);
      h.voice = null;
    }
  }

  // A visitor's own note plays once: when it has passed the keys it's gone from the roll.
  function sweep(a, b, gain) {
    const lo = Math.min(a, b), hi = Math.max(a, b);
    let spent = false;
    for (const h of holes) {
      const on = covers(h, b);
      if (!h.on && (on || crosses(h, lo, hi))) {
        start(h, gain);
        if (!on) { stop(h); if (h.mine) h.spent = spent = true; }
      } else if (h.on && !on) { stop(h); if (h.mine) h.spent = spent = true; }
      h.on = on;
    }
    if (!spent) return;
    for (let i = holes.length - 1; i >= 0; i--) if (holes[i].spent) holes.splice(i, 1);
    dirty = 1;
    save();
    changed();
  }

  function tick(now) {
    requestAnimationFrame(tick);
    const dt = Math.min(.1, (now - last) / 1000);
    last = now;
    if (!W) return;

    const y = window.scrollY;
    const pxs = dt > 0 ? (y - lastY) / dt : 0;
    lastY = y;
    scrollV += (clamp(pxs * .15 / beatPx, -3, 3) - scrollV) * (1 - Math.exp(-dt * 10));
    speed += ((playing() ? TEMPO : DRIFT) - speed) * (1 - Math.exp(-dt * 2.2));
    off += (speed + scrollV) * dt;

    attn = Math.max(0, attn - dt / 1.2);
    aim();
    const ease = 1 - Math.exp(-dt * 9); // quick: in or out of focus in about a third of a second
    presence += (pAim - presence) * ease;
    clarity += (cAim - clarity) * ease;
    const settling = Math.abs(pAim - presence) + Math.abs(cAim - clarity) > .006;
    if (soundOn && ac) level(vAim);

    const t = introT(now);
    const before = shown;
    shown = off - 3 * Math.pow(1 - t, 3);

    for (const h of live.values()) h.e = h.s + clamp(shown - h.at, .12, 8);
    if (dirty || live.size) { drawTile(); dirty = 0; }

    const v = Math.abs(speed + scrollV);
    if (t < 1) holes.forEach((h) => { h.on = covers(h, shown); });
    else sweep(before, shown, clamp(1.5 / Math.max(1.5, v), .3, 1));

    let lit = false;
    for (let k = 0; k < KEYS; k++) {
      glow[k] = down[k] ? Math.min(1, glow[k] + dt * 8) : glow[k] * Math.exp(-dt * 3.2);
      if (glow[k] > .02) lit = true;
    }
    // the brass wash fades out of the old octave before it fades into the new one
    if (washK !== activeK) { wash -= dt * 5; if (wash <= 0) { wash = 0; washK = activeK; } lit = true; }
    else if (wash < 1) { wash = Math.min(1, wash + dt * 3); lit = true; }
    for (let i = chads.length - 1; i >= 0; i--) {
      const ch = chads[i];
      ch.t += dt;
      ch.vy += 900 * dt;
      ch.x += ch.vx * dt;
      ch.y += ch.vy * dt;
      ch.r += ch.vr * dt;
      if (ch.t > 1.1) chads.splice(i, 1);
    }

    // a slow, quiet roll only needs half the frames
    const busy = v > .5 || lit || chads.length || hover || live.size || t < 1 || settling;
    if (busy || (frame++ & 1) === 0) draw(t);
  }

  // 1 while the opening screen is in view, falling to 0 as it scrolls away
  function opening() {
    if (!heroEl) return 0;
    return clamp((heroEl.getBoundingClientRect().bottom - H * .25) / (H * .5), 0, 1);
  }
  function aim() {
    const open = opening();
    document.documentElement.classList.toggle('roll-quiet', open < .5);
    const focus = coarse ? 0 : Math.max(open, near, Math.min(1, attn));
    pAim = QUIET + (1 - QUIET) * (coarse ? open : focus);
    cAim = focus;
    vAim = MASTER * (HUSH + (1 - HUSH) * focus);
    if (presence < 0) { presence = pAim; clarity = cAim; } // a page reloaded halfway down starts quiet, without fading
  }

  function draw(t) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    // whole device pixels, or the seam between two copies of the tile shows
    if (presence < 0) aim();
    const x0 = KB - Math.round(mod(shown * beatPx, L) * dpr) / dpr;
    if (clarity < .995) {
      const back = softCvs[3], k = back.width / (L + PAD * 2);
      g.globalAlpha = presence * (1 - clarity);
      for (let x = x0; x < W; x += L) g.drawImage(back, PAD * k, 0, L * k, back.height, x, 0, L, H);
    }
    if (clarity > .005) {
      g.globalAlpha = presence * clarity;
      for (let x = x0; x < W; x += L) g.drawImage(tile, x, 0, L, H);
    }
    g.globalAlpha = 1;

    if (hover) {
      const k = snap(hover.y), hh = holeH();
      g.strokeStyle = colors.ghost;
      g.lineWidth = 1;
      slot(g, hover.x - beatPx * .25, rowY(k) - hh / 2 - .5, beatPx * .5, hh + 1, false);
    }

    g.fillStyle = colors.chad;
    for (const ch of chads) {
      g.save();
      g.globalAlpha = Math.max(0, 1 - ch.t / 1.1);
      g.translate(ch.x, ch.y);
      g.rotate(ch.r);
      g.fillRect(-ch.w / 2, -ch.h / 2, ch.w, ch.h);
      g.restore();
    }

    const slide = (1 - Math.pow(Math.min(1, t * 1.6), 3)) * -(KB + 14);
    g.translate(slide, 0);
    g.drawImage(keysCv, 0, 0, KB + 14, H);

    // the octave of the part you're reading, washed in brass
    if (washK >= 0 && wash > .01) {
      const y0 = H - (washK + 12) * rh, y1 = H - washK * rh;
      g.fillStyle = colors.wash + (.2 * wash).toFixed(3) + ')';
      g.fillRect(2.5, y0, KB - 2.5, y1 - y0);
      g.fillStyle = colors.wash + (.85 * wash).toFixed(3) + ')';
      g.fillRect(KB - 2.5, y0 + 1, 2.5, y1 - y0 - 2);
    }

    // keys going down, and light where the paper meets them (dimmer while you're reading)
    const shine = .35 + .65 * clarity;
    for (let k = 0; k < KEYS; k++) {
      const v = glow[k];
      if (v < .02) continue;
      const r = keyRects[k], w = r.black ? KB * .6 : KB, y = rowY(k);
      g.fillStyle = colors.press + (r.black ? .45 : .28) * v + ')';
      g.fillRect(2.5, r.black ? r.y0 + .4 : r.y0, w - 2.5, r.black ? r.y1 - r.y0 - .8 : r.y1 - r.y0);
      const streak = g.createLinearGradient(KB, 0, KB + 70 * v, 0);
      streak.addColorStop(0, `rgba(255,214,150,${(.55 * v * shine).toFixed(3)})`);
      streak.addColorStop(1, 'rgba(255,214,150,0)');
      g.fillStyle = streak;
      g.fillRect(KB, y - holeH() / 2, 70 * v, holeH());
      const rr = 4 + 14 * v;
      const rg = g.createRadialGradient(KB, y, 0, KB, y, rr);
      rg.addColorStop(0, `rgba(255,224,165,${(.9 * v * shine).toFixed(3)})`);
      rg.addColorStop(1, 'rgba(255,200,120,0)');
      g.fillStyle = rg;
      g.fillRect(KB - rr, y - rr, rr * 2, rr * 2);
    }
  }

  // ---------- punching the paper ----------

  const onPaper = (el) => !(el instanceof Element) || !el.closest(SOLID);

  function snap(y) {
    const lo = 43 - LOW, hi = 81 - LOW; // nothing boomy, nothing shrill: punched notes stay in the waltz's range
    const k = clamp(Math.round((H - y) / rh - .5), lo, hi);
    for (let d = 0; d < 7; d++) {
      for (const n of [k - d, k + d]) if (n >= lo && n <= hi && PENTA.includes(mod(LOW + n, 12))) return n;
    }
    return k;
  }

  function punch(x, y) {
    const k = snap(y);
    const at = shown + (x - KB) / beatPx;
    const h = { k, s: mod(at, BEATS), e: mod(at, BEATS) + .5, v: .55, mine: true, at };
    attn = 1.4;
    h.on = covers(h, shown);
    holes.push(h);
    if (trim()) drawTile(); else { cut(tile.getContext('2d'), h); soften(); }
    if (h.on) start(h, 1, true);
    else blip(LOW + k, .5, 380);
    chads.push({ x, y: rowY(k), w: beatPx * .5, h: holeH(), vx: (Math.random() - .5) * 120, vy: -60 - Math.random() * 90, r: 0, vr: (Math.random() - .5) * 10, t: 0 });
    changed();
    return h;
  }

  function trim() {
    const mine = holes.filter((h) => h.mine);
    if (mine.length <= MAX_MINE) return false;
    const drop = new Set(mine.slice(0, mine.length - MAX_MINE));
    for (let i = holes.length - 1; i >= 0; i--) {
      if (drop.has(holes[i])) { if (holes[i].on) stop(holes[i]); holes.splice(i, 1); }
    }
    return true;
  }

  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify(holes.filter((h) => h.mine).map((h) => [h.k, +h.s.toFixed(3), +(h.e - h.s).toFixed(3)])));
    } catch (e) { /* not saved, still punched */ }
  }

  function changed() {
    const n = holes.filter((h) => h.mine).length;
    clearBtn.hidden = !n;
    clearBtn.textContent = n === 1 ? 'Clear your note' : `Clear your ${n} notes`;
  }

  // A mouse punches on click: one click, one note, and dragging afterwards adds nothing and stretches nothing.
  // A finger never punches the paper; on a touch screen only the keys play.
  document.addEventListener('pointerdown', (e) => {
    wake();
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.clientX < KB + 2 || !onPaper(e.target)) return;
    e.preventDefault();
    punch(e.clientX, e.clientY);
    save();
  });

  // the cursor near the keys brings the roll into focus, more the nearer it is
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    hover = e.buttons === 0 && e.clientX > KB + 2 && onPaper(e.target) ? { x: e.clientX, y: e.clientY } : null;
    near = clamp(1 - (e.clientX - KB - NEAR) / 150, 0, 1);
  });
  document.documentElement.addEventListener('pointerleave', () => { hover = null; near = 0; });

  clearBtn.addEventListener('click', () => {
    for (let i = holes.length - 1; i >= 0; i--) {
      if (holes[i].mine) { if (holes[i].on) stop(holes[i]); holes.splice(i, 1); }
    }
    live.clear();
    drawTile();
    save();
    changed();
  });

  // ---------- playing the keys: by pointer, or the home row of a computer keyboard ----------
  // Either way the note is punched at the keys as it sounds, like a recording piano.

  function keyAt(x, y) {
    if (x < KB * .6) {
      for (let k = 0; k < KEYS; k++) { const r = keyRects[k]; if (r.black && y >= r.y0 && y < r.y1) return k; }
    }
    for (let k = 0; k < KEYS; k++) { const r = keyRects[k]; if (!r.black && y >= r.y0 && y < r.y1) return k; }
    return -1;
  }

  function press(id, k) {
    const h = { k, s: mod(shown, BEATS), e: mod(shown, BEATS) + .12, v: .6, mine: true, at: shown, on: true };
    holes.push(h);
    attn = 1.4;
    if (trim()) drawTile();
    start(h, 1, true);
    live.set(id, h);
    changed();
  }
  function lift(id) {
    if (live.delete(id)) { dirty = 1; save(); }
  }

  // With a mouse, a click on a key plays it (turning sound on) and records that one note; sliding across keys adds nothing.
  // With a finger, the strip along the edge belongs to scrolling first: only a clean tap plays a key,
  // it never turns sound on by itself, and it never records.
  let keyTap = null;
  keysHit.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') { keyTap = { id: e.pointerId, x: e.clientX, y: e.clientY }; return; }
    e.preventDefault();
    if (!soundOn) setSound(true);
    wake();
    keysHit.setPointerCapture(e.pointerId);
    const k = keyAt(e.clientX, e.clientY);
    if (k >= 0) press('p' + e.pointerId, k);
  });
  keysHit.addEventListener('pointermove', (e) => {
    if (keyTap && Math.hypot(e.clientX - keyTap.x, e.clientY - keyTap.y) > 8) keyTap = null;
  });
  keysHit.addEventListener('pointerup', (e) => {
    lift('p' + e.pointerId);
    if (!keyTap || keyTap.id !== e.pointerId) return;
    keyTap = null;
    const k = keyAt(e.clientX, e.clientY);
    if (k < 0) return;
    glow[k] = 1;
    blip(LOW + k, .5, 700);
  });
  keysHit.addEventListener('pointercancel', (e) => { lift('p' + e.pointerId); keyTap = null; });

  addEventListener('keydown', (e) => {
    if (!soundOn || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const el = e.target;
    if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
    const key = e.key.toLowerCase(), m = TYPE[key];
    if (!m || live.has(key)) return;
    wake();
    press(key, m - LOW);
  });
  addEventListener('keyup', (e) => lift(e.key.toLowerCase()));
  addEventListener('blur', () => { if (live.size) { live.clear(); dirty = 1; save(); } });

  // ---------- sound: a soft piano voice, synthesised ----------

  let ac = null, out = null, noise = null, soundOn = false, gainAim = 0, wokeAt = -1e9, spared = false;
  const voices = new Set(), sustained = new Set();
  const playing = () => soundOn && ac && ac.state === 'running';

  function audio() {
    if (ac) return ac;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
    // a limiter at the end, so a cluster of notes can never jump out louder than a single one
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -28; comp.knee.value = 6; comp.ratio.value = 12;
    comp.attack.value = .003; comp.release.value = .2;
    out = ac.createGain();
    out.gain.value = 0;
    const room = ac.createConvolver();
    room.buffer = impulse(2.4, 3.2);
    const wet = ac.createGain();
    wet.gain.value = .3;
    ac.onstatechange = label;
    out.connect(comp);
    out.connect(room); room.connect(wet); wet.connect(comp);
    comp.connect(ac.destination);
    noise = ac.createBuffer(1, Math.floor(ac.sampleRate * .04), ac.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    return ac;
  }

  function impulse(sec, decay) {
    const n = Math.floor(ac.sampleRate * sec);
    const b = ac.createBuffer(2, n, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay);
    }
    return b;
  }

  function sound(midi, vel) {
    // only into running audio: notes queued while it sleeps would all burst out at once when it wakes
    if (!playing()) return null;
    const t = ac.currentTime + .004;
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const ring = clamp(1.8 * Math.pow(220 / f, .45), .5, 3.6); // low strings ring longer
    const amp = ac.createGain();
    amp.gain.setValueAtTime(0, t);
    amp.gain.linearRampToValueAtTime(vel * .2, t + .005);
    amp.gain.setTargetAtTime(0, t + .005, ring);
    const tone = ac.createBiquadFilter();
    tone.type = 'lowpass';
    tone.Q.value = .5;
    // a dark, felted tone: little brightness at the strike, and it fades fast
    tone.frequency.setValueAtTime(Math.min(f * 4.5 + 300, 6000), t);
    tone.frequency.setTargetAtTime(Math.min(f * 1.8 + 200, 3500), t, .4);
    tone.connect(amp);
    amp.connect(out);
    const oscs = [];
    for (const [n, lvl, cents] of [[1, .75, -3], [1, .75, 3], [2, .26, 0], [3, .07, 1]]) {
      const o = ac.createOscillator(), p = ac.createGain();
      o.frequency.value = f * n * (1 + .00035 * n * n);
      o.detune.value = cents;
      p.gain.setValueAtTime(lvl, t);
      if (n > 1) p.gain.setTargetAtTime(0, t, ring / (n * 1.3));
      o.connect(p); p.connect(tone);
      o.start(t);
      o.stop(t + ring * 5 + .1);
      oscs.push(o);
    }
    // the hammer: a breath of filtered noise
    const hn = ac.createBufferSource();
    hn.buffer = noise;
    const hb = ac.createBiquadFilter();
    hb.type = 'bandpass'; hb.frequency.value = Math.min(f * 4, 7000); hb.Q.value = 1.2;
    const hg = ac.createGain();
    hg.gain.value = vel * .025;
    hn.connect(hb); hb.connect(hg); hg.connect(out);
    hn.start(t);
    const v = { amp, oscs };
    voices.add(v);
    oscs[0].onended = () => { voices.delete(v); sustained.delete(v); amp.disconnect(); };
    if (voices.size > 30) release(voices.values().next().value, .05);
    return v;
  }

  function release(v, time = .12) {
    if (!v || !ac) return;
    const t = ac.currentTime, p = v.amp.gain;
    if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t);
    else { p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); }
    p.setTargetAtTime(0, t, time);
    v.oscs.forEach((o) => { try { o.stop(t + time * 6 + .05); } catch (e) { /* already stopping */ } });
  }

  // A one-off note from a click or tap, released after `ms`.
  function blip(midi, vel, ms) {
    whenAwake(() => {
      const v = sound(midi, vel);
      if (v) setTimeout(() => release(v, .3), ms);
    });
  }

  // Run `fn` now if sound is running, or as soon as a waking context is up (never queued into a sleeping one).
  function whenAwake(fn) {
    if (playing()) { fn(); return; }
    if (!soundOn || !ac || ac.state === 'closed') return;
    ac.resume().then(() => { if (playing()) fn(); }).catch(() => {});
  }

  // Browsers let sound start only from a click, tap or key press, and some (iPhone) only when the finger lifts.
  function wake() {
    if (!soundOn) return;
    const a = audio();
    if (!a) return;
    if (a.state !== 'running') { wokeAt = performance.now(); a.resume().catch(() => {}); }
    if (!gainAim) { gainAim = vAim; out.gain.setTargetAtTime(gainAim, a.currentTime, .1); }
  }

  // the volume follows the roll's focus, fading rather than jumping
  function level(v) {
    if (!gainAim || Math.abs(v - gainAim) < MASTER * .02) return;
    gainAim = v;
    out.gain.setTargetAtTime(v, ac.currentTime, .12);
  }

  // The button says what's true: on, off, or on but waiting for the browser to allow it.
  function label() {
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    soundBtn.textContent = !soundOn ? 'Sound off' : playing() ? 'Sound on' : `Sound on · ${coarse ? 'tap' : 'click'} anywhere to start`;
  }

  function setSound(on, quietly) {
    soundOn = on;
    if (on && !quietly) {
      // on an iPhone, play even with the ringer switch on silent, now that the visitor has asked for sound
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* fine */ }
      wake();
    } else if (!on && ac) {
      gainAim = 0;
      out.gain.setTargetAtTime(0, ac.currentTime, .08);
      voices.forEach((v) => release(v, .08));
    }
    label();
    hint.textContent = coarse
      ? (on ? 'Tap a key to hear it. The roll plays as you scroll.'
            : 'This page is a piano roll, with its keys down the left edge. Turn the sound on and tap a key to hear it; the lettered tabs jump between sections.')
      : (on ? 'Click the keys, or play A to ; on your keyboard. A note you punch plays once as it reaches the keys.'
            : 'This page is a piano roll. Click the paper to punch a note, which plays once as it reaches the keys, or play the keys themselves; their lettered tabs jump between sections.');
    try { localStorage.setItem(SOUND, on ? '1' : '0'); } catch (e) { /* fine */ }
  }

  soundBtn.addEventListener('click', () => {
    // On, but waiting for the browser: the tap that starts it shouldn't also turn it off. Only once, though,
    // so a browser that never allows sound can't leave the switch stuck on.
    if (soundOn && performance.now() - wokeAt < 1500 && !spared) { spared = true; return; }
    spared = false;
    setSound(!soundOn);
  });
  let pref = null;
  try { pref = localStorage.getItem(SOUND); } catch (e) { /* fine */ }
  setSound(pref === '1', true);
  // A remembered "on" waits for the visitor's first click, tap or key, whichever the browser accepts.
  for (const type of ['pointerdown', 'pointerup', 'click', 'touchend', 'keydown']) addEventListener(type, wake, { capture: true, passive: true });
  // coming back to the tab (a phone may have paused the audio): pick up again if the browser allows it
  document.addEventListener('visibilitychange', () => { if (!document.hidden && ac) wake(); });

  // ---------- octave tabs: the keyboard doubles as the page's contents ----------
  // Each section is pinned to a C, the top of the page at the top of the keyboard, and labelled the way a score
  // labels its parts: D.C. (da capo, back to the beginning), the rehearsal letters, and Fine for the end.
  // The tab for the part you're reading fills in, and its octave lights on the keys.

  const CS = [87, 75, 63, 51, 39, 27, 15, 3]; // C8 down to C1
  const tabs = [];
  let activeK = -1, washK = -1, wash = 0;

  (() => {
    const parts = [];
    const hero = document.querySelector('.page > .hero');
    if (hero) parts.push({ el: hero, label: 'D.C.', name: 'Back to the top', cls: 'dc' });
    document.querySelectorAll('.page > .sec').forEach((sec) => {
      const m = sec.querySelector(':scope > .mark');
      if (!m) return;
      const fine = m.classList.contains('fine');
      const h = sec.querySelector('h2');
      parts.push({ el: sec, label: m.textContent.trim(), name: fine ? 'Write to me' : (h ? h.textContent.trim() : m.textContent.trim()), cls: fine ? 'fine' : '' });
    });
    if (!parts.length) return;
    const keys = parts.length <= 7 ? CS.slice(1, 1 + parts.length) : CS.slice(0, 8);
    const nav = document.createElement('nav');
    nav.className = 'octaves';
    nav.setAttribute('aria-label', 'Sections');
    parts.slice(0, 8).forEach((p, i) => {
      if (!p.el.id) p.el.id = i === 0 ? 'top' : 'part-' + p.label.toLowerCase().replace(/[^a-z]/g, '');
      const k = keys[i];
      const a = document.createElement('a');
      a.className = 'oct' + (p.cls ? ' ' + p.cls : '');
      a.href = '#' + p.el.id;
      a.textContent = p.label;
      a.dataset.name = p.name;
      a.setAttribute('aria-label', `${p.name}, the C${Math.floor((LOW + k) / 12) - 1} octave`);
      // jumping to a part lights that octave's D, the key of the waltz, and sounds a D (kept mid-range) if sound is on
      a.addEventListener('click', () => {
        glow[k + 2] = 1;
        let m = LOW + k + 2;
        while (m > 74) m -= 12;
        while (m < 50) m += 12;
        blip(m, .38, 900);
      });
      nav.appendChild(a);
      tabs.push({ el: p.el, k, a });
    });
    const skip = document.querySelector('.skip');
    if (skip) skip.after(nav); else document.body.prepend(nav);
  })();

  function placeTabs() {
    tabs.forEach((t) => {
      const r = keyRects[t.k];
      t.a.style.top = clamp((r.y0 + r.y1) / 2, 14, H - 14) + 'px';
    });
  }

  function findActive() {
    if (!tabs.length) return;
    const line = window.innerHeight * .42;
    let cur = tabs[0];
    for (const t of tabs) if (t.el.getBoundingClientRect().top <= line) cur = t;
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = tabs[tabs.length - 1];
    if (cur.k === activeK) return;
    activeK = cur.k;
    tabs.forEach((t) => {
      t.a.classList.toggle('on', t === cur);
      if (t === cur) t.a.setAttribute('aria-current', 'true'); else t.a.removeAttribute('aria-current');
    });
  }
  let finding = false;
  addEventListener('scroll', () => {
    if (finding) return;
    finding = true;
    requestAnimationFrame(() => { finding = false; findActive(); });
  }, { passive: true });

  // ---------- upkeep ----------

  let lastW = 0, lastH = 0;
  const relayout = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === lastW && h === lastH) { placeFog(); return; }
    lastW = w; lastH = h;
    layout();
  };
  new ResizeObserver(relayout).observe(canvas);
  const col = document.querySelector('[data-fog]');
  if (col) new ResizeObserver(() => { if (W) placeFog(); }).observe(col);
  const repaint = () => { if (!W) return; colors = palette(); drawPaper(); drawTile(); drawKeys(); placeFog(); };
  if (document.fonts) document.fonts.ready.then(repaint);
  addEventListener('pagehide', () => { try { sessionStorage.setItem(OFFSET, String(off)); } catch (e) { /* fine */ } });

  findActive();
  addEventListener('load', () => setTimeout(findActive, 50)); // after the browser restores a reloaded page's scroll
  layout();
  changed();
  requestAnimationFrame((now) => { last = now; requestAnimationFrame(tick); });
})();
