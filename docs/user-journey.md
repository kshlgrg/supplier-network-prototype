# Vypaar Saathi User Journey

## Product Intent

Vypaar Saathi is a decision-intelligence prototype for suppliers and procurement teams who need to understand dependency, compare partners, and reduce disruption risk. The prototype should feel useful to a normal operator on day one, not only to an analyst.

The platform should answer four practical questions:

1. Who am I, what do I buy or sell, and what is most critical?
2. Which suppliers and buyers create the most dependency or disruption exposure?
3. What could happen over the next planning horizon if demand, lead times, or supplier availability change?
4. What should I do next to reduce risk without overloading the user with raw data?

## Research-Informed Data Needs

The onboarding and partner forms should collect data only when it supports a clear decision. NIST supply-chain risk guidance emphasizes identifying, assessing, and monitoring supplier-related risk across the lifecycle. CIPS supplier-onboarding guidance highlights due diligence around identity, bank/payment setup, ethical standards, sanctions, compliance, and financial risk. ISO 28000 frames supply-chain security as a management-system problem, so the product needs repeatable visibility, review cycles, and control settings rather than one-off data entry.

Required workspace fields:

- Company name: Personalizes the network root node and reports.
- User name and role: Clarifies who owns decisions and which workflows matter.
- Sector: Helps tune benchmarks, supplier classes, and compliance expectations.
- Region: Affects logistics, geopolitical, lead-time, and regulatory assumptions.
- Main goal: Prevents the dashboard from becoming generic; recommendations should align to the job-to-be-done.
- Critical category: Defines which material, part, service, or buyer dependency the platform is analyzing.
- Planning cycle: Indicates whether recommendations should be tactical weekly moves, monthly operating reviews, or quarterly strategy.
- Annual spend at risk: Converts operational disruption into financial exposure.
- Compliance focus: Makes the trust model visible, such as financial stability, cyber/data sharing, ESG, or SLA performance.

Required partner fields:

- Partner name and type: Creates the graph entity and determines inbound supplier versus outbound buyer exposure.
- Risk level: Gives the prototype a simple starting risk prior before real integrations exist.
- Reliability score: Powers comparison, health scoring, and simulation assumptions.
- Relationship weight: Models concentration risk and dependency strength.
- Lead time days: Shows how quickly disruption becomes operationally painful.
- Recovery days: Models how long a disrupted supplier relationship may take to stabilize.
- Disruption probability: Lets the simulation represent uncertainty instead of only deterministic scores.

Optional future fields:

- Legal entity name and tax ID.
- Bank/payment verification status.
- Certifications and audit status.
- Sanctions/PEP screening status.
- Insurance coverage.
- Contract dates and renewal windows.
- Minimum order quantity and capacity.
- Historical defect rate.
- On-time delivery rate.
- Country of origin and shipping lanes.
- Tier-2 supplier dependencies.
- Data-sharing consent and visibility scope.

## Journey Map

### 1. First Landing

The user sees a dashboard with a first-time journey card, not an empty analytics page. This establishes a clear next step: complete setup or manage workspace.

Design principles:

- Recognition over recall: Show the journey checklist in plain language.
- Progressive disclosure: Only ask for deeper supplier data after the workspace basics are understood.
- Immediate feedback: KPI cards, checklist completion, and graph snapshots update after each action.

### 2. Guided Setup

The user enters company, role, category, planning, spend, and compliance context. They choose one of three modes:

- Guided demo: Best for a first-time evaluator who wants enough data to understand the app quickly.
- Lean start: Best for a cautious user who wants to enter only real partners.
- Expanded sandbox: Best for testing analytics, optimization, and scenario behavior.

Design principles:

- Safe defaults: Guided demo is preselected because it prevents a blank state.
- User control: The user can reset or reopen setup from Data Control.
- Explainability: Each mode states the tradeoff in one sentence.

### 3. Dashboard Review

After setup, the dashboard summarizes progress, direct partners, visibility, critical category, relationship count, dependency score, risk level, network health, alerts, and network snapshot.

Design principles:

- Prioritize decision signals over raw data.
- Keep high-risk indicators visually distinct.
- Make data quality visible through the checklist.

### 4. Add and Manage Partners

The user adds direct suppliers or buyers from Data Control. Each partner instantly affects the graph, dashboards, comparison options, risk view, and recommendations.

Design principles:

- One input, many outputs: A single partner should update multiple product surfaces.
- Avoid dead controls: Toggles and visibility buttons must persist and change the UI.
- Support correction: Profile editing and reset are always available.

### 5. Explore the Network

The user opens Network View to inspect supplier and buyer relationships. Clicking a node opens a detail panel with relationship strength, risk, reliability, and supplier performance metrics.

Design principles:

- Spatial reasoning: A graph helps users understand dependency clusters better than a table alone.
- Detail on demand: The graph stays readable until the user asks for more detail.

### 6. Compare Alternatives

The user compares suppliers by price, reliability, delivery, and risk. Weights are adjustable, and the winning supplier changes based on the user's priorities.

Design principles:

- Make tradeoffs explicit.
- Let users test assumptions rather than accept a black-box recommendation.

### 7. Risk and Simulation

The Risk Dashboard shows heatmap risk, critical alerts, recommended actions, trend history, and a Monte Carlo disruption simulator. The simulator models thousands of scenarios across demand volatility, lead time, recovery time, supplier risk, and relationship weight.

Prototype interpretation:

- Stockout probability estimates how often simulated disruption pressure exceeds the recovery buffer.
- Expected disruption loss estimates average financial exposure over the planning horizon.
- 95th percentile loss shows a severe-but-plausible downside case.
- Service level shows the percentage of scenarios that avoid major disruption.

Design principles:

- Show uncertainty, not false precision.
- Label prototype analytics clearly so users do not mistake it for production forecasting.
- Use scenario ranges and percentiles because supply-chain risk is rarely a single known number.

### 8. Optimize

The user sees recommendations tied to the strongest dependency, their selected goal, critical category, region, and current target dependency.

Design principles:

- Recommendations should explain expected impact.
- The app should offer next actions, not only diagnosis.

## Feature Completion Rules

For this prototype, a feature should count as working only if:

- It accepts user input.
- It persists state during the browser session via local storage.
- It changes at least one downstream dashboard, graph, chart, recommendation, or checklist item.
- It can be reset or revised.
- It does not leave the user in a dead end.

## Future Production Path

The next product milestone should add:

- Authentication and role-based access.
- Database-backed organizations, users, suppliers, buyers, relationships, and events.
- File import for supplier master data.
- Audit trail for profile and sharing changes.
- Real risk connectors for sanctions, financial health, delivery, ESG, and cyber posture.
- Calibrated Monte Carlo parameters based on real historical observations.
- Exportable board/procurement review report.

## Sources

- Prototype interview transcripts: `docs/user-transcripts.md`
- NIST Cybersecurity Supply Chain Risk Management: https://csrc.nist.gov/projects/cyber-supply-chain-risk-management
- NIST SP 800-161 Rev. 1: https://csrc.nist.gov/pubs/sp/800/161/r1/final
- ISO 28000 Supply Chain Security Management Systems: https://www.iso.org/standard/79612.html
- CIPS Third-Party Onboarding Risk: https://cips-download.cips.org/navigating-risk-in-third-party-onboarding
- Stripe Supplier and Vendor Onboarding Guide: https://stripe.com/gb/resources/more/supplier-and-vendor-onboarding
