const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  nav.classList.toggle('is-open', !open);
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open navigation');
  nav.classList.remove('is-open');
}));

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const form = document.querySelector('#contact-form');
form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.form-success');
  const config = window.SUPABASE_CONFIG;
  if (!config?.url || !config?.publishableKey) {
    status.hidden = false;
    status.textContent = 'We could not save your note just now. Please try again in a moment or email us directly.';
    status.setAttribute('role', 'alert');
    return;
  }

  submitButton.disabled = true;
  status.hidden = false;
  status.removeAttribute('role');
  status.textContent = 'Sending your note securely…';

  try {
    const response = await fetch(`${config.url}/rest/v1/contact_submissions`, {
      method: 'POST',
      headers: {
        apikey: config.publishableKey,
        Authorization: `Bearer ${config.publishableKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        name: String(data.get('name')).trim(),
        email: String(data.get('email')).trim(),
        company: String(data.get('company') || '').trim() || null,
        service: String(data.get('service')),
        message: String(data.get('message') || '').trim() || null
      })
    });

    if (!response.ok) throw new Error(`Supabase returned ${response.status}`);
  } catch (error) {
    console.error('Contact form save failed:', error);
    status.hidden = false;
    status.setAttribute('role', 'alert');
    status.textContent = 'We could not save your note just now. Please try again or email us directly.';
    submitButton.disabled = false;
    return;
  }

  const subject = encodeURIComponent(`Enquiry from ${data.get('name')} — ${data.get('service')}`);
  const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nBusiness: ${data.get('company') || 'Not provided'}\nService: ${data.get('service')}\n\n${data.get('message') || ''}`);
  status.textContent = 'Your note has been saved. Your email app will open with a copy ready to send.';
  form.reset();
  window.location.href = `mailto:hello@nivara.co.in?subject=${subject}&body=${body}`;
  submitButton.disabled = false;
});
