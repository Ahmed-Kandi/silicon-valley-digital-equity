/* ============================================================
   SVDE — Silicon Valley Digital Equity
   Shared JavaScript
   ============================================================ */

// ── Dark Mode (runs before DOMContentLoaded to avoid flash) ──

(function () {
  const stored = localStorage.getItem('svde-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  else                  document.documentElement.setAttribute('data-theme', 'light');
})();

document.addEventListener('DOMContentLoaded', () => {

  // ── Dark Mode Toggle ──────────────────────────────────────

  document.querySelectorAll('.nav-theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const next   = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('svde-theme', next);
      btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  });

  // ── Navigation ────────────────────────────────────────────

  const nav        = document.querySelector('.nav');
  const hamburger  = document.querySelector('.nav-hamburger');
  const mobileNav  = document.querySelector('.nav-mobile');

  // Scroll shadow on nav
  const onScroll = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (nav && !nav.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      }
    });
  }

  // Active link highlight
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ── Scroll animations ─────────────────────────────────────

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // ── Hardware Donation Form ─────────────────────────────────

  const form = document.getElementById('hardwareForm');
  if (form) {
    // Blur-time validation
    form.querySelectorAll('input, select, textarea').forEach(field => {
      if (field.hasAttribute('required')) {
        field.addEventListener('blur',  () => validate(field));
        field.addEventListener('input', () => {
          if (field.classList.contains('error')) validate(field);
        });
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[required]').forEach(f => {
        if (!validate(f)) valid = false;
      });
      if (!valid) {
        form.querySelector('.error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      // Show success state
      form.style.display = 'none';
      const success = document.getElementById('formSuccess');
      if (success) {
        success.classList.add('visible');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
});

// ── Field Validation ───────────────────────────────────────

function validate(field) {
  const errorEl = field.closest('.form-group')?.querySelector('.field-error');
  let ok = true, msg = '';

  const val = field.value.trim();

  if (!val) {
    ok = false; msg = 'This field is required.';
  } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    ok = false; msg = 'Please enter a valid email address.';
  } else if (field.type === 'tel' && !/^[\d\s\-\+\(\)\.]{7,}$/.test(val)) {
    ok = false; msg = 'Please enter a valid phone number.';
  }

  field.classList.toggle('error', !ok);
  if (errorEl) {
    errorEl.textContent = msg;
    errorEl.classList.toggle('visible', !ok);
  }
  return ok;
}
