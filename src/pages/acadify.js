(function(){
  function init(){
    if (!window.AppConfig) return;
    // Simple hook: hide features not enabled
    var feats = window.AppConfig.features || {};
    document.querySelectorAll('[data-feature]').forEach(function(el){
      var key = el.getAttribute('data-feature');
      if (key && feats.hasOwnProperty(key)) el.style.display = feats[key] ? '' : 'none';
    });
  }
  document.addEventListener('DOMContentLoaded', init);
})();
