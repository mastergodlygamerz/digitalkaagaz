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
    } catch (e) {
      console.error('renderNavbar error', e);
    }
  };
})();
