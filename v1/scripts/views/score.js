window.Scorer = window.Scorer || {};

(() => {
  const { data, router } = window.Scorer;

  const state = {
    inputText: data.SAMPLE_INPUT_JSON,
    inputFormat: 'json',
    pickerQuery: '',
    pickerState: 'all',
    pickerSpecies: 'all',
    pickerSort: 'recent',
    managerId: null,
    selection: {},
    openGroups: { 'species:Bear': true, 'species:Turkey': false },
  };

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  function relativeDate(iso) {
    const today = new Date('2026-05-05');
    const d = new Date(iso);
    const days = Math.round((today - d) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 14) return days + 'd ago';
    if (days < 60) return Math.floor(days / 7) + 'w ago';
    return Math.floor(days / 30) + 'mo ago';
  }

  function ensureSelection(managerId) {
    if (!managerId) return;
    if (state.selection[managerId]) return;
    const rules = data.rulesForManager(managerId);
    const set = new Set(rules.map(r => r.id));
    state.selection[managerId] = set;
  }

  function selectedRuleIds() {
    if (!state.managerId) return new Set();
    return state.selection[state.managerId] || new Set();
  }

  function rules() {
    return state.managerId ? data.rulesForManager(state.managerId) : [];
  }

  function selectedCount() {
    return selectedRuleIds().size;
  }

  function speciesGroups() {
    const all = rules();
    const map = {};
    all.forEach(r => {
      if (!map[r.species]) map[r.species] = [];
      map[r.species].push(r);
    });
    return map;
  }

  function ruleTypeGroups() {
    const all = rules();
    const map = {};
    all.forEach(r => {
      if (!map[r.ruleType]) map[r.ruleType] = [];
      map[r.ruleType].push(r);
    });
    return map;
  }

  function pickerMatches() {
    return data.MANAGERS.filter(m => m.isGroundTruth).filter(m => {
      if (state.pickerState !== 'all' && m.state !== state.pickerState) return false;
      if (state.pickerSpecies !== 'all' && !m.species.includes(state.pickerSpecies)) return false;
      if (state.pickerQuery) {
        const q = state.pickerQuery.toLowerCase();
        const hay = (m.name + ' ' + m.state + ' ' + m.species.join(' ')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (state.pickerSort === 'recent') {
        return (b.lastUsedAt || b.lastCuratedAt).localeCompare(a.lastUsedAt || a.lastCuratedAt);
      }
      if (state.pickerSort === 'alpha') return a.name.localeCompare(b.name);
      return 0;
    });
  }

  function chip(label, value, current, key, count) {
    const pressed = current === value;
    return `<button class="chip" type="button" aria-pressed="${pressed}" data-filter="${key}" data-value="${value}">
      <span>${escapeHtml(label)}</span>
      ${count != null ? `<span class="chip__count">${count}</span>` : ''}
    </button>`;
  }

  function renderInputCard() {
    return `
      <div class="input-card">
        <div class="input-card__head">
          <div class="panel__title">
            <strong>Candidate</strong>
            <span>paste extraction to validate</span>
          </div>
          <div class="format-toggle" role="tablist" aria-label="Input format">
            ${['text', 'md', 'json'].map(f => `
              <button class="format-toggle__btn" role="tab" aria-pressed="${state.inputFormat === f}" data-format="${f}">${f}</button>
            `).join('')}
          </div>
        </div>
        <textarea class="textarea" id="score-input" placeholder="Paste extraction output (text, markdown, or JSON)...">${escapeHtml(state.inputText)}</textarea>
        <div class="stat-row" style="margin-top:var(--space-3);">
          <span><strong>${state.inputText.length.toLocaleString()}</strong>chars</span>
          <span><strong>${state.inputText.split('\n').length}</strong>lines</span>
          ${state.inputFormat === 'json' && tryParseJson(state.inputText) ? `<span style="color:var(--status-completed);">valid JSON</span>` : ''}
        </div>
      </div>
    `;
  }

  function tryParseJson(s) {
    try { JSON.parse(s); return true; } catch { return false; }
  }

  function renderPicker() {
    const matches = pickerMatches();
    const stateChips = [
      chip('All states', 'all', state.pickerState, 'pickerState'),
      ...Object.values(data.STATES).map(s => {
        const count = data.MANAGERS.filter(m => m.isGroundTruth && m.state === s.code).length;
        if (count === 0) return '';
        return chip(s.code, s.code, state.pickerState, 'pickerState', count);
      }),
    ].join('');
    const speciesChips = [
      chip('Any', 'all', state.pickerSpecies, 'pickerSpecies'),
      ...data.SPECIES.map(sp => {
        const count = data.MANAGERS.filter(m => m.isGroundTruth && m.species.includes(sp)).length;
        return chip(sp, sp, state.pickerSpecies, 'pickerSpecies', count);
      }),
    ].join('');

    const recent = data.MANAGERS
      .filter(m => m.isGroundTruth && m.lastUsedAt)
      .sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt))
      .slice(0, 3);

    return `
      <div class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <strong>Reference</strong>
            <span>pick a ground truth document</span>
          </div>
          <div class="search" style="width:240px;">
            <span class="search__icon">⌕</span>
            <input class="input" id="picker-search" placeholder="Search managers..." value="${escapeHtml(state.pickerQuery)}" />
          </div>
        </div>

        ${recent.length > 0 && !state.pickerQuery && state.pickerState === 'all' && state.pickerSpecies === 'all' ? `
          <div style="display:flex; flex-direction:column; gap:var(--space-3); margin-bottom:var(--space-4);">
            <div class="chip-group__label">Recently used</div>
            <div style="display:flex; gap:var(--space-2); flex-wrap:wrap;">
              ${recent.map(m => `
                <button class="chip" type="button" data-recent="${m.id}">
                  <span class="manager-card__seal" style="padding:0; background:transparent; box-shadow:none;">${m.state}</span>
                  <span style="color:var(--text-primary);">${escapeHtml(m.name)}</span>
                  <span class="chip__count">${relativeDate(m.lastUsedAt)}</span>
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div style="display:flex; flex-direction:column; gap:var(--space-3); margin-bottom:var(--space-4);">
          <div style="display:flex; align-items:center; gap:var(--space-3); flex-wrap:wrap;">
            <span class="chip-group__label">State</span>
            <div class="chip-row">${stateChips}</div>
          </div>
          <div style="display:flex; align-items:center; gap:var(--space-3); flex-wrap:wrap;">
            <span class="chip-group__label">Species</span>
            <div class="chip-row">${speciesChips}</div>
          </div>
        </div>

        <div class="toolbar__count" style="margin-bottom:var(--space-3);">
          ${matches.length} ${matches.length === 1 ? 'match' : 'matches'}
        </div>

        ${matches.length === 0 ? `
          <div class="empty">
            <div class="empty__title">No matches</div>
            <div class="empty__body">Try clearing the state or species filter, or fork a new ground truth from the Truth Library.</div>
          </div>
        ` : `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-3);">
            ${matches.map(m => `
              <button class="manager-card" type="button" data-manager="${m.id}" style="padding:var(--space-4);">
                <div class="manager-card__head">
                  <div class="manager-card__seal">${m.state}</div>
                  <span class="manager-card__truth-flag">Truth</span>
                </div>
                <div>
                  <div class="manager-card__name" style="font-size:var(--fs-md);">${escapeHtml(m.name)}</div>
                  <div class="manager-card__locale">${escapeHtml(m.seasonWindow)}</div>
                </div>
                <div class="manager-card__counts">
                  <div class="manager-card__count">
                    <div class="manager-card__count-num">${m.regulationCount}</div>
                    <div class="manager-card__count-label">Regulations</div>
                  </div>
                  <div class="manager-card__count">
                    <div class="manager-card__count-num">${m.ruleCount}</div>
                    <div class="manager-card__count-label">Rules</div>
                  </div>
                </div>
                <div class="manager-card__foot">
                  <div class="manager-card__species">
                    ${m.species.map(s => `<span class="manager-card__species-tag">${escapeHtml(s)}</span>`).join('')}
                  </div>
                </div>
              </button>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  function renderPicked() {
    const m = data.managerById(state.managerId);
    if (!m) return '';
    return `
      <div class="picked-manager">
        <div class="picked-manager__seal">${m.state}</div>
        <div>
          <div class="picked-manager__name">${escapeHtml(m.name)}</div>
          <div class="picked-manager__sub">${escapeHtml(m.seasonWindow)} · ${m.regulationCount} regulations · ${m.ruleCount} rules · ${m.species.join(', ')}</div>
        </div>
        <button class="btn btn--ghost btn--sm" type="button" data-action="change-manager">Change</button>
      </div>
    `;
  }

  function toggleSelection(ids, onOrOff) {
    const set = selectedRuleIds();
    ids.forEach(id => onOrOff ? set.add(id) : set.delete(id));
    state.selection[state.managerId] = set;
  }

  function renderSelectionPanel() {
    const total = rules().length;
    const selected = selectedCount();
    const groupsBySpecies = speciesGroups();
    const groupsByType = ruleTypeGroups();
    const sel = selectedRuleIds();

    return `
      <div class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <strong>Sub-selection</strong>
            <span>pick what to score against</span>
          </div>
          <div style="display:flex; gap:var(--space-2);">
            <button class="btn btn--ghost btn--sm" type="button" data-bulk="all">Select all</button>
            <button class="btn btn--ghost btn--sm" type="button" data-bulk="none">Clear</button>
          </div>
        </div>

        <div style="display:grid; gap:var(--space-2);">
          <div class="group ${state.openGroups['__regulations'] ? 'group--open' : ''}">
            <button class="group__head" type="button" data-group-toggle="__regulations">
              <span class="group__caret">▶</span>
              <span class="group__name">
                <span class="group__name-eyebrow">Group</span>
                All regulations
              </span>
              <span class="group__count">all rules · <strong>${total}</strong></span>
              <span class="group__toggle" data-bulk="all-rules">Select all</span>
            </button>
          </div>

          <div class="panel__title" style="margin-top:var(--space-4); margin-bottom:var(--space-2);">
            <strong style="font-size:var(--fs-sm);">By species</strong>
            <span>tap a group to expand</span>
          </div>

          ${Object.keys(groupsBySpecies).map(species => {
            const groupKey = 'species:' + species;
            const groupRules = groupsBySpecies[species];
            const groupSel = groupRules.filter(r => sel.has(r.id)).length;
            const open = state.openGroups[groupKey];
            return `
              <div class="group ${open ? 'group--open' : ''}">
                <button class="group__head" type="button" data-group-toggle="${groupKey}">
                  <span class="group__caret">▶</span>
                  <span class="group__name">
                    <span class="group__name-eyebrow">Species</span>
                    ${escapeHtml(species)}
                  </span>
                  <span class="group__count"><strong>${groupSel}</strong>/ ${groupRules.length}</span>
                  <span class="group__toggle" data-group-bulk="${groupKey}">${groupSel === groupRules.length ? 'Deselect' : 'Select all'}</span>
                </button>
                <div class="group__body">
                  <div class="tag-stack">
                    ${groupRules.map(r => `
                      <button class="tag" type="button" aria-pressed="${sel.has(r.id)}" data-rule="${r.id}">
                        <div class="tag__check">${sel.has(r.id) ? '✓' : ''}</div>
                        <div class="tag__body">
                          <div class="tag__head">
                            <span class="tag__id">${r.id}</span>
                            <span class="tag__sep">·</span>
                            <span>${escapeHtml(r.ruleType)}</span>
                            <span class="tag__sep">·</span>
                            <span>${escapeHtml(r.seasonType)}</span>
                            ${r.legalLabel ? `<span class="tag__sep">·</span><span style="color: var(--text-secondary);">${escapeHtml(r.legalLabel)}</span>` : ''}
                            ${r.huntCode ? `<span class="tag__sep">·</span><span style="font-family: var(--font-mono);">${escapeHtml(r.huntCode)}</span>` : ''}
                          </div>
                          <div class="tag__summary">${escapeHtml(r.summary)}</div>
                        </div>
                        <span></span>
                      </button>
                    `).join('')}
                  </div>
                </div>
              </div>
            `;
          }).join('')}

          <div class="panel__title" style="margin-top:var(--space-4); margin-bottom:var(--space-2);">
            <strong style="font-size:var(--fs-sm);">By rule type</strong>
            <span>cross-cut filter</span>
          </div>

          ${Object.keys(groupsByType).map(type => {
            const groupKey = 'type:' + type;
            const groupRules = groupsByType[type];
            const groupSel = groupRules.filter(r => sel.has(r.id)).length;
            const open = state.openGroups[groupKey];
            return `
              <div class="group ${open ? 'group--open' : ''}">
                <button class="group__head" type="button" data-group-toggle="${groupKey}">
                  <span class="group__caret">▶</span>
                  <span class="group__name">
                    <span class="group__name-eyebrow">Type</span>
                    ${escapeHtml(type)}
                  </span>
                  <span class="group__count"><strong>${groupSel}</strong>/ ${groupRules.length}</span>
                  <span class="group__toggle" data-group-bulk="${groupKey}">${groupSel === groupRules.length ? 'Deselect' : 'Select all'}</span>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderRunBar() {
    const total = rules().length;
    const selected = selectedCount();
    const sel = selectedRuleIds();
    const bear = rules().filter(r => r.species === 'Bear' && sel.has(r.id)).length;
    const turkey = rules().filter(r => r.species === 'Turkey' && sel.has(r.id)).length;
    return `
      <div class="run-bar">
        <div class="run-bar__tally">
          <span class="run-bar__num">${selected}</span>
          <span class="run-bar__label">rules selected of ${total}</span>
          <span class="run-bar__breakdown">${bear} Bear · ${turkey} Turkey</span>
        </div>
        <div style="display:flex; gap:var(--space-3);">
          <button class="btn btn--ghost" type="button" data-action="cancel">Cancel</button>
          <button class="btn btn--primary" type="button" data-action="run" ${selected === 0 || !state.inputText ? 'disabled' : ''}>
            Run scoring
            <span class="btn__kbd">⏎</span>
          </button>
        </div>
      </div>
    `;
  }

  function render(params) {
    if (params && params.get) {
      const mid = params.get('manager');
      if (mid && data.managerById(mid)) {
        state.managerId = mid;
        ensureSelection(mid);
      }
    }
    if (state.managerId) ensureSelection(state.managerId);

    const root = document.getElementById('view-score');

    root.innerHTML = `
      <div class="view-header">
        <div class="view-header__intro">
          <span class="view-eyebrow">03 · Validate</span>
          <h1>Validate <span class="highlight">candidate</span> against reference</h1>
          <p class="view-lede">Paste a candidate extraction, pick a reference ground truth document, then narrow to the slice that matters. Either side can be promoted to a new ground truth document later.</p>
        </div>
      </div>

      <div class="score-stage">
        <div class="score-stage__col">
          ${renderInputCard()}
        </div>
        <div class="score-stage__col">
          ${state.managerId ? renderPicked() : renderPicker()}
        </div>
      </div>

      ${state.managerId ? `<div style="height:var(--space-6);"></div>${renderSelectionPanel()}${renderRunBar()}` : ''}
    `;

    // Format toggle
    root.querySelectorAll('.format-toggle__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.inputFormat = btn.dataset.format;
        if (state.inputFormat === 'json') state.inputText = data.SAMPLE_INPUT_JSON;
        if (state.inputFormat === 'text') state.inputText = 'Bear: one bear per license year statewide.\nArchery bear: October 18 to November 1, 2026.\nFirearm bear: November 22 to November 25, 2026...';
        if (state.inputFormat === 'md') state.inputText = '# Bear regulations\n\n- **Bag limit**: One bear per license year, statewide\n- **Archery season**: Oct 18 to Nov 1, 2026\n- **Firearm season**: Nov 22 to Nov 25, 2026';
        render();
      });
    });

    // Input
    const inputEl = root.querySelector('#score-input');
    if (inputEl) {
      inputEl.addEventListener('input', e => { state.inputText = e.target.value; });
    }

    // Picker filters
    root.querySelectorAll('.chip[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        state[btn.dataset.filter] = btn.dataset.value;
        render();
      });
    });

    const pickerSearch = root.querySelector('#picker-search');
    if (pickerSearch) {
      pickerSearch.addEventListener('input', e => {
        state.pickerQuery = e.target.value;
        render();
        requestAnimationFrame(() => {
          const el = root.querySelector('#picker-search');
          if (el) {
            el.focus();
            el.setSelectionRange(state.pickerQuery.length, state.pickerQuery.length);
          }
        });
      });
    }

    root.querySelectorAll('[data-recent]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.managerId = btn.dataset.recent;
        ensureSelection(state.managerId);
        router.navigate('score', { manager: state.managerId });
      });
    });

    root.querySelectorAll('[data-manager]').forEach(card => {
      card.addEventListener('click', () => {
        state.managerId = card.dataset.manager;
        ensureSelection(state.managerId);
        router.navigate('score', { manager: state.managerId });
      });
    });

    root.querySelectorAll('[data-action="change-manager"]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.managerId = null;
        router.navigate('score');
      });
    });

    // Group toggles
    root.querySelectorAll('[data-group-toggle]').forEach(btn => {
      btn.addEventListener('click', e => {
        if (e.target.closest('[data-group-bulk]')) return;
        const key = btn.dataset.groupToggle;
        state.openGroups[key] = !state.openGroups[key];
        render();
      });
    });

    root.querySelectorAll('[data-group-bulk]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const key = btn.dataset.groupBulk;
        const [kind, value] = key.split(':');
        let groupRules;
        if (kind === 'species') groupRules = rules().filter(r => r.species === value);
        else if (kind === 'type') groupRules = rules().filter(r => r.ruleType === value);
        else groupRules = [];
        const sel = selectedRuleIds();
        const allOn = groupRules.every(r => sel.has(r.id));
        toggleSelection(groupRules.map(r => r.id), !allOn);
        render();
      });
    });

    // Bulk all
    root.querySelectorAll('[data-bulk]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.bulk;
        if (action === 'all' || action === 'all-rules') {
          state.selection[state.managerId] = new Set(rules().map(r => r.id));
        } else if (action === 'none') {
          state.selection[state.managerId] = new Set();
        }
        render();
      });
    });

    // Per-rule toggle
    root.querySelectorAll('[data-rule]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.rule;
        const sel = selectedRuleIds();
        if (sel.has(id)) sel.delete(id);
        else sel.add(id);
        state.selection[state.managerId] = sel;
        render();
      });
    });

    // Run / cancel
    root.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'run') {
          router.navigate('report', { id: data.SAMPLE_REPORT.id });
        }
        if (action === 'cancel') {
          router.navigate('library');
        }
      });
    });
  }

  window.Scorer.router.register('score', render);
})();
