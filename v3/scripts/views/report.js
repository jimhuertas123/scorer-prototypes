window.Scorer = window.Scorer || {};

(() => {
  const { data, router } = window.Scorer;

  const state = {
    bucketFilter: 'all',
    entityFilter: 'all',
    selectedId: null,
    selectedKind: null,
    selectedEntity: null,
  };

  function escapeHtml(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
  function fmtPct(n) { return Math.round(n * 100) + '%'; }

  function flatList() {
    const r = data.SAMPLE_REPORT;
    const items = [];
    if (state.entityFilter !== 'regulations') {
      r.buckets.correct.forEach(x => items.push({ entity: 'rule', kind: 'correct', item: x }));
      r.buckets.missing.forEach(x => items.push({ entity: 'rule', kind: 'missing', item: x }));
      r.buckets.extra.forEach(x => items.push({ entity: 'rule', kind: 'extra', item: x }));
    }
    if (state.entityFilter !== 'rules' && r.regulationsBuckets) {
      r.regulationsBuckets.correct.forEach(x => items.push({ entity: 'regulation', kind: 'correct', item: x }));
      r.regulationsBuckets.missing.forEach(x => items.push({ entity: 'regulation', kind: 'missing', item: x }));
      r.regulationsBuckets.extra.forEach(x => items.push({ entity: 'regulation', kind: 'extra', item: x }));
    }
    if (state.bucketFilter === 'all') return items;
    return items.filter(x => x.kind === state.bucketFilter);
  }

  function findItem() {
    return flatList().find(x =>
      x.item.id === state.selectedId &&
      x.kind === state.selectedKind &&
      x.entity === state.selectedEntity
    );
  }

  function bucketChip(label, value) {
    return `<button class="chip" type="button" aria-pressed="${state.bucketFilter === value}" data-bucket="${value}"><span>${escapeHtml(label)}</span></button>`;
  }

  function entityChip(label, value, count) {
    return `<button class="chip" type="button" aria-pressed="${state.entityFilter === value}" data-entity="${value}">
      <span>${escapeHtml(label)}</span>
      ${count != null ? `<span class="chip__count">${count}</span>` : ''}
    </button>`;
  }

  function renderListItem(entry) {
    const r = entry.item;
    const trailClass = `list-item__trail--${entry.kind}`;
    const dot = { correct: '●', missing: '○', extra: '✕' }[entry.kind];
    const sealColor = entry.kind === 'correct' ? 'var(--status-correct)' : entry.kind === 'missing' ? 'var(--status-missing)' : 'var(--status-extra)';
    const isReg = entry.entity === 'regulation';
    const name = isReg ? r.title : r.summary;
    const meta = isReg
      ? `Regulation · ${r.species && r.species.length ? r.species.join('/') : 'all species'}`
      : `Rule · ${escapeHtml(r.species)} · ${escapeHtml(r.ruleType)}`;
    return `
      <button class="list-item" type="button" data-id="${r.id}" data-kind="${entry.kind}" data-entity="${entry.entity}" aria-current="${state.selectedId === r.id && state.selectedKind === entry.kind && state.selectedEntity === entry.entity}">
        <span class="list-item__seal" style="background: var(--bg-elev-2); color: ${sealColor};">${dot}</span>
        <span class="list-item__body">
          <span class="list-item__name">${escapeHtml(name)}</span>
          <span class="list-item__meta">${meta}</span>
        </span>
        <span class="list-item__trail ${trailClass}">${entry.kind}</span>
      </button>
    `;
  }

  function ruleCounts() {
    const b = data.SAMPLE_REPORT.buckets;
    return { correct: b.correct.length, missing: b.missing.length, extra: b.extra.length };
  }

  function regCounts() {
    const b = data.SAMPLE_REPORT.regulationsBuckets || { correct: [], missing: [], extra: [] };
    return { correct: b.correct.length, missing: b.missing.length, extra: b.extra.length };
  }

  function renderHero() {
    const r = data.SAMPLE_REPORT;
    const m = data.managerById(r.managerId);
    const rc = ruleCounts();
    const gc = regCounts();
    const totalCorrect = rc.correct + gc.correct;
    const totalAll = rc.correct + rc.missing + rc.extra + gc.correct + gc.missing + gc.extra;
    const accuracy = totalAll > 0 ? totalCorrect / totalAll : 0;
    return `
      <div class="detail__hero">
        <div class="detail__hero-eyebrow">
          <span>${escapeHtml(r.id)}</span>
          <span>·</span>
          <span>${escapeHtml(r.referenceLabel || (m.name + ', ' + m.state))}</span>
        </div>
        <div style="display: flex; align-items: baseline; gap: var(--space-4);">
          <div class="detail__hero-title" style="font-family: var(--font-mono); font-size: 3rem; color: var(--accent);">${fmtPct(accuracy)}</div>
          <div style="display: flex; flex-direction: column; gap: var(--space-2);">
            <div style="display: flex; gap: var(--space-2); flex-wrap: wrap; align-items: center;">
              <span class="chip-group__label" style="margin: 0;">Rules</span>
              <span class="detail__pill detail__pill--correct">${rc.correct} correct</span>
              <span class="detail__pill detail__pill--missing">${rc.missing} missing</span>
              <span class="detail__pill detail__pill--extra">${rc.extra} extra</span>
            </div>
            <div style="display: flex; gap: var(--space-2); flex-wrap: wrap; align-items: center;">
              <span class="chip-group__label" style="margin: 0;">Regulations</span>
              <span class="detail__pill detail__pill--correct">${gc.correct} correct</span>
              <span class="detail__pill detail__pill--missing">${gc.missing} missing</span>
              <span class="detail__pill detail__pill--extra">${gc.extra} extra</span>
            </div>
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

  function renderRuleDetail(entry) {
    const r = entry.item;
    const labels = {
      correct: 'Matched ground truth',
      missing: 'Present in ground truth, absent from candidate',
      extra: 'Present in candidate, no ground truth counterpart',
    };
    return `
      <div class="detail__section">
        <div class="detail__section-head">
          <span class="detail__section-title">Bucket</span>
          <span class="detail__section-meta">rule · ${entry.kind}</span>
        </div>
        <div class="detail__pills">
          <span class="detail__pill detail__pill--${entry.kind}">${entry.kind}</span>
          <span class="detail__pill">rule</span>
          <span style="font-size: var(--fs-xs); color: var(--text-secondary); align-self: center;">${labels[entry.kind]}</span>
        </div>
      </div>

      <div class="detail__section">
        <div class="detail__section-head">
          <span class="detail__section-title">Rule</span>
          <span class="detail__section-meta">${escapeHtml(r.id)}</span>
        </div>
        <div class="detail__field"><span class="detail__field-label">Species</span><span class="detail__field-value">${escapeHtml(r.species)}</span></div>
        <div class="detail__field"><span class="detail__field-label">Rule type</span><span class="detail__field-value">${escapeHtml(r.ruleType)}</span></div>
        <div class="detail__field"><span class="detail__field-label">Season type</span><span class="detail__field-value">${escapeHtml(r.seasonType)}</span></div>
        ${r.legalLabel ? `<div class="detail__field"><span class="detail__field-label">Legal label</span><span class="detail__field-value">${escapeHtml(r.legalLabel)}</span></div>` : ''}
        ${r.huntCode ? `<div class="detail__field"><span class="detail__field-label">Hunt code</span><span class="detail__field-value" style="font-family: var(--font-mono);">${escapeHtml(r.huntCode)}</span></div>` : ''}
        <div class="detail__field"><span class="detail__field-label">Summary</span><span class="detail__field-value">${escapeHtml(r.summary)}</span></div>
      </div>
    `;
  }

  function renderRegulationDetail(entry) {
    const g = entry.item;
    const labels = {
      correct: 'Matched ground truth regulation',
      missing: 'Present in ground truth, absent from candidate',
      extra: 'Present in candidate, no ground truth counterpart',
    };
    return `
      <div class="detail__section">
        <div class="detail__section-head">
          <span class="detail__section-title">Bucket</span>
          <span class="detail__section-meta">regulation · ${entry.kind}</span>
        </div>
        <div class="detail__pills">
          <span class="detail__pill detail__pill--${entry.kind}">${entry.kind}</span>
          <span class="detail__pill detail__pill--accent">regulation</span>
          <span style="font-size: var(--fs-xs); color: var(--text-secondary); align-self: center;">${labels[entry.kind]}</span>
        </div>
      </div>

      <div class="detail__section">
        <div class="detail__section-head">
          <span class="detail__section-title">Regulation</span>
          <span class="detail__section-meta">${escapeHtml(g.id)}</span>
        </div>
        <div class="detail__field"><span class="detail__field-label">Title</span><span class="detail__field-value">${escapeHtml(g.title)}</span></div>
        <div class="detail__field">
          <span class="detail__field-label">Applies to</span>
          <span class="detail__field-value">${g.species && g.species.length > 0 ? g.species.join(', ') : '<em class="detail__field-value--muted">all species</em>'}</span>
        </div>
        <div class="detail__field"><span class="detail__field-label">Content</span><span class="detail__field-value">${escapeHtml(g.content)}</span></div>
      </div>
    `;
  }

  function renderDetail(entry) {
    if (!entry) {
      return `
        <div class="detail-empty">
          <div class="detail-empty__icon">⌖</div>
          <div class="detail-empty__title">Pick an entry to inspect</div>
          <div class="detail-empty__body">Select any rule or regulation from the left list to see its full diff entry.</div>
        </div>
      `;
    }
    return entry.entity === 'regulation' ? renderRegulationDetail(entry) : renderRuleDetail(entry);
  }

  function render(params) {
    const r = data.SAMPLE_REPORT;
    const root = document.getElementById('view-report');
    const items = flatList();
    const selected = findItem();
    const rc = ruleCounts();
    const gc = regCounts();

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
              ${entityChip('All', 'all', (rc.correct + rc.missing + rc.extra + gc.correct + gc.missing + gc.extra))}
              ${entityChip('Rules', 'rules', rc.correct + rc.missing + rc.extra)}
              ${entityChip('Regulations', 'regulations', gc.correct + gc.missing + gc.extra)}
            </div>
            <div class="chip-row">
              ${bucketChip('All', 'all')}
              ${bucketChip('Correct', 'correct')}
              ${bucketChip('Missing', 'missing')}
              ${bucketChip('Extra', 'extra')}
            </div>
          </div>
          <div class="inspector__pane-body">
            ${items.length === 0 ? `
              <div class="detail-empty" style="padding: var(--space-8) var(--space-4);">
                <div class="detail-empty__title">Nothing matches</div>
                <div class="detail-empty__body">Adjust the entity or bucket filter to see other entries.</div>
              </div>
            ` : items.map(renderListItem).join('')}
          </div>
        </aside>

        <main class="inspector__pane">
          <div class="inspector__pane-head">
            <div class="inspector__pane-title">
              <strong>${selected ? escapeHtml(selected.entity === 'regulation' ? selected.item.title : selected.item.summary) : 'Validation summary'}</strong>
              <span>${selected ? selected.item.id + ' · ' + selected.entity : 'no selection'}</span>
            </div>
          </div>
          <div class="inspector__pane-body inspector__pane-body--padded">
            ${selected ? renderDetail(selected) : renderHero()}
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

    root.querySelectorAll('[data-entity]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.entityFilter = btn.dataset.entity;
        render();
      });
    });

    root.querySelectorAll('[data-id][data-kind][data-entity]').forEach(item => {
      item.addEventListener('click', () => {
        state.selectedId = item.dataset.id;
        state.selectedKind = item.dataset.kind;
        state.selectedEntity = item.dataset.entity;
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
