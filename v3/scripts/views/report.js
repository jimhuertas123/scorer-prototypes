window.Scorer = window.Scorer || {};

(() => {
  const { data, router } = window.Scorer;

  const state = {
    bucketFilter: 'all',
    selectedRuleId: null,
    selectedKind: null,
  };

  function escapeHtml(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
  function fmtPct(n) { return Math.round(n * 100) + '%'; }

  function flatList() {
    const r = data.SAMPLE_REPORT;
    const items = [];
    r.buckets.correct.forEach(x => items.push({ kind: 'correct', rule: x }));
    r.buckets.missing.forEach(x => items.push({ kind: 'missing', rule: x }));
    r.buckets.extra.forEach(x => items.push({ kind: 'extra', rule: x }));
    if (state.bucketFilter === 'all') return items;
    return items.filter(x => x.kind === state.bucketFilter);
  }

  function findItem() {
    return flatList().find(x => x.rule.id === state.selectedRuleId && x.kind === state.selectedKind);
  }

  function chip(label, value) {
    return `<button class="chip" type="button" aria-pressed="${state.bucketFilter === value}" data-bucket="${value}"><span>${escapeHtml(label)}</span></button>`;
  }

  function renderListItem(item) {
    const r = item.rule;
    const trailClass = `list-item__trail--${item.kind}`;
    const dot = { correct: '●', missing: '○', extra: '✕' }[item.kind];
    return `
      <button class="list-item" type="button" data-rule="${r.id}" data-kind="${item.kind}" aria-current="${state.selectedRuleId === r.id && state.selectedKind === item.kind}">
        <span class="list-item__seal" style="background: var(--bg-elev-2); color: ${item.kind === 'correct' ? 'var(--status-correct)' : item.kind === 'missing' ? 'var(--status-missing)' : 'var(--status-extra)'};">${dot}</span>
        <span class="list-item__body">
          <span class="list-item__name">${escapeHtml(r.summary)}</span>
          <span class="list-item__meta">${escapeHtml(r.species)} · ${escapeHtml(r.ruleType)} · ${escapeHtml(r.seasonType)}</span>
        </span>
        <span class="list-item__trail ${trailClass}">${item.kind}</span>
      </button>
    `;
  }

  function renderHero() {
    const r = data.SAMPLE_REPORT;
    const m = data.managerById(r.managerId);
    const total = r.buckets.correct.length + r.buckets.missing.length + r.buckets.extra.length;
    const accuracy = total > 0 ? r.buckets.correct.length / total : 0;
    return `
      <div class="detail__hero">
        <div class="detail__hero-eyebrow">
          <span>${escapeHtml(r.id)}</span>
          <span>·</span>
          <span>${escapeHtml(r.referenceLabel || (m.name + ', ' + m.state))}</span>
        </div>
        <div style="display: flex; align-items: baseline; gap: var(--space-4);">
          <div class="detail__hero-title" style="font-family: var(--font-mono); font-size: 3rem; color: var(--accent);">${fmtPct(accuracy)}</div>
          <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
            <span class="detail__pill detail__pill--correct">${r.buckets.correct.length} correct</span>
            <span class="detail__pill detail__pill--missing">${r.buckets.missing.length} missing</span>
            <span class="detail__pill detail__pill--extra">${r.buckets.extra.length} extra</span>
          </div>
        </div>
        <div class="detail__hero-sub">vs ${escapeHtml(r.candidateLabel || r.inputFormat.toUpperCase() + ' input')} · ${escapeHtml(r.scope.label)} · by ${escapeHtml(r.ranBy)}</div>
      </div>
      ${renderPhases(r)}
    `;
  }

  function renderPhases(r) {
    if (!r.phases || r.phases.length === 0) return '';
    const dot = (status) => {
      const c = status === 'completed' ? 'var(--status-completed)' : status === 'failed' ? 'var(--status-failed)' : 'var(--status-cancelled)';
      return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c};"></span>`;
    };
    return `
      <div class="detail__section">
        <div class="detail__section-head">
          <span class="detail__section-title">Pipeline</span>
          <span class="detail__section-meta">three phases</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3);">
          ${r.phases.map((p, i) => `
            <div style="padding: var(--space-3) var(--space-4); border: 1px solid var(--card-border-strong); border-radius: var(--radius-sm);">
              <div style="display:flex; align-items:center; gap: var(--space-2); margin-bottom: var(--space-2);">
                ${dot(p.status)}
                <span style="font-family: var(--font-mono); font-size: var(--fs-xxs); letter-spacing: var(--tracking-wider); text-transform: uppercase; color: var(--text-tertiary); font-weight: 500;">P${i + 1} · ${p.kind === 'llm' ? 'LLM' : 'det'}</span>
                <span style="margin-left: auto; font-family: var(--font-mono); font-size: var(--fs-xxs); color: var(--text-tertiary);">${p.durationMs}ms</span>
              </div>
              <div style="font-size: var(--fs-sm); font-weight: 700; color: var(--text-primary); letter-spacing: var(--tracking-tight); margin-bottom: 4px;">${escapeHtml(p.label)}</div>
              <div style="font-size: var(--fs-xs); color: var(--text-secondary); line-height: 1.5;">${escapeHtml(p.summary)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderRuleDetail(item) {
    if (!item) {
      return `
        <div class="detail-empty">
          <div class="detail-empty__icon">⌖</div>
          <div class="detail-empty__title">Pick a rule to inspect</div>
          <div class="detail-empty__body">Select any rule from the left list to see its full diff entry, including which fields matched and where the gap is.</div>
        </div>
      `;
    }
    const r = item.rule;
    const labels = {
      correct: 'Matched ground truth',
      missing: 'Present in ground truth, absent from extraction',
      extra: 'Present in extraction, no ground truth counterpart',
    };
    return `
      <div class="detail__section">
        <div class="detail__section-head">
          <span class="detail__section-title">Bucket</span>
          <span class="detail__section-meta">${item.kind}</span>
        </div>
        <div class="detail__pills">
          <span class="detail__pill detail__pill--${item.kind}">${item.kind}</span>
          <span style="font-size: var(--fs-xs); color: var(--text-secondary); align-self: center;">${labels[item.kind]}</span>
        </div>
      </div>

      <div class="detail__section">
        <div class="detail__section-head">
          <span class="detail__section-title">Rule</span>
          <span class="detail__section-meta">${escapeHtml(r.id)}</span>
        </div>
        <div class="detail__field">
          <span class="detail__field-label">Species</span>
          <span class="detail__field-value">${escapeHtml(r.species)}</span>
        </div>
        <div class="detail__field">
          <span class="detail__field-label">Rule type</span>
          <span class="detail__field-value">${escapeHtml(r.ruleType)}</span>
        </div>
        <div class="detail__field">
          <span class="detail__field-label">Season type</span>
          <span class="detail__field-value">${escapeHtml(r.seasonType)}</span>
        </div>
        ${r.legalLabel ? `
          <div class="detail__field">
            <span class="detail__field-label">Legal label</span>
            <span class="detail__field-value">${escapeHtml(r.legalLabel)}</span>
          </div>
        ` : ''}
        ${r.huntCode ? `
          <div class="detail__field">
            <span class="detail__field-label">Hunt code</span>
            <span class="detail__field-value" style="font-family: var(--font-mono);">${escapeHtml(r.huntCode)}</span>
          </div>
        ` : ''}
        <div class="detail__field">
          <span class="detail__field-label">Summary</span>
          <span class="detail__field-value">${escapeHtml(r.summary)}</span>
        </div>
      </div>
    `;
  }

  function render(params) {
    const r = data.SAMPLE_REPORT;
    const root = document.getElementById('view-report');
    const items = flatList();
    const selected = findItem();

    root.className = 'view view--inspector';
    root.innerHTML = `
      <div class="view-header">
        <div class="view-header__intro">
          <span class="view-eyebrow">04 · Report</span>
          <h1>Validation run <span class="highlight">${r.id}</span></h1>
        </div>
        <div style="display:flex; gap:var(--space-2);">
          <button class="btn btn--ghost" data-action="back">Back</button>
          <button class="btn" data-action="export-json">Export JSON</button>
          <button class="btn btn--primary" data-action="history">View history</button>
        </div>
      </div>

      <div class="inspector inspector--wide-list">
        <aside class="inspector__pane">
          <div class="inspector__pane-head">
            <div class="inspector__pane-title">
              <strong>Diff entries</strong>
              <span>${items.length} total</span>
            </div>
          </div>
          <div class="list-filters">
            <div class="chip-row">
              ${chip('All', 'all')}
              ${chip('Correct', 'correct')}
              ${chip('Missing', 'missing')}
              ${chip('Extra', 'extra')}
            </div>
          </div>
          <div class="inspector__pane-body">
            ${items.length === 0 ? `
              <div class="detail-empty" style="padding: var(--space-8) var(--space-4);">
                <div class="detail-empty__title">Nothing in this bucket</div>
                <div class="detail-empty__body">Switch the bucket filter to see other entries.</div>
              </div>
            ` : items.map(renderListItem).join('')}
          </div>
        </aside>

        <main class="inspector__pane">
          <div class="inspector__pane-head">
            <div class="inspector__pane-title">
              <strong>${selected ? escapeHtml(selected.rule.summary) : 'Run summary'}</strong>
              <span>${selected ? selected.rule.id : 'no selection'}</span>
            </div>
          </div>
          <div class="inspector__pane-body inspector__pane-body--padded">
            ${selected ? renderRuleDetail(selected) : renderHero()}
          </div>
        </main>
      </div>
    `;

    root.querySelectorAll('[data-bucket]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.bucketFilter = btn.dataset.bucket;
        render();
      });
    });

    root.querySelectorAll('[data-rule][data-kind]').forEach(item => {
      item.addEventListener('click', () => {
        state.selectedRuleId = item.dataset.rule;
        state.selectedKind = item.dataset.kind;
        render();
      });
    });

    root.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const a = btn.dataset.action;
        if (a === 'back') router.navigate('score', { manager: r.managerId });
        if (a === 'history') router.navigate('history', { manager: r.managerId });
        if (a === 'export-json') alert('Mock prototype: would download report-' + r.id + '.json');
      });
    });
  }

  window.Scorer.router.register('report', render);
})();
