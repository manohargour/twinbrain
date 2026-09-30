// Twin Brain — Organisational Change Intelligence
// Core Semantic Engine, Unified Context, and Explainability Causal Graph
'use strict';

(function(global) {
  const g = global.GTM;
  if (!g) {
    console.error('Twin Brain core requires window.GTM');
    return;
  }

  // --- 1. UNIFIED PROJECT CONTEXT (Prompt Section 7) ---
  const OWNERS = [
    { id: 'analytics-lead', name: 'Analytics Lead', team: 'Analytics', role: 'Audience definition & identity rules' },
    { id: 'measurement-lead', name: 'Measurement Lead', team: 'Analytics', role: 'Experimentation & causal lift' },
    { id: 'bi-owner', name: 'BI Owner', team: 'Analytics', role: 'Reporting specifications & dashboards' },
    { id: 'gtm-lead', name: 'GTM Lead', team: 'GTM', role: 'Segmentation, channels & capacity' },
    { id: 'product-marketing', name: 'Product Marketing', team: 'GTM', role: 'Master messaging, positioning & CTA' },
    { id: 'sales-partner-ops', name: 'Sales / Partner Operations', team: 'GTM', role: 'Account assignment, routing & suppression' },
    { id: 'enablement-lead', name: 'Enablement Lead', team: 'Enablement', role: 'Training curriculum & methodology' },
    { id: 'field-enablement', name: 'Field Enablement', team: 'Enablement', role: 'Call guide, objections & QA rubric' },
    { id: 'operations-manager', name: 'Operations Manager', team: 'Enablement', role: 'Agent readiness roster & certifications' },
    { id: 'programme-manager', name: 'Programme Manager', team: 'Programme', role: 'Launch gates, scope decisions & cutover' },
    { id: 'product-security-legal', name: 'Product + Security + Legal', team: 'Programme', role: 'Technical claims, architecture & safety boundaries' },
    { id: 'local-lead-us', name: 'US Market Lead', team: 'Localization', role: 'US local strategy & motion QA' },
    { id: 'local-lead-uk', name: 'UK Market Lead', team: 'Localization', role: 'UK local strategy & motion QA' },
    { id: 'local-lead-de', name: 'Germany Market Lead', team: 'Localization', role: 'DE language QA & local delivery' },
    { id: 'local-lead-fr', name: 'France Market Lead', team: 'Localization', role: 'FR language QA & local delivery' }
  ];

  const DEPENDENCIES = [
    // Upstream Business Change links
    { from: 'CHANGE_PROPOSAL', to: 'AUDIENCE_FILTER', relationship: 'defines', strength: 'hard', source: 'declared' },
    { from: 'CHANGE_PROPOSAL', to: 'MARKET_SCOPE', relationship: 'defines', strength: 'hard', source: 'declared' },
    { from: 'CHANGE_PROPOSAL', to: 'INACTIVITY_RULE', relationship: 'defines', strength: 'hard', source: 'declared' },

    // Audience & Inactivity dependencies
    { from: 'AUDIENCE_FILTER', to: 'A1', relationship: 'governs audience policy', strength: 'hard', source: 'declared' },
    { from: 'INACTIVITY_RULE', to: 'A1', relationship: 'governs inactivity filter', strength: 'hard', source: 'declared' },
    { from: 'A1', to: 'A4', relationship: 'supplies cohort denominator', strength: 'hard', source: 'declared' },
    { from: 'A1', to: 'A2', relationship: 'supplies population & estimand', strength: 'hard', source: 'declared' },
    { from: 'A1', to: 'G1', relationship: 'defines target accounts', strength: 'hard', source: 'declared' },
    { from: 'A1', to: 'G3', relationship: 'supplies account manifests', strength: 'hard', source: 'declared' },
    { from: 'A1', to: 'E1', relationship: 'defines customer profile to train', strength: 'soft', source: 'declared' },

    // GTM & Enablement flow
    { from: 'G1', to: 'G2', relationship: 'defines segment value propositions', strength: 'hard', source: 'declared' },
    { from: 'G2', to: 'E2', relationship: 'informs call guide scripts', strength: 'hard', source: 'declared' },
    { from: 'E1', to: 'E3', relationship: 'curriculum needed for roster certification', strength: 'hard', source: 'declared' },
    { from: 'E2', to: 'E3', relationship: 'rubric required for agent assessment', strength: 'hard', source: 'declared' },

    // Market & Localization flow
    { from: 'MARKET_SCOPE', to: 'L-US', relationship: 'authorizes US rollout', strength: 'hard', source: 'declared' },
    { from: 'MARKET_SCOPE', to: 'L-UK', relationship: 'authorizes UK rollout', strength: 'hard', source: 'declared' },
    { from: 'MARKET_SCOPE', to: 'L-DE', relationship: 'authorizes Germany rollout', strength: 'hard', source: 'declared' },
    { from: 'MARKET_SCOPE', to: 'L-FR', relationship: 'authorizes France rollout', strength: 'hard', source: 'declared' },
    { from: 'L-US', to: 'E3', relationship: 'supplies US agent readiness', strength: 'hard', source: 'declared' },
    { from: 'L-UK', to: 'E3', relationship: 'supplies UK agent readiness', strength: 'hard', source: 'declared' },
    { from: 'L-DE', to: 'E3', relationship: 'supplies Germany agent readiness', strength: 'hard', source: 'declared' },
    { from: 'L-FR', to: 'E3', relationship: 'supplies France agent readiness', strength: 'hard', source: 'declared' },

    // Launch readiness gate dependencies
    { from: 'A1', to: 'P1', relationship: 'requires signed policy', strength: 'hard', source: 'declared' },
    { from: 'A2', to: 'P1', relationship: 'requires measurement sign-off', strength: 'hard', source: 'declared' },
    { from: 'G3', to: 'P1', relationship: 'requires suppression manifest', strength: 'hard', source: 'declared' },
    { from: 'E3', to: 'P1', relationship: 'requires certified agents', strength: 'hard', source: 'declared' },
    { from: 'L-US', to: 'P1', relationship: 'requires local US sign-off', strength: 'hard', source: 'declared' },
    { from: 'L-UK', to: 'P1', relationship: 'requires local UK sign-off', strength: 'hard', source: 'declared' },
    { from: 'L-DE', to: 'P1', relationship: 'requires local Germany sign-off', strength: 'hard', source: 'declared' },
    { from: 'L-FR', to: 'P1', relationship: 'requires local France sign-off or suppression', strength: 'hard', source: 'declared' },

    // Independent prerequisite
    { from: 'P2', to: 'P1', relationship: 'independent prerequisite check', strength: 'hard', source: 'declared' }
  ];

  function getProgramContext(config, version) {
    const activeConfig = config || g.BASE;
    const currentVer = version || 1;

    const baseArtifacts = g.ARTIFACTS.map(a => ({
      id: a.id,
      name: a.title,
      team: a.team,
      owner: a.owner,
      version: `v${currentVer}`,
      content: g.content(a.id, activeConfig),
      dependencies: a.deps,
      approvalStatus: currentVer > 1 ? 'PENDING_REVIEW' : 'BASELINE_APPROVED',
      source: {
        type: 'fixture',
        id: `SRC-${a.id}-v${currentVer}`,
        url: `gtm://artifacts/${a.id}/v${currentVer}`
      }
    }));

    // Add local packs
    const localPacks = g.MARKETS.map(m => ({
      id: `L-${m.id}`,
      name: `${m.name} Local Enablement Pack`,
      team: 'Localization',
      owner: `${m.id} Market Lead`,
      version: `v${currentVer}`,
      content: `Locale: ${m.locale}. Agents: ${m.agents}. Strategy: Source-linked to v${currentVer}.`,
      dependencies: ['audience', 'markets'],
      approvalStatus: activeConfig.markets.includes(m.id) ? 'PENDING_QA' : 'RETIRED',
      source: {
        type: 'fixture',
        id: `SRC-LOCALE-${m.id}-v${currentVer}`,
        url: `gtm://locales/${m.id}/v${currentVer}`
      }
    }));

    return {
      program: {
        id: 'PROG-CONNECT-DATA',
        name: 'Connect on-premises data directly on ChatGPT',
        version: currentVer,
        objective: 'Help eligible business accounts evaluate and adopt on-premises data connectivity safely, with a measurable and supportable path to first value.',
        currentAudience: activeConfig
      },
      artifacts: [...baseArtifacts, ...localPacks],
      markets: g.MARKETS,
      owners: OWNERS,
      dependencies: DEPENDENCIES,
      approvals: [
        { id: 'app-analytics', name: 'Analytics Workstream Review', required: true, status: 'pending' },
        { id: 'app-gtm', name: 'GTM Workstream Review', required: true, status: 'pending' },
        { id: 'app-enablement', name: 'Enablement Workstream Review', required: true, status: 'pending' },
        { id: 'app-pm', name: 'PM Acceptance Gate', required: true, status: 'pending' }
      ],
      readiness: [
        { id: 'gate-pm', name: 'PM Scope Decision', status: 'pending' },
        { id: 'gate-central', name: 'Central Workstream Reviews', status: 'pending' },
        { id: 'gate-local', name: 'Local Strategy & Language QA', status: 'pending' },
        { id: 'gate-training', name: 'Agent Assessment Completion', status: 'pending' },
        { id: 'gate-suppress', name: 'Market Retirement & Suppression', status: 'pending' },
        { id: 'gate-prereq', name: 'Independent Product / Security Prerequisite', status: 'pending' }
      ],
      versions: [
        { version: 1, type: 'Seeded baseline', config: g.BASE }
      ]
    };
  }

  // --- 2. GEMINI INTERPRETATION STAGE (Prompt Sections 4 & 5) ---
  function interpretChange(promptText) {
    if (!promptText || typeof promptText !== 'string') {
      return {
        change_summary: 'Empty change request',
        changes: [],
        ambiguities: [],
        requires_confirmation: false
      };
    }

    const text = promptText.trim();
    const lower = text.toLowerCase();
    const changes = [];
    const ambiguities = [];

    // Ambiguity Check 1: "Low producers"
    if (lower.includes('low producer') || lower.includes('low-producer')) {
      ambiguities.push({
        term: 'Low producers',
        issue: '“Low producers” is not defined in the current programme charter.',
        potential_definition: 'active seats / licensed seats < 20% during the previous 30 days (Low adoption)',
        resolution: 'Map to low-adoption audience filter (< 20% threshold)',
        resolvedConfig: { audience: 'low', threshold: 20 }
      });
    }

    // Ambiguity Check 2: "Inactive users" without days
    if ((lower.includes('inactive') || lower.includes('inactivity')) && 
        !lower.includes('90') && !lower.includes('days') && !lower.includes('month') && !lower.includes('exclude')) {
      ambiguities.push({
        term: 'Inactive users',
        issue: '“Inactive users” does not specify an inactivity day threshold.',
        potential_definition: 'Exclude accounts with no activity for 90+ days (Churn-like behavioral proxy)',
        resolution: 'Exclude accounts with days_since_activity >= 90',
        resolvedConfig: { excludeChurn: true }
      });
    }

    // 1. Audience Filter
    const isLowAdoption = lower.includes('low-adoption') || 
                          lower.includes('low adoption') || 
                          lower.includes('narrowing the initial launch') || 
                          lower.includes('narrow to low') ||
                          lower.includes('low producer');
    
    const isAllAudience = lower.includes('all customers') || 
                          lower.includes('all paying') || 
                          lower.includes('all business accounts') || 
                          lower.includes('expand to all') ||
                          lower.includes('broad audience');

    if (isLowAdoption) {
      // Check for explicit threshold like "30%", "40%"
      let threshold = 20;
      const threshMatch = lower.match(/(\d{1,2})\s*%/);
      if (threshMatch) {
        threshold = parseInt(threshMatch[1], 10);
      }
      changes.push({
        type: 'audience_filter',
        field: 'adoption',
        operation: 'low_adoption_only',
        value: true,
        threshold: threshold,
        confidence: 0.97
      });
    } else if (isAllAudience) {
      changes.push({
        type: 'audience_filter',
        field: 'adoption',
        operation: 'all_paying_accounts',
        value: true,
        confidence: 0.98
      });
    }

    // 2. Inactivity Exclusion
    const hasInactive = lower.includes('inactive') || 
                        lower.includes('inactivity') || 
                        lower.includes('churn') || 
                        lower.includes('no usage');
    
    if (hasInactive) {
      let days = 90;
      const daysMatch = lower.match(/(\d+)\s*(days|day)/);
      if (daysMatch) {
        days = parseInt(daysMatch[1], 10);
      }
      changes.push({
        type: 'audience_filter',
        field: 'inactive_days',
        operation: 'exclude_greater_than_or_equal',
        value: days,
        confidence: 0.94
      });
    }

    // 3. Market Scope Changes
    // France removal
    if (lower.includes('remove france') || 
        lower.includes('drop france') || 
        lower.includes('exclude france') || 
        lower.includes('without france') ||
        lower.includes('no france')) {
      changes.push({
        type: 'market_scope',
        operation: 'remove',
        value: 'FR',
        confidence: 0.99
      });
    }

    // Germany removal
    if (lower.includes('remove germany') || 
        lower.includes('drop germany') || 
        lower.includes('exclude germany') || 
        lower.includes('without germany')) {
      changes.push({
        type: 'market_scope',
        operation: 'remove',
        value: 'DE',
        confidence: 0.99
      });
    }

    // UK removal
    if (lower.includes('remove uk') || lower.includes('drop uk') || lower.includes('exclude uk')) {
      changes.push({
        type: 'market_scope',
        operation: 'remove',
        value: 'UK',
        confidence: 0.99
      });
    }

    // US removal
    if (lower.includes('remove us') || lower.includes('drop us') || lower.includes('exclude us')) {
      changes.push({
        type: 'market_scope',
        operation: 'remove',
        value: 'US',
        confidence: 0.99
      });
    }

    // Phase: In-flight vs Pre-launch
    let phase = 'prelaunch';
    if (lower.includes('in flight') || lower.includes('in-flight') || lower.includes('already launched') || lower.includes('already contacted')) {
      phase = 'inflight';
    }

    // Summary synthesis
    let summaryParts = [];
    if (isLowAdoption) summaryParts.push('Narrow audience to low-adoption accounts');
    if (hasInactive) summaryParts.push('Exclude inactive accounts (90+ days)');
    const removedMarkets = changes.filter(c => c.type === 'market_scope' && c.operation === 'remove').map(c => c.value);
    if (removedMarkets.length > 0) summaryParts.push(`Remove ${removedMarkets.join(', ')} from launch scope`);
    if (isAllAudience) summaryParts.push('Expand audience to all paying accounts');

    const change_summary = summaryParts.length > 0 
      ? summaryParts.join(', ')
      : 'Review proposed programme scope parameters';

    return {
      change_summary,
      changes,
      ambiguities,
      requires_confirmation: true,
      phase
    };
  }

  function mapToConfig(parsed, currentConfig) {
    const base = currentConfig ? JSON.parse(JSON.stringify(currentConfig)) : JSON.parse(JSON.stringify(g.BASE));
    let next = { ...base };

    // Apply audience changes
    const adoptionChange = parsed.changes.find(c => c.type === 'audience_filter' && c.field === 'adoption');
    if (adoptionChange) {
      if (adoptionChange.operation === 'low_adoption_only') {
        next.audience = 'low';
        next.threshold = adoptionChange.threshold || 20;
      } else if (adoptionChange.operation === 'all_paying_accounts') {
        next.audience = 'all';
      }
    }

    // Apply inactivity exclusion
    const inactivityChange = parsed.changes.find(c => c.type === 'audience_filter' && c.field === 'inactive_days');
    if (inactivityChange) {
      next.excludeChurn = true;
    }

    // Apply market changes
    const marketRemovals = parsed.changes.filter(c => c.type === 'market_scope' && c.operation === 'remove');
    if (marketRemovals.length > 0) {
      const toRemove = new Set(marketRemovals.map(c => c.value));
      next.markets = next.markets.filter(m => !toRemove.has(m));
    }

    // Handle ambiguities auto-applied if user confirmed
    if (parsed.ambiguities && parsed.ambiguities.length > 0 && parsed.confirmedAmbiguities) {
      for (const amb of parsed.ambiguities) {
        if (amb.resolvedConfig) {
          next = { ...next, ...amb.resolvedConfig };
        }
      }
    }

    return next;
  }

  // --- 3. IMPACT CATEGORIZATION & REASONING (Prompt Sections 8, 9, 10, 11) ---
  function analyzeImpact(oldConfig, newConfig, phase = 'prelaunch') {
    const rawImpact = g.makeImpact(oldConfig, newConfig, phase);
    const oldPop = g.population(oldConfig);
    const newPop = g.population(newConfig);
    const oldCounts = g.counts(oldConfig);
    const newCounts = g.counts(newConfig);

    const audienceChanged = oldConfig.audience !== newConfig.audience || 
                            oldConfig.threshold !== newConfig.threshold || 
                            oldConfig.excludeChurn !== newConfig.excludeChurn;
    const marketsChanged = oldConfig.markets.join(',') !== newConfig.markets.join(',');

    const items = [];

    // Process central artifacts
    for (const a of rawImpact.items) {
      let category = 'UNAFFECTED';
      let action = 'No change required.';
      let reason = a.reason;

      if (a.status === 'must') {
        category = 'MUST_CHANGE';
      } else if (a.status === 'review') {
        category = 'OWNER_REVIEW';
      } else {
        category = 'UNAFFECTED';
      }

      // Semantic Action & Reason enrichment
      if (a.id === 'A1') {
        category = 'MUST_CHANGE';
        reason = `Current audience definition includes all retained accounts (${oldCounts.eligible}). The proposed change restricts this to low-adoption accounts (${newCounts.eligible}) and excludes 90+ day inactive accounts.`;
        action = 'Create audience definition v2 and validate boundary conditions against synthetic accounts.';
      } else if (a.id === 'A2') {
        category = 'OWNER_REVIEW';
        reason = `Existing assumptions were developed against a population of ${oldCounts.eligible} accounts. The proposed cohort contains ${newCounts.eligible} accounts.`;
        action = 'Analytics owner must review sample size, statistical power, strata, and denominator assumptions. [Restraint: Twin Brain does not claim the experiment is invalid].';
      } else if (a.id === 'A3') {
        category = 'UNAFFECTED';
        reason = 'Audience narrowing does not change event semantics or telemetry contracts. Existing schema already supports programme_version and audience_snapshot_id.';
        action = 'No change required. Validate event schema in integration, not a rewrite.';
      } else if (a.id === 'A4') {
        category = 'MUST_CHANGE';
        reason = `Dashboards track v1 baseline (${oldCounts.eligible} accounts). Reporting must slice by immutable version and preserve separate denominators for reach and activation.`;
        action = 'Build v2 funnel dashboard slices; ensure prior cohort denominators are retained and not overwritten.';
      } else if (a.id === 'G1') {
        category = 'OWNER_REVIEW';
        reason = 'Audience narrowing concentrates outreach on low-adoption administrators. Channel capacity, sales vs partner routing, and touchpoint volume require adjustment.';
        action = 'GTM lead must review buyer role discovery paths and align channel ownership for concentrated cohort.';
      } else if (a.id === 'G2') {
        category = 'OWNER_REVIEW';
        reason = 'Current value proposition was drafted for general enterprise evaluation. Low-adoption accounts require a specific adoption-readiness discovery CTA.';
        action = 'Review copy fit for low-adoption teams; ensure draft CTA invites readiness discussion without over-promising production availability.';
      } else if (a.id === 'G3') {
        category = 'MUST_CHANGE';
        reason = `Existing campaign manifest references audience v1 containing ${oldCounts.eligible} accounts. Proposed cohort reduces population to ${newCounts.eligible} accounts.`;
        action = `Generate a v2 audience manifest (${newCounts.eligible} accounts) and suppress excluded accounts from new dispatch.`;
      } else if (a.id === 'E1') {
        category = 'MUST_CHANGE';
        reason = 'Enablement modules currently teach broad feature discovery. Must retrain agents on diagnosing low-adoption obstacles and objection handling.';
        action = 'Update targeting and discovery modules; align knowledge checks to low-adoption rubric.';
      } else if (a.id === 'E2') {
        category = 'OWNER_REVIEW';
        reason = 'Call guide script currently uses generic opening questions. Opening questions should probe what prevented team usage.';
        action = 'Field enablement must review call guide scripts and update the QA scoring rubric for low-adoption discovery.';
      } else if (a.id === 'E3') {
        category = 'MUST_CHANGE';
        reason = 'Prior agent certifications are invalid for the revised audience scope and updated curriculum.';
        action = 'Invalidate prior certifications; record completion of v2 assessment across all assigned agents.';
      } else if (a.id === 'P1') {
        category = 'MUST_CHANGE';
        reason = 'All previous baseline sign-offs were bound to v1 scope. Boundary change automatically re-opens the launch gate.';
        action = 'PM must accept v2 change for preparation and coordinate sign-offs across leads before activation.';
      } else if (a.id === 'P2') {
        category = 'UNAFFECTED';
        reason = 'Audience narrowing does not change the technical capability or security guarantees offered by the product.';
        action = 'No change required. Product/security boundary remains an independent prerequisite.';
      }

      items.push({
        id: a.id,
        name: a.title,
        team: a.team,
        owner: a.owner,
        category,
        reason,
        action,
        beforeContent: a.before,
        afterContent: a.after,
        deps: a.deps,
        populationDelta: ['A1', 'A2', 'A4', 'G3'].includes(a.id) 
          ? { before: oldCounts.eligible, after: newCounts.eligible } 
          : null
      });
    }

    // Process market / localization packs
    for (const m of rawImpact.locales) {
      if (m.status === 'retire') {
        items.push({
          id: `L-${m.id}`,
          name: `${m.name} Enablement Pack`,
          team: 'Localization',
          owner: `${m.id} Market Lead`,
          category: 'MUST_CHANGE',
          reason: `${m.name} has been removed from launch scope but currently has active rollout content and ${m.agents} assigned agents.`,
          action: 'Retire future distribution and cancel pending enablement while retaining historical evidence and customer audit trail.',
          marketId: m.id,
          agents: m.agents,
          status: m.status
        });
      } else if (m.status === 'new') {
        items.push({
          id: `L-${m.id}`,
          name: `${m.name} Enablement Pack (${m.locale})`,
          team: 'Localization',
          owner: `${m.id} Market Lead`,
          category: 'MUST_CHANGE',
          reason: `${m.name} is newly added to launch scope.`,
          action: 'Create new local enablement pack, conduct language QA, and onboard local agents.',
          marketId: m.id,
          agents: m.agents,
          status: m.status
        });
      }
    }

    // Compute Executive Summary counts (Prompt Section 8)
    const mustChangeCount = items.filter(i => i.category === 'MUST_CHANGE').length;
    const ownerReviewCount = items.filter(i => i.category === 'OWNER_REVIEW').length;
    const unaffectedCount = items.filter(i => i.category === 'UNAFFECTED').length;
    const totalImpacts = mustChangeCount + ownerReviewCount;

    return {
      rawImpact,
      items,
      summary: {
        totalImpacts,
        mustChangeCount,
        ownerReviewCount,
        unaffectedCount,
        headline: `${totalImpacts} downstream impacts detected`,
        subline: `${mustChangeCount} Must change · ${ownerReviewCount} Need owner review · ${unaffectedCount} Unaffected`
      },
      counts: {
        old: oldCounts,
        new: newCounts,
        removedAccounts: rawImpact.removed.length,
        addedAccounts: rawImpact.added.length
      },
      budget: g.budget(newConfig, rawImpact, 60, 0.5)
    };
  }

  // --- 4. PLAN → REALITY MATRIX (Prompt Section 12) ---
  function computePlanRealityMatrix(oldConfig, newConfig) {
    const oldCounts = g.counts(oldConfig);
    const newCounts = g.counts(newConfig);
    const rawImpact = g.makeImpact(oldConfig, newConfig, 'prelaunch');
    const budget = g.budget(newConfig, rawImpact, 60, 0.5);

    const oldMarketsStr = oldConfig.markets.join(' ');
    const newMarketsStr = newConfig.markets.join(' ');

    const rows = [
      {
        metric: 'Audience Population',
        before: `${oldCounts.eligible} accounts`,
        after: `${newCounts.eligible} accounts`,
        delta: newCounts.eligible < oldCounts.eligible 
          ? `-${oldCounts.eligible - newCounts.eligible} accounts (-${Math.round((1 - newCounts.eligible/oldCounts.eligible)*100)}%)` 
          : 'No change',
        status: newCounts.eligible !== oldCounts.eligible ? 'must' : 'no'
      },
      {
        metric: 'Markets in Scope',
        before: oldMarketsStr,
        after: newMarketsStr,
        delta: oldMarketsStr !== newMarketsStr ? 'Scope modified' : 'Unchanged',
        status: oldMarketsStr !== newMarketsStr ? 'must' : 'no'
      },
      {
        metric: 'France Rollout Status',
        before: oldConfig.markets.includes('FR') ? 'Active' : 'Not in scope',
        after: newConfig.markets.includes('FR') ? 'Active' : 'Retire / Suppress',
        delta: (oldConfig.markets.includes('FR') && !newConfig.markets.includes('FR')) ? 'Retire & suppress' : 'Unchanged',
        status: (oldConfig.markets.includes('FR') && !newConfig.markets.includes('FR')) ? 'must' : 'no'
      },
      {
        metric: 'Experiment Assumptions',
        before: `v1 (${oldCounts.eligible} accounts)`,
        after: newCounts.eligible !== oldCounts.eligible ? 'Review required' : 'v1 valid',
        delta: newCounts.eligible !== oldCounts.eligible ? 'Sample power & strata affected' : 'Unchanged',
        status: newCounts.eligible !== oldCounts.eligible ? 'review' : 'no'
      },
      {
        metric: 'GTM Campaign Manifest',
        before: `v1 (${oldCounts.eligible} accounts)`,
        after: newCounts.eligible !== oldCounts.eligible ? 'Regenerate manifest (v2)' : 'v1 valid',
        delta: newCounts.eligible !== oldCounts.eligible ? `${newCounts.eligible} active / ${rawImpact.removed.length} suppressed` : 'Unchanged',
        status: newCounts.eligible !== oldCounts.eligible ? 'must' : 'no'
      },
      {
        metric: 'Agent Training & Roster',
        before: 'Current (34 agents certified)',
        after: rawImpact.changed ? `Partially stale (${budget.agents} agents affected)` : 'Current',
        delta: rawImpact.changed ? `${budget.training}h retraining required` : 'Unchanged',
        status: rawImpact.changed ? 'must' : 'no'
      },
      {
        metric: 'Programme Readiness Gate',
        before: 'Pending initial checks',
        after: rawImpact.changed ? 'Reopened (Pending demo gates)' : 'Pending',
        delta: rawImpact.changed ? 'All prior sign-offs invalidated' : 'Unchanged',
        status: rawImpact.changed ? 'must' : 'no'
      },
      {
        metric: 'Illustrative Rework Labour',
        before: '0 hours (£0)',
        after: rawImpact.changed ? `${budget.total} hours (£${budget.cost.toLocaleString('en-GB')})` : '0 hours (£0)',
        delta: rawImpact.changed ? `${budget.central}h central + ${budget.local}h local + ${budget.training}h training` : '£0',
        status: rawImpact.changed ? 'review' : 'no'
      }
    ];

    return rows;
  }

  // --- 5. EXPLAINABILITY: "SHOW WHY" CAUSAL GRAPH (Prompt Section 14) ---
  function explainWhy(itemId, analysis) {
    const item = analysis.items.find(i => i.id === itemId);
    if (!item) {
      return {
        id: itemId,
        title: itemId,
        category: 'UNKNOWN',
        chain: ['Unknown artifact ID'],
        rationale: 'No explanation available.'
      };
    }

    let chain = [];
    let rationale = '';

    switch (itemId) {
      case 'L-FR':
        chain = [
          'Master Brief v1 (Initial Mandate includes FR)',
          'Market Scope Decision: Remove France from rollout',
          'France Localized Pack (L-FR) marked for retirement',
          'Suppression gate required for 8 assigned French agents',
          'Historical audit trail preserved, outreach blocked'
        ];
        rationale = 'France was removed from the launch scope in the proposed change. Existing localized assets and queued communications must be retired and suppressed to prevent outreach to French accounts, while maintaining historical audit records.';
        break;

      case 'A1':
        chain = [
          'Natural Language Change Request: Narrow audience',
          'Adoption & Inactivity Boundary Rules Extracted',
          'A1 Audience Definition & Membership Policy v2',
          'Synthetic Account Population Snapshot (96 → 24 accounts)'
        ];
        rationale = 'The proposed change alters core targeting rules by restricting eligibility to accounts with < 20% seat adoption and excluding those inactive for 90+ days. A1 is the single source of truth for audience policy.';
        break;

      case 'A2':
        chain = [
          'A1 Audience Definition Policy v2',
          'Target Population reduced from 96 to 24 accounts',
          'Statistical Power & Minimum Detectable Effect compromised',
          'A2 Measurement Plan Assumptions require owner review'
        ];
        rationale = 'The original measurement plan assumed 96 accounts to achieve statistical power for causal lift. Narrowing to 24 accounts (18 in active markets) substantially alters the sample size, power, and strata. The measurement owner must review assumptions rather than Twin Brain automatically invalidating the test.';
        break;

      case 'A3':
        chain = [
          'Audience Targeting Boundary Filter',
          'Commercial Eligibility Layer',
          'A3 Telemetry Contract (Independent Architecture)'
        ];
        rationale = 'Audience narrowing does not alter event semantics, telemetry payloads, or connection success definitions. The existing telemetry schema already includes programme_version and audience_snapshot_id fields, requiring no schema rewrite.';
        break;

      case 'A4':
        chain = [
          'A1 Audience Definition Snapshot v2',
          'Denominator Change (96 → 24 eligible accounts)',
          'A4 Reporting Specification & Funnel Dashboard'
        ];
        rationale = 'Reporting dashboards must use immutable denominators per version. Overwriting baseline counts would corrupt historical conversion metrics; a v2 funnel view must be created.';
        break;

      case 'G1':
        chain = [
          'A1 Audience Policy (Low adoption only)',
          'Account Needs: Focus on adoption blockers vs general evaluation',
          'G1 Segmentation & Channel Plan'
        ];
        rationale = 'Narrowing audience shifts the commercial conversation from broad exploration to re-engagement and barrier diagnosis. Sales and partner capacity must be rebalanced.';
        break;

      case 'G2':
        chain = [
          'G1 Segmentation Plan',
          'Customer Value Proposition & Email Invitations',
          'G2 Master Messaging & Offer'
        ];
        rationale = 'The draft CTA and value proposition were designed for general business workflows. They need owner review to verify whether the copy effectively addresses low-adoption accounts.';
        break;

      case 'G3':
        chain = [
          'A1 Audience Snapshot v2',
          '72 Accounts Excluded from Outreach Universe',
          'G3 Assignment & Suppression Manifest'
        ];
        rationale = 'The live outreach manifest currently contains 96 accounts. 72 excluded accounts must be actively suppressed to prevent sales outreach to disqualified customers.';
        break;

      case 'E1':
        chain = [
          'G2 Master Messaging & Low-Adoption Discovery',
          'Curriculum Modules for Target Recognition',
          'E1 Training Curriculum'
        ];
        rationale = 'Curriculum must be updated to train customer-facing reps on qualifying low-adoption accounts, uncovering workflow bottlenecks, and handling specific objections.';
        break;

      case 'E2':
        chain = [
          'E1 Training Curriculum',
          'Discovery Questions & QA Rubric',
          'E2 Call Guide & Quality Rubric'
        ];
        rationale = 'Rep scripts and coaching rubrics must reflect the new qualifying criteria. Reps should probe why usage stalled rather than pitching generic features.';
        break;

      case 'E3':
        chain = [
          'E1 Curriculum & E2 Script Updates',
          'Prior Agent Certifications Marked Stale',
          'E3 Agent Readiness Roster'
        ];
        rationale = 'Publishing updated materials does not train reps. Prior certifications are invalidated and reps must be reassessed on v2 materials before outreach can begin.';
        break;

      case 'P1':
        chain = [
          'Programmatic Scope Mutation (v1 → v2)',
          'Invalidation of Central & Local Readiness Sign-offs',
          'P1 Launch & Cutover Gate Reopened'
        ];
        rationale = 'All baseline readiness approvals were granted for v1. Changing audience boundaries and market coverage invalidates prior gates; PM must coordinate re-approval.';
        break;

      case 'P2':
        chain = [
          'Target Audience Selection',
          'Commercial Outreach Scope',
          'P2 Product Claims & Security Contract (Independent Boundary)'
        ];
        rationale = 'Audience narrowing does not alter product architecture, supported environments, encryption, or security claims. Product capability remains an independent prerequisite.';
        break;

      case 'L-US':
      case 'L-UK':
      case 'L-DE':
        chain = [
          'Master Brief v2 Scope Change',
          'Source Copy Updates (G2, E2)',
          `${item.name} (${item.marketId || ''}) Stale Link`,
          'Local Strategy & Language QA Re-verification'
        ];
        rationale = `Master scope changes invalidate the source-version parity of the ${item.name}. Local lead must review the updated discovery questions and retrain assigned agents.`;
        break;

      default:
        chain = [
          'Master Scope Change',
          `Direct dependency on ${item.deps ? item.deps.join(' and ') : 'programme policy'}`,
          item.name
        ];
        rationale = item.reason;
    }

    return {
      id: itemId,
      title: item.name,
      team: item.team,
      owner: item.owner,
      category: item.category,
      chain,
      rationale,
      action: item.action
    };
  }

  // --- 6. DEPENDENCY GRAPH DATA (Prompt Section 13) ---
  function getGraphData(analysis) {
    // Generate clean layered DAG nodes structured into 4 clear enterprise swimlanes
    const nodes = [
      // Level 0: Business Change Trigger (Command Banner)
      { id: 'CHANGE', label: 'BUSINESS CHANGE TRIGGER', subtitle: 'Launch narrowing requested (Audience + FR)', type: 'root', status: 'change', level: 0, x: 490, y: 35, width: 280, height: 46 },

      // Level 1: Scope Mutations
      { id: 'AUDIENCE_NODE', label: 'Audience Filter', subtitle: 'Low adoption only (<20%)', type: 'filter', status: 'must', level: 1, x: 240, y: 100, width: 196, height: 46 },
      { id: 'INACTIVITY_NODE', label: 'Inactivity Rule', subtitle: 'Exclude ≥90d inactive', type: 'filter', status: 'must', level: 1, x: 490, y: 100, width: 196, height: 46 },
      { id: 'MARKET_NODE', label: 'Market Scope', subtitle: 'Remove France (FR)', type: 'filter', status: 'must', level: 1, x: 740, y: 100, width: 196, height: 46 },

      // Lane 1: Analytics & Insights (x = 135)
      { id: 'A1', label: 'A1 Audience Definition', subtitle: '96 ➔ 24 Accounts', team: 'Analytics', status: 'must', level: 2, x: 135, y: 205, width: 196, height: 54 },
      { id: 'A2', label: 'A2 Measurement Plan', subtitle: 'Sample power review', team: 'Analytics', status: 'review', level: 3, x: 135, y: 305, width: 196, height: 54 },
      { id: 'A4', label: 'A4 Reporting Spec', subtitle: 'v2 Funnel dashboard', team: 'Analytics', status: 'must', level: 4, x: 135, y: 405, width: 196, height: 54 },
      
      // Lane 2: GTM Strategy & Messaging (x = 370)
      { id: 'G1', label: 'G1 Segmentation Plan', subtitle: 'Barrier re-engagement', team: 'GTM', status: 'review', level: 2, x: 370, y: 205, width: 196, height: 54 },
      { id: 'G2', label: 'G2 Master Messaging', subtitle: 'Value proposition v2', team: 'GTM', status: 'review', level: 3, x: 370, y: 305, width: 196, height: 54 },
      { id: 'G3', label: 'G3 Campaign Manifest', subtitle: 'Suppress 72 accounts', team: 'GTM', status: 'must', level: 4, x: 370, y: 405, width: 196, height: 54 },

      // Lane 3: Field Enablement (x = 605)
      { id: 'E1', label: 'E1 Training Curriculum', subtitle: 'Target qualification', team: 'Enablement', status: 'must', level: 2, x: 605, y: 205, width: 196, height: 54 },
      { id: 'E2', label: 'E2 Rep Call Guide', subtitle: 'Discovery script update', team: 'Enablement', status: 'review', level: 3, x: 605, y: 305, width: 196, height: 54 },
      { id: 'E3', label: 'E3 Agent Roster', subtitle: '34 Reps stale / reassess', team: 'Enablement', status: 'must', level: 4, x: 605, y: 405, width: 196, height: 54 },

      // Lane 4: Localization & Markets (x = 840)
      { id: 'L-FR', label: 'L-FR France Pack', subtitle: 'Retire & cancel 8 reps', team: 'Localization', status: 'must', level: 2, x: 840, y: 205, width: 196, height: 54 },
      { id: 'L-RETAINED', label: 'Retained Packs', subtitle: 'US / UK / DE alignment', team: 'Localization', status: 'review', level: 3, x: 840, y: 305, width: 196, height: 54 },

      // Level 5: Release Gates & Independent Prerequisite
      { id: 'P1', label: 'P1 Launch Readiness Gate', subtitle: 'Reopened · Approvals invalidated', team: 'Programme', status: 'must', level: 5, x: 440, y: 535, width: 280, height: 54 },
      { id: 'P2', label: 'P2 Product & Safety Contract', subtitle: 'Unaffected prerequisite boundary', team: 'Programme', status: 'no', level: 5, x: 770, y: 535, width: 250, height: 54 }
    ];

    const edges = [
      { from: 'CHANGE', to: 'AUDIENCE_NODE' },
      { from: 'CHANGE', to: 'INACTIVITY_NODE' },
      { from: 'CHANGE', to: 'MARKET_NODE' },

      { from: 'AUDIENCE_NODE', to: 'A1' },
      { from: 'INACTIVITY_NODE', to: 'A1' },
      
      // Column 1 vertical flow
      { from: 'A1', to: 'A2' },
      { from: 'A2', to: 'A4' },
      
      // Cross-column cascade
      { from: 'A1', to: 'G1' },
      { from: 'G1', to: 'G2' },
      { from: 'G2', to: 'G3' },
      
      { from: 'G2', to: 'E1' },
      { from: 'E1', to: 'E2' },
      { from: 'E2', to: 'E3' },

      // Market column flow
      { from: 'MARKET_NODE', to: 'L-FR' },
      { from: 'MARKET_NODE', to: 'L-RETAINED' },
      { from: 'L-RETAINED', to: 'E3' },

      // Convergence into P1 Launch Readiness Gate
      { from: 'A4', to: 'P1' },
      { from: 'G3', to: 'P1' },
      { from: 'E3', to: 'P1' },
      { from: 'L-FR', to: 'P1' },
      { from: 'P2', to: 'P1', dashed: true }
    ];

    return { nodes, edges };
  }

  // Export to window
  global.TWIN_BRAIN = {
    interpretChange,
    mapToConfig,
    analyzeImpact,
    computePlanRealityMatrix,
    explainWhy,
    getProgramContext,
    getGraphData,
    OWNERS,
    DEPENDENCIES
  };

})(typeof window !== 'undefined' ? window : global);
