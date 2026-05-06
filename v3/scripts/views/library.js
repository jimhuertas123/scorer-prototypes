window.Scorer = window.Scorer || {};

(() => {
  const { data, router } = window.Scorer;

  const state = {
    state: 'all',
    species: 'all',
    query: '',
    sort: 'recent',
    selectedId: null,
    expandedRegs: new Set(),
    expandedTypes: new Set(),
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
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

  function filtered() {
    return data.MANAGERS.filter(m => m.isGroundTruth).filter(m => {
      if (state.state !== 'all' && m.state !== state.state) return false;
      if (state.species !== 'all' && !m.species.includes(state.species)) return false;
      if (state.query) {
        const q = state.query.toLowerCase();
        if (!(m.name + ' ' + m.state + ' ' + m.species.join(' ')).toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (state.sort === 'recent') return b.lastCuratedAt.localeCompare(a.lastCuratedAt);
      if (state.sort === 'alpha') return a.name.localeCompare(b.name);
      if (state.sort === 'rules') return b.ruleCount - a.ruleCount;
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

  function renderListItem(m) {
    return `
      <button class="list-item" type="button" data-manager="${m.id}" aria-current="${state.selectedId === m.id}">
        <span class="list-item__seal">${m.state}</span>
        <span class="list-item__body">
          <span class="list-item__name">${escapeHtml(m.name)}</span>
          <span class="list-item__meta">${m.species.join(' · ')} · ${m.regulationCount}r ${m.ruleCount} rules</span>
        </span>
        <span class="list-item__trail">${relativeDate(m.lastCuratedAt)}</span>
      </button>
    `;
  }

  function renderDetail(m) {
    if (!m) {
      return `
        <div class="detail-empty">
          <div class="detail-empty__icon">⌖</div>
          <div class="detail-empty__title">Pick a ground truth document</div>
          <div class="detail-empty__body">Select a document from the list to inspect its regulations and rules. Or click "+ New ground truth" to fork or build one.</div>
        </div>
      `;
    }

    const regs = data.regulationsForManager(m.id);
    const rules = data.rulesForManager(m.id);
    const fees = data.licenseFeesForManager(m.id);
    const stateName = data.STATES[m.state]?.name || m.state;

    return `
      <div class="detail">
        <div class="detail__hero">
          <div class="detail__hero-eyebrow">
            <span>${escapeHtml(stateName)}</span>
            <span class="manager-card__truth-flag">Ground truth</span>
          </div>
          <div class="detail__hero-title">${escapeHtml(m.name)}</div>
          <div class="detail__hero-sub">${escapeHtml(m.seasonWindow)} · curated ${relativeDate(m.lastCuratedAt)} by ${escapeHtml(m.curatedBy || 'unknown')}</div>
        </div>

        <div class="detail__section">
          <div class="detail__section-head">
            <span class="detail__section-title">Coverage</span>
            <span class="detail__section-meta">scope</span>
          </div>
          <div class="detail__pills">
            ${m.species.map(s => `<span class="detail__pill detail__pill--accent">${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>

        <div class="detail__section">
          <div class="detail__section-head">
            <span class="detail__section-title">General regulations</span>
            <span class="detail__section-meta">${regs.length} entries · click any title to expand</span>
          </div>
          ${regs.length === 0 ? `<div class="detail__field-value detail__field-value--muted">No regulations yet.</div>` : `
            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
              ${regs.map(g => {
                const open = state.expandedRegs.has(g.id);
                return `
                  <div style="border: 1px solid var(--card-border-strong); border-radius: var(--radius-sm); overflow: hidden;">
                    <button type="button" data-reg-expand="${g.id}" style="display: grid; grid-template-columns: auto 1fr auto; gap: var(--space-3); align-items: center; width: 100%; text-align: left; padding: var(--space-3); cursor: pointer; background: transparent; font-family: inherit;">
                      <span style="font-family: var(--font-mono); font-size: var(--fs-xxs); color: var(--text-tertiary); width: 14px; transform: ${open ? 'rotate(90deg)' : 'rotate(0)'}; transition: transform var(--duration-base) var(--ease-out);">▶</span>
                      <span style="font-size: var(--fs-sm); color: var(--text-primary); font-weight: 600;">${escapeHtml(g.title)}</span>
                      <span class="detail__pill ${g.species.length === 0 ? 'detail__pill--accent' : ''}">${g.species.length === 0 ? 'all species' : g.species.join('/')}</span>
                    </button>
                    ${open ? `<div style="padding: 0 var(--space-3) var(--space-3) calc(14px + var(--space-3) * 2); font-size: var(--fs-xs); color: var(--text-secondary); line-height: 1.55; border-top: 1px solid var(--card-divider);">${escapeHtml(g.content)}</div>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <div class="detail__section">
          <div class="detail__section-head">
            <span class="detail__section-title">Hunt rules</span>
            <span class="detail__section-meta">${rules.length} entries · click a type to drill in</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--space-2);">
            ${data.RULE_TYPES.map(t => {
              const groupRules = rules.filter(r => r.ruleType === t);
              if (groupRules.length === 0) return '';
              const open = state.expandedTypes.has(t);
              return `
                <div style="border: 1px solid var(--card-border-strong); border-radius: var(--radius-sm); overflow: hidden;">
                  <button type="button" data-type-expand="${t}" style="display: grid; grid-template-columns: auto 1fr auto; gap: var(--space-3); align-items: center; width: 100%; text-align: left; padding: var(--space-3); cursor: pointer; background: transparent; font-family: inherit;">
                    <span style="font-family: var(--font-mono); font-size: var(--fs-xxs); color: var(--text-tertiary); width: 14px; transform: ${open ? 'rotate(90deg)' : 'rotate(0)'}; transition: transform var(--duration-base) var(--ease-out);">▶</span>
                    <span style="font-family: var(--font-mono); font-size: var(--fs-xxs); text-transform: uppercase; color: var(--text-tertiary); letter-spacing: var(--tracking-wide);">${escapeHtml(t)}</span>
                    <span style="font-family: var(--font-mono); font-size: var(--fs-sm); color: var(--accent); font-weight: 600;">${groupRules.length}</span>
                  </button>
                  ${open ? `
                    <div style="border-top: 1px solid var(--card-divider); padding: var(--space-3); display: flex; flex-direction: column; gap: var(--space-2); background: var(--bg-elev-1);">
                      ${groupRules.map(r => `
                        <div style="display: grid; grid-template-columns: auto 1fr auto; gap: var(--space-3); align-items: start; padding: var(--space-2) var(--space-3); border: 1px solid var(--card-divider); border-radius: var(--radius-sm); background: var(--card-bg);">
                          <span style="font-family: var(--font-mono); font-size: var(--fs-xxs); color: var(--text-tertiary);">${r.id}</span>
                          <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                            <span style="font-size: var(--fs-sm); color: var(--text-primary);">${escapeHtml(r.summary)}</span>
                            <span style="font-family: var(--font-mono); font-size: var(--fs-xxs); color: var(--text-tertiary); text-transform: uppercase; letter-spacing: var(--tracking-wide);">${escapeHtml(r.species)} · ${escapeHtml(r.seasonType)}${r.legalLabel ? ' · ' + escapeHtml(r.legalLabel) : ''}${r.huntCode ? ' · ' + escapeHtml(r.huntCode) : ''}</span>
                          </div>
                          <span></span>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function render() {
    const root = document.getElementById('view-library');
    const matches = filtered();
    if (state.selectedId && !matches.find(m => m.id === state.selectedId)) state.selectedId = null;
    const selected = state.selectedId ? data.managerById(state.selectedId) : null;

    const stateChipList = [
      chip('All', 'all', state.state, 'state'),
      ...Object.values(data.STATES).map(s => {
        const count = data.MANAGERS.filter(m => m.isGroundTruth && m.state === s.code).length;
        if (count === 0) return '';
        return chip(s.code, s.code, state.state, 'state', count);
      }),
    ].join('');

    const speciesChipList = [
      chip('Any species', 'all', state.species, 'species'),
      ...data.SPECIES.map(sp => chip(sp, sp, state.species, 'species')),
    ].join('');

    root.className = 'view view--inspector';
    const prevScrolls = Array.from(root.querySelectorAll('.inspector__pane-body')).map(b => b.scrollTop);
    root.innerHTML = `
      <div class="view-header">
        <div class="view-header__intro">
          <span class="view-eyebrow">01 · Documents</span>
          <h1>Ground truth <span class="highlight">documents</span></h1>
        </div>
        <div style="display:flex; gap:var(--space-2);">
          <button class="btn" data-action="fork">Fork existing</button>
          <button class="btn btn--primary" data-action="new">+ New ground truth</button>
        </div>
      </div>

      <div class="inspector">
        <aside class="inspector__pane">
          <div class="inspector__pane-head">
            <div class="inspector__pane-title">
              <strong>Documents</strong>
              <span>${matches.length} / ${data.MANAGERS.filter(m => m.isGroundTruth).length}</span>
            </div>
          </div>
          <div class="list-filters">
            <div class="search">
              <span class="search__icon">⌕</span>
              <input class="input" id="library-search" placeholder="Search by name, state, species..." value="${escapeHtml(state.query)}" />
            </div>
            <div class="chip-row">${stateChipList}</div>
            <div class="chip-row">${speciesChipList}</div>
          </div>
          <div class="inspector__pane-body">
            ${matches.length === 0 ? `
              <div class="detail-empty" style="padding: var(--space-8) var(--space-4);">
                <div class="detail-empty__title">No matches</div>
                <div class="detail-empty__body">Clear a filter or fork a new ground truth to get started.</div>
              </div>
            ` : matches.map(renderListItem).join('')}
          </div>
        </aside>

        <main class="inspector__pane">
          <div class="inspector__pane-head">
            <div class="inspector__pane-title">
              <strong>${selected ? escapeHtml(selected.name) : 'Detail'}</strong>
              <span>${selected ? selected.state + ' · ground truth' : 'no selection'}</span>
            </div>
            <div class="inspector__pane-tools">
              ${selected ? `
                <button class="btn btn--ghost btn--sm" data-action="score-with" data-id="${selected.id}">Score against this</button>
                <button class="btn btn--ghost btn--sm" data-action="edit" data-id="${selected.id}">Edit</button>
              ` : ''}
            </div>
          </div>
          <div class="inspector__pane-body">${renderDetail(selected)}</div>
        </main>
      </div>
    `;

    const newBodies = root.querySelectorAll('.inspector__pane-body');
    newBodies.forEach((b, i) => { if (prevScrolls[i] != null) b.scrollTop = prevScrolls[i]; });

    root.querySelectorAll('.chip[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        state[btn.dataset.filter] = btn.dataset.value;
        render();
      });
    });

    const search = root.querySelector('#library-search');
    if (search) {
      search.addEventListener('input', e => {
        state.query = e.target.value;
        render();
        requestAnimationFrame(() => {
          const el = root.querySelector('#library-search');
          if (el) { el.focus(); el.setSelectionRange(state.query.length, state.query.length); }
        });
      });
    }

    root.querySelectorAll('[data-manager]').forEach(item => {
      item.addEventListener('click', () => {
        if (state.selectedId !== item.dataset.manager) {
          state.expandedRegs = new Set();
          state.expandedTypes = new Set();
        }
        state.selectedId = item.dataset.manager;
        render();
      });
    });

    root.querySelectorAll('[data-reg-expand]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.regExpand;
        if (state.expandedRegs.has(id)) state.expandedRegs.delete(id);
        else state.expandedRegs.add(id);
        render();
      });
    });

    root.querySelectorAll('[data-type-expand]').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.dataset.typeExpand;
        if (state.expandedTypes.has(t)) state.expandedTypes.delete(t);
        else state.expandedTypes.add(t);
        render();
      });
    });

    root.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'fork') router.navigate('create', { mode: 'fork' });
        if (action === 'new') router.navigate('create', { mode: 'blank' });
        if (action === 'score-with') router.navigate('score', { manager: btn.dataset.id });
        if (action === 'edit') router.navigate('create', { mode: 'fork' });
      });
    });
  }

  window.Scorer.router.register('library', render);
})();
