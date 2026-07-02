# Advanced Production-Grade CI Pipeline (Node.js App)

A robust, enterprise-standard Continuous Integration (CI) engine built on GitHub Actions for automated quality assurance. This ecosystem guarantees zero bad code slips into the main deployment environment by strictly policing syntax, testing runtime backwards-compatibility across multiple node layers, vetting third-party dependency vulnerabilities, and generating immutable production artifacts.

---

## 1. Project Topology & Architecture Diagram

This graph illustrates the Directed Acyclic Graph (DAG) designed to prioritize high-speed validation tracking and optimize computational billable minutes via immediate "fast-failure" mechanics.

```
              [ Code Mutation Event: Push / Pull Request ]
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │     Job 1: LINT     │  ◄── (Static Analysis / Fast Failure)
                        └──────────┬──────────┘
                                   │
                       ┌───────────┴───────────┐
                       ▼                       ▼
              ┌──────────────────┐    ┌──────────────────┐
              │   Job 2: TEST    │    │ Job 3: SECURITY  │  ◄── (Parallel Matrix Execution)
              │  (Matrix Engine) │    │   (npm audit)    │
              │  ├── Node v18    │    └────────┬─────────┘
              │  ├── Node v20    │             │
              │  └── Node v22    │             │
              └────────┬─────────┘             │
                       │                       │
                       └───────────┬───────────┘
                                   ▼
                        ┌─────────────────────┐
                        │    Job 4: BUILD     │  ◄── (Immutable Production Artifact Upload)
                        └─────────────────────┘

```

---

## 2. Core Operational Metrics

### 🛑 The Problem
In cross-collaborative development workflows, committing code without standardized barriers introduces critical human error risks. Relying on engineers to manually execute validation processes locally before pushing invariably breaks shared branches. Untracked syntactical discrepancies, runtime architectural incompatibilities, and high-risk third-party security vulnerabilities flow into production without intervention, driving up technical debt and blocking delivery cadences.

### 🎯 The Approach
We established an absolute zero-trust validation ecosystem between incoming feature iterations and the production environment (<code>main</code> branch). Every commit or Pull Request triggers isolated cloud execution servers running automated validation blocks. The primary branch is hard-locked using GitHub Rule Configurations so that mutations cannot bypass strict constraints: lint passing, a multi-version dynamic test suite execution matrix, vulnerability grading, and production compilation.

### 🛠️ Tech Stack & Implementation Matrix
* **GitHub Actions:** Chosen for its native VCS integration, entirely free execution minutiae allocations on public cloud models, and zero overhead orchestration maintenance.
* **ESLint (v10.6.0):** Selected to execute deterministic static analysis policies across written syntaxes, capturing coding errors before kicking off dynamic test jobs.
* **Jest (v30.4.2):** High-speed assertions unit frame handling dynamic test suites with clean runtime tracking outputs.
* **npm audit:** Native vulnerability checking directly tied into the official GitHub Advisory Database, safeguarding package chains without requiring complex configurations.

---

## 3. Step-by-Step Implementation Ledger

Follow these sequential terminal inputs to replicate the underlying baseline environment configuration locally and bridge it to the cloud:

```bash
# Step 1: Initialize local ecosystem parameters
mkdir ci-pipeline-node && cd ci-pipeline-node
npm init -y

# Step 2: Inject core code analytics and unit-testing systems
npm install --save-dev eslint jest

# Step 3: Establish local tracking matrices and isolate modules dependencies
git init
echo "node_modules/" > .gitignore

# Step 4: Provision structural automation files paths
mkdir -p .github/workflows

```

---

## 4. Complete Configuration Manifests

### File: `package.json`

```json
{
  "name": "ci-pipeline-node",
  "version": "1.0.0",
  "description": "Continuous Integration automated Node target engine",
  "main": "index.js",
  "scripts": {
    "test": "jest",
    "lint": "eslint ."
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "devDependencies": {
    "eslint": "^10.6.0",
    "jest": "^30.4.2"
  }
}

```

### File: `eslint.config.js`

```javascript
module.exports = [
    {
        files: ["**/*.js"],
        languageOptions: {
            sourceType: "commonjs",
            globals: {
                test: "readonly",
                expect: "readonly",
                module: "readonly",
                require: "readonly"
            }
        },
        rules: {
            "no-unused-vars": "error",
            "no-undef": "error"
        }
    }
];

```

### File: `index.js` & `index.test.js`

```javascript
// index.js
function tambah(a, b) {
  return a + b;
}
module.exports = tambah;

// index.test.js
const tambah = require('./index');
test('adds 1 + 2 to equal 3', () => {
  expect(tambah(1, 2)).toBe(3);
});

```

### File: `.github/workflows/ci.yml`

```yaml
name: CI Pipeline Lengkap

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Cache Dependencies
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-

      - name: Install Dependencies
        run: npm ci

      - name: Run Linter
        run: npm run lint

  test:
    runs-on: ubuntu-latest
    needs: lint
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js Versi ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Cache Dependencies
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-

      - name: Install Dependencies
        run: npm ci

      - name: Run Tests
        run: npm run test

  security:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Run Security Scan
        run: npm audit --audit-level=moderate

  build:
    runs-on: ubuntu-latest
    needs: [test, security]
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm ci

      - name: Build Application
        run: |
          mkdir dist
          cp index.js dist/
          echo "Build version: ${{ github.sha }}" > dist/build-info.txt

      - name: Upload Build Artifact
        uses: actions/upload-artifact@v4
        with:
          name: production-build
          path: dist/
          retention-days: 7

```

---

## 5. Engineering Retrospective & Lessons Learned

* **Syntax & Module Incompatibilities:** Initially, configuring modern ECMA export parameters (`export default`) inside flat configuration environments while code assets were packaged under standard CommonJS paradigms (`module.exports`) triggered hard compilation breaks. This was resolved by re-scoping global mappings and enforcing common runtime schemas across linter config arrays.
* **Structural Failures in Workflow YAML:** Plain-text, un-hashed notation strings placed inside system arrays without direct comment identifiers (`#`) confuse GitHub's structural workflow compiler. Strict tracking, modular segmentation, and standard syntax validations are key when deploying automation jobs.
* **Incomplete Perimeter Defenses:** Activating status-checks blocks without establishing `Require a pull request before merging` rules leaves codebases vulnerable to administrative overrides via terminal push sequences, bypassing the automation entirely. Combining status validations with mandatory pull request rules ensures robust branch protection.
