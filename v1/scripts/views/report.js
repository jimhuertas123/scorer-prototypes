window.Scorer = window.Scorer || {};

(() => {
  const { data, router } = window.Scorer;

  const state = {
    activeBucket: 'correct',
    groupBy: 'species',
  };

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  function fmtPct(n) {
    return Math.round(n * 100) + '%';
  }

  function bucketCount(bucket) {
    return data.SAMPLE_REPORT.buckets[bucket].length;
  }

  function renderPhases() {
    const r = data.SAMPLE_REPORT;
    if (!r.phases || r.phases.length === 0) return '';
    const dot = (kind, status) => {
      const color = status === 'completed' ? 'var(--status-completed)' : status === 'failed' ? 'var(--status-failed)' : 'var(--status-cancelled)';
      return `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${color}; margin-right:8px;"></span>`;
    };
    return `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); margin-bottom: var(--space-6);">
        ${r.phases.map((p, i) => `
          <div style="padding: var(--space-4) var(--space-5); border: 1px solid var(--card-border); border-radius: var(--radius-md); background: var(--card-bg);">
            <div style="display:flex; align-items:center; gap: var(--space-2); margin-bottom: var(--space-2);">
              ${dot(p.kind, p.status)}
              <span style="font-family: var(--font-mono); font-size: var(--fs-xxs); letter-spacing: var(--tracking-wider); text-transform: uppercase; color: var(--text-tertiary); font-weight: 600;">Phase ${i + 1}</span>
              <span style="margin-left: auto; font-family: var(--font-mono); font-size: var(--fs-xxs); color: var(--text-tertiary);">${p.kind === 'llm' ? 'LLM' : 'deterministic'} · ${p.durationMs}ms</span>
            </div>
            <div style="font-size: var(--fs-md); font-weight: 700; color: var(--text-primary); letter-spacing: var(--tracking-tight); margin-bottom: 4px;">${escapeHtml(p.label)}</div>
            <div style="font-size: var(--fs-xs); color: var(--text-secondary); line-height: 1.5;">${escapeHtml(p.summary)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderBuckets() {
    const r = data.SAMPLE_REPORT;
    return `
      <div class="bucket-row">
        <button class="bucket bucket--correct" type="button" aria-current="${state.activeBucket === 'correct' ? 'page' : 'false'}" data-bucket="correct">
          <span class="bucket__label">Correct</span>
          <span class="bucket__num">${r.buckets.correct.length}</span>
          <span class="bucket__caption">rules in extraction match the ground truth slice</span>
        </button>
        <button class="bucket bucket--missing" type="button" aria-current="${state.activeBucket === 'missing' ? 'page' : 'false'}" data-bucket="missing">
          <span class="bucket__label">Missing</span>
          <span class="bucket__num">${r.buckets.missing.length}</span>
          <span class="bucket__caption">rules in ground truth that ingestion did not produce</span>
        </button>
        <button class="bucket bucket--extra" type="button" aria-current="${state.activeBucket === 'extra' ? 'page' : 'false'}" data-bucket="extra">
          <span class="bucket__label">Extra</span>
          <span class="bucket__num">${r.buckets.extra.length}</span>
          <span class="bucket__caption">rules in extraction with no ground truth match</span>
        </button>
      </div>
    `;
  }

  function renderTagStack(items, kind) {
    const groupBy = state.groupBy;
    if (groupBy === 'flat') {
      return `<div class="tag-stack">${items.map(r => renderTag(r, kind)).join('')}</div>`;
    }
    const key = groupBy === 'species' ? 'species' : 'ruleType';
    const groups = {};
    items.forEach(r => {
      const g = r[key] || 'Other';
      if (!groups[g]) groups[g] = [];
      groups[g].push(r);
    });
    return Object.keys(groups).map(g => `
      <div style="margin-bottom:var(--space-5);">
        <div class="panel__title" style="margin-bottom:var(--space-3); padding-bottom:var(--space-2); border-bottom:1px solid var(--card-border);">
          <strong style="font-size:var(--fs-md);">${escapeHtml(g)}</strong>
          <span>${groups[g].length} ${groups[g].length === 1 ? 'rule' : 'rules'}</span>
        </div>
        <div class="tag-stack">
          ${groups[g].map(r => renderTag(r, kind)).join('')}
        </div>
      </div>
    `).join('');
  }

  function renderTag(r, kind) {
    return `
      <div class="tag tag--${kind}">
        <div class="tag__body">
          <div class="tag__head">
            <span class="tag__id">${r.id}</span>
            <span class="tag__sep">·</span>
            <span>${escapeHtml(r.species)}</span>
            <span class="tag__sep">·</span>
            <span>${escapeHtml(r.ruleType)}</span>
            <span class="tag__sep">·</span>
            <span>${escapeHtml(r.seasonType)}</span>
            ${r.legalLabel ? `<span class="tag__sep">·</span><span style="color: var(--text-secondary);">${escapeHtml(r.legalLabel)}</span>` : ''}
            ${r.huntCode ? `<span class="tag__sep">·</span><span style="font-family: var(--font-mono);">${escapeHtml(r.huntCode)}</span>` : ''}
          </div>
          <div class="tag__summary">${escapeHtml(r.summary)}</div>
        </div>
      </div>
    `;
  }

  function renderActiveBucket() {
    const r = data.SAMPLE_REPORT;
    const items = r.buckets[state.activeBucket];
    const kind = state.activeBucket;

    const captions = {
      correct: 'Rules ingestion produced that exactly match a ground truth rule.',
      missing: 'Rules in the ground truth slice that ingestion failed to produce. Each one represents a gap.',
      extra: 'Rules ingestion produced that have no ground truth counterpart. Each one is hallucinated or out-of-scope.',
    };

    return `
      <div class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <strong>${state.activeBucket[0].toUpperCase() + state.activeBucket.slice(1)} rules</strong>
            <span>${items.length} . ${escapeHtml(captions[state.activeBucket])}</span>
          </div>
          <div style="display:flex; gap:var(--space-2); align-items:center;">
            <span class="chip-group__label">Group by</span>
            <div class="chip-row">
              <button class="chip" type="button" aria-pressed="${state.groupBy === 'species'}" data-groupby="species">Species</button>
              <button class="chip" type="button" aria-pressed="${state.groupBy === 'ruleType'}" data-groupby="ruleType">Rule type</button>
              <button class="chip" type="button" aria-pressed="${state.groupBy === 'flat'}" data-groupby="flat">Flat</button>
            </div>
          </div>
        </div>
        ${items.length === 0 ? `
          <div class="empty">
            <div class="empty__title">Nothing in this bucket</div>
            <div class="empty__body">No ${state.activeBucket} rules in this run. ${state.activeBucket === 'missing' ? 'Ingestion captured everything in scope.' : state.activeBucket === 'extra' ? 'Ingestion stayed in scope, no hallucinations.' : ''}</div>
          </div>
        ` : renderTagStack(items, kind)}
      </div>
    `;
  }

  function render(params) {
    const r = data.SAMPLE_REPORT;
    const m = data.managerById(r.managerId);
    const root = document.getElementById('view-report');

    const total = r.buckets.correct.length + r.buckets.missing.length + r.buckets.extra.length;
    const accuracy = total > 0 ? r.buckets.correct.length / total : 0;
    const ranAt = new Date(r.ranAt);
    const ranAtStr = ranAt.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    root.innerHTML = `
      <div class="view-header">
        <div class="view-header__intro">
          <span class="view-eyebrow">04 · Report</span>
          <h1>Validation run <span class="highlight">${r.id}</span></h1>
          <p class="view-lede">Candidate vs reference, rule by rule. Pipeline runs in three phases (count and match, reconcile names, field and report). Tap a bucket to drill into its rules.</p>
        </div>
        <div style="display:flex; gap:var(--space-2);">
          <button class="btn btn--ghost" type="button" data-action="back">Back</button>
          <button class="btn" type="button" data-action="export-json">Export JSON</button>
          <button class="btn" type="button" data-action="export-csv">Export CSV</button>
          <button class="btn btn--primary" type="button" data-action="history">View history</button>
        </div>
      </div>

      <div class="score-summary">
        <div>
          <div class="score-summary__value">${fmtPct(accuracy)}</div>
          <div class="score-summary__label">Accuracy</div>
        </div>
        <div class="score-summary__meta">
          <div class="score-summary__title">${escapeHtml(r.referenceLabel || (m.name + ', ' + m.state))}</div>
          <div class="score-summary__sub">vs ${escapeHtml(r.candidateLabel || r.inputFormat.toUpperCase() + ' input')} · ${escapeHtml(r.scope.label)} · ${ranAtStr} · by ${escapeHtml(r.ranBy)}</div>
        </div>
        <div class="score-summary__actions">
          <span class="manager-card__truth-flag">Reference pinned</span>
        </div>
      </div>

      ${renderPhases()}
      ${renderBuckets()}
      ${renderActiveBucket()}
    `;

    root.querySelectorAll('[data-bucket]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeBucket = btn.dataset.bucket;
        render();
      });
    });

    root.querySelectorAll('[data-groupby]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.groupBy = btn.dataset.groupby;
        render();
      });
    });

    root.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'back') router.navigate('score', { manager: r.managerId });
        if (action === 'history') router.navigate('history', { manager: r.managerId });
        if (action === 'export-json') alert('Mock prototype: would download report-' + r.id + '.json');
        if (action === 'export-csv') alert('Mock prototype: would download report-' + r.id + '.csv');
      });
    });
  }

  window.Scorer.router.register('report', render);
})();
