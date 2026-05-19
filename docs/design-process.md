# Design Process Documentation: Vypaar Saathi Prototype

## 1. Design Goal

Vypaar Saathi was designed to make supplier network optimization understandable to a normal business user. The goal was not to remove analytical depth. The goal was to hide complexity until the moment it becomes useful.

The final experience should let a first-time user:

- Understand what the product does within the first screen.
- Create a workspace without facing a long enterprise form.
- Enter only the data required for a useful recommendation.
- See every input change downstream outputs.
- Move from risk awareness to a practical allocation decision.

## 2. Primary User Assumption

The interface assumes the user may be a business owner, operations manager, or procurement lead who understands their suppliers but may not understand graph analytics, optimization models, or Monte Carlo simulation.

This led to three key product decisions:

- Use plain language labels such as `Problems`, `Pick Best`, and `Best Plan`.
- Use one guided sign-up path instead of multiple setup routes.
- Keep advanced analytics visible, but frame them as answers and next actions.

## 3. Research and Input Framing

The form fields were chosen by asking whether each field supports a concrete decision. The product does not ask for data only because a production supplier system might eventually store it.

Workspace data:

- Company name: Creates the root network entity.
- User name and role: Personalizes ownership and decision context.
- Critical category: Defines the material, part, or service being optimized.
- Annual spend: Converts risk into financial exposure.
- Planning cycle: Sets the time horizon for recommendations.
- Main goal: Aligns recommendations with the user's job-to-be-done.
- Compliance focus: Makes trust and due diligence visible.

Partner data:

- Partner type: Separates supplier exposure from buyer exposure.
- Risk level: Creates a simple risk prior.
- Score: Feeds health, comparison, and optimization.
- Relationship weight: Models concentration risk.
- Lead time and recovery days: Feed continuity risk.
- Disruption probability: Feeds the simulation model.
- Capacity share and cost index: Feed allocation optimization.
- Compliance score and switching cost: Add trust and transition constraints.

## 4. Journey Simplification

An earlier version had two setup paths that both moved the user toward the same data page. That created unnecessary cognitive load. The revised journey uses one clear path:

1. Landing page.
2. Create workspace.
3. Guided sign-up.
4. Add supplier or buyer details.
5. Review dashboard and map.
6. Compare suppliers.
7. Run risk simulation.
8. Use best-plan allocation.

The design principle was: one user goal should have one obvious route.

## 5. Heuristic Decisions

The prototype uses several usability heuristics:

- Visibility of system status: Checklist, progress dots, KPI cards, and live badges show current state.
- Match with the real world: Labels use familiar business language instead of model language.
- User control and freedom: Users can edit profile, add partners, reset workspace, and change visibility.
- Recognition over recall: The app shows remaining setup items and suggested answers.
- Error prevention: Forms provide defaults, bounded numeric inputs, and simple choices.
- Progressive disclosure: Sign-up asks basics first; detailed partner fields appear later.
- Flexibility and efficiency: Power users can jump to map, comparison, risk, or optimizer from navigation.
- Help users recover: Reset and edit paths are always available.

## 6. Visual Design Direction

The visual language is intentionally operational and dashboard-like. It avoids looking like a generic marketing site once the user enters the product.

Design choices:

- Dark and light theme support for different review environments.
- Compact cards for decision surfaces.
- Plain-language navigation labels.
- Chart and graph surfaces for analytical credibility.
- Strong color coding for risk, safety, warning, and action.
- Large landing page only as a prototype showcase entry, not as the main app experience.

## 7. Information Architecture

The app separates work into six practical areas:

- Home: Start, progress, and result summary.
- Map: Spatial view of relationships.
- Pick Best: Supplier comparison and tradeoff testing.
- Problems: Risk dashboard and simulation.
- Best Plan: Optimized allocation recommendation.
- Add Info: Profile, partner data, and sharing controls.

This structure follows how a user thinks:

- First: What do I need to do?
- Then: Who am I connected to?
- Then: Which partner is better?
- Then: What can go wrong?
- Finally: What should I do?

## 8. Interaction Design

The app treats input as a trigger for visible change.

Examples:

- Completing sign-up updates profile, checklist, and navigation state.
- Adding a partner updates graph, KPIs, risk views, comparison choices, and optimizer.
- Changing simulation sliders updates preview outputs.
- Running Monte Carlo updates scenario distribution and loss estimates.
- Editing profile changes dashboard language and recommendation context.

The feature completion rule is simple: if a control does not visibly change the product, it should not be shown.

## 9. Accessibility and Simplicity

The prototype is designed for low training burden:

- One question per sign-up step.
- Clear button labels.
- Large click targets.
- Suggested answers.
- Reversible actions.
- Short explanatory text near complex analytics.
- High contrast risk and status colors.

Future accessibility improvements should include:

- Full keyboard focus styling audit.
- Screen-reader labels for graph nodes and charts.
- Reduced-motion option.
- Color-independent risk indicators.
- Form validation messages tied to fields.

## 10. Documentation Design

The documentation was designed as browser-native HTML and printable PDF instead of only static notes because evaluators can open the same evidence beside the prototype.

Documentation decisions:

- Arrow-key navigation for live demo flow.
- Print/PDF support for submission or review.
- Visual diagrams for product story, data model, journey, architecture, analytics, and optimization.
- Direct links to prototype and documentation.
- Slide layout responsive enough to open on laptops and projectors.

## 11. Current Limitations

The design is still a prototype and has limitations:

- It uses sample data and local browser storage.
- It does not include authentication or real teams.
- It does not import real supplier master data yet.
- It has no production-grade error handling.
- Simulation and optimization are illustrative, not calibrated from historical data.
- Charts and graph interactions need deeper accessibility work before production.

## 12. Next Design Iterations

Recommended next design work:

- Add CSV/XLSX import flow for supplier data.
- Add saved scenarios and compare-plan history.
- Add guided empty states for a completely new workspace.
- Add executive summary export.
- Add onboarding variants for supplier, buyer, and consultant personas.
- Add mobile-specific interaction patterns for graph and optimizer views.
- Run usability testing with 5 to 8 target users and revise language based on observed confusion.

## 13. Design Validation Checklist

Before presenting or shipping a prototype version, verify:

- A new user can start from landing and create a workspace.
- Sign-up has only one obvious route.
- Add Info can create a new supplier.
- Newly added supplier appears in graph and dashboards.
- Comparison changes when weights change.
- Monte Carlo run changes simulation outputs.
- Best Plan shows allocation, reasons, and constraints.
- Reset returns to a clean new-user state.
- Prototype, markdown notes, visual documentation, and PDFs open correctly.
- Documentation links are available from README.
