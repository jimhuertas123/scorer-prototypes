window.Scorer = window.Scorer || {};

// Reusable Top-N + "Other ▾" multi-select chip filter.
// Supports single-select (selected = string | null) and multi-select (selected = Set<string>).
//
// Usage:
//   window.Scorer.MultiFilter.render({
//     kind: 'species',                // unique key per filter on the page
//     items: [{ key, label, count }], // already populated, count is optional
//     selected: state.species,        // Set or string
//     allLabel: 'All species',
//     visibleCap: 5,
//     state: { open, query },         // { open: bool, query: string }, scoped to this filter
//     escapeHtml,                     // (s) => string
//   })
//
// Returns HTML string. Caller is responsible for binding listeners using the
// data attributes the helper emits (data-toggle-{kind}, data-clear-{kind},
// data-clear-other-{kind}, data-toggle-{kind}-dropdown, id #{kind}-other-search).
window.Scorer.MultiFilter = (() => {
  function isSet(v) { return v && typeof v.has === 'function'; }

  function render({ kind, items, selected, allLabel, visibleCap = 5, state, escapeHtml }) {
    const has = (k) => isSet(selected) ? selected.has(k) : selected === k;
    const sorted = [...items].sort((a, b) => (b.count || 0) - (a.count || 0) || a.label.localeCompare(b.label));
    const top = sorted.slice(0, visibleCap);
    const other = sorted.slice(visibleCap);
    const dropdownOpen = !!(state && state.open);
    const q = ((state && state.query) || '').toLowerCase();
    const otherFiltered = q ? other.filter(it => it.label.toLowerCase().includes(q)) : other;
    const selectedFromOther = other.filter(it => has(it.key));

    const allChip = `<button class="chip" type="button" aria-pressed="${isSet(selected) ? selected.size === 0 : selected == null || selected === 'all'}" data-clear-${kind}><span>${escapeHtml(allLabel)}</span></button>`;

    const topChips = top.map(it => `
      <button class="chip" type="button" aria-pressed="${has(it.key)}" data-toggle-${kind}="${escapeHtml(it.key)}">
        <span>${escapeHtml(it.label)}</span>
        ${it.count != null ? `<span class="chip__count">${it.count}</span>` : ''}
      </button>
    `).join('');

    let otherEl = '';
    if (other.length > 0) {
      const otherLabel = selectedFromOther.length === 0
        ? `Other (${other.length}) ▾`
        : `Other (${selectedFromOther.length}/${other.length}) ▾`;
      otherEl = `<div class="species-other ${dropdownOpen ? 'species-other--open' : ''}" data-${kind}-other>
         <button class="chip" type="button" aria-pressed="${selectedFromOther.length > 0}" data-toggle-${kind}-dropdown>
           <span>${escapeHtml(otherLabel)}</span>
         </button>
         <div class="species-other__panel">
           <div class="species-other__search">
             <input class="input" id="${kind}-other-search" placeholder="Search ${other.length} more..." value="${escapeHtml((state && state.query) || '')}" />
           </div>
           <div class="species-other__list">
             ${otherFiltered.length === 0
               ? `<div class="species-other__empty">No matches</div>`
               : otherFiltered.map(it => `
                   <button class="species-other__item" type="button" aria-pressed="${has(it.key)}" data-toggle-${kind}="${escapeHtml(it.key)}">
                     <span>${escapeHtml(it.label)}</span>
                     ${it.count != null ? `<span class="species-other__count">${it.count}</span>` : ''}
                   </button>
                 `).join('')}
           </div>
           ${selectedFromOther.length > 0 ? `<button class="btn btn--ghost btn--sm" type="button" data-clear-other-${kind} style="margin-top: var(--space-2); width: 100%; justify-content: center;">Clear ${selectedFromOther.length} from this list</button>` : ''}
         </div>
       </div>`;
    }

    return [allChip, topChips, otherEl].join('');
  }

  // Wire generic handlers for a multi-select filter. Pass callbacks for state mutations.
  // - onToggle(key)
  // - onClear()
  // - onClearOther()
  // - onToggleDropdown()
  // - onSearch(value)
  function wire({ root, kind, onToggle, onClear, onClearOther, onToggleDropdown, onSearch }) {
    const Cap = (s) => s[0].toUpperCase() + s.slice(1);
    root.querySelectorAll(`[data-toggle-${kind}]`).forEach(btn => {
      btn.addEventListener('click', e => {
        if (btn.closest(`[data-${kind}-other] .species-other__panel`)) e.stopPropagation();
        onToggle(btn.dataset[`toggle${Cap(kind)}`]);
      });
    });
    root.querySelectorAll(`[data-clear-${kind}]`).forEach(btn => {
      btn.addEventListener('click', () => onClear());
    });
    root.querySelectorAll(`[data-clear-other-${kind}]`).forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); onClearOther(); });
    });
    root.querySelectorAll(`[data-toggle-${kind}-dropdown]`).forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); onToggleDropdown(); });
    });
    const search = root.querySelector(`#${kind}-other-search`);
    if (search) {
      search.addEventListener('click', e => e.stopPropagation());
      search.addEventListener('input', e => { e.stopPropagation(); onSearch(e.target.value); });
    }
  }

  return { render, wire };
})();
