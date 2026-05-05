window.Scorer = window.Scorer || {};

(() => {
  const { data, router } = window.Scorer;

  const state = {
    managerId: 'pa-ne',
  };

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  function fmtPct(n) { return Math.round(n * 100) + '%'; }

  function fmtDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function rowsForManager(id) {
    return data.HISTORY.filter(h => h.managerId === id).sort((a, b) => a.ranAt.localeCompare(b.ranAt));
  }

  function renderTrendChart(rows) {
    if (rows.length === 0) return '';
    const w = 720;
    const h = 80;
    const pad = 8;
    const xs = rows.map((_, i) => pad + (i * (w - pad * 2)) / Math.max(rows.length - 1, 1));
    const ys = rows.map(r => h - pad - r.score * (h - pad * 2));
    const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
    const area = path + ` L${xs[xs.length - 1].toFixed(1)},${h - pad} L${xs[0].toFixed(1)},${h - pad} Z`;
    return `
      <svg class="trend-card__chart" width="100%" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trend-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(99, 102, 241, 0.35)"/>
            <stop offset="100%" stop-color="rgba(99, 102, 241, 0.00)"/>
          </linearGradient>
        </defs>
        <path d="${area}" fill="url(#trend-grad)"/>
        <path d="${path}" fill="none" stroke="#6366f1" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
        ${xs.map((x, i) => `<circle cx="${x.toFixed(1)}" cy="${ys[i].toFixed(1)}" r="3" fill="#0f1115" stroke="#6366f1" stroke-width="2"/>`).join('')}
      </svg>
    `;
  }

  function delta(curr, prev) {
    if (prev == null) return { kind: 'flat', text: 'first run' };
    const d = curr - prev;
    if (Math.abs(d) < 0.005) return { kind: 'flat', text: 'no change' };
    const sign = d > 0 ? '+' : '';
    return { kind: d > 0 ? 'up' : 'down', text: sign + Math.round(d * 100) + ' pts' };
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
    const latest = sorted[0];
    const previous = sorted[1];

    const managers = data.MANAGERS.filter(mm => mm.isGroundTruth);

    if (rows.length === 0) {
      root.innerHTML = `
        <div class="view-header">
          <div class="view-header__intro">
            <span class="view-eyebrow">05 · History</span>
            <h1>Run <span class="highlight">history</span></h1>
            <p class="view-lede">Past scoring runs per ground truth manager. Track how ingestion accuracy changes over time.</p>
          </div>
        </div>
        <div class="empty">
          <div class="empty__title">No runs yet</div>
          <div class="empty__body">Once you run a scoring comparison, it appears here so you can track if ingestion improves over time.</div>
          <button class="btn btn--primary" data-action="score">Run a comparison</button>
        </div>
      `;
      root.querySelectorAll('[data-action="score"]').forEach(btn => btn.addEventListener('click', () => router.navigate('score')));
      return;
    }

    root.innerHTML = `
      <div class="view-header">
        <div class="view-header__intro">
          <span class="view-eyebrow">05 · History</span>
          <h1>Run history, <span class="highlight">${escapeHtml(m.name)}</span></h1>
          <p class="view-lede">Each row is one scoring run against this ground truth manager. Watch the trend to see if ingestion accuracy is improving or regressing.</p>
        </div>
        <div style="display:flex; gap:var(--space-3); align-items:center;">
          <span class="chip-group__label">Manager</span>
          <div class="chip-row">
            ${managers.map(mm => `
              <button class="chip" type="button" aria-pressed="${state.managerId === mm.id}" data-manager="${mm.id}">
                <span>${mm.state}</span>
                <span style="color:var(--text-primary);">${escapeHtml(mm.name)}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="trend-card">
        <div class="trend-card__meta">
          <div class="trend-card__title">${fmtPct(latest.score)}</div>
          <div class="trend-card__sub">latest accuracy · ${rows.length} runs over ${Math.round((new Date(latest.ranAt) - new Date(rows[0].ranAt)) / (1000 * 60 * 60 * 24))} days</div>
        </div>
        ${renderTrendChart(rows)}
      </div>

      <div class="history-list">
        ${sorted.map((row, i) => {
          const prev = sorted[i + 1];
          const d = delta(row.score, prev?.score);
          return `
            <div class="history-row" data-report="${row.id}">
              <div class="history-row__date">${fmtDate(row.ranAt)}</div>
              <div>
                <div class="history-row__manager">${escapeHtml(row.scope)}</div>
                <div class="history-row__manager-sub">by ${escapeHtml(row.ranBy)} · ${row.id}</div>
              </div>
              <div class="history-row__breakdown">
                <span class="history-row__chip history-row__chip--correct">${row.correct} correct</span>
                <span class="history-row__chip history-row__chip--missing">${row.missing} missing</span>
                <span class="history-row__chip history-row__chip--extra">${row.extra} extra</span>
              </div>
              <div class="history-row__score">${fmtPct(row.score)}</div>
              <div class="history-row__delta history-row__delta--${d.kind}">${d.text}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    root.querySelectorAll('[data-manager]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.managerId = btn.dataset.manager;
        render();
      });
    });

    root.querySelectorAll('[data-report]').forEach(row => {
      row.addEventListener('click', () => {
        if (row.dataset.report === data.SAMPLE_REPORT.id) {
          router.navigate('report', { id: row.dataset.report });
        } else {
          alert('Mock prototype: would open archived report ' + row.dataset.report);
        }
      });
    });
  }

  window.Scorer.router.register('history', render);
})();
