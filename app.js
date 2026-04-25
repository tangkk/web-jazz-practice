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
const languageEl = document.getElementById('language');

const emptyState = document.getElementById('emptyState');
const resultState = document.getElementById('resultState');
const resultKicker = document.getElementById('resultKicker');
const resultTitle = document.getElementById('resultTitle');
const resultSummary = document.getElementById('resultSummary');
const stepsList = document.getElementById('stepsList');
const resultTune = document.getElementById('resultTune');
const tuneActions = document.getElementById('tuneActions');
const toggleChartBtn = document.getElementById('toggleChartBtn');
const openRealbookBtn = document.getElementById('openRealbookBtn');
const openTranscriberBtn = document.getElementById('openTranscriberBtn');
const chartPanel = document.getElementById('chartPanel');
const chartPreview = document.getElementById('chartPreview');

let lastPlan = null;
let currentTune = null;

const UI_TEXT = {
  zh: {
    pageTitle: 'Jazz Practice — 现在练什么',
    heroTitle: '现在练什么',
    heroEyebrow: 'JAZZ PRACTICE',
    // manifestoEn: 'Good practice is not about doing everything. It is about choosing the right next thing.',
    manifestoZh: '好的练习，不是把所有东西都练一遍，而是先做对当下最值得做的下一件事。',
    controlsTitle: '条件设置',
    controlsNote: '可全部留空；系统会在默认条件下给出推荐。',
    currentTitle: '当前练习',
    emptyText: '点击生成后，系统会根据当前条件给出一组练习建议。',
    labels: {
      language: '语言',
      duration: '现在有多少时间',
      focus: '现在想偏重什么',
      energy: '现在状态',
      bias: '推荐倾向',
      preference: '补充偏好（可选）'
    },
    options: {
      any: '随意',
      duration10: '10 分钟',
      duration20: '20 分钟',
      duration30: '30 分钟',
      duration60: '60 分钟',
      focusTime: '节奏 / time',
      focusHarmony: '和声 / comping',
      focusFretboard: '指板 / 音阶 / 琶音',
      focusImprov: '即兴 / 语言',
      focusEar: '耳朵 / 听写 / 唱',
      focusRepertoire: '曲目 / melody / form',
      focusDominant: 'dominant colors',
      focusModern: 'modern / quartal / modal',
      energyLow: '低状态',
      energyMedium: '一般',
      energyHigh: '高状态',
      biasBeginner: '入门',
      biasIntermediate: '进阶',
      biasAdvanced: '高手',
      langZh: '中文',
      langEn: 'English'
    },
    placeholder: '比如：最近想多练 comping / 难度适中 / 更偏 blues / 暂不推荐 rhythm changes',
    buttons: {
      generate: '生成推荐',
      light: '轻一些',
      deep: '深入一些',
      expandChart: '展开 chart',
      collapseChart: '收起 chart',
      loadingChart: '载入中...',
      openRealbook: '打开 web-realbook',
      openTranscriber: '打开 Video/Audio Transcriber'
    },
    sections: {
      routine: '练习安排',
      tune: '可搭配曲目',
      chart: 'Chart',
      metronome: 'Metronome'
    },
    summaryLead: '偏向',
    summaryTail: '。可以直接照着练，不用再临时做选择。',
    summaryPref: ' 已参考你的补充偏好：',
    titlePractice: 'PRACTICE',
    chartLoadFailed: 'Chart 载入失败。可直接打开曲目链接查看。',
    resultTitles: {
      dominant: '本次推荐侧重张力音与解决',
      modern: '本次推荐侧重现代和声色彩',
      beginner: '本次推荐侧重基础材料与稳定性',
      advanced: '本次推荐侧重较高难度与扩展语言',
      light: '本次推荐侧重稳定与连续性',
      deep: '本次推荐侧重较高强度的训练',
      repertoire: '本次推荐包含曲目整合内容',
      default: '本次推荐练习安排'
    }
  },
  en: {
    pageTitle: 'Jazz Practice — What to Practice Now',
    heroTitle: 'What to Practice Now',
    heroEyebrow: 'JAZZ PRACTICE',
    manifestoEn: 'Good practice is not about doing everything. It is about choosing the right next thing.',
    // manifestoZh: 'Good practice is not about doing everything. It is about choosing the right next thing.',
    controlsTitle: 'Practice Filters',
    controlsNote: 'All fields are optional. The system can recommend a set under default conditions.',
    currentTitle: 'Current Practice',
    emptyText: 'Generate a recommendation and the system will produce a practice set based on the current conditions.',
    labels: {
      language: 'Language',
      duration: 'Available time',
      focus: 'Primary focus',
      energy: 'Current state',
      bias: 'Recommendation level',
      preference: 'Additional preference (optional)'
    },
    options: {
      any: 'Any',
      duration10: '10 min',
      duration20: '20 min',
      duration30: '30 min',
      duration60: '60 min',
      focusTime: 'Rhythm / time',
      focusHarmony: 'Harmony / comping',
      focusFretboard: 'Fretboard / scales / arpeggios',
      focusImprov: 'Improvisation / language',
      focusEar: 'Ear / transcription / singing',
      focusRepertoire: 'Repertoire / melody / form',
      focusDominant: 'Dominant colors',
      focusModern: 'Modern / quartal / modal',
      energyLow: 'Low energy',
      energyMedium: 'Medium',
      energyHigh: 'High energy',
      biasBeginner: 'Beginner',
      biasIntermediate: 'Intermediate',
      biasAdvanced: 'Advanced',
      langZh: '中文',
      langEn: 'English'
    },
    placeholder: 'For example: more comping / moderate difficulty / more blues / avoid rhythm changes for now',
    buttons: {
      generate: 'Generate',
      light: 'Lighter',
      deep: 'Deeper',
      expandChart: 'Show chart',
      collapseChart: 'Hide chart',
      loadingChart: 'Loading...',
      openRealbook: 'Open web-realbook',
      openTranscriber: 'Open Video/Audio Transcriber'
    },
    sections: {
      routine: 'Practice Plan',
      tune: 'Suggested Tune',
      chart: 'Chart',
      metronome: 'Metronome'
    },
    summaryLead: 'Focus on',
    summaryTail: '. You can follow the recommendation directly without making further choices.',
    summaryPref: ' Additional preference considered: ',
    titlePractice: 'PRACTICE',
    chartLoadFailed: 'Failed to load chart. You can open the tune link directly.',
    resultTitles: {
      dominant: 'This recommendation emphasizes dominant tension and resolution',
      modern: 'This recommendation emphasizes modern harmonic colors',
      beginner: 'This recommendation emphasizes basic materials and stability',
      advanced: 'This recommendation emphasizes higher difficulty and extended language',
      light: 'This recommendation emphasizes stability and continuity',
      deep: 'This recommendation emphasizes higher training intensity',
      repertoire: 'This recommendation includes repertoire integration',
      default: 'Recommended practice set'
    }
  }
};

const PREFERENCE_RULES = [
  {
    keywords: ['comping', '和声', 'shell', 'voice leading', 'guide tone', 'guide tones'],
    includeCategories: ['harmony'],
    reason: { zh: '偏向和声 / comping', en: 'favor harmony / comping' }
  },
  {
    keywords: ['节奏', 'time', 'groove', 'swing', '律动'],
    includeCategories: ['time'],
    reason: { zh: '偏向节奏 / groove', en: 'favor rhythm / groove' }
  },
  {
    keywords: ['即兴', 'improv', 'line', 'language', 'lick', 'solo'],
    includeCategories: ['improv'],
    reason: { zh: '偏向即兴 / 语言', en: 'favor improvisation / language' }
  },
  {
    keywords: ['耳朵', '听写', 'ear', 'sing', '唱'],
    includeCategories: ['ear'],
    reason: { zh: '偏向耳朵 / 唱 / 听', en: 'favor ear / singing / listening' }
  },
  {
    keywords: ['指板', 'fretboard', '音阶', '琶音', 'key transfer', '转调'],
    includeCategories: ['fretboard'],
    reason: { zh: '偏向指板 / key transfer', en: 'favor fretboard / key transfer' }
  },
  {
    keywords: ['曲子', '曲目', '标准曲', 'melody', 'form', 'repertoire'],
    includeCategories: ['repertoire'],
    reason: { zh: '偏向曲目 / form', en: 'favor repertoire / form' }
  },
  {
    keywords: ['blues', '蓝调'],
    includeTuneTags: ['blues'],
    reason: { zh: '偏向 blues', en: 'favor blues' }
  },
  {
    keywords: ['rhythm changes', 'rhythm change'],
    includeItemIds: ['rhythm-changes-walking'],
    includeTuneTags: ['rhythm-changes'],
    reason: { zh: '偏向 rhythm changes', en: 'favor rhythm changes' }
  },
  {
    keywords: ['diminished', 'altered', 'dominant', '张力'],
    includeCategories: ['dominant-colors'],
    reason: { zh: '偏向 dominant colors', en: 'favor dominant colors' }
  },
  {
    keywords: ['quartal', 'modal', 'modern', 'lydian', 'dorian', '四度'],
    includeCategories: ['modern'],
    reason: { zh: '偏向 modern / quartal', en: 'favor modern / quartal' }
  },
  {
    keywords: ['轻一点', '简单一点', '别太难', '难度适中', '不要太难', '容易一点'],
    modeBias: 'light',
    reason: { zh: '偏向较易展开的练习内容', en: 'favor easier-to-start material' }
  },
  {
    keywords: ['深入一些', '更难一点', '挑战', 'hardcore', 'deep'],
    modeBias: 'deep',
    reason: { zh: '偏向更高密度的训练内容', en: 'favor denser training material' }
  },
  {
    keywords: ['avoid rhythm changes', '先别推 rhythm changes', '不要 rhythm changes', '别来 rhythm changes'],
    excludeItemIds: ['rhythm-changes-walking'],
    excludeTuneTags: ['rhythm-changes'],
    reason: { zh: '避开 rhythm changes', en: 'avoid rhythm changes' }
  },
  {
    keywords: ['少一点 diminished', '不要 diminished'],
    excludeCategories: ['dominant-colors'],
    reason: { zh: '暂时避开 dominant colors', en: 'avoid dominant colors for now' }
  }
];

function getLang() {
  return languageEl?.value || 'zh';
}

function t() {
  return UI_TEXT[getLang()];
}

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
    if (typeof saved.language === 'string' && languageEl) languageEl.value = saved.language;
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
      preferenceText: preferenceInputEl.value.trim(),
      language: languageEl?.value || 'zh'
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

  if (!items.length) items = data.practiceItems.filter(item => !parsedPref.excludeItemIds.has(item.id));
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
  const steps = picks.map(item => ({ ...item, minutes: pickClosestDuration(item.durations, avgMinutes) }));

  return {
    title: buildTitle(options, steps),
    summary: buildSummary(options, steps),
    tune: recommendTune(options, steps),
    steps,
    itemIds: steps.map(x => x.id)
  };
}

function pickClosestDuration(durations, target) {
  return durations.reduce((best, current) => Math.abs(current - target) < Math.abs(best - target) ? current : best, durations[0]);
}

function scoreTune(tuneItem, options, steps) {
  let score = 1;
  const parsedPref = options.parsedPreference;
  const tags = new Set([options.focus, ...steps.flatMap(step => step.categories)].filter(Boolean));

  if (tuneItem.tags.some(tag => tags.has(tag))) score += 3;
  if (parsedPref.includeTuneTags.size && tuneItem.tags.some(tag => parsedPref.includeTuneTags.has(tag))) score += 4;
  if (parsedPref.excludeTuneTags.size && tuneItem.tags.some(tag => parsedPref.excludeTuneTags.has(tag))) score -= 100;
  if (options.energy === 'low' && tuneItem.tags.includes('rhythm-changes')) score -= 3;
  if (options.energy === 'high' && (tuneItem.tags.includes('modal') || tuneItem.tags.includes('rhythm-changes'))) score += 2;

  if (options.bias === 'general') {
    if (tuneItem.tags.includes('standard') || tuneItem.tags.includes('melody')) score += 2;
    if (tuneItem.tags.includes('rhythm-changes') || tuneItem.tags.includes('modern')) score -= 2;
  }

  if (options.bias === 'balanced') {
    if (tuneItem.tags.includes('standard') || tuneItem.tags.includes('ii-v-i') || tuneItem.tags.includes('harmony')) score += 2;
  }

  if (options.bias === 'personal') {
    if (tuneItem.tags.includes('modal') || tuneItem.tags.includes('rhythm-changes') || tuneItem.tags.includes('modern')) score += 3;
  }

  return score;
}

function recommendTune(options, steps) {
  const weightedTunes = data.tunes.map(tuneItem => ({ tune: tuneItem, score: Math.max(0.1, scoreTune(tuneItem, options, steps)) })).filter(entry => entry.score > 0);
  const total = weightedTunes.reduce((sum, x) => sum + x.score, 0);
  let r = Math.random() * total;
  for (const entry of weightedTunes) {
    r -= entry.score;
    if (r <= 0) return entry.tune;
  }
  return weightedTunes[weightedTunes.length - 1]?.tune || pickRandom(data.tunes);
}

function buildTitle(options, steps) {
  const text = t().resultTitles;
  const effectiveMode = options.parsedPreference.modeBias || options.mode;
  if (options.focus === 'dominant-colors') return text.dominant;
  if (options.focus === 'modern') return text.modern;
  if (options.bias === 'general') return text.beginner;
  if (options.bias === 'personal') return text.advanced;
  if (effectiveMode === 'light' || options.energy === 'low') return text.light;
  if (effectiveMode === 'deep' || options.energy === 'high') return text.deep;
  if (steps.some(step => step.categories.includes('repertoire'))) return text.repertoire;
  return text.default;
}

function buildSummary(options, steps) {
  const text = t();
  const categories = [...new Set(steps.flatMap(step => step.categories))];
  const catText = categories.slice(0, 3).join(' / ');
  const prefText = options.preferenceText ? `${text.summaryPref}${options.preferenceText}.` : '';
  return `${text.summaryLead} ${catText || 'basic materials'}${text.summaryTail}${prefText}`;
}

function textFor(value) {
  if (value && typeof value === 'object') return value[getLang()] || value.zh || value.en || '';
  return value || '';
}

function renderTune(tuneItem) {
  currentTune = tuneItem || null;
  chartPanel.classList.add('hidden');
  chartPreview.innerHTML = '';
  tuneActions.classList.add('hidden');
  toggleChartBtn.textContent = t().buttons.expandChart;

  if (!tuneItem) {
    resultTune.textContent = '';
    return;
  }

  if (typeof tuneItem === 'string') {
    resultTune.textContent = tuneItem;
    return;
  }

  const tuneTitle = textFor(tuneItem.title);

  if (tuneItem.irealPath) {
    const url = `https://tangkk.github.io/web-realbook/ireal-demo/${tuneItem.irealPath}`;
    resultTune.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${tuneTitle}</a>`;
    tuneActions.classList.remove('hidden');
    return;
  }

  resultTune.textContent = tuneTitle;
}

function renderPlan(plan) {
  emptyState.classList.add('hidden');
  resultState.classList.remove('hidden');
  resultKicker.textContent = t().titlePractice;
  resultTitle.textContent = plan.title;
  resultSummary.textContent = plan.summary;
  renderTune(plan.tune);

  stepsList.innerHTML = '';
  plan.steps.forEach(step => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="step-title">${textFor(step.title)}</span>
      <span class="step-meta">${step.categories.join(' / ')} · ${step.level}</span>
      <span class="step-note">${textFor(step.note)}</span>
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

function updateUIText() {
  const text = t();
  document.title = text.pageTitle;
  document.querySelector('.eyebrow').textContent = text.heroEyebrow;
  document.querySelector('h1').textContent = text.heroTitle;
  document.querySelector('.manifesto-en').textContent = text.manifestoEn;
  document.querySelector('.manifesto-zh').textContent = text.manifestoZh;
  document.querySelector('.controls-panel .panel-title').textContent = text.controlsTitle;
  document.querySelector('.controls-panel .panel-note').textContent = text.controlsNote;
  document.querySelector('.result-panel .panel-title').textContent = text.currentTitle;
  document.querySelector('#emptyState p').textContent = text.emptyText;

  const labelMap = document.querySelectorAll('[data-i18n-label]');
  labelMap.forEach(el => {
    const key = el.dataset.i18nLabel;
    el.textContent = text.labels[key];
  });

  const optionMap = document.querySelectorAll('[data-i18n-option]');
  optionMap.forEach(el => {
    const key = el.dataset.i18nOption;
    el.textContent = text.options[key];
  });

  preferenceInputEl.placeholder = text.placeholder;
  generateBtn.textContent = text.buttons.generate;
  lightBtn.textContent = text.buttons.light;
  deepBtn.textContent = text.buttons.deep;
  toggleChartBtn.textContent = chartPanel.classList.contains('hidden') ? text.buttons.expandChart : text.buttons.collapseChart;
  openRealbookBtn.textContent = text.buttons.openRealbook;
  openTranscriberBtn.textContent = text.buttons.openTranscriber;

  const sectionTitles = document.querySelectorAll('[data-i18n-section]');
  sectionTitles.forEach(el => {
    el.textContent = text.sections[el.dataset.i18nSection];
  });
}

function generate(mode = 'normal') {
  savePreferences();
  const plan = buildPlan(getOptions(mode));
  lastPlan = plan;
  renderPlan(plan);
}

[durationEl, focusEl, energyEl, biasEl, preferenceInputEl, languageEl].forEach(el => {
  el.addEventListener('change', () => {
    savePreferences();
    updateUIText();
    if (lastPlan) renderPlan(lastPlan);
  });
  el.addEventListener('input', savePreferences);
});

loadPreferences();
updateUIText();

toggleChartBtn.addEventListener('click', async () => {
  if (!currentTune || !currentTune.irealPath) return;
  const isHidden = chartPanel.classList.contains('hidden');

  if (isHidden) {
    const url = `https://tangkk.github.io/web-realbook/ireal-demo/${currentTune.irealPath}`;
    toggleChartBtn.textContent = t().buttons.loadingChart;

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
      toggleChartBtn.textContent = t().buttons.collapseChart;
    } catch (error) {
      console.error(error);
      chartPreview.innerHTML = `<p>${t().chartLoadFailed}</p>`;
      chartPanel.classList.remove('hidden');
      toggleChartBtn.textContent = t().buttons.collapseChart;
    }
  } else {
    chartPanel.classList.add('hidden');
    chartPreview.innerHTML = '';
    toggleChartBtn.textContent = t().buttons.expandChart;
  }
});

openRealbookBtn.addEventListener('click', () => {
  window.open('https://tangkk.github.io/web-realbook/', '_blank', 'noopener,noreferrer');
});

openTranscriberBtn.addEventListener('click', () => {
  window.open('https://tangkk.github.io/web-video-trans/', '_blank', 'noopener,noreferrer');
});

generateBtn.addEventListener('click', () => generate('normal'));
lightBtn.addEventListener('click', () => generate('light'));
deepBtn.addEventListener('click', () => generate('deep'));
