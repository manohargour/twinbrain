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

  // --- 0. STEP 0: SIMPLIFIED GTM MOTIONS PORTFOLIO & WORKFLOW OVERVIEW ---
  function renderGtmMotionTab(state) {
    const motions = [
      {
        id: 'hybrid_sales_assist',
        name: '1. On-Premises Connectivity: Sales-Assisted Adoption (Active Baseline)',
        tag: 'Active Scenario',
        active: true,
        summary: 'Targeted digital outreach to verified workspace admins, backed by consultative Account Executive & Solutions Architect qualification and guided onboarding.',
        personas: 'Workspace Admin (technical credentials) + Business Unit Sponsor (seat ROI)',
        scope: 'US, UK, DE, FR (96 baseline paying accounts, 34 field reps, 20% holdout control arm)',
        outcomes: '≥25% activation within 14d · Lift seat usage <20% to >45% · Protect NRR (+15% expansion)',
        ctaText: 'Launch Active Scenario in Step 1 →',
        badge: 'Interactive Demo Motion'
      },
      {
        id: 'plg_self_serve',
        name: '2. Product-Led Growth (Self-Serve Freemium-to-Paid Conversion)',
        tag: 'In Flight · Self-Serve',
        active: false,
        summary: 'Automated in-app contextual spotlight modals, interactive setup checklists, and 1-click admin self-authorization without field intervention.',
        personas: 'Self-serve Workspace Admins & Power End-Users',
        scope: 'Global freemium workspaces · Automated in-app delivery · Telemetry A/B test',
        outcomes: '≥18% trial-to-active · <15 min time-to-value · >85% support deflection',
        ctaText: 'Managed via Product Analytics (Read Only)',
        badge: 'Company GTM Track'
      },
      {
        id: 'enterprise_abm',
        name: '3. Strategic Account-Based Enterprise Outbound (ABM)',
        tag: 'Live · High-Touch',
        active: false,
        summary: 'Bespoke multi-threaded executive briefings targeting Fortune 500 CISOs and CIOs for private VPC and custom data residency commitments.',
        personas: 'CIO / CISO / VP Enterprise Architecture',
        scope: 'Top 50 global enterprise accounts · Dedicated Enterprise Account Directors',
        outcomes: '100% key account renewal · +50% contract ACV expansion · CISO written sign-off',
        ctaText: 'Managed via Strategic Accounts Team (Read Only)',
        badge: 'Company GTM Track'
      },
      {
        id: 'ecosystem_partner',
        name: '4. Global Systems Integrator (GSI) & Ecosystem Co-Sell',
        tag: 'Active · Partner Channel',
        active: false,
        summary: 'Joint solution co-selling with certified SI partners (Accenture, Deloitte, Slalom) for legacy on-premise ERP/CRM data migrations.',
        personas: 'SI Practice Leads & Client IT Transformation Directors',
        scope: 'Tier-1 SI Partner Network · Certified SI Architecture teams',
        outcomes: '2x faster implementation velocity · £5M+ co-sell pipeline · <2% escalation rate',
        ctaText: 'Managed via Partner Portal (Read Only)',
        badge: 'Company GTM Track'
      },
      {
        id: 'compliance_govcloud',
        name: '5. Regulated Industries & Compliance Trust Tier Upgrade',
        tag: 'Planned H2 · Compliance Track',
        active: false,
        summary: 'Targeted compliance and security certification campaign for financial services, healthcare (HIPAA), and public sector clients requiring dedicated tenancy.',
        personas: 'Chief Compliance Officer & Data Privacy Officer',
        scope: 'Regulated enterprise segment · Legal & InfoSec audit workstreams',
        outcomes: 'Zero audit discrepancies · SOC2 Type II & FedRAMP attestation · 100% renewal in regulated tiers',
        ctaText: 'Planned for H2 Execution (Read Only)',
        badge: 'Company GTM Track'
      }
    ];

    const stepsOverview = [
      {
        step: 1,
        id: 'intelligence',
        name: 'Step 1 · AI Change Intelligence & Simulation',
        summary: 'Express upstream policy shifts in natural language. Gemini extracts structured intent, validates ambiguous terms, and computes the exact blast radius across all departments.',
        components: 'NLP Parser · Ambiguity Probe · Plan vs Reality Matrix · Causal Blast Radius Graph · Categorized Impact Cards',
        badge: 'Step 1'
      },
      {
        step: 2,
        id: 'charter',
        name: 'Step 2 · Programme Charter & Master Brief',
        summary: 'Codifies the active GTM motion into the master brief contract (v1), locked audience boundaries, and 4-market rollout allocation matrix.',
        components: 'Master Brief Contract · 96 Account Targeting Definition · Multi-Market Allocation Matrix (US, UK, DE, FR)',
        badge: 'Step 2'
      },
      {
        step: 3,
        id: 'workstreams',
        name: 'Step 3 · Connected Team Workstreams',
        summary: 'Source-linked operational registry decomposing GTM motion requirements into 12 living deliverables across 4 functional units.',
        components: 'Analytics (A1–A4) · GTM Operations (G1–G3) · Field Enablement (E1–E3) · Programme Governance (P1–P2)',
        badge: 'Step 3'
      },
      {
        step: 4,
        id: 'readiness',
        name: 'Step 4 · Version-Specific Readiness Gates',
        summary: 'Enforces strict cross-functional governance: PM sign-off, workstream acceptance, local market QA, 34-agent certification, and technical safety contracts before release.',
        components: 'Gate 1 (PM Acceptance) · Gate 2 (Workstream Review) · Gate 3 (Market QA & Training) · Gate 4 (Safety Prerequisite)',
        badge: 'Step 4'
      },
      {
        step: 5,
        id: 'history',
        name: 'Step 5 · Governance Ledger & Audit Trail',
        summary: 'Maintains an immutable snapshot record of all baseline versions and approved changes, providing transparent traceability and session data export.',
        components: 'Version Snapshots · Policy Diffs · Session JSON Export · Accounts Dataset CSV Export · Audit Ledger',
        badge: 'Step 5'
      }
    ];

    return `
      <section class="tb-panel">
        <div class="tb-row spread" style="margin-bottom: 8px;">
          <div>
            <div class="tb-eyebrow">Step 0 · Strategic Portfolio Overview</div>
            <h2 style="margin: 4px 0 6px; font-size: 24px; color: var(--ink);">GTM Motion Portfolio &amp; Program Alignment</h2>
            <p class="tb-muted" style="margin: 0;">
              Active commercial motions in flight across MiMa LTD. Only the first motion is active in this simulation console. Click it to launch directly into Step 1.
            </p>
          </div>
          <button type="button" class="tb-btn tb-btn-primary" data-switch-tab="intelligence">
            Launch Active Motion (Step 1) →
          </button>
        </div>
      </section>

      <!-- 5 GTM MOTIONS LIST -->
      <section class="tb-panel">
        <div class="tb-row spread" style="margin-bottom: 12px;">
          <div>
            <h3 style="margin: 0; font-size: 17px;">Five Strategic GTM Motions in Progress</h3>
            <p class="tb-muted" style="margin: 2px 0 0; font-size: 13px;">Motion #1 is the active simulation model connected to Twin Brain:</p>
          </div>
          <span class="tb-badge">5 Active Motions</span>
        </div>

        <div style="display: grid; gap: 12px; margin-top: 14px;">
          ${motions.map(opt => opt.active ? `
            <!-- Motion 1: Active & Clickable -->
            <div class="tb-impact-card" data-switch-tab="intelligence" style="border: 2px solid #12604d; background: #f4faf6; cursor: pointer; padding: 18px; border-radius: 8px; transition: all .15s; box-shadow: 0 2px 8px rgba(18,96,77,0.08);">
              <div class="tb-row spread" style="margin-bottom: 8px;">
                <div class="tb-row" style="gap: 10px; align-items: center;">
                  <span class="tb-badge tb-badge-no" style="font-weight: 700; background: #12604d; color: white;">ACTIVE SCENARIO</span>
                  <strong style="color: #0f172a; font-size: 16px;">${esc(opt.name)}</strong>
                </div>
                <span class="tb-pill tb-pill-green" style="font-weight: 600;">⚡ Click to Launch Step 1</span>
              </div>
              <p style="font-size: 13.5px; line-height: 1.5; color: #1e293b; margin: 0 0 10px;">${esc(opt.summary)}</p>
              <div class="tb-grid tb-grid-3" style="font-size: 12.5px; background: white; border: 1px solid #c2e0cf; border-radius: 6px; padding: 10px 14px; gap: 12px;">
                <div><strong style="color: #12604d;">Target Personas:</strong><br><span style="color: var(--muted);">${esc(opt.personas)}</span></div>
                <div><strong style="color: #12604d;">Commercial Scope:</strong><br><span style="color: var(--muted);">${esc(opt.scope)}</span></div>
                <div><strong style="color: #12604d;">Expected Outcomes:</strong><br><span style="color: var(--muted);">${esc(opt.outcomes)}</span></div>
              </div>
              <div class="tb-row spread" style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #d1fae5;">
                <span style="font-size: 12px; color: #047857; font-weight: 600;">✓ Fully wired into Twin Brain Change Intelligence</span>
                <span class="tb-btn tb-btn-sm tb-btn-primary" style="pointer-events: none;">${esc(opt.ctaText)}</span>
              </div>
            </div>
          ` : `
            <!-- Motions 2-5: Read Only -->
            <div class="tb-impact-card" style="border: 1px solid var(--line); background: #fafafa; opacity: 0.88; padding: 14px 18px; border-radius: 6px;">
              <div class="tb-row spread" style="margin-bottom: 6px;">
                <div class="tb-row" style="gap: 10px; align-items: center;">
                  <span class="tb-badge" style="background: #e2e8f0; color: #475569;">${esc(opt.tag)}</span>
                  <strong style="color: #334155; font-size: 14.5px;">${esc(opt.name)}</strong>
                </div>
                <span class="tb-muted" style="font-size: 12px; font-style: italic;">${esc(opt.badge)}</span>
              </div>
              <p style="font-size: 13px; line-height: 1.45; color: #64748b; margin: 0 0 8px;">${esc(opt.summary)}</p>
              <div style="font-size: 12px; color: #64748b; display: flex; gap: 16px; flex-wrap: wrap;">
                <span><strong>Target:</strong> ${esc(opt.personas)}</span>
                <span><strong>Scope:</strong> ${esc(opt.scope)}</span>
                <span><strong>Expected Lift:</strong> ${esc(opt.outcomes)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- OVERVIEW OF THE 5 STEPS & COMPONENTS (BOTTOM) -->
      <section class="tb-panel">
        <div class="tb-row spread" style="margin-bottom: 12px;">
          <div>
            <h3 style="margin: 0; font-size: 17px;">Twin Brain System Overview: 5 Downstream Stages</h3>
            <p class="tb-muted" style="margin: 2px 0 0; font-size: 13px;">
              Click any step below to jump directly into its live execution console:
            </p>
          </div>
          <span class="tb-badge">Full Workflow Map</span>
        </div>

        <div style="display: grid; gap: 10px; margin-top: 14px;">
          ${stepsOverview.map(s => `
            <div class="tb-align-step" data-switch-tab="${esc(s.id)}" style="display: flex; gap: 14px; align-items: center; padding: 12px 16px; border: 1px solid var(--line); border-radius: 6px; background: white; cursor: pointer; transition: all .15s;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: #12604d; color: white; font-weight: bold; display: grid; place-items: center; flex-shrink: 0; font-size: 14px;">${s.step}</div>
              <div style="flex: 1;">
                <div class="tb-row spread" style="margin-bottom: 2px;">
                  <h4 style="margin: 0; font-size: 14.5px; color: var(--ink);">${esc(s.name)}</h4>
                  <span class="tb-badge" style="font-size: 11px;">${esc(s.badge)}</span>
                </div>
                <p style="margin: 0 0 4px; font-size: 13px; color: var(--muted);">${esc(s.summary)}</p>
                <div style="font-size: 12px; color: #047857; font-weight: 500;">
                  <strong>Core Components:</strong> ${esc(s.components)}
                </div>
              </div>
              <div style="font-size: 12.5px; font-weight: 600; color: #12604d; white-space: nowrap; padding-left: 8px;">
                Open Step ${s.step} →
              </div>
            </div>
          `).join('')}
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

