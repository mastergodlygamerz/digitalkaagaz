// Page-level glue for acadify-entry.html — uses AppConfig and components
(function () {
  function init() {
    if (!window.AppConfig) return;

    // Fill hero content from config
    var hero = window.AppConfig.content && window.AppConfig.content.acadifyHero;
    if (hero) {
      var elTitle = document.getElementById('heroTitle') || document.getElementById('acadifyHeroTitle');
      var elSub   = document.getElementById('heroSubtitle') || document.getElementById('acadifyHeroSub');
      if (elTitle) elTitle.innerText = hero.title || elTitle.innerText;
      if (elSub)   elSub.innerText   = hero.subtitle || elSub.innerText;
      // CTA
      if (!hero.showCTA) {
        var cta = document.querySelector('.hero-cta'); if (cta) cta.style.display = 'none';
      }
    }

    // Render navbar if component available
    if (typeof window.renderNavbar === 'function') {
      window.renderNavbar('.nav-container');
    }

    // Feature toggles — elements should have attribute data-feature="chat" etc.
    var feats = window.AppConfig.features || {};
    document.querySelectorAll('[data-feature]').forEach(function (el) {
      var key = el.getAttribute('data-feature');
      if (key && feats.hasOwnProperty(key)) {
        el.style.display = feats[key] ? '' : 'none';
      }
    });

    // Example: wire auth buttons to use config-driven auth flow
    document.querySelectorAll('[data-auth-flow]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var flow = btn.getAttribute('data-auth-flow') || 'acadifyFlow';
        var mode = btn.getAttribute('data-auth-mode') || 'signin';
        if (typeof window.openAuthFor === 'function') {
          window.openAuthFor(flow, mode);
        } else {
          // fallback: open page
          window.location.href = (mode === 'signup') ? 'signup.html' : 'signin.html';
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
