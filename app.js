// ============================================================
// Digital Kagaaz — app.js
// NO popups, NO modals, NO alerts, NO toasts, NO confirm dialogs
// Everything renders inline on the page.
// ============================================================

// ===== BLOG DATA =====
// To add a new blog post, just add an object here.
const blogPosts = [
  {
    id: 1,
    title: 'The Future of Digital Documentation',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
    description: 'How AI and cloud computing are transforming the way we handle paperwork and digital records across industries.',
    content: 'The landscape of digital documentation is rapidly evolving. From blockchain-verified contracts to AI-powered document analysis, the tools we use to manage information are becoming smarter, faster, and more secure.\n\nCloud-native platforms now allow teams across the globe to collaborate on documents in real-time, while machine learning algorithms can extract key data points from unstructured text in milliseconds.\n\nAt Digital Kagaaz, we believe that the future of paperwork is no paperwork at all — just seamless digital workflows.',
    date: 'Mar 28, 2026'
  },
  {
    id: 2,
    title: 'Building a Design System from Scratch',
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&q=80',
    description: 'Lessons learned from creating a cohesive design language for modern web applications and products.',
    content: 'Design systems are the backbone of scalable product design. They ensure consistency, speed up development, and create a shared language between designers and engineers.\n\nWe started with atomic design principles — defining colors, typography, spacing, and then building components layer by layer. The result is a living system that evolves with our product.\n\nKey takeaways: start small, document everything, and involve developers from day one.',
    date: 'Mar 15, 2026'
  },
  {
    id: 3,
    title: 'Why Minimalism Wins in Web Design',
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80',
    description: 'Less is more — how stripping away the unnecessary creates more powerful user experiences.',
    content: 'In a world saturated with information, minimalist design cuts through the noise. Clean layouts, purposeful whitespace, and focused content hierarchies guide users to what matters most.\n\nMinimalism is not about removing features — it is about removing friction. Every element on the page should earn its place.\n\nThe best interfaces feel invisible. They let the content shine and the user flow naturally from task to task.',
    date: 'Feb 20, 2026'
  }
];

// ===== NEWS DATA =====
const newsItems = [
  {
    date: 'Apr 10, 2026',
    title: 'Digital Kagaaz Beta Launch',
    content: 'We are thrilled to announce the public beta of Digital Kagaaz — our new platform for simplified digital paperwork.'
  },
  {
    date: 'Mar 22, 2026',
    title: 'Partnership with CloudSync',
    content: 'Digital Kagaaz partners with CloudSync to bring enterprise-grade document management to small businesses.'
  },
  {
    date: 'Feb 14, 2026',
    title: 'Reached 1,000 Early Signups',
    content: 'Our waitlist crossed 1,000 signups within the first two weeks — thank you for the incredible support!'
  },
  {
    date: 'Jan 05, 2026',
    title: 'Seed Funding Secured',
    content: 'We have closed our seed round to accelerate product development and expand our team.'
  }
];

// ===== ACHIEVEMENTS DATA =====
const achievements = [
  {
    icon: '&#127942;',
    title: 'Best Startup Idea 2025',
    description: 'Awarded "Best Startup Idea" at the National Innovation Summit for our approach to digital paperwork.',
    year: '2025'
  },
  {
    icon: '&#128640;',
    title: '1,000+ Beta Users',
    description: 'Reached over 1,000 beta users within two weeks of our early access launch.',
    year: '2026'
  },
  {
    icon: '&#129309;',
    title: 'CloudSync Partnership',
    description: 'Secured a strategic partnership with CloudSync for enterprise document solutions.',
    year: '2026'
  },
  {
    icon: '&#128176;',
    title: 'Seed Round Closed',
    description: 'Successfully closed our seed funding round to scale the platform and grow our team.',
    year: '2026'
  },
  {
    icon: '&#127760;',
    title: 'Global Reach',
    description: 'Users from 15+ countries are actively testing and using the Digital Kagaaz platform.',
    year: '2026'
  },
  {
    icon: '&#11088;',
    title: 'Product Hunt Featured',
    description: 'Featured on Product Hunt with a top-5 finish on launch day.',
    year: '2026'
  }
];

// ===== DOM REFS =====
const blogGrid = document.getElementById('blog-grid');
const newsTimeline = document.getElementById('news-timeline');
const achievementsGrid = document.getElementById('achievements-grid');
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

// ===== RENDER BLOGS =====
function renderBlogs() {
  blogPosts.forEach(function (post) {
    var card = document.createElement('article');
    card.className = 'blog-card reveal';
    card.innerHTML =
      '<img class="blog-card-img" src="' + escapeAttr(post.image) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' +
      '<div class="blog-card-body">' +
        '<h3>' + esc(post.title) + '</h3>' +
        '<p class="preview">' + esc(post.description) + '</p>' +
        '<div class="blog-card-full" hidden>' +
          '<p>' + esc(post.content) + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="blog-card-footer">' +
        '<span>' + esc(post.date) + '</span>' +
        '<span class="read-more">Read More &rarr;</span>' +
      '</div>';

    var readMoreBtn = card.querySelector('.read-more');
    var fullContent = card.querySelector('.blog-card-full');
    var previewEl = card.querySelector('.preview');

    readMoreBtn.addEventListener('click', function () {
      var isExpanded = !fullContent.hidden;
      fullContent.hidden = isExpanded;
      previewEl.style.display = isExpanded ? '' : 'none';
      readMoreBtn.innerHTML = isExpanded ? 'Read More &rarr;' : '&larr; Show Less';
    });

    blogGrid.appendChild(card);
  });
}

// ===== RENDER NEWS =====
function renderNews() {
  newsItems.forEach(function (item) {
    var card = document.createElement('div');
    card.className = 'news-card reveal';
    card.innerHTML =
      '<div class="news-content">' +
        '<p class="news-date">' + esc(item.date) + '</p>' +
        '<h3>' + esc(item.title) + '</h3>' +
        '<p>' + esc(item.content) + '</p>' +
      '</div>';
    newsTimeline.appendChild(card);
  });
}

// ===== RENDER ACHIEVEMENTS =====
function renderAchievements() {
  achievements.forEach(function (a) {
    var card = document.createElement('div');
    card.className = 'achievement-card reveal';
    card.innerHTML =
      '<div class="achievement-icon">' + a.icon + '</div>' +
      '<h3>' + esc(a.title) + '</h3>' +
      '<p>' + esc(a.description) + '</p>' +
      '<span class="achievement-year">' + esc(a.year) + '</span>';
    achievementsGrid.appendChild(card);
  });
}

// ===== CONTACT FORM (inline success message, no popup) =====
contactForm.addEventListener('submit', function (e) {
  e.preventDefault();
  formSuccess.hidden = false;
  contactForm.reset();
  // Auto-hide after 5 seconds
  setTimeout(function () { formSuccess.hidden = true; }, 5000);
});

// ===== HAMBURGER MENU =====
hamburger.addEventListener('click', function () {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(function (link) {
  link.addEventListener('click', function () {
    navLinks.classList.remove('open');
  });
});

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', function () {
  var nav = document.getElementById('navbar');
  nav.style.background = window.scrollY > 60
    ? 'rgba(7,7,13,0.95)'
    : 'rgba(7,7,13,0.75)';
});

// ===== HERO PARTICLES =====
(function createParticles() {
  var container = document.getElementById('hero-particles');
  if (!container) return;
  for (var i = 0; i < 25; i++) {
    var p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = (50 + Math.random() * 50) + '%';
    p.style.animationDuration = (5 + Math.random() * 7) + 's';
    p.style.animationDelay = (Math.random() * 8) + 's';
    container.appendChild(p);
  }
})();

// ===== SCROLL REVEAL (no fade-in class, uses .reveal) =====
(function initReveal() {
  var elements = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything
    elements.forEach(function (el) { el.classList.add('visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  elements.forEach(function (el) { observer.observe(el); });
})();

// ===== HELPERS =====
function esc(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===== INIT =====
renderBlogs();
renderNews();
renderAchievements();

// Re-observe newly added .reveal elements
requestAnimationFrame(function () {
  var elements = document.querySelectorAll('.reveal:not(.visible)');
  if (!('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  elements.forEach(function (el) { observer.observe(el); });
});
