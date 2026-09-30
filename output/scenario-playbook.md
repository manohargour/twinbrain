# GTM change-impact simulator — scenario playbook

## 1. Read this first

**Fictional tabletop exercise, not a MiMa LTD announcement.** The user plays a programme manager at MiMa LTD; this is not an employment claim. “Connect your own on-premises data directly on ChatGPT” is a hypothetical feature label, not a real product capability. Nothing here describes MiMa LTD’s actual operating processes, launch coverage, security guarantees or legal position.

**Provenance:** the mandate and audience-change problem come from the user. Fixture IDs, market selection, staffing, effort inputs, operational definitions, workflow gates, example copy, event names, experiment choices and deadlines are **assistant-proposed simulation assumptions, not user-supplied measurements or customer-validated facts**. “Low producers” is mapped to *low adoption* solely for this fictional SaaS example. No web research or external evidence is used.

Today, the user and Mano build and test a standalone local console. Its purpose is to expose downstream dependencies, decisions and approval gaps when an upstream audience policy changes. The prototype uses **deterministic fixture rules**, not real NLP, customer integrations, campaign execution or approval automation. The implemented console accepts structured controls, not free-text change requests. A future natural-language layer must ask for clarification rather than silently turning ambiguous text into policy.

The initial mandate is broad consideration: all existing business customer accounts using ChatGPT may be considered. The synthetic baseline models these as retained paying accounts. Neither statement means every account is technically ready, legally eligible, targetable or approved for connection.

## 2. Master brief and ownership

**Baseline brief snippet:** `brief_version=1; programme=fictional_onprem; objective=first_authorized_connection_and_meaningful_use; consideration=retained_paying_accounts; markets=US,UK,DE,FR; status=draft`.

Proposed market assumptions are US/en-US, UK/en-GB, Germany/de-DE and France/fr-FR. They are exercise inputs, not actual launch availability. PM owns the versioned master brief and decision log. Locale packs reference that source; they never silently replace it.

| Owner | Work and deliverable | Handoff and acceptance gate |
|---|---|---|
| PM (user’s fictional role) | Baseline scope, dependency register, decisions, change versions, P1 | Sends frozen brief to all leads; every blocker has an owner and evidence requirement before go/no-go |
| Analytics lead | A1–A4, identity rules, reach funnel, experiment, quality checks | Gives GTM immutable audience manifests and reporting definitions; reconciled counts and reviewed denominators required |
| GTM lead | G1–G3, channel plan, segmentation, capacity, suppression | Gives Enablement and local leads approved audience/message instructions; no excluded account in proposed dispatch |
| Enablement lead | E1–E3, delivery plan, assessment and remediation | Gives PM version-specific readiness evidence; attendance alone cannot certify an agent |
| Local market leads | L-US, L-UK, L-DE, L-FR; local channel fit, examples, language QA | Return source-linked approvals and exceptions; translations and operational differentiation reviewed separately |
| Product / Engineering | Capability boundaries, technical readiness, instrumented connection/use flow | Supply evidence to P2 and A3; claims and successful-event semantics must match approved hypothetical design |
| Security / Legal | Authorization/privacy/security questions and jurisdiction-specific review | Supply explicit scoped approvals or blockers to P1/P2; silence is not approval and the simulator gives no legal conclusion |

The console shows fixed role owners, not editable named assignees; these roles do not imply real personnel. Supporting approvals remain independent of PM scheduling authority.

## 3. Audience policy and strict denominators

A1 is the audience source of truth. The console computes targeting, contact permission and technical-readiness flags separately; it does not require technical readiness just to offer a readiness conversation. Actual feature trial access requires its own product and security checks. Preserve a canonical `account_id`; merge aliases using a reviewed mapping before counting, assign at account level and prevent multi-market duplication. Each account has one primary market at assignment. Seats and agents are not accounts.

**Explicit synthetic rules, evaluated at a frozen snapshot:**

- Baseline consideration: retained paying business accounts in the synthetic fixture. It is a consideration universe, not a send list.
- Low adoption: `seats_active_28d / licensed_seats < 0.20`, with `licensed_seats > 0`. Exactly 0.20 is not low adoption. Zero, negative or missing licensed seats, inconsistent seat counts and missing activity evidence enter an unresolved bucket; do not manufacture a ratio.
- Churn-like: no account activity for **at least 90 days**, using `days_since_activity >= 90` at the snapshot. Missing last-activity evidence is unknown, not automatically churn-like. Churn-like is a behavioral proxy, not contractual cancellation.
- Proposed v2: retain only low-adoption accounts, excluding churn-like and high-adoption accounts. For this binary exercise, “high-adoption” means known ratio `>= 0.20`, not a validated commercial label.
- When churn exclusion is checked, it takes precedence: an account with low recent adoption and 95 inactive days is excluded as churn-like. Unchecking exclusion requires an explicit new policy decision; never infer it from a message.

| Population / metric | Frozen meaning and denominator |
|---|---|
| Target population | Distinct accounts satisfying the frozen audience and market policy; 96 in the original fixture, 24 under the proposed low-adoption policy with churn-like exclusion |
| Contact-permitted | Target-population accounts with the independent synthetic contact-permission flag; not necessarily technically ready |
| Technical-ready | Target-population accounts with the independent synthetic readiness flag; actual real-world checklist and trial access still require product/security approval |
| Assigned | The console has stable preassigned outreach/holdout flags for every fixture account, intersected with each target snapshot. A real experiment requires an approved assignment design; retain membership even if not reached |
| Permitted outreach arm | Target-population accounts in the outreach arm with contact permission; technical-ready intersection is a separate reported count |
| Reached | Treatment-assigned accounts with an accepted channel-specific delivery/exposure event; delivery is not proof a human read it |
| Attempted | Assigned accounts with a valid authorized connection-start event; report by arm, including organic holdout attempts |
| Activated | Assigned accounts with both a first successful authorized connection and meaningful first use inside the outcome window; report by arm |

Do not present all populations as one strictly nested reach funnel: an assigned account may attempt organically without a recorded reach. Show that branch explicitly. Reached/treatment-assigned, attempted/assigned and activated/assigned use separate named denominators; reached-to-attempted conversion includes only linked reached accounts. Unknown and late events remain visible.

## 4. Measurement, event contract and learning

A2’s primary hypothesis is **incremental activation from the GTM intervention**, relative to an eligible assigned holdout where appropriate. Proposed design: account-level randomization, stratified by market and pre-change adoption band, with a 14-day outcome window from assignment. This is a proposed real-pilot design, not the implemented fixture allocation: the console uses stable deterministic arm flags and does not establish randomization or statistical power. Analytics must assess volume, power, interference, ethics, consent and operational feasibility before accepting this design. Holdout means no programme outreach, not withholding necessary safety information or an existing product entitlement.

Primary comparison: activation rate among all treatment-assigned eligible accounts minus activation rate among all holdout-assigned eligible accounts, with uncertainty reported. Preserve intention-to-treat membership and flag contamination. A positive difference is not automatic causal proof. If randomization is inappropriate, label results descriptive or observational and state confounding limitations; do not relabel a before/after chart as lift.

**Meaningful first use — proposed:** after a successful authorized connection, a distinct authorized user completes one permitted task using the approved connected test source and receives a successful result. Engineering and Security must approve the technical evidence and safe failure semantics. A connection click, failed query, revoked-access result or unapproved data access never counts as activation.

A3 proposed extension envelope (illustrative, not an ingested event):

```json
{"event_id":"evt-demo-001","event_name":"connection_authorized",
 "account_id":"acct-demo-001","occurred_at":"<UTC timestamp>",
 "received_at":"<UTC timestamp>","schema_version":1,"programme_version":1,
 "assignment_id":"assign-demo-001","audience_snapshot_id":"cohort-v1",
 "assignment_arm":"outreach","market":"US","source_version":1,
 "authorization_verified":true,"connection_id":"conn-demo-001"}
```

The console's A3 source fixture names `programme_assigned`, `outreach_delivered`, `setup_started`, `connection_authorized` and `first_meaningful_use`, with a `deduplication_key`. Proposed implementation extensions include `authorization_failed` and `connection_failed` and the extra envelope fields above. No event processing is implemented. Use a pseudonymous actor reference only where necessary; never log customer content, credentials or raw on-premises data. Contract approval must specify retention, access and deletion handling rather than assume it.

Deduplicate by `event_id`; validate account/assignment joins, timestamp order, authorization evidence and connection/use linkage. Late-event policy is proposed as a seven-day reconciliation period after the outcome window, with provisional labels until closure. Corrections create a revised report with an audit trail, not rewritten historical policy. A4 shows daily operational counts and weekly learning by cohort, policy, market and arm, including exclusions, unknowns, delivery gaps, error rates and safety incidents. Security incidents can block expansion even if activation improves.

## 5. Starter artifact register

These are concrete fixture snippets, not completed production documents. Every artifact needs `id`, `owner`, `version`, `source_version`, `status`, `dependencies`, `acceptance_evidence` and `acknowledged_at`. The console seeds v1 as a fictional planning baseline, not actual approved readiness. The lifecycle below specifies a real implementation; acknowledgment is separate from completion.

| ID / owner | Starter content | Dependency and acceptance evidence |
|---|---|---|
| **A1** Analytics | `consider=retained_paying; low_only=false; exclude_churn=false; snapshot=frozen` | Brief → policy; boundary tests, dedup and unresolved-account review signed |
| **A2** Analytics | `primary=activated/assigned; compare=treatment_vs_holdout; window=14d` | A1/P2 → analysis plan; experiment feasibility and metric dictionary approved |
| **A3** Engineering + Analytics | Event envelope above; activation needs linked authorized success and use | A2/P2 → validated fixture traces, replay/dedup tests and privacy review |
| **A4** Analytics | `group_by=policy_version,cohort_id,market,arm; historical_rewrite=false` | A1–A3 → dashboard; counts reconcile to frozen manifests |
| **G1** GTM | `segments=adoption_band+technical_readiness; channels=owned_email,account_team` | A1/A2 → channel matrix; eligibility, capacity and holdout handling reviewed |
| **G2** GTM | “Explore whether the proposed connected-data workflow fits an approved use case.” | G1/P2 → master copy; no unapproved availability/security claims |
| **G3** GTM operations | `dispatch_requires=audience_policy+contact_permission+outreach_arm+current_suppression_check` | A1/G1 → account assignments; zero excluded IDs in simulated send list |
| **E1** Enablement | Module: qualify account → explain limits → route approval → interpret success | A1/G2/P2 → source-versioned module; safe demo and knowledge checks reviewed |
| **E2** Enablement | “Before discussing setup, confirm eligibility and the approved administrator.” | E1/G2 → call script; objections/escalations tested without invented assurances |
| **E3** Enablement | `ready=module_current AND assessment_pass AND manager_signoff` | E1/E2 → agent roster; current-version evidence and remediation recorded |
| **P1** PM | `launch=blocked_if_any_required_approval_missing` | All required artifacts → gate register; explicit go/no-go with rollback owner |
| **P2** Product; Security/Legal reviewers | `claim=experimental_scenario_only; security_promises=prohibited` | Brief → approved-claims register; scope and permitted wording signed |
| **L-US** US lead | `locale=en-US; source=G2@1,E2@1; spelling=US; channel=account_team` | Master assets → local pack; language and local-motion QA |
| **L-UK** UK lead | `locale=en-GB; source=G2@1,E2@1; spelling=UK; channel=account_team` | Same; local terminology, routing and source-parity QA |
| **L-DE** Germany lead | `locale=de-DE; source=G2@1,E2@1; administrator=Administrator` | Same; native-language reviewer and technical-term QA |
| **L-FR** France lead | `locale=fr-FR; source=G2@1,E2@1; administrator=administrateur` | Same; native-language reviewer and technical-term QA |

## 6. Strategy, localization and training

GTM starts with account needs, not a generic feature blast. G1 separates low-adoption opportunity, administrator readiness, relevant use case and account ownership. Use owned messaging for approved contact-permitted outreach-arm accounts and account-team conversations for qualification. Technical readiness is separately checked before any trial connection, not assumed merely because someone received an invitation. A partner-assisted motion is conditional on an approved relationship, scope, contact permissions and documented account ownership; no partner transfer or outreach happens in this prototype. G3 prevents duplicate sales/partner touches and excludes holdout and suppressed accounts at dispatch time.

**Differentiation is not translation.** A local lead can propose a different approved channel, example, sales sequence or escalation route based on local evidence. Changing “program” to “programme,” or translating a sentence, is language adaptation. Neither grants permission to change eligibility, product claims or legal meaning. Local proposals that alter those return to the master owner and supporting approvers.

Each localized asset stores its master IDs and exact source versions, translator/reviewer, local differences and QA evidence. Master eligibility or claims changes invalidate dependent local approvals even when much text remains identical. Native-language QA checks meaning, omissions, instructions and terminology; operational QA checks segment/channel fit and escalation ownership. No automatic jurisdiction-specific legal assertions are generated.

Enablement delivers a short module plus supervised role-play, then a proposed assessment requiring all safety-critical answers correct and at least 80% overall. Failed agents receive targeted remediation and reassessment. E3 tracks invited, attended, assessed, certified, stale and unavailable separately. A locale pack can pass QA while its agents remain untrained; an agent can attend training while the underlying pack remains blocked. Only current-version certification satisfies readiness.

## 7. Execute the upstream change

PM records: “Consider only low-adoption accounts; exclude churn-like and high-adoption.” First resolve the structured toggles and definitions against A1. Freeze the comparison snapshot, run the simulator and inspect this impact register. **Direct** below means the dependency requires attention, not necessarily automatic rewriting. The console separates **Must change**, **Owner review** and **Unaffected**; measurement and content suitability remain owner judgements. **Conditional** requires the stated trigger; **unaffected** means no change under this specific scenario, not universal immunity.

| Artifact / item | Impact | Required action and gate |
|---|---|---|
| A1 | Direct | Draft v2 policy and exclusion precedence; Analytics approves boundary fixtures |
| A2 | Direct | Recheck population, power, strata and denominators; preserve v1 estimand |
| A3 | Conditional | If existing version/cohort fields suffice, validate without schema change; otherwise version schema and replay test |
| A4 | Direct | Add proposed v2 views and exclusion reasons; retain separate v1 history |
| G1 / G2 | Direct | Re-segment and remove broad-audience wording; reapprove copy against P2 |
| G3 | Direct | Rebuild future manifests and suppress excluded accounts; dispatch dry-run passes |
| E1 / E2 | Direct | Update qualification and objection examples; approve v2 source content |
| E3 | Direct | Mark dependent certification stale; require retraining evidence, not acknowledgments |
| P1 | Direct | Reopen readiness and cutover decision; pending approvals block launch |
| P2 capability wording | Unaffected | Audience narrowing alone grants no new capability; preserve approved boundaries |
| P2 review status | Conditional | Reopen if revised copy implies capability, security or legal claims |
| Included L-US / L-UK / L-DE / L-FR | Direct | Invalidate source-dependent QA; local lead reviews new scope and retraining |
| Dropped market pack | Conditional | Archive active distribution, suppress dispatch, cancel pending enablement; retain audit/history |
| Existing security controls / v1 history | Unaffected | Never weaken controls or rewrite old cohorts to match the new policy |

### Proposed v2 cutover decision

**Implementation boundary:** the console provides acceptance and simulated review/QA/training controls, not the full acknowledged → changed → verified workflow, evidence uploads, authenticated approval, dispatch or rollback execution. In-flight cutover is a required simulation checkbox; the detailed policy below is the proposed operating procedure.

PM can **approve simulation**, **request clarification** or **defer**; simulation approval is not launch approval. Each owner acknowledges impact, then records implementation evidence and reviewer acceptance separately: `proposed → acknowledged → changed → verified → approved`. A checkbox cannot prove changed code, translated copy or completed training.

Cutover is proposed for the next explicitly approved assignment batch, not “immediately.” Freeze its UTC effective time, policy snapshot and new cohort ID only after P1 passes. Pre-assignment accounts use v2. Existing v1 assignments keep their original membership, arm and analytical denominator. PM and GTM may suppress future outreach to now-excluded v1 accounts without deleting them from analysis; log the suppression and contamination implications. Safety restrictions override contact plans regardless of cohort.

Dispatch and first-use availability require the current readiness checks, but historical performance stays attached to its original version. A rollback stops new dispatch/assignments, retains evidence, and requires a fresh decision before any resumed policy; it never silently restores an obsolete send list.

## 8. Illustrative effort model

These are **illustrative design assumptions**, not user measurements, financial forecasts or claimed savings. The console makes hourly cost and per-agent retraining duration editable; central review hours, local review hours and headcounts are fixed fixture inputs: Analytics review 4h; GTM review 3h; Enablement review 3h; each included market local review 2h; each affected agent retraining 0.5h; hourly rate £60. Staffing: US 12, UK 6, DE 8, FR 8.

For the illustrated all-market change, all agents are assumed affected: 34 agents × 0.5h = 17h; local review = 8h; central reviews = 10h; **total 35h, illustrative £2,100**. Formula: `4 + 3 + 3 + 2*included_market_count + 0.5*affected_agent_count`, then multiply by £60. Trigger central reviews only when affected, count each once, and make a no-change run zero rather than automatically charging this template.

Product, engineering, security, legal, PM time, remediation and dropped-market shutdown work are **unestimated**, not free. Removing a market removes its included-market review/retraining assumption but does not erase suppression work. Show these gaps beside the total. No comparison to manual work, avoided cost or ROI is supported.

## 9. Readiness, launch and learning

P1 requires accepted audience/measurement definitions, approved event semantics and claims, reconciled assignment/suppression evidence, current local QA, agent certification, support escalation and explicit supporting approvals. Owners attach evidence, scope and version; PM resolves exceptions visibly rather than converting missing approvals into green status.

A next-stage launch dry-run should check one valid treatment account, one holdout, one unresolved account and one excluded account. The current fixed account fixture does not include missing/invalid records or an executable event-validation pipeline. Only the valid treatment account reaches a proposed outreach queue. No real send or connection is performed. During a later real pilot, monitor authorization failures, unexpected access, duplicate dispatch, stale locale content and event loss; an assigned incident owner can halt rollout. Review operational quality before interpreting activation results, record uncertainty and decide continue, revise or stop without moving the success criteria retrospectively.

## 10. Today: two people and a five-minute demo

**User:** owns baseline brief, policy choices, business definitions, market scope, owner/approval mapping and go/no-go rationale. Reviews wording for misleading capability claims and runs the adversarial acceptance checklist.

**Mano:** can inspect and extend the already-built deterministic dependencies, fixture loading, cohort/version snapshots, effort arithmetic, readiness state transitions and local export. Demonstrates that no network call, real customer data or campaign action is required. Together, compare the console against this playbook and record discrepancies rather than inventing completed work.

**Five-minute walkthrough:**

1. **0:00–1:00:** Show fictional banner, broad-consideration v1, separate readiness/targetability counts and incomplete approvals.
2. **1:00–2:00:** Select low-adoption-only and churn exclusion; inspect threshold and precedence; discuss how future intake should handle unresolved records.
3. **2:00–3:00:** Show direct/conditional/unaffected dependencies, locale invalidation and editable £2,100 illustration.
4. **3:00–4:00:** Accept the change for preparation; demonstrate the simulated gate remains blocked until central reviews, local QA and agent assessments are separately marked complete. These are role-play checks, not real evidence.
5. **4:00–5:00:** Propose v2, preserve v1 history, suppress a dropped market and export the decision/impact record. End with “simulated, not launched.”

## 11. Adversarial acceptance checklist

This is the broader acceptance specification, not a claim that every probe is implemented. The delivered console tests no-op, confirmed definitions, audience boundaries, market removal, approval invalidation, training gates and in-flight cutover. Null/duplicate identity intake, event replay/authorization validation, semantic claim rejection and evidence verification need real ingestion/integration and are not implemented.

| Probe | Expected result |
|---|---|
| No effective change | No invalidation or new version; zero modeled effort. A dedicated no-op audit entry is a future enhancement, not implemented |
| “Low producers only” without confirmed mapping | Needs clarification; no silent classification or dispatch |
| Ratio exactly 0.20; zero/missing seats | Boundary is excluded from low adoption; invalid denominator unresolved |
| Low ratio and exactly 90 inactive days | Churn exclusion wins when checked; reason retained |
| Duplicate account aliases across markets | One canonical account, one assignment; ambiguous identity blocks assignment |
| Change with in-flight v1 cohort | Membership and denominator remain v1; outreach suppression logged separately |
| Master eligibility text changes, translation unchanged | Locale QA stale; old approval cannot clear v2 gate |
| Local QA passes but agents only attended | E3 remains incomplete; certification gate blocked |
| Drop Germany after assignments | New German dispatch suppressed; historical cohort retained; shutdown work disclosed |
| Duplicate/late success, or use without authorization | Duplicate ignored, late status explained, unauthorized event never activates |
| Owner acknowledges every task | Launch still blocked without actual accepted evidence |
| Request “guaranteed secure/compliant” copy | Refuse automatic promise; route to scoped supporting review |

## 12. Before a real-data trial

Obtain an authorized sponsor, approved use case, data access/privacy basis, minimum pseudonymous account fields, canonical identity rules, validated adoption/activity definitions, real capability documentation and named approvers. Agree actual market eligibility, contact permissions, technical readiness, meaningful-use semantics, event retention and access controls. Validate historical data quality, sample-size feasibility, holdout suitability and assignment reproducibility. Establish measured effort inputs, operational incident handling, versioned evidence storage and a bounded rollback plan. Test with approved synthetic or sanitized data first. Only then consider read-only integrations and a separately authorized limited pilot; this prototype supplies neither permission nor production readiness.
