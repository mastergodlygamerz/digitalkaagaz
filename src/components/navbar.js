// Simple navbar renderer using `window.AppConfig.navigation`
(function () {
  function createLink(item) {
    var a = document.createElement('a');
    a.textContent = item.name;
    if (item.path) a.href = item.path;
    else a.href = '#';
    a.className = 'nav-link';
    return a;
  }

  function renderMenu(list, parent) {
    list.forEach(function (item) {
      if (item.enabled === false) return; // hide disabled items
      var li = document.createElement('li');
      if (item.children && item.children.length) {
        var span = document.createElement('span');
        span.textContent = item.name;
        span.className = 'nav-link nav-parent';
        li.appendChild(span);
        var sub = document.createElement('ul');
        sub.className = 'nav-sub';
        renderMenu(item.children, sub);
        li.appendChild(sub);
      } else {
        li.appendChild(createLink(item));
      }
      parent.appendChild(li);
    });
  }

  window.renderNavbar = function (containerSelector) {
    try {
      var cfg = window.AppConfig;
      if (!cfg || !cfg.navigation) return;
      var root = document.querySelector(containerSelector || '.nav-menu');
      if (!root) return;
      // clear existing
      root.innerHTML = '';
      var ul = document.createElement('ul');
      ul.className = 'nav-menu';
      renderMenu(cfg.navigation.primary || [], ul);
      root.appendChild(ul);
      // Add auth actions (Sign Up / Sign In) if enabled in features
      try {
        var feats = (window.AppConfig && window.AppConfig.features) || {};
        if (feats.popupAuth !== false) {
          // create auth buttons as a list item so they sit inline with the menu
          var authLi = document.createElement('li');
          authLi.className = 'nav-auth';
          authLi.style.display = 'inline-flex';
          authLi.style.alignItems = 'center';
          authLi.style.marginLeft = '12px';
          function chooseFlow() {
            var p = (location.pathname || '').toLowerCase();
            if (p.indexOf('acadify') !== -1) return 'acadifyFlow';
            return 'welcomeFlow';
          }
          var flow = chooseFlow();
          var signup = document.createElement('button');
          signup.className = 'btn btn-sm btn-primary';
          signup.textContent = 'Sign Up';
          signup.setAttribute('aria-label', 'Sign up');
          signup.onclick = function () {
            if (typeof openAuthModal === 'function') { openAuthModal('signup'); return; }
            if (typeof openAuthFor === 'function') { openAuthFor(flow, 'signup'); return; }
            window.location.href = 'signup.html';
          };
          var signin = document.createElement('button');
          signin.className = 'btn btn-sm btn-ghost';
          signin.textContent = 'Sign In';
          signin.setAttribute('aria-label', 'Sign in');
          signin.style.marginLeft = '8px';
          signin.onclick = function () {
            if (typeof openAuthModal === 'function') { openAuthModal('signin'); return; }
            if (typeof openAuthFor === 'function') { openAuthFor(flow, 'signin'); return; }
            window.location.href = 'signin.html';
          };
          authLi.appendChild(signup);
          authLi.appendChild(signin);
          ul.appendChild(authLi);
        }
      } catch (e) {
        console.warn('navbar auth render failed', e);
      }
    } catch (e) {
      console.error('renderNavbar error', e);
    }
  };
})();
