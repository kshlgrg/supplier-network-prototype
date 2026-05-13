// app.js - Main Application Logic for Vypaar Saathi Decision Intelligence Platform

const STORAGE_KEY = 'vypaar-saathi-state-v2';

let appState = null;
let activeScreen = 'landing';
let radarChartInstance = null;
let detailRadarChart = null;
let signupStepIndex = 0;
let signupDraft = {};

const signupSteps = [
  {
    key: 'userName',
    title: 'Let’s start with you',
    question: 'What is your name?',
    help: 'This is only used to make the workspace feel personal.',
    placeholder: 'Example: Kushal Garg',
    suggestions: ['Kushal Garg', 'Alex Morgan', 'Priya Shah']
  },
  {
    key: 'companyName',
    title: 'Now your business',
    question: 'What is your company called?',
    help: 'This becomes the main circle in your supplier map.',
    placeholder: 'Example: Bright Components',
    suggestions: ['Bright Components', 'Acme Manufacturing', 'Your Company']
  },
  {
    key: 'userRole',
    title: 'What do you do?',
    question: 'What is your job?',
    help: 'Pick the closest one. It does not need to be perfect.',
    placeholder: 'Example: Owner',
    suggestions: ['Owner', 'Manager', 'Purchasing Head']
  },
  {
    key: 'criticalCategory',
    title: 'Main thing you buy',
    question: 'What item or material is most important?',
    help: 'This tells the planner what supply problem matters most.',
    placeholder: 'Example: Critical components',
    suggestions: ['Critical components', 'Packaging material', 'Raw materials']
  },
  {
    key: 'annualSpend',
    title: 'Buying size',
    question: 'About how much do you spend per year?',
    help: 'A rough number is enough. This helps compare risk and savings.',
    placeholder: 'Example: 2500000',
    suggestions: ['2500000', '1000000', '5000000']
  },
  {
    key: 'planningCycle',
    title: 'Planning rhythm',
    question: 'How often do you normally plan buying?',
    help: 'This helps the demo show the right time view.',
    placeholder: 'Choose or type: Weekly, Monthly, Quarterly',
    suggestions: ['Weekly', 'Monthly', 'Quarterly']
  },
  {
    key: 'goal',
    title: 'Main goal',
    question: 'What help do you want first?',
    help: 'We use this to choose the best starting plan.',
    placeholder: 'Choose or type your goal',
    suggestions: ['Find safer suppliers', 'Reduce risk', 'Save money']
  },
  {
    key: 'complianceFocus',
    title: 'Last question',
    question: 'What worries you most about suppliers?',
    help: 'This becomes the trust signal in your supplier plan.',
    placeholder: 'Choose or type your concern',
    suggestions: ['Quality and delivery SLAs', 'Financial stability', 'Cyber and data sharing']
  }
];

const chartStore = {
  trend: null,
  riskDistribution: null,
  riskTimeline: null,
  simulation: null
};

document.addEventListener('DOMContentLoaded', () => {
  appState = loadState();
  window.appState = appState;

  bindNavigation();
  bindGlobalActions();
  renderAll();
  updateSignupForm();
});

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getInitialProfile() {
  return {
    companyName: 'Your Company',
    userName: 'Kushal Garg',
    userRole: 'Supplier Admin',
    sector: 'Industrial Components',
    region: 'India',
    goal: 'Reduce concentration risk',
    criticalCategory: 'Critical components',
    planningCycle: 'Monthly',
    annualSpend: 2500000,
    complianceFocus: 'Quality and delivery SLAs'
  };
}

function buildTemplate(mode = 'guided', profile = getInitialProfile()) {
  let nodes = deepClone(window.VYPAAR_SAATHI_DATA.nodes);
  let links = deepClone(window.VYPAAR_SAATHI_DATA.links);
  let notifications = deepClone(window.VYPAAR_SAATHI_DATA.notifications);
  const recommendations = deepClone(window.VYPAAR_SAATHI_DATA.recommendations);
  const privacySettings = deepClone(window.VYPAAR_SAATHI_DATA.privacySettings);

  const meNode = nodes.find(node => node.id === 'me');
  if (meNode) {
    meNode.name = profile.companyName;
  }

  if (mode === 'lean') {
    const keepIds = new Set(['me', 's1', 's4', 'b1']);
    nodes = nodes.filter(node => keepIds.has(node.id));
    links = links.filter(link => keepIds.has(link.source) && keepIds.has(link.target));
    notifications = notifications.slice(0, 2);
  }

  if (mode === 'expanded') {
    nodes.push(
      { id: 's9', type: 'supplier', name: 'Nova Fabrication', risk: 'low', score: 89, delivery: 92, quality: 90, price: 81, payment: 94, categoryFit: 91, capacityShare: 36, minShare: 0, maxShare: 32, unitCostIndex: 103, leadTime: 16, recoveryDays: 12, disruptionProbability: 6, defectPpm: 210, onTimeDelivery: 93, complianceScore: 90, cyberScore: 82, esgScore: 84, geoRisk: 21, switchingCost: 26000, paymentTermsDays: 45, contractMonthsRemaining: 14, inventoryCoverDays: 20, moqIndex: 64 },
      { id: 's10', type: 'supplier', name: 'Orion Precision', risk: 'medium', score: 74, delivery: 76, quality: 84, price: 79, payment: 72, categoryFit: 82, capacityShare: 30, minShare: 0, maxShare: 24, unitCostIndex: 97, leadTime: 27, recoveryDays: 22, disruptionProbability: 17, defectPpm: 610, onTimeDelivery: 77, complianceScore: 71, cyberScore: 69, esgScore: 72, geoRisk: 41, switchingCost: 33000, paymentTermsDays: 30, contractMonthsRemaining: 8, inventoryCoverDays: 12, moqIndex: 56 },
      { id: 'b4', type: 'buyer', name: 'Vertex Retail', risk: 'low', score: 86, scale: 'large', annualRevenueShare: 18, paymentReliability: 91, marginIndex: 102 }
    );

    links.push(
      { source: 's9', target: 'me', weight: 18, status: 'stable' },
      { source: 's10', target: 'me', weight: 12, status: 'new' },
      { source: 's10', target: 'b4', weight: 30, status: 'stable' }
    );

    notifications.push({
      id: 5,
      type: 'info',
      title: 'Deeper sandbox ready',
      message: 'Expanded mode added <strong>Nova Fabrication</strong> and <strong>Orion Precision</strong> so you can test more realistic diversification paths.',
      time: 'just now'
    });
  }

  return {
    nodes,
    links,
    notifications,
    recommendations,
    privacySettings
  };
}

function createInitialState(mode = 'guided') {
  const profile = getInitialProfile();
  const template = buildTemplate(mode, profile);

  return {
    profile,
    setupMode: mode,
    signedUp: false,
    onboardingComplete: false,
    theme: 'dark',
    visibilityMode: 'tier',
    privacySettings: template.privacySettings,
    nodes: normalizeNodeData(template.nodes),
    links: template.links,
    notifications: template.notifications,
    recommendations: template.recommendations,
    simulation: {
      horizon: 90,
      iterations: 3000,
      volatility: 18,
      buffer: 14,
      lastRun: null
    },
    nextPartnerId: 11,
    lastRefreshAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

function normalizeNodeData(nodes) {
  return nodes.map(node => {
    if (node.type !== 'supplier') {
      return {
        annualRevenueShare: node.annualRevenueShare || (node.scale === 'large' ? 24 : node.scale === 'medium' ? 14 : 7),
        paymentReliability: node.paymentReliability || node.score || 70,
        marginIndex: node.marginIndex || 100,
        ...node
      };
    }

    const riskDefaults = node.risk === 'high'
      ? { disruptionProbability: 34, leadTime: 35, recoveryDays: 38, geoRisk: 64 }
      : node.risk === 'medium'
        ? { disruptionProbability: 16, leadTime: 24, recoveryDays: 21, geoRisk: 38 }
        : { disruptionProbability: 7, leadTime: 15, recoveryDays: 12, geoRisk: 22 };

    return {
      categoryFit: node.categoryFit || Math.max(50, Math.min(98, (node.quality || node.score || 75) + 2)),
      capacityShare: node.capacityShare || Math.max(15, Math.min(70, Math.round((node.score || 75) / 2))),
      minShare: node.minShare ?? 0,
      maxShare: node.maxShare || Math.max(15, Math.min(55, Math.round((node.score || 75) / 1.8))),
      unitCostIndex: node.unitCostIndex || Math.max(75, Math.min(130, 185 - (node.price || 80))),
      leadTime: node.leadTime || riskDefaults.leadTime,
      recoveryDays: node.recoveryDays || riskDefaults.recoveryDays,
      disruptionProbability: node.disruptionProbability || riskDefaults.disruptionProbability,
      defectPpm: node.defectPpm || Math.max(100, Math.round((100 - (node.quality || node.score || 75)) * 28)),
      onTimeDelivery: node.onTimeDelivery || node.delivery || node.score || 75,
      complianceScore: node.complianceScore || Math.max(45, (node.payment || node.score || 75) - 2),
      cyberScore: node.cyberScore || Math.max(40, (node.score || 75) - 6),
      esgScore: node.esgScore || Math.max(40, (node.score || 75) - 8),
      geoRisk: node.geoRisk || riskDefaults.geoRisk,
      switchingCost: node.switchingCost || Math.round((100 - (node.score || 75)) * 1400),
      paymentTermsDays: node.paymentTermsDays || 30,
      contractMonthsRemaining: node.contractMonthsRemaining || 12,
      inventoryCoverDays: node.inventoryCoverDays || 14,
      moqIndex: node.moqIndex || 60,
      ...node
    };
  });
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createInitialState();
    }

    const parsed = JSON.parse(raw);
    const defaults = createInitialState(parsed.setupMode || 'guided');
    const state = {
      ...defaults,
      ...parsed,
      profile: {
        ...defaults.profile,
        ...(parsed.profile || {})
      },
      simulation: {
        ...defaults.simulation,
        ...(parsed.simulation || {})
      }
    };
    state.nodes = normalizeNodeData(state.nodes || defaults.nodes);
    return state;
  } catch (error) {
    return createInitialState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  window.appState = appState;
}

function bindNavigation() {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navigateTo(item.getAttribute('data-screen'));
    });
  });
}

function bindGlobalActions() {
  const bindClick = (id, handler) => {
    const element = document.getElementById(id);
    if (element) element.addEventListener('click', handler);
  };

  bindClick('btn-expand-graph', () => navigateTo('network'));
  bindClick('btn-refresh-dashboard', refreshWorkspace);
  bindClick('btn-demo-reset', resetDemoExperience);
  document.getElementById('signup-form').addEventListener('submit', handleSignupSubmit);
  bindClick('walkthrough-back', () => {
    if (signupStepIndex > 0) {
      const currentStep = signupSteps[signupStepIndex];
      const answerInput = document.getElementById('walkthrough-answer');
      if (answerInput && !appState.signedUp) {
        signupDraft[currentStep.key] = answerInput.value.trim();
      }
      signupStepIndex -= 1;
      renderSignupWalkthrough();
    }
  });
  bindClick('btn-open-onboarding', openOnboardingModal);
  bindClick('btn-jump-data-control', () => navigateTo('datacontrol'));
  bindClick('btn-home-best-plan', () => navigateTo('optimize'));
  bindClick('btn-home-problems', () => navigateTo('risk'));
  bindClick('btn-home-pick-best', () => navigateTo('comparison'));
  bindClick('btn-landing-create', resetDemoExperience);
  bindClick('btn-landing-demo', () => navigateTo('dashboard'));
  bindClick('btn-landing-sample', () => navigateTo('optimize'));

  bindClick('close-onboarding', closeOnboardingModal);
  bindClick('onboarding-backdrop', closeOnboardingModal);
  bindClick('btn-skip-onboarding', closeOnboardingModal);
  document.getElementById('onboarding-form').addEventListener('submit', handleOnboardingSubmit);
  bindClick('btn-run-simulation', runMonteCarloSimulation);
  bindClick('theme-toggle', toggleTheme);

  ['horizon', 'iterations', 'volatility', 'buffer'].forEach(metric => {
    const input = document.getElementById(`sim-${metric}`);
    input.addEventListener('input', event => {
      const value = parseInt(event.target.value, 10);
      appState.simulation[metric] = value;
      updateSimulationControlLabels();
      renderSimulationPreview();
      saveState();
    });
  });
}

function navigateTo(screenName) {
  activeScreen = screenName;
  document.body.classList.toggle('landing-mode', screenName === 'landing');

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-screen') === screenName);
  });

  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.toggle('active', screen.id === `screen-${screenName}`);
  });

  if (screenName === 'network') {
    renderNetworkGraph('#network-graph');
  }

  if (screenName === 'comparison') {
    renderComparisonTool();
  }
}

function renderAll() {
  applyTheme();
  updateUserBadge();
  renderJourney();
  renderDashboard();
  renderMiniGraph();
  renderRiskDashboard();
  renderMonteCarloSimulator();
  renderOptimizationScreen();
  renderDataControl();
  renderComparisonTool();

  if (activeScreen === 'network') {
    renderNetworkGraph('#network-graph');
  }
}

function applyTheme() {
  const theme = appState.theme || 'dark';
  const isLight = theme === 'light';
  document.body.classList.toggle('theme-light', isLight);
  document.getElementById('theme-toggle-label').textContent = isLight ? 'Dark mode' : 'Light mode';
  document.getElementById('theme-toggle-icon').textContent = isLight ? '☾' : '☀';
  document.getElementById('theme-toggle').setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
}

function toggleTheme() {
  appState.theme = appState.theme === 'light' ? 'dark' : 'light';
  saveState();
  applyTheme();
}

function updateUserBadge() {
  const initials = appState.profile.userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('') || 'OW';

  document.querySelector('.user-avatar').textContent = initials;
  document.querySelector('.user-name').textContent = appState.profile.userName;
  document.querySelector('.user-role').textContent = appState.profile.userRole;

  const meNode = appState.nodes.find(node => node.id === 'me');
  if (meNode) {
    meNode.name = appState.profile.companyName;
  }
}

function updateSignupForm() {
  renderSignupWalkthrough();
}

function parseSignupSpend(value) {
  const cleaned = String(value || '').replace(/[^0-9.]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
}

function handleSignupSubmit(event) {
  event.preventDefault();
  if (appState.signedUp) {
    navigateTo('datacontrol');
    return;
  }

  const answerInput = document.getElementById('walkthrough-answer');
  const currentStep = signupSteps[signupStepIndex];
  const answer = answerInput.value.trim() || currentStep.suggestions[0];

  signupDraft[currentStep.key] = answer;

  if (signupStepIndex < signupSteps.length - 1) {
    signupStepIndex += 1;
    renderSignupWalkthrough();
    return;
  }

  appState.profile = {
    ...appState.profile,
    userName: signupDraft.userName || appState.profile.userName,
    companyName: signupDraft.companyName || appState.profile.companyName,
    userRole: signupDraft.userRole || appState.profile.userRole,
    criticalCategory: signupDraft.criticalCategory || appState.profile.criticalCategory,
    annualSpend: parseSignupSpend(signupDraft.annualSpend) || appState.profile.annualSpend,
    planningCycle: signupDraft.planningCycle || appState.profile.planningCycle,
    goal: signupDraft.goal || appState.profile.goal,
    complianceFocus: signupDraft.complianceFocus || appState.profile.complianceFocus
  };
  appState.signedUp = true;
  appState.onboardingComplete = true;
  appState.lastRefreshAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const meNode = appState.nodes.find(node => node.id === 'me');
  if (meNode) {
    meNode.name = appState.profile.companyName;
  }

  saveState();
  renderAll();
  navigateTo('datacontrol');
}

function renderSignupWalkthrough() {
  const card = document.getElementById('signup-card');
  const answerInput = document.getElementById('walkthrough-answer');
  if (!card || !answerInput) return;

  if (appState.signedUp) {
    signupDraft = {
      userName: appState.profile.userName,
      companyName: appState.profile.companyName,
      userRole: appState.profile.userRole,
      criticalCategory: appState.profile.criticalCategory,
      annualSpend: appState.profile.annualSpend,
      planningCycle: appState.profile.planningCycle,
      goal: appState.profile.goal,
      complianceFocus: appState.profile.complianceFocus
    };
    signupStepIndex = signupSteps.length - 1;
  }

  const currentStep = signupSteps[signupStepIndex];
  card.classList.toggle('complete', appState.signedUp);
  document.getElementById('walkthrough-title').textContent = appState.signedUp ? 'Sign-up complete' : currentStep.title;
  document.getElementById('walkthrough-help').textContent = appState.signedUp
    ? `${appState.profile.companyName} has the basics saved. Next, add or edit suppliers in one place.`
    : currentStep.help;
  document.getElementById('walkthrough-question').textContent = appState.signedUp ? 'Next step: add suppliers' : currentStep.question;
  answerInput.placeholder = currentStep.placeholder;
  answerInput.value = signupDraft[currentStep.key] || (appState.signedUp ? appState.profile[currentStep.key] || '' : '');
  answerInput.toggleAttribute('readonly', appState.signedUp);

  document.getElementById('walkthrough-progress').innerHTML = signupSteps.map(() => '<span></span>').join('');
  document.querySelectorAll('#walkthrough-progress span').forEach((dot, index) => {
    dot.classList.toggle('active', index === signupStepIndex);
    dot.classList.toggle('done', index < signupStepIndex || appState.signedUp);
  });

  document.getElementById('walkthrough-chips').innerHTML = appState.signedUp
    ? `
      <div class="walkthrough-summary">
        <span>${escapeHtml(appState.profile.userName)}</span>
        <span>${escapeHtml(appState.profile.companyName)}</span>
        <span>${escapeHtml(appState.profile.userRole)}</span>
        <span>${escapeHtml(appState.profile.criticalCategory)}</span>
        <span>${formatMoney(appState.profile.annualSpend)} / year</span>
        <span>${escapeHtml(appState.profile.planningCycle)} plan</span>
      </div>
      <button type="button" class="chip-btn" id="walkthrough-edit">Edit sign up</button>
    `
    : currentStep.suggestions.map(suggestion => `
      <button type="button" class="chip-btn" data-signup-suggestion="${escapeHtml(suggestion)}">${escapeHtml(suggestion)}</button>
    `).join('');

  document.querySelectorAll('[data-signup-suggestion]').forEach(button => {
    button.addEventListener('click', () => {
      answerInput.value = button.getAttribute('data-signup-suggestion');
      answerInput.focus();
    });
  });

  const editButton = document.getElementById('walkthrough-edit');
  if (editButton) {
    editButton.addEventListener('click', () => {
      appState.signedUp = false;
      appState.onboardingComplete = false;
      signupStepIndex = 0;
      signupDraft = {
        userName: appState.profile.userName,
        companyName: appState.profile.companyName,
        userRole: appState.profile.userRole,
        criticalCategory: appState.profile.criticalCategory,
        annualSpend: appState.profile.annualSpend,
        planningCycle: appState.profile.planningCycle,
        goal: appState.profile.goal,
        complianceFocus: appState.profile.complianceFocus
      };
      saveState();
      renderAll();
    });
  }

  document.getElementById('walkthrough-back').disabled = appState.signedUp || signupStepIndex === 0;
  document.getElementById('walkthrough-next').textContent = appState.signedUp
    ? 'Add Suppliers'
    : signupStepIndex === signupSteps.length - 1
      ? 'Finish Sign Up'
      : 'Next';
}

function getDirectPartners() {
  return appState.links.filter(link => link.source === 'me' || link.target === 'me');
}

function getDirectSuppliers() {
  const supplierIds = new Set(
    appState.links
      .filter(link => link.target === 'me')
      .map(link => link.source)
  );

  return appState.nodes.filter(node => supplierIds.has(node.id));
}

function getRiskCounts() {
  const counts = { low: 0, medium: 0, high: 0 };

  appState.nodes.forEach(node => {
    if (node.id !== 'me' && counts[node.risk] !== undefined) {
      counts[node.risk] += 1;
    }
  });

  return counts;
}

function computeKPIs() {
  const directPartners = getDirectPartners();
  const inboundLinks = appState.links.filter(link => link.target === 'me');
  const dependencyScore = inboundLinks.reduce((max, link) => Math.max(max, link.weight), 0);
  const allScores = appState.nodes.filter(node => node.id !== 'me' && typeof node.score === 'number');
  const healthScore = allScores.length
    ? Math.round(allScores.reduce((sum, node) => sum + node.score, 0) / allScores.length)
    : 0;

  const riskCounts = getRiskCounts();
  let riskLevel = 'Low';

  if (riskCounts.high > 1 || dependencyScore >= 60) {
    riskLevel = 'High';
  } else if (riskCounts.high > 0 || dependencyScore >= 35) {
    riskLevel = 'Medium';
  }

  return {
    activeRelationships: directPartners.length,
    dependencyScore,
    riskLevel,
    healthScore
  };
}

function renderJourney() {
  const directPartners = getDirectPartners().length;
  const checklistItems = getChecklistItems();
  const completedCount = checklistItems.filter(item => item.complete).length;

  document.getElementById('signup-card').classList.toggle('complete', appState.signedUp);
  document.getElementById('home-result-copy').textContent = appState.onboardingComplete
    ? `${appState.profile.companyName} is ready. You can now see the best plan, problems, and supplier choices.`
    : 'Finish the simple sign-up first. Then add suppliers and the answer will appear here.';

  document.getElementById('journey-summary').innerHTML = `
    <div class="summary-pill">
      <span class="summary-label">Business</span>
      <strong>${escapeHtml(appState.profile.companyName)}</strong>
    </div>
    <div class="summary-pill">
      <span class="summary-label">Partners added</span>
      <strong>${directPartners}</strong>
    </div>
    <div class="summary-pill">
      <span class="summary-label">Important item</span>
      <strong>${escapeHtml(appState.profile.criticalCategory)}</strong>
    </div>
    <div class="summary-pill">
      <span class="summary-label">Spend</span>
      <strong>${formatMoney(appState.profile.annualSpend)}</strong>
    </div>
    <div class="summary-pill">
      <span class="summary-label">Done</span>
      <strong>${completedCount}/${checklistItems.length} complete</strong>
    </div>
  `;

  renderChecklist();
}

function getChecklistItems() {
  const directPartners = getDirectPartners().length;

  return [
    {
      label: 'Sign up done',
      detail: appState.signedUp ? `${appState.profile.companyName}, contact: ${appState.profile.userName}` : 'Enter name, company, and job',
      complete: appState.signedUp
    },
    {
      label: 'Goal chosen',
      detail: `${appState.profile.goal} for ${appState.profile.criticalCategory}`,
      complete: Boolean(appState.profile.goal)
    },
    {
      label: 'Money and planning added',
      detail: `${appState.profile.planningCycle} plan, ${formatMoney(appState.profile.annualSpend)} per year`,
      complete: Boolean(appState.profile.planningCycle && appState.profile.annualSpend)
    },
    {
      label: 'Sharing choice saved',
      detail: getVisibilityLabel(appState.visibilityMode),
      complete: Boolean(appState.visibilityMode)
    },
    {
      label: 'Add at least 2 partners',
      detail: `${directPartners} added so far`,
      complete: directPartners >= 2
    }
  ];
}

function renderChecklist() {
  const items = getChecklistItems();
  const completedCount = items.filter(item => item.complete).length;

  document.getElementById('setup-progress').textContent = `${completedCount} / ${items.length} done`;
  document.getElementById('setup-progress').className = `badge ${completedCount === items.length ? 'badge-green' : 'badge-amber'}`;
  document.getElementById('setup-checklist').innerHTML = items.map(item => `
    <div class="checklist-item ${item.complete ? 'complete' : ''}">
      <div class="checkmark">${item.complete ? '✓' : '•'}</div>
      <div>
        <div class="checklist-title">${escapeHtml(item.label)}</div>
        <div class="checklist-detail">${escapeHtml(item.detail)}</div>
      </div>
    </div>
  `).join('');
}

function renderDashboard() {
  const kpis = computeKPIs();
  const riskCounts = getRiskCounts();
  const alerts = appState.notifications;
  const trendData = buildTrendSeries(kpis.activeRelationships, kpis.healthScore);

  document.getElementById('kpi-rel-value').textContent = kpis.activeRelationships;
  document.getElementById('kpi-dep-value').textContent = `${kpis.dependencyScore}%`;
  document.getElementById('kpi-risk-value').textContent = kpis.riskLevel;
  document.getElementById('kpi-score-value').textContent = kpis.healthScore;

  document.querySelector('#kpi-relationships .kpi-trend').textContent = `${Math.max(1, Math.round(kpis.activeRelationships / 2))} important links`;
  document.querySelector('#kpi-dependency .kpi-trend').textContent = `Biggest supplier has ${kpis.dependencyScore}%`;
  document.querySelector('#kpi-risk .kpi-trend').textContent = `${riskCounts.high} serious problem(s)`;
  document.querySelector('#kpi-score .kpi-trend').textContent = `Checked ${appState.lastRefreshAt}`;

  const alertsList = document.getElementById('alerts-list');
  alertsList.innerHTML = '';
  alerts.forEach(notif => {
    alertsList.innerHTML += `
      <div class="alert-item ${notif.type}">
        <div class="alert-dot ${(notif.type === 'critical') ? 'red' : ((notif.type === 'warning') ? 'amber' : 'blue')}"></div>
        <div>
          <div class="alert-text">${notif.message}</div>
          <span class="alert-time">${notif.time}</span>
        </div>
      </div>
    `;
  });

  document.querySelector('#card-alerts .badge').textContent = `${alerts.length} live`;
  renderTrendChart(trendData);
  renderRiskDistributionChart(riskCounts);
}

function buildTrendSeries(relationshipCount, healthScore) {
  const base = Math.max(55, healthScore - 12);

  return [
    base - 4,
    base - 2,
    base - 1,
    base + Math.round(relationshipCount * 0.6),
    base + Math.round(relationshipCount * 0.8),
    healthScore
  ];
}

function renderTrendChart(dataSeries) {
  const ctxTrend = document.getElementById('chart-trend').getContext('2d');
  if (chartStore.trend) {
    chartStore.trend.destroy();
  }

  chartStore.trend = new Chart(ctxTrend, {
    type: 'line',
    data: {
      labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
      datasets: [{
        label: 'Network Health Score',
        data: dataSeries,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#0a0c10',
        pointBorderColor: '#3b82f6',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: '#1e2230' }, ticks: { color: '#8b8fa5' }, min: 40, max: 100 },
        x: { grid: { display: false }, ticks: { color: '#8b8fa5' } }
      }
    }
  });
}

function renderRiskDistributionChart(riskCounts) {
  const ctxDist = document.getElementById('chart-risk-dist').getContext('2d');
  if (chartStore.riskDistribution) {
    chartStore.riskDistribution.destroy();
  }

  chartStore.riskDistribution = new Chart(ctxDist, {
    type: 'doughnut',
    data: {
      labels: ['Low Risk', 'Medium Risk', 'High Risk'],
      datasets: [{
        data: [riskCounts.low, riskCounts.medium, riskCounts.high],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: { position: 'right', labels: { color: '#e8eaf0', usePointStyle: true, boxWidth: 6 } }
      }
    }
  });
}

function renderMiniGraph() {
  renderNetworkGraph('#mini-graph-container', true);
}

function renderNetworkGraph(containerSelector, isMini = false) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = '';

  const width = Math.max(container.clientWidth, isMini ? 240 : 640);
  const height = Math.max(container.clientHeight, isMini ? 200 : 540);
  const nodes = appState.nodes.map(node => Object.create(node));
  const links = appState.links.map(link => Object.create(link));

  const svg = d3.select(containerSelector)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', [0, 0, width, height]);

  const g = svg.append('g');

  if (!isMini) {
    svg.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.5, 4])
      .on('zoom', event => g.attr('transform', event.transform)));
  }

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(d => isMini ? 45 : 155 - (d.weight * 0.7)))
    .force('charge', d3.forceManyBody().strength(isMini ? -60 : -320))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide().radius(isMini ? 12 : 34));

  const link = g.append('g')
    .attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', d => d.status === 'risk' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(139, 143, 165, 0.3)')
    .attr('stroke-width', d => Math.max(1, d.weight / (isMini ? 20 : 10)));

  const node = g.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('class', 'node-circle')
    .attr('r', d => {
      if (d.id === 'me') return isMini ? 9 : 24;
      return isMini ? 5 : (10 + (d.score ? d.score / 15 : 0));
    })
    .attr('fill', d => getNodeColor(d))
    .attr('stroke', d => d.type === 'supplier' ? '#3b82f6' : '#a855f7')
    .call(drag(simulation));

  if (!isMini) {
    const labels = g.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('class', 'node-label')
      .text(d => d.name)
      .attr('dy', d => (16 + (d.score ? d.score / 15 : 4)));

    node.on('click', (_, nodeData) => showDetailPanel(nodeData));
    node.on('mouseover', (_, nodeData) => {
      link.transition().duration(200)
        .attr('stroke-opacity', line => (line.source.id === nodeData.id || line.target.id === nodeData.id) ? 1 : 0.1)
        .attr('stroke', line => (line.source.id === nodeData.id || line.target.id === nodeData.id) ? '#3b82f6' : 'rgba(139, 143, 165, 0.1)');
    });
    node.on('mouseout', () => {
      link.transition().duration(200)
        .attr('stroke-opacity', 0.6)
        .attr('stroke', d => d.status === 'risk' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(139, 143, 165, 0.3)');
    });

    simulation.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('cx', d => d.x).attr('cy', d => d.y);
      labels.attr('x', d => d.x).attr('y', d => d.y);
    });
  } else {
    simulation.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('cx', d => d.x).attr('cy', d => d.y);
    });
  }

  function drag(localSimulation) {
    function dragstarted(event) {
      if (!event.active) localSimulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) localSimulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }
}

function getNodeColor(node) {
  if (node.id === 'me') return '#ffffff';
  if (node.risk === 'high') return '#ef4444';
  if (node.risk === 'medium') return '#f59e0b';
  return '#10b981';
}

function showDetailPanel(nodeData) {
  if (nodeData.id === 'me') return;

  const panel = document.getElementById('detail-panel');
  const content = document.getElementById('detail-content');
  const relationship = appState.links.find(link =>
    (link.source === nodeData.id && link.target === 'me') ||
    (link.source === 'me' && link.target === nodeData.id)
  );

  let dependencyText = 'No direct connection added yet';
  if (relationship) {
    dependencyText = relationship.target === 'me'
      ? `<span style="color:var(--accent-amber); font-family:var(--font-mono); font-weight:700;">${relationship.weight}%</span> of your supply`
      : `<span style="color:var(--accent-blue); font-family:var(--font-mono); font-weight:700;">${relationship.weight}%</span> of your sales/work`;
  }

  let html = `
    <div class="detail-header">
      <span class="detail-node-type ${nodeData.type}">${nodeData.type.toUpperCase()}</span>
      <div class="detail-name">${escapeHtml(nodeData.name)}</div>
      <div class="detail-id">ID: EXT-${escapeHtml(nodeData.id.toUpperCase())}-0932</div>
    </div>

    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">
      How much this matters: <br>${dependencyText}
    </div>

    <div class="detail-scores">
      <div class="score-box" style="border-color: ${nodeData.risk === 'low' ? 'var(--accent-green)' : (nodeData.risk === 'high' ? 'var(--accent-red)' : 'var(--accent-amber)')};">
        <span class="score-val" style="color: ${nodeData.risk === 'low' ? 'var(--accent-green)' : (nodeData.risk === 'high' ? 'var(--accent-red)' : 'var(--accent-amber)')};">${nodeData.score || 'N/A'}</span>
        <span class="score-label">Trust score</span>
      </div>
      <div class="score-box">
        <span class="score-val" style="color: var(--text-primary);">${nodeData.risk.toUpperCase()}</span>
        <span class="score-label">Problem level</span>
      </div>
    </div>
  `;

  if (nodeData.type === 'supplier' && nodeData.delivery) {
    html += `
      <div class="detail-chart-area">
        <h4 style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">Performance Metrics</h4>
        <canvas id="detail-radar-chart"></canvas>
      </div>
      <div class="detail-data-grid">
        <div><span>Capacity</span><strong>${nodeData.capacityShare || 0}%</strong></div>
        <div><span>Cost index</span><strong>${nodeData.unitCostIndex || 100}</strong></div>
        <div><span>Lead time</span><strong>${nodeData.leadTime || 0}d</strong></div>
        <div><span>Disruption</span><strong>${nodeData.disruptionProbability || 0}%</strong></div>
        <div><span>Compliance</span><strong>${nodeData.complianceScore || 0}</strong></div>
        <div><span>Defects</span><strong>${nodeData.defectPpm || 0}ppm</strong></div>
      </div>
      <div style="margin-top:20px; padding:12px; border:1px dashed var(--border); border-radius:6px;">
        <span style="font-size:0.75rem; color:var(--text-secondary); display:block; margin-bottom:8px;">Recent Activity Logs</span>
        <div style="font-size:0.7rem; color:var(--text-muted); line-height:1.6;">
          • Delivery confidence tracked across network peers<br>
          • Price posture updated from your selected setup mode<br>
          • Recommended as ${nodeData.risk === 'high' ? 'backup-only' : 'active candidate'}
        </div>
      </div>
      <button class="btn-primary btn-compare-from-detail" id="btn-compare-from-detail">Compare Supplier</button>
    `;
  }

  content.innerHTML = html;
  panel.classList.remove('hidden');

  document.getElementById('close-detail').onclick = () => panel.classList.add('hidden');

  const compareBtn = document.getElementById('btn-compare-from-detail');
  if (compareBtn) {
    compareBtn.addEventListener('click', () => {
      navigateTo('comparison');
      const compareA = document.getElementById('compare-a');
      if (compareA) {
        compareA.value = nodeData.id;
        updateComparison();
      }
      panel.classList.add('hidden');
    });
  }

  if (nodeData.type === 'supplier' && nodeData.delivery) {
    setTimeout(() => {
      const canvas = document.getElementById('detail-radar-chart');
      if (!canvas) return;
      if (detailRadarChart) {
        detailRadarChart.destroy();
      }

      detailRadarChart = new Chart(canvas.getContext('2d'), {
        type: 'radar',
        data: {
          labels: ['Delivery', 'Quality', 'Price', 'Payment'],
          datasets: [{
            label: 'Score',
            data: [nodeData.delivery, nodeData.quality, nodeData.price, nodeData.payment],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: '#3b82f6',
            pointBackgroundColor: '#3b82f6',
            borderWidth: 1.5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: { color: 'rgba(255,255,255,0.05)' },
              grid: { color: 'rgba(255,255,255,0.05)' },
              pointLabels: { color: '#8b8fa5', font: { size: 9 } },
              suggestedMin: 0,
              suggestedMax: 100
            }
          },
          plugins: { legend: { display: false } }
        }
      });
    }, 80);
  }
}

function renderComparisonTool() {
  const suppliers = appState.nodes.filter(node => node.type === 'supplier');
  const selects = ['compare-a', 'compare-b', 'compare-c'];

  selects.forEach((id, index) => {
    const select = document.getElementById(id);
    const current = select.value;
    select.innerHTML = `<option value="">${index === 2 ? '— Optional —' : '— Select —'}</option>`;

    suppliers.forEach(supplier => {
      const option = document.createElement('option');
      option.value = supplier.id;
      option.textContent = supplier.name;
      select.appendChild(option);
    });

    if (suppliers.some(supplier => supplier.id === current)) {
      select.value = current;
    } else if (!select.value && suppliers[index]) {
      select.value = suppliers[index].id;
    }

    select.onchange = updateComparison;
  });

  ['price', 'reliability', 'delivery', 'risk'].forEach(metric => {
    const slider = document.getElementById(`w-${metric}`);
    document.getElementById(`w-${metric}-val`).textContent = `${slider.value}%`;
    slider.oninput = event => {
      document.getElementById(`w-${metric}-val`).textContent = `${event.target.value}%`;
      updateComparison();
    };
  });

  updateComparison();
}

function updateComparison() {
  const getSupplier = id => appState.nodes.find(node => node.id === id);
  const selected = [
    getSupplier(document.getElementById('compare-a').value),
    getSupplier(document.getElementById('compare-b').value),
    getSupplier(document.getElementById('compare-c').value)
  ].filter(Boolean);

  const resultsContainer = document.getElementById('comparison-results');
  resultsContainer.innerHTML = '';

  if (!selected.length) {
    resultsContainer.innerHTML = '<div style="color:var(--text-muted); padding:20px;">Select suppliers to compare above.</div>';
    if (radarChartInstance) radarChartInstance.destroy();
    return;
  }

  const wPrice = parseInt(document.getElementById('w-price').value, 10) / 100;
  const wRel = parseInt(document.getElementById('w-reliability').value, 10) / 100;
  const wDel = parseInt(document.getElementById('w-delivery').value, 10) / 100;
  const wRisk = parseInt(document.getElementById('w-risk').value, 10) / 100;
  const riskMap = { low: 90, medium: 60, high: 30 };

  let bestScore = -1;
  let bestId = null;
  const datasetStore = [];

  selected.forEach(supplier => {
    const rawRisk = riskMap[supplier.risk];
    const finalScore = Math.round(
      (supplier.price * wPrice) +
      (supplier.score * wRel) +
      (supplier.delivery * wDel) +
      (rawRisk * wRisk)
    );

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestId = supplier.id;
    }

    datasetStore.push({
      label: supplier.name,
      data: [supplier.price, supplier.score, supplier.delivery, rawRisk],
      fill: true,
      borderColor: getDarkColor(datasetStore.length),
      backgroundColor: getLightColor(datasetStore.length),
      pointBackgroundColor: getDarkColor(datasetStore.length)
    });
  });

  selected.forEach(supplier => {
    const finalScore = Math.round(
      (supplier.price * wPrice) +
      (supplier.score * wRel) +
      (supplier.delivery * wDel) +
      (riskMap[supplier.risk] * wRisk)
    );

    resultsContainer.innerHTML += `
      <div class="compare-card ${supplier.id === bestId ? 'winner' : ''}">
        <div class="compare-card-name">${escapeHtml(supplier.name)}</div>
        <div class="compare-metrics">
          ${renderMetricBar('Lower price', supplier.price)}
          ${renderMetricBar('Good work', supplier.score)}
          ${renderMetricBar('On-time delivery', supplier.delivery)}
          ${renderMetricBar('Safety', riskMap[supplier.risk])}
        </div>
        <div class="compare-total">
          <span class="compare-total-label">Best fit score</span>
          <span class="compare-total-value color-${supplier.id === bestId ? 'green' : 'blue'}">${finalScore}</span>
        </div>
      </div>
    `;
  });

  renderComparisonRadar(datasetStore);
}

function renderMetricBar(label, value) {
  let colorClass = 'var(--accent-blue)';
  if (value < 60) colorClass = 'var(--accent-red)';
  else if (value < 80) colorClass = 'var(--accent-amber)';
  else if (value >= 90) colorClass = 'var(--accent-green)';

  return `
    <div class="compare-metric">
      <span class="compare-metric-label">${label}</span>
      <div class="compare-metric-bar">
        <div class="compare-metric-fill" style="width: ${value}%; background: ${colorClass};"></div>
      </div>
      <span class="compare-metric-val">${value}</span>
    </div>
  `;
}

function getDarkColor(idx) {
  return ['#3b82f6', '#10b981', '#a855f7'][idx % 3];
}

function getLightColor(idx) {
  return ['rgba(59, 130, 246, 0.2)', 'rgba(16, 185, 129, 0.2)', 'rgba(168, 85, 247, 0.2)'][idx % 3];
}

function renderComparisonRadar(datasets) {
  const ctx = document.getElementById('chart-radar').getContext('2d');
  if (radarChartInstance) {
    radarChartInstance.destroy();
  }

  radarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Price', 'Good work', 'Delivery', 'Safety'],
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: 'rgba(255,255,255,0.05)' },
          grid: { color: 'rgba(255,255,255,0.05)' },
          pointLabels: { color: '#8b8fa5', font: { size: 11 } },
          ticks: { display: false },
          suggestedMin: 0,
          suggestedMax: 100
        }
      },
      plugins: {
        legend: { position: 'bottom', labels: { color: '#e8eaf0', usePointStyle: true, padding: 20 } }
      }
    }
  });
}

function renderRiskDashboard() {
  const heatContainer = document.getElementById('heatmap-container');
  const directSuppliers = getDirectSuppliers();
  const supplierRows = (directSuppliers.length ? directSuppliers : appState.nodes.filter(node => node.type === 'supplier').slice(0, 4))
    .map(supplier => ({
      label: supplier.name,
      riskBlocks: buildRiskBlocks(supplier)
    }));

  heatContainer.innerHTML = '';
  supplierRows.forEach(row => {
    const blocksHtml = row.riskBlocks.map(val => {
      let background = '#10b981';
      let danger = 'Looks safe';
      if (val > 3 && val <= 6) { background = '#f59e0b'; danger = 'Watch'; }
      if (val > 6) { background = '#ef4444'; danger = 'Problem'; }

      return `
        <div class="heatmap-cell" style="background-color: ${background}; opacity: ${0.4 + (val * 0.06)};">
          <div class="heatmap-cell-tooltip">Problem score: ${val}/10<br>${danger}</div>
        </div>
      `;
    }).join('');

    heatContainer.innerHTML += `
      <div class="heatmap-row">
        <div class="heatmap-label">${escapeHtml(row.label)}</div>
        <div class="heatmap-cells">${blocksHtml}</div>
      </div>
    `;
  });

  heatContainer.innerHTML += `
    <div class="heatmap-legend">
      <span class="heatmap-legend-label">Safe (0)</span>
      <div class="heatmap-gradient"></div>
      <span class="heatmap-legend-label">Critical (10)</span>
    </div>
  `;

  const riskAlertsList = document.getElementById('risk-alerts-list');
  riskAlertsList.innerHTML = '';
  appState.notifications
    .filter(notif => notif.type === 'critical' || notif.type === 'warning')
    .forEach(notif => {
      riskAlertsList.innerHTML += `
        <div class="risk-alert-item ${notif.type === 'warning' ? 'medium' : ''}">
          <div class="risk-alert-title">${notif.title}</div>
          <div class="risk-alert-desc">${notif.message}</div>
        </div>
      `;
    });

  const actionsList = document.getElementById('suggested-actions');
  const riskySuppliers = appState.nodes.filter(node => node.type === 'supplier' && node.risk !== 'low').slice(0, 2);
  actionsList.innerHTML = riskySuppliers.map(supplier => `
    <div class="action-item">
      <div class="action-icon ${supplier.risk === 'high' ? 'amber' : 'blue'}">${supplier.risk === 'high' ? '!' : '⟲'}</div>
      <div class="action-text">
        <span class="action-title">${supplier.risk === 'high' ? 'Find a backup for' : 'Keep watching'} ${escapeHtml(supplier.name)}</span>
        <span class="action-desc">${supplier.risk === 'high' ? 'Do not depend on this supplier too much. Add another option.' : 'They may be okay, but check price and delivery before giving more work.'}</span>
      </div>
    </div>
  `).join('');

  renderRiskTimelineChart();
}

function buildRiskBlocks(supplier) {
  const base = supplier.risk === 'high' ? 7 : supplier.risk === 'medium' ? 4 : 1;
  return [0, 1, 2, 3, 4, 5, 6].map(index => Math.min(10, base + ((supplier.score + index) % 3)));
}

function renderRiskTimelineChart() {
  const riskCounts = getRiskCounts();
  const ctxRisk = document.getElementById('chart-risk-time').getContext('2d');
  if (chartStore.riskTimeline) {
    chartStore.riskTimeline.destroy();
  }

  chartStore.riskTimeline = new Chart(ctxRisk, {
    type: 'bar',
    data: {
      labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
      datasets: [
        { label: 'Problem', data: [Math.max(0, riskCounts.high - 1), riskCounts.high, riskCounts.high, riskCounts.high + 1, riskCounts.high, riskCounts.high], backgroundColor: '#ef4444' },
        { label: 'Watch', data: [riskCounts.medium, riskCounts.medium + 1, riskCounts.medium, riskCounts.medium, riskCounts.medium + 1, riskCounts.medium], backgroundColor: '#f59e0b' },
        { label: 'Looks safe', data: [riskCounts.low + 1, riskCounts.low, riskCounts.low + 1, riskCounts.low, riskCounts.low, riskCounts.low + 1], backgroundColor: '#10b981' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, grid: { display: false } },
        y: { stacked: true, grid: { color: '#1e2230' }, ticks: { display: false } }
      },
      plugins: { legend: { labels: { color: '#e8eaf0', usePointStyle: true, boxWidth: 8 } } }
    }
  });
}

function renderMonteCarloSimulator() {
  updateSimulationControlLabels();
  renderSimulationPreview();
}

function updateSimulationControlLabels() {
  const sim = appState.simulation;
  document.getElementById('sim-horizon').value = sim.horizon;
  document.getElementById('sim-iterations').value = sim.iterations;
  document.getElementById('sim-volatility').value = sim.volatility;
  document.getElementById('sim-buffer').value = sim.buffer;
  document.getElementById('sim-horizon-val').textContent = `${sim.horizon} days`;
  document.getElementById('sim-iterations-val').textContent = sim.iterations.toLocaleString();
  document.getElementById('sim-volatility-val').textContent = `${sim.volatility}%`;
  document.getElementById('sim-buffer-val').textContent = `${sim.buffer} days`;
}

function renderSimulationPreview() {
  const results = appState.simulation.lastRun || runSimulationModel(false);
  renderSimulationResults(results, !appState.simulation.lastRun);
  renderSimulationChart(results.buckets);
}

function runMonteCarloSimulation() {
  appState.simulation.lastRun = runSimulationModel(true);
  appState.lastRefreshAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  appState.notifications.unshift({
    id: Date.now(),
    type: appState.simulation.lastRun.stockoutProbability > 35 ? 'warning' : 'info',
    title: 'What-if test done',
    message: `We tested possible trouble for <strong>${escapeHtml(appState.profile.criticalCategory)}</strong> over ${appState.simulation.horizon} days.`,
    time: 'just now'
  });
  appState.notifications = appState.notifications.slice(0, 6);
  saveState();
  renderAll();
}

function runSimulationModel(useRandom) {
  const sim = appState.simulation;
  const suppliers = getDirectSuppliers();
  const activeSuppliers = suppliers.length ? suppliers : appState.nodes.filter(node => node.type === 'supplier').slice(0, 3);
  const totalWeight = activeSuppliers.reduce((sum, supplier) => sum + getRelationshipWeight(supplier.id), 0) || 1;
  const baseDailySpend = (appState.profile.annualSpend || 2500000) / 365;
  const bins = new Array(8).fill(0);
  let totalLoss = 0;
  let stockoutCount = 0;
  let p95Loss = [];
  let weightedService = 0;

  for (let i = 0; i < sim.iterations; i += 1) {
    const demandShock = Math.max(0.45, 1 + sampleNormal(useRandom) * (sim.volatility / 100));
    let scenarioLoss = 0;
    let scenarioDelay = 0;

    activeSuppliers.forEach(supplier => {
      const weight = getRelationshipWeight(supplier.id) / totalWeight;
      const disruptionProbability = getSupplierDisruptionProbability(supplier);
      const disrupted = sampleUniform(useRandom, i, supplier.id) < disruptionProbability;
      const recoveryDays = supplier.recoveryDays || (supplier.risk === 'high' ? 28 : supplier.risk === 'medium' ? 18 : 9);
      const leadTime = supplier.leadTime || (supplier.risk === 'high' ? 35 : supplier.risk === 'medium' ? 24 : 14);
      const delayDays = disrupted ? Math.max(0, recoveryDays + leadTime - sim.buffer) : Math.max(0, leadTime - sim.buffer) * 0.08;
      const exposure = baseDailySpend * sim.horizon * weight * demandShock;

      scenarioDelay += delayDays * weight;
      scenarioLoss += exposure * (delayDays / Math.max(1, sim.horizon)) * (supplier.risk === 'high' ? 1.35 : supplier.risk === 'medium' ? 1.08 : 0.78);
    });

    if (scenarioDelay > sim.buffer * 0.6) {
      stockoutCount += 1;
    }

    totalLoss += scenarioLoss;
    p95Loss.push(scenarioLoss);
    const bucketIndex = Math.min(bins.length - 1, Math.floor(scenarioLoss / Math.max(1, baseDailySpend * sim.horizon * 0.025)));
    bins[bucketIndex] += 1;
  }

  p95Loss = p95Loss.sort((a, b) => a - b);
  weightedService = Math.max(0, 100 - ((stockoutCount / sim.iterations) * 100));

  return {
    averageLoss: Math.round(totalLoss / sim.iterations),
    p95Loss: Math.round(p95Loss[Math.floor(sim.iterations * 0.95)] || 0),
    stockoutProbability: Math.round((stockoutCount / sim.iterations) * 100),
    serviceLevel: Math.round(weightedService),
    suppliersModeled: activeSuppliers.length,
    buckets: bins,
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

function renderSimulationResults(results, isPreview) {
  document.getElementById('simulation-results').innerHTML = `
    <div class="sim-kpi ${results.stockoutProbability > 35 ? 'danger' : ''}">
      <span class="summary-label">${isPreview ? 'Quick look' : 'Tested'} chance of shortage</span>
      <strong>${results.stockoutProbability}%</strong>
    </div>
    <div class="sim-kpi">
      <span class="summary-label">Money at risk</span>
      <strong>${formatMoney(results.averageLoss)}</strong>
    </div>
    <div class="sim-kpi">
      <span class="summary-label">Bad case loss</span>
      <strong>${formatMoney(results.p95Loss)}</strong>
    </div>
    <div class="sim-kpi">
      <span class="summary-label">Plan safety</span>
      <strong>${results.serviceLevel}%</strong>
    </div>
    <p class="simulation-note">
      We checked ${results.suppliersModeled} supplier path(s) for ${escapeHtml(appState.profile.criticalCategory)}. This is a planning helper, not a promise.
    </p>
  `;
}

function renderSimulationChart(buckets) {
  const ctx = document.getElementById('chart-simulation').getContext('2d');
  if (chartStore.simulation) {
    chartStore.simulation.destroy();
  }

  chartStore.simulation = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['0-3%', '3-6%', '6-9%', '9-12%', '12-15%', '15-18%', '18-21%', '21%+'],
      datasets: [{
        label: 'Scenario count',
        data: buckets,
        backgroundColor: buckets.map((_, index) => index > 4 ? '#ef4444' : index > 2 ? '#f59e0b' : '#3b82f6')
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: '#1e2230' }, ticks: { color: '#8b8fa5' } },
        x: { grid: { display: false }, ticks: { color: '#8b8fa5' } }
      }
    }
  });
}

function getRelationshipWeight(nodeId) {
  const link = appState.links.find(candidate =>
    (candidate.source === nodeId && candidate.target === 'me') ||
    (candidate.source === 'me' && candidate.target === nodeId)
  );

  return link?.weight || 10;
}

function getSupplierDisruptionProbability(supplier) {
  if (supplier.disruptionProbability) {
    return supplier.disruptionProbability / 100;
  }

  return supplier.risk === 'high' ? 0.32 : supplier.risk === 'medium' ? 0.16 : 0.06;
}

function sampleUniform(useRandom, iteration, salt) {
  if (useRandom) return Math.random();

  const text = `${iteration}-${salt}-${appState.simulation.horizon}-${appState.simulation.volatility}`;
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 10000) / 10000;
}

function sampleNormal(useRandom) {
  const u1 = Math.max(0.0001, useRandom ? Math.random() : sampleUniform(false, 17, 'normal-a'));
  const u2 = Math.max(0.0001, useRandom ? Math.random() : sampleUniform(false, 31, 'normal-b'));
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

function renderOptimizationScreen() {
  const dependencyScore = computeKPIs().dependencyScore;
  const targetDependency = Math.max(20, dependencyScore - 25);
  document.getElementById('opt-current').textContent = `${dependencyScore}%`;
  document.getElementById('opt-target').textContent = `${targetDependency}%`;

  const optimizer = calculateOptimizedAllocation();
  const strongestSupplier = optimizer.rows
    .filter(row => row.currentShare > 0)
    .sort((a, b) => b.currentShare - a.currentShare)[0];

  const dynamicRecommendations = [
    strongestSupplier ? {
      title: `Give less work to ${strongestSupplier.name}`,
      desc: `Suggested: ${strongestSupplier.recommendedShare}% instead of ${strongestSupplier.currentShare}%. This lowers over-dependence.`,
      impact: `Plan improves by ${optimizer.improvementScore} points`,
      icon: 'blue',
      symbol: '⟲'
    } : null,
    {
      title: `Check ${optimizer.bestCandidate?.name || 'a backup supplier'} next`,
      desc: `This looks like a strong backup choice. Score: ${optimizer.bestCandidate?.optimizationScore || 0}/100.`,
      impact: `Helps with ${appState.profile.complianceFocus}`,
      icon: 'green',
      symbol: '↗'
    },
    {
      title: 'Test the plan before you trust it',
      desc: 'Use the What-If Test to see what may happen if demand changes or a supplier is late.',
      impact: `Fits your ${appState.profile.planningCycle.toLowerCase()} planning`,
      icon: 'amber',
      symbol: '!'
    }
  ].filter(Boolean);

  const recommendations = dynamicRecommendations.slice(0, 4);
  const container = document.getElementById('optimization-cards');
  container.innerHTML = recommendations.map(rec => `
    <div class="opt-card">
      <div class="opt-card-header">
        <div class="opt-card-icon ${rec.icon}">${rec.symbol}</div>
        <div class="opt-card-title">${escapeHtml(rec.title)}</div>
      </div>
      <div class="opt-card-desc">${escapeHtml(rec.desc)}</div>
      <div class="opt-card-impact">
        <span class="impact-label">Why it helps:</span>
        <span class="impact-value">${escapeHtml(rec.impact)}</span>
      </div>
    </div>
  `).join('');

  renderOptimizerOutput(optimizer);
}

function calculateOptimizedAllocation() {
  const directWeights = getDirectSupplierWeights();
  const currentTotal = Object.values(directWeights).reduce((sum, weight) => sum + weight, 0) || 1;
  const suppliers = appState.nodes
    .filter(node => node.type === 'supplier' && (node.categoryFit || 0) >= 60)
    .map(supplier => {
      const currentShare = Math.round(((directWeights[supplier.id] || 0) / currentTotal) * 100);
      const optimizationScore = calculateSupplierOptimizationScore(supplier, currentShare);
      return {
        ...supplier,
        currentShare,
        optimizationScore,
        allocationCap: Math.max(0, Math.min(supplier.capacityShare || 25, supplier.maxShare || 25, getConcentrationCap(supplier)))
      };
    })
    .sort((a, b) => b.optimizationScore - a.optimizationScore);

  let remaining = 100;
  const allocations = new Map();

  suppliers.forEach(supplier => {
    const minimum = supplier.currentShare > 0 ? Math.min(supplier.minShare || 0, supplier.allocationCap) : 0;
    if (minimum > 0 && remaining > 0) {
      const share = Math.min(minimum, remaining);
      allocations.set(supplier.id, share);
      remaining -= share;
    }
  });

  suppliers.forEach(supplier => {
    if (remaining <= 0) return;
    const existing = allocations.get(supplier.id) || 0;
    const room = Math.max(0, supplier.allocationCap - existing);
    const share = Math.min(room, remaining);
    if (share > 0) {
      allocations.set(supplier.id, existing + share);
      remaining -= share;
    }
  });

  if (remaining > 0 && suppliers.length) {
    const safest = suppliers[0];
    allocations.set(safest.id, (allocations.get(safest.id) || 0) + remaining);
  }

  const rows = suppliers
    .map(supplier => {
      const recommendedShare = Math.round(allocations.get(supplier.id) || 0);
      return {
        id: supplier.id,
        name: supplier.name,
        risk: supplier.risk,
        currentShare: supplier.currentShare,
        recommendedShare,
        delta: recommendedShare - supplier.currentShare,
        optimizationScore: supplier.optimizationScore,
        reason: getOptimizationReason(supplier, recommendedShare),
        constraint: getOptimizationConstraint(supplier)
      };
    })
    .filter(row => row.currentShare > 0 || row.recommendedShare > 0)
    .sort((a, b) => b.recommendedShare - a.recommendedShare);

  const currentPortfolioScore = suppliers.reduce((sum, supplier) => sum + (supplier.optimizationScore * (supplier.currentShare / 100)), 0);
  const recommendedPortfolioScore = suppliers.reduce((sum, supplier) => sum + (supplier.optimizationScore * ((allocations.get(supplier.id) || 0) / 100)), 0);
  const currentMax = Math.max(...rows.map(row => row.currentShare), 0);
  const recommendedMax = Math.max(...rows.map(row => row.recommendedShare), 0);

  return {
    rows,
    bestCandidate: suppliers.find(supplier => supplier.currentShare === 0) || suppliers[0],
    currentPortfolioScore: Math.round(currentPortfolioScore),
    recommendedPortfolioScore: Math.round(recommendedPortfolioScore),
    improvementScore: Math.max(0, Math.round(recommendedPortfolioScore - currentPortfolioScore)),
    currentMax,
    recommendedMax,
    estimatedSavings: estimateOptimizationSavings(rows, suppliers)
  };
}

function calculateSupplierOptimizationScore(supplier, currentShare) {
  const costScore = clamp(160 - (supplier.unitCostIndex || 100), 0, 100);
  const leadTimeScore = clamp(110 - ((supplier.leadTime || 20) * 2), 0, 100);
  const disruptionScore = clamp(100 - ((supplier.disruptionProbability || 10) * 2), 0, 100);
  const qualityScore = clamp(100 - ((supplier.defectPpm || 400) / 20), 0, 100);
  const geoScore = clamp(100 - (supplier.geoRisk || 30), 0, 100);
  const switchingPenalty = currentShare > 0 ? 0 : clamp((supplier.switchingCost || 0) / 3000, 0, 18);

  const score =
    ((supplier.categoryFit || 75) * 0.13) +
    ((supplier.score || 75) * 0.11) +
    ((supplier.onTimeDelivery || supplier.delivery || 75) * 0.11) +
    (qualityScore * 0.08) +
    ((supplier.complianceScore || 75) * 0.14) +
    ((supplier.cyberScore || 70) * 0.06) +
    ((supplier.esgScore || 70) * 0.04) +
    (costScore * 0.11) +
    (leadTimeScore * 0.08) +
    (disruptionScore * 0.10) +
    (geoScore * 0.04) -
    switchingPenalty;

  return Math.round(clamp(score, 0, 100));
}

function getDirectSupplierWeights() {
  return appState.links
    .filter(link => link.target === 'me')
    .reduce((weights, link) => {
      weights[link.source] = (weights[link.source] || 0) + link.weight;
      return weights;
    }, {});
}

function getConcentrationCap(supplier) {
  if (supplier.risk === 'high') return 15;
  if ((supplier.disruptionProbability || 0) > 25) return 18;
  if ((supplier.complianceScore || 100) < 65) return 20;
  return 45;
}

function getOptimizationReason(supplier, recommendedShare) {
  if (recommendedShare === 0) return 'Below threshold after risk, compliance, and recovery constraints.';
  if ((supplier.disruptionProbability || 0) > 25) return 'Capped due to disruption probability and recovery exposure.';
  if ((supplier.unitCostIndex || 100) < 98 && (supplier.complianceScore || 0) >= 75) return 'Cost-efficient with acceptable control maturity.';
  if ((supplier.onTimeDelivery || 0) >= 90 && (supplier.leadTime || 99) <= 18) return 'Strong delivery performance and short lead time.';
  if ((supplier.categoryFit || 0) >= 90) return 'High category fit for the selected critical category.';
  return 'Balanced contribution to resilience and concentration reduction.';
}

function getOptimizationConstraint(supplier) {
  const caps = [
    `capacity ${supplier.capacityShare || 0}%`,
    `max ${supplier.maxShare || 0}%`
  ];

  if (supplier.risk === 'high') caps.push('risk cap 15%');
  if ((supplier.complianceScore || 100) < 65) caps.push('compliance cap');
  return caps.join(' / ');
}

function estimateOptimizationSavings(rows, suppliers) {
  const annualSpend = appState.profile.annualSpend || 0;
  const supplierMap = new Map(suppliers.map(supplier => [supplier.id, supplier]));
  const currentCost = rows.reduce((sum, row) => {
    const supplier = supplierMap.get(row.id);
    return sum + ((row.currentShare / 100) * annualSpend * ((supplier?.unitCostIndex || 100) / 100));
  }, 0);
  const recommendedCost = rows.reduce((sum, row) => {
    const supplier = supplierMap.get(row.id);
    return sum + ((row.recommendedShare / 100) * annualSpend * ((supplier?.unitCostIndex || 100) / 100));
  }, 0);

  return Math.round(currentCost - recommendedCost);
}

function renderOptimizerOutput(optimizer) {
  const summary = document.getElementById('optimizer-summary');
  const tableBody = document.getElementById('optimizer-table-body');
  const simpleSavingsLabel = optimizer.estimatedSavings >= 0 ? 'Money you may save' : 'Extra cost for safety';

  summary.innerHTML = `
    <div class="sim-kpi">
      <span class="summary-label">Score now</span>
      <strong>${optimizer.currentPortfolioScore}/100</strong>
    </div>
    <div class="sim-kpi">
      <span class="summary-label">Score after plan</span>
      <strong>${optimizer.recommendedPortfolioScore}/100</strong>
    </div>
    <div class="sim-kpi">
      <span class="summary-label">Big supplier reduced</span>
      <strong>${optimizer.currentMax}% → ${optimizer.recommendedMax}%</strong>
    </div>
    <div class="sim-kpi">
      <span class="summary-label">${simpleSavingsLabel}</span>
      <strong>${formatMoney(Math.abs(optimizer.estimatedSavings))}</strong>
    </div>
  `;

  tableBody.innerHTML = optimizer.rows.map(row => `
    <tr>
      <td>
        <strong>${escapeHtml(row.name)}</strong>
        <span class="table-sub">${plainRisk(row.risk)} • score ${row.optimizationScore}</span>
      </td>
      <td>${row.currentShare}%</td>
      <td><span class="${row.delta >= 0 ? 'color-green' : 'color-amber'}">${row.recommendedShare}%</span></td>
      <td>${escapeHtml(row.reason)}</td>
      <td>${escapeHtml(row.constraint)}</td>
    </tr>
  `).join('');
}

function renderDataControl() {
  const container = document.getElementById('data-control-grid');
  const directPartners = getDirectPartners();

  container.innerHTML = `
    <div class="dc-card dc-card-wide">
      <div class="card-header">
        <h3>Your Business</h3>
        <span class="badge badge-green">${appState.onboardingComplete ? 'Saved' : 'Needs setup'}</span>
      </div>
      <form id="profile-form" class="stack-form">
        <div class="form-grid compact">
          <label class="form-field">
            <span>Company name</span>
            <input type="text" name="companyName" value="${escapeHtml(appState.profile.companyName)}">
          </label>
          <label class="form-field">
            <span>Your name</span>
            <input type="text" name="userName" value="${escapeHtml(appState.profile.userName)}">
          </label>
          <label class="form-field">
            <span>Your job</span>
            <input type="text" name="userRole" value="${escapeHtml(appState.profile.userRole)}">
          </label>
          <label class="form-field">
            <span>Business type</span>
            <input type="text" name="sector" value="${escapeHtml(appState.profile.sector)}">
          </label>
          <label class="form-field">
            <span>Main area</span>
            <input type="text" name="region" value="${escapeHtml(appState.profile.region)}">
          </label>
          <label class="form-field">
            <span>What you want help with</span>
            <input type="text" name="goal" value="${escapeHtml(appState.profile.goal)}">
          </label>
          <label class="form-field">
            <span>Important item or material</span>
            <input type="text" name="criticalCategory" value="${escapeHtml(appState.profile.criticalCategory)}">
          </label>
          <label class="form-field">
            <span>How often you plan</span>
            <select name="planningCycle">
              ${['Weekly', 'Monthly', 'Quarterly'].map(option => `<option value="${option}" ${appState.profile.planningCycle === option ? 'selected' : ''}>${option}</option>`).join('')}
            </select>
          </label>
          <label class="form-field">
            <span>Money spent per year</span>
            <input type="number" name="annualSpend" min="0" step="1000" value="${appState.profile.annualSpend}">
          </label>
          <label class="form-field">
            <span>Biggest trust concern</span>
            <select name="complianceFocus">
              ${['Quality and delivery SLAs', 'Financial stability', 'Cyber and data sharing', 'ESG and responsible sourcing'].map(option => `<option value="${option}" ${appState.profile.complianceFocus === option ? 'selected' : ''}>${option}</option>`).join('')}
            </select>
          </label>
        </div>
        <div class="inline-actions">
          <button type="submit" class="btn-primary">Save</button>
        </div>
      </form>
    </div>

    <div class="dc-card dc-card-wide">
      <div class="card-header">
        <h3>Add Supplier or Buyer</h3>
        <span class="badge badge-amber">${directPartners.length} added</span>
      </div>
      <form id="partner-form" class="stack-form">
        <div class="form-grid compact">
          <label class="form-field">
            <span>Name</span>
            <input type="text" name="partnerName" placeholder="Aurora Metals" required>
          </label>
          <label class="form-field">
            <span>Are they a supplier or buyer?</span>
            <select name="partnerType">
              <option value="supplier">Supplier</option>
              <option value="buyer">Buyer</option>
            </select>
          </label>
          <label class="form-field">
            <span>How risky?</span>
            <select name="partnerRisk">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label class="form-field">
            <span>How good? (30 to 99)</span>
            <input type="number" name="partnerScore" min="30" max="99" value="78" required>
          </label>
          <label class="form-field">
            <span>How much do you depend on them? %</span>
            <input type="number" name="partnerWeight" min="5" max="95" value="20" required>
          </label>
          <label class="form-field">
            <span>Days to deliver</span>
            <input type="number" name="leadTime" min="1" max="180" value="21" required>
          </label>
          <label class="form-field">
            <span>Days to recover if trouble happens</span>
            <input type="number" name="recoveryDays" min="1" max="180" value="14" required>
          </label>
          <label class="form-field">
            <span>Chance of trouble %</span>
            <input type="number" name="disruptionProbability" min="1" max="90" value="12" required>
          </label>
          <label class="form-field">
            <span>How much work can they take? %</span>
            <input type="number" name="capacityShare" min="5" max="100" value="35" required>
          </label>
          <label class="form-field">
            <span>Cost score (100 is normal)</span>
            <input type="number" name="unitCostIndex" min="50" max="180" value="100" required>
          </label>
          <label class="form-field">
            <span>Trust score</span>
            <input type="number" name="complianceScore" min="1" max="100" value="82" required>
          </label>
          <label class="form-field">
            <span>Cost to switch to them</span>
            <input type="number" name="switchingCost" min="0" step="1000" value="25000" required>
          </label>
        </div>
        <div class="inline-actions">
          <button type="submit" class="btn-primary">Add</button>
          <button type="button" class="btn-outline" id="btn-reset-workspace">Start Over</button>
        </div>
      </form>
    </div>

    <div class="dc-card">
      <div class="card-header">
        <h3>People You Added</h3>
        <span class="badge badge-green">${directPartners.length} active</span>
      </div>
      <div class="partner-roster">
        ${renderPartnerRoster(directPartners)}
      </div>
    </div>
  `;

  appState.privacySettings.forEach(setting => {
    const simpleSetting = simplifyPrivacySetting(setting);
    container.innerHTML += `
      <div class="dc-card">
        <div class="dc-card-header">
          <div>
            <div class="dc-card-title">${simpleSetting.name}</div>
          </div>
          <label class="toggle">
            <input type="checkbox" data-privacy-id="${setting.id}" ${setting.active ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="dc-card-desc">${simpleSetting.desc}</div>
      </div>
    `;
  });

  container.innerHTML += `
    <div class="dc-card dc-card-wide" style="margin-top: 16px; border-color: var(--border-active);">
      <div style="font-size: 0.9rem; font-weight: 600; margin-bottom: 12px; color: var(--text-primary);">Sharing Settings</div>
      <div class="visibility-options" style="margin-bottom: 20px;">
        <button class="vis-option ${appState.visibilityMode === 'strict' ? 'active' : ''}" data-visibility="strict">Keep Private</button>
        <button class="vis-option ${appState.visibilityMode === 'tier' ? 'active' : ''}" data-visibility="tier">Share With Close Partners</button>
        <button class="vis-option ${appState.visibilityMode === 'open' ? 'active' : ''}" data-visibility="open">Share More</button>
      </div>

      <div class="dc-data-list">
        <div class="dc-data-row">
          <span class="dc-data-label">Payment timing</span>
          <span style="font-size:0.75rem; color:var(--accent-amber);">${appState.visibilityMode === 'strict' ? 'Private' : 'Tier-1 Only'}</span>
        </div>
        <div class="dc-data-row">
          <span class="dc-data-label">Delivery record</span>
          <span style="font-size:0.75rem; color:var(--accent-blue);">${appState.visibilityMode === 'open' ? 'Visible to network' : 'Anonymized'}</span>
        </div>
        <div class="dc-data-row">
          <span class="dc-data-label">Supplier capacity</span>
          <span style="font-size:0.75rem; color:var(--accent-green);">${appState.visibilityMode === 'open' ? 'Public Network' : 'Controlled Access'}</span>
        </div>
      </div>
    </div>
  `;

  bindDataControlActions();
}

function renderPartnerRoster(directPartners) {
  if (!directPartners.length) {
    return `<div class="empty-note">No one added yet. Add one supplier or buyer above.</div>`;
  }

  return directPartners.map(link => {
    const nodeId = link.source === 'me' ? link.target : link.source;
    const node = appState.nodes.find(candidate => candidate.id === nodeId);

    return `
      <div class="partner-row">
        <div>
          <div class="partner-name">${escapeHtml(node?.name || 'Unknown Partner')}</div>
          <div class="partner-meta">${escapeHtml(capitalize(node?.type || 'partner'))} • ${plainRisk(node?.risk || 'low')} • can take ${node?.capacityShare || 0}% • cost ${node?.unitCostIndex || 100}</div>
        </div>
        <span class="partner-weight">${link.weight}%</span>
      </div>
    `;
  }).join('');
}

function bindDataControlActions() {
  document.getElementById('profile-form').addEventListener('submit', handleProfileSave);
  document.getElementById('partner-form').addEventListener('submit', handlePartnerAdd);
  document.getElementById('btn-reset-workspace').addEventListener('click', resetWorkspace);

  document.querySelectorAll('[data-privacy-id]').forEach(input => {
    input.addEventListener('change', event => {
      const setting = appState.privacySettings.find(item => item.id === event.target.getAttribute('data-privacy-id'));
      if (setting) {
        setting.active = event.target.checked;
        saveState();
        renderJourney();
      }
    });
  });

  document.querySelectorAll('[data-visibility]').forEach(button => {
    button.addEventListener('click', () => {
      appState.visibilityMode = button.getAttribute('data-visibility');
      saveState();
      renderJourney();
      renderDataControl();
    });
  });
}

function handleProfileSave(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  appState.profile = {
    companyName: formData.get('companyName').toString().trim() || appState.profile.companyName,
    userName: formData.get('userName').toString().trim() || appState.profile.userName,
    userRole: formData.get('userRole').toString().trim() || appState.profile.userRole,
    sector: formData.get('sector').toString().trim() || appState.profile.sector,
    region: formData.get('region').toString().trim() || appState.profile.region,
    goal: formData.get('goal').toString().trim() || appState.profile.goal,
    criticalCategory: formData.get('criticalCategory').toString().trim() || appState.profile.criticalCategory,
    planningCycle: formData.get('planningCycle').toString() || appState.profile.planningCycle,
    annualSpend: parseInt(formData.get('annualSpend'), 10) || appState.profile.annualSpend,
    complianceFocus: formData.get('complianceFocus').toString() || appState.profile.complianceFocus
  };

  appState.signedUp = true;
  appState.onboardingComplete = true;
  appState.lastRefreshAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  saveState();
  renderAll();
}

function handlePartnerAdd(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const type = formData.get('partnerType').toString();
  const name = formData.get('partnerName').toString().trim();
  const risk = formData.get('partnerRisk').toString();
  const score = parseInt(formData.get('partnerScore'), 10);
  const weight = parseInt(formData.get('partnerWeight'), 10);
  const leadTime = parseInt(formData.get('leadTime'), 10);
  const recoveryDays = parseInt(formData.get('recoveryDays'), 10);
  const disruptionProbability = parseInt(formData.get('disruptionProbability'), 10);
  const capacityShare = parseInt(formData.get('capacityShare'), 10);
  const unitCostIndex = parseInt(formData.get('unitCostIndex'), 10);
  const complianceScore = parseInt(formData.get('complianceScore'), 10);
  const switchingCost = parseInt(formData.get('switchingCost'), 10);
  const idPrefix = type === 'supplier' ? 's' : 'b';
  const newId = `${idPrefix}${appState.nextPartnerId}`;

  const newNode = type === 'supplier'
    ? {
        id: newId,
        type,
        name,
        risk,
        score,
        delivery: Math.min(99, score + 3),
        quality: Math.min(99, score + 5),
        price: Math.max(40, score - 6),
        payment: Math.max(45, score - 2),
        leadTime,
        recoveryDays,
        disruptionProbability,
        categoryFit: Math.min(98, score + 6),
        capacityShare,
        minShare: 0,
        maxShare: Math.min(45, capacityShare),
        unitCostIndex,
        defectPpm: Math.max(120, Math.round((100 - score) * 24)),
        onTimeDelivery: Math.min(99, score + 3),
        complianceScore,
        cyberScore: Math.max(40, complianceScore - 5),
        esgScore: Math.max(40, complianceScore - 7),
        geoRisk: risk === 'high' ? 62 : risk === 'medium' ? 38 : 22,
        switchingCost,
        paymentTermsDays: 30,
        contractMonthsRemaining: 12,
        inventoryCoverDays: 14,
        moqIndex: 60
      }
    : {
        id: newId,
        type,
        name,
        risk,
        score,
        leadTime,
        recoveryDays,
        disruptionProbability,
        capacityShare,
        unitCostIndex,
        complianceScore,
        switchingCost,
        scale: score > 80 ? 'large' : score > 60 ? 'medium' : 'small'
      };

  const newLink = type === 'supplier'
    ? { source: newId, target: 'me', weight, status: risk === 'high' ? 'risk' : 'new' }
    : { source: 'me', target: newId, weight, status: risk === 'high' ? 'risk' : 'new' };

  appState.nodes.push(newNode);
  appState.links.push(newLink);
  appState.notifications.unshift({
    id: Date.now(),
    type: 'info',
    title: 'Partner added',
    message: `New ${type} <strong>${escapeHtml(name)}</strong> was added to your direct network.`,
    time: 'just now'
  });
  appState.nextPartnerId += 1;
  appState.onboardingComplete = true;
  appState.lastRefreshAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  saveState();
  event.target.reset();
  renderAll();
}

function handleOnboardingSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const profile = {
    companyName: formData.get('companyName').toString().trim() || 'Your Company',
    userName: formData.get('userName').toString().trim() || 'Workspace Owner',
    userRole: formData.get('userRole').toString().trim() || 'Operations Lead',
    sector: formData.get('sector').toString().trim() || 'Industrial Components',
    region: formData.get('region').toString().trim() || 'India',
    goal: formData.get('goal').toString(),
    criticalCategory: formData.get('criticalCategory').toString().trim() || 'Critical components',
    planningCycle: formData.get('planningCycle').toString(),
    annualSpend: parseInt(formData.get('annualSpend'), 10) || 2500000,
    complianceFocus: formData.get('complianceFocus').toString()
  };
  const setupMode = formData.get('setupMode').toString();

  const shouldResetTemplate = !appState.onboardingComplete;
  appState.profile = profile;
  appState.setupMode = setupMode;
  appState.signedUp = true;
  appState.onboardingComplete = true;

  if (shouldResetTemplate) {
    const template = buildTemplate(setupMode, profile);
    appState.nodes = normalizeNodeData(template.nodes);
    appState.links = template.links;
    appState.notifications = template.notifications;
    appState.recommendations = template.recommendations;
    appState.privacySettings = template.privacySettings;
    appState.nextPartnerId = setupMode === 'expanded' ? 12 : 11;
  } else {
    const meNode = appState.nodes.find(node => node.id === 'me');
    if (meNode) {
      meNode.name = profile.companyName;
    }
  }

  appState.lastRefreshAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  saveState();
  closeOnboardingModal();
  renderAll();
}

function refreshWorkspace() {
  appState.lastRefreshAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  appState.notifications.unshift({
    id: Date.now(),
    type: 'info',
    title: 'Workspace refreshed',
    message: `Signals were re-evaluated for <strong>${escapeHtml(appState.profile.companyName)}</strong> using your current setup mode and visibility rules.`,
    time: 'just now'
  });
  appState.notifications = appState.notifications.slice(0, 6);
  saveState();
  renderAll();
}

function resetWorkspace() {
  appState = createInitialState(appState.setupMode || 'guided');
  signupStepIndex = 0;
  signupDraft = {};
  saveState();
  navigateTo('dashboard');
  renderAll();
  updateSignupForm();
}

function resetDemoExperience() {
  const currentTheme = appState.theme || 'dark';
  appState = createInitialState('guided');
  appState.theme = currentTheme;
  signupStepIndex = 0;
  signupDraft = {};
  saveState();
  navigateTo('dashboard');
  renderAll();
  updateSignupForm();
}

function populateOnboardingForm() {
  document.getElementById('company-name').value = appState.profile.companyName;
  document.getElementById('user-name').value = appState.profile.userName;
  document.getElementById('user-role').value = appState.profile.userRole;
  document.getElementById('company-sector').value = appState.profile.sector;
  document.getElementById('company-region').value = appState.profile.region;
  document.getElementById('primary-goal').value = appState.profile.goal;
  document.getElementById('critical-category').value = appState.profile.criticalCategory;
  document.getElementById('planning-cycle').value = appState.profile.planningCycle;
  document.getElementById('annual-spend').value = appState.profile.annualSpend;
  document.getElementById('compliance-focus').value = appState.profile.complianceFocus;

  const radio = document.querySelector(`input[name="setupMode"][value="${appState.setupMode}"]`);
  if (radio) {
    radio.checked = true;
  }
}

function openOnboardingModal() {
  populateOnboardingForm();
  document.getElementById('onboarding-modal').classList.remove('hidden');
}

function closeOnboardingModal() {
  document.getElementById('onboarding-modal').classList.add('hidden');
}

function getVisibilityLabel(mode) {
  return ({
    strict: 'Private',
    tier: 'Close partners only',
    open: 'Share more'
  })[mode] || 'Close partners only';
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}

function plainRisk(risk) {
  return ({
    low: 'Looks safe',
    medium: 'Watch',
    high: 'Problem'
  })[risk] || 'Watch';
}

function simplifyPrivacySetting(setting) {
  const map = {
    anon_bench: {
      name: 'Use anonymous learning',
      desc: 'Let the app learn from grouped data without showing your private details.'
    },
    tier_vis: {
      name: 'Let close partners see needed info',
      desc: 'Share only what nearby suppliers need to understand shared risk.'
    },
    public_perf: {
      name: 'Show a public score',
      desc: 'Show a simple trust score on your public profile.'
    },
    ai_opt: {
      name: 'Use smart planning',
      desc: 'Allow the app to study your network and suggest a better plan.'
    }
  };

  return map[setting.id] || {
    name: escapeHtml(setting.name),
    desc: escapeHtml(setting.desc)
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value || 0);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
