/**
 * Mini Blog CMS - Core Business Logic & State Management
 * Pure ES Module functions: easily testable in Node.js and usable in the browser.
 */

/**
 * Escapes HTML characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates post input fields.
 * @param {Object} input
 * @param {string} input.title
 * @param {string} input.author
 * @param {string} input.content
 * @param {string} [input.category]
 * @returns {{ isValid: boolean, errors: Object.<string, string> }}
 */
export function validatePostInput(input) {
  const errors = {};

  if (!input || typeof input !== 'object') {
    return {
      isValid: false,
      errors: { form: 'Input data must be an object.' }
    };
  }

  const title = (input.title || '').trim();
  const author = (input.author || '').trim();
  const content = (input.content || '').trim();

  if (!title) {
    errors.title = 'Title is required.';
  } else if (title.length < 3) {
    errors.title = 'Title must be at least 3 characters long.';
  } else if (title.length > 120) {
    errors.title = 'Title cannot exceed 120 characters.';
  }

  if (!author) {
    errors.author = 'Author name is required.';
  } else if (author.length < 2) {
    errors.author = 'Author name must be at least 2 characters long.';
  } else if (author.length > 60) {
    errors.author = 'Author name cannot exceed 60 characters.';
  }

  if (!content) {
    errors.content = 'Post content in Markdown format is required.';
  } else if (content.length < 5) {
    errors.content = 'Content must be at least 5 characters long.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Parses basic Markdown syntax to secure HTML.
 * Handles headings, bold, italics, inline code, code blocks, blockquotes, lists, and links.
 * @param {string} markdown
 * @returns {string} Safe HTML string
 */
export function parseMarkdown(markdown) {
  if (typeof markdown !== 'string') return '';
  if (!markdown.trim()) return '';

  // Step 1: Escape HTML to prevent XSS
  let html = escapeHtml(markdown);

  // Step 2: Fenced code blocks ```code```
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });

  // Step 3: Blockquotes (> or &gt; quote)
  html = html.replace(/^(&gt;|>)\s?(.*)$/gm, '<blockquote>$2</blockquote>');
  // Combine consecutive blockquotes
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '<br>');

  // Step 4: Headings (# H1 to #### H4)
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Step 5: Bold and Italics
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Step 6: Strikethrough ~~text~~
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // Step 7: Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Step 8: Markdown Links [text](url) - only http, https, or relative
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Step 9: Unordered Lists (- item or * item)
  html = html.replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, (match) => {
    return `<ul>${match}</ul>`;
  });
  // Clean up adjacent duplicate <ul> tags
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  // Step 10: Paragraphs for loose text lines
  const lines = html.split('\n');
  const processed = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    // Skip wrapping block elements in <p>
    if (/^<(h[1-6]|ul|ol|li|blockquote|pre|\/ul|\/ol|\/blockquote|\/pre)/i.test(trimmed)) {
      return trimmed;
    }
    return `<p>${trimmed}</p>`;
  });

  return processed.filter(l => l.length > 0).join('\n');
}

/**
 * Creates a new blog post and returns the updated array and created post.
 * @param {Array<Object>} posts
 * @param {Object} postData
 * @param {string} [customId] - Optional custom id (for testing or seeding)
 * @returns {{ success: boolean, post?: Object, posts: Array<Object>, errors?: Object }}
 */
export function createPost(posts, postData, customId = null) {
  const currentPosts = Array.isArray(posts) ? [...posts] : [];
  const validation = validatePostInput(postData);

  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
      posts: currentPosts
    };
  }

  const id = customId || `post_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const newPost = {
    id,
    title: postData.title.trim(),
    author: postData.author.trim(),
    category: (postData.category || 'General').trim(),
    content: postData.content.trim(),
    createdAt: formattedDate,
    timestamp: now.getTime(),
    updatedAt: null
  };

  // Prepend new post so latest post appears first
  const updatedPosts = [newPost, ...currentPosts];

  return {
    success: true,
    post: newPost,
    posts: updatedPosts
  };
}

/**
 * Deletes a post by its ID from the posts array.
 * @param {Array<Object>} posts
 * @param {string} postId
 * @returns {{ success: boolean, deletedId?: string, posts: Array<Object>, error?: string }}
 */
export function deletePost(posts, postId) {
  if (!Array.isArray(posts)) {
    return {
      success: false,
      error: 'Posts parameter must be an array.',
      posts: []
    };
  }

  const index = posts.findIndex(p => p.id === postId);
  if (index === -1) {
    return {
      success: false,
      error: `Post with ID "${postId}" was not found.`,
      posts: [...posts]
    };
  }

  const updatedPosts = posts.filter(p => p.id !== postId);
  return {
    success: true,
    deletedId: postId,
    posts: updatedPosts
  };
}

/**
 * Updates an existing blog post.
 * @param {Array<Object>} posts
 * @param {string} postId
 * @param {Object} updateData
 * @returns {{ success: boolean, post?: Object, posts: Array<Object>, errors?: Object, error?: string }}
 */
export function updatePost(posts, postId, updateData) {
  if (!Array.isArray(posts)) {
    return { success: false, error: 'Posts must be an array.', posts: [] };
  }

  const index = posts.findIndex(p => p.id === postId);
  if (index === -1) {
    return { success: false, error: 'Post not found.', posts: [...posts] };
  }

  const validation = validatePostInput(updateData);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors, posts: [...posts] };
  }

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const existingPost = posts[index];
  const updatedPost = {
    ...existingPost,
    title: updateData.title.trim(),
    author: updateData.author.trim(),
    category: (updateData.category || existingPost.category).trim(),
    content: updateData.content.trim(),
    updatedAt: formattedDate
  };

  const updatedPosts = [...posts];
  updatedPosts[index] = updatedPost;

  return {
    success: true,
    post: updatedPost,
    posts: updatedPosts
  };
}

/**
 * Finds a post by its ID.
 * @param {Array<Object>} posts
 * @param {string} postId
 * @returns {Object|null}
 */
export function getPostById(posts, postId) {
  if (!Array.isArray(posts)) return null;
  return posts.find(p => p.id === postId) || null;
}

/**
 * Initial seed data representing initial blog posts.
 */
export const INITIAL_POSTS = [
  {
    id: 'post-1',
    title: 'Getting Started with Markdown & Web Development',
    author: 'Alex Rivers',
    category: 'Guide',
    content: `Markdown is a lightweight markup language with plain-text-formatting syntax. It is designed so that it can be converted into HTML using an easy-to-read syntax.

### Why Markdown in CMS?
- **Portability:** Plain text files are future-proof and universal.
- **Speed:** Format headings, lists, and code without switching to bulky editors.
- **Readability:** Raw markdown remains human-readable.

\`\`\`
# Markdown Heading
**Bold text** and *italicized text*
- Item 1
- Item 2
\`\`\``,
    createdAt: 'Nov 10, 2026',
    timestamp: 1794297600000,
    updatedAt: null
  },
  {
    id: 'post-2',
    title: 'Why Git Branching is Crucial for Software Quality',
    author: 'Jordan Lee',
    category: 'Engineering',
    content: `Branching allows developers to diverge from the production line of code to experiment, implement new features, and isolate bug fixes without destabilizing the release branch.

> "Feature branching ensures the production line remains clean and deployable at all times."

In modern CI/CD teams, isolated branches such as \`main\`, \`development\`, and \`testing\` ensure quality gates are met before code reaches end users.`,
    createdAt: 'Nov 11, 2026',
    timestamp: 1794384000000,
    updatedAt: null
  },
  {
    id: 'post-3',
    title: 'Continuous Deployment with GitHub Pages',
    author: 'Taylor Smith',
    category: 'DevOps',
    content: `Automating your deployment pipeline eliminates manual error. Every time code is merged into the default branch, automated runners execute tests and publish artifacts directly to the web.

Key benefits include:
- Zero-friction release cycles
- Continuous validation of test suites
- Immediate stakeholder feedback on live previews`,
    createdAt: 'Nov 12, 2026',
    timestamp: 1794470400000,
    updatedAt: null
  }
];
