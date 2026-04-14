// ===== DATA LAYER =====
const STORAGE_KEY = 'digitalkaagaz_blogs';

function getBlogs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveBlogs(blogs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ===== DOM REFS =====
const blogGrid = document.getElementById('blog-grid');
const emptyState = document.getElementById('empty-state');
const blogForm = document.getElementById('blog-form');
const statPosts = document.getElementById('stat-posts');
const toast = document.getElementById('toast');
const modalOverlay = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
const filterBtns = document.querySelectorAll('.filter-btn');
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

let currentFilter = 'all';

// ===== RENDER BLOGS =====
function renderBlogs() {
  const blogs = getBlogs();
  const filtered = currentFilter === 'all'
    ? blogs
    : blogs.filter(b => b.category === currentFilter);

  blogGrid.innerHTML = '';
  statPosts.textContent = blogs.length;

  if (filtered.length === 0) {
    emptyState.hidden = false;
    emptyState.textContent = currentFilter === 'all'
      ? 'No blog posts yet. Be the first to write one!'
      : `No posts in "${currentFilter}" yet.`;
  } else {
    emptyState.hidden = true;
  }

  filtered.sort((a, b) => b.timestamp - a.timestamp);

  filtered.forEach(blog => {
    const card = document.createElement('article');
    card.className = 'blog-card';
    card.setAttribute('role', 'button');
    card.tabIndex = 0;

    const imgHtml = blog.coverUrl
      ? `<img class="blog-card-img" src="${escapeHtml(blog.coverUrl)}" alt="" loading="lazy" onerror="this.style.display='none'">`
      : `<div class="blog-card-img"></div>`;

    const preview = blog.content.length > 160
      ? blog.content.slice(0, 160) + '...'
      : blog.content;

    card.innerHTML = `
      ${imgHtml}
      <div class="blog-card-body">
        <span class="blog-card-category">${escapeHtml(blog.category)}</span>
        <h3>${escapeHtml(blog.title)}</h3>
        <p class="preview">${escapeHtml(preview)}</p>
      </div>
      <div class="blog-card-footer">
        <span class="author">${escapeHtml(blog.author)}</span>
        <span>${formatDate(blog.timestamp)}</span>
        <span class="read-more">Read &rarr;</span>
      </div>
    `;

    card.addEventListener('click', () => openModal(blog.id));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') openModal(blog.id); });
    blogGrid.appendChild(card);
  });
}

// ===== MODAL =====
function openModal(id) {
  const blog = getBlogs().find(b => b.id === id);
  if (!blog) return;

  const imgHtml = blog.coverUrl
    ? `<img class="modal-img" src="${escapeHtml(blog.coverUrl)}" alt="" onerror="this.style.display='none'">`
    : '';

  modalBody.innerHTML = `
    <span class="modal-category">${escapeHtml(blog.category)}</span>
    <h2>${escapeHtml(blog.title)}</h2>
    <p class="modal-meta">By <span>${escapeHtml(blog.author)}</span> &middot; ${formatDate(blog.timestamp)}</p>
    ${imgHtml}
    <div class="modal-content">${escapeHtml(blog.content)}</div>
    <button class="delete-btn" id="delete-btn">Delete Post</button>
  `;

  document.getElementById('delete-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this post?')) {
      deleteBlog(id);
      closeModal();
    }
  });

  modalOverlay.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.hidden = true;
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modalOverlay.hidden) closeModal();
});

// ===== CREATE BLOG =====
blogForm.addEventListener('submit', e => {
  e.preventDefault();

  const author = blogForm.author.value.trim();
  const category = blogForm.category.value;
  const title = blogForm.title.value.trim();
  const coverUrl = blogForm['cover-url'].value.trim();
  const content = blogForm.content.value.trim();

  if (!author || !category || !title || !content) return;

  const blog = {
    id: generateId(),
    author,
    category,
    title,
    coverUrl,
    content,
    timestamp: Date.now()
  };

  const blogs = getBlogs();
  blogs.push(blog);
  saveBlogs(blogs);

  blogForm.reset();
  renderBlogs();
  showToast('Post published successfully!');

  // Scroll to blogs
  setTimeout(() => {
    document.getElementById('blogs').scrollIntoView({ behavior: 'smooth' });
  }, 600);
});

// ===== DELETE BLOG =====
function deleteBlog(id) {
  const blogs = getBlogs().filter(b => b.id !== id);
  saveBlogs(blogs);
  renderBlogs();
  showToast('Post deleted.');
}

// ===== FILTER =====
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderBlogs();
  });
});

// Allow footer category links to trigger filter
window.filterByCategory = function(cat) {
  currentFilter = cat;
  filterBtns.forEach(b => {
    b.classList.toggle('active', b.dataset.filter === cat);
  });
  renderBlogs();
};

// ===== HAMBURGER MENU =====
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===== HELPERS =====
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 3000);
}

// ===== NAVBAR SCROLL EFFECT =====
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 50) {
    nav.style.background = 'rgba(5,10,24,0.95)';
  } else {
    nav.style.background = 'rgba(5,10,24,0.85)';
  }
});

// ===== INIT =====
renderBlogs();
