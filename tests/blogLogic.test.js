import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createPost,
  deletePost,
  updatePost,
  getPostById,
  validatePostInput,
  parseMarkdown,
  escapeHtml,
  INITIAL_POSTS
} from '../js/blogLogic.js';

describe('Mini Blog CMS - Logic & Validation Test Suite', () => {

  // 1. Input Validation Tests
  describe('Input Validation (validatePostInput)', () => {
    it('should validate complete and correct post inputs', () => {
      const valid = {
        title: 'Building Modern Web Apps',
        author: 'Jane Doe',
        category: 'Guide',
        content: 'Comprehensive overview of web architecture and design patterns.'
      };
      const res = validatePostInput(valid);
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(Object.keys(res.errors).length, 0);
    });

    it('should reject inputs with missing title or title < 3 characters', () => {
      assert.strictEqual(validatePostInput({ title: '', author: 'Jane', content: 'Sample text' }).isValid, false);
      assert.strictEqual(validatePostInput({ title: 'Hi', author: 'Jane', content: 'Sample text' }).isValid, false);
      assert.strictEqual(validatePostInput({ title: '   ', author: 'Jane', content: 'Sample text' }).isValid, false);
    });

    it('should reject titles longer than 120 characters', () => {
      const longTitle = 'A'.repeat(121);
      const res = validatePostInput({ title: longTitle, author: 'Jane', content: 'Sample text' });
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.title);
    });

    it('should reject missing or short author names', () => {
      const res = validatePostInput({ title: 'Valid Title', author: 'A', content: 'Sample text' });
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.author);
    });

    it('should reject empty or short content (< 5 characters)', () => {
      const res = validatePostInput({ title: 'Valid Title', author: 'Jane Doe', content: 'Hey' });
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.content);
    });

    it('should handle non-object inputs gracefully', () => {
      assert.strictEqual(validatePostInput(null).isValid, false);
      assert.strictEqual(validatePostInput(undefined).isValid, false);
      assert.strictEqual(validatePostInput('string').isValid, false);
    });
  });

  // 2. Post Creation Tests
  describe('Post Creation (createPost)', () => {
    it('should successfully create a new post and prepend to array', () => {
      const initialPosts = [...INITIAL_POSTS];
      const initialCount = initialPosts.length;
      const newPostData = {
        title: 'Unit Testing with Node Test Runner',
        author: 'Linus Torvalds',
        category: 'Testing',
        content: 'Node 22 native test runner provides blazing fast zero-config unit tests.'
      };

      const result = createPost(initialPosts, newPostData, 'test-post-100');

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.posts.length, initialCount + 1);
      assert.strictEqual(result.posts[0].id, 'test-post-100');
      assert.strictEqual(result.posts[0].title, 'Unit Testing with Node Test Runner');
      assert.strictEqual(result.posts[0].author, 'Linus Torvalds');
      assert.strictEqual(result.posts[0].category, 'Testing');
      assert.ok(result.posts[0].createdAt);
      assert.strictEqual(result.posts[0].updatedAt, null);
    });

    it('should assign a default category if omitted or empty', () => {
      const posts = [];
      const newPostData = {
        title: 'Title Without Category',
        author: 'Jane Doe',
        content: 'This post did not specify a category in the input.'
      };

      const result = createPost(posts, newPostData);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.post.category, 'General');
    });

    it('should not mutate the original posts array (immutability)', () => {
      const initialPosts = Object.freeze([...INITIAL_POSTS]);
      const newPostData = {
        title: 'Testing Immutability in State',
        author: 'Dan Abramov',
        content: 'State transitions should return fresh arrays.'
      };

      const result = createPost(initialPosts, newPostData);
      assert.strictEqual(result.success, true);
      assert.notStrictEqual(result.posts, initialPosts);
      assert.strictEqual(initialPosts.length, 3);
      assert.strictEqual(result.posts.length, 4);
    });

    it('should fail creation and return errors for invalid inputs', () => {
      const posts = [...INITIAL_POSTS];
      const result = createPost(posts, { title: '', author: '', content: '' });

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.posts.length, posts.length);
      assert.ok(result.errors.title);
      assert.ok(result.errors.author);
      assert.ok(result.errors.content);
    });
  });

  // 3. Post Deletion Tests
  describe('Post Deletion (deletePost)', () => {
    it('should delete an existing post by ID and reduce array length by 1', () => {
      const posts = [
        { id: 'p1', title: 'First' },
        { id: 'p2', title: 'Second' },
        { id: 'p3', title: 'Third' }
      ];

      const result = deletePost(posts, 'p2');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.deletedId, 'p2');
      assert.strictEqual(result.posts.length, 2);
      assert.strictEqual(result.posts.some(p => p.id === 'p2'), false);
    });

    it('should return error and keep posts untouched when ID does not exist', () => {
      const posts = [{ id: 'p1', title: 'First' }];
      const result = deletePost(posts, 'non-existent-id');

      assert.strictEqual(result.success, false);
      assert.ok(result.error);
      assert.strictEqual(result.posts.length, 1);
    });

    it('should handle empty arrays or non-array parameters safely', () => {
      assert.strictEqual(deletePost([], 'p1').success, false);
      assert.strictEqual(deletePost(null, 'p1').success, false);
    });
  });

  // 4. Post Updating Tests
  describe('Post Updating (updatePost)', () => {
    it('should update post details while preserving original ID and createdAt', () => {
      const posts = [
        {
          id: 'p-1',
          title: 'Original Title',
          author: 'Original Author',
          category: 'Old',
          content: 'Original content here.',
          createdAt: 'Nov 1, 2026',
          updatedAt: null
        }
      ];

      const result = updatePost(posts, 'p-1', {
        title: 'Updated Title',
        author: 'Updated Author',
        category: 'Engineering',
        content: 'Updated content with markdown.'
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.post.title, 'Updated Title');
      assert.strictEqual(result.post.author, 'Updated Author');
      assert.strictEqual(result.post.category, 'Engineering');
      assert.strictEqual(result.post.id, 'p-1');
      assert.strictEqual(result.post.createdAt, 'Nov 1, 2026');
      assert.ok(result.post.updatedAt);
    });

    it('should reject updates with invalid data', () => {
      const posts = [{ id: 'p-1', title: 'Title', author: 'Author', content: 'Content' }];
      const result = updatePost(posts, 'p-1', { title: 'No', author: 'A', content: '' });

      assert.strictEqual(result.success, false);
      assert.ok(result.errors);
    });

    it('should return error when attempting to update non-existent post', () => {
      const posts = [{ id: 'p-1', title: 'Title', author: 'Author', content: 'Content' }];
      const result = updatePost(posts, 'unknown-id', {
        title: 'Valid Title',
        author: 'Valid Author',
        content: 'Valid content'
      });

      assert.strictEqual(result.success, false);
      assert.ok(result.error);
    });
  });

  // 5. Post Lookup Tests
  describe('Post Lookup (getPostById)', () => {
    it('should find and return the matching post by ID', () => {
      const posts = [{ id: 'alpha', title: 'Alpha Post' }, { id: 'beta', title: 'Beta Post' }];
      const found = getPostById(posts, 'beta');
      assert.ok(found);
      assert.strictEqual(found.title, 'Beta Post');
    });

    it('should return null when ID is not found', () => {
      const posts = [{ id: 'alpha', title: 'Alpha' }];
      assert.strictEqual(getPostById(posts, 'gamma'), null);
    });
  });

  // 6. Markdown Parsing & XSS Sanitization Tests
  describe('Markdown Parser & Sanitization (parseMarkdown)', () => {
    it('should convert headers correctly (#, ##, ###, ####)', () => {
      assert.strictEqual(parseMarkdown('# Heading 1'), '<h1>Heading 1</h1>');
      assert.strictEqual(parseMarkdown('## Heading 2'), '<h2>Heading 2</h2>');
      assert.strictEqual(parseMarkdown('### Heading 3'), '<h3>Heading 3</h3>');
      assert.strictEqual(parseMarkdown('#### Heading 4'), '<h4>Heading 4</h4>');
    });

    it('should convert bold, italic, and strikethrough syntax', () => {
      const md = '**bold text** and *italic text* and ~~deleted text~~';
      const parsed = parseMarkdown(md);
      assert.ok(parsed.includes('<strong>bold text</strong>'));
      assert.ok(parsed.includes('<em>italic text</em>'));
      assert.ok(parsed.includes('<del>deleted text</del>'));
    });

    it('should convert inline code and fenced code blocks', () => {
      const inline = 'Use `const x = 10;` in your code.';
      assert.ok(parseMarkdown(inline).includes('<code>const x = 10;</code>'));

      const block = '```\nconsole.log("Hello World");\n```';
      const parsedBlock = parseMarkdown(block);
      assert.ok(parsedBlock.includes('<pre><code>console.log(&quot;Hello World&quot;);</code></pre>'));
    });

    it('should convert blockquotes', () => {
      const quote = '> Quality is not an act, it is a habit.';
      const parsed = parseMarkdown(quote);
      assert.ok(parsed.includes('<blockquote>Quality is not an act, it is a habit.</blockquote>'));
    });

    it('should convert unordered lists', () => {
      const list = '- First\n- Second\n- Third';
      const parsed = parseMarkdown(list);
      assert.ok(parsed.includes('<ul>'));
      assert.ok(parsed.includes('<li>First</li>'));
      assert.ok(parsed.includes('<li>Second</li>'));
      assert.ok(parsed.includes('<li>Third</li>'));
      assert.ok(parsed.includes('</ul>'));
    });

    it('should convert markdown links to safe HTML links', () => {
      const md = '[GitHub Docs](https://docs.github.com)';
      const parsed = parseMarkdown(md);
      assert.ok(parsed.includes('<a href="https://docs.github.com" target="_blank" rel="noopener noreferrer">GitHub Docs</a>'));
    });

    it('should escape raw HTML characters and scripts to prevent XSS attacks', () => {
      const malicious = '<script>alert("Hacked!")</script>';
      const parsed = parseMarkdown(malicious);
      assert.strictEqual(parsed.includes('<script>'), false);
      assert.ok(parsed.includes('&lt;script&gt;'));
      assert.ok(parsed.includes('&lt;/script&gt;'));
    });

    it('should return empty string for null, undefined, or empty markdown', () => {
      assert.strictEqual(parseMarkdown(''), '');
      assert.strictEqual(parseMarkdown('   '), '');
      assert.strictEqual(parseMarkdown(null), '');
      assert.strictEqual(parseMarkdown(undefined), '');
    });
  });
});
