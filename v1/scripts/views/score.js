window.Scorer = window.Scorer || {};

(() => {
  const { data, router } = window.Scorer;

  const state = {
    inputText: data.SAMPLE_INPUT_JSON,
    inputFormat: 'json',
    pickerQuery: '',
    pickerState: new Set(),
    pickerSpecies: new Set(),
    pickerSort: 'recent',
    pickerStateDropdownOpen: false,
    pickerStateDropdownQuery: '',
    pickerSpeciesDropdownOpen: false,
    pickerSpeciesDropdownQuery: '',
    managerId: null,
    selection: {},
    regSelection: {},
    openGroups: {},
    regQuery: '',
    regSpecies: new Set(),
    regSpeciesDropdownOpen: false,
    regSpeciesDropdownQuery: '',
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
    if (!state.selection[managerId]) state.selection[managerId] = new Set(data.rulesForManager(managerId).map(r => r.id));
    if (!state.regSelection[managerId]) state.regSelection[managerId] = new Set(data.regulationsForManager(managerId).map(g => g.id));
  }

  function regsAll() { return state.managerId ? data.regulationsForManager(state.managerId) : []; }
  function regSelectedSet() { return state.regSelection[state.managerId] || new Set(); }
  function visibleRegs() {
    return regsAll().filter(g => {
      if (state.regSpecies.size > 0) {
        // OR-match: keep regs that target none of the picked species, OR target at least one of them
        if (g.species && g.species.length > 0 && !g.species.some(sp => state.regSpecies.has(sp))) return false;
      }
      if (state.regQuery) {
        const q = state.regQuery.toLowerCase();
        const hay = ((g.title || '') + ' ' + (g.content || '') + ' ' + g.id).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
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
      if (state.pickerState.size > 0 && !state.pickerState.has(m.state)) return false;
      if (state.pickerSpecies.size > 0 && !m.species.some(sp => state.pickerSpecies.has(sp))) return false;
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
    const stateItems = Object.values(data.STATES).map(s => ({
      key: s.code, label: s.code,
      count: data.MANAGERS.filter(m => m.isGroundTruth && m.state === s.code).length,
    }));
    const stateChips = window.Scorer.MultiFilter.render({
      kind: 'pickerstate',
      items: stateItems,
      selected: state.pickerState,
      allLabel: 'All states',
      visibleCap: 5,
      state: { open: state.pickerStateDropdownOpen, query: state.pickerStateDropdownQuery },
      escapeHtml,
    });
    const speciesItems = data.allSpecies().map(sp => ({
      key: sp, label: sp,
      count: data.MANAGERS.filter(m => m.isGroundTruth && (m.species || []).includes(sp)).length,
    })).filter(it => it.count > 0);
    const speciesChips = window.Scorer.MultiFilter.render({
      kind: 'pickersp',
      items: speciesItems,
      selected: state.pickerSpecies,
      allLabel: 'Any species',
      visibleCap: 5,
      state: { open: state.pickerSpeciesDropdownOpen, query: state.pickerSpeciesDropdownQuery },
      escapeHtml,
    });

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
                    ${m.species.slice(0, 3).map(s => `<span class="manager-card__species-tag">${escapeHtml(s)}</span>`).join('')}
                    ${m.species.length > 3 ? `<span class="manager-card__species-tag" title="${escapeHtml(m.species.slice(3).join(', '))}">+${m.species.length - 3}</span>` : ''}
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
            <strong>Hunt rules</strong>
            <span>${selected}/${total} selected · season + species specific</span>
          </div>
          <div style="display:flex; gap:var(--space-2);">
            <button class="btn btn--ghost btn--sm" type="button" data-bulk="all">Select all</button>
            <button class="btn btn--ghost btn--sm" type="button" data-bulk="none">Clear</button>
          </div>
        </div>

        <div style="display:grid; gap:var(--space-2);">
          <div class="panel__title" style="margin-bottom:var(--space-2);">
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
                <div class="group__body">
                  <div class="tag-stack">
                    ${groupRules.map(r => `
                      <button class="tag" type="button" aria-pressed="${sel.has(r.id)}" data-rule="${r.id}">
                        <div class="tag__check">${sel.has(r.id) ? '✓' : ''}</div>
                        <div class="tag__body">
                          <div class="tag__head">
                            <span class="tag__id">${r.id}</span>
                            <span class="tag__sep">·</span>
                            <span>${escapeHtml(r.species)}</span>
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
        </div>
      </div>

      ${renderRegulationsPanel()}
    `;
  }

  function renderRegulationsPanel() {
    const all = regsAll();
    const sel = regSelectedSet();
    const visible = visibleRegs();
    const visibleOn = visible.filter(g => sel.has(g.id)).length;
    const allVisibleOn = visible.length > 0 && visibleOn === visible.length;

    const speciesItems = data.speciesForManager(state.managerId).map(sp => ({
      key: sp, label: sp,
      count: data.regulationsForManager(state.managerId).filter(g => (g.species || []).includes(sp)).length,
    }));

    return `
      <div class="panel" style="margin-top: var(--space-5);">
        <div class="panel__head">
          <div class="panel__title">
            <strong>General regulations</strong>
            <span>${sel.size}/${all.length} selected · broad policies, not season-specific</span>
          </div>
          <div style="display:flex; gap: var(--space-2);">
            <button class="btn btn--ghost btn--sm" type="button" data-reg-bulk="all">Select all</button>
            <button class="btn btn--ghost btn--sm" type="button" data-reg-bulk="none">Clear</button>
          </div>
        </div>

        ${all.length === 0 ? `
          <div style="font-size: var(--fs-xs); color: var(--text-tertiary); padding: var(--space-3) 0;">No regulations on this document.</div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-4);">
            <div class="search" style="width:100%;">
              <span class="search__icon">⌕</span>
              <input class="input" id="reg-search" placeholder="Search regulations by title or content..." value="${escapeHtml(state.regQuery)}" />
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); flex-wrap: wrap;">
              <div class="chip-row">
                ${window.Scorer.MultiFilter.render({
                  kind: 'regsp',
                  items: speciesItems,
                  selected: state.regSpecies,
                  allLabel: 'Any species',
                  visibleCap: 5,
                  state: { open: state.regSpeciesDropdownOpen, query: state.regSpeciesDropdownQuery },
                  escapeHtml,
                })}
              </div>
              <button class="btn btn--ghost btn--sm" type="button" data-reg-bulk-visible="${allVisibleOn ? 'none' : 'all'}">${allVisibleOn ? 'Deselect visible' : 'Select all visible'}</button>
            </div>
            <div style="font-family: var(--font-mono); font-size: var(--fs-xxs); color: var(--text-tertiary); letter-spacing: var(--tracking-wide); text-transform: uppercase;">
              Showing ${visible.length} of ${all.length} · ${visibleOn} selected
            </div>
          </div>
          ${visible.length === 0 ? `
            <div style="font-size: var(--fs-xs); color: var(--text-tertiary); padding: var(--space-2) 0;">No regulations match the filter.</div>
          ` : `
            <div class="reg-scroll-list" style="display: flex; flex-direction: column; gap: var(--space-2); max-height: 480px; overflow-y: scroll; padding-right: var(--space-2); scrollbar-width: thin;">
              ${visible.map(g => {
                const on = sel.has(g.id);
                return `
                  <button class="tag" type="button" aria-pressed="${on}" data-reg-toggle="${g.id}" style="grid-template-columns: auto 1fr auto;">
                    <div class="tag__check">${on ? '✓' : ''}</div>
                    <div class="tag__body">
                      <div class="tag__head">
                        <span class="tag__id">${g.id}</span>
                        <span class="tag__sep">·</span>
                        <span>${g.species && g.species.length ? 'Applies to ' + g.species.join('/') : 'Applies to all species'}</span>
                      </div>
                      <div class="tag__summary">${escapeHtml(g.title)}</div>
                    </div>
                    <span></span>
                  </button>
                `;
              }).join('')}
            </div>
          `}
        `}
      </div>
    `;
  }

  function renderRunBar() {
    const total = rules().length;
    const selected = selectedCount();
    const sel = selectedRuleIds();
    const regSel = regSelectedSet();
    const regsTotal = regsAll().length;
    const speciesCounts = {};
    rules().forEach(r => {
      if (sel.has(r.id)) speciesCounts[r.species] = (speciesCounts[r.species] || 0) + 1;
    });
    const topSpecies = Object.entries(speciesCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const breakdown = topSpecies.map(([sp, n]) => `${n} ${sp}`).join(' · ');
    const totalSelected = selected + regSel.size;
    return `
      <div class="run-bar">
        <div class="run-bar__tally">
          <span class="run-bar__num">${totalSelected}</span>
          <span class="run-bar__label">of ${total + regsTotal} entries</span>
          <span class="run-bar__breakdown">${selected}r ${regSel.size}g${breakdown ? ' · ' + breakdown : ''}</span>
        </div>
        <div style="display:flex; gap:var(--space-3);">
          <button class="btn btn--ghost" type="button" data-action="cancel">Cancel</button>
          <button class="btn btn--primary" type="button" data-action="run" ${totalSelected === 0 || !state.inputText ? 'disabled' : ''}>
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
    const prevRegListScroll = root.querySelector('.reg-scroll-list')?.scrollTop || 0;

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

    const newRegList = root.querySelector('.reg-scroll-list');
    if (newRegList && prevRegListScroll) newRegList.scrollTop = prevRegListScroll;

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

    // Picker filters (multi-select with Other dropdown)
    [['pickerstate', 'pickerState'], ['pickersp', 'pickerSpecies']].forEach(([kind, stateKey]) => {
      const ddOpenKey = stateKey + 'DropdownOpen';
      const ddQueryKey = stateKey + 'DropdownQuery';
      window.Scorer.MultiFilter.wire({
        root, kind,
        onToggle: v => {
          if (state[stateKey].has(v)) state[stateKey].delete(v); else state[stateKey].add(v);
          render();
        },
        onClear: () => { state[stateKey] = new Set(); render(); },
        onClearOther: () => {
          const items = stateKey === 'pickerState'
            ? Object.values(data.STATES).map(s => ({ key: s.code, count: data.MANAGERS.filter(m => m.isGroundTruth && m.state === s.code).length }))
            : data.allSpecies().map(sp => ({ key: sp, count: data.MANAGERS.filter(m => m.isGroundTruth && (m.species || []).includes(sp)).length })).filter(it => it.count > 0);
          const sorted = [...items].sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
          const otherKeys = new Set(sorted.slice(5).map(it => it.key));
          state[stateKey] = new Set([...state[stateKey]].filter(v => !otherKeys.has(v)));
          render();
        },
        onToggleDropdown: () => {
          state[ddOpenKey] = !state[ddOpenKey];
          state[ddQueryKey] = '';
          // Close the other picker dropdown
          const otherStateKey = stateKey === 'pickerState' ? 'pickerSpecies' : 'pickerState';
          state[otherStateKey + 'DropdownOpen'] = false;
          render();
        },
        onSearch: q => {
          state[ddQueryKey] = q;
          render();
          requestAnimationFrame(() => {
            const el = root.querySelector(`#${kind}-other-search`);
            if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
          });
        },
      });
    });

    if (!window.__scorePickerOutside) {
      window.__scorePickerOutside = ev => {
        const stOpen = state.pickerStateDropdownOpen;
        const spOpen = state.pickerSpeciesDropdownOpen;
        if (!stOpen && !spOpen) return;
        const view = document.getElementById('view-score');
        if (!view) return;
        const stP = view.querySelector('[data-pickerstate-other]');
        const spP = view.querySelector('[data-pickersp-other]');
        let changed = false;
        if (stOpen && stP && !stP.contains(ev.target)) { state.pickerStateDropdownOpen = false; state.pickerStateDropdownQuery = ''; changed = true; }
        if (spOpen && spP && !spP.contains(ev.target)) { state.pickerSpeciesDropdownOpen = false; state.pickerSpeciesDropdownQuery = ''; changed = true; }
        if (changed) render();
      };
      document.addEventListener('click', window.__scorePickerOutside);
    }

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

    // Regulations: bulk all/clear (manager-wide)
    root.querySelectorAll('[data-reg-bulk]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.regBulk;
        if (action === 'all') state.regSelection[state.managerId] = new Set(regsAll().map(g => g.id));
        else if (action === 'none') state.regSelection[state.managerId] = new Set();
        render();
      });
    });

    // Regulations: bulk visible (filtered)
    root.querySelectorAll('[data-reg-bulk-visible]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.regBulkVisible;
        const visible = visibleRegs();
        const set = regSelectedSet();
        if (action === 'all') visible.forEach(g => set.add(g.id));
        else visible.forEach(g => set.delete(g.id));
        state.regSelection[state.managerId] = set;
        render();
      });
    });

    // Regulations: species filter (multi-select with Other dropdown)
    window.Scorer.MultiFilter.wire({
      root, kind: 'regsp',
      onToggle: v => {
        if (state.regSpecies.has(v)) state.regSpecies.delete(v); else state.regSpecies.add(v);
        render();
      },
      onClear: () => { state.regSpecies = new Set(); render(); },
      onClearOther: () => {
        const items = data.speciesForManager(state.managerId);
        const other = new Set(items.slice(5));
        state.regSpecies = new Set([...state.regSpecies].filter(v => !other.has(v)));
        render();
      },
      onToggleDropdown: () => {
        state.regSpeciesDropdownOpen = !state.regSpeciesDropdownOpen;
        state.regSpeciesDropdownQuery = '';
        render();
      },
      onSearch: q => {
        state.regSpeciesDropdownQuery = q;
        render();
        requestAnimationFrame(() => {
          const el = root.querySelector('#regsp-other-search');
          if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
        });
      },
    });

    if (!window.__scoreRegspOutside) {
      window.__scoreRegspOutside = ev => {
        if (!state.regSpeciesDropdownOpen) return;
        const view = document.getElementById('view-score');
        const el = view && view.querySelector('[data-regsp-other]');
        if (el && !el.contains(ev.target)) {
          state.regSpeciesDropdownOpen = false;
          state.regSpeciesDropdownQuery = '';
          render();
        }
      };
      document.addEventListener('click', window.__scoreRegspOutside);
    }

    // Regulations: search
    const regSearch = root.querySelector('#reg-search');
    if (regSearch) {
      regSearch.addEventListener('input', e => {
        state.regQuery = e.target.value;
        render();
        requestAnimationFrame(() => {
          const el = root.querySelector('#reg-search');
          if (el) { el.focus(); el.setSelectionRange(state.regQuery.length, state.regQuery.length); }
        });
      });
    }

    // Per-regulation toggle
    root.querySelectorAll('[data-reg-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.regToggle;
        const set = regSelectedSet();
        if (set.has(id)) set.delete(id);
        else set.add(id);
        state.regSelection[state.managerId] = set;
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
