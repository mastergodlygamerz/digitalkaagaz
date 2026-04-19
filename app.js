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

// ===== CONTACT FORM (inline validation + inline success, no popup ever) =====
var formError = document.getElementById('form-error');
contactForm.addEventListener('submit', function (e) {
  e.preventDefault();
  formError.hidden = true;

  var name = document.getElementById('contact-name').value.trim();
  var email = document.getElementById('contact-email').value.trim();
  var message = document.getElementById('contact-message').value.trim();

  if (!name || !email || !message) {
    formError.textContent = 'Please fill in all fields.';
    formError.hidden = false;
    return;
  }
  if (message.length < 10) {
    formError.textContent = 'Message must be at least 10 characters.';
    formError.hidden = false;
    return;
  }

  formSuccess.hidden = false;
  formError.hidden = true;
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

// ===== BOOK IMAGE CAROUSEL =====
(function initBookCarousel() {
  var slides = document.querySelectorAll('.book-slide');
  var dots = document.querySelectorAll('.book-dot');
  if (!slides.length) return;
  var current = 0;
  var total = slides.length;

  function showSlide(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + total) % total;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  // Auto-rotate every 60 seconds
  setInterval(function () { showSlide(current + 1); }, 60000);

  // Click on dots
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(parseInt(dot.getAttribute('data-index')));
    });
  });
})();

// ===== INIT =====
renderBlogs();
renderNews();
renderAchievements();

// ===== FIREBASE AUTH & VISITOR TRACKING =====
(function initFirebase() {
  // Wait for Firebase module to load
  function waitForFirebase(cb) {
    if (window._firebase) return cb();
    setTimeout(function () { waitForFirebase(cb); }, 100);
  }

  waitForFirebase(function () {
    var fb = window._firebase;
    var auth = fb.auth;
    var db = fb.db;


    // --- VISITOR TRACKING ---
    (function trackVisitor() {
      fetch('https://ipapi.co/json/')
        .then(function (r) { return r.json(); })
        .then(function (geo) {
          fb.addDoc(fb.collection(db, 'visitors'), {
            ip: geo.ip || 'unknown',
            country: geo.country_name || 'unknown',
            region: geo.region || '',
            city: geo.city || '',
            isp: geo.org || '',
            org: geo.org || '',
            mobile: false,
            userAgent: navigator.userAgent,
            referrer: document.referrer || 'direct',
            page: location.pathname,
            screenWidth: screen.width,
            screenHeight: screen.height,
            language: navigator.language,
            timestamp: fb.serverTimestamp()
          });
        })
        .catch(function () {
          // Fallback without geo data
          fb.addDoc(fb.collection(db, 'visitors'), {
            ip: 'unknown',
            country: 'unknown',
            userAgent: navigator.userAgent,
            referrer: document.referrer || 'direct',
            page: location.pathname,
            timestamp: fb.serverTimestamp()
          });
        });
    })();

    // --- GROWTH CHART (PUBLIC) ---
    (function initGrowthChart() {
      var canvas = document.getElementById('growth-chart');
      var totalEl = document.getElementById('growth-total');
      var filtersEl = document.getElementById('growth-filters');
      if (!canvas || !filtersEl) return;

      var allSignups = [];
      var chart = null;
      var currentRange = '7d';

      // Fetch all user signups
      fb.getDocs(fb.query(fb.collection(db, 'users'), fb.orderBy('createdAt', 'asc')))
        .then(function (snap) {
          snap.forEach(function (doc) {
            var d = doc.data();
            if (d.createdAt) {
              allSignups.push(d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt));
            }
          });
          totalEl.textContent = allSignups.length;
          renderChart(currentRange);
        })
        .catch(function () {
          totalEl.textContent = '—';
        });

      // Filter buttons
      filtersEl.addEventListener('click', function (e) {
        var btn = e.target.closest('.growth-filter');
        if (!btn) return;
        filtersEl.querySelectorAll('.growth-filter').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentRange = btn.getAttribute('data-range');
        renderChart(currentRange);
      });

      function renderChart(range) {
        var now = new Date();
        var labels = [];
        var buckets = {};
        var startDate, groupFn, labelFn;

        if (range === '7d') {
          startDate = new Date(now); startDate.setDate(startDate.getDate() - 6);
          for (var i = 0; i < 7; i++) {
            var d = new Date(startDate); d.setDate(d.getDate() + i);
            var key = d.toISOString().slice(0, 10);
            labels.push(d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }));
            buckets[key] = 0;
          }
          groupFn = function (dt) { return dt.toISOString().slice(0, 10); };
        } else if (range === '30d') {
          startDate = new Date(now); startDate.setDate(startDate.getDate() - 29);
          for (var i = 0; i < 30; i++) {
            var d = new Date(startDate); d.setDate(d.getDate() + i);
            var key = d.toISOString().slice(0, 10);
            labels.push(d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }));
            buckets[key] = 0;
          }
          groupFn = function (dt) { return dt.toISOString().slice(0, 10); };
        } else if (range === 'quarter') {
          startDate = new Date(now); startDate.setMonth(startDate.getMonth() - 2);
          startDate.setDate(1);
          for (var i = 0; i < 3; i++) {
            var d = new Date(startDate); d.setMonth(d.getMonth() + i);
            var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
            labels.push(d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }));
            buckets[key] = 0;
          }
          groupFn = function (dt) { return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0'); };
        } else if (range === 'year') {
          startDate = new Date(now); startDate.setMonth(startDate.getMonth() - 11);
          startDate.setDate(1);
          for (var i = 0; i < 12; i++) {
            var d = new Date(startDate); d.setMonth(d.getMonth() + i);
            var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
            labels.push(d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }));
            buckets[key] = 0;
          }
          groupFn = function (dt) { return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0'); };
        } else if (range === '5year') {
          startDate = new Date(now); startDate.setFullYear(startDate.getFullYear() - 4);
          startDate.setMonth(0, 1);
          for (var i = 0; i < 5; i++) {
            var yr = startDate.getFullYear() + i;
            labels.push(String(yr));
            buckets[String(yr)] = 0;
          }
          groupFn = function (dt) { return String(dt.getFullYear()); };
        }

        allSignups.forEach(function (dt) {
          var key = groupFn(dt);
          if (key in buckets) buckets[key]++;
        });

        var data = Object.values(buckets);

        // Cumulative
        var cumulative = [];
        var sum = 0;
        data.forEach(function (v) { sum += v; cumulative.push(sum); });

        if (chart) chart.destroy();
        chart = new Chart(canvas, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'New Signups',
              data: data,
              borderColor: '#00e5ff',
              backgroundColor: 'rgba(0,229,255,0.08)',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#00e5ff',
              pointRadius: 4,
              pointHoverRadius: 6
            }, {
              label: 'Total Users',
              data: cumulative,
              borderColor: '#7c3aed',
              backgroundColor: 'rgba(124,58,237,0.05)',
              borderWidth: 2,
              borderDash: [5, 5],
              tension: 0.4,
              fill: false,
              pointBackgroundColor: '#7c3aed',
              pointRadius: 3,
              pointHoverRadius: 5
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                labels: { color: '#6b7080', font: { family: 'Poppins', size: 12 } }
              }
            },
            scales: {
              x: {
                ticks: { color: '#4a4e5a', font: { family: 'Poppins', size: 11 }, maxRotation: 45 },
                grid: { color: 'rgba(255,255,255,0.03)' }
              },
              y: {
                beginAtZero: true,
                ticks: { color: '#4a4e5a', font: { family: 'Poppins', size: 11 }, stepSize: 1 },
                grid: { color: 'rgba(255,255,255,0.03)' }
              }
            }
          }
        });
      }
    })();
  });
})();

