const data = window.JAZZ_PRACTICE_DATA;

const durationEl = document.getElementById('duration');
const focusEl = document.getElementById('focus');
const energyEl = document.getElementById('energy');
const biasEl = document.getElementById('bias');
const preferenceInputEl = document.getElementById('preferenceInput');

const STORAGE_KEY = 'web-jazz-practice:last-preferences';

const generateBtn = document.getElementById('generateBtn');
const lightBtn = document.getElementById('lightBtn');
const deepBtn = document.getElementById('deepBtn');

const emptyState = document.getElementById('emptyState');
const resultState = document.getElementById('resultState');
const resultKicker = document.getElementById('resultKicker');
const resultTitle = document.getElementById('resultTitle');
const resultSummary = document.getElementById('resultSummary');
const stepsList = document.getElementById('stepsList');
const resultTune = document.getElementById('resultTune');
const tuneActions = document.getElementById('tuneActions');
const toggleChartBtn = document.getElementById('toggleChartBtn');
const chartPanel = document.getElementById('chartPanel');
const chartPreview = document.getElementById('chartPreview');

let lastPlan = null;
let currentTune = null;

const PREFERENCE_RULES = [
  {
    keywords: ['comping', '和声', 'shell', 'voice leading', 'guide tone', 'guide tones'],
    includeCategories: ['harmony'],
    score: 4,
    reason: '偏向和声 / comping'
  },
  {
    keywords: ['节奏', 'time', 'groove', 'swing', '律动'],
    includeCategories: ['time'],
    score: 4,
    reason: '偏向节奏 / groove'
  },
  {
    keywords: ['即兴', 'improv', 'line', 'language', 'lick', 'solo'],
    includeCategories: ['improv'],
    score: 4,
    reason: '偏向即兴 / 语言'
  },
  {
    keywords: ['耳朵', '听写', 'ear', 'sing', '唱'],
    includeCategories: ['ear'],
    score: 4,
    reason: '偏向耳朵 / 唱 / 听'
  },
  {
    keywords: ['指板', 'fretboard', '音阶', '琶音', 'key transfer', '转调'],
    includeCategories: ['fretboard'],
    score: 4,
    reason: '偏向指板 / key transfer'
  },
  {
    keywords: ['曲子', '曲目', '标准曲', 'melody', 'form', 'repertoire'],
    includeCategories: ['repertoire'],
    score: 4,
    reason: '偏向曲目 / form'
  },
  {
    keywords: ['blues', '蓝调'],
    includeTuneTags: ['blues'],
    score: 3,
    reason: '偏向 blues'
  },
  {
    keywords: ['rhythm changes', 'rhythm change'],
    includeItemIds: ['rhythm-changes-walking'],
    includeTuneTags: ['rhythm-changes'],
    score: 4,
    reason: '偏向 rhythm changes'
  },
  {
    keywords: ['diminished', 'altered', 'dominant', '张力'],
    includeCategories: ['dominant-colors'],
    score: 4,
    reason: '偏向 dominant colors'
  },
  {
    keywords: ['quartal', 'modal', 'modern', 'lydian', 'dorian', '四度'],
    includeCategories: ['modern'],
    score: 4,
    reason: '偏向 modern / quartal'
  },
  {
    keywords: ['轻一点', '简单一点', '别太难', '难度适中', '不要太难', '容易一点'],
    modeBias: 'light',
    score: 5,
    reason: '偏向较易展开的练习内容'
  },
  {
    keywords: ['深入一些', '更难一点', '挑战', 'hardcore', 'deep'],
    modeBias: 'deep',
    score: 5,
    reason: '偏向更高密度的训练内容'
  },
  {
    keywords: ['avoid rhythm changes', '先别推 rhythm changes', '不要 rhythm changes', '别来 rhythm changes'],
    excludeItemIds: ['rhythm-changes-walking'],
    excludeTuneTags: ['rhythm-changes'],
    score: 100,
    reason: '避开 rhythm changes'
  },
  {
    keywords: ['少一点 diminished', '不要 diminished'],
    excludeCategories: ['dominant-colors'],
    score: 100,
    reason: '暂时避开 dominant colors'
  }
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function loadPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (typeof saved.duration === 'string') durationEl.value = saved.duration;
    if (typeof saved.focus === 'string') focusEl.value = saved.focus;
    if (typeof saved.energy === 'string') energyEl.value = saved.energy;
    if (typeof saved.bias === 'string') biasEl.value = saved.bias;
    if (typeof saved.preferenceText === 'string') preferenceInputEl.value = saved.preferenceText;
  } catch (error) {
    console.warn('Failed to load preferences:', error);
  }
}

function savePreferences() {
  try {
    const payload = {
      duration: durationEl.value || '',
      focus: focusEl.value || '',
      energy: energyEl.value || '',
      bias: biasEl.value || 'balanced',
      preferenceText: preferenceInputEl.value.trim()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Failed to save preferences:', error);
  }
}

function parsePreferenceText(text) {
  const normalized = (text || '').toLowerCase();
  const parsed = {
    includeCategories: new Set(),
    excludeCategories: new Set(),
    includeItemIds: new Set(),
    excludeItemIds: new Set(),
    includeTuneTags: new Set(),
    excludeTuneTags: new Set(),
    modeBias: '',
    reasons: []
  };

  if (!normalized) return parsed;

  for (const rule of PREFERENCE_RULES) {
    if (!rule.keywords.some(keyword => normalized.includes(keyword.toLowerCase()))) continue;

    (rule.includeCategories || []).forEach(x => parsed.includeCategories.add(x));
    (rule.excludeCategories || []).forEach(x => parsed.excludeCategories.add(x));
    (rule.includeItemIds || []).forEach(x => parsed.includeItemIds.add(x));
    (rule.excludeItemIds || []).forEach(x => parsed.excludeItemIds.add(x));
    (rule.includeTuneTags || []).forEach(x => parsed.includeTuneTags.add(x));
    (rule.excludeTuneTags || []).forEach(x => parsed.excludeTuneTags.add(x));
    if (rule.modeBias) parsed.modeBias = rule.modeBias;
    if (rule.reason) parsed.reasons.push(rule.reason);
  }

  return parsed;
}

function scoreItem(item, options) {
  let score = 1;
  const parsedPref = options.parsedPreference;

  if (options.focus && item.categories.includes(options.focus)) score += 4;
  if (options.energy && item.energies.includes(options.energy)) score += 3;

  if (options.duration) {
    const minDiff = Math.min(...item.durations.map(d => Math.abs(d - options.duration)));
    score += Math.max(0, 3 - minDiff / 5);
  }

  if (options.bias === 'general') {
    if (item.bias.includes('general')) score += 3;
    if (item.level.includes('easy')) score += 3;
    if (item.level.includes('high')) score -= 4;
    if (item.energies.includes('low')) score += 1.5;
    if (item.categories.includes('dominant-colors') || item.categories.includes('modern')) score -= 3;
  }

  if (options.bias === 'balanced') {
    if (item.bias.length >= 2) score += 2;
    if (item.level.includes('medium')) score += 2;
    if (item.level.includes('easy-medium')) score += 1.5;
    if (item.level.includes('medium-high')) score += 1.5;
  }

  if (options.bias === 'personal') {
    if (item.bias.includes('personal')) score += 4;
    if (item.level.includes('high')) score += 3;
    if (item.level.includes('medium-high')) score += 2;
    if (item.categories.includes('dominant-colors') || item.categories.includes('modern')) score += 2;
    if (item.energies.includes('low') && item.level.includes('easy')) score -= 2;
  }

  const effectiveMode = parsedPref.modeBias || options.mode;

  if (effectiveMode === 'light') {
    if (item.energies.includes('low')) score += 3;
    if (item.level.includes('easy')) score += 2;
    if (item.level.includes('high')) score -= 1.5;
  }

  if (effectiveMode === 'deep') {
    if (item.energies.includes('high')) score += 3;
    if (item.level.includes('high')) score += 2;
  }

  if (parsedPref.includeCategories.size && item.categories.some(c => parsedPref.includeCategories.has(c))) score += 4;
  if (parsedPref.includeItemIds.has(item.id)) score += 4;
  if (parsedPref.excludeCategories.size && item.categories.some(c => parsedPref.excludeCategories.has(c))) score -= 100;
  if (parsedPref.excludeItemIds.has(item.id)) score -= 100;

  if (lastPlan && lastPlan.itemIds?.includes(item.id)) score -= 2;

  return score;
}

function filterCandidates(options) {
  const parsedPref = options.parsedPreference;

  let items = data.practiceItems.filter(item => {
    const durationOk = !options.duration || item.durations.some(d => d <= options.duration + 5);
    const focusOk = !options.focus || item.categories.includes(options.focus);
    const energyOk = !options.energy || item.energies.includes(options.energy);
    const excludedCategory = parsedPref.excludeCategories.size && item.categories.some(c => parsedPref.excludeCategories.has(c));
    const excludedItem = parsedPref.excludeItemIds.has(item.id);
    return durationOk && focusOk && energyOk && !excludedCategory && !excludedItem;
  });

  if (!items.length) {
    items = data.practiceItems.filter(item => !parsedPref.excludeItemIds.has(item.id));
  }

  if (!items.length) items = [...data.practiceItems];
  return items;
}

function weightedPick(items, options, usedIds = new Set()) {
  const weighted = items
    .filter(item => !usedIds.has(item.id))
    .map(item => ({ item, score: Math.max(0.1, scoreItem(item, options)) }))
    .filter(entry => entry.score > 0);

  if (!weighted.length) return null;

  const total = weighted.reduce((sum, x) => sum + x.score, 0);
  let r = Math.random() * total;
  for (const entry of weighted) {
    r -= entry.score;
    if (r <= 0) return entry.item;
  }
  return weighted[weighted.length - 1].item;
}

function buildPlan(options) {
  const duration = options.duration || 20;
  const template = data.routineTemplates[duration] || { steps: duration <= 10 ? 2 : 3, totalMinutes: duration };
  const candidates = filterCandidates(options);
  const usedIds = new Set();
  const picks = [];

  for (let i = 0; i < template.steps; i += 1) {
    const picked = weightedPick(candidates, options, usedIds);
    if (!picked) break;
    usedIds.add(picked.id);
    picks.push(picked);
  }

  const avgMinutes = Math.max(5, Math.round(template.totalMinutes / Math.max(1, picks.length)));
  const steps = picks.map(item => ({
    ...item,
    minutes: pickClosestDuration(item.durations, avgMinutes)
  }));

  const tune = recommendTune(options, steps);
  const title = buildTitle(options, steps);
  const summary = buildSummary(options, steps, duration);
  return {
    title,
    summary,
    tune,
    steps,
    itemIds: steps.map(x => x.id)
  };
}

function pickClosestDuration(durations, target) {
  return durations.reduce((best, current) => {
    return Math.abs(current - target) < Math.abs(best - target) ? current : best;
  }, durations[0]);
}

function scoreTune(tune, options, steps) {
  let score = 1;
  const parsedPref = options.parsedPreference;
  const tags = new Set([options.focus, ...steps.flatMap(step => step.categories)].filter(Boolean));

  if (tune.tags.some(tag => tags.has(tag))) score += 3;
  if (parsedPref.includeTuneTags.size && tune.tags.some(tag => parsedPref.includeTuneTags.has(tag))) score += 4;
  if (parsedPref.excludeTuneTags.size && tune.tags.some(tag => parsedPref.excludeTuneTags.has(tag))) score -= 100;
  if (options.energy === 'low' && tune.tags.includes('rhythm-changes')) score -= 3;
  if (options.energy === 'high' && (tune.tags.includes('modal') || tune.tags.includes('rhythm-changes'))) score += 2;

  if (options.bias === 'general') {
    if (tune.tags.includes('standard') || tune.tags.includes('melody')) score += 2;
    if (tune.tags.includes('rhythm-changes') || tune.tags.includes('modern')) score -= 2;
  }

  if (options.bias === 'balanced') {
    if (tune.tags.includes('standard') || tune.tags.includes('ii-v-i') || tune.tags.includes('harmony')) score += 2;
  }

  if (options.bias === 'personal') {
    if (tune.tags.includes('modal') || tune.tags.includes('rhythm-changes') || tune.tags.includes('modern')) score += 3;
  }

  return score;
}

function recommendTune(options, steps) {
  const weightedTunes = data.tunes
    .map(tune => ({ tune, score: Math.max(0.1, scoreTune(tune, options, steps)) }))
    .filter(entry => entry.score > 0);

  const total = weightedTunes.reduce((sum, x) => sum + x.score, 0);
  let r = Math.random() * total;
  for (const entry of weightedTunes) {
    r -= entry.score;
    if (r <= 0) return entry.tune;
  }
  return weightedTunes[weightedTunes.length - 1]?.tune || pickRandom(data.tunes);
}

function buildTitle(options, steps) {
  const effectiveMode = options.parsedPreference.modeBias || options.mode;
  if (options.focus === 'dominant-colors') return '本次推荐侧重张力音与解决';
  if (options.focus === 'modern') return '本次推荐侧重现代和声色彩';
  if (options.bias === 'general') return '本次推荐侧重基础材料与稳定性';
  if (options.bias === 'personal') return '本次推荐侧重较高难度与扩展语言';
  if (effectiveMode === 'light' || options.energy === 'low') return '本次推荐侧重稳定与连续性';
  if (effectiveMode === 'deep' || options.energy === 'high') return '本次推荐侧重较高强度的训练';
  if (steps.some(step => step.categories.includes('repertoire'))) return '本次推荐包含曲目整合内容';
  return '本次推荐练习安排';
}

function buildSummary(options, steps, duration) {
  const categories = [...new Set(steps.flatMap(step => step.categories))];
  const catText = categories.slice(0, 3).join(' / ');
  const prefText = options.preferenceText ? ` 已参考你的补充偏好：${options.preferenceText}。` : '';
  return `${duration || 20} 分钟左右，偏向 ${catText || '基础综合'}。可以直接照着练，不用再临时做选择。${prefText}`;
}

function renderTune(tune) {
  currentTune = tune || null;
  chartPanel.classList.add('hidden');
  chartPreview.innerHTML = '';
  tuneActions.classList.add('hidden');
  toggleChartBtn.textContent = '展开 chart';

  if (!tune) {
    resultTune.textContent = '';
    return;
  }

  if (typeof tune === 'string') {
    resultTune.textContent = tune;
    return;
  }

  if (tune.irealPath) {
    const url = `https://tangkk.github.io/web-realbook/ireal-demo/${tune.irealPath}`;
    resultTune.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${tune.title}</a>`;
    tuneActions.classList.remove('hidden');
    return;
  }

  resultTune.textContent = tune.title;
}

function renderPlan(plan) {
  emptyState.classList.add('hidden');
  resultState.classList.remove('hidden');

  resultKicker.textContent = 'PRACTICE';
  resultTitle.textContent = plan.title;
  resultSummary.textContent = plan.summary;
  renderTune(plan.tune);

  stepsList.innerHTML = '';
  plan.steps.forEach(step => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="step-title">${step.title}</span>
      <span class="step-meta">约 ${step.minutes} 分钟 · ${step.categories.join(' / ')} · ${step.level}</span>
      <span class="step-note">${step.note}</span>
    `;
    stepsList.appendChild(li);
  });
}

function getOptions(mode = 'normal') {
  const preferenceText = preferenceInputEl.value.trim();
  return {
    duration: durationEl.value ? Number(durationEl.value) : null,
    focus: focusEl.value || '',
    energy: energyEl.value || '',
    bias: biasEl.value || 'balanced',
    preferenceText,
    parsedPreference: parsePreferenceText(preferenceText),
    mode
  };
}

function generate(mode = 'normal') {
  savePreferences();
  const plan = buildPlan(getOptions(mode));
  lastPlan = plan;
  renderPlan(plan);
}

[durationEl, focusEl, energyEl, biasEl, preferenceInputEl].forEach(el => {
  el.addEventListener('change', savePreferences);
  el.addEventListener('input', savePreferences);
});

loadPreferences();

toggleChartBtn.addEventListener('click', async () => {
  if (!currentTune || !currentTune.irealPath) return;
  const isHidden = chartPanel.classList.contains('hidden');

  if (isHidden) {
    const url = `https://tangkk.github.io/web-realbook/ireal-demo/${currentTune.irealPath}`;
    toggleChartBtn.textContent = '载入中...';

    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const hero = doc.querySelector('.hero');
      const chart = doc.querySelector('.chart');

      if (!chart) throw new Error('Chart content not found');

      chartPreview.innerHTML = `
        <div class="embedded-ireal">
          ${hero ? `<section class="embedded-hero">${hero.innerHTML}</section>` : ''}
          <section class="embedded-chart">${chart.innerHTML}</section>
        </div>
      `;

      chartPanel.classList.remove('hidden');
      toggleChartBtn.textContent = '收起 chart';
    } catch (error) {
      console.error(error);
      chartPreview.innerHTML = `<p>Chart 载入失败。可直接打开曲目链接查看。</p>`;
      chartPanel.classList.remove('hidden');
      toggleChartBtn.textContent = '收起 chart';
    }
  } else {
    chartPanel.classList.add('hidden');
    chartPreview.innerHTML = '';
    toggleChartBtn.textContent = '展开 chart';
  }
});

generateBtn.addEventListener('click', () => generate('normal'));
lightBtn.addEventListener('click', () => generate('light'));
deepBtn.addEventListener('click', () => generate('deep'));
