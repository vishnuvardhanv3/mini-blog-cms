/**
 * Mini Blog CMS - Frontend Application Logic & DOM Controller
 */
import {
  createPost,
  deletePost,
  updatePost,
  getPostById,
  parseMarkdown,
  validatePostInput,
  INITIAL_POSTS
} from './blogLogic.js';

const STORAGE_KEY = 'mini_blog_cms_posts_v2';

// Application State
let posts = [];
let currentFilter = 'All';
let editingPostId = null;

// DOM Elements
const postsContainer = document.getElementById('postsContainer');
const postCountEl = document.getElementById('postCount');
const postForm = document.getElementById('postForm');
const formTitle = document.getElementById('formTitle');
const titleInput = document.getElementById('postTitleInput');
const authorInput = document.getElementById('postAuthorInput');
const categoryInput = document.getElementById('postCategoryInput');
const contentInput = document.getElementById('postContentInput');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const livePreviewToggle = document.getElementById('livePreviewToggle');
const previewContainer = document.getElementById('markdownPreview');
const previewBody = document.getElementById('previewBody');
const toastEl = document.getElementById('toast');
const filterButtonsContainer = document.getElementById('filterButtons');
const searchInput = document.getElementById('searchInput');
const resetDataBtn = document.getElementById('resetDataBtn');

/**
 * Loads posts from LocalStorage or falls back to INITIAL_POSTS
 */
function loadPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      posts = JSON.parse(raw);
    } else {
      posts = [...INITIAL_POSTS];
      savePosts();
    }
  } catch (err) {
    console.warn('LocalStorage error, using in-memory posts:', err);
    posts = [...INITIAL_POSTS];
  }
}

/**
 * Saves posts to LocalStorage
 */
function savePosts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (err) {
    console.warn('Could not save to localStorage:', err);
  }
}

/**
 * Shows temporary toast notification
 */
function showToast(message, type = 'success') {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.className = `toast toast-${type} show`;
  setTimeout(() => {
    toastEl.className = 'toast';
  }, 3000);
}

/**
 * Renders the filter buttons dynamically
 */
function renderFilterButtons() {
  if (!filterButtonsContainer) return;
  const categories = ['All', ...new Set(posts.map(p => p.category || 'General'))];
  filterButtonsContainer.innerHTML = categories.map(cat => `
    <button class="filter-btn ${cat === currentFilter ? 'active' : ''}" data-category="${cat}">
      ${cat}
    </button>
  `).join('');

  filterButtonsContainer.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentFilter = e.target.dataset.category;
      renderFilterButtons();
      renderPosts();
    });
  });
}

/**
 * Renders all blog posts according to active filter and search query
 */
function renderPosts() {
  if (!postsContainer) return;

  const searchQuery = (searchInput ? searchInput.value : '').toLowerCase().trim();

  let filtered = posts.filter(post => {
    const matchesCategory = currentFilter === 'All' || post.category === currentFilter;
    const matchesSearch = !searchQuery ||
      post.title.toLowerCase().includes(searchQuery) ||
      post.author.toLowerCase().includes(searchQuery) ||
      post.content.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  if (postCountEl) {
    postCountEl.textContent = `${filtered.length} of ${posts.length} Post${posts.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    postsContainer.innerHTML = `
      <div class="empty-state">
        <p class="empty-icon">📂</p>
        <h4>No Blog Posts Found</h4>
        <p>${searchQuery ? 'Try adjusting your search criteria.' : 'Create your first post using the CMS editor above!'}</p>
      </div>
    `;
    return;
  }

  postsContainer.innerHTML = filtered.map(post => {
    const parsedHtml = parseMarkdown(post.content);
    const updatedBadge = post.updatedAt ? `<span class="meta-item-updated">(Edited ${post.updatedAt})</span>` : '';

    return `
      <article class="post-card" id="${post.id}" data-id="${post.id}">
        <div class="post-header">
          <div class="post-title-row">
            <h4 class="post-title">${escapeHtmlOnly(post.title)}</h4>
            <div class="post-actions">
              <button class="btn-action btn-edit" data-id="${post.id}" title="Edit Post">
                ✏️ Edit
              </button>
              <button class="btn-action btn-delete" data-id="${post.id}" title="Delete Post">
                🗑️ Delete
              </button>
            </div>
          </div>
          <div class="post-meta">
            <span class="meta-item"><strong>Author:</strong> ${escapeHtmlOnly(post.author)}</span>
            <span class="meta-item"><strong>Published:</strong> ${post.createdAt}</span>
            ${updatedBadge}
            <span class="meta-badge">${escapeHtmlOnly(post.category || 'General')}</span>
          </div>
        </div>
        <div class="post-body">
          ${parsedHtml}
        </div>
      </article>
    `;
  }).join('');

  // Attach event handlers for dynamic delete & edit
  postsContainer.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', handleDelete);
  });

  postsContainer.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', handleEdit);
  });
}

function escapeHtmlOnly(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Handles post deletion dynamically
 */
function handleDelete(e) {
  const id = e.currentTarget.dataset.id;
  const post = getPostById(posts, id);
  if (!post) return;

  const confirmed = window.confirm(`Are you sure you want to delete "${post.title}"?`);
  if (!confirmed) return;

  const result = deletePost(posts, id);
  if (result.success) {
    posts = result.posts;
    savePosts();
    renderFilterButtons();
    renderPosts();
    showToast(`Post "${post.title}" deleted successfully!`, 'danger');
  } else {
    showToast(result.error || 'Failed to delete post.', 'danger');
  }
}

/**
 * Handles post editing mode
 */
function handleEdit(e) {
  const id = e.currentTarget.dataset.id;
  const post = getPostById(posts, id);
  if (!post) return;

  editingPostId = id;
  titleInput.value = post.title;
  authorInput.value = post.author;
  categoryInput.value = post.category || 'General';
  contentInput.value = post.content;

  formTitle.textContent = '✏️ Edit Blog Post';
  submitBtn.textContent = 'Update Post';
  cancelEditBtn.style.display = 'inline-flex';

  updateLivePreview();
  postForm.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Resets form back to creation mode
 */
function resetForm() {
  postForm.reset();
  editingPostId = null;
  formTitle.textContent = '✍️ Create New Markdown Post';
  submitBtn.textContent = 'Publish Post';
  cancelEditBtn.style.display = 'none';
  if (previewBody) previewBody.innerHTML = '<em>Live preview will render here...</em>';
}

/**
 * Updates live markdown preview if enabled
 */
function updateLivePreview() {
  if (!previewContainer || previewContainer.style.display === 'none') return;
  const rawMarkdown = contentInput ? contentInput.value : '';
  if (previewBody) {
    previewBody.innerHTML = rawMarkdown.trim() ? parseMarkdown(rawMarkdown) : '<em>Nothing to preview yet. Write some markdown above!</em>';
  }
}

/**
 * Initializes form listeners and application
 */
function init() {
  loadPosts();
  renderFilterButtons();
  renderPosts();

  // Form submission: Create or Update
  if (postForm) {
    postForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const postData = {
        title: titleInput.value,
        author: authorInput.value,
        category: categoryInput.value,
        content: contentInput.value
      };

      const validation = validatePostInput(postData);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        showToast(firstError, 'danger');
        return;
      }

      if (editingPostId) {
        // Update existing post
        const result = updatePost(posts, editingPostId, postData);
        if (result.success) {
          posts = result.posts;
          savePosts();
          renderFilterButtons();
          renderPosts();
          showToast('Blog post updated successfully!', 'success');
          resetForm();
        } else {
          showToast(result.error || 'Failed to update post.', 'danger');
        }
      } else {
        // Create dynamic new post
        const result = createPost(posts, postData);
        if (result.success) {
          posts = result.posts;
          savePosts();
          renderFilterButtons();
          renderPosts();
          showToast('New post published dynamically!', 'success');
          resetForm();
        } else {
          showToast('Validation failed. Check your inputs.', 'danger');
        }
      }
    });
  }

  // Cancel edit button
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', resetForm);
  }

  // Live preview toggle
  if (livePreviewToggle && previewContainer) {
    livePreviewToggle.addEventListener('click', () => {
      const isVisible = previewContainer.style.display !== 'none';
      previewContainer.style.display = isVisible ? 'none' : 'block';
      livePreviewToggle.textContent = isVisible ? '👁️ Show Markdown Preview' : '🙈 Hide Preview';
      if (!isVisible) updateLivePreview();
    });
  }

  if (contentInput) {
    contentInput.addEventListener('input', updateLivePreview);
  }

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderPosts();
    });
  }

  // Reset to seed data
  if (resetDataBtn) {
    resetDataBtn.addEventListener('click', () => {
      if (confirm('Reset blog posts back to default seed posts?')) {
        posts = [...INITIAL_POSTS];
        savePosts();
        currentFilter = 'All';
        renderFilterButtons();
        renderPosts();
        showToast('Reset to default seed posts.', 'success');
      }
    });
  }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
