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
            <div class="tb-eyebrow">Enterprise Dependency Architecture · DAG View</div>
            <h3 class="tb-panel-title">Cross-Organizational Impact Cascade</h3>
          </div>
          <div class="tb-graph-legend">
            <span class="tb-legend-item"><span class="tb-legend-dot tb-dot-must"></span> 🔴 Must change (7)</span>
            <span class="tb-legend-item"><span class="tb-legend-dot tb-dot-review"></span> 🟠 Owner review (4)</span>
            <span class="tb-legend-item"><span class="tb-legend-dot tb-dot-no"></span> 🟢 Unaffected (2)</span>
            <span class="tb-legend-item" style="color:#0284c7; font-weight:600;">🔵 Upstream cause</span>
            <span class="tb-legend-item" style="color:#dc2626; font-weight:600;">🔴 Downstream blast</span>
          </div>
        </div>
        <p class="tb-muted" style="margin-top: 2px; font-size: 13px;">
          Clean departmental swimlane view mapping upstream strategy decisions down to team deliverables and readiness gates. Click any node to highlight its causal blast radius.
        </p>

        <div class="tb-graph-wrapper">
          <svg viewBox="0 0 980 620" class="tb-graph-svg" id="tbGraphSvg">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
              </marker>
              <marker id="arrow-must" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#dc2626" />
              </marker>
              <marker id="arrow-upstream" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7" />
              </marker>
              <marker id="arrow-downstream" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#dc2626" />
              </marker>
              <filter id="nodeShadow" x="-10%" y="-10%" width="120%" height="125%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-opacity="0.06" />
              </filter>
            </defs>

            <!-- Departmental Swimlanes (Background) -->
            <g class="tb-graph-lanes">
              <rect x="25" y="155" width="220" height="310" rx="10" class="tb-lane-bg" />
              <text x="135" y="176" text-anchor="middle" class="tb-lane-title">📊 ANALYTICS & INSIGHTS</text>

              <rect x="260" y="155" width="220" height="310" rx="10" class="tb-lane-bg" />
              <text x="370" y="176" text-anchor="middle" class="tb-lane-title">📢 GTM & STRATEGY</text>

              <rect x="495" y="155" width="220" height="310" rx="10" class="tb-lane-bg" />
              <text x="605" y="176" text-anchor="middle" class="tb-lane-title">🎓 FIELD ENABLEMENT</text>

              <rect x="730" y="155" width="220" height="310" rx="10" class="tb-lane-bg" />
              <text x="840" y="176" text-anchor="middle" class="tb-lane-title">🌍 LOCALIZATION SCOPE</text>

              <!-- Gate lane background -->
              <rect x="300" y="495" width="410" height="95" rx="10" class="tb-lane-bg-gate" />
              <text x="505" y="513" text-anchor="middle" class="tb-lane-title-gate">🏁 CROSS-FUNCTIONAL READINESS RELEASE</text>
            </g>

            <!-- Render Smooth Curved Edges -->
            <g class="tb-graph-edges">
              ${edges.map((e, idx) => {
                const src = nodes.find(n => n.id === e.from);
                const tgt = nodes.find(n => n.id === e.to);
                if (!src || !tgt) return '';
                const isMust = tgt.status === 'must';

                const srcH = src.height || 48;
                const tgtH = tgt.height || 48;
                const x1 = src.x;
                const y1 = src.y + srcH / 2;
                const x2 = tgt.x;
                const y2 = tgt.y - tgtH / 2;

                let d = '';
                if (Math.abs(x1 - x2) < 4) {
                  d = `M ${x1} ${y1} L ${x2} ${y2}`;
                } else {
                  const dy = Math.max(y2 - y1, 20);
                  const cp1y = y1 + dy * 0.45;
                  const cp2y = y2 - dy * 0.45;
                  d = `M ${x1} ${y1} C ${x1} ${cp1y}, ${x2} ${cp2y}, ${x2} ${y2}`;
                }

                return `
                  <path d="${d}"
                        class="tb-edge ${e.dashed ? 'tb-edge-dashed' : ''} ${isMust ? 'tb-edge-must' : ''}"
                        data-edge-index="${idx}"
                        marker-end="${isMust ? 'url(#arrow-must)' : 'url(#arrow)'}" />
                `;
              }).join('')}
            </g>

            <!-- Render Rich Card Nodes -->
            <g class="tb-graph-nodes">
              ${nodes.map(n => {
                const isRoot = n.type === 'root';
                const isFilter = n.type === 'filter';
                const isMust = n.status === 'must';
                const isReview = n.status === 'review';
                const isNo = n.status === 'no';
                
                const nodeClass = isRoot ? 'tb-node-root' :
                                  isFilter ? 'tb-node-filter' :
                                  isMust ? 'tb-node-must' :
                                  isReview ? 'tb-node-review' : 'tb-node-no';

                const w = n.width || 196;
                const h = n.height || 54;
                const halfW = w / 2;
                const halfH = h / 2;

                const statusTag = isRoot ? 'TRIGGER' :
                                  isFilter ? 'SCOPE' :
                                  isMust ? 'MUST CHANGE' :
                                  isReview ? 'REVIEW' : 'UNAFFECTED';

                const teamTag = isRoot ? 'BUSINESS INTENT' :
                                isFilter ? 'POLICY FILTER' :
                                (n.team || 'STRATEGY').toUpperCase();

                if (isRoot) {
                  return `
                    <g class="tb-graph-node ${nodeClass}" data-node-id="${n.id}" transform="translate(${n.x}, ${n.y})">
                      <rect x="${-halfW}" y="${-halfH}" width="${w}" height="${h}" rx="8" class="tb-node-rect" filter="url(#nodeShadow)" />
                      <rect x="${-halfW}" y="${-halfH}" width="5" height="${h}" rx="2" class="tb-node-stripe" />
                      <text x="0" y="-7" text-anchor="middle" class="tb-node-title" style="fill:#ffffff; font-size:11.5px; font-weight:700;">⚡ ${esc(n.label)}</text>
                      <text x="0" y="11" text-anchor="middle" class="tb-node-subtitle" style="fill:#94a3b8; font-size:9.5px;">${esc(n.subtitle)}</text>
                    </g>
                  `;
                }

                if (isFilter) {
                  return `
                    <g class="tb-graph-node ${nodeClass}" data-node-id="${n.id}" transform="translate(${n.x}, ${n.y})">
                      <rect x="${-halfW}" y="${-halfH}" width="${w}" height="${h}" rx="8" class="tb-node-rect" filter="url(#nodeShadow)" />
                      <rect x="${-halfW}" y="${-halfH}" width="5" height="${h}" rx="2" class="tb-node-stripe" />
                      <text x="${-halfW + 12}" y="-7" class="tb-node-title" style="font-size:11px; font-weight:700;">${esc(n.label)}</text>
                      <text x="${halfW - 10}" y="-7" text-anchor="end" class="tb-node-tag">${statusTag}</text>
                      <text x="${-halfW + 12}" y="11" class="tb-node-subtitle" style="font-size:9.5px;">${esc(n.subtitle)}</text>
                    </g>
                  `;
                }

                // Standard 3-line Deliverable Card: Line 1 (Team & Tag), Line 2 (Title), Line 3 (Subtitle)
                return `
                  <g class="tb-graph-node ${nodeClass}" data-node-id="${n.id}" transform="translate(${n.x}, ${n.y})">
                    <rect x="${-halfW}" y="${-halfH}" width="${w}" height="${h}" rx="8" class="tb-node-rect" filter="url(#nodeShadow)" />
                    <rect x="${-halfW}" y="${-halfH}" width="5" height="${h}" rx="2" class="tb-node-stripe" />
                    
                    <!-- Line 1: Department Tag (Left) and Status Tag (Right) -->
                    <text x="${-halfW + 12}" y="-12" class="tb-node-team">${esc(teamTag)}</text>
                    <text x="${halfW - 10}" y="-12" text-anchor="end" class="tb-node-tag">${statusTag}</text>
                    
                    <!-- Line 2: Deliverable Title (Dedicated Line, Full Width) -->
                    <text x="${-halfW + 12}" y="4" class="tb-node-title">${esc(n.label)}</text>
                    
                    <!-- Line 3: Metric / Subtitle (Dedicated Line, Full Width) -->
                    <text x="${-halfW + 12}" y="18" class="tb-node-subtitle">${esc(n.subtitle || '')}</text>
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

  // --- 0. STEP 0: GTM MOTION IDENTIFICATION & ALIGNMENT ---
  function renderGtmMotionTab(state) {
    const motions = g.GTM_MOTIONS || [];
    const selectedId = state.selectedMotion || 'hybrid_sales_assist';
    const m = motions.find(opt => opt.id === selectedId) || motions[0] || {};
    const c = state.current || g.BASE;
    const n = g.counts(c);

    return `
      <section class="tb-panel">
        <div class="tb-row spread" style="margin-bottom: 8px;">
          <div>
            <div class="tb-eyebrow">Step 0 · Strategic GTM Foundation</div>
            <h2 style="margin: 4px 0 6px; font-size: 24px; color: var(--ink);">GTM Motion Identification &amp; Alignment</h2>
            <p class="tb-muted" style="margin: 0;">
              Identify the commercial motion, structure core operational inputs, and define tangible business outcomes before starting execution workflows.
            </p>
          </div>
          <button type="button" class="tb-btn tb-btn-primary" data-switch-tab="intelligence">
            Proceed to Step 1 · AI Change Intelligence →
          </button>
        </div>
      </section>

      <!-- Motion Selection Cards -->
      <section class="tb-panel">
        <div class="tb-row spread" style="margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 17px;">Select or Compare GTM Motions</h3>
          <span class="tb-badge ${m.id === 'hybrid_sales_assist' ? 'tb-badge-no' : 'tb-badge-review'}">${esc(m.badge || '')}</span>
        </div>
        <p class="tb-muted" style="font-size: 13.5px; margin-bottom: 14px;">
          Choose a commercial motion profile to see how target inputs, operating mechanics, and business outcomes align across the organisation:
        </p>

        <div class="tb-motion-cards">
          ${motions.map(opt => `
            <div class="tb-motion-card ${opt.id === m.id ? 'active' : ''}" data-select-motion="${esc(opt.id)}">
              <div class="tb-row spread" style="margin-bottom: 6px;">
                <strong style="color: var(--ink); font-size: 14.5px;">${esc(opt.name)}</strong>
                <span class="tb-badge ${opt.id === 'hybrid_sales_assist' ? 'tb-badge-no' : 'tb-badge-review'}">${esc(opt.tag)}</span>
              </div>
              <p style="font-size: 13px; line-height: 1.45; margin-bottom: 8px; color: var(--muted);">${esc(opt.summary)}</p>
              <small class="tb-muted" style="font-size: 12px;"><strong>Best fit:</strong> ${esc(opt.bestFor)}</small>
            </div>
          `).join('')}
        </div>

        <div class="tb-alert tb-alert-good" style="margin-top: 14px; background: #eef6f2; border: 1px solid #c2e0cf; border-radius: 6px; padding: 14px 18px;">
          <strong style="color: #12604d; font-size: 14.5px;">Active Motion Profile: ${esc(m.name)}</strong> — ${esc(m.summary)}
          <div style="margin-top: 8px; font-size: 13px; color: #1e3a32; line-height: 1.6;">
            <div><strong>Primary Buyer Persona:</strong> ${esc(m.buyerPersona || '')}</div>
            <div><strong>Engagement Touchpoints:</strong> ${esc(m.touchpoints || '')}</div>
            <div><strong>Cadence &amp; Rules:</strong> ${esc(m.cadence || '')}</div>
          </div>
        </div>
      </section>

      <!-- Key Operational Inputs -->
      <section class="tb-panel">
        <div class="tb-row spread" style="margin-bottom: 12px;">
          <div>
            <h3 style="margin: 0; font-size: 17px;">Key Operational Inputs</h3>
            <p class="tb-muted" style="margin: 2px 0 0; font-size: 13px;">Structured baseline inputs required by business functions (Sales, RevOps, Product, Legal) to activate this motion.</p>
          </div>
          <span class="tb-badge">Input Configuration</span>
        </div>

        <div class="tb-inputs-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 14px;">
          <div class="tb-input-box" style="background: white; border: 1px solid var(--line); border-radius: 6px; padding: 16px;">
            <h4 style="margin: 0 0 8px; color: #12604d; font-size: 14.5px;">1 · Account Universe &amp; ICP</h4>
            <p style="margin: 0 0 6px; font-size: 13px;"><strong>Baseline Universe:</strong> 96 active paying accounts across 4 markets (US, UK, DE, FR).</p>
            <p style="margin: 0 0 6px; font-size: 13px;"><strong>Target Adoption Tier:</strong> Low-adoption accounts (&lt; 20% active seat ratio in 28d) = <strong>${n.eligible} accounts</strong>.</p>
            <p style="margin: 0 0 6px; font-size: 13px;"><strong>Inactivity Filter:</strong> Exclude 90+ days inactive accounts to preserve sales capacity.</p>
            <p style="margin: 0; font-size: 13px;"><strong>Target Stakeholders:</strong> Workspace Admin (technical credential holder) + Business Line Sponsor (value owner).</p>
          </div>

          <div class="tb-input-box" style="background: white; border: 1px solid var(--line); border-radius: 6px; padding: 16px;">
            <h4 style="margin: 0 0 8px; color: #12604d; font-size: 14.5px;">2 · Channel &amp; Delivery Architecture</h4>
            <p style="margin: 0 0 6px; font-size: 13px;"><strong>First-Touch Channel:</strong> Owned email invitation (<code class="mono">owned_email</code>) with explicit consent check.</p>
            <p style="margin: 0 0 6px; font-size: 13px;"><strong>Second-Touch Channel:</strong> Trained Account Executive / Solutions Architect qualification call (<code class="mono">account_team</code>).</p>
            <p style="margin: 0 0 6px; font-size: 13px;"><strong>Contact Permission Guard:</strong> Independent permission flag required (<strong>${n.contactable}</strong> of ${n.eligible} accounts contactable).</p>
            <p style="margin: 0; font-size: 13px;"><strong>Suppression Cadence:</strong> Max 2 touches / 30 days. Holdout accounts (<strong>${n.holdout}</strong>) suppressed from all outreach.</p>
          </div>

          <div class="tb-input-box" style="background: white; border: 1px solid var(--line); border-radius: 6px; padding: 16px;">
            <h4 style="margin: 0 0 8px; color: #12604d; font-size: 14.5px;">3 · Technical &amp; Governance Prereqs</h4>
            <p style="margin: 0 0 6px; font-size: 13px;"><strong>On-Premises Readiness:</strong> Customer network firewall &amp; SSO connector verified (<strong>${n.ready}</strong> accounts ready).</p>
            <p style="margin: 0 0 6px; font-size: 13px;"><strong>Product Safety Contract (P2):</strong> Experimental scenario only. Zero unauthorized data residency or security claims.</p>
            <p style="margin: 0 0 6px; font-size: 13px;"><strong>Measurement Stratification:</strong> 80% outreach arm (<strong>${n.outreach}</strong> accounts) vs 20% clean holdout arm (<strong>${n.holdout}</strong> accounts).</p>
            <p style="margin: 0; font-size: 13px;"><strong>Trial-Ready Accounts:</strong> <strong>${n.trialReady} accounts</strong> currently satisfy contact permission, outreach arm, and technical readiness.</p>
          </div>

          <div class="tb-input-box" style="background: white; border: 1px solid var(--line); border-radius: 6px; padding: 16px;">
            <h4 style="margin: 0 0 8px; color: #12604d; font-size: 14.5px;">4 · Field Enablement &amp; Localization</h4>
            <p style="margin: 0 0 6px; font-size: 13px;"><strong>Field Capacity:</strong> 34 assigned agents across 4 active markets (US: 12, UK: 6, DE: 8, FR: 8).</p>
            <p style="margin: 0 0 6px; font-size: 13px;"><strong>Readiness Standard:</strong> 100% agent completion of versioned module + call guide + scored role-play assessment.</p>
            <p style="margin: 0 0 6px; font-size: 13px;"><strong>Market Adaptation:</strong> 4 native-language packs (L-US, L-UK, L-DE, L-FR) with localized strategy and escalation paths.</p>
            <p style="margin: 0; font-size: 13px;"><strong>Illustrative Labour Assumption:</strong> £60/hr blended cost; 0.5h retraining per agent on version change.</p>
          </div>
        </div>
      </section>

      <!-- Target Business Outcomes -->
      <section class="tb-panel">
        <div class="tb-row spread" style="margin-bottom: 12px;">
          <div>
            <h3 style="margin: 0; font-size: 17px;">Target Business Outcomes</h3>
            <p class="tb-muted" style="margin: 2px 0 0; font-size: 13px;">Measurable success criteria and non-negotiable boundaries defined in language familiar to executive leadership.</p>
          </div>
          <span class="tb-badge">Success Criteria</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; margin-top: 14px;">
          <div class="tb-outcome-col" style="background: white; border: 1px solid var(--line); border-radius: 6px; padding: 16px;">
            <h4 style="margin: 0 0 12px; color: #12604d; font-size: 14.5px;">Value Creation Outcomes (Topline &amp; Retention)</h4>
            ${(m.outcomes?.primary || []).map(o => `
              <div class="tb-outcome-item" style="border-left: 3px solid #12604d; padding: 8px 12px; background: #fcfdfc; margin-bottom: 10px; border-radius: 0 4px 4px 0; border-top: 1px solid #f0f4f1; border-right: 1px solid #f0f4f1; border-bottom: 1px solid #f0f4f1;">
                <strong style="display: block; font-size: 13.5px; color: var(--ink);">${esc(o.metric)}</strong>
                <div style="font-weight: 600; font-size: 12px; color: #12604d; margin-top: 2px;">Target: ${esc(o.target)}</div>
                <p style="margin: 4px 0 0; font-size: 12px; color: var(--muted);">${esc(o.desc)}</p>
              </div>
            `).join('')}
          </div>

          <div class="tb-outcome-col" style="background: white; border: 1px solid var(--line); border-radius: 6px; padding: 16px;">
            <h4 style="margin: 0 0 12px; color: #b45309; font-size: 14.5px;">Operational Velocity &amp; Efficiency</h4>
            ${(m.outcomes?.operational || []).map(o => `
              <div class="tb-outcome-item" style="border-left: 3px solid #b45309; padding: 8px 12px; background: #fffcf5; margin-bottom: 10px; border-radius: 0 4px 4px 0; border-top: 1px solid #fef3c7; border-right: 1px solid #fef3c7; border-bottom: 1px solid #fef3c7;">
                <strong style="display: block; font-size: 13.5px; color: var(--ink);">${esc(o.metric)}</strong>
                <div style="font-weight: 600; font-size: 12px; color: #b45309; margin-top: 2px;">Target: ${esc(o.target)}</div>
                <p style="margin: 4px 0 0; font-size: 12px; color: var(--muted);">${esc(o.desc)}</p>
              </div>
            `).join('')}

            <h4 style="margin: 16px 0 12px; color: #b91c1c; font-size: 14.5px;">Non-Negotiable Guardrails (Risk &amp; Trust)</h4>
            ${(m.outcomes?.guardrails || []).map(o => `
              <div class="tb-outcome-item" style="border-left: 3px solid #b91c1c; padding: 8px 12px; background: #fef8f8; margin-bottom: 10px; border-radius: 0 4px 4px 0; border-top: 1px solid #fee2e2; border-right: 1px solid #fee2e2; border-bottom: 1px solid #fee2e2;">
                <strong style="display: block; font-size: 13.5px; color: var(--ink);">${esc(o.metric)}</strong>
                <div style="font-weight: 600; font-size: 12px; color: #b91c1c; margin-top: 2px;">Target: ${esc(o.target)}</div>
                <p style="margin: 4px 0 0; font-size: 12px; color: var(--muted);">${esc(o.desc)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Workflow Alignment Matrix -->
      <section class="tb-panel">
        <div class="tb-row spread" style="margin-bottom: 12px;">
          <div>
            <h3 style="margin: 0; font-size: 17px;">Workflow Alignment: How Step 0 Drives the End-to-End System</h3>
            <p class="tb-muted" style="margin: 2px 0 0; font-size: 13px;">Click any step below to navigate directly to its deliverables, operational constraints, and live governance controls:</p>
          </div>
          <span class="tb-badge">Interactive Workflow Navigator</span>
        </div>

        <div style="display: grid; gap: 10px; margin-top: 14px;">
          <div class="tb-align-step active" data-switch-tab="motion" style="display: flex; gap: 14px; align-items: center; padding: 12px 16px; border: 2px solid #12604d; border-radius: 6px; background: #eef6f2; cursor: pointer;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #12604d; color: white; font-weight: bold; display: grid; place-items: center; flex-shrink: 0; font-size: 13px;">0</div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 2px; font-size: 14px; color: var(--ink);">Step 0 · GTM Motion &amp; Alignment (Current Screen)</h4>
              <p style="margin: 0; font-size: 13px; color: var(--muted);">Sets the commercial paradigm (<strong>${esc(m.name)}</strong>), target personas (Admin + Business Sponsor), and key business outcomes.</p>
            </div>
            <div style="font-size: 12px; font-weight: 600; color: #12604d; white-space: nowrap;">Current Screen · Selected Motion ✓</div>
          </div>

          <div class="tb-align-step" data-switch-tab="intelligence" style="display: flex; gap: 14px; align-items: center; padding: 12px 16px; border: 1px solid var(--line); border-radius: 6px; background: white; cursor: pointer;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #2563eb; color: white; font-weight: bold; display: grid; place-items: center; flex-shrink: 0; font-size: 13px;">1</div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 2px; font-size: 14px; color: var(--ink);">Step 1 · AI Change Intelligence (Natural Language Blast Radius)</h4>
              <p style="margin: 0; font-size: 13px; color: var(--muted);">Express upstream policy shifts in natural language. Gemini extracts structured intent and computes the exact cross-functional blast radius.</p>
            </div>
            <div style="font-size: 12px; font-weight: 600; color: #2563eb; white-space: nowrap;">Navigate to Step 1 →</div>
          </div>

          <div class="tb-align-step" data-switch-tab="charter" style="display: flex; gap: 14px; align-items: center; padding: 12px 16px; border: 1px solid var(--line); border-radius: 6px; background: white; cursor: pointer;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #0284c7; color: white; font-weight: bold; display: grid; place-items: center; flex-shrink: 0; font-size: 13px;">2</div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 2px; font-size: 14px; color: var(--ink);">Step 2 · Programme Charter</h4>
              <p style="margin: 0; font-size: 13px; color: var(--muted);">Codifies the GTM motion into the master brief (<code class="mono">brief_version=1</code>), frozen audience contract, and 4-market rollout matrix.</p>
            </div>
            <div style="font-size: 12px; font-weight: 600; color: #0284c7; white-space: nowrap;">Navigate to Step 2 →</div>
          </div>

          <div class="tb-align-step" data-switch-tab="workstreams" style="display: flex; gap: 14px; align-items: center; padding: 12px 16px; border: 1px solid var(--line); border-radius: 6px; background: white; cursor: pointer;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #4f46e5; color: white; font-weight: bold; display: grid; place-items: center; flex-shrink: 0; font-size: 13px;">3</div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 2px; font-size: 14px; color: var(--ink);">Step 3 · Team Work Breakdown</h4>
              <p style="margin: 0; font-size: 13px; color: var(--muted);">Decomposes the GTM motion inputs into 12 living operational artifacts owned by Analytics (A1–A4), GTM (G1–G3), Enablement (E1–E3), and Programme (P1–P2).</p>
            </div>
            <div style="font-size: 12px; font-weight: 600; color: #4f46e5; white-space: nowrap;">Navigate to Step 3 →</div>
          </div>

          <div class="tb-align-step" data-switch-tab="readiness" style="display: flex; gap: 14px; align-items: center; padding: 12px 16px; border: 1px solid var(--line); border-radius: 6px; background: white; cursor: pointer;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #059669; color: white; font-weight: bold; display: grid; place-items: center; flex-shrink: 0; font-size: 13px;">4</div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 2px; font-size: 14px; color: var(--ink);">Step 4 · Version-Specific Readiness</h4>
              <p style="margin: 0; font-size: 13px; color: var(--muted);">Enforces multi-gate approval (PM acceptance, workstream review, local language QA, agent certification, and technical safety contract) before activating the motion.</p>
            </div>
            <div style="font-size: 12px; font-weight: 600; color: #059669; white-space: nowrap;">Navigate to Step 4 →</div>
          </div>

          <div class="tb-align-step" data-switch-tab="history" style="display: flex; gap: 14px; align-items: center; padding: 12px 16px; border: 1px solid var(--line); border-radius: 6px; background: white; cursor: pointer;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #64748b; color: white; font-weight: bold; display: grid; place-items: center; flex-shrink: 0; font-size: 13px;">5</div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 2px; font-size: 14px; color: var(--ink);">Step 5 · History &amp; Audit Trail</h4>
              <p style="margin: 0; font-size: 13px; color: var(--muted);">Exports an immutable record of all version iterations, ensuring the rationale for every GTM policy shift remains transparent and reproducible.</p>
            </div>
            <div style="font-size: 12px; font-weight: 600; color: #64748b; white-space: nowrap;">Navigate to Step 5 →</div>
          </div>
        </div>

        <div class="tb-row" style="margin-top: 20px; gap: 12px;">
          <button type="button" class="tb-btn tb-btn-primary" data-switch-tab="intelligence">
            ⚡ Proceed to Step 1 · AI Change Intelligence →
          </button>
          <a href="GTM-Change-Lab.html" class="tb-btn" style="text-decoration: none; color: inherit; display: inline-flex; align-items: center; gap: 6px;">
            🔬 Open Interactive GTM Change Lab
          </a>
        </div>
      </section>
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
    renderGtmMotionTab,
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

