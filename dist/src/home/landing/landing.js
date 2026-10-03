/* SYNASE AI landing page behaviour.
   Extracted verbatim from the inline <script> in landing.html. The former
   inline onclick/onsubmit attributes were replaced by data-auth* attributes
   handled by the delegated listener at the bottom of this file. */
import { initTheme } from "../../shared/services/theme.js";

/* ── AUTH ──────────────────────────────────────────── */
function openAuth() {
  document.getElementById('auth-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('login-email')?.focus();
}
function closeAuth() {
  document.getElementById('auth-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
function switchAuthTab(tab, btn) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('auth-panel-' + tab).classList.add('active');
}
function switchAuthTabByName(tab) {
  const btns = document.querySelectorAll('.auth-tab');
  const idx = tab === 'login' ? 0 : 1;
  switchAuthTab(tab, btns[idx]);
}
document.getElementById('auth-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeAuth();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeAuth();
});

/* ── FORM HANDLING (calls mock API, then redirects to app) ── */
async function handleAuth(event, kind) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('.auth-submit');
  const errorEl = document.getElementById(kind + '-error');
  btn.disabled = true;
  btn.textContent = kind === 'login' ? 'Signing in…' : 'Creating account…';
  errorEl.classList.remove('show');
  try {
    const body = {};
    new FormData(form).forEach((v, k) => body[k] = v);
    body.idempotencyKey = 'ik_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    const res = await fetch('/api/v1/auth/' + kind, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      closeAuth();
      window.location.href = 'app.html#/app/chat';
    } else if (res.status === 404 || res.status === 0) {
      /* Dev: mock adapter not connected — go straight to app */
      closeAuth();
      window.location.href = 'app.html#/app/chat';
    } else {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error?.message || (kind === 'login' ? 'Invalid credentials.' : 'Registration failed.'));
    }
  } catch(e) {
    if (e.message && !e.message.includes('fetch') && !e.message.includes('Failed')) {
      errorEl.textContent = e.message; errorEl.classList.add('show');
    } else {
      /* Network down / local dev — fall through to app */
      closeAuth();
      window.location.href = 'app.html#/app/chat';
    }
  } finally {
    btn.disabled = false;
    btn.textContent = kind === 'login' ? 'Sign in' : 'Create account';
  }
}

/* ── NAV BUTTONS ──────────────────────────────────── */
document.getElementById('login-btn').addEventListener('click', openAuth);
document.getElementById('start-now-btn').addEventListener('click', () => {
  window.location.href = 'app.html#/app/chat';
});
document.getElementById('hero-start-btn').addEventListener('click', () => {
  window.location.href = 'app.html#/app/chat';
});

// Auto-open login if route or hash specifies auth
if (window.location.hash === '#login' || new URLSearchParams(window.location.search).get('route')?.includes('login')) {
  openAuth();
}

/* ── SCROLL REVEAL ────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ── BENTO CARD GLOW FOLLOW ───────────────────────── */
document.querySelectorAll('.bento-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});

/* ── ACTIVE NAV HIGHLIGHT ─────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const link = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (link) link.classList.add('active');
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => navObserver.observe(s));

/* ── CONTACT TOPICS ────────────────────────────────── */
document.querySelectorAll('.contact-topic').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.contact-topic').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
  });
});

/* ── delegated replacements for the former inline handlers ───────── */
document.addEventListener("click", (event) => {
  const target = event.target instanceof Element
    ? event.target.closest("[data-auth],[data-auth-tab],[data-auth-tab-name],[data-route-to]")
    : null;
  if (!target) return;
  const to = target.getAttribute("data-route-to");
  if (to) { window.location.href = to; return; }
  const tab = target.getAttribute("data-auth-tab");
  if (tab) { switchAuthTab(tab, target); return; }
  const tabName = target.getAttribute("data-auth-tab-name");
  if (tabName) { switchAuthTabByName(tabName); return; }
  const action = target.getAttribute("data-auth");
  if (action === "open") { event.preventDefault(); openAuth(); return; }
  if (action === "close") { event.preventDefault(); closeAuth(); }
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  const kind = form instanceof HTMLElement ? form.getAttribute("data-auth-submit") : null;
  if (!kind) return;
  event.preventDefault();
  handleAuth(event, kind);
});

initTheme();
