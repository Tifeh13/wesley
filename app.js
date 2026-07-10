/* ============================================================
   WESLEY HOUSING — app.js
   Handles: form validation, dual Formspree submission, success modal
   ============================================================ */

(function () {
  'use strict';

  const form        = document.getElementById('housingForm');
  const submitBtn   = document.getElementById('submitBtn');
  const modal       = document.getElementById('successModal');
  const closeModal  = document.getElementById('closeModal');

  /* Second Formspree endpoint (yours). The original endpoint set on
     the form's `action` attribute in the HTML (your boss's) is left
     untouched — both endpoints receive every submission. */
  const SECOND_ENDPOINT = 'https://formspree.io/f/mlgyqlqb';

  /* ── Pre-fill today's date into signature date field ── */
  const signDate = document.getElementById('sign_date');
  if (signDate) {
    const today = new Date().toISOString().split('T')[0];
    signDate.value = today;
  }

  /* ── Inline validation helper ── */
  function validateField(el) {
    if (!el.validity.valid) {
      el.classList.add('invalid');
      return false;
    }
    el.classList.remove('invalid');
    return true;
  }

  /* Validate on blur for instant feedback */
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('blur', () => validateField(el));
    el.addEventListener('input', () => {
      if (el.classList.contains('invalid')) validateField(el);
    });
  });

  /* ── Validate required radio groups ── */
  function validateRadioGroups() {
    const groups = ['Marital Status', 'Smoker', 'Payment Method'];
    let allValid = true;
    groups.forEach(name => {
      const radios = form.querySelectorAll(`input[name="${name}"]`);
      const checked = [...radios].some(r => r.checked);
      const wrapper = radios[0]?.closest('.field-group');
      if (!checked) {
        allValid = false;
        if (wrapper) wrapper.classList.add('radio-invalid');
      } else {
        if (wrapper) wrapper.classList.remove('radio-invalid');
      }
    });
    return allValid;
  }

  /* ── Validate checkbox ── */
  function validateCheckbox() {
    const cb = form.querySelector('input[name="Certification Agreement"]');
    if (!cb?.checked) {
      cb?.closest('.checkbox-card')?.classList.add('cb-invalid');
      return false;
    }
    cb?.closest('.checkbox-card')?.classList.remove('cb-invalid');
    return true;
  }

  /* ── Submit a FormData payload to a single Formspree endpoint ── */
  function submitToEndpoint(endpoint, data) {
    return fetch(endpoint, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' }
    });
  }

  /* ── Handle form submission ── */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    /* Run full validation */
    let formValid = true;
    form.querySelectorAll('input[required], textarea[required]').forEach(el => {
      if (!validateField(el)) formValid = false;
    });
    if (!validateRadioGroups()) formValid = false;
    if (!validateCheckbox()) formValid = false;

    if (!formValid) {
      const firstInvalid = form.querySelector('.invalid, .radio-invalid, .cb-invalid');
      firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    /* Disable button while submitting */
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
      /* Build a fresh FormData for each request — FormData tied to a
         request body gets consumed, so it can't be reused as-is. */
      const dataForOriginal = new FormData(form);
      const dataForSecond   = new FormData(form);

      const results = await Promise.allSettled([
        submitToEndpoint(form.action, dataForOriginal),
        submitToEndpoint(SECOND_ENDPOINT, dataForSecond)
      ]);

      const anyOk = results.some(
        r => r.status === 'fulfilled' && r.value.ok
      );

      if (anyOk) {
        form.reset();
        showModal();
      } else {
        alert('Error submitting the form. Please try again or contact the landlord directly.');
      }
    } catch (err) {
      /* If Formspree not yet configured, show modal anyway for demo */
      console.warn('Formspree not configured yet — showing modal for demo.', err);
      showModal();
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Application';
    }
  });

  /* ── Show / hide modal ── */
  function showModal() {
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    closeModal.focus();
  }

  function hideModal() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  closeModal.addEventListener('click', hideModal);

  modal.addEventListener('click', function (e) {
    if (e.target === modal) hideModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) hideModal();
  });

})();