# Technical Report: Vypaar Saathi

## 1. System Overview

Vypaar Saathi is a browser-based decision-intelligence prototype for supplier and buyer network optimization. It is implemented as a static single-page application using HTML, CSS, vanilla JavaScript, D3.js, Chart.js, and browser `localStorage`.

The application has no backend yet. All default data is loaded from `data.js`, transformed into runtime application state in `app.js`, and persisted locally in the user's browser. This makes the prototype easy to test while still showing the product logic needed for a production-grade system.

Core files:

- `index.html`: Defines screen structure, navigation, onboarding modal, chart containers, and interactive form mounts.
- `style.css`: Defines the complete visual system, responsive layout, cards, modal, graph, forms, simulation, and optimizer table.
- `data.js`: Provides seeded supplier, buyer, relationship, notification, recommendation, privacy, and optimization inputs.
- `app.js`: Owns application state, rendering, navigation, analytics, simulation, optimization, persistence, and event handlers.
- `docs/user-journey.md`: Documents product journey, data requirements, and design principles.
- `docs/technical-report.md`: Documents technical architecture and working model.

## 2. Data Model

The application models a supplier network as weighted graph data.

### Node

Nodes represent suppliers, buyers, or the user's company.

Important fields:

- `id`: Stable graph identifier.
- `type`: `supplier` or `buyer`.
- `name`: Display name.
- `risk`: `low`, `medium`, or `high`.
- `score`: General reliability or partner score.
- `delivery`, `quality`, `price`, `payment`: Comparative performance metrics.
- `categoryFit`: Fit for the user's selected critical category.
- `capacityShare`: Maximum practical available share the partner can absorb.
- `minShare`: Minimum allocation to preserve contract or operating continuity.
- `maxShare`: Strategic cap before concentration becomes undesirable.
- `unitCostIndex`: Relative cost index, where lower is cheaper.
- `leadTime`: Expected lead time in days.
- `recoveryDays`: Expected recovery time after disruption.
- `disruptionProbability`: Estimated probability of disruption.
- `defectPpm`: Quality defect rate.
- `onTimeDelivery`: Delivery reliability.
- `complianceScore`: Operational/commercial compliance maturity.
- `cyberScore`: Cyber/data-sharing posture.
- `esgScore`: Responsible sourcing or ESG posture.
- `geoRisk`: Location/geopolitical/logistics risk.
- `switchingCost`: Cost to activate or shift volume.
- `paymentTermsDays`: Payment term impact.
- `contractMonthsRemaining`: Contract lock-in or renewal signal.
- `inventoryCoverDays`: Buffer inventory available.
- `moqIndex`: Minimum order quantity friction.

### Link

Links represent weighted relationships between nodes.

Important fields:

- `source`: Relationship origin node ID.
- `target`: Relationship destination node ID.
- `weight`: Relationship/dependency strength as a percentage-like score.
- `status`: `stable`, `new`, or `risk`.

For direct suppliers, links point from supplier to `me`. For outbound buyer exposure, links may point from `me` to buyer.

### Profile

The user profile defines the optimization context:

- Company name.
- User name and role.
- Sector.
- Region.
- Main goal.
- Critical category.
- Planning cycle.
- Annual spend at risk.
- Compliance focus.

These values are not decorative. They are used to personalize dashboards, checklist state, simulation labels, optimization explanations, and future data requirements.

## 3. Runtime State

`app.js` uses one central `appState` object. The state contains:

- `profile`
- `setupMode`
- `onboardingComplete`
- `visibilityMode`
- `privacySettings`
- `nodes`
- `links`
- `notifications`
- `recommendations`
- `simulation`
- `nextPartnerId`
- `lastRefreshAt`

State is loaded through `loadState()`, written through `saveState()`, and stored in `localStorage` under `vypaar-saathi-state-v2`.

The app also normalizes older saved states through `normalizeNodeData()`. This prevents previously saved browser data from breaking after new optimizer fields are introduced.

## 4. Screen Architecture

The UI is split into six screens:

1. Dashboard
2. Network View
3. Comparison Tool
4. Risk Dashboard
5. Optimization Suggestions
6. Data Control

Navigation is handled by `navigateTo(screenName)`. The function updates active nav state, screen visibility, and rerenders special screens when needed.

## 5. Dashboard Working

The Dashboard provides first-run guidance and high-level health signals.

Major functions:

- `renderJourney()`: Shows setup progress, mode, critical category, direct partner count, and visibility state.
- `getChecklistItems()`: Defines completion rules for workspace readiness.
- `computeKPIs()`: Calculates active relationships, dependency score, risk level, and network health.
- `renderDashboard()`: Updates KPI cards, alerts, trend chart, and risk distribution chart.

Design rationale:

- The dashboard starts with guidance because users should not face an empty analytics interface.
- KPI cards are derived from state, not hard-coded.
- Checklist rules expose data quality and setup completeness.

## 6. Network Graph Working

The graph uses D3 force simulation.

Major functions:

- `renderNetworkGraph(containerSelector, isMini)`
- `showDetailPanel(nodeData)`
- `getNodeColor(node)`

The graph clones runtime nodes and links because D3 mutates simulation objects. The main graph supports zoom, drag, hover highlighting, and node detail panels. The mini graph uses the same data but renders a simplified snapshot.

## 7. Comparison Tool Working

The Comparison Tool lets users evaluate suppliers with adjustable weights.

Major functions:

- `renderComparisonTool()`
- `updateComparison()`
- `renderComparisonRadar(datasets)`

Inputs:

- Price
- Reliability
- Delivery
- Risk

The final comparison score is a weighted sum of supplier metrics. The best fit is highlighted and visualized in a radar chart.

## 8. Risk Dashboard Working

The Risk Dashboard combines deterministic and probabilistic views.

Major functions:

- `renderRiskDashboard()`
- `buildRiskBlocks(supplier)`
- `renderRiskTimelineChart()`

The heatmap is generated from supplier risk, score, and direct relationship context. Alerts are pulled from state and updated by user actions such as refresh, partner add, and simulation runs.

## 9. Monte Carlo Simulation Working

The simulator provides a prototype view of uncertainty.

Major functions:

- `renderMonteCarloSimulator()`
- `runMonteCarloSimulation()`
- `runSimulationModel(useRandom)`
- `renderSimulationResults(results, isPreview)`
- `renderSimulationChart(buckets)`

Simulation inputs:

- Planning horizon.
- Iterations.
- Demand volatility.
- Recovery buffer.
- Supplier relationship weight.
- Supplier disruption probability.
- Supplier lead time.
- Supplier recovery days.
- Annual spend at risk.

Outputs:

- Stockout probability.
- Expected disruption loss.
- 95th percentile disruption loss.
- Modeled service level.
- Scenario distribution chart.

The simulator uses randomized draws for user-triggered runs and deterministic pseudo-random preview values for stable UI previews. It is clearly labeled as a prototype scenario engine.

## 10. Optimization Engine Working

The optimizer is implemented as a constrained greedy allocation model. It is not a production linear-programming solver, but it uses real optimization concepts and professional data inputs.

Major functions:

- `calculateOptimizedAllocation()`
- `calculateSupplierOptimizationScore(supplier, currentShare)`
- `getDirectSupplierWeights()`
- `getConcentrationCap(supplier)`
- `estimateOptimizationSavings(rows, suppliers)`
- `renderOptimizerOutput(optimizer)`

### Supplier Optimization Score

Each supplier receives a composite score from:

- Category fit.
- Reliability.
- On-time delivery.
- Quality defect performance.
- Compliance maturity.
- Cyber posture.
- ESG posture.
- Relative unit cost.
- Lead time.
- Disruption probability.
- Geographic/logistics risk.
- Switching-cost penalty for new suppliers.

### Allocation Constraints

The allocation model respects:

- Supplier capacity share.
- Supplier maximum strategic share.
- Minimum direct-share continuity.
- Risk cap for high-risk suppliers.
- Compliance cap for weak-control suppliers.
- Total allocation must equal 100%.

### Outputs

The optimizer renders:

- Current portfolio score.
- Optimized portfolio score.
- Concentration reduction.
- Estimated cost reduction or resilience premium.
- Recommended allocation table.
- Explanation and constraint for every selected partner.

This gives the user a tangible operating recommendation instead of generic advice.

## 11. Data Control Working

Data Control is the operational setup area.

Major functions:

- `renderDataControl()`
- `handleProfileSave(event)`
- `handlePartnerAdd(event)`
- `resetWorkspace()`
- `bindDataControlActions()`

Users can:

- Edit workspace profile.
- Add supplier or buyer partners.
- Enter optimization data for each partner.
- Change privacy settings.
- Change visibility defaults.
- Reset the workspace.

Every data-control change rerenders downstream dashboards, graph, simulator, and optimizer.

## 12. Design Principles Used

The product follows these design principles:

- Progressive disclosure: Start with only the setup fields needed for useful output, then reveal deeper partner fields in Data Control.
- Immediate feedback: Data entry updates KPIs, graph, charts, and recommendations.
- Explainability: Optimization recommendations include reason and constraint fields.
- Recoverability: Users can reopen setup and reset workspace.
- Recognition over recall: The checklist tells users what remains to be done.
- Trust through transparency: Simulation is labeled as prototype analytics and optimization exposes its constraints.
- Avoid dead controls: Buttons, sliders, toggles, and forms persist or rerender visible outputs.

## 13. Current Technical Limitations

Current limitations:

- Data persists only in browser `localStorage`.
- There is no authentication or team access model.
- Monte Carlo simulation is illustrative and not calibrated from historical datasets.
- Optimization is greedy and constraint-aware, but not a full mathematical programming solver.
- There is no import/export workflow.
- There are no external risk-data integrations.
- There is no automated test suite yet.

## 14. Production Upgrade Path

Recommended next steps:

- Move state to a backend API and database.
- Add account, organization, and role-based permissions.
- Add supplier master import from CSV/XLSX.
- Add audit logs for data and visibility changes.
- Replace greedy allocation with a linear or mixed-integer optimization solver.
- Calibrate Monte Carlo assumptions from actual delivery, demand, quality, and disruption history.
- Add scenario comparison and saveable optimization plans.
- Add PDF/board report export.
- Integrate sanctions, financial risk, cyber, ESG, and logistics APIs.

## 15. Verification Notes

The project should be verified with:

- `node --check app.js`
- Browser load at `http://127.0.0.1:3000`
- Onboarding submit
- Profile edit
- Partner add
- Network view open
- Comparison weight changes
- Monte Carlo run
- Optimizer table update
- Workspace reset
