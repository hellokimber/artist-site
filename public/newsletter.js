const newsletterForm = document.querySelector('.newsletter-form');

if (newsletterForm) {
  const button = newsletterForm.querySelector('button');
  const email = newsletterForm.querySelector('input[type="email"]');
  const status = document.querySelector('#newsletter-status');
  let submitting = false;

  function continuationUrl(value) {
    try {
      const url = new URL(value);
      const trusted = ['kit.com', 'convertkit.com'].some(domain =>
        url.hostname === domain || url.hostname.endsWith(`.${domain}`));
      return url.protocol === 'https:' && trusted ? url.href : null;
    } catch {
      return null;
    }
  }

  newsletterForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting || !newsletterForm.reportValidity()) return;
    submitting = true;
    button.disabled = true;
    button.textContent = 'Joining…';
    newsletterForm.setAttribute('aria-busy', 'true');
    status.textContent = '';
    email.removeAttribute('aria-invalid');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let completed = false;

    try {
      const response = await fetch(newsletterForm.action, {
        method: 'POST',
        body: new FormData(newsletterForm),
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Request failed');
      const result = await response.json();
      const needsContinuation = result.status === 'quarantined' || result.consent?.enabled;

      if (needsContinuation) {
        const url = continuationUrl(result.consent?.enabled ? result.consent.url : result.url);
        if (!url) throw new Error('Missing confirmation destination');
        status.textContent = 'One more step to finish signing up. ';
        const link = document.createElement('a');
        link.href = url;
        link.textContent = 'Continue signup with Kit';
        status.append(link);
      } else if (result.status === 'success') {
        status.textContent = 'Success! Check your email to confirm your subscription.';
        button.textContent = 'Check your inbox';
        completed = true;
      } else {
        const messages = result.errors?.messages;
        status.textContent = Array.isArray(messages) && messages.every(m => typeof m === 'string') && messages.length
          ? messages.join(' ')
          : 'We couldn’t complete your signup. Please check your email address and try again.';
        if (result.errors?.fields?.includes('email_address')) email.setAttribute('aria-invalid', 'true');
      }
    } catch {
      status.textContent = 'We couldn’t confirm your signup. Please try again or visit ';
      const link = document.createElement('a');
      link.href = 'https://kimberillo.kit.com';
      link.textContent = 'the newsletter signup page';
      status.append(link, '.');
    } finally {
      clearTimeout(timeout);
      newsletterForm.removeAttribute('aria-busy');
      submitting = false;
      button.disabled = completed;
      if (!completed) button.textContent = 'Join the list';
    }
  });
}
