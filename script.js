/* ============================================================
   SVDE — Silicon Valley Digital Equity
   Shared JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Navigation ────────────────────────────────────────────

  const nav        = document.querySelector('.nav');
  const hamburger  = document.querySelector('.nav-hamburger');
  const mobileNav  = document.querySelector('.nav-mobile');

  const setMenu = (open) => {
    hamburger.classList.toggle('open', open);
    mobileNav.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      setMenu(!mobileNav.classList.contains('open'));
    });
    document.addEventListener('click', (e) => {
      if (nav && !nav.contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  // Active link highlight. Pages are served at clean URLs ("/about"),
  // but also handle "/about.html" and "/" for local previews.
  const normalize = (p) => p.replace(/\/+$/, '').replace(/\.html$/, '').replace(/^\/?index$/, '') || '/';
  const current = normalize(window.location.pathname.split('/').pop() || '/');
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = normalize((link.getAttribute('href') || '').split('#')[0]);
    if (href === current) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

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

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[required]').forEach(f => {
        if (!validate(f)) valid = false;
      });
      if (!valid) {
        const firstError = form.querySelector('.error');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError?.focus({ preventScroll: true });
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      const originalHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          form.style.display = 'none';
          const success = document.getElementById('formSuccess');
          if (success) {
            success.classList.add('visible');
            success.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHTML;
          alert('Something went wrong. Please email us at contact@svdigitalequity.org');
        }
      } catch (_) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
        alert('Something went wrong. Please email us at contact@svdigitalequity.org');
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
  field.setAttribute('aria-invalid', String(!ok));
  if (errorEl) {
    errorEl.textContent = msg;
    errorEl.classList.toggle('visible', !ok);
  }
  return ok;
}
