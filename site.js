/* =============================================
   MOH KASHANI — SITE SCRIPT
   ============================================= */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Track configuration ----------
   cv / resume: drop tailored PDFs into the repo and point these at them. */
const TRACKS = {
  all: {
    title: 'Moh Kashani',
    tagline: 'Quantum · RF & Security · Embedded — I do all three',
    cv: 'Moh_CV (1).pdf',
    resume: 'Resume.docx.pdf',
    order: ['education', 'experience', 'media', 'research', 'skills', 'publications', 'projects', 'awards', 'talks', 'hobbies'],
  },
  quantum: {
    title: 'Moh Kashani — Quantum',
    tagline: 'Real-time control for quantum computers & networks',
    cv: 'Moh_CV (1).pdf',
    resume: 'Resume.docx.pdf',
    order: ['experience', 'projects', 'research', 'skills', 'talks', 'education', 'publications', 'awards', 'media', 'hobbies'],
  },
  rf: {
    title: 'Moh Kashani — RF & Security',
    tagline: 'RF fingerprinting, wireless security & secure protocols',
    cv: 'Moh_CV (1).pdf',
    resume: 'Resume.docx.pdf',
    order: ['experience', 'publications', 'research', 'media', 'talks', 'skills', 'awards', 'education', 'projects', 'hobbies'],
  },
  embedded: {
    title: 'Moh Kashani — Embedded',
    tagline: 'Firmware, FPGA & PCB design for real-world devices',
    cv: 'Moh_CV (1).pdf',
    resume: 'Resume.docx.pdf',
    order: ['projects', 'experience', 'skills', 'research', 'education', 'publications', 'talks', 'awards', 'media', 'hobbies'],
  },
};

const root = document.documentElement;
const main = document.getElementById('main');
const navbar = document.getElementById('navbar');
const navList = document.getElementById('nav-links');
const hero = document.getElementById('home');
const heroContent = hero.querySelector('.hero-minimal-content');
const heroHint = hero.querySelector('.hero-scroll-hint');
const heroCanvasEl = document.getElementById('hero-canvas');
const dock = document.getElementById('track-dock');
const dockIndicator = document.getElementById('dock-indicator');
const progress = document.getElementById('scroll-progress');
let currentTrack = null;

/* ---------- Experience tabs & mobile menu ---------- */
function showTab(id, btn) {
  document.querySelectorAll('.exp-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.exp-tab').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}

function toggleMenu() {
  navList.classList.toggle('open');
}
function closeMenu() {
  navList.classList.remove('open');
}

/* ---------- Collapsible sections ---------- */
const CHEVRON = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;

function addToggleBtn(wrapper) {
  const btn = document.createElement('button');
  btn.className = 'read-more-btn';
  btn.innerHTML = `${CHEVRON} Read more`;
  btn.addEventListener('click', () => {
    const open = wrapper.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.innerHTML = `${CHEVRON} ${open ? 'Show less' : 'Read more'}`;
  });
  wrapper.insertAdjacentElement('afterend', btn);
}

function wrapCollapsible(el) {
  const wrapper = document.createElement('div');
  wrapper.className = 'collapsible-body';
  el.replaceWith(wrapper);
  wrapper.appendChild(el);
  return wrapper;
}

// Experience: collapse bullet lists + any following lab/link div
document.querySelectorAll('.exp-bullets').forEach(ul => {
  const wrapper = wrapCollapsible(ul);
  const next = wrapper.nextElementSibling;
  if (next && next.tagName === 'DIV' && next.hasAttribute('style')) wrapper.appendChild(next);
  addToggleBtn(wrapper);
});
// Research interest card descriptions
document.querySelectorAll('.interest-card p').forEach(p => addToggleBtn(wrapCollapsible(p)));

/* ---------- Reveal-on-scroll ---------- */
const REVEAL_SEL = '.interest-card, .edu-item, .exp-item, .pub-item, .award-item, .skill-group, .news-item, .talk-card, .hobby-card';

const revealObserver = new IntersectionObserver(entries => {
  entries.filter(e => e.isIntersecting).forEach((e, i) => {
    const el = e.target;
    const delay = reduceMotion ? 0 : Math.min(i, 6) * 80;
    revealObserver.unobserve(el);
    el.style.transitionDelay = `${delay}ms`;
    el.classList.add('visible');
    // Drop the reveal classes afterwards so the element's own hover transitions work again
    el._revealTimer = setTimeout(() => {
      el.classList.remove('fade-in', 'visible');
      el.style.transitionDelay = '';
    }, 700 + delay);
  });
}, { threshold: 0.1 });

function armReveal(el) {
  clearTimeout(el._revealTimer);
  el.classList.remove('visible');
  el.classList.add('fade-in');
  revealObserver.observe(el);
}

// Section headings: label/title rise in, divider draws itself
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      sectionObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('section:not(.hero)').forEach(s => sectionObserver.observe(s));

// Highlight the nav link of the section currently in the middle of the screen
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navList.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('section[id]:not(.hero)').forEach(s => navObserver.observe(s));

/* ---------- Tagline "decode" effect ---------- */
function scramble(el, text, instant) {
  cancelAnimationFrame(el._raf);
  if (instant || reduceMotion) {
    el.textContent = text;
    return;
  }
  const glyphs = '01⟩ψ∿#<>/_|';
  const start = performance.now();
  const dur = 750;
  const step = now => {
    const p = Math.min(1, (now - start) / dur);
    const fixed = Math.floor(p * text.length);
    let out = text.slice(0, fixed);
    for (let i = fixed; i < text.length; i++) {
      out += text[i] === ' ' ? ' ' : glyphs[(Math.random() * glyphs.length) | 0];
    }
    el.textContent = out;
    if (p < 1) el._raf = requestAnimationFrame(step);
  };
  el._raf = requestAnimationFrame(step);
}

/* ---------- Track filtering ---------- */
document.querySelectorAll('#main [data-track]').forEach((el, i) => { el.dataset.idx = i; });

function matches(el, track) {
  if (track === 'all') return true;
  const tags = el.dataset.track.split(' ');
  return tags.includes('all') || tags.includes(track);
}

function makeMoreButton(group, off, onCount) {
  const btn = document.createElement('button');
  btn.className = 'track-more';
  const label = open => open
    ? 'Hide other areas'
    : `Show ${off.length} ${onCount ? 'more ' : ''}from other areas`;
  btn.innerHTML = `${CHEVRON} ${label(false)}`;
  btn.addEventListener('click', () => {
    const open = group.classList.toggle('show-off');
    btn.classList.toggle('open', open);
    btn.innerHTML = `${CHEVRON} ${label(open)}`;
    if (open) off.forEach(armReveal);
  });
  return btn;
}

function applyTrack(track, instant) {
  const cfg = TRACKS[track];
  currentTrack = track;
  if (track === 'all') delete root.dataset.track; else root.dataset.track = track;
  document.title = cfg.title;

  // 1. Within each list: on-track items first, off-track ones tucked behind a button
  const groups = new Set([...document.querySelectorAll('#main [data-track]')].map(el => el.parentElement));
  groups.forEach(group => {
    group.classList.remove('show-off');
    group.querySelectorAll(':scope > .track-more').forEach(b => b.remove());
    const items = [...group.querySelectorAll(':scope > [data-track]')].sort((a, b) => a.dataset.idx - b.dataset.idx);
    const on = items.filter(el => matches(el, track));
    const off = items.filter(el => !matches(el, track));
    on.forEach(el => { el.classList.remove('off-track'); group.appendChild(el); });
    off.forEach(el => { el.classList.add('off-track'); group.appendChild(el); });
    group.dataset.on = on.length;
    if (off.length) group.appendChild(makeMoreButton(group, off, on.length));
  });

  // 2. Experience tabs: hide tabs with nothing on-track, open the first remaining one
  let firstTab = null;
  document.querySelectorAll('.exp-tab').forEach(tab => {
    const empty = document.getElementById(tab.dataset.panel).dataset.on === '0';
    tab.classList.toggle('track-hidden', empty);
    if (!empty && !firstTab) firstTab = tab;
  });
  if (firstTab) showTab(firstTab.dataset.panel, firstTab);

  // 3. Reorder sections (and nav links) for this track; hide empty ones
  cfg.order.forEach(id => {
    const sec = document.getElementById(id);
    const items = [...sec.querySelectorAll('[data-track]')];
    const empty = items.length > 0 && !items.some(el => matches(el, track)) && !sec.hasAttribute('data-keep');
    sec.classList.toggle('track-hidden', empty);
    main.appendChild(sec);
    const link = navList.querySelector(`a[href="#${id}"]`);
    if (link) {
      link.parentElement.classList.toggle('track-hidden', empty);
      navList.appendChild(link.parentElement);
    }
  });
  navList.appendChild(navList.querySelector('a[href="#contact"]').parentElement);

  // Keep the white/light banding alternating after the reorder
  let n = 0;
  [...main.children].forEach(sec => {
    if (sec.classList.contains('track-hidden')) return;
    sec.classList.toggle('section-white', n % 2 === 0);
    sec.classList.toggle('section-light', n % 2 === 1);
    n++;
  });

  // 4. Hero text, CV links, chooser state
  scramble(document.getElementById('hero-tagline'), cfg.tagline, instant);
  document.getElementById('cv-link').href = cfg.cv;
  document.getElementById('resume-link').href = cfg.resume;
  document.querySelectorAll('[data-choose]').forEach(b => {
    const on = b.dataset.choose === track;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', on);
  });
  moveDockIndicator();

  // 5. Shareable URL: ?track=quantum
  const url = new URL(location.href);
  if (track === 'all') url.searchParams.delete('track'); else url.searchParams.set('track', track);
  if (TRACKS[url.hash.slice(1)]) url.hash = '';
  history.replaceState(null, '', url);

  // 6. Replay reveal animations on the new layout
  document.querySelectorAll(REVEAL_SEL).forEach(armReveal);
  heroCanvas.redraw();
}

function chooseTrack(track, originEl) {
  const fromHero = !!originEl.closest('.hero');
  const mainTop = () => main.getBoundingClientRect().top + window.scrollY;
  const glide = () => window.scrollTo({ top: mainTop(), behavior: reduceMotion ? 'auto' : 'smooth' });
  const update = () => {
    applyTrack(track);
    // From the floating switcher, jump to the top of the re-ordered content
    if (!fromHero) window.scrollTo({ top: mainTop(), behavior: 'instant' });
  };

  if (track === currentTrack) { glide(); return; }

  if (!document.startViewTransition || reduceMotion) {
    update();
    if (fromHero) glide();
    return;
  }

  // Circular reveal of the new track, expanding from the clicked control
  const r = originEl.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const vt = document.startViewTransition(update);
  vt.ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 700, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
    );
  });
  if (fromHero) vt.finished.then(() => setTimeout(glide, 150));
}

document.querySelectorAll('[data-choose]').forEach(btn => {
  btn.addEventListener('click', () => chooseTrack(btn.dataset.choose, btn));
});

function moveDockIndicator() {
  const active = dock.querySelector('button.active');
  if (!active) return;
  dockIndicator.style.width = `${active.offsetWidth}px`;
  dockIndicator.style.transform = `translateX(${active.offsetLeft}px)`;
}
window.addEventListener('resize', moveDockIndicator);

/* ---------- Scroll effects ---------- */
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const y = window.scrollY;
    const heroH = hero.offsetHeight;
    const max = document.documentElement.scrollHeight - innerHeight;

    navbar.classList.toggle('scrolled', y > 40);
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    dock.classList.toggle('show', y > heroH * 0.6);

    // Hero parallax: content drifts up and fades, background animation lags behind
    if (!reduceMotion && y <= heroH) {
      const fade = Math.max(0, 1 - y / (heroH * 0.85));
      heroContent.style.transform = `translateY(${y * 0.3}px)`;
      heroContent.style.opacity = fade;
      heroHint.style.opacity = Math.max(0, 1 - y / 150);
      heroCanvasEl.style.transform = `translateY(${y * 0.5}px)`;
    }
  });
}
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Hero background animation (one mode per track) ---------- */
const heroCanvas = (() => {
  const ctx = heroCanvasEl.getContext('2d');
  const COLORS = { all: '147,197,253', quantum: '196,181,253', rf: '103,232,249', embedded: '110,231,183' };
  let w = 0, h = 0, nodes = [], traces = [], running = false, t0 = performance.now();
  const rand = (a, b) => a + Math.random() * (b - a);

  function seed() {
    nodes = Array.from({ length: Math.round((w * h) / 26000) }, () => ({
      x: rand(0, w), y: rand(0, h), vx: rand(-0.15, 0.15), vy: rand(-0.15, 0.15), p: rand(0, Math.PI * 2),
    }));
    // Random Manhattan-routed PCB traces on a grid
    const g = 36;
    traces = Array.from({ length: Math.round((w * h) / 38000) }, () => {
      let x = Math.round(rand(0, w) / g) * g;
      let y = Math.round(rand(0, h) / g) * g;
      const pts = [[x, y]];
      let horiz = Math.random() < 0.5;
      let len = 0;
      for (let s = 0; s < 4; s++) {
        const d = Math.round(rand(1, 5)) * g * (Math.random() < 0.5 ? -1 : 1);
        if (horiz) x += d; else y += d;
        pts.push([x, y]);
        len += Math.abs(d);
        horiz = !horiz;
      }
      return { pts, len, speed: rand(70, 150), off: rand(0, 1000) };
    });
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = heroCanvasEl.clientWidth;
    h = heroCanvasEl.clientHeight;
    heroCanvasEl.width = w * dpr;
    heroCanvasEl.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function drift() {
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    });
  }

  // All: a quiet network of nodes, hinting at all three fields
  function drawNetwork(t, c) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < 140) {
          ctx.strokeStyle = `rgba(${c},${(1 - d / 140) * 0.22})`;
          ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
        }
      }
    }
    ctx.fillStyle = `rgba(${c},0.55)`;
    nodes.forEach(n => { ctx.beginPath(); ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2); ctx.fill(); });
  }

  // Quantum: interfering wave packets + entangled qubit pairs
  function drawQuantum(t, c) {
    for (let k = 0; k < 5; k++) {
      const yb = h * (0.2 + k * 0.15);
      const cx = w * (0.5 + 0.35 * Math.sin(t * 0.15 + k * 1.3));
      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const env = Math.exp(-(((x - cx) / (w * 0.3)) ** 2));
        const y = yb + Math.sin(x * 0.014 - t * (0.9 + k * 0.2) + k) * 34 * env;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${c},${0.1 + 0.035 * k})`;
      ctx.stroke();
    }
    const qubits = nodes.slice(0, 20);
    for (let i = 0; i + 1 < qubits.length; i += 2) {
      const a = qubits[i], b = qubits[i + 1];
      const alpha = 0.08 + 0.12 * (0.5 + 0.5 * Math.sin(t * 1.5 + i));
      ctx.strokeStyle = `rgba(${c},${alpha})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo((a.x + b.x) / 2, Math.min(a.y, b.y) - 80, b.x, b.y);
      ctx.stroke();
    }
    qubits.forEach((q, i) => {
      const r = 7 + 2 * Math.sin(t * 2 + q.p);
      const th = t * (0.6 + (i % 3) * 0.3) + q.p; // Bloch vector precessing
      ctx.strokeStyle = `rgba(${c},0.45)`;
      ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x + Math.cos(th) * r, q.y + Math.sin(th) * r * 0.5 - r * 0.6); ctx.stroke();
      ctx.fillStyle = `rgba(${c},0.8)`;
      ctx.beginPath(); ctx.arc(q.x, q.y, 1.8, 0, Math.PI * 2); ctx.fill();
    });
  }

  // RF: wavefronts radiating from transmitters + a modulated carrier
  function drawRF(t, c) {
    const srcs = [[w * 0.15, h * 0.78], [w * 0.85, h * 0.28], [w * 0.55, h * 0.95]];
    const maxR = Math.max(w, h) * 0.45;
    srcs.forEach(([sx, sy], i) => {
      for (let k = 0; k < 7; k++) {
        const r = (t * 55 + k * (maxR / 7) + i * 37) % maxR;
        ctx.strokeStyle = `rgba(${c},${0.3 * (1 - r / maxR)})`;
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = `rgba(${c},0.8)`;
      ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.beginPath();
    for (let x = 0; x <= w; x += 3) {
      const bit = Math.floor((x + t * 90) / 120) % 2; // 2-FSK: two carrier frequencies
      const y = h * 0.5 + Math.sin((x + t * 90) * (bit ? 0.09 : 0.045)) * 14;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${c},0.14)`;
    ctx.stroke();
  }

  // Embedded: PCB traces with signals travelling along them
  function pointAt(tr, dist) {
    for (let k = 1; k < tr.pts.length; k++) {
      const [x0, y0] = tr.pts[k - 1], [x1, y1] = tr.pts[k];
      const seg = Math.abs(x1 - x0) + Math.abs(y1 - y0);
      if (dist <= seg) {
        const f = seg ? dist / seg : 0;
        return [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f];
      }
      dist -= seg;
    }
    return tr.pts[tr.pts.length - 1];
  }

  function drawCircuit(t, c) {
    ctx.lineWidth = 1.2;
    traces.forEach(tr => {
      ctx.strokeStyle = `rgba(${c},0.13)`;
      ctx.beginPath();
      tr.pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      ctx.fillStyle = `rgba(${c},0.35)`;
      [tr.pts[0], tr.pts[tr.pts.length - 1]].forEach(([x, y]) => ctx.fillRect(x - 3, y - 3, 6, 6));
      const pos = (t * tr.speed + tr.off) % (tr.len + 240);
      if (pos <= tr.len) {
        for (let k = 0; k < 6; k++) {
          const [x, y] = pointAt(tr, Math.max(0, pos - k * 7));
          ctx.fillStyle = `rgba(${c},${0.85 - k * 0.14})`;
          ctx.beginPath(); ctx.arc(x, y, 2.2 - k * 0.25, 0, Math.PI * 2); ctx.fill();
        }
      }
    });
    ctx.lineWidth = 1;
  }

  const MODES = { all: drawNetwork, quantum: drawQuantum, rf: drawRF, embedded: drawCircuit };

  function draw(now) {
    const t = (now - t0) / 1000;
    const mode = root.dataset.track || 'all';
    ctx.clearRect(0, 0, w, h);
    if (!reduceMotion) drift();
    MODES[mode](t, COLORS[mode]);
  }

  function loop(now) {
    if (!running) return;
    draw(now);
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', () => { resize(); if (!running) draw(performance.now()); });

  // Only animate while the hero is on screen
  new IntersectionObserver(([e]) => {
    const shouldRun = e.isIntersecting && !reduceMotion;
    if (shouldRun && !running) { running = true; requestAnimationFrame(loop); }
    if (!shouldRun) running = false;
  }).observe(hero);

  return { redraw: () => { if (!running) draw(performance.now() + 4000); } };
})();

if (reduceMotion) document.querySelectorAll('.track-anim').forEach(svg => svg.pauseAnimations());

/* ---------- Init ---------- */
const params = new URLSearchParams(location.search);
const initial = params.get('track') || location.hash.slice(1);
applyTrack(TRACKS[initial] ? initial : 'all', true);
onScroll();
