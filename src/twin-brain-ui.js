// Twin Brain — UI Components & Views
'use strict';

(function(global) {
  const g = global.GTM;
  const tb = global.TWIN_BRAIN;
  if (!g || !tb) {
    console.error('Twin Brain UI requires GTM and TWIN_BRAIN on global window');
    return;
  }

  const esc = x => String(x || '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));

  // Visual helper styles for badges
  const categoryBadge = cat => {
    switch (cat) {
      case 'MUST_CHANGE':
        return '<span class="tb-badge tb-badge-must">🔴 Must change</span>';
      case 'OWNER_REVIEW':
        return '<span class="tb-badge tb-badge-review">🟠 Owner review</span>';
      case 'UNAFFECTED':
        return '<span class="tb-badge tb-badge-no">🟢 Unaffected</span>';
      case 'BLOCKED':
        return '<span class="tb-badge tb-badge-blocked">⛔ Blocked</span>';
      default:
        return `<span class="tb-badge">${esc(cat)}</span>`;
    }
  };

  // --- 1. HERO NLP INPUT COMPONENT (Prompt Step 1) ---
  function renderHeroNLP(state) {
    const currentInput = state.nlpInput !== undefined 
      ? state.nlpInput 
      : 'We are narrowing the initial launch to low-adoption enterprise customers. Exclude accounts inactive for 90 days and remove France from the first rollout.';

    return `
      <section class="tb-panel tb-hero">
        <div class="tb-hero-header">
          <div class="tb-eyebrow">Step 1 · Natural-Language Change Input</div>
          <h2 class="tb-hero-title">What changed?</h2>
          <p class="tb-muted">
            Describe a proposed business decision or scope shift in natural language. 
            Twin Brain extracts structured intent, validates domain definitions, and deterministically models downstream blast radius.
          </p>
        </div>

        <div class="tb-input-container">
          <textarea id="tbNlpInput" class="tb-textarea" rows="3" placeholder="e.g. We are narrowing the initial launch to low-adoption enterprise customers. Exclude accounts inactive for 90 days and remove France from the first rollout.">${esc(currentInput)}</textarea>
          
          <div class="tb-chips-label">Quick test scenarios:</div>
          <div class="tb-chips">
            <button type="button" class="tb-chip" data-preset="canonical">
              💡 Narrow to low-adoption (&lt;20%), exclude 90d inactive, remove France
            </button>
            <button type="button" class="tb-chip" data-preset="ambiguous">
              ⚠️ Only target low producers (Clarification demo)
            </button>
            <button type="button" class="tb-chip" data-preset="germany">
              🌐 Remove Germany, exclude inactive, &lt;30% adoption
            </button>
            <button type="button" class="tb-chip" data-preset="expand">
              🔄 Expand to all paying business accounts
            </button>
          </div>

          <div class="tb-hero-actions">
            <button type="button" class="tb-btn tb-btn-primary tb-btn-lg" id="tbAnalyzeBtn">
              <span class="tb-ai-sparkle">✨</span> Analyse Change
            </button>
            <span class="tb-pill tb-pill-subtle">Gemini Semantic Change Interpreter v2.5</span>
          </div>
        </div>
      </section>
    `;
  }

  // --- 2. AMBIGUITY CLARIFICATION DIALOG (Prompt Section 4) ---
  function renderAmbiguityAlert(ambiguities) {
    if (!ambiguities || ambiguities.length === 0) return '';

    return `
      <div class="tb-alert tb-alert-amber" id="tbAmbiguityBox">
        <div class="tb-alert-icon">⚠️</div>
        <div class="tb-alert-content">
          <h4>Clarification required before analysis</h4>
          ${ambiguities.map(a => `
            <div class="tb-ambiguity-item">
              <p><strong>${esc(a.issue)}</strong></p>
              <p>Twin Brain suggests the following standard programme definition:</p>
              <div class="tb-definition-quote">
                <code>${esc(a.potential_definition)}</code>
              </div>
            </div>
          `).join('')}
          <div class="tb-row" style="margin-top: 12px; gap: 10px;">
            <button type="button" class="tb-btn tb-btn-amber" id="tbConfirmAmbiguityBtn">
              ✓ Confirm definition &amp; proceed
            </button>
            <button type="button" class="tb-btn" id="tbEditNlpBtn">
              ✏️ Rephrase input
            </button>
          </div>
          <small class="tb-muted" style="display:block; margin-top: 6px;">
            Human-in-the-loop: Twin Brain never guesses ambiguous business metrics without explicit owner confirmation.
          </small>
        </div>
      </div>
    `;
  }

  // --- 3. INTERPRETATION UI ("CHANGE UNDERSTOOD") (Prompt Section 5) ---
  function renderInterpretationUnderstood(state) {
    const p = state.parsedChange;
    if (!p) return '';

    const oldConfig = state.current;
    const newConfig = state.proposedConfig || tb.mapToConfig(p, oldConfig);

    const oldAudienceText = oldConfig.audience === 'all' ? 'All retained paying accounts' : `Low-adoption accounts (<${oldConfig.threshold}%)`;
    const newAudienceText = newConfig.audience === 'all' ? 'All retained paying accounts' : `Low-adoption retained accounts (<${newConfig.threshold}% seats active)`;

    const oldEligibilityText = oldConfig.excludeChurn ? 'Exclude accounts inactive for 90+ days' : 'No inactivity exclusion';
    const newEligibilityText = newConfig.excludeChurn ? 'Exclude accounts inactive for 90+ days' : 'No inactivity exclusion';

    const oldMarketsText = oldConfig.markets.map(m => ({ US: 'US', UK: 'UK', DE: 'Germany', FR: 'France' }[m] || m)).join(' / ');
    const newMarketsText = newConfig.markets.map(m => ({ US: 'US', UK: 'UK', DE: 'Germany', FR: 'France' }[m] || m)).join(' / ');

    return `
      <section class="tb-panel tb-understood-panel">
        <div class="tb-row spread">
          <div>
            <div class="tb-eyebrow">Step 2 · Gemini Interpretation Stage</div>
            <h3 class="tb-panel-title">Change understood</h3>
          </div>
          <span class="tb-pill ${state.interpretationConfirmed ? 'tb-pill-green' : 'tb-pill-amber'}">
            ${state.interpretationConfirmed ? '✓ Confirmed by User' : 'Awaiting Confirmation'}
          </span>
        </div>

        <p class="tb-summary-text">
          <strong>Summary:</strong> ${esc(p.change_summary)}
        </p>

        <div class="tb-grid tb-grid-3">
          <div class="tb-card tb-diff-card">
            <div class="tb-card-header">Audience Target</div>
            <div class="tb-diff-row">
              <span class="tb-label">Current:</span>
              <span class="tb-val tb-val-old">${esc(oldAudienceText)}</span>
            </div>
            <div class="tb-diff-row">
              <span class="tb-label">Proposed:</span>
              <span class="tb-val tb-val-new">${esc(newAudienceText)}</span>
            </div>
          </div>

          <div class="tb-card tb-diff-card">
            <div class="tb-card-header">Eligibility Rules</div>
            <div class="tb-diff-row">
              <span class="tb-label">Current:</span>
              <span class="tb-val tb-val-old">${esc(oldEligibilityText)}</span>
            </div>
            <div class="tb-diff-row">
              <span class="tb-label">Proposed:</span>
              <span class="tb-val tb-val-new">${esc(newEligibilityText)}</span>
            </div>
          </div>

          <div class="tb-card tb-diff-card">
            <div class="tb-card-header">Market Scope</div>
            <div class="tb-diff-row">
              <span class="tb-label">Current:</span>
              <span class="tb-val tb-val-old">${esc(oldMarketsText)}</span>
            </div>
            <div class="tb-diff-row">
              <span class="tb-label">Proposed:</span>
              <span class="tb-val tb-val-new ${oldMarketsText !== newMarketsText ? 'tb-highlight' : ''}">${esc(newMarketsText)}</span>
            </div>
          </div>
        </div>

        <details class="tb-json-details" style="margin-top: 14px;">
          <summary>View Gemini Structured Output JSON (Confidence &amp; Operations)</summary>
          <pre class="tb-json-block"><code>${esc(JSON.stringify(p, null, 2))}</code></pre>
        </details>

        <div class="tb-row" style="margin-top: 16px; gap: 12px;">
          <button type="button" class="tb-btn tb-btn-primary" id="tbConfirmInterpretationBtn" ${state.interpretationConfirmed ? 'disabled' : ''}>
            ${state.interpretationConfirmed ? '✓ Interpretation Confirmed' : 'Confirm interpretation'}
          </button>
          <button type="button" class="tb-btn" id="tbEditInterpretationBtn">
            Edit parameters
          </button>
        </div>
        <small class="tb-muted" style="display:block; margin-top: 6px;">
          Deterministic calculation &amp; dependency invalidation occur only after human confirmation.
        </small>
      </section>
    `;
  }

  // --- 4. EXECUTIVE SUMMARY COUNTERS (Prompt Section 8) ---
  function renderExecutiveSummary(analysis, currentFilter) {
    const s = analysis.summary;
    const filter = currentFilter || 'all';

    return `
      <section class="tb-executive-banner">
        <div class="tb-row spread" style="align-items: baseline;">
          <div>
            <div class="tb-eyebrow">Step 3 · Deterministic Blast Radius</div>
            <h1 class="tb-impact-headline">${s.headline}</h1>
          </div>
          <div class="tb-pill-group">
            <button type="button" class="tb-filter-chip ${filter === 'all' ? 'active' : ''}" data-filter="all">
              All (${analysis.items.length})
            </button>
            <button type="button" class="tb-filter-chip ${filter === 'MUST_CHANGE' ? 'active' : ''}" data-filter="MUST_CHANGE">
              🔴 Must change (${s.mustChangeCount})
            </button>
            <button type="button" class="tb-filter-chip ${filter === 'OWNER_REVIEW' ? 'active' : ''}" data-filter="OWNER_REVIEW">
              🟠 Owner review (${s.ownerReviewCount})
            </button>
            <button type="button" class="tb-filter-chip ${filter === 'UNAFFECTED' ? 'active' : ''}" data-filter="UNAFFECTED">
              🟢 Unaffected (${s.unaffectedCount})
            </button>
          </div>
        </div>
      </section>
    `;
  }

  // --- 5. PLAN → REALITY VIEW (Prompt Section 12) ---
  function renderPlanRealityMatrix(oldConfig, newConfig) {
    const matrix = tb.computePlanRealityMatrix(oldConfig, newConfig);

    return `
      <section class="tb-panel">
        <div class="tb-row spread">
          <div>
            <div class="tb-eyebrow">Comparison Matrix</div>
            <h3 class="tb-panel-title">Plan → Reality View</h3>
          </div>
          <span class="tb-badge tb-badge-subtle">Baseline v1 vs Proposed v2</span>
        </div>
        <p class="tb-muted">High-contrast comparison of operational commitments versus proposed reality.</p>

        <div class="tb-table-responsive">
          <table class="tb-matrix-table">
            <thead>
              <tr>
                <th style="width: 25%;">Metric / Workstream</th>
                <th style="width: 25%;">BEFORE (Baseline v1)</th>
                <th style="width: 30%;">AFTER (Proposed v2)</th>
                <th style="width: 20%;">Impact State</th>
              </tr>
            </thead>
            <tbody>
              ${matrix.map(row => `
                <tr class="tb-row-${row.status}">
                  <td><strong>${esc(row.metric)}</strong></td>
                  <td class="tb-val-old">${esc(row.before)}</td>
                  <td class="tb-val-new">
                    <strong>${esc(row.after)}</strong>
                    <div class="tb-delta-sub">${esc(row.delta)}</div>
                  </td>
                  <td>
                    ${row.status === 'must' ? '<span class="tb-badge tb-badge-must">Must change</span>' :
                      row.status === 'review' ? '<span class="tb-badge tb-badge-review">Owner review</span>' :
                      '<span class="tb-badge tb-badge-no">Unaffected</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  // --- 6. INTERACTIVE DEPENDENCY GRAPH (Prompt Section 13) ---
  function renderDependencyGraph(analysis) {
    const { nodes, edges } = tb.getGraphData(analysis);

    return `
      <section class="tb-panel">
        <div class="tb-row spread">
          <div>
            <div class="tb-eyebrow">Dependency Graph</div>
            <h3 class="tb-panel-title">Semantic Cascade Architecture</h3>
          </div>
          <div class="tb-legend">
            <span class="tb-badge tb-badge-must">Must change</span>
            <span class="tb-badge tb-badge-review">Owner review</span>
            <span class="tb-badge tb-badge-no">Unaffected</span>
            <span class="tb-badge tb-badge-subtle">Click node for details</span>
          </div>
        </div>
        <p class="tb-muted">
          Directed dependency cascade from business change intent to execution deliverables and readiness gates.
        </p>

        <div class="tb-graph-wrapper">
          <svg viewBox="0 0 800 560" class="tb-graph-svg" id="tbGraphSvg">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#94a3b8" />
              </marker>
              <marker id="arrow-must" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#ef4444" />
              </marker>
            </defs>

            <!-- Render Edges -->
            <g class="tb-graph-edges">
              ${edges.map(e => {
                const src = nodes.find(n => n.id === e.from);
                const tgt = nodes.find(n => n.id === e.to);
                if (!src || !tgt) return '';
                const isMust = tgt.status === 'must';
                return `
                  <line x1="${src.x}" y1="${src.y + 18}" x2="${tgt.x}" y2="${tgt.y - 18}"
                        class="tb-edge ${e.dashed ? 'tb-edge-dashed' : ''} ${isMust ? 'tb-edge-must' : ''}"
                        marker-end="${isMust ? 'url(#arrow-must)' : 'url(#arrow)'}" />
                `;
              }).join('')}
            </g>

            <!-- Render Nodes -->
            <g class="tb-graph-nodes">
              ${nodes.map(n => {
                const isRoot = n.type === 'root';
                const isMust = n.status === 'must';
                const isReview = n.status === 'review';
                const isNo = n.status === 'no';
                const nodeClass = isRoot ? 'tb-node-root' : isMust ? 'tb-node-must' : isReview ? 'tb-node-review' : 'tb-node-no';

                return `
                  <g class="tb-graph-node ${nodeClass}" data-node-id="${n.id}" transform="translate(${n.x}, ${n.y})">
                    <rect x="-75" y="-18" width="150" height="36" rx="6" />
                    <text x="0" y="4" text-anchor="middle" class="tb-node-text">${esc(n.label)}</text>
                  </g>
                `;
              }).join('')}
            </g>
          </svg>
        </div>

        <div id="tbGraphSelection" class="tb-graph-selection-panel" style="display:none;"></div>
      </section>
    `;
  }

  // --- 7. IMPACT CATEGORIES CARDS (Prompt Sections 9, 10, 11) ---
  function renderImpactCards(analysis, currentFilter) {
    const filter = currentFilter || 'all';
    const items = analysis.items.filter(i => filter === 'all' || i.category === filter);

    return `
      <section class="tb-panel">
        <div class="tb-row spread">
          <div>
            <div class="tb-eyebrow">Actionable Impact Register</div>
            <h3 class="tb-panel-title">Detailed Organizational Consequences</h3>
          </div>
          <span class="tb-muted">Showing ${items.length} work items</span>
        </div>

        <div class="tb-cards-list">
          ${items.map(item => `
            <div class="tb-impact-card tb-impact-${item.category.toLowerCase()}" data-item-id="${item.id}">
              <div class="tb-card-top">
                <div class="tb-row spread">
                  <div class="tb-row" style="gap: 10px;">
                    ${categoryBadge(item.category)}
                    <span class="tb-card-id">${esc(item.id)}</span>
                    <h4 class="tb-card-name">${esc(item.name)}</h4>
                  </div>
                  <span class="tb-badge tb-badge-subtle">${esc(item.team)} · ${esc(item.owner)}</span>
                </div>
              </div>

              <div class="tb-card-body">
                <div class="tb-card-field">
                  <span class="tb-field-label">Reason:</span>
                  <div class="tb-field-value tb-reason-text">${esc(item.reason)}</div>
                </div>

                ${item.populationDelta ? `
                  <div class="tb-card-field tb-pop-delta">
                    <span class="tb-field-label">Population Delta:</span>
                    <span class="tb-val-old">${item.populationDelta.before} accounts</span>
                    <span class="tb-arrow">➔</span>
                    <span class="tb-val-new"><strong>${item.populationDelta.after} accounts</strong></span>
                  </div>
                ` : ''}

                <div class="tb-card-field">
                  <span class="tb-field-label">Action Required:</span>
                  <div class="tb-field-value tb-action-text">${esc(item.action)}</div>
                </div>

                <div class="tb-card-footer tb-row spread">
                  <button type="button" class="tb-btn tb-btn-sm tb-btn-why" data-show-why="${esc(item.id)}">
                    🔍 Show why
                  </button>
                  ${item.beforeContent ? `
                    <details class="tb-card-diff-details">
                      <summary>Inspect before / after revisions</summary>
                      <div class="tb-diff-grid">
                        <div class="tb-diff-col">
                          <small>CURRENT TEXT</small>
                          <pre>${esc(item.beforeContent)}</pre>
                        </div>
                        <div class="tb-diff-col">
                          <small>PROPOSED TEXT</small>
                          <pre>${esc(item.afterContent)}</pre>
                        </div>
                      </div>
                    </details>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  // --- 8. EXPLAINABILITY "SHOW WHY" MODAL (Prompt Section 14) ---
  function renderExplainWhyModal(itemId, analysis) {
    const exp = tb.explainWhy(itemId, analysis);

    return `
      <div class="tb-modal-backdrop" id="tbWhyModalBackdrop">
        <div class="tb-modal">
          <div class="tb-modal-header tb-row spread">
            <div>
              <div class="tb-eyebrow">Explainability Engine · Causal Path</div>
              <h3>Why ${esc(exp.title)} ${exp.category === 'MUST_CHANGE' ? 'must change' : exp.category === 'OWNER_REVIEW' ? 'requires owner review' : 'is unaffected'}</h3>
            </div>
            <button type="button" class="tb-btn-close" id="tbCloseWhyModal">&times;</button>
          </div>

          <div class="tb-modal-body">
            <div class="tb-causal-chain">
              <div class="tb-chain-title">Causal Cascade from Business Decision:</div>
              <div class="tb-chain-steps">
                ${exp.chain.map((step, idx) => `
                  <div class="tb-chain-step">
                    <div class="tb-step-num">${idx + 1}</div>
                    <div class="tb-step-content">
                      <strong>${esc(step)}</strong>
                    </div>
                  </div>
                  ${idx < exp.chain.length - 1 ? '<div class="tb-chain-arrow">↓</div>' : ''}
                `).join('')}
              </div>
            </div>

            <div class="tb-panel" style="margin-top: 16px; background: #f8fafc;">
              <h4>Twin Brain Rationale</h4>
              <p>${esc(exp.rationale)}</p>
            </div>

            <div class="tb-panel" style="margin-top: 12px; background: #f0fdf4; border-color: #bbf7d0;">
              <h4>Recommended Action for ${esc(exp.owner || 'Owner')}</h4>
              <p><strong>${esc(exp.action)}</strong></p>
            </div>
          </div>

          <div class="tb-modal-footer tb-row" style="justify-content: flex-end;">
            <button type="button" class="tb-btn tb-btn-primary" id="tbCloseWhyModalBtn">Close explanation</button>
          </div>
        </div>
      </div>
    `;
  }

  // --- 9. HACKATHON PRESENTATION TOUR BAR ---
  function renderTourBar(stepIdx, totalSteps, stepData) {
    if (!stepData) return '';
    return `
      <div class="tb-tour-bar" id="tbTourBar">
        <div class="tb-tour-header">
          <div class="tb-row" style="gap: 10px; align-items: center;">
            <span class="tb-tour-step-badge">Demo Step ${stepIdx + 1} of ${totalSteps}</span>
            <strong style="color: #ffffff; font-size: 15px;">${esc(stepData.title)}</strong>
          </div>
          <button type="button" class="tb-tour-btn-close" id="tbTourExitBtn" title="Exit presentation tour (Esc)">✕</button>
        </div>
        <div class="tb-tour-body">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: #38bdf8; font-weight: 700;">
            🎤 Presenter Talking Point (Read to Judges):
          </div>
          <div class="tb-tour-script">
            "${esc(stepData.script)}"
          </div>
        </div>
        <div class="tb-tour-actions">
          <div>
            ${stepIdx > 0 ? `<button type="button" class="tb-tour-btn" id="tbTourPrevBtn">◀ Previous</button>` : ''}
          </div>
          <div class="tb-row" style="gap: 8px;">
            <button type="button" class="tb-tour-btn" id="tbTourStopBtn">Exit Tour</button>
            <button type="button" class="tb-tour-btn tb-tour-btn-primary" id="tbTourNextBtn">
              ${stepIdx < totalSteps - 1 ? `${esc(stepData.nextLabel || 'Next Step')} ▶` : 'Finish Demo ✓'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Export UI library
  global.TWIN_BRAIN_UI = {
    renderHeroNLP,
    renderAmbiguityAlert,
    renderInterpretationUnderstood,
    renderExecutiveSummary,
    renderPlanRealityMatrix,
    renderDependencyGraph,
    renderImpactCards,
    renderExplainWhyModal,
    renderTourBar
  };

})(typeof window !== 'undefined' ? window : global);
