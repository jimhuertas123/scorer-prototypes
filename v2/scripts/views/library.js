window.Scorer = window.Scorer || {};

(() => {
  const { data, router } = window.Scorer;

  const state = {
    state: new Set(),
    species: new Set(),
    query: '',
    sort: 'recent',
    speciesDropdownOpen: false,
    speciesDropdownQuery: '',
    stateDropdownOpen: false,
    stateDropdownQuery: '',
  };

  const FILTER_VISIBLE_CAP = 5;
  const CARD_SPECIES_CAP = 3;

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
    const all = data.MANAGERS.filter(m => m.isGroundTruth);
    return all.filter(m => {
      if (state.state.size > 0 && !state.state.has(m.state)) return false;
      if (state.species.size > 0 && !m.species.some(sp => state.species.has(sp))) return false;
      if (state.query) {
        const q = state.query.toLowerCase();
        const hay = (m.name + ' ' + m.state + ' ' + m.species.join(' ')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (state.sort === 'recent') return b.lastCuratedAt.localeCompare(a.lastCuratedAt);
      if (state.sort === 'alpha') return a.name.localeCompare(b.name);
      if (state.sort === 'rules') return b.ruleCount - a.ruleCount;
      return 0;
    });
  }

  function renderMultiFilter(kind, items, selectedSet, allLabel) {
    return window.Scorer.MultiFilter.render({
      kind, items, selected: selectedSet, allLabel,
      visibleCap: FILTER_VISIBLE_CAP,
      state: { open: state[kind + 'DropdownOpen'], query: state[kind + 'DropdownQuery'] },
      escapeHtml,
    });
  }

  function chip(label, value, current, key, count) {
    const pressed = current === value;
    return `<button class="chip" aria-pressed="${pressed}" data-filter="${key}" data-value="${value}">
      <span>${escapeHtml(label)}</span>
      ${count != null ? `<span class="chip__count">${count}</span>` : ''}
    </button>`;
  }

  function renderCard(m) {
    const stateName = data.STATES[m.state]?.name || m.state;
    return `
      <button class="manager-card" data-id="${m.id}" type="button">
        <div class="manager-card__head">
          <div class="manager-card__seal">${m.state}</div>
          <span class="manager-card__truth-flag">Ground truth</span>
        </div>
        <div>
          <div class="manager-card__name">${escapeHtml(m.name)}</div>
          <div class="manager-card__locale">${escapeHtml(stateName)} · ${escapeHtml(m.seasonWindow)}</div>
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
            ${m.species.slice(0, CARD_SPECIES_CAP).map(s => `<span class="manager-card__species-tag">${escapeHtml(s)}</span>`).join('')}
            ${m.species.length > CARD_SPECIES_CAP ? `<span class="manager-card__species-tag" title="${escapeHtml(m.species.slice(CARD_SPECIES_CAP).join(', '))}">+${m.species.length - CARD_SPECIES_CAP}</span>` : ''}
          </div>
          <div>Curated <strong>${relativeDate(m.lastCuratedAt)}</strong></div>
        </div>
      </button>
    `;
  }

  function renderEmpty() {
    return `
      <div class="empty">
        <div class="empty__title">No ground truth managers match these filters</div>
        <div class="empty__body">Try clearing a filter, or fork an existing ingested manager to start a new ground truth set.</div>
        <button class="btn btn--primary" data-action="reset">Clear filters</button>
      </div>
    `;
  }

  function render() {
    const root = document.getElementById('view-library');
    const matches = filtered();

    const stateItems = Object.values(data.STATES).map(s => ({
      key: s.code,
      label: s.code,
      count: data.MANAGERS.filter(m => m.isGroundTruth && m.state === s.code).length,
    }));
    const stateChips = renderMultiFilter('state', stateItems, state.state, 'All states');

    const speciesItems = data.allSpecies().map(sp => ({
      key: sp,
      label: sp,
      count: data.MANAGERS.filter(m => m.isGroundTruth && m.species.includes(sp)).length,
    })).filter(it => it.count > 0);
    const speciesChips = renderMultiFilter('species', speciesItems, state.species, 'All species');

    root.innerHTML = `
      <div class="view-header">
        <div class="view-header__intro">
          <span class="view-eyebrow">01 · Documents</span>
          <h1>Ground truth <span class="highlight">documents</span>, ${data.MANAGERS.filter(m => m.isGroundTruth).length} curated</h1>
          <p class="view-lede">Hand corrected reference documents QA uses to validate ingestion accuracy. Open one to validate against, or fork from any ingested document to start a new ground truth.</p>
        </div>
        <div style="display:flex; gap:var(--space-2);">
          <button class="btn" data-action="fork">Fork existing</button>
          <button class="btn btn--primary" data-action="new">New ground truth</button>
        </div>
      </div>

      <div class="toolbar">
        <div class="toolbar__filters">
          <div class="toolbar__row">
            <span class="chip-group__label">State</span>
            <div class="chip-row">${stateChips}</div>
          </div>
          <div class="toolbar__row">
            <span class="chip-group__label">Species</span>
            <div class="chip-row">${speciesChips}</div>
          </div>
        </div>
        <div class="search">
          <span class="search__icon">/</span>
          <input class="input" id="library-search" placeholder="Search by manager, state, species..." value="${escapeHtml(state.query)}" />
        </div>
      </div>

      <div class="toolbar__count" style="margin-top:var(--space-4);">
        Showing <strong style="color:var(--fg-primary);">${matches.length}</strong> of ${data.MANAGERS.filter(m => m.isGroundTruth).length}
      </div>

      ${matches.length === 0 ? renderEmpty() : `
        <div class="cards-grid">${matches.map(renderCard).join('')}</div>
      `}
    `;

    // Generic toggles for state and species
    ['state', 'species'].forEach(kind => {
      root.querySelectorAll(`[data-toggle-${kind}]`).forEach(btn => {
        btn.addEventListener('click', e => {
          // If the toggle is inside a dropdown panel, prevent the outside-close from firing
          if (btn.closest('[data-' + kind + '-other] .species-other__panel')) e.stopPropagation();
          const v = btn.dataset[`toggle${kind[0].toUpperCase() + kind.slice(1)}`];
          if (state[kind].has(v)) state[kind].delete(v);
          else state[kind].add(v);
          render();
        });
      });
      root.querySelectorAll(`[data-clear-${kind}]`).forEach(btn => {
        btn.addEventListener('click', () => { state[kind] = new Set(); render(); });
      });
      root.querySelectorAll(`[data-clear-other-${kind}]`).forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const items = kind === 'state'
            ? Object.values(data.STATES).map(s => ({ key: s.code, count: data.MANAGERS.filter(m => m.isGroundTruth && m.state === s.code).length }))
            : data.allSpecies().map(sp => ({ key: sp, count: data.MANAGERS.filter(m => m.isGroundTruth && m.species.includes(sp)).length })).filter(it => it.count > 0);
          const sorted = [...items].sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
          const otherKeys = new Set(sorted.slice(FILTER_VISIBLE_CAP).map(it => it.key));
          state[kind] = new Set([...state[kind]].filter(v => !otherKeys.has(v)));
          render();
        });
      });
      root.querySelectorAll(`[data-toggle-${kind}-dropdown]`).forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          state[kind + 'DropdownOpen'] = !state[kind + 'DropdownOpen'];
          state[kind + 'DropdownQuery'] = '';
          const otherKind = kind === 'state' ? 'species' : 'state';
          state[otherKind + 'DropdownOpen'] = false;
          render();
        });
      });
      const ddSearch = root.querySelector(`#${kind}-other-search`);
      if (ddSearch) {
        ddSearch.addEventListener('click', e => e.stopPropagation());
        ddSearch.addEventListener('input', e => {
          e.stopPropagation();
          state[kind + 'DropdownQuery'] = e.target.value;
          render();
          requestAnimationFrame(() => {
            const el = root.querySelector(`#${kind}-other-search`);
            if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
          });
        });
      }
    });

    // Outside-click handler (single, idempotent) closes any open dropdowns
    if (!window.__libraryOutside) {
      window.__libraryOutside = ev => {
        const stOpen = state.stateDropdownOpen;
        const spOpen = state.speciesDropdownOpen;
        if (!stOpen && !spOpen) return;
        const stPanel = document.querySelector('[data-state-other]');
        const spPanel = document.querySelector('[data-species-other]');
        const insideSt = stPanel && stPanel.contains(ev.target);
        const insideSp = spPanel && spPanel.contains(ev.target);
        let changed = false;
        if (stOpen && !insideSt) { state.stateDropdownOpen = false; state.stateDropdownQuery = ''; changed = true; }
        if (spOpen && !insideSp) { state.speciesDropdownOpen = false; state.speciesDropdownQuery = ''; changed = true; }
        if (changed) render();
      };
      document.addEventListener('click', window.__libraryOutside);
    }

    const search = root.querySelector('#library-search');
    if (search) {
      search.addEventListener('input', e => {
        state.query = e.target.value;
        render();
      });
    }

    root.querySelectorAll('.manager-card').forEach(card => {
      card.addEventListener('click', () => {
        router.navigate('score', { manager: card.dataset.id });
      });
    });

    root.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'fork') router.navigate('create', { mode: 'fork' });
        if (action === 'new') router.navigate('create', { mode: 'blank' });
        if (action === 'reset') {
          state.state = new Set(); state.species = new Set(); state.query = '';
          render();
        }
      });
    });
  }

  window.Scorer.router.register('library', render);
})();
