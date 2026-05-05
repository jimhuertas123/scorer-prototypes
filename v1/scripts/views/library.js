window.Scorer = window.Scorer || {};

(() => {
  const { data, router } = window.Scorer;

  const state = {
    state: 'all',
    species: 'all',
    query: '',
    sort: 'recent',
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
    const all = data.MANAGERS.filter(m => m.isGroundTruth);
    return all.filter(m => {
      if (state.state !== 'all' && m.state !== state.state) return false;
      if (state.species !== 'all' && !m.species.includes(state.species)) return false;
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
            ${m.species.map(s => `<span class="manager-card__species-tag">${escapeHtml(s)}</span>`).join('')}
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

    const stateChips = [
      chip('All states', 'all', state.state, 'state'),
      ...Object.values(data.STATES).map(s => {
        const count = data.MANAGERS.filter(m => m.isGroundTruth && m.state === s.code).length;
        if (count === 0) return '';
        return chip(s.code, s.code, state.state, 'state', count);
      }),
    ].join('');

    const speciesChips = [
      chip('All species', 'all', state.species, 'species'),
      ...data.SPECIES.map(sp => {
        const count = data.MANAGERS.filter(m => m.isGroundTruth && m.species.includes(sp)).length;
        return chip(sp, sp, state.species, 'species', count);
      }),
    ].join('');

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
            <span class="toolbar__divider"></span>
            <span class="chip-group__label">Sort</span>
            <div class="chip-row">
              ${chip('Recently curated', 'recent', state.sort, 'sort')}
              ${chip('A to Z', 'alpha', state.sort, 'sort')}
              ${chip('Most rules', 'rules', state.sort, 'sort')}
            </div>
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

    root.querySelectorAll('.chip[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.filter;
        state[key] = btn.dataset.value;
        render();
      });
    });

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
          state.state = 'all'; state.species = 'all'; state.query = '';
          render();
        }
      });
    });
  }

  window.Scorer.router.register('library', render);
})();
