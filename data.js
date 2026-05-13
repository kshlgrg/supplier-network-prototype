// data.js - Simulated Backend Data for Vypaar Saathi Prototype

// 1. Core Nodes (Suppliers & Buyers)
const nodes = [
  // The User (Central Node)
  { id: "me", type: "buyer", name: "Your Company", risk: "low", score: 85 },
  
  // Tier 1 Suppliers
  { id: "s1", type: "supplier", name: "Alpha Manufacturing", risk: "low", score: 92, delivery: 95, quality: 90, price: 85, payment: 98 },
  { id: "s2", type: "supplier", name: "Beta Electronics", risk: "medium", score: 76, delivery: 80, quality: 85, price: 70, payment: 82 },
  { id: "s3", type: "supplier", name: "Gamma Components", risk: "high", score: 55, delivery: 60, quality: 70, price: 80, payment: 50 },
  { id: "s4", type: "supplier", name: "Delta Plastics", risk: "low", score: 88, delivery: 90, quality: 88, price: 82, payment: 92 },
  { id: "s5", type: "supplier", name: "Epsilon Minerals", risk: "medium", score: 72, delivery: 75, quality: 80, price: 78, payment: 65 },
  
  // Tier 2 Suppliers (Suppliers to our Suppliers) - Adds depth to graph
  { id: "s6", type: "supplier", name: "Zeta Raw Materials", risk: "high", score: 45, delivery: 50, quality: 60, price: 90, payment: 40 },
  { id: "s7", type: "supplier", name: "Eta Logistics", risk: "low", score: 95, delivery: 98, quality: 95, price: 80, payment: 96 },
  { id: "s8", type: "supplier", name: "Theta Synthetics", risk: "medium", score: 78, delivery: 82, quality: 75, price: 85, payment: 70 },
  
  // Other Buyers (Competitors / Alternatives)
  { id: "b1", type: "buyer", name: "Omega Corp", risk: "low", score: 90, scale: "large" },
  { id: "b2", type: "buyer", name: "Sigma Industries", risk: "medium", score: 68, scale: "medium" },
  { id: "b3", type: "buyer", name: "Iota Systems", risk: "high", score: 52, scale: "small" }
];

// 2. Edges (Relationships with Dependency Weights 0-100)
const links = [
  // Our direct suppliers
  { source: "s1", target: "me", weight: 65, status: "stable" }, // High dependency on Alpha
  { source: "s2", target: "me", weight: 20, status: "stable" },
  { source: "s3", target: "me", weight: 10, status: "risk" },   // Risky supplier
  { source: "s4", target: "me", weight: 5, status: "new" },
  
  // Tier 1 -> Tier 2 relationships (Supply chain depth)
  { source: "s6", target: "s1", weight: 40, status: "risk" },   // Alpha relies heavily on a risky supplier
  { source: "s7", target: "s1", weight: 30, status: "stable" },
  { source: "s7", target: "s2", weight: 50, status: "stable" },
  { source: "s8", target: "s3", weight: 80, status: "stable" },
  { source: "s8", target: "s5", weight: 20, status: "stable" },
  
  // Our suppliers supplying other buyers
  { source: "s1", target: "b1", weight: 80, status: "stable" }, // Alpha's main buyer is Omega (Risk for us)
  { source: "s4", target: "b2", weight: 45, status: "stable" },
  { source: "s5", target: "b3", weight: 60, status: "risk" }
];

// 3. Alerts Data
const notifications = [
  { id: 1, type: "critical", title: "High Dependency Risk", message: "You rely on <strong>Alpha Mfg</strong> for 65% of critical components. Their primary raw material supplier recently dropped to 'High Risk'.", time: "2 hours ago" },
  { id: 2, type: "warning", title: "Delivery Consistency Drop", message: "<strong>Gamma Components</strong> late deliveries increased by 14% over the last 30 days.", time: "1 day ago" },
  { id: 3, type: "info", title: "Alternative Supplier Found", message: "Network intelligence suggests <strong>Delta Plastics</strong> has 92% capability match for parts currently sourced from Gamma.", time: "2 days ago" },
  { id: 4, type: "warning", title: "Price Volatility", message: "Logistics costs from Tier-2 suppliers show erratic pricing shifts this quarter.", time: "5 days ago" }
];

// 4. Optimization Recommendations
const recommendations = [
  {
    id: "rec1",
    title: "Diversify Alpha Mfg Components",
    desc: "Shift 25% of volume to Delta Plastics to reduce single-point failure risk. Delta has proven reliability scores and overlapping capabilities.",
    impact: "Reduces dependency score from 65% → 40%",
    icon: "blue",
    symbol: "⟲"
  },
  {
    id: "rec2",
    title: "Phase out Gamma Components",
    desc: "Gamma's risk score indicates imminent delivery failures. Initiate onboarding for Theta Synthetics as direct replacement.",
    impact: "Improve overall network health by +8 pts",
    icon: "amber",
    symbol: "⨯"
  },
  {
    id: "rec3",
    title: "Leverage Eta Logistics",
    desc: "Eta is currently functioning purely as Tier-2. Direct engagement could reduce lead times by 12%.",
    impact: "Supply chain lifecycle optimization",
    icon: "green",
    symbol: "↗"
  }
];

// 5. User Data Sharing Settings
const privacySettings = [
  { id: "anon_bench", name: "Anonymous Benchmarking", desc: "Share aggregated, anonymized reliability data to access industry standard benchmarks.", active: true },
  { id: "tier_vis", name: "Tier-2 Visibility", desc: "Allow immediate suppliers to request data regarding their own upstream supply chain health.", active: true },
  { id: "public_perf", name: "Public Performance Score", desc: "Display your summary reliability and payment score on your public network profile.", active: false },
  { id: "ai_opt", name: "AI Optimization Engine", desc: "Allow the recommendation engine to analyze your transaction flow to find alternative suppliers.", active: true }
];

// 6. Professional Optimization Inputs
// These fields mimic the minimum data needed to make allocation decisions instead
// of only showing narrative recommendations.
const optimizationInputs = {
  s1: { categoryFit: 96, capacityShare: 70, minShare: 20, maxShare: 55, unitCostIndex: 104, leadTime: 18, recoveryDays: 24, disruptionProbability: 9, defectPpm: 220, onTimeDelivery: 95, complianceScore: 91, cyberScore: 84, esgScore: 78, geoRisk: 22, switchingCost: 15000, paymentTermsDays: 45, contractMonthsRemaining: 18, inventoryCoverDays: 21, moqIndex: 70 },
  s2: { categoryFit: 88, capacityShare: 35, minShare: 5, maxShare: 35, unitCostIndex: 96, leadTime: 24, recoveryDays: 21, disruptionProbability: 16, defectPpm: 430, onTimeDelivery: 82, complianceScore: 76, cyberScore: 72, esgScore: 69, geoRisk: 38, switchingCost: 28000, paymentTermsDays: 30, contractMonthsRemaining: 9, inventoryCoverDays: 14, moqIndex: 55 },
  s3: { categoryFit: 79, capacityShare: 25, minShare: 0, maxShare: 18, unitCostIndex: 91, leadTime: 35, recoveryDays: 38, disruptionProbability: 34, defectPpm: 1100, onTimeDelivery: 61, complianceScore: 58, cyberScore: 61, esgScore: 52, geoRisk: 64, switchingCost: 45000, paymentTermsDays: 20, contractMonthsRemaining: 4, inventoryCoverDays: 8, moqIndex: 45 },
  s4: { categoryFit: 93, capacityShare: 45, minShare: 5, maxShare: 40, unitCostIndex: 101, leadTime: 15, recoveryDays: 14, disruptionProbability: 7, defectPpm: 260, onTimeDelivery: 92, complianceScore: 88, cyberScore: 80, esgScore: 83, geoRisk: 25, switchingCost: 22000, paymentTermsDays: 45, contractMonthsRemaining: 15, inventoryCoverDays: 19, moqIndex: 62 },
  s5: { categoryFit: 71, capacityShare: 30, minShare: 0, maxShare: 25, unitCostIndex: 98, leadTime: 29, recoveryDays: 25, disruptionProbability: 18, defectPpm: 620, onTimeDelivery: 78, complianceScore: 72, cyberScore: 66, esgScore: 74, geoRisk: 43, switchingCost: 34000, paymentTermsDays: 25, contractMonthsRemaining: 7, inventoryCoverDays: 12, moqIndex: 58 },
  s6: { categoryFit: 62, capacityShare: 22, minShare: 0, maxShare: 12, unitCostIndex: 89, leadTime: 42, recoveryDays: 48, disruptionProbability: 42, defectPpm: 1600, onTimeDelivery: 52, complianceScore: 49, cyberScore: 45, esgScore: 48, geoRisk: 72, switchingCost: 52000, paymentTermsDays: 15, contractMonthsRemaining: 2, inventoryCoverDays: 6, moqIndex: 76 },
  s7: { categoryFit: 86, capacityShare: 28, minShare: 0, maxShare: 30, unitCostIndex: 108, leadTime: 11, recoveryDays: 9, disruptionProbability: 5, defectPpm: 140, onTimeDelivery: 98, complianceScore: 94, cyberScore: 88, esgScore: 86, geoRisk: 18, switchingCost: 31000, paymentTermsDays: 60, contractMonthsRemaining: 22, inventoryCoverDays: 25, moqIndex: 50 },
  s8: { categoryFit: 84, capacityShare: 32, minShare: 0, maxShare: 28, unitCostIndex: 99, leadTime: 23, recoveryDays: 19, disruptionProbability: 15, defectPpm: 520, onTimeDelivery: 83, complianceScore: 74, cyberScore: 70, esgScore: 71, geoRisk: 36, switchingCost: 27000, paymentTermsDays: 30, contractMonthsRemaining: 11, inventoryCoverDays: 13, moqIndex: 57 }
};

nodes.forEach(node => {
  if (optimizationInputs[node.id]) {
    Object.assign(node, optimizationInputs[node.id]);
  }
});

// Exporting global window object so app.js can access
window.VYPAAR_SAATHI_DATA = {
  nodes,
  links,
  notifications,
  recommendations,
  privacySettings
};
