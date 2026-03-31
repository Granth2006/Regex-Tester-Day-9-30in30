/* ============================================================
   RegexLab — script.js
   Interactive, real-time Regex Tester
   ============================================================ */

'use strict';

// ─── DOM References ─────────────────────────────────────────
const regexPatternEl   = document.getElementById('regexPattern');
const regexFlagsDisplay= document.getElementById('regexFlagsDisplay');
const regexInputWrap   = document.getElementById('regexInputWrap');
const regexError       = document.getElementById('regexError');
const regexExplanation = document.getElementById('regexExplanation');

const testStringEl     = document.getElementById('testString');
const highlightOutput  = document.getElementById('highlightOutput');
const resultsList      = document.getElementById('resultsList');

const headerMatchCount = document.getElementById('headerMatchCount');
const headerMatchBadge = document.getElementById('headerMatchBadge');
const navMatchText     = document.getElementById('navMatchText');
const navPosition      = document.getElementById('navPosition');

const btnPrev          = document.getElementById('btnPrev');
const btnNext          = document.getElementById('btnNext');
const modeAll          = document.getElementById('modeAll');
const modeSingle       = document.getElementById('modeSingle');

const replaceStringEl  = document.getElementById('replaceString');
const replacePreviewWrap = document.getElementById('replacePreviewWrap');
const replacePreview   = document.getElementById('replacePreview');
const btnReplaceAll    = document.getElementById('btnReplaceAll');
const btnCopyReplace   = document.getElementById('btnCopyReplace');

const btnCopyRegex     = document.getElementById('btnCopyRegex');
const btnCopyJSON      = document.getElementById('btnCopyJSON');
const btnCopyMatches   = document.getElementById('btnCopyMatches');
const btnImport        = document.getElementById('btnImport');
const fileInput        = document.getElementById('fileInput');
const btnClearText     = document.getElementById('btnClearText');
const toast            = document.getElementById('toast');

// ─── State ──────────────────────────────────────────────────
let state = {
  pattern:       '',
  flags:         new Set(['g']),
  testString:    '',
  replaceString: '',
  matches:       [],
  currentMatch:  -1,
  singleMode:    false,
  regex:         null,
  debounceTimer: null,
};

// ─── Presets ─────────────────────────────────────────────────
const PRESETS = {
  email:    { pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}',          flags: ['g','i'], text: 'Send an email to hello@example.com or support@test.org for help.\nInvalid: @nodomain, notanemail' },
  url:      { pattern: 'https?:\\/\\/[^\\s/$.?#].[^\\s]*',                               flags: ['g','i'], text: 'Visit https://www.google.com or http://example.org/path?query=1\nNot a URL: ftp://example.com or just example.com' },
  phone:    { pattern: '(\\+?1[-\\s.]?)?(\\(?[0-9]{3}\\)?[-\\s.]?)[0-9]{3}[-\\s.][0-9]{4}', flags: ['g'], text: 'Call us at (555) 123-4567 or +1-800-555-0199.\nAlso valid: 555.867.5309 or 555 123 4567' },
  password: { pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', flags: ['gm'], text: 'StrongP@ss1\nweakpass\nNoSpecial1\nAllGood@2024\nshort@1A' },
  ipv4:     { pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b', flags: ['g'], text: 'Server IPs: 192.168.1.1 and 10.0.0.1\nPublic: 8.8.8.8, Invalid: 999.1.1.1 or 256.0.0.1' },
  hex:      { pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b',                           flags: ['g','i'], text: 'Colors: #FF5733, #abc, #1a2b3c\nNot valid: #GGGGGG, #12345' },
  date:     { pattern: '\\b(\\d{4})[-\\/](0?[1-9]|1[0-2])[-\\/](0?[1-9]|[12]\\d|3[01])\\b', flags: ['g'], text: 'Dates: 2024-01-15, 2023/12/31, 2024-3-5\nInvalid: 2024-13-01, 2024/00/10' },
  html:     { pattern: '<([a-z][a-z0-9]*)(\\s[^>]*)?>.*?<\\/\\1>',                      flags: ['gis'],  text: '<div class="main">Hello World</div>\n<p>This is a <strong>test</strong> paragraph.</p>\n<span id="foo">bar</span>' },
};

// ─── Regex Explanation Map ────────────────────────────────────
const TOKEN_EXPLANATIONS = [
  { re: /\^/g,           desc: 'start of string/line' },
  { re: /\$/g,           desc: 'end of string/line' },
  { re: /\\d/g,          desc: 'digit [0-9]' },
  { re: /\\D/g,          desc: 'non-digit' },
  { re: /\\w/g,          desc: 'word char [a-zA-Z0-9_]' },
  { re: /\\W/g,          desc: 'non-word char' },
  { re: /\\s/g,          desc: 'whitespace' },
  { re: /\\S/g,          desc: 'non-whitespace' },
  { re: /\\b/g,          desc: 'word boundary' },
  { re: /\\n/g,          desc: 'newline' },
  { re: /\\t/g,          desc: 'tab' },
  { re: /\./g,           desc: 'any character' },
  { re: /\*/g,           desc: 'zero or more' },
  { re: /\+/g,           desc: 'one or more' },
  { re: /\?/g,           desc: 'zero or one (optional)' },
  { re: /\{(\d+),(\d+)\}/g, desc: 'repeat range' },
  { re: /\{(\d+)\}/g,   desc: 'exact repeat' },
  { re: /\(.*?\)/g,     desc: 'capture group' },
  { re: /\[.*?\]/g,     desc: 'character class' },
  { re: /\|/g,           desc: 'alternation (OR)' },
  { re: /\(\?:/g,        desc: 'non-capturing group' },
  { re: /\(\?=/g,        desc: 'positive lookahead' },
  { re: /\(\?!/g,        desc: 'negative lookahead' },
  { re: /\(\?<=/g,       desc: 'positive lookbehind' },
  { re: /\(\?<!/g,       desc: 'negative lookbehind' },
];

// ─── Utility Helpers ─────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(msg, duration = 2000) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function copyToClipboard(text, label = 'Copied!') {
  navigator.clipboard.writeText(text).then(() => showToast(`✓ ${label}`)).catch(() => showToast('❌ Copy failed'));
}

function debounce(fn, delay) {
  return (...args) => {
    clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(() => fn(...args), delay);
  };
}

// ─── Flag Toggle ──────────────────────────────────────────────
document.querySelectorAll('.flag-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const flag = btn.dataset.flag;
    if (state.flags.has(flag)) {
      state.flags.delete(flag);
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    } else {
      state.flags.add(flag);
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    }
    const flagString = ['g','i','m','s'].filter(f => state.flags.has(f)).join('');
    regexFlagsDisplay.textContent = flagString || ' ';
    runEngine();
  });
});

// ─── Pattern & Text Input ────────────────────────────────────
const debouncedRun = debounce(runEngine, 200);
regexPatternEl.addEventListener('input', debouncedRun);
testStringEl.addEventListener('input', debouncedRun);
replaceStringEl.addEventListener('input', debouncedRun);

// ─── Presets ──────────────────────────────────────────────────
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const p = PRESETS[btn.dataset.preset];
    if (!p) return;
    regexPatternEl.value = p.pattern;
    testStringEl.value   = p.text;
    // Reset flags then apply preset flags
    state.flags.clear();
    document.querySelectorAll('.flag-btn').forEach(fb => {
      fb.classList.remove('active');
      fb.setAttribute('aria-pressed', 'false');
    });
    p.flags.forEach(f => {
      // Flatten multi-char flags e.g. 'gis'
      [...f].forEach(ch => {
        state.flags.add(ch);
        const fb = document.getElementById('flag' + ch.toUpperCase());
        if (fb) { fb.classList.add('active'); fb.setAttribute('aria-pressed', 'true'); }
      });
    });
    const flagString = ['g','i','m','s'].filter(f => state.flags.has(f)).join('');
    regexFlagsDisplay.textContent = flagString || ' ';
    runEngine();
  });
});

// ─── Highlight Mode Toggle ────────────────────────────────────
modeAll.addEventListener('click', () => {
  state.singleMode = false;
  modeAll.classList.add('active');
  modeSingle.classList.remove('active');
  modeAll.setAttribute('aria-pressed', 'true');
  modeSingle.setAttribute('aria-pressed', 'false');
  renderHighlight();
});
modeSingle.addEventListener('click', () => {
  state.singleMode = true;
  modeSingle.classList.add('active');
  modeAll.classList.remove('active');
  modeSingle.setAttribute('aria-pressed', 'true');
  modeAll.setAttribute('aria-pressed', 'false');
  if (state.currentMatch < 0 && state.matches.length > 0) state.currentMatch = 0;
  renderHighlight();
});

// ─── Navigation ───────────────────────────────────────────────
btnPrev.addEventListener('click', () => {
  if (state.matches.length === 0) return;
  state.currentMatch = (state.currentMatch - 1 + state.matches.length) % state.matches.length;
  updateNavUI();
  renderHighlight();
  scrollToActiveResult();
});
btnNext.addEventListener('click', () => {
  if (state.matches.length === 0) return;
  state.currentMatch = (state.currentMatch + 1) % state.matches.length;
  updateNavUI();
  renderHighlight();
  scrollToActiveResult();
});

// ─── Main Engine ──────────────────────────────────────────────
function runEngine() {
  const pattern = regexPatternEl.value;
  const text    = testStringEl.value;
  const flags   = ['g','i','m','s'].filter(f => state.flags.has(f)).join('');

  state.pattern     = pattern;
  state.testString  = text;

  // Validate regex
  if (!pattern) {
    clearAll();
    return;
  }

  let regex;
  try {
    regex = new RegExp(pattern, flags);
    state.regex = regex;
    regexInputWrap.classList.remove('has-error');
    regexError.textContent = '';
    updateExplanation(pattern);
  } catch (e) {
    regexInputWrap.classList.add('has-error');
    regexError.textContent = e.message;
    clearAll(false);
    return;
  }

  // Collect matches (safe — use exec loop with lastIndex guard)
  const matches = [];
  if (flags.includes('g')) {
    regex.lastIndex = 0;
    let m;
    let safetyLimit = 10000; // prevent infinite loops on zero-length matches
    while ((m = regex.exec(text)) !== null && safetyLimit-- > 0) {
      matches.push(m);
      if (m.index === regex.lastIndex) {
        regex.lastIndex++; // advance to avoid infinite loop on zero-length match
      }
    }
  } else {
    const m = regex.exec(text);
    if (m) matches.push(m);
  }

  state.matches = matches;

  // Keep currentMatch in bounds
  if (state.currentMatch >= matches.length) state.currentMatch = matches.length ? 0 : -1;
  if (matches.length > 0 && state.currentMatch < 0) state.currentMatch = 0;

  updateNavUI();
  renderHighlight();
  renderResults();
  renderReplacePreview(regex, text);
}

// ─── Clear All ────────────────────────────────────────────────
function clearAll(clearExplanation = true) {
  state.matches      = [];
  state.currentMatch = -1;
  state.regex        = null;

  headerMatchCount.textContent = '0';
  headerMatchBadge.classList.remove('has-matches');
  navMatchText.textContent = 'No matches';
  navPosition.textContent  = '—';
  btnPrev.disabled = btnNext.disabled = true;

  if (clearExplanation) regexExplanation.innerHTML = '';

  highlightOutput.innerHTML = state.pattern
    ? `<span class="placeholder-hint">No matches found.</span>`
    : `<span class="placeholder-hint">Enter a pattern and test string to see matches highlighted here.</span>`;

  resultsList.innerHTML = `<div class="empty-results"><span class="empty-icon">🔍</span><p>Results will appear here once matches are found.</p></div>`;
  replacePreviewWrap.hidden = true;
}

// ─── Nav UI ───────────────────────────────────────────────────
function updateNavUI() {
  const count = state.matches.length;
  headerMatchCount.textContent = count;
  headerMatchBadge.classList.toggle('has-matches', count > 0);

  navMatchText.textContent = count === 0
    ? 'No matches'
    : `${count} match${count !== 1 ? 'es' : ''}`;

  if (count > 0) {
    navPosition.textContent = `${state.currentMatch + 1} / ${count}`;
    btnPrev.disabled = btnNext.disabled = count <= 1;
  } else {
    navPosition.textContent = '—';
    btnPrev.disabled = btnNext.disabled = true;
  }
}

// ─── Highlight Renderer ───────────────────────────────────────
function renderHighlight() {
  const text    = state.testString;
  const matches = state.matches;

  if (!text) {
    highlightOutput.innerHTML = `<span class="placeholder-hint">Enter a pattern and test string to see matches highlighted here.</span>`;
    return;
  }
  if (matches.length === 0) {
    highlightOutput.innerHTML = escapeHtml(text);
    return;
  }

  // In single mode we only highlight state.currentMatch
  const activeIndices = state.singleMode
    ? new Set([state.currentMatch])
    : new Set(matches.map((_, i) => i));

  let html    = '';
  let pointer = 0;

  matches.forEach((m, idx) => {
    if (!activeIndices.has(idx)) {
      // In single mode skip non-active matches
      if (state.singleMode && idx < state.currentMatch) {
        // We need to flush text up to m.index even in single mode
        if (pointer <= m.index) {
          html += escapeHtml(text.slice(pointer, m.index));
          pointer = m.index + m[0].length;
        }
      }
      return;
    }

    // Text before this match
    if (m.index > pointer) html += escapeHtml(text.slice(pointer, m.index));

    const isActive = (idx === state.currentMatch);
    const cls = ['match-span', isActive ? 'active' : ''].filter(Boolean).join(' ');
    html += `<span class="${cls}" data-match="${idx}" title="Match #${idx + 1}">${escapeHtml(m[0])}</span>`;
    pointer = m.index + m[0].length;
  });

  // Remaining text
  if (pointer < text.length) html += escapeHtml(text.slice(pointer));

  highlightOutput.innerHTML = html;

  // Attach click listeners to match spans
  highlightOutput.querySelectorAll('.match-span').forEach(span => {
    span.addEventListener('click', () => {
      state.currentMatch = parseInt(span.dataset.match, 10);
      updateNavUI();
      renderHighlight();
      scrollToActiveResult();
    });
  });

  // Scroll active span into view
  const activeSpan = highlightOutput.querySelector('.match-span.active');
  if (activeSpan) activeSpan.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// ─── Results Renderer ─────────────────────────────────────────
function renderResults() {
  const matches = state.matches;
  if (matches.length === 0) {
    resultsList.innerHTML = `<div class="empty-results"><span class="empty-icon">💡</span><p>No matches found for the current pattern.</p></div>`;
    return;
  }

  resultsList.innerHTML = matches.map((m, idx) => {
    const isActive = (idx === state.currentMatch);
    const groupsHtml = m.length > 1
      ? `<div class="result-groups">${[...m].slice(1).map((g, gi) =>
          `<span class="group-tag"><strong>G${gi+1}:</strong> ${g !== undefined ? escapeHtml(String(g)) : '<em>undefined</em>'}</span>`
        ).join('')}</div>`
      : '';
    return `
      <div class="result-item${isActive ? ' active' : ''}" data-idx="${idx}" role="button" tabindex="0" aria-label="Match ${idx+1}: ${escapeHtml(m[0])}">
        <div class="result-header">
          <span class="result-index">Match #${idx + 1}</span>
          <span class="result-pos">[${m.index} – ${m.index + m[0].length}]</span>
        </div>
        <div class="result-value">${escapeHtml(m[0]) || '<em class="text-muted">empty string</em>'}</div>
        ${groupsHtml}
      </div>`;
  }).join('');

  // Attach click listeners
  resultsList.querySelectorAll('.result-item').forEach(item => {
    const activate = () => {
      state.currentMatch = parseInt(item.dataset.idx, 10);
      updateNavUI();
      renderHighlight();
      renderResults(); // re-render to update active state
    };
    item.addEventListener('click', activate);
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') activate(); });
  });
}

// ─── Scroll to Active Result ──────────────────────────────────
function scrollToActiveResult() {
  const active = resultsList.querySelector('.result-item.active');
  if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// ─── Replace Preview ──────────────────────────────────────────
function renderReplacePreview(regex, text) {
  const replacement = replaceStringEl.value;
  if (!replacement) {
    replacePreviewWrap.hidden = true;
    return;
  }
  try {
    // Create a new regex to avoid lastIndex issues
    const flags = [...state.flags].join('');
    const freshRe = new RegExp(state.pattern, flags.includes('g') ? flags : 'g' + flags.replace('g',''));
    const result = text.replace(freshRe, replacement);
    replacePreview.textContent = result;
    replacePreviewWrap.hidden = false;
  } catch {
    replacePreviewWrap.hidden = true;
  }
}

// ─── Replace All ──────────────────────────────────────────────
btnReplaceAll.addEventListener('click', () => {
  if (!state.regex || !state.matches.length) return showToast('⚠ No matches to replace');
  const replacement = replaceStringEl.value;
  try {
    const flags = [...state.flags].join('');
    const freshRe = new RegExp(state.pattern, flags.includes('g') ? flags : 'g' + flags.replace('g',''));
    testStringEl.value = state.testString.replace(freshRe, replacement);
    runEngine();
    showToast(`✓ Replaced ${state.matches.length} match${state.matches.length !== 1 ? 'es' : ''}`);
  } catch(e) {
    showToast(`❌ Replace error: ${e.message}`);
  }
});

// ─── Regex Explanation ────────────────────────────────────────
function updateExplanation(pattern) {
  const found = [];
  const seen  = new Set();

  TOKEN_EXPLANATIONS.forEach(({ re, desc }) => {
    // Reset regex lastIndex
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(pattern)) !== null) {
      const key = m[0] + desc;
      if (!seen.has(key)) {
        seen.add(key);
        found.push({ token: m[0], desc });
      }
    }
  });

  if (found.length === 0) {
    regexExplanation.innerHTML = '';
    return;
  }

  regexExplanation.innerHTML = found.map(({ token, desc }) =>
    `<span class="explain-token"><span class="token-pat">${escapeHtml(token)}</span><span class="token-sep">→</span><span class="token-desc">${desc}</span></span>`
  ).join('');
}

// ─── Copy Utilities ───────────────────────────────────────────
btnCopyRegex.addEventListener('click', () => {
  const flags = ['g','i','m','s'].filter(f => state.flags.has(f)).join('');
  const text = `/${state.pattern}/${flags}`;
  copyToClipboard(text, 'Regex copied!');
});

btnCopyJSON.addEventListener('click', () => {
  if (!state.matches.length) return showToast('⚠ No matches to copy');
  const data = state.matches.map((m, i) => ({
    index:  i + 1,
    match:  m[0],
    start:  m.index,
    end:    m.index + m[0].length,
    groups: m.length > 1 ? [...m].slice(1) : [],
  }));
  copyToClipboard(JSON.stringify(data, null, 2), 'JSON copied!');
});

btnCopyMatches.addEventListener('click', () => {
  if (!state.matches.length) return showToast('⚠ No matches to copy');
  const text = state.matches.map(m => m[0]).join('\n');
  copyToClipboard(text, 'Matches copied!');
});

btnCopyReplace.addEventListener('click', () => {
  const text = replacePreview.textContent;
  if (!text) return showToast('⚠ Nothing to copy');
  copyToClipboard(text, 'Result copied!');
});

// ─── Import File ──────────────────────────────────────────────
btnImport.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    testStringEl.value = e.target.result;
    runEngine();
    showToast(`✓ Loaded: ${file.name}`);
  };
  reader.onerror = () => showToast('❌ Failed to read file');
  reader.readAsText(file);
  fileInput.value = '';
});

// ─── Clear Text ───────────────────────────────────────────────
btnClearText.addEventListener('click', () => {
  testStringEl.value = '';
  runEngine();
});

// ─── Save Results JSON ────────────────────────────────────────
// Triggered via the copy JSON button (export option)
// We can extend this to actually download if needed — wired via btnCopyJSON above.

// ─── Keyboard Shortcuts ───────────────────────────────────────
document.addEventListener('keydown', e => {
  // Alt+ArrowRight → next match
  if (e.altKey && e.key === 'ArrowRight') { btnNext.click(); e.preventDefault(); }
  // Alt+ArrowLeft  → prev match
  if (e.altKey && e.key === 'ArrowLeft')  { btnPrev.click(); e.preventDefault(); }
  // Ctrl+Shift+C   → copy regex
  if (e.ctrlKey && e.shiftKey && e.key === 'C') { btnCopyRegex.click(); e.preventDefault(); }
});

// ─── Init ─────────────────────────────────────────────────────
(function init() {
  // Load email preset on launch for instant wow-factor
  const emailPreset = PRESETS.email;
  regexPatternEl.value = emailPreset.pattern;
  testStringEl.value   = emailPreset.text;
  runEngine();
})();
