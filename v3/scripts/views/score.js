window.Scorer = window.Scorer || {};

(() => {
  const { data, router } = window.Scorer;

  const state = {
    inputText: data.SAMPLE_INPUT_JSON,
    inputFormat: 'json',
    pickerQuery: '',
    pickerState: new Set(),
    pickerSpecies: new Set(),
    pickerStateDropdownOpen: false,
    pickerStateDropdownQuery: '',
    pickerSpeciesDropdownOpen: false,
    pickerSpeciesDropdownQuery: '',
    managerId: null,
    selection: {},
    regSelection: {},
    regQuery: '',
    regSpecies: new Set(),
    regSpeciesDropdownOpen: false,
    regSpeciesDropdownQuery: '',
    openGroups: {},
  };

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  function tryParseJson(s) { try { JSON.parse(s); return true; } catch { return false; } }

  function ensureSelection(managerId) {
    if (!managerId) return;
    if (!state.selection[managerId]) state.selection[managerId] = new Set(data.rulesForManager(managerId).map(r => r.id));
    if (!state.regSelection[managerId]) state.regSelection[managerId] = new Set(data.regulationsForManager(managerId).map(g => g.id));
  }

  function rulesOf() { return state.managerId ? data.rulesForManager(state.managerId) : []; }
  function regsOf() { return state.managerId ? data.regulationsForManager(state.managerId) : []; }
  function selectedSet() { return state.selection[state.managerId] || new Set(); }
  function regSelectedSet() { return state.regSelection[state.managerId] || new Set(); }

  function visibleRegs() {
    return regsOf().filter(g => {
      if (state.regSpecies.size > 0) {
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

  function pickerMatches() {
    return data.MANAGERS.filter(m => m.isGroundTruth).filter(m => {
      if (state.pickerState.size > 0 && !state.pickerState.has(m.state)) return false;
      if (state.pickerSpecies.size > 0 && !m.species.some(sp => state.pickerSpecies.has(sp))) return false;
      if (state.pickerQuery) {
        const q = state.pickerQuery.toLowerCase();
        if (!(m.name + ' ' + m.state + ' ' + m.species.join(' ')).toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }

  function chip(label, value, current, key, count) {
    return `<button class="chip" type="button" aria-pressed="${current === value}" data-filter="${key}" data-value="${value}">
      <span>${escapeHtml(label)}</span>
      ${count != null ? `<span class="chip__count">${count}</span>` : ''}
    </button>`;
  }

  function renderInputPane() {
    return `
      <aside class="inspector__pane">
        <div class="inspector__pane-head">
          <div class="inspector__pane-title">
            <strong>Candidate</strong>
            <span>paste · ${state.inputFormat.toUpperCase()}</span>
          </div>
          <div class="format-toggle">
            ${['text', 'md', 'json'].map(f => `
              <button class="format-toggle__btn" aria-pressed="${state.inputFormat === f}" data-format="${f}">${f}</button>
            `).join('')}
          </div>
        </div>
        <div class="inspector__pane-body inspector__pane-body--padded" style="display:flex; flex-direction:column; gap: var(--space-3);">
          <textarea class="textarea" id="score-input" style="flex:1; min-height:0;">${escapeHtml(state.inputText)}</textarea>
          <div class="stat-row">
            <span><strong>${state.inputText.length.toLocaleString()}</strong>chars</span>
            <span><strong>${state.inputText.split('\n').length}</strong>lines</span>
            ${state.inputFormat === 'json' && tryParseJson(state.inputText) ? `<span style="color: var(--status-completed);">valid JSON</span>` : ''}
          </div>
        </div>
      </aside>
    `;
  }

  function renderPickerPane() {
    const matches = pickerMatches();
    const stateItems = Object.values(data.STATES).map(s => ({
      key: s.code, label: s.code,
      count: data.MANAGERS.filter(m => m.isGroundTruth && m.state === s.code).length,
    }));
    const stateChips = window.Scorer.MultiFilter.render({
      kind: 'pickerstate', items: stateItems, selected: state.pickerState,
      allLabel: 'All states', visibleCap: 5,
      state: { open: state.pickerStateDropdownOpen, query: state.pickerStateDropdownQuery },
      escapeHtml,
    });
    const speciesItems = data.allSpecies().map(sp => ({
      key: sp, label: sp,
      count: data.MANAGERS.filter(m => m.isGroundTruth && (m.species || []).includes(sp)).length,
    })).filter(it => it.count > 0);
    const speciesChips = window.Scorer.MultiFilter.render({
      kind: 'pickersp', items: speciesItems, selected: state.pickerSpecies,
      allLabel: 'Any species', visibleCap: 5,
      state: { open: state.pickerSpeciesDropdownOpen, query: state.pickerSpeciesDropdownQuery },
      escapeHtml,
    });

    return `
      <aside class="inspector__pane">
        <div class="inspector__pane-head">
          <div class="inspector__pane-title">
            <strong>Reference</strong>
            <span>${matches.length} ground truth docs</span>
          </div>
        </div>
        <div class="list-filters">
          <div class="search">
            <span class="search__icon">⌕</span>
            <input class="input" id="picker-search" placeholder="Search managers..." value="${escapeHtml(state.pickerQuery)}" />
          </div>
          <div class="chip-row">${stateChips}</div>
          <div class="chip-row">${speciesChips}</div>
        </div>
        <div class="inspector__pane-body">
          ${matches.length === 0 ? `
            <div class="detail-empty" style="padding: var(--space-8) var(--space-4);">
              <div class="detail-empty__title">No matches</div>
              <div class="detail-empty__body">Clear a filter or fork a ground truth document from the library.</div>
            </div>
          ` : matches.map(m => `
            <button class="list-item" type="button" data-manager="${m.id}" aria-current="${state.managerId === m.id}">
              <span class="list-item__seal">${m.state}</span>
              <span class="list-item__body">
                <span class="list-item__name">${escapeHtml(m.name)}</span>
                <span class="list-item__meta">${m.species.slice(0, 3).join(' · ')}${m.species.length > 3 ? ' · +' + (m.species.length - 3) : ''} · ${m.ruleCount} rules</span>
              </span>
              <span class="list-item__trail list-item__trail--accent">${m.regulationCount}r</span>
            </button>
          `).join('')}
        </div>
      </aside>
    `;
  }

  function renderScopePane() {
    if (!state.managerId) {
      return `
        <main class="inspector__pane">
          <div class="inspector__pane-head">
            <div class="inspector__pane-title">
              <strong>Scope</strong>
              <span>no document picked</span>
            </div>
          </div>
          <div class="inspector__pane-body">
            <div class="detail-empty">
              <div class="detail-empty__icon">⌖</div>
              <div class="detail-empty__title">Pick a ground truth document</div>
              <div class="detail-empty__body">Once you pick a reference document, choose which subset of its rules and regulations the candidate should be validated against.</div>
            </div>
          </div>
        </main>
      `;
    }

    const m = data.managerById(state.managerId);
    const all = rulesOf();
    const sel = selectedSet();
    const regs = regsOf();
    const regSel = regSelectedSet();
    const speciesGroups = {};
    all.forEach(r => { if (!speciesGroups[r.species]) speciesGroups[r.species] = []; speciesGroups[r.species].push(r); });
    const ruleTypeGroups = {};
    all.forEach(r => { if (!ruleTypeGroups[r.ruleType]) ruleTypeGroups[r.ruleType] = []; ruleTypeGroups[r.ruleType].push(r); });

    const speciesCounts = {};
    all.forEach(r => { if (sel.has(r.id)) speciesCounts[r.species] = (speciesCounts[r.species] || 0) + 1; });
    const topSpecies = Object.entries(speciesCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const breakdown = topSpecies.map(([sp, n]) => `${n} ${sp}`).join(' · ');

    const visibleRegList = visibleRegs();
    const visibleRegSelected = visibleRegList.filter(g => regSel.has(g.id)).length;
    const allVisibleRegOn = visibleRegList.length > 0 && visibleRegSelected === visibleRegList.length;
    const regSpeciesItems = data.speciesForManager(state.managerId).map(sp => ({
      key: sp, label: sp,
      count: data.regulationsForManager(state.managerId).filter(g => (g.species || []).includes(sp)).length,
    }));

    return `
      <main class="inspector__pane">
        <div class="inspector__pane-head">
          <div class="inspector__pane-title">
            <strong>${escapeHtml(m.name)}</strong>
            <span>${m.state} · scope</span>
          </div>
          <div class="inspector__pane-tools">
            <button class="btn btn--ghost btn--sm" data-bulk="all">Select all</button>
            <button class="btn btn--ghost btn--sm" data-bulk="none">Clear</button>
          </div>
        </div>
        <div class="inspector__pane-body inspector__pane-body--padded" style="display: flex; flex-direction: column; gap: var(--space-4);">
          <div>
            <div class="detail__section-head" style="margin-bottom: var(--space-2);">
              <span class="detail__section-title">By species</span>
              <span class="detail__section-meta">tap to expand · ${Object.keys(speciesGroups).length} groups</span>
            </div>
            <div>
              ${Object.keys(speciesGroups).map(sp => {
                const list = speciesGroups[sp];
                const on = list.filter(r => sel.has(r.id)).length;
                const groupKey = 'species:' + sp;
                const open = state.openGroups[groupKey];
                return `
                  <div class="group ${open ? 'group--open' : ''}">
                    <button class="group__head" type="button" data-group-toggle="${groupKey}">
                      <span class="group__caret">▶</span>
                      <span class="group__name">
                        <span class="group__name-eyebrow">Species</span>
                        ${escapeHtml(sp)}
                      </span>
                      <span class="group__count"><strong>${on}</strong>/ ${list.length}</span>
                      <span class="group__toggle" data-group-bulk="${groupKey}">${on === list.length ? 'Deselect' : 'Select all'}</span>
                    </button>
                    <div class="group__body">
                      <div class="tag-stack">
                        ${list.map(r => `
                          <button class="tag" type="button" aria-pressed="${sel.has(r.id)}" data-rule-toggle="${r.id}">
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
            </div>
          </div>

          <div>
            <div class="detail__section-head" style="margin-bottom: var(--space-2);">
              <span class="detail__section-title">By rule type</span>
              <span class="detail__section-meta">tap to expand · cross-cut</span>
            </div>
            <div>
              ${Object.keys(ruleTypeGroups).map(t => {
                const list = ruleTypeGroups[t];
                const on = list.filter(r => sel.has(r.id)).length;
                const groupKey = 'type:' + t;
                const open = state.openGroups[groupKey];
                return `
                  <div class="group ${open ? 'group--open' : ''}">
                    <button class="group__head" type="button" data-group-toggle="${groupKey}">
                      <span class="group__caret">▶</span>
                      <span class="group__name">
                        <span class="group__name-eyebrow">Type</span>
                        ${escapeHtml(t)}
                      </span>
                      <span class="group__count"><strong>${on}</strong>/ ${list.length}</span>
                      <span class="group__toggle" data-group-bulk="${groupKey}">${on === list.length ? 'Deselect' : 'Select all'}</span>
                    </button>
                    <div class="group__body">
                      <div class="tag-stack">
                        ${list.map(r => `
                          <button class="tag" type="button" aria-pressed="${sel.has(r.id)}" data-rule-toggle="${r.id}">
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

          <div>
            <div class="detail__section-head" style="margin-bottom: var(--space-2);">
              <span class="detail__section-title">General regulations</span>
              <span class="detail__section-meta">${regSel.size}/${regs.length} selected</span>
            </div>
            ${regs.length === 0 ? `
              <div style="font-size: var(--fs-xs); color: var(--text-tertiary); padding: var(--space-2) 0;">No regulations on this document.</div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-3);">
                <div class="search">
                  <span class="search__icon">⌕</span>
                  <input class="input" id="reg-search" placeholder="Search regulations by title or content..." value="${escapeHtml(state.regQuery)}" />
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); flex-wrap: wrap;">
                  <div class="chip-row">
                    ${window.Scorer.MultiFilter.render({
                      kind: 'regsp', items: regSpeciesItems, selected: state.regSpecies,
                      allLabel: 'Any species', visibleCap: 5,
                      state: { open: state.regSpeciesDropdownOpen, query: state.regSpeciesDropdownQuery },
                      escapeHtml,
                    })}
                  </div>
                  <button class="btn btn--ghost btn--sm" data-reg-bulk-visible="${allVisibleRegOn ? 'none' : 'all'}">${allVisibleRegOn ? 'Deselect visible' : 'Select all visible'}</button>
                </div>
                <div style="font-family: var(--font-mono); font-size: var(--fs-xxs); color: var(--text-tertiary); letter-spacing: var(--tracking-wide); text-transform: uppercase;">
                  Showing ${visibleRegList.length} of ${regs.length} · ${visibleRegSelected} selected
                </div>
              </div>
              ${visibleRegList.length === 0 ? `
                <div style="font-size: var(--fs-xs); color: var(--text-tertiary); padding: var(--space-2) 0;">No regulations match the filter.</div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                  ${visibleRegList.map(g => {
                    const on = regSel.has(g.id);
                    return `
                      <button class="list-item" type="button" aria-current="${on}" data-reg-toggle="${g.id}" style="border-radius: var(--radius-sm); border: 1px solid var(--card-border-strong); border-bottom: 1px solid var(--card-border-strong); padding: var(--space-3) var(--space-4);">
                        <span class="tag__check" style="${on ? 'background: var(--accent); border-color: var(--accent); color: var(--text-primary);' : ''}">${on ? '✓' : ''}</span>
                        <span class="list-item__body">
                          <span class="list-item__name">${escapeHtml(g.title)}</span>
                          <span class="list-item__meta">${g.species && g.species.length ? 'Applies to ' + g.species.join('/') : 'Applies to all species'}</span>
                        </span>
                        <span class="list-item__trail" style="color: ${on ? 'var(--accent)' : 'var(--text-muted)'};">${g.id}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              `}
            `}
          </div>
        </div>
        <div class="inspector__pane-foot">
          <div style="display: flex; align-items: baseline; gap: var(--space-3);">
            <span style="font-family: var(--font-mono); font-size: var(--fs-xl); color: var(--accent); font-weight: 700;">${sel.size + regSel.size}</span>
            <span style="font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--text-tertiary);">/ ${all.length + regs.length} entries · ${sel.size}r ${regSel.size}g${breakdown ? ' · ' + breakdown : ''}</span>
          </div>
          <button class="btn btn--primary" data-action="run" ${(sel.size + regSel.size) === 0 || !state.inputText ? 'disabled' : ''}>Run scoring</button>
        </div>
      </main>
    `;
  }

  function render(params) {
    if (params && params.get) {
      const mid = params.get('manager');
      if (mid && data.managerById(mid)) state.managerId = mid;
    }
    if (state.managerId) ensureSelection(state.managerId);

    const root = document.getElementById('view-score');
    const prevScrolls = Array.from(root.querySelectorAll('.inspector__pane-body')).map(b => b.scrollTop);
    root.className = 'view view--inspector';
    root.innerHTML = `
      <div class="view-header">
        <div class="view-header__intro">
          <span class="view-eyebrow">03 · Validate</span>
          <h1>Validate <span class="highlight">candidate</span> against reference</h1>
        </div>
      </div>
      <div class="inspector inspector--triple">
        ${renderInputPane()}
        ${renderPickerPane()}
        ${renderScopePane()}
      </div>
    `;
    const newBodies = root.querySelectorAll('.inspector__pane-body');
    newBodies.forEach((b, i) => { if (prevScrolls[i] != null) b.scrollTop = prevScrolls[i]; });

    root.querySelectorAll('.format-toggle__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.inputFormat = btn.dataset.format;
        if (state.inputFormat === 'json') state.inputText = data.SAMPLE_INPUT_JSON;
        if (state.inputFormat === 'text') state.inputText = 'Bear: one bear per license year statewide.\nArchery bear: October 18 to November 1, 2026.\nFirearm bear: November 22 to November 25, 2026.';
        if (state.inputFormat === 'md') state.inputText = '# Bear regulations\n\n- **Bag limit**: One bear per license year, statewide\n- **Archery season**: Oct 18 to Nov 1, 2026\n- **Firearm season**: Nov 22 to Nov 25, 2026';
        render();
      });
    });

    const inputEl = root.querySelector('#score-input');
    if (inputEl) inputEl.addEventListener('input', e => { state.inputText = e.target.value; });

    // Picker filters (multi-select with Other dropdown)
    [['pickerstate', 'pickerState'], ['pickersp', 'pickerSpecies']].forEach(([kind, stateKey]) => {
      const ddOpen = stateKey + 'DropdownOpen';
      const ddQuery = stateKey + 'DropdownQuery';
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
          state[ddOpen] = !state[ddOpen];
          state[ddQuery] = '';
          const otherKey = stateKey === 'pickerState' ? 'pickerSpecies' : 'pickerState';
          state[otherKey + 'DropdownOpen'] = false;
          render();
        },
        onSearch: q => {
          state[ddQuery] = q;
          render();
          requestAnimationFrame(() => {
            const el = root.querySelector(`#${kind}-other-search`);
            if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
          });
        },
      });
    });

    if (!window.__scoreV3PickerOutside) {
      window.__scoreV3PickerOutside = ev => {
        const stOpen = state.pickerStateDropdownOpen;
        const spOpen = state.pickerSpeciesDropdownOpen;
        const rsOpen = state.regSpeciesDropdownOpen;
        if (!stOpen && !spOpen && !rsOpen) return;
        const view = document.getElementById('view-score');
        if (!view) return;
        const inside = (sel) => { const el = view.querySelector(sel); return el && el.contains(ev.target); };
        let changed = false;
        if (stOpen && !inside('[data-pickerstate-other]')) { state.pickerStateDropdownOpen = false; state.pickerStateDropdownQuery = ''; changed = true; }
        if (spOpen && !inside('[data-pickersp-other]')) { state.pickerSpeciesDropdownOpen = false; state.pickerSpeciesDropdownQuery = ''; changed = true; }
        if (rsOpen && !inside('[data-regsp-other]')) { state.regSpeciesDropdownOpen = false; state.regSpeciesDropdownQuery = ''; changed = true; }
        if (changed) render();
      };
      document.addEventListener('click', window.__scoreV3PickerOutside);
    }

    const ps = root.querySelector('#picker-search');
    if (ps) ps.addEventListener('input', e => {
      state.pickerQuery = e.target.value;
      render();
      requestAnimationFrame(() => {
        const el = root.querySelector('#picker-search');
        if (el) { el.focus(); el.setSelectionRange(state.pickerQuery.length, state.pickerQuery.length); }
      });
    });

    root.querySelectorAll('[data-manager]').forEach(item => {
      item.addEventListener('click', () => {
        state.managerId = item.dataset.manager;
        ensureSelection(state.managerId);
        render();
      });
    });

    root.querySelectorAll('[data-bulk]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.bulk === 'all') {
          state.selection[state.managerId] = new Set(rulesOf().map(r => r.id));
          state.regSelection[state.managerId] = new Set(regsOf().map(g => g.id));
        }
        if (btn.dataset.bulk === 'none') {
          state.selection[state.managerId] = new Set();
          state.regSelection[state.managerId] = new Set();
        }
        render();
      });
    });

    root.querySelectorAll('[data-group-toggle]').forEach(btn => {
      btn.addEventListener('click', e => {
        if (e.target.closest('[data-group-bulk]')) return;
        const k = btn.dataset.groupToggle;
        state.openGroups[k] = !state.openGroups[k];
        render();
      });
    });

    root.querySelectorAll('[data-group-bulk]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const [kind, val] = btn.dataset.groupBulk.split(':');
        const list = kind === 'species' ? rulesOf().filter(r => r.species === val) : rulesOf().filter(r => r.ruleType === val);
        const sel = selectedSet();
        const allOn = list.every(r => sel.has(r.id));
        list.forEach(r => allOn ? sel.delete(r.id) : sel.add(r.id));
        state.selection[state.managerId] = sel;
        render();
      });
    });

    root.querySelectorAll('[data-rule-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.ruleToggle;
        const set = selectedSet();
        if (set.has(id)) set.delete(id);
        else set.add(id);
        state.selection[state.managerId] = set;
        render();
      });
    });

    // Scope reg-species filter (multi-select with Other dropdown)
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

    const rs = root.querySelector('#reg-search');
    if (rs) rs.addEventListener('input', e => {
      state.regQuery = e.target.value;
      render();
      requestAnimationFrame(() => {
        const el = root.querySelector('#reg-search');
        if (el) { el.focus(); el.setSelectionRange(state.regQuery.length, state.regQuery.length); }
      });
    });

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

    root.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.action === 'run') router.navigate('report', { id: data.SAMPLE_REPORT.id });
      });
    });
  }

  window.Scorer.router.register('score', render);
})();
