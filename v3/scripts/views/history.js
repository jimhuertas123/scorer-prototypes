window.Scorer = window.Scorer || {};

(() => {
  const { data, router } = window.Scorer;

  const state = {
    managerId: 'pa-ne',
    selectedRunId: null,
    pickerDropdownOpen: false,
    pickerDropdownQuery: '',
  };

  function escapeHtml(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
  function fmtPct(n) { return Math.round(n * 100) + '%'; }
  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function rowsForManager(id) { return data.HISTORY.filter(h => h.managerId === id); }

  function delta(curr, prev) {
    if (prev == null) return { kind: 'flat', text: 'first run' };
    const d = curr - prev;
    if (Math.abs(d) < 0.005) return { kind: 'flat', text: 'no change' };
    return { kind: d > 0 ? 'up' : 'down', text: (d > 0 ? '+' : '') + Math.round(d * 100) + ' pts' };
  }

  function renderTrend(rows) {
    if (rows.length === 0) return '';
    const sorted = [...rows].sort((a, b) => a.ranAt.localeCompare(b.ranAt));
    const w = 460, h = 120, pad = 12;
    const xs = sorted.map((_, i) => pad + (i * (w - pad * 2)) / Math.max(sorted.length - 1, 1));
    const ys = sorted.map(r => h - pad - r.score * (h - pad * 2));
    const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
    const area = path + ` L${xs[xs.length - 1].toFixed(1)},${h - pad} L${xs[0].toFixed(1)},${h - pad} Z`;
    return `
      <svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trend-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(79, 112, 232, 0.30)"/>
            <stop offset="100%" stop-color="rgba(79, 112, 232, 0.00)"/>
          </linearGradient>
        </defs>
        <path d="${area}" fill="url(#trend-grad)"/>
        <path d="${path}" fill="none" stroke="#4f70e8" stroke-width="2" stroke-linejoin="round"/>
        ${xs.map((x, i) => `<circle cx="${x.toFixed(1)}" cy="${ys[i].toFixed(1)}" r="3" fill="#0c0e13" stroke="#4f70e8" stroke-width="2"/>`).join('')}
      </svg>
    `;
  }

  function renderListItem(row, prev) {
    const d = delta(row.score, prev?.score);
    return `
      <button class="list-item" type="button" data-run="${row.id}" aria-current="${state.selectedRunId === row.id}">
        <span class="list-item__seal" style="background: var(--bg-elev-2); color: var(--accent); font-family: var(--font-mono);">${fmtPct(row.score)}</span>
        <span class="list-item__body">
          <span class="list-item__name">${escapeHtml(row.scope)}</span>
          <span class="list-item__meta">${fmtDate(row.ranAt)} · ${escapeHtml(row.ranBy)}</span>
        </span>
        <span class="list-item__trail list-item__trail--${d.kind === 'up' ? 'correct' : d.kind === 'down' ? 'extra' : ''}">${d.text}</span>
      </button>
    `;
  }

  function renderRunDetail(row) {
    if (!row) {
      return `
        <div class="detail-empty">
          <div class="detail-empty__icon">⌖</div>
          <div class="detail-empty__title">Pick a run</div>
          <div class="detail-empty__body">Select a past scoring run on the left to inspect its breakdown.</div>
        </div>
      `;
    }
    return `
      <div class="detail__hero">
        <div class="detail__hero-eyebrow">
          <span>${escapeHtml(row.id)}</span>
          <span>·</span>
          <span>${fmtDate(row.ranAt)}</span>
        </div>
        <div style="display: flex; align-items: baseline; gap: var(--space-4);">
          <div class="detail__hero-title" style="font-family: var(--font-mono); font-size: 3rem; color: var(--accent);">${fmtPct(row.score)}</div>
          <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
            <span class="detail__pill detail__pill--correct">${row.correct} correct</span>
            <span class="detail__pill detail__pill--missing">${row.missing} missing</span>
            <span class="detail__pill detail__pill--extra">${row.extra} extra</span>
          </div>
        </div>
        <div class="detail__hero-sub">${escapeHtml(row.scope)} · by ${escapeHtml(row.ranBy)}</div>
      </div>
      <div class="detail__section">
        <div class="detail__section-head">
          <span class="detail__section-title">Rule breakdown</span>
          <span class="detail__section-meta">vs ground truth scope</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3);">
          <div style="padding: var(--space-4); border: 1px solid var(--card-border-strong); border-left: 3px solid var(--status-correct); border-radius: var(--radius-sm);">
            <div style="font-family: var(--font-mono); font-size: var(--fs-xxs); color: var(--text-tertiary); text-transform: uppercase;">Correct</div>
            <div style="font-family: var(--font-mono); font-size: var(--fs-xl); color: var(--status-correct); font-weight: 700;">${row.correct}</div>
          </div>
          <div style="padding: var(--space-4); border: 1px solid var(--card-border-strong); border-left: 3px solid var(--status-missing); border-radius: var(--radius-sm);">
            <div style="font-family: var(--font-mono); font-size: var(--fs-xxs); color: var(--text-tertiary); text-transform: uppercase;">Missing</div>
            <div style="font-family: var(--font-mono); font-size: var(--fs-xl); color: var(--status-missing); font-weight: 700;">${row.missing}</div>
          </div>
          <div style="padding: var(--space-4); border: 1px solid var(--card-border-strong); border-left: 3px solid var(--status-extra); border-radius: var(--radius-sm);">
            <div style="font-family: var(--font-mono); font-size: var(--fs-xxs); color: var(--text-tertiary); text-transform: uppercase;">Extra</div>
            <div style="font-family: var(--font-mono); font-size: var(--fs-xl); color: var(--status-extra); font-weight: 700;">${row.extra}</div>
          </div>
        </div>
      </div>
      ${renderRunDiff(row)}
    `;
  }

  function renderRunDiff(row) {
    const r = data.SAMPLE_REPORT;
    const hasFull = r && r.id === row.id;
    if (!hasFull) {
      return `
        <div class="detail__section">
          <div class="detail__section-head">
            <span class="detail__section-title">Diff entries</span>
            <span class="detail__section-meta">archived · summary only</span>
          </div>
          <div style="font-size: var(--fs-xs); color: var(--text-tertiary); padding: var(--space-3); border: 1px dashed var(--card-border-strong); border-radius: var(--radius-sm);">
            This run is archived. Per-rule diff is not retained, only the summary counts above. The full diff is kept for the most recent run only.
          </div>
        </div>
      `;
    }
    const renderTagBlock = (kind, list) => `
      <div class="detail__section">
        <div class="detail__section-head">
          <span class="detail__section-title">${kind[0].toUpperCase() + kind.slice(1)}</span>
          <span class="detail__section-meta">${list.length} ${list.length === 1 ? 'entry' : 'entries'}</span>
        </div>
        <div class="tag-stack">
          ${list.map(rl => `
            <div class="tag tag--${kind}">
              <div class="tag__body">
                <div class="tag__head">
                  <span class="tag__id">${escapeHtml(rl.id)}</span>
                  <span class="tag__sep">·</span>
                  <span>${escapeHtml(rl.species)}</span>
                  <span class="tag__sep">·</span>
                  <span>${escapeHtml(rl.ruleType)}</span>
                  <span class="tag__sep">·</span>
                  <span>${escapeHtml(rl.seasonType)}</span>
                  ${rl.legalLabel ? `<span class="tag__sep">·</span><span style="color: var(--text-secondary);">${escapeHtml(rl.legalLabel)}</span>` : ''}
                  ${rl.huntCode ? `<span class="tag__sep">·</span><span style="font-family: var(--font-mono);">${escapeHtml(rl.huntCode)}</span>` : ''}
                </div>
                <div class="tag__summary">${escapeHtml(rl.summary)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    return `
      ${renderTagBlock('correct', r.buckets.correct)}
      ${renderTagBlock('missing', r.buckets.missing)}
      ${renderTagBlock('extra', r.buckets.extra)}
    `;
  }

  function render(params) {
    if (params && params.get) {
      const mid = params.get('manager');
      if (mid && data.managerById(mid)) state.managerId = mid;
    }
    const root = document.getElementById('view-history');
    const m = data.managerById(state.managerId);
    const rows = rowsForManager(state.managerId);
    const sorted = [...rows].sort((a, b) => b.ranAt.localeCompare(a.ranAt));
    const selected = state.selectedRunId ? sorted.find(r => r.id === state.selectedRunId) : null;
    const managers = data.MANAGERS.filter(mm => mm.isGroundTruth);

    root.className = 'view view--inspector';
    root.innerHTML = `
      <div class="view-header">
        <div class="view-header__intro">
          <span class="view-eyebrow">05 · History</span>
          <h1>${escapeHtml(m.name)} <span class="highlight">trend</span></h1>
        </div>
        <div class="chip-row">
          ${window.Scorer.MultiFilter.render({
            kind: 'historypicker',
            items: managers.map(mm => ({
              key: mm.id,
              label: mm.state + ' · ' + mm.name,
              count: rowsForManager(mm.id).length,
            })),
            selected: state.managerId,
            allLabel: 'None',
            visibleCap: 5,
            state: { open: state.pickerDropdownOpen, query: state.pickerDropdownQuery },
            escapeHtml,
          })}
        </div>
      </div>

      <div class="inspector">
        <aside class="inspector__pane">
          <div class="inspector__pane-head">
            <div class="inspector__pane-title">
              <strong>Past validation runs</strong>
              <span>${rows.length} total</span>
            </div>
          </div>
          <div class="inspector__pane-body">
            ${rows.length === 0 ? `
              <div class="detail-empty" style="padding: var(--space-8) var(--space-4);">
                <div class="detail-empty__title">No runs yet</div>
                <div class="detail-empty__body">Run a validation to populate this document.s trend.</div>
              </div>
            ` : sorted.map((row, i) => renderListItem(row, sorted[i + 1])).join('')}
          </div>
        </aside>

        <main class="inspector__pane">
          <div class="inspector__pane-head">
            <div class="inspector__pane-title">
              <strong>${selected ? escapeHtml(selected.id) : escapeHtml(m.name) + ' overview'}</strong>
              <span>${selected ? fmtDate(selected.ranAt) : rows.length + ' runs'}</span>
            </div>
          </div>
          <div class="inspector__pane-body inspector__pane-body--padded">
            ${selected ? renderRunDetail(selected) : `
              <div class="detail__section">
                <div class="detail__section-head">
                  <span class="detail__section-title">Trend</span>
                  <span class="detail__section-meta">accuracy over time</span>
                </div>
                <div style="padding: var(--space-3); background: var(--bg-elev-1); border: 1px solid var(--card-border-strong); border-radius: var(--radius-sm);">
                  ${renderTrend(rows)}
                </div>
              </div>
              <div class="detail__section">
                <div class="detail__section-head">
                  <span class="detail__section-title">Latest</span>
                </div>
                <div class="detail__hero" style="padding-bottom:0; border:none;">
                  <div style="display: flex; align-items: baseline; gap: var(--space-4);">
                    <div class="detail__hero-title" style="font-family: var(--font-mono); font-size: 3rem; color: var(--accent);">${fmtPct(sorted[0]?.score || 0)}</div>
                    <div class="detail__hero-sub">${sorted[0] ? fmtDate(sorted[0].ranAt) + ' · ' + escapeHtml(sorted[0].ranBy) : ''}</div>
                  </div>
                </div>
              </div>
            `}
          </div>
        </main>
      </div>
    `;

    window.Scorer.MultiFilter.wire({
      root, kind: 'historypicker',
      onToggle: v => {
        if (state.managerId !== v) {
          state.managerId = v;
          state.selectedRunId = null;
          render();
        }
      },
      onClear: () => { /* no-op: history needs a manager picked */ },
      onClearOther: () => { /* no-op for single-select */ },
      onToggleDropdown: () => {
        state.pickerDropdownOpen = !state.pickerDropdownOpen;
        state.pickerDropdownQuery = '';
        render();
      },
      onSearch: q => {
        state.pickerDropdownQuery = q;
        render();
        requestAnimationFrame(() => {
          const el = root.querySelector('#historypicker-other-search');
          if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
        });
      },
    });

    if (!window.__historyV3Outside) {
      window.__historyV3Outside = ev => {
        if (!state.pickerDropdownOpen) return;
        const view = document.getElementById('view-history');
        const el = view && view.querySelector('[data-historypicker-other]');
        if (el && !el.contains(ev.target)) {
          state.pickerDropdownOpen = false;
          state.pickerDropdownQuery = '';
          render();
        }
      };
      document.addEventListener('click', window.__historyV3Outside);
    }

    root.querySelectorAll('[data-run]').forEach(item => {
      item.addEventListener('click', () => {
        state.selectedRunId = item.dataset.run;
        render();
      });
    });

  }

  window.Scorer.router.register('history', render);
})();
