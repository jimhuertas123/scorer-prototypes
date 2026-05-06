window.Scorer = window.Scorer || {};

(() => {
  const { data, router } = window.Scorer;

  const state = {
    inputText: data.SAMPLE_INPUT_JSON,
    inputFormat: 'json',
    pickerQuery: '',
    pickerState: 'all',
    pickerSpecies: 'all',
    managerId: null,
    selection: {},
    regSelection: {},
    regQuery: '',
    regSpecies: 'all',
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
      if (state.regSpecies !== 'all') {
        if (g.species && g.species.length > 0 && !g.species.includes(state.regSpecies)) return false;
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
      if (state.pickerState !== 'all' && m.state !== state.pickerState) return false;
      if (state.pickerSpecies !== 'all' && !m.species.includes(state.pickerSpecies)) return false;
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
    const stateChips = [
      chip('All', 'all', state.pickerState, 'pickerState'),
      ...Object.values(data.STATES).filter(s => data.MANAGERS.some(m => m.isGroundTruth && m.state === s.code)).map(s => chip(s.code, s.code, state.pickerState, 'pickerState')),
    ].join('');
    const speciesChips = [
      chip('Any', 'all', state.pickerSpecies, 'pickerSpecies'),
      ...data.SPECIES.map(sp => chip(sp, sp, state.pickerSpecies, 'pickerSpecies')),
    ].join('');

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
                <span class="list-item__meta">${m.species.join(' · ')} · ${m.ruleCount} rules</span>
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

    const bear = all.filter(r => r.species === 'Bear' && sel.has(r.id)).length;
    const turkey = all.filter(r => r.species === 'Turkey' && sel.has(r.id)).length;

    const visibleRegList = visibleRegs();
    const visibleRegSelected = visibleRegList.filter(g => regSel.has(g.id)).length;
    const allVisibleRegOn = visibleRegList.length > 0 && visibleRegSelected === visibleRegList.length;
    const regSpeciesChip = (label, value) => `
      <button class="chip" type="button" aria-pressed="${state.regSpecies === value}" data-reg-filter="${value}">
        <span>${escapeHtml(label)}</span>
      </button>
    `;

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
              <span class="detail__section-meta">${Object.keys(speciesGroups).length} groups</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
              ${Object.keys(speciesGroups).map(sp => {
                const list = speciesGroups[sp];
                const on = list.filter(r => sel.has(r.id)).length;
                return `
                  <div style="border: 1px solid var(--card-border-strong); border-radius: var(--radius-sm); padding: var(--space-3); display: flex; justify-content: space-between; align-items: center;">
                    <div style="display:flex; flex-direction:column; gap: 2px;">
                      <span style="font-size: var(--fs-sm); font-weight: 600; color: var(--text-primary);">${escapeHtml(sp)}</span>
                      <span style="font-family: var(--font-mono); font-size: var(--fs-xxs); color: var(--text-tertiary); text-transform: uppercase;">${on} of ${list.length} selected</span>
                    </div>
                    <button class="btn btn--ghost btn--sm" data-group-bulk="species:${sp}">${on === list.length ? 'Deselect' : 'Select all'}</button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div>
            <div class="detail__section-head" style="margin-bottom: var(--space-2);">
              <span class="detail__section-title">By rule type</span>
              <span class="detail__section-meta">cross-cut</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-2);">
              ${Object.keys(ruleTypeGroups).map(t => {
                const list = ruleTypeGroups[t];
                const on = list.filter(r => sel.has(r.id)).length;
                const allOn = on === list.length;
                return `
                  <button class="chip" style="justify-content: space-between; padding: 0.45rem 0.7rem;" type="button" aria-pressed="${allOn && on > 0}" data-group-bulk="type:${t}">
                    <span>${escapeHtml(t)}</span>
                    <span class="chip__count">${on}/${list.length}</span>
                  </button>
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
                    ${regSpeciesChip('Any species', 'all')}
                    ${data.SPECIES.map(sp => regSpeciesChip(sp, sp)).join('')}
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
            <span style="font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--text-tertiary);">/ ${all.length + regs.length} entries · ${sel.size}r ${regSel.size}g · ${bear}B ${turkey}T</span>
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

    root.querySelectorAll('.chip[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => { state[btn.dataset.filter] = btn.dataset.value; render(); });
    });

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

    root.querySelectorAll('[data-group-bulk]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [kind, val] = btn.dataset.groupBulk.split(':');
        const list = kind === 'species' ? rulesOf().filter(r => r.species === val) : rulesOf().filter(r => r.ruleType === val);
        const sel = selectedSet();
        const allOn = list.every(r => sel.has(r.id));
        list.forEach(r => allOn ? sel.delete(r.id) : sel.add(r.id));
        state.selection[state.managerId] = sel;
        render();
      });
    });

    root.querySelectorAll('[data-reg-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.regSpecies = btn.dataset.regFilter;
        render();
      });
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
