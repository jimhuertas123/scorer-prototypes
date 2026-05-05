window.Scorer = window.Scorer || {};

(() => {
  const { data, router } = window.Scorer;

  const state = {
    managerId: 'pa-ne',
    selectedRunId: null,
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
      <div class="detail__section">
        <div class="detail__section-head">
          <span class="detail__section-title">Open</span>
        </div>
        <button class="btn btn--primary" data-action="open-report">View full report</button>
      </div>
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
          ${managers.map(mm => `
            <button class="chip" type="button" aria-pressed="${state.managerId === mm.id}" data-manager-pick="${mm.id}">
              <span>${mm.state}</span><span class="chip__count">${rowsForManager(mm.id).length}</span>
            </button>
          `).join('')}
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

    root.querySelectorAll('[data-manager-pick]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.managerId = btn.dataset.managerPick;
        state.selectedRunId = null;
        render();
      });
    });

    root.querySelectorAll('[data-run]').forEach(item => {
      item.addEventListener('click', () => {
        state.selectedRunId = item.dataset.run;
        render();
      });
    });

    root.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.action === 'open-report') {
          if (state.selectedRunId === data.SAMPLE_REPORT.id) router.navigate('report', { id: state.selectedRunId });
          else alert('Mock prototype: would open archived report ' + state.selectedRunId);
        }
      });
    });
  }

  window.Scorer.router.register('history', render);
})();
