// Auth helpers that consult config for popup vs redirect behavior
(function () {
  function getFlow(name) {
    var cfg = window.AppConfig && window.AppConfig.userFlow;
    return cfg && cfg[name] ? cfg[name] : null;
  }

  // mode: 'signup'|'signin'
  window.openAuthFor = function (flowName, mode) {
    var flow = getFlow(flowName);
    if (!flow) {
      console.warn('Auth flow not configured:', flowName);
      return;
    }

    var usePopup = (flow.usePopupAuth || window.AppConfig.features.popupAuth) === true;
    if (usePopup) {
      // prefer existing in-page modal if present
      if (typeof openAuthModal === 'function') {
        openAuthModal(mode === 'signup' ? 'signup' : 'signin');
        return;
      }
      // fallback: open a lightweight popup window (beginner-friendly)
      var url = mode === 'signup' ? 'signup.html' : 'signin.html';
      window.open(url, '_blank', 'width=720,height=680');
    } else {
      // Page redirect
      var dest = mode === 'signup' ? flow.redirectAfterSignup : flow.redirectAfterLogin;
      window.location.href = dest || url;
    }
  };

  // Utility used by pages after successful auth
  window.postAuthRedirect = function (flowName, action /* 'login'|'signup' */) {
    var flow = getFlow(flowName);
    if (!flow) return;
    var dest = (action === 'signup') ? flow.redirectAfterSignup : flow.redirectAfterLogin;
    if (dest) window.location.href = dest;
  };
})();
