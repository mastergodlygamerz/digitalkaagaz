(function(){
  function init(){
    if (!window.AppConfig) return;
    var hero = (window.AppConfig.content && window.AppConfig.content.welcome) || {};
    var elTitle = document.querySelector('.hero-content h1') || document.querySelector('#hero h1');
    var elSub = document.querySelector('.hero-sub');
    if (hero.title && elTitle) elTitle.innerText = hero.title;
    if (hero.heroHtml && elSub) elSub.innerHTML = hero.heroHtml;

    // Feature toggles
    var feats = window.AppConfig.features || {};
    document.querySelectorAll('[data-feature]').forEach(function(el){
      var key = el.getAttribute('data-feature');
      if (key && feats.hasOwnProperty(key)) el.style.display = feats[key] ? '' : 'none';
    });
  }
  document.addEventListener('DOMContentLoaded', init);
})();
