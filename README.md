# Twin Brain — Organisational Change Intelligence

> **Change something once. Know everything it impacts.**

Twin Brain observes organizational knowledge and dependencies across documents, plans, teams, and approvals. When a business decision changes, Twin Brain determines:
- what downstream work is impacted;
- what must change;
- what merely needs owner review;
- what remains unaffected;
- which approvals or readiness checks are now stale;
- which people or teams need to act;
- why Twin Brain reached each conclusion;
- what actions should happen next.

---

## 🚀 Quick Start

### 1. Open Twin Brain Interface (Primary Demo)
Open `output/Twin-Brain.html` directly in Chrome, Safari, or Edge.
- **Standalone & Offline:** Works 100% offline with zero dependencies, no API keys, and no servers required.
- **Dual-Mode AI:** Runs an embedded high-fidelity semantic change interpreter with full domain ontology, and optionally connects to Google Gemini 2.0/1.5 API if an API key is configured.
- **🎯 2-Min Guided Demo Tour:** Click the glowing `[🎯 2-Min Demo Tour]` button in the top header (or press `Right Arrow ➔`) for an automated presenter walkthrough with judge talking points!

```bash
open output/Twin-Brain.html
```

### 2. Open GTM Change Lab (Baseline Simulation Console)
```bash
open output/GTM-Change-Lab.html
```

---

## 🧠 Twin Brain Architecture

```text
Natural-language change
        ↓
Gemini interpretation stage
        ↓
Structured proposed change (JSON)
        ↓
Human confirmation & clarification
        ↓
Deterministic change engine
        ↓
Cohort / dependency / readiness result
        ↓
Gemini explanation layer ("Why?")
        ↓
Twin Brain UI
```

> **Core Principle:** The LLM interprets and explains. The deterministic engine calculates and enforces.

---

## 🎯 Key Hackathon Capabilities Demonstrated

### 1. Step 1 — Natural Language Change Input
- Large hero input: **"What changed?"**
- Pre-loaded test chips:
  - 💡 *Canonical:* `"We are narrowing the initial launch to low-adoption enterprise customers. Exclude accounts inactive for 90 days and remove France from the first rollout."`
  - ⚠️ *Ambiguity Probe:* `"Only target low producers."`
  - 🌐 *Market Mutation:* `"Remove Germany and target accounts with less than 30% adoption. Exclude inactive for 90 days."`
  - 🔄 *Scope Expansion:* `"Expand to all paying business accounts across all markets."`

### 2. Step 2 & 3 — Gemini Interpretation & Ambiguity Detection
- Converts unstructured requests into a strict structured JSON payload with confidence ratings:
  ```json
  {
    "change_summary": "Narrow initial launch audience and remove France",
    "changes": [
      {
        "type": "audience_filter",
        "field": "adoption",
        "operation": "low_adoption_only",
        "value": true,
        "confidence": 0.97
      },
      {
        "type": "audience_filter",
        "field": "inactive_days",
        "operation": "exclude_greater_than_or_equal",
        "value": 90,
        "confidence": 0.94
      },
      {
        "type": "market_scope",
        "operation": "remove",
        "value": "FR",
        "confidence": 0.99
      }
    ],
    "ambiguities": [],
    "requires_confirmation": true
  }
  ```
- **Ambiguity Boundary Probe:** When undefined business terms like `"low producers"` are entered, Twin Brain does **not** guess. It triggers an interactive clarification modal explaining that *"Low producers is not defined in the current charter"* and offers the verified definition: `active seats / licensed seats < 20% during the previous 30 days`.
- **Change Understood UI:** Displays a structured side-by-side comparison of Audience, Eligibility, and Market Scope with **[Confirm interpretation]** and **[Edit]** controls.

### 3. Step 4 & 5 — Main Output: 13 Downstream Impacts Detected
- **Executive Summary:**
  # 13 downstream impacts detected
  ### 🔴 7 Must change · 🟠 4 Need owner review · 🟢 2 Unaffected
- **Category Classifications:**
  - `MUST_CHANGE` (🔴):
    1. **Audience Definition (A1)** — Analytics Lead (Restricts to low-adoption accounts)
    2. **Reporting Specification (A4)** — BI Owner (Slices by immutable version and separate denominators)
    3. **GTM Campaign Manifest (G3)** — Sales / Partner Ops (Reduces 96 → 24 accounts, generates v2 manifest)
    4. **Training Curriculum (E1)** — Enablement Lead (Refocuses on diagnosing adoption blockers)
    5. **Agent Readiness Roster (E3)** — Operations Manager (Prior certifications invalid; 26 agents require retraining)
    6. **Launch & Cutover Gate (P1)** — PM (Scope mutation automatically re-opens launch gate)
    7. **France Enablement Pack (L-FR)** — France Lead (Retired; suppress outreach queues, retain audit trail)
  - `OWNER_REVIEW` (🟠):
    1. **Experiment Measurement Plan (A2)** — Measurement Lead (Sample size 96 → 24 affects power; Twin Brain does *not* claim experiment is invalid)
    2. **Segmentation & Channel Plan (G1)** — GTM Lead (Rebalance sales vs partner ownership for concentrated cohort)
    3. **Master Messaging & Offer (G2)** — Product Marketing (CTA must shift from broad workflow to readiness inquiry)
    4. **Call Guide & Quality Rubric (E2)** — Field Enablement (Opening questions probe why adoption stalled)
  - `UNAFFECTED` (🟢):
    1. **Product Capability & Safety Contract (P2)** — Product + Security + Legal (Technical capability and security architecture are an independent prerequisite)
    2. **Event Contract (A3)** — Analytics + Engineering (Telemetry schemas already support `programme_version`)

### 4. Step 6 — Plan → Reality View
A high-contrast visual comparison matrix:
- **Audience:** `96 accounts` ➔ `18 accounts` (in active markets)
- **Markets:** `US UK DE FR` ➔ `US UK DE`
- **France rollout:** `Active` ➔ `Retire / Suppress`
- **Experiment assumptions:** `v1` ➔ `Review required`
- **GTM manifest:** `v1` ➔ `Regenerate (v2)`
- **Training:** `Current` ➔ `Partially stale (26 agents affected)`
- **Programme readiness:** `Pending` ➔ `Reopened (Gates blocked)`
- **Rework labour:** `0 hours` ➔ `35 hours (£2,100 illustrative)`

### 5. Step 7 — Interactive Dependency Graph
- Interactive SVG DAG showing the hierarchical blast radius:
  `BUSINESS CHANGE` ➔ `Audience / Inactivity / Market` ➔ `Analytics / GTM / Enablement / Locales` ➔ `Launch Readiness Gate`
- Click any node to open its causal dependency chain, affected owners, and required action!

### 6. Step 8 — Explainability: "Show why"
Every conclusion has a clickable **"Show why"** button that reveals the step-by-step causal cascade:
- **France Enablement Pack:**
  `Master Brief v1` ➔ `Market Scope: Remove France` ➔ `France Localized Pack (L-FR)` ➔ `8 French Agents Suppressed`
- **Measurement Plan:**
  `A1 Audience Policy` ➔ `Population Reduced (96 ➔ 24)` ➔ `Power & Strata Impact` ➔ `Measurement Assumptions Review`
- **Product Claims & Safety:**
  `Audience Targeting` ↛ `Product Capability / Security Architecture (Independent Prerequisite)`

### 7. Step 9 — Governance Readiness Gates & Release
- PM Scope Acceptance
- Central Workstream Reviews (Analytics, GTM, Enablement)
- Local Market Checks & Agent Training (US, UK, DE)
- France Suppression Confirmation
- Independent Product / Security Prerequisite
- Release & Version Cutover to v2 with snapshot in History!

---

## 🧪 Testing & Verification

Run the entire automated verification suite:

```bash
npm test
```

Or run individual test runners:

```bash
# 1. Deterministic engine arithmetic & readiness gate tests (16 tests)
node scripts/test-engine.cjs

# 2. Twin Brain semantic intelligence, ambiguity & explainability tests (7 tests)
node scripts/test-twin-brain.cjs

# 3. Integrated HTML & DOM simulation tests (4 tests)
node scripts/verify-twin-brain-html.cjs
```

Build and refresh distribution bundles:
```bash
npm run build
```

---

## 📁 Repository Structure

```text
├── output/
│   ├── Twin-Brain.html          # Primary standalone hackathon prototype
│   ├── GTM-Change-Lab.html      # Portable simulation console with fallback
│   ├── gtm-change-simulator.html# Authored source HTML with engine & UI
│   └── scenario-playbook.md     # Operational rationale & edge cases
├── src/
│   ├── twin-brain-core.js       # Semantic interpreter, unified context, causal graph
│   └── twin-brain-ui.js         # Reactive components, SVG DAG, Plan-Reality matrix
├── scripts/
│   ├── test-engine.cjs          # Deterministic engine test suite (16 tests)
│   ├── test-twin-brain.cjs      # Twin Brain intelligence test suite (7 tests)
│   ├── verify-twin-brain-html.cjs# HTML integration test suite (4 tests)
│   ├── bundle-twin-brain.cjs    # Bundler for standalone Twin-Brain.html
│   ├── update-simulator.cjs     # Synchronizer for gtm-change-simulator.html
│   └── build-portable.cjs       # Portable packager
└── README.md
```
