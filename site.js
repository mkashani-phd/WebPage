/* =============================================
   MOH KASHANI — SITE SCRIPT
   Intro → the fork (road splits in three as you scroll) → content
   ============================================= */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Path configuration ----------
   cv / resume: drop tailored PDFs into the repo and point these at them. */
const TRACKS = {
  all: {
    title: 'Moh Kashani',
    kicker: 'You kept walking',
    heading: 'All three paths',
    desc: 'Everything I work on across quantum, RF & security and embedded systems. The coloured tags show which field each item belongs to.',
    color: '#93c5fd',
    cv: 'Moh_CV (1).pdf',
    resume: 'Resume.docx.pdf',
    order: ['education', 'experience', 'media', 'research', 'skills', 'publications', 'projects', 'awards', 'talks', 'hobbies'],
  },
  quantum: {
    title: 'Moh Kashani — Quantum',
    kicker: 'Path 1 of 3',
    heading: 'Quantum',
    desc: 'Real-time control for quantum computers and networks: ARTIQ, FPGA gateware, timing across quantum nodes, and qubit calibration.',
    color: '#a78bfa',
    cv: 'Moh_CV (1).pdf',
    resume: 'Resume.docx.pdf',
    order: ['experience', 'projects', 'research', 'skills', 'talks', 'education', 'publications', 'awards', 'media', 'hobbies'],
  },
  rf: {
    title: 'Moh Kashani — RF & Security',
    kicker: 'Path 2 of 3',
    heading: 'RF & Security',
    desc: 'RF fingerprinting, physical-layer security and secure wireless protocols, from SDR measurements in an anechoic chamber to deep learning.',
    color: '#22d3ee',
    cv: 'Moh_CV (1).pdf',
    resume: 'Resume.docx.pdf',
    order: ['experience', 'publications', 'research', 'media', 'talks', 'skills', 'awards', 'education', 'projects', 'hobbies'],
  },
  embedded: {
    title: 'Moh Kashani — Embedded',
    kicker: 'Path 3 of 3',
    heading: 'Embedded',
    desc: 'Firmware, FPGA and PCB design for devices that ship: RFID boards in the field, custom radio stacks, and AI running on the device.',
    color: '#34d399',
    cv: 'Moh_CV (1).pdf',
    resume: 'Resume.docx.pdf',
    order: ['projects', 'experience', 'skills', 'research', 'education', 'publications', 'talks', 'awards', 'media', 'hobbies'],
  },
};

const FIELD_LABELS = { quantum: 'Quantum', rf: 'RF & Security', embedded: 'Embedded' };

const $ = id => document.getElementById(id);
const root = document.documentElement;
const main = $('main');
const content = $('content');
const navList = $('nav-links');
const intro = $('home');
const introInner = $('intro-inner');
const introCue = $('intro-cue');
const fork = $('fork');
const road = $('road');
const roadCam = $('road-cam');
const travelEl = $('travel');
const dock = $('track-dock');
const dockIndicator = $('dock-indicator');
const progress = $('scroll-progress');
const roadFill = $('content-road-fill');
let currentTrack = null;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const ease = t => 1 - (1 - t) ** 3;

/* ---------- Experience tabs & mobile menu ---------- */
function showTab(id, btn) {
  document.querySelectorAll('.exp-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.exp-tab').forEach(b => b.classList.remove('active'));
  $(id).classList.add('active');
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

/* ---------- Field chips (visible only in the "everything" view) ---------- */
document.querySelectorAll('#main [data-track]').forEach((el, i) => {
  el.dataset.idx = i;
  const fields = el.dataset.track.split(' ').filter(t => FIELD_LABELS[t]);
  if (!fields.length) return;
  const chips = document.createElement('div');
  chips.className = 'field-chips';
  chips.innerHTML = fields.map(f => `<span class="field-chip" data-f="${f}">${FIELD_LABELS[f]}</span>`).join('');
  el.prepend(chips);
});

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
    }, 750 + delay);
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
    if (!e.isIntersecting) return;
    e.target.classList.add('in-view');
    sectionObserver.unobserve(e.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll('#main > section, #contact').forEach(s => sectionObserver.observe(s));

// Highlight the nav link of the section currently in the middle of the screen
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navList.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('#main > section[id], #contact').forEach(s => navObserver.observe(s));

/* ---------- Heading "decode" effect ---------- */
function scramble(el, text, instant) {
  cancelAnimationFrame(el._raf);
  if (instant || reduceMotion) {
    el.textContent = text;
    return;
  }
  const glyphs = '01⟩ψ∿#<>/_|';
  const start = performance.now();
  const step = now => {
    const p = Math.min(1, (now - start) / 700);
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

/* ---------- Applying a path ---------- */
function matches(el, track) {
  if (track === 'all') return true;
  const tags = el.dataset.track.split(' ');
  return tags.includes('all') || tags.includes(track);
}

function applyTrack(track, instant) {
  const cfg = TRACKS[track];
  currentTrack = track;
  if (track === 'all') delete root.dataset.track; else root.dataset.track = track;
  document.title = cfg.title;

  // 1. Keep only this path's items (in their original order)
  const groups = new Set([...document.querySelectorAll('#main [data-track]')].map(el => el.parentElement));
  groups.forEach(group => {
    const items = [...group.querySelectorAll(':scope > [data-track]')].sort((a, b) => a.dataset.idx - b.dataset.idx);
    items.forEach(el => {
      el.classList.toggle('off-track', !matches(el, track));
      group.appendChild(el);
    });
    group.dataset.on = items.filter(el => matches(el, track)).length;
  });

  // 2. Experience tabs: hide tabs with nothing on this path, open the first remaining one
  let firstTab = null;
  document.querySelectorAll('.exp-tab').forEach(tab => {
    const empty = $(tab.dataset.panel).dataset.on === '0';
    tab.classList.toggle('track-hidden', empty);
    if (!empty && !firstTab) firstTab = tab;
  });
  if (firstTab) showTab(firstTab.dataset.panel, firstTab);

  // 3. Reorder sections (and nav links) for this path; hide empty ones
  cfg.order.forEach(id => {
    const sec = $(id);
    const items = [...sec.querySelectorAll('[data-track]')];
    const empty = items.length > 0 && !items.some(el => matches(el, track));
    sec.classList.toggle('track-hidden', empty);
    main.appendChild(sec);
    const link = navList.querySelector(`a[href="#${id}"]`);
    if (link) {
      link.parentElement.classList.toggle('track-hidden', empty);
      navList.appendChild(link.parentElement);
    }
  });
  navList.appendChild(navList.querySelector('a[href="#contact"]').parentElement);

  // 4. Path header, CV links, chooser state
  $('path-kicker').textContent = cfg.kicker;
  scramble($('path-title'), cfg.heading, instant);
  $('path-desc').textContent = cfg.desc;
  document.querySelectorAll('[data-cv]').forEach(a => { a.href = cfg.cv; });
  document.querySelectorAll('[data-resume]').forEach(a => { a.href = cfg.resume; });
  document.querySelectorAll('button[data-choose]').forEach(b => {
    const on = b.dataset.choose === track;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', on);
  });
  if (track === 'all') delete road.dataset.chosen; else road.dataset.chosen = track;
  moveDockIndicator();

  // 5. Shareable URL: ?track=quantum
  const url = new URL(location.href);
  if (track === 'all') url.searchParams.delete('track'); else url.searchParams.set('track', track);
  if (TRACKS[url.hash.slice(1)]) url.hash = '';
  history.replaceState(null, '', url);

  // 6. Replay reveal animations on the new layout
  document.querySelectorAll(REVEAL_SEL).forEach(armReveal);
  onScroll();
}

const contentTop = () => content.getBoundingClientRect().top + window.scrollY;

// From the fork: zoom down the chosen road, wash the screen in its colour, arrive at the content
function travel(track) {
  if (reduceMotion) {
    applyTrack(track);
    window.scrollTo({ top: contentTop(), behavior: 'instant' });
    return;
  }
  const camRect = roadCam.getBoundingClientRect();
  const target = track === 'all' ? null : road.querySelector(`.dest[data-b="${track}"] .dest-core`);
  let cx = camRect.left + camRect.width / 2;
  let cy = camRect.top + camRect.height * 0.35;
  if (target) {
    const r = target.getBoundingClientRect();
    cx = r.left + r.width / 2;
    cy = r.top + r.height / 2;
  }
  if (track !== 'all') road.dataset.chosen = track;
  roadCam.style.transformOrigin = `${((cx - camRect.left) / camRect.width) * 100}% ${((cy - camRect.top) / camRect.height) * 100}%`;
  travelEl.style.setProperty('--tc', TRACKS[track].color);
  travelEl.style.setProperty('--tx', `${(cx / innerWidth) * 100}%`);
  travelEl.style.setProperty('--ty', `${(cy / innerHeight) * 100}%`);
  roadCam.classList.add('zoom');
  travelEl.classList.add('on');

  setTimeout(() => {
    applyTrack(track);
    window.scrollTo({ top: contentTop(), behavior: 'instant' });
    roadCam.classList.add('snap');
    roadCam.classList.remove('zoom');
    requestAnimationFrame(() => requestAnimationFrame(() => roadCam.classList.remove('snap')));
    travelEl.classList.remove('on');
  }, 950);
}

// From the floating switcher: circular colour reveal, then jump to the top of the path
function switchTrack(track, originEl) {
  const update = () => {
    applyTrack(track);
    window.scrollTo({ top: contentTop(), behavior: 'instant' });
  };
  if (!document.startViewTransition || reduceMotion) { update(); return; }
  const r = originEl.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(update).ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 700, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
    );
  });
}

document.querySelectorAll('[data-choose]').forEach(el => {
  const choose = () => {
    const track = el.dataset.choose;
    if (el.closest('#fork')) travel(track);
    else if (track === currentTrack) window.scrollTo({ top: contentTop(), behavior: reduceMotion ? 'auto' : 'smooth' });
    else switchTrack(track, el);
  };
  el.addEventListener('click', choose);
  // SVG destinations are focusable "buttons"
  if (!(el instanceof HTMLButtonElement)) {
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); }
    });
  }
});

// Hovering a branch or destination lights up that path
road.querySelectorAll('[data-b]').forEach(el => {
  const on = () => { road.dataset.hover = el.dataset.b; };
  const off = () => { delete road.dataset.hover; };
  el.addEventListener('pointerenter', on);
  el.addEventListener('pointerleave', off);
  el.addEventListener('focus', on);
  el.addEventListener('blur', off);
});

// "Choose a different path" goes back up to the fork, fully drawn
$('path-switch').addEventListener('click', () => {
  const { start, span } = forkRange();
  window.scrollTo({ top: start + span * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' });
});

function moveDockIndicator() {
  const active = dock.querySelector('button.active');
  if (!active) return;
  dockIndicator.style.width = `${active.offsetWidth}px`;
  dockIndicator.style.transform = `translateX(${active.offsetLeft}px)`;
}
window.addEventListener('resize', moveDockIndicator);

/* ---------- The fork: scroll-driven road ---------- */
const forkEls = {
  trunkClip: $('trunk-clip-rect'),
  reveals: [...road.querySelectorAll('.branch-reveal')],
  dests: [...road.querySelectorAll('.dest')],
  trunkDash: road.querySelector('.trunk-dash'),
  branchDashes: [...road.querySelectorAll('.branch-dash')],
  line1: $('fork-line-1'),
  line2: $('fork-line-2'),
  foot: $('fork-foot'),
};

// The road starts drawing while the stage is still sliding into view
function forkRange() {
  const top = fork.getBoundingClientRect().top + window.scrollY;
  const start = top - innerHeight * 0.5;
  const span = fork.offsetHeight - innerHeight + innerHeight * 0.5;
  return { start, span };
}

function renderFork(y) {
  const { start, span } = forkRange();
  const p = reduceMotion ? 1 : clamp((y - start) / span);

  // Trunk grows from the bottom up to the fork point
  const trunkY = 800 - 380 * ease(seg(p, 0, 0.3));
  forkEls.trunkClip.setAttribute('y', trunkY);
  forkEls.trunkClip.setAttribute('height', 800 - trunkY);

  // Three branches draw outward, slightly staggered
  forkEls.reveals.forEach((m, i) => {
    m.setAttribute('stroke-dashoffset', 1 - ease(seg(p, 0.28 + i * 0.03, 0.56 + i * 0.03)));
  });

  // Destinations pop in at the end of each branch
  forkEls.dests.forEach((d, i) => {
    const t = ease(seg(p, 0.5 + i * 0.04, 0.66 + i * 0.04));
    d.style.opacity = t;
    d.style.transform = `translateY(${(1 - t) * 30}px) scale(${0.7 + 0.3 * t})`;
    d.style.pointerEvents = t > 0.5 ? 'auto' : 'none';
  });

  // Camera settles from close-up to the full view
  road.style.transform = `scale(${1.3 - 0.3 * ease(seg(p, 0, 0.6))})`;

  // Walking: the centre-line dashes stream toward you as you scroll
  if (!reduceMotion) {
    forkEls.trunkDash.style.strokeDashoffset = -y * 0.35;
    forkEls.branchDashes.forEach(d => { d.style.strokeDashoffset = -y * 0.2; });
  }

  const l1 = ease(seg(p, 0.02, 0.16));
  forkEls.line1.style.opacity = l1;
  forkEls.line1.style.transform = `translateY(${(1 - l1) * 16}px)`;
  const l2 = ease(seg(p, 0.55, 0.7));
  forkEls.line2.style.opacity = l2;
  forkEls.line2.style.transform = `translateY(${(1 - l2) * 12}px)`;
  forkEls.foot.style.opacity = ease(seg(p, 0.6, 0.75));
}

// A sky full of stars above the horizon
(function makeStars() {
  const g = $('stars');
  const ns = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < 110; i++) {
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', (Math.random() * 1200 - 100).toFixed(1));
    c.setAttribute('cy', (Math.random() * 330 - 60).toFixed(1));
    c.setAttribute('r', (0.5 + Math.random() * 1.4).toFixed(2));
    c.setAttribute('opacity', (0.2 + Math.random() * 0.7).toFixed(2));
    c.setAttribute('class', Math.random() < 0.3 ? 'star twinkle' : 'star');
    c.style.animationDelay = `${(Math.random() * 3).toFixed(2)}s`;
    g.appendChild(c);
  }
})();

/* ---------- Scroll effects ---------- */
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const y = window.scrollY;
    const cTop = contentTop();
    const max = document.documentElement.scrollHeight - innerHeight;

    // Intro drifts up and fades as the fork takes over
    if (!reduceMotion && y <= innerHeight) {
      const fade = Math.max(0, 1 - y / (innerHeight * 0.8));
      introInner.style.transform = `translateY(${y * 0.3}px)`;
      introInner.style.opacity = fade;
      introCue.style.opacity = Math.max(0, 1 - y / 160);
    }

    renderFork(y);

    // Navbar, switcher and progress bar belong to the content part of the page
    document.body.classList.toggle('in-content', y >= cTop - innerHeight * 0.3);
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;

    // The road continues down the page, drawn up to where you are reading
    const drawn = clamp((y + innerHeight * 0.6 - cTop) / content.offsetHeight);
    roadFill.style.height = `${drawn * content.offsetHeight}px`;
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);

/* ---------- Intro background: a network in the three field colours ---------- */
(function introCanvas() {
  const canvas = $('intro-canvas');
  const ctx = canvas.getContext('2d');
  const COLORS = ['167,139,250', '34,211,238', '52,211,153'];
  let w = 0, h = 0, nodes = [], running = false;
  const rand = (a, b) => a + Math.random() * (b - a);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    nodes = Array.from({ length: Math.round((w * h) / 24000) }, (_, i) => ({
      x: rand(0, w), y: rand(0, h), vx: rand(-0.18, 0.18), vy: rand(-0.18, 0.18), c: COLORS[i % 3],
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    if (!reduceMotion) {
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 140) {
          ctx.strokeStyle = `rgba(${a.c},${(1 - d / 140) * 0.22})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    nodes.forEach(n => {
      ctx.fillStyle = `rgba(${n.c},0.7)`;
      ctx.beginPath(); ctx.arc(n.x, n.y, 1.7, 0, Math.PI * 2); ctx.fill();
    });
  }

  function loop() {
    if (!running) return;
    draw();
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', () => { resize(); draw(); });
  new IntersectionObserver(([e]) => {
    const run = e.isIntersecting && !reduceMotion;
    if (run && !running) { running = true; requestAnimationFrame(loop); }
    if (!run) running = false;
  }).observe(intro);
  draw();
})();

if (reduceMotion) document.querySelectorAll('.track-anim').forEach(svg => svg.pauseAnimations());

/* ---------- Init ---------- */
const initial = new URLSearchParams(location.search).get('track') || location.hash.slice(1);
applyTrack(TRACKS[initial] ? initial : 'all', true);
