# 📄 Laboratory Report: Mini Blog CMS & Continuous Deployment

**Course / Module:** Software Engineering Lab 8  
**Project:** Mini Blog Application (Markdown CMS)  
**Author:** Student Developer  
**Status:** Completed & Ready for GitHub Pages Deployment  

---

## 1. Executive Summary & Objective

The objective of this laboratory assignment was to build a client-side **Mini Blog Application (CMS)** simulating real-world iterative software development, automated unit testing, structured Git branching, and continuous deployment (CD) via GitHub Pages.

The project was executed across distinct architectural phases:
1. **Version 1.0:** Baseline static implementation presenting hardcoded articles on a semantic web interface.
2. **Version 2.0:** Evolution into a dynamic client-side CMS featuring dynamic state management using JavaScript arrays, markdown parsing, live preview, CRUD operations (Create, Read, Update, Delete), real-time search, and category filtering.
3. **Automated Unit Testing:** Implementation of 26 comprehensive unit tests covering validation, array mutations, and markdown rendering.
4. **Git Branching Strategy:** Managing development workflows across isolated `main`, `development`, and `testing` branches.
5. **Continuous Deployment (CD):** GitHub Actions automation pipeline that executes tests and deploys successful builds to GitHub Pages.

---

## 2. Technical Architecture & Implementation

### 2.1 File Organization
```text
mini-blog-cms/
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD Pipeline (GitHub Actions -> GitHub Pages)
├── js/
│   ├── app.js               # UI Controller, DOM manipulation & LocalStorage integration
│   └── blogLogic.js         # Pure business logic, state mutations & markdown parser
├── tests/
│   └── blogLogic.test.js    # Unit test suite executing via Node.js native test runner
├── .gitignore               # Excludes node_modules and OS cache files
├── index.html               # Semantic HTML5 single-page application interface
├── package.json             # NPM configuration and test runner script
├── README.md                # Repository documentation and run instructions
├── REPORT.md                # Technical laboratory and version control report
└── style.css                # Modern CSS design system (flexbox, grid, CSS custom variables)
```

### 2.2 Technology Stack
- **HTML5:** Semantic markup (`<header>`, `<main>`, `<article>`, `<section>`, `<footer>`, `<form>`).
- **CSS3:** Custom variables, grid layouts, responsive breakpoints, accessible focus rings, and glassmorphic header styling.
- **Vanilla JavaScript (ES Modules):** Modular design separating pure logic (`blogLogic.js`) from DOM manipulation (`app.js`).
- **Node.js 22 Test Runner (`node:test`):** Fast, dependency-free test execution.
- **Git & GitHub Pages:** Distributed version control and automated static web hosting.

---

## 3. Version Evolution: From Static to Dynamic

| Feature / Metric | Version 1.0 (Static) | Version 2.0 (Dynamic CMS) |
| :--- | :--- | :--- |
| **Content Delivery** | Hardcoded in `index.html` markup | Stored dynamically in JavaScript array state |
| **User Interaction** | Read-only | Create, Edit, Delete, Search, and Filter |
| **Markdown Support** | Static pre-rendered HTML | Dynamic client-side markdown parsing engine |
| **Preview** | N/A | Interactive live markdown preview toggle |
| **State Persistence**| Ephemeral (session only) | Dual-tier: In-memory array + browser `localStorage` |
| **User Feedback** | Static display | Non-intrusive animated toast notifications |
| **Automated Tests** | None | 26 automated unit tests verifying core logic |

---

## 4. State Management with JavaScript Arrays

In Version 2, all blog articles are managed as an array of structured objects:

```javascript
{
  id: "post_1794297600000_abc123",
  title: "Why Git Branching is Crucial",
  author: "Jordan Lee",
  category: "Engineering",
  content: "# Section Header\nPost body...",
  createdAt: "Nov 12, 2026",
  timestamp: 1794297600000,
  updatedAt: null
}
```

### Core Logic Operations (`js/blogLogic.js`):
1. **`createPost(posts, postData)`:**
   - Validates required inputs (length limits, non-empty fields).
   - Generates a unique timestamped identifier.
   - Immutably returns a new array with the created post prepended (`[newPost, ...currentPosts]`), ensuring the latest post appears at the top.
2. **`deletePost(posts, postId)`:**
   - Locates post by unique identifier.
   - Filters out the target post immutably: `posts.filter(p => p.id !== postId)`.
   - Returns `{ success: true, deletedId, posts: updatedArray }`.
3. **`updatePost(posts, postId, updateData)`:**
   - Modifies post properties while strictly preserving the initial `id` and `createdAt` timestamp.
   - Attaches an `updatedAt` date string.
4. **`parseMarkdown(markdown)`:**
   - Implements multi-stage regex parser for `#` headings, `**bold**`, `*italics*`, `~~strikethrough~~`, `<code>`, `<pre>`, `<blockquote>`, `<ul>/<li>`, and `<a>` links.
   - Performs strict HTML entity escaping upfront (`&`, `<`, `>`, `"`) to completely prevent Cross-Site Scripting (XSS).

---

## 5. Unit Testing & Verification

Unit tests were authored using Node.js's native test runner (`node:test` and `node:assert/strict`).

### Test Suite Execution Output:
```text
> mini-blog-cms@2.0.0 test
> node --test tests/*.test.js

TAP version 13
# Subtest: Mini Blog CMS - Logic & Validation Test Suite
    # Subtest: Input Validation (validatePostInput)
        ok 1 - should validate complete and correct post inputs
        ok 2 - should reject inputs with missing title or title < 3 characters
        ok 3 - should reject titles longer than 120 characters
        ok 4 - should reject missing or short author names
        ok 5 - should reject empty or short content (< 5 characters)
        ok 6 - should handle non-object inputs gracefully
    ok 1 - Input Validation (validatePostInput)
    # Subtest: Post Creation (createPost)
        ok 1 - should successfully create a new post and prepend to array
        ok 2 - should assign a default category if omitted or empty
        ok 3 - should not mutate the original posts array (immutability)
        ok 4 - should fail creation and return errors for invalid inputs
    ok 2 - Post Creation (createPost)
    # Subtest: Post Deletion (deletePost)
        ok 1 - should delete an existing post by ID and reduce array length by 1
        ok 2 - should return error and keep posts untouched when ID does not exist
        ok 3 - should handle empty arrays or non-array parameters safely
    ok 3 - Post Deletion (deletePost)
    # Subtest: Post Updating (updatePost)
        ok 1 - should update post details while preserving original ID and createdAt
        ok 2 - should reject updates with invalid data
        ok 3 - should return error when attempting to update non-existent post
    ok 4 - Post Updating (updatePost)
    # Subtest: Post Lookup (getPostById)
        ok 1 - should find and return the matching post by ID
        ok 2 - should return null when ID is not found
    ok 5 - Post Lookup (getPostById)
    # Subtest: Markdown Parser & Sanitization (parseMarkdown)
        ok 1 - should convert headers correctly (#, ##, ###, ####)
        ok 2 - should convert bold, italic, and strikethrough syntax
        ok 3 - should convert inline code and fenced code blocks
        ok 4 - should convert blockquotes
        ok 5 - should convert unordered lists
        ok 6 - should convert markdown links to safe HTML links
        ok 7 - should escape raw HTML characters and scripts to prevent XSS attacks
        ok 8 - should return empty string for null, undefined, or empty markdown
    ok 6 - Markdown Parser & Sanitization (parseMarkdown)
ok 1 - Mini Blog CMS - Logic & Validation Test Suite

# tests 26
# suites 7
# pass 26
# fail 0
```
**Outcome:** 26 tests passed, 0 failed.

---

## 6. Git Branching Strategy

To simulate enterprise team engineering standards, work was isolated across branches:

1. **`main`:** The protected production branch. Contains stable, deployable code. Initialized with Version 1.0 (tagged `v1.0.0`) and updated with Version 2.0 (tagged `v2.0.0`).
2. **`development`:** Feature integration branch where Version 2 dynamic array state and UI were constructed.
3. **`testing`:** Quality assurance branch where unit tests were written, test runners configured, and edge cases (such as markdown blockquote regex interaction with HTML escaping) were resolved.

```text
  (v1.0.0)
     *-------------------------- [main: Production Release v1]
      \
       *------------------------ [development: Dynamic CMS UI]
        \
         *                      [testing: 26 Unit Tests Created]
          \
           *-------------------- [testing: Markdown Edge Case Fixed]
          /
       *------------------------ [development: Testing Merged]
      /
     *-------------------------- [main: Release v2.0.0 Deployed]
```

---

## 7. Short Note on Version Control in Software Engineering

> **Essential Note for Software Engineering Practice:**
> 
> Version Control Systems (VCS), particularly distributed systems like **Git**, form the foundational bedrock of modern software engineering. They offer critical capabilities:
> 
> 1. **Traceability and Auditability:** Every modification, bug fix, or feature addition is recorded with a cryptographic hash, author identity, timestamp, and context commit message. This creates an immutable history explaining *why* code changed, not merely *what* changed.
> 2. **Risk Mitigation and Reversibility:** By isolating features in separate branches (such as `development` and `testing`), experimental or breaking changes never jeopardize the stability of the production release on `main`. If a defect emerges, developers can pinpoint the regression via `git bisect` and revert safely using `git revert` without data loss.
> 3. **Collaboration and Concurrency:** Distributed VCS enables multiple software engineers to work concurrently on disparate components of an application without stepping on each other's work. Branch merges and pull requests act as peer-review checkpoints ensuring code standards are met before integration.
> 4. **Enabler of CI/CD:** Modern Continuous Integration and Continuous Deployment pipelines depend on Git webhooks. Automated runners trigger on branch pushes to run unit tests, build artifacts, and deploy code automatically, transforming Git into the engine of modern software delivery.

---

## 8. Continuous Deployment with GitHub Pages

### 8.1 Workflow Architecture (`.github/workflows/deploy.yml`)
1. **Trigger:** Push events targeting the `main` branch.
2. **Job 1 (`test`):**
   - Spins up an Ubuntu Linux virtual environment.
   - Installs Node.js 22.
   - Executes `npm test`. If any assertion fails, the pipeline aborts immediately, preventing broken code from reaching users.
3. **Job 2 (`deploy`):**
   - Depends on `test` passing (`needs: test`).
   - Packages the application directory as a Pages artifact.
   - Deploys the static site to the GitHub Pages edge network.

### 8.2 Commands to Connect Remote and Deploy

To publish this project to your GitHub account:

```bash
# 1. Create a new repository on GitHub (e.g. mini-blog-cms)
# 2. Add your GitHub repository as the origin remote:
git remote add origin https://github.com/<your-username>/mini-blog-cms.git

# 3. Push the main branch along with release tags:
git push -u origin main --tags

# 4. Push the development and testing branches for complete grading history:
git push origin development
git push origin testing

# 5. In GitHub Repository Settings:
#    Go to Settings -> Pages -> Build and deployment -> Source:
#    Select "GitHub Actions"
```

Once pushed, GitHub Actions automatically runs the 26 unit tests and deploys the live application to:
`https://<your-username>.github.io/mini-blog-cms/`

---

## 9. Conclusion

All five required tasks have been successfully completed:
- [x] **Task 1:** Version 1 developed (semantic layout with hardcoded blog posts).
- [x] **Task 2:** Version 2 developed (dynamic post creation, editing, deletion, and markdown parsing).
- [x] **Task 3:** Unit tests implemented with 100% pass rate (26 test cases).
- [x] **Task 4:** Git branching implemented (`main`, `development`, `testing` with merge history and tags).
- [x] **Task 5:** GitHub Pages CI/CD workflow configured and comprehensive version control report documented.
