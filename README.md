# 📝 Mini Blog CMS (Markdown Content Management System)

A lightweight client-side Content Management System built with semantic HTML5, modern CSS3, and JavaScript array state management. This project was developed across iterations to simulate software evolution, automated unit testing, Git branching workflows, and Continuous Deployment (CD) via GitHub Pages.

---

## 🚀 Key Features

### Version 1.0 (Static Release)
- Clean, semantic HTML5 structure for publishing blog posts.
- Responsive, typography-focused CSS styling.
- Baseline hardcoded articles showcasing technical guides and architecture concepts.

### Version 2.0 (Dynamic Markdown CMS)
- **Dynamic Post Creation:** Write new articles with custom title, author, category, and markdown content.
- **Dynamic Post Deletion:** Remove articles dynamically from state by ID with user confirmation.
- **Post Editing:** In-place editing of existing posts with automatic `updatedAt` tracking.
- **Markdown Rendering Engine:** Custom parser converting markdown syntax to safe HTML (headings `#` - `####`, bold `**`, italics `*`, strikethrough `~~`, code blocks ```` ``` ````, inline `code`, blockquotes `>`, lists `-`, links `[text](url)`).
- **Security & XSS Protection:** Full HTML entity escaping before markdown transformation.
- **Persistent State:** Dual-tier storage using in-memory arrays and browser `localStorage`.
- **Search & Filtering:** Real-time search query filtering and category tabs.
- **Live Markdown Preview:** Toggleable live preview rendered as you type.
- **Interactive UI Feedback:** Non-blocking toast notifications for system events.

---

## 📁 Repository & Project Architecture

```text
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD workflow: Unit tests + GitHub Pages deployment
├── js/
│   ├── app.js               # Frontend controller & DOM event handling
│   └── blogLogic.js         # Pure functions for state management & markdown parsing
├── tests/
│   └── blogLogic.test.js    # Unit test suite (Node.js test runner)
├── .gitignore               # Ignored build and temporary files
├── index.html               # Main application entry point
├── package.json             # NPM scripts and project configuration
├── README.md                # Project documentation
├── REPORT.md                # Comprehensive lab report on version control & CI/CD
└── style.css                # Responsive stylesheet and design system
```

---

## 🧪 Unit Testing

Unit tests are written using Node.js's native test runner (`node:test` and `node:assert/strict`), eliminating the need for third-party test runners or heavy `node_modules`.

### Running Tests Locally:

```bash
# Run all unit tests
npm test

# Run tests in watch mode during development
npm run test:watch
```

### Test Suite Coverage (26 Passing Tests):
1. **Input Validation (`validatePostInput`):**
   - Mandatory title, author, content checks
   - Length limits (title: 3–120 chars, author: 2–60 chars, content: ≥ 5 chars)
   - Graceful non-object parameter rejection
2. **Post Creation (`createPost`):**
   - Dynamic prepending to array
   - ID and timestamp generation
   - Immutability verification (original array untouched)
   - Fallback category assignment
3. **Post Deletion (`deletePost`):**
   - Successful removal by ID
   - Array length decrement
   - Error handling for non-existent IDs and empty arrays
4. **Post Updating (`updatePost`):**
   - Updating fields while preserving ID and creation timestamp
   - Validation enforcement on updates
5. **Post Lookup (`getPostById`):**
   - Exact ID matching
   - Null handling for invalid IDs
6. **Markdown Parser & Sanitization (`parseMarkdown`):**
   - Headings, bold, italic, code, blockquotes, lists, links
   - HTML sanitization against XSS attacks

---

## 🌿 Git Branching Strategy

This project follows an industry-standard Git workflow:

```text
* [main] Release v2.0.0 (Deployed to GitHub Pages)
| \
|  * [development] Dynamic CMS functionality (v2 features)
|  | \
|  |  * [testing] Unit test suite & edge case resolution
|  | /
|  * Merged testing into development
| /
* [main] Release v1.0.0 (Static hardcoded baseline)
```

1. **`main`**: Production-ready code. Commits trigger CI/CD pipeline.
2. **`development`**: Active feature integration branch where Version 2 was built.
3. **`testing`**: Dedicated branch for unit tests and bug fixes.

---

## ⚡ Continuous Deployment (GitHub Pages)

The repository includes an automated GitHub Actions workflow in `.github/workflows/deploy.yml`:
1. Every `push` to `main` triggers the workflow.
2. The `test` job sets up Node 22 and executes `npm test`.
3. If all tests pass, the `deploy` job packages the repository and publishes it to **GitHub Pages**.
4. If tests fail, deployment is automatically prevented (Quality Gate).

---

## 👤 Author
- **Course:** Software Engineering Lab 8
- **Project:** Mini Blog Application & Portfolio
