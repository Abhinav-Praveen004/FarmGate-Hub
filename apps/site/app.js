// FarmGate Hub Pitch Site Interactive Controller

document.addEventListener('DOMContentLoaded', () => {
  // 1. Leaky Bucket Interactive Plugs
  const leakCheckboxes = document.querySelectorAll('.leak-toggle');
  const totalLossDisplay = document.getElementById('total-spoilage-loss');
  const farmerShareDisplay = document.getElementById('farmer-net-share');

  function updateLeaks() {
    let activeLoss = 30.0;
    let farmerShare = 33.0;

    leakCheckboxes.forEach((cb) => {
      const reduction = parseFloat(cb.dataset.reduction || '0');
      const shareBoost = parseFloat(cb.dataset.share || '0');
      if (cb.checked) {
        activeLoss -= reduction;
        farmerShare += shareBoost;
      }
    });

    if (totalLossDisplay) {
      totalLossDisplay.textContent = activeLoss.toFixed(1) + '%';
    }
    if (farmerShareDisplay) {
      farmerShareDisplay.textContent = farmerShare.toFixed(1) + '%';
    }
  }

  leakCheckboxes.forEach((cb) => {
    cb.addEventListener('change', updateLeaks);
  });

  // 2. Lead Schedule Briefing Form
  const leadForm = document.getElementById('lead-form');
  const leadSuccess = document.getElementById('lead-success');

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = leadForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Request...';
      }

      setTimeout(() => {
        leadForm.style.display = 'none';
        if (leadSuccess) {
          leadSuccess.style.display = 'block';
        }
      }, 700);
    });
  }

  // 3. Local standalone fallback (when running directly on port 4000 without gateway)
  if (window.location.port === '4000') {
    document.querySelectorAll('a[href^="/farmer"], a[href^="/hub"], a[href^="/buyer"], a[href^="/impact"], a[href^="/styleguide"], a[href^="/t/"]').forEach((a) => {
      a.href = 'http://localhost:5173' + a.getAttribute('href');
    });
    document.querySelectorAll('a[href="/launcher"]').forEach((a) => {
      a.href = 'http://localhost:8080';
    });
  }
});
