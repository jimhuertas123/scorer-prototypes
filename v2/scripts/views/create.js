window.Scorer = window.Scorer || {};

(() => {
  const { data, router } = window.Scorer;

  const state = {
    mode: 'fork',
    sourceId: null,
    query: '',
    edits: {},
    adding: null,
    newRule: emptyRule(),
    newReg: emptyReg(),
    newFee: emptyFee(),
    addedRules: [],
    addedRegs: [],
    addedFees: [],
    removedRuleIds: new Set(),
    removedRegIds: new Set(),
    removedFeeIds: new Set(),
    expandedSections: new Set(),
  };

  function emptyRule() {
    return {
      species: '', ruleType: '', seasonType: '',
      legalLabel: '', huntCode: '', publicLand: '', notes: '',
      sexes: [], categories: [], weaponCategories: [],
      weaponSpecs: {},
      equipment: '', schedule: '',
      startDate: '', endDate: '', dateDescription: '',
      summary: '',
      limits: [],
      requirements: [],
      eligibility: [],
    };
  }

  function emptyReg() {
    return { title: '', content: '', species: [], speciesScope: 'all', iconSource: '' };
  }

  function emptyFee() {
    return { licenseId: '', baseLicenseId: '', hunterType: '', fee: '', currency: 'USD' };
  }

  function newFeeValid() {
    const f = state.newFee;
    if (!f.licenseId || !f.hunterType) return false;
    const n = parseFloat(f.fee);
    if (isNaN(n) || n < 0) return false;
    const lic = data.licenseById(f.licenseId);
    if (lic && lic.purchasingType === 'otc_addon' && !f.baseLicenseId) return false;
    return true;
  }

  function feesAllLicenseIds() {
    return new Set([
      ...activeSourceFees().map(f => f.licenseId),
      ...state.addedFees.map(f => f.licenseId),
    ]);
  }

  function activeSourceFees() {
    if (!state.sourceId) return [];
    return data.licenseFeesForManager(state.sourceId).filter(f => !state.removedFeeIds.has(f.id));
  }

  function ruleFieldCount(r) {
    const idCount = [r.legalLabel, r.huntCode, r.publicLand, r.notes].filter(Boolean).length;
    const restrictCount = (r.sexes?.length || 0) + (r.categories?.length || 0) + (r.weaponCategories?.length || 0)
      + (r.equipment ? 1 : 0) + (r.schedule ? 1 : 0);
    const dateCount = (r.startDate && r.endDate ? 1 : 0) + (r.dateDescription ? 1 : 0);
    const limitCount = r.limits?.length || 0;
    const reqCount = r.requirements?.length || 0;
    const eligCount = r.eligibility?.length || 0;
    return { idCount, restrictCount, dateCount, limitCount, reqCount, eligCount };
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  function fmtDateRange(start, end) {
    if (!start || !end) return '';
    const opts = { month: 'short', day: 'numeric', year: 'numeric' };
    const s = new Date(start + 'T00:00:00').toLocaleDateString('en-US', opts);
    const e = new Date(end + 'T00:00:00').toLocaleDateString('en-US', opts);
    return s + ' to ' + e;
  }

  function fieldState(key) {
    if (state.edits[key] != null) return 'edited';
    if (state.mode === 'fork' && state.sourceId) return 'copied';
    return 'new';
  }

  function fieldValue(key, fallback) {
    if (state.edits[key] != null) return state.edits[key];
    if (state.mode === 'fork' && state.sourceId) {
      const src = data.managerById(state.sourceId);
      if (src && src[key] != null) return Array.isArray(src[key]) ? src[key].join(', ') : src[key];
    }
    return fallback || '';
  }

  function source() { return state.sourceId ? data.managerById(state.sourceId) : null; }

  function activeSourceRules() {
    if (!state.sourceId) return [];
    return data.rulesForManager(state.sourceId).filter(r => !state.removedRuleIds.has(r.id));
  }

  function activeSourceRegs() {
    if (!state.sourceId) return [];
    return data.regulationsForManager(state.sourceId).filter(g => !state.removedRegIds.has(g.id));
  }

  function newRuleValid() {
    const r = state.newRule;
    if (!r.species || !r.ruleType || !r.seasonType) return false;
    if (!r.summary || r.summary.trim().length <= 2) return false;
    if (r.startDate && r.endDate && r.startDate > r.endDate) return false;
    if (r.startDate && !r.endDate) return false;
    if (!r.startDate && r.endDate) return false;
    return true;
  }

  function newRegValid() {
    const g = state.newReg;
    if (!g.title || g.title.trim().length <= 2) return false;
    if (!g.content || g.content.trim().length <= 5) return false;
    if (g.speciesScope === 'specific' && (!g.species || g.species.length === 0)) return false;
    return true;
  }

  function comboList() {
    const q = state.query.toLowerCase();
    return data.MANAGERS.filter(m => !q || (m.name + ' ' + m.state).toLowerCase().includes(q));
  }

  function setupOutsideClickOnce() {
    if (window.__scorerCreateOutside) return;
    window.__scorerCreateOutside = e => {
      const view = document.getElementById('view-create');
      if (!view || !view.hasAttribute('data-active')) return;
      const combo = view.querySelector('.combobox');
      if (!combo) return;
      if (!combo.contains(e.target)) combo.classList.remove('combobox--open');
    };
    document.addEventListener('click', window.__scorerCreateOutside);
  }

  function renderModeTabs() {
    return `
      <div class="mode-tabs">
        <button class="mode-tab" type="button" aria-pressed="${state.mode === 'fork'}" data-mode="fork">
          <span class="mode-tab__eyebrow">Recommended</span>
          <span class="mode-tab__title">Fork an existing manager</span>
          <span class="mode-tab__body">Clone the regulations and rules from an already ingested manager into an editable draft, then hand correct or trim. Forked managers may not be complete, so you can remove rules or regulations that don't belong.</span>
        </button>
        <button class="mode-tab" type="button" aria-pressed="${state.mode === 'blank'}" data-mode="blank">
          <span class="mode-tab__eyebrow">Empty start</span>
          <span class="mode-tab__title">Build from scratch</span>
          <span class="mode-tab__body">Start with no rules and no regulations and add them one by one. Use this only when no existing manager is close enough to fork from.</span>
        </button>
      </div>
    `;
  }

  function renderForkPicker() {
    const items = comboList();
    const src = source();
    const inputValue = src ? (src.state + ' · ' + src.name) : state.query;
    return `
      <div class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <strong>Source manager</strong>
            <span>pick the manager to fork from</span>
          </div>
          ${src ? `<button class="btn btn--ghost btn--sm" type="button" data-action="clear-source">Change source</button>` : ''}
        </div>
        <div class="combobox">
          <div class="search" style="width:100%;">
            <span class="search__icon">⌕</span>
            <input class="input" id="create-source-input" placeholder="Search by manager, state..." value="${escapeHtml(inputValue)}" autocomplete="off" />
          </div>
          <div class="combobox__list" role="listbox">
            ${items.length === 0 ? `
              <div style="padding:var(--space-5); color:var(--text-tertiary); font-size:var(--fs-sm);">No managers match.</div>
            ` : items.map(m => `
              <button class="combobox__item" type="button" data-id="${m.id}" role="option">
                <span class="combobox__item-seal">${m.state}</span>
                <span>
                  <span class="combobox__item-name">${escapeHtml(m.name)}</span>
                  <div class="combobox__item-meta">${m.regulationCount} regulations · ${m.ruleCount} rules · ${m.species.join(', ')}</div>
                </span>
                ${m.isGroundTruth ? `<span class="manager-card__truth-flag">Ground truth</span>` : ''}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function chipsRow(field, options, current, dataAttr) {
    return options.map(opt => `
      <button class="chip" type="button" aria-pressed="${current === opt}" data-${dataAttr}-field="${field}" data-${dataAttr}-value="${opt}">${escapeHtml(opt)}</button>
    `).join('');
  }

  function multiChipsRow(field, options, currentList, dataAttr) {
    return options.map(opt => `
      <button class="chip" type="button" aria-pressed="${currentList.includes(opt)}" data-${dataAttr}-multi-field="${field}" data-${dataAttr}-multi-value="${opt}">${escapeHtml(opt)}</button>
    `).join('');
  }

  function section(key, name, hint, count, body) {
    const open = state.expandedSections.has(key);
    return `
      <div class="section ${open ? 'section--open' : ''}" data-section="${key}">
        <button class="section__head" type="button" data-section-toggle="${key}">
          <span class="section__caret">▶</span>
          <span class="section__name">${escapeHtml(name)}</span>
          <span class="section__hint">${escapeHtml(hint)}</span>
          <span class="section__count">${count > 0 ? `<strong>${count}</strong> filled` : '0 filled'}</span>
        </button>
        <div class="section__body">${body}</div>
      </div>
    `;
  }

  function renderListEditor(field, items, labels) {
    return `
      <div style="display: flex; flex-direction: column; gap: var(--space-3);">
        ${items.length === 0 ? `<div style="font-size: var(--fs-xs); color: var(--text-tertiary);">No entries yet. Add one with the button below.</div>` : ''}
        ${items.map((item, i) => `
          <div class="list-row">
            <input class="list-row__label" data-list-field="${field}" data-list-index="${i}" data-list-key="${labels.labelKey}" placeholder="${escapeHtml(labels.labelPlaceholder)}" value="${escapeHtml(item[labels.labelKey] || '')}" />
            <textarea class="list-row__content" data-list-field="${field}" data-list-index="${i}" data-list-key="${labels.contentKey}" placeholder="${escapeHtml(labels.contentPlaceholder)}" rows="1">${escapeHtml(item[labels.contentKey] || '')}</textarea>
            <button class="btn btn--ghost btn--sm" type="button" data-list-remove="${field}" data-list-index="${i}" aria-label="Remove">✕</button>
          </div>
        `).join('')}
        <button class="btn btn--ghost btn--sm" type="button" data-list-add="${field}" style="align-self: flex-start;">+ Add ${labels.itemName}</button>
      </div>
    `;
  }

  function renderStringList(field, items, placeholder) {
    return `
      <div class="string-list">
        ${items.map((s, i) => `
          <span class="string-list__pill">
            ${escapeHtml(s)}
            <button type="button" data-strlist-remove="${field}" data-strlist-index="${i}" aria-label="Remove">✕</button>
          </span>
        `).join('')}
        <input class="string-list__add" data-strlist-add="${field}" placeholder="${escapeHtml(placeholder)}" />
      </div>
    `;
  }

  function renderWeaponSpecs(r) {
    if (!r.weaponCategories || r.weaponCategories.length === 0) return '';
    const blocks = r.weaponCategories.map(cat => {
      const schema = data.WEAPON_SPECS_SCHEMA[cat];
      if (!schema) {
        return `
          <div style="border: 1px solid var(--card-border); border-radius: var(--radius-md); padding: var(--space-3) var(--space-4); background: rgba(0,0,0,0.15);">
            <div class="chip-group__label" style="margin-bottom: var(--space-2);">${escapeHtml(cat)} specs (free-form)</div>
            <div style="font-size: var(--fs-xs); color: var(--text-tertiary);">No schema defined for this category. Use Notes for now.</div>
          </div>
        `;
      }
      const current = r.weaponSpecs[cat] || {};
      const fields = Object.keys(schema).map(key => {
        const opts = schema[key];
        const cur = current[key] || [];
        return `
          <div style="display: flex; flex-direction: column; gap: var(--space-2);">
            <span class="chip-group__label">${escapeHtml(key.replace(/_/g, ' '))}</span>
            <div class="chip-row">
              ${opts.map(opt => `
                <button class="chip" type="button" aria-pressed="${cur.includes(opt)}" data-spec-cat="${escapeHtml(cat)}" data-spec-key="${escapeHtml(key)}" data-spec-value="${escapeHtml(opt)}">${escapeHtml(opt)}</button>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');
      return `
        <div style="border: 1px solid var(--accent); border-radius: var(--radius-md); padding: var(--space-4); background: var(--accent-softer); display: flex; flex-direction: column; gap: var(--space-3);">
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            <span class="chip-group__label" style="color: var(--accent);">${escapeHtml(cat)} specs</span>
            <span style="font-size: var(--fs-xxs); color: var(--text-tertiary);">writes to weapon_specs[${escapeHtml(cat.toLowerCase())}]</span>
          </div>
          ${fields}
        </div>
      `;
    }).join('');
    return `
      <div style="display: flex; flex-direction: column; gap: var(--space-3);">
        ${blocks}
      </div>
    `;
  }

  function renderAddRuleForm() {
    const r = state.newRule;
    const counts = ruleFieldCount(r);

    const idBody = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
        <div style="display: flex; flex-direction: column; gap: var(--space-2);">
          <label class="chip-group__label" for="newrule-legal">Legal label</label>
          <input class="input" id="newrule-legal" data-newrule-text="legalLabel" placeholder="e.g. Antlered, Bearded turkey" value="${escapeHtml(r.legalLabel)}" />
        </div>
        <div style="display: flex; flex-direction: column; gap: var(--space-2);">
          <label class="chip-group__label" for="newrule-hunt">Hunt code</label>
          <input class="input" id="newrule-hunt" data-newrule-text="huntCode" placeholder="e.g. B-ARC-101" value="${escapeHtml(r.huntCode)}" />
        </div>
        <div style="display: flex; flex-direction: column; gap: var(--space-2);">
          <label class="chip-group__label" for="newrule-public">Public land</label>
          <input class="input" id="newrule-public" data-newrule-text="publicLand" placeholder='e.g. 101 sq mi · 35%' value="${escapeHtml(r.publicLand)}" />
        </div>
        <div style="display: flex; flex-direction: column; gap: var(--space-2);">
          <label class="chip-group__label" for="newrule-notes">Notes</label>
          <input class="input" id="newrule-notes" data-newrule-text="notes" placeholder="Internal QA notes" value="${escapeHtml(r.notes)}" />
        </div>
      </div>
    `;

    const restrictBody = `
      <div style="display: flex; flex-direction: column; gap: var(--space-2);">
        <span class="chip-group__label">Sex (multi)</span>
        <div class="chip-row">${multiChipsRow('sexes', data.SEX_TYPES, r.sexes, 'newrule')}</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: var(--space-2);">
        <span class="chip-group__label">Weapon categories (multi)</span>
        <div class="chip-row">${multiChipsRow('weaponCategories', data.WEAPON_CATEGORIES, r.weaponCategories, 'newrule')}</div>
      </div>
      ${renderWeaponSpecs(r)}
      <div style="display: flex; flex-direction: column; gap: var(--space-2);">
        <span class="chip-group__label">Categories</span>
        ${renderStringList('categories', r.categories, 'Type and press Enter')}
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
        <div style="display: flex; flex-direction: column; gap: var(--space-2);">
          <label class="chip-group__label" for="newrule-equipment">Equipment</label>
          <input class="input" id="newrule-equipment" data-newrule-text="equipment" placeholder="e.g. Tree stand, blind" value="${escapeHtml(r.equipment)}" />
        </div>
        <div style="display: flex; flex-direction: column; gap: var(--space-2);">
          <label class="chip-group__label" for="newrule-schedule">Schedule</label>
          <input class="input" id="newrule-schedule" data-newrule-text="schedule" placeholder="e.g. Mon to Fri only" value="${escapeHtml(r.schedule)}" />
        </div>
      </div>
    `;

    const dateBody = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
        <div style="display: flex; flex-direction: column; gap: var(--space-2);">
          <label class="chip-group__label" for="newrule-start">Start</label>
          <input class="input" id="newrule-start" type="date" data-newrule-text="startDate" value="${escapeHtml(r.startDate)}" />
        </div>
        <div style="display: flex; flex-direction: column; gap: var(--space-2);">
          <label class="chip-group__label" for="newrule-end">End</label>
          <input class="input" id="newrule-end" type="date" data-newrule-text="endDate" value="${escapeHtml(r.endDate)}" min="${escapeHtml(r.startDate)}" />
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: var(--space-2);">
        <label class="chip-group__label" for="newrule-datedesc">Date description</label>
        <input class="input" id="newrule-datedesc" data-newrule-text="dateDescription" placeholder='e.g. "Oct 15-19, Nov 8-16" for split seasons' value="${escapeHtml(r.dateDescription)}" />
      </div>
      ${r.startDate && r.endDate && r.startDate > r.endDate ? `
        <div style="font-size: var(--fs-xs); color: var(--status-failed);">End date must be on or after start date.</div>
      ` : ''}
      ${(r.startDate && !r.endDate) || (!r.startDate && r.endDate) ? `
        <div style="font-size: var(--fs-xs); color: var(--status-cancelled);">Fill both dates or leave both empty.</div>
      ` : ''}
    `;

    const limitsBody = renderListEditor('limits', r.limits, {
      itemName: 'limit',
      labelKey: 'title', labelPlaceholder: 'e.g. Daily Bag Limit',
      contentKey: 'content', contentPlaceholder: 'e.g. 1 buck',
    });

    const requirementsBody = renderListEditor('requirements', r.requirements, {
      itemName: 'requirement',
      labelKey: 'label', labelPlaceholder: 'e.g. Tag carriage',
      contentKey: 'content', contentPlaceholder: 'e.g. Tag must be affixed before transport',
    });

    const eligibilityBody = renderListEditor('eligibility', r.eligibility, {
      itemName: 'eligibility entry',
      labelKey: 'label', labelPlaceholder: 'e.g. Youth',
      contentKey: 'content', contentPlaceholder: 'e.g. Under 18, must be supervised by a licensed adult',
    });

    return `
      <div class="add-rule-form" style="background: rgba(99, 102, 241, 0.05); border: 1px solid var(--accent); border-radius: var(--radius-lg); padding: var(--space-5); margin-bottom: var(--space-5); box-shadow: 0 0 30px rgba(99, 102, 241, 0.15);">
        <div class="panel__title" style="margin-bottom: var(--space-4);">
          <strong>New rule</strong>
          <span>HuntRule, sections expand for richer detail</span>
        </div>

        <div style="display: grid; gap: var(--space-5);">
          <div style="display: flex; flex-direction: column; gap: var(--space-2);">
            <span class="chip-group__label">Species *</span>
            <div class="chip-row">${chipsRow('species', data.SPECIES, r.species, 'newrule')}</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-2);">
            <span class="chip-group__label">Rule type *</span>
            <div class="chip-row">${chipsRow('ruleType', data.RULE_TYPES, r.ruleType, 'newrule')}</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-2);">
            <span class="chip-group__label">Season type *</span>
            <div class="chip-row">${chipsRow('seasonType', data.SEASON_TYPES, r.seasonType, 'newrule')}</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-2);">
            <label class="chip-group__label" for="newrule-summary">Summary *</label>
            <input class="input" id="newrule-summary" data-newrule-text="summary" placeholder="e.g. Archery bear: Oct 18 to Nov 1, 2026" value="${escapeHtml(r.summary)}" />
          </div>

          <div>
            <div class="chip-group__label" style="margin-bottom: var(--space-2);">Optional sections</div>
            ${section('id',     'Identification',     'legal label, hunt code, public land, notes', counts.idCount, idBody)}
            ${section('rest',   'Restrictions',       'sex, weapons, categories, equipment, schedule', counts.restrictCount, restrictBody)}
            ${section('dates',  'Date range',         'start, end, description (for split seasons)', counts.dateCount, dateBody)}
            ${section('limits', 'Bag limits',         'title and content pairs', counts.limitCount, limitsBody)}
            ${section('reqs',   'Requirements',       'label and content pairs', counts.reqCount, requirementsBody)}
            ${section('elig',   'Eligibility',        'label and content pairs', counts.eligCount, eligibilityBody)}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); margin-top: var(--space-5); padding-top: var(--space-4); border-top: 1px solid var(--card-border);">
          <span style="font-size: var(--fs-xs); color: var(--text-tertiary);">${newRuleValid() ? 'Ready to save.' : 'Required fields are marked with an asterisk. Open sections above to add more detail.'}</span>
          <div style="display: flex; gap: var(--space-2);">
            <button class="btn btn--ghost" type="button" data-action="cancel-add">Cancel</button>
            <button class="btn btn--primary" type="button" data-action="save-rule" ${newRuleValid() ? '' : 'disabled'}>Save rule</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderAddRegForm() {
    const g = state.newReg;
    return `
      <div class="add-rule-form" style="background: rgba(99, 102, 241, 0.05); border: 1px solid var(--accent); border-radius: var(--radius-lg); padding: var(--space-5); margin-bottom: var(--space-5); box-shadow: 0 0 30px rgba(99, 102, 241, 0.15);">
        <div class="panel__title" style="margin-bottom: var(--space-4);">
          <strong>New regulation</strong>
          <span>broad policy that applies across seasons</span>
        </div>

        <div style="display: grid; gap: var(--space-5);">
          <div style="display: flex; flex-direction: column; gap: var(--space-2);">
            <label class="chip-group__label" for="newreg-title">Title *</label>
            <input class="input" id="newreg-title" data-newreg-text="title" placeholder="e.g. Hunter Education Required" value="${escapeHtml(g.title)}" />
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-2);">
            <label class="chip-group__label" for="newreg-content">Content *</label>
            <textarea class="textarea" id="newreg-content" data-newreg-text="content" placeholder="Full text of the regulation..." style="min-height: 140px; font-family: var(--font-ui); font-size: var(--fs-sm);">${escapeHtml(g.content)}</textarea>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-2);">
            <span class="chip-group__label">Applies to</span>
            <div class="chip-row">
              <button class="chip" type="button" aria-pressed="${g.speciesScope === 'all'}" data-newreg-scope="all">All species</button>
              <button class="chip" type="button" aria-pressed="${g.speciesScope === 'specific'}" data-newreg-scope="specific">Specific species</button>
            </div>
            ${g.speciesScope === 'specific' ? `
              <div class="chip-row" style="margin-top: var(--space-2);">${multiChipsRow('species', data.SPECIES, g.species, 'newreg')}</div>
              ${g.species.length === 0 ? `<div style="font-size: var(--fs-xs); color: var(--status-cancelled);">Pick at least one species, or switch back to "All species".</div>` : ''}
            ` : ''}
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-2);">
            <label class="chip-group__label" for="newreg-icon">Icon source, optional</label>
            <input class="input" id="newreg-icon" data-newreg-text="iconSource" placeholder="e.g. shield, license, target" value="${escapeHtml(g.iconSource)}" />
            <div style="font-size: var(--fs-xs); color: var(--text-tertiary);">An icon hint surfaced in the mobile app card.</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); margin-top: var(--space-5); padding-top: var(--space-4); border-top: 1px solid var(--card-border);">
          <span style="font-size: var(--fs-xs); color: var(--text-tertiary);">${newRegValid() ? 'Ready to save.' : 'Title and content are required.'}</span>
          <div style="display: flex; gap: var(--space-2);">
            <button class="btn btn--ghost" type="button" data-action="cancel-add">Cancel</button>
            <button class="btn btn--primary" type="button" data-action="save-reg" ${newRegValid() ? '' : 'disabled'}>Save regulation</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderRuleTag(r, kind, opts = {}) {
    const colors = {
      copied: { bg: 'rgba(245, 158, 11, 0.06)', border: 'rgba(245, 158, 11, 0.20)', label: 'var(--status-cancelled)', tag: 'Copied' },
      added:  { bg: 'rgba(99, 102, 241, 0.08)', border: 'rgba(99, 102, 241, 0.40)', label: 'var(--accent)', tag: 'New' },
    };
    const c = colors[kind];
    const extras = [];
    if (r.publicLand) extras.push('Public ' + r.publicLand);
    if (r.sexes && r.sexes.length > 0) extras.push('Sex: ' + r.sexes.join('/'));
    if (r.weaponCategories && r.weaponCategories.length > 0) extras.push('Weapons: ' + r.weaponCategories.join(', '));
    if (r.categories && r.categories.length > 0) extras.push(r.categories.length + ' cat');
    if (r.equipment) extras.push('Equip');
    if (r.schedule) extras.push('Sched');
    if (r.limits && r.limits.length > 0) extras.push(r.limits.length + ' limit');
    if (r.requirements && r.requirements.length > 0) extras.push(r.requirements.length + ' req');
    if (r.eligibility && r.eligibility.length > 0) extras.push(r.eligibility.length + ' elig');
    if (r.notes) extras.push('Notes');
    return `
      <div class="tag" style="background: ${c.bg}; border-color: ${c.border};">
        <div class="tag__body">
          <div class="tag__head">
            <span class="tag__id" style="color: ${c.label};">${kind === 'added' ? 'NEW · ' : ''}${escapeHtml(r.id)}</span>
            <span class="tag__sep">·</span>
            <span>${escapeHtml(r.species)}</span>
            <span class="tag__sep">·</span>
            <span>${escapeHtml(r.ruleType)}</span>
            <span class="tag__sep">·</span>
            <span>${escapeHtml(r.seasonType)}</span>
            ${r.legalLabel ? `<span class="tag__sep">·</span><span style="color: var(--text-secondary);">${escapeHtml(r.legalLabel)}</span>` : ''}
            ${r.huntCode ? `<span class="tag__sep">·</span><span style="font-family: var(--font-mono); color: var(--text-tertiary);">${escapeHtml(r.huntCode)}</span>` : ''}
            ${r.startDate && r.endDate ? `<span class="tag__sep">·</span><span style="color: ${c.label};">${escapeHtml(fmtDateRange(r.startDate, r.endDate))}</span>` : ''}
          </div>
          <div class="tag__summary">${escapeHtml(r.summary)}</div>
          ${r.bagLimit || extras.length > 0 ? `
            <div class="tag__head" style="margin-top: 4px; flex-wrap: wrap;">
              ${r.bagLimit ? `<span style="color: var(--text-tertiary);">Bag: ${escapeHtml(r.bagLimit)}</span>` : ''}
              ${r.bagLimit && extras.length > 0 ? `<span class="tag__sep">·</span>` : ''}
              ${extras.map((x, i) => `${i > 0 ? '<span class="tag__sep">·</span>' : ''}<span style="color: var(--text-tertiary);">${escapeHtml(x)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
        ${opts.removable ? `
          <button class="btn btn--ghost btn--sm" type="button" data-${opts.removeKind}-remove="${opts.removeKey}" aria-label="Remove" title="Remove">✕</button>
        ` : `
          <span class="edit-row__source" style="color: ${c.label};">${c.tag}</span>
        `}
      </div>
    `;
  }

  function renderFeeItem(f, kind, opts = {}) {
    const colors = {
      copied: { bg: 'rgba(245, 158, 11, 0.06)', border: 'rgba(245, 158, 11, 0.20)', label: 'var(--status-cancelled)', tag: 'Copied' },
      added:  { bg: 'rgba(99, 102, 241, 0.08)', border: 'rgba(99, 102, 241, 0.40)', label: 'var(--accent)', tag: 'New' },
    };
    const c = colors[kind];
    const lic = data.licenseById(f.licenseId);
    const licName = lic ? lic.name : '(unknown license)';
    const purchasing = lic ? lic.purchasingType : '';
    const base = f.baseLicenseId ? data.licenseById(f.baseLicenseId) : null;
    return `
      <div style="background: ${c.bg}; border: 1px solid ${c.border}; border-radius: var(--radius-md); padding: var(--space-3) var(--space-4); display: grid; grid-template-columns: 1fr auto auto; gap: var(--space-3); align-items: center;">
        <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
          <div class="tag__head" style="display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;">
            <span style="color: ${c.label};">${kind === 'added' ? 'NEW · ' : ''}${escapeHtml(f.id)}</span>
            <span class="tag__sep">·</span>
            <span style="font-family: var(--font-mono); color: var(--text-tertiary); text-transform: uppercase;">${escapeHtml(f.hunterType)}</span>
            ${purchasing ? `<span class="tag__sep">·</span><span style="color: var(--text-tertiary);">${escapeHtml(purchasing.replace(/_/g, ' '))}</span>` : ''}
          </div>
          <div style="font-size: var(--fs-md); font-weight: 600; color: var(--text-primary);">${escapeHtml(licName)}</div>
          ${base ? `<div style="font-size: var(--fs-xs); color: var(--text-tertiary);">requires base: <strong style="color: var(--text-secondary);">${escapeHtml(base.name)}</strong></div>` : ''}
        </div>
        <div style="font-size: var(--fs-xl); font-weight: 700; color: var(--accent); font-family: var(--font-mono);">$${Number(f.fee).toFixed(2)}</div>
        ${opts.removable ? `
          <button class="btn btn--ghost btn--sm" type="button" data-${opts.removeKind}-remove="${opts.removeKey}" aria-label="Remove" title="Remove">✕</button>
        ` : `
          <span class="edit-row__source" style="color: ${c.label};">${c.tag}</span>
        `}
      </div>
    `;
  }

  function renderAddFeeForm() {
    const f = state.newFee;
    const src = source();
    const licStateCode = src ? src.state : (state.edits.state || '');
    const stateLicenses = licStateCode ? data.licensesForState(licStateCode) : data.LICENSES;
    const groups = {
      otc:       stateLicenses.filter(l => l.purchasingType === 'otc'),
      draw:      stateLicenses.filter(l => l.purchasingType === 'draw'),
      otc_addon: stateLicenses.filter(l => l.purchasingType === 'otc_addon'),
    };
    const groupLabels = { otc: 'OTC', draw: 'Draw (lottery)', otc_addon: 'Addon (requires base)' };
    const pickedLic = data.licenseById(f.licenseId);
    const isAddon = pickedLic && pickedLic.purchasingType === 'otc_addon';
    const baseCandidates = isAddon
      ? stateLicenses.filter(l => l.purchasingType === 'otc' || l.purchasingType === 'draw')
      : [];
    const baseInManager = isAddon && f.baseLicenseId && feesAllLicenseIds().has(f.baseLicenseId);
    const baseHint = pickedLic && pickedLic.requiresLicenseId;

    const renderLicGroup = (key) => {
      if (groups[key].length === 0) return '';
      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-2);">
          <span class="chip-group__label" style="color: var(--text-tertiary);">${escapeHtml(groupLabels[key])}</span>
          <div class="chip-row">
            ${groups[key].map(l => `
              <button class="chip" type="button" aria-pressed="${f.licenseId === l.id}" data-newfee-field="licenseId" data-newfee-value="${l.id}">
                <span>${escapeHtml(l.name)}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    };

    return `
      <div class="add-rule-form" style="background: rgba(99, 102, 241, 0.05); border: 1px solid var(--accent); border-radius: var(--radius-lg); padding: var(--space-5); margin-bottom: var(--space-5); box-shadow: 0 0 30px rgba(99, 102, 241, 0.15);">
        <div class="panel__title" style="margin-bottom: var(--space-4);">
          <strong>New license fee</strong>
          <span>price for one license × hunter type</span>
        </div>

        <div style="display: grid; gap: var(--space-5);">
          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            <span class="chip-group__label">License *</span>
            ${renderLicGroup('otc')}
            ${renderLicGroup('draw')}
            ${renderLicGroup('otc_addon')}
            ${stateLicenses.length === 0 ? `<div style="font-size: var(--fs-xs); color: var(--text-tertiary);">No licenses defined for this state in mock data.</div>` : ''}
          </div>

          ${isAddon ? `
            <div style="background: rgba(245, 158, 11, 0.05); border: 1px dashed rgba(245, 158, 11, 0.4); border-radius: var(--radius-md); padding: var(--space-3) var(--space-4); display: flex; flex-direction: column; gap: var(--space-2);">
              <span class="chip-group__label" style="color: var(--status-cancelled);">Requires base license *</span>
              <div class="chip-row">
                ${baseCandidates.map(l => `
                  <button class="chip" type="button" aria-pressed="${f.baseLicenseId === l.id}" data-newfee-field="baseLicenseId" data-newfee-value="${l.id}" style="${baseHint === l.id ? 'border-color: var(--status-completed);' : ''}">
                    <span>${escapeHtml(l.name)}</span>
                    ${baseHint === l.id ? `<span class="chip__count" style="color: var(--status-completed);">suggested</span>` : ''}
                  </button>
                `).join('')}
              </div>
              ${f.baseLicenseId && !baseInManager ? `
                <div style="font-size: var(--fs-xs); color: var(--status-cancelled);">⚠ Base license has no fee in this manager yet. Add a fee for it first to avoid an orphan addon.</div>
              ` : ''}
            </div>
          ` : ''}

          <div style="display: flex; flex-direction: column; gap: var(--space-2);">
            <span class="chip-group__label">Hunter type *</span>
            <div class="chip-row">
              ${data.HUNTER_TYPES.map(h => `
                <button class="chip" type="button" aria-pressed="${f.hunterType === h}" data-newfee-field="hunterType" data-newfee-value="${h}">${escapeHtml(h.replace(/_/g, ' '))}</button>
              `).join('')}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr auto; gap: var(--space-3); max-width: 360px;">
            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
              <label class="chip-group__label" for="newfee-amount">Fee amount *</label>
              <input class="input" id="newfee-amount" type="number" step="0.01" min="0" data-newfee-text="fee" placeholder="0.00" value="${escapeHtml(f.fee)}" />
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
              <span class="chip-group__label">Currency</span>
              <div class="chip-row">
                ${data.CURRENCIES.map(cur => `
                  <button class="chip" type="button" aria-pressed="${f.currency === cur}" data-newfee-field="currency" data-newfee-value="${cur}">${escapeHtml(cur)}</button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); margin-top: var(--space-5); padding-top: var(--space-4); border-top: 1px solid var(--card-border);">
          <span style="font-size: var(--fs-xs); color: var(--text-tertiary);">${newFeeValid() ? 'Ready to save.' : 'Pick license, hunter type, amount' + (isAddon ? ', and base license' : '') + '.'}</span>
          <div style="display: flex; gap: var(--space-2);">
            <button class="btn btn--ghost" type="button" data-action="cancel-add">Cancel</button>
            <button class="btn btn--primary" type="button" data-action="save-fee" ${newFeeValid() ? '' : 'disabled'}>Save fee</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderRegItem(g, kind, opts = {}) {
    const colors = {
      copied: { bg: 'rgba(245, 158, 11, 0.06)', border: 'rgba(245, 158, 11, 0.20)', label: 'var(--status-cancelled)', tag: 'Copied' },
      added:  { bg: 'rgba(99, 102, 241, 0.08)', border: 'rgba(99, 102, 241, 0.40)', label: 'var(--accent)', tag: 'New' },
    };
    const c = colors[kind];
    return `
      <div style="background: ${c.bg}; border: 1px solid ${c.border}; border-radius: var(--radius-md); padding: var(--space-4); display: grid; grid-template-columns: 1fr auto; gap: var(--space-3); align-items: start;">
        <div style="display: flex; flex-direction: column; gap: var(--space-2); min-width: 0;">
          <div class="tag__head" style="display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;">
            <span style="color: ${c.label};">${kind === 'added' ? 'NEW · ' : ''}${escapeHtml(g.id)}</span>
            ${g.species && g.species.length > 0 ? `
              <span class="tag__sep">·</span>
              ${g.species.map(s => `<span class="manager-card__species-tag" style="font-size: var(--fs-xxs);">${escapeHtml(s)}</span>`).join('')}
            ` : `<span class="tag__sep">·</span><span style="color: var(--text-tertiary); font-style: italic;">all species</span>`}
          </div>
          <div style="font-size: var(--fs-md); font-weight: 600; color: var(--text-primary);">${escapeHtml(g.title)}</div>
          <div style="font-size: var(--fs-sm); color: var(--text-secondary); line-height: 1.5;">${escapeHtml(g.content)}</div>
        </div>
        ${opts.removable ? `
          <button class="btn btn--ghost btn--sm" type="button" data-${opts.removeKind}-remove="${opts.removeKey}" aria-label="Remove" title="Remove">✕</button>
        ` : `
          <span class="edit-row__source" style="color: ${c.label};">${c.tag}</span>
        `}
      </div>
    `;
  }

  function renderEditor() {
    const src = source();
    const isFork = state.mode === 'fork' && src;

    if (state.mode === 'fork' && !src) {
      return `
        <div class="empty">
          <div class="empty__title">Pick a source manager to start</div>
          <div class="empty__body">Once you pick a source, its regulations and rules populate this editable draft. Forked managers may not be complete, so you can remove anything that doesn't belong, edit copies, or add new entries.</div>
        </div>
      `;
    }

    const stateOptions = Object.values(data.STATES).map(s =>
      `<option value="${s.code}" ${(isFork && src.state === s.code) ? 'selected' : ''}>${s.code} · ${s.name}</option>`
    ).join('');

    const sourceRules = activeSourceRules();
    const sourceRegs = activeSourceRegs();
    const sourceFees = activeSourceFees();
    const totalRules = sourceRules.length + state.addedRules.length;
    const totalRegs = sourceRegs.length + state.addedRegs.length;
    const totalFees = sourceFees.length + state.addedFees.length;

    return `
      <div class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <strong>Manager metadata</strong>
            <span>${isFork ? 'forked from ' + src.state + ' · ' + src.name : 'blank start'}</span>
          </div>
          <div class="legend">
            <span><span class="legend__dot legend__dot--copied"></span>Copied</span>
            <span><span class="legend__dot legend__dot--edited"></span>Edited</span>
            <span><span class="legend__dot legend__dot--new"></span>New</span>
          </div>
        </div>

        <div class="edit-row" data-state="${fieldState('name')}">
          <span class="edit-row__label">Manager name</span>
          <input class="edit-row__value" data-field="name" value="${escapeHtml(fieldValue('name', ''))}" placeholder="${isFork ? '' : 'e.g. Northeast Region'}" />
          <span class="edit-row__source">${state.edits.name != null ? 'Edited' : (isFork ? 'Copied' : 'New')}</span>
        </div>

        <div class="edit-row" data-state="${fieldState('state')}">
          <span class="edit-row__label">State</span>
          <select class="edit-row__value" data-field="state">${stateOptions}</select>
          <span class="edit-row__source">${state.edits.state != null ? 'Edited' : (isFork ? 'Copied' : 'New')}</span>
        </div>

        <div class="edit-row" data-state="${fieldState('seasonWindow')}">
          <span class="edit-row__label">Season window</span>
          <input class="edit-row__value" data-field="seasonWindow" value="${escapeHtml(fieldValue('seasonWindow', ''))}" placeholder="e.g. Fall 2026" />
          <span class="edit-row__source">${state.edits.seasonWindow != null ? 'Edited' : (isFork ? 'Copied' : 'New')}</span>
        </div>

        <div class="edit-row" data-state="${fieldState('species')}">
          <span class="edit-row__label">Species</span>
          <input class="edit-row__value" data-field="species" value="${escapeHtml(fieldValue('species', ''))}" placeholder="e.g. Bear, Turkey" />
          <span class="edit-row__source">${state.edits.species != null ? 'Edited' : (isFork ? 'Copied' : 'New')}</span>
        </div>
      </div>

      <div class="panel" style="margin-top:var(--space-5);">
        <div class="panel__head">
          <div class="panel__title">
            <strong>General regulations</strong>
            <span>${totalRegs} total · broad policies, not season-specific</span>
          </div>
          ${state.adding === 'reg'
            ? `<button class="btn btn--ghost btn--sm" type="button" data-action="cancel-add">Close form</button>`
            : `<button class="btn btn--primary btn--sm" type="button" data-action="open-add-reg" ${state.adding ? 'disabled' : ''}>+ Add regulation</button>`}
        </div>

        ${state.adding === 'reg' ? renderAddRegForm() : ''}

        ${totalRegs === 0 ? `
          <div class="empty" style="margin:0;">
            <div class="empty__title">No regulations yet</div>
            <div class="empty__body">Regulations are broad policies (e.g. "Hunter education required") that apply across the manager, independent of season. Add them with the button above.</div>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${state.addedRegs.map((g, i) => renderRegItem(g, 'added', { removable: true, removeKind: 'added-reg', removeKey: i })).join('')}
            ${sourceRegs.map(g => renderRegItem(g, 'copied', { removable: true, removeKind: 'src-reg', removeKey: g.id })).join('')}
          </div>
        `}
      </div>

      <div class="panel" style="margin-top:var(--space-5);">
        <div class="panel__head">
          <div class="panel__title">
            <strong>Hunt rules</strong>
            <span>${totalRules} total · season + species specific</span>
          </div>
          ${state.adding === 'rule'
            ? `<button class="btn btn--ghost btn--sm" type="button" data-action="cancel-add">Close form</button>`
            : `<button class="btn btn--primary btn--sm" type="button" data-action="open-add-rule" ${state.adding ? 'disabled' : ''}>+ Add rule</button>`}
        </div>

        ${state.adding === 'rule' ? renderAddRuleForm() : ''}

        ${totalRules === 0 ? `
          <div class="empty" style="margin:0;">
            <div class="empty__title">No rules yet</div>
            <div class="empty__body">Hunt rules are specific to a season and species. Each carries species, season type, optional dates, optional bag limit, sex, weapon categories, and a summary.</div>
          </div>
        ` : `
          <div class="tag-stack">
            ${state.addedRules.map((r, i) => renderRuleTag(r, 'added', { removable: true, removeKind: 'added-rule', removeKey: i })).join('')}
            ${sourceRules.slice(0, 12).map(r => renderRuleTag(r, 'copied', { removable: true, removeKind: 'src-rule', removeKey: r.id })).join('')}
            ${sourceRules.length > 12 ? `<div style="text-align:center; color:var(--text-tertiary); font-size:var(--fs-xs); padding:var(--space-3);">${sourceRules.length - 12} more rules below · prototype shows first 12</div>` : ''}
          </div>
        `}
      </div>
    `;
  }

  function render(params) {
    if (params && params.get) {
      const m = params.get('mode');
      if (m && (m === 'fork' || m === 'blank')) state.mode = m;
    }

    const root = document.getElementById('view-create');
    root.innerHTML = `
      <div class="view-header">
        <div class="view-header__intro">
          <span class="view-eyebrow">02 · Curate</span>
          <h1>Build a <span class="highlight">ground truth</span> document</h1>
          <p class="view-lede">Hand corrected reference document. Includes general regulations (broad policies) and hunt rules (season + species specific). Forked sources can be trimmed, edited, or extended.</p>
        </div>
        <div style="display:flex; gap:var(--space-2);">
          <button class="btn btn--ghost" data-action="cancel">Cancel</button>
          <button class="btn btn--primary" data-action="save" ${state.mode === 'fork' && !state.sourceId ? 'disabled' : ''}>Save as ground truth</button>
        </div>
      </div>

      ${renderModeTabs()}
      ${state.mode === 'fork' ? renderForkPicker() + '<div style="height:var(--space-5);"></div>' : ''}
      ${renderEditor()}
    `;

    setupOutsideClickOnce();

    root.querySelectorAll('.mode-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        state.mode = tab.dataset.mode;
        state.sourceId = null;
        state.query = '';
        state.edits = {};
        state.removedRuleIds = new Set();
        state.removedRegIds = new Set();
        state.removedFeeIds = new Set();
        state.addedRules = [];
        state.addedRegs = [];
        state.addedFees = [];
        state.adding = null;
        render();
      });
    });

    const input = root.querySelector('#create-source-input');
    if (input) {
      const combo = input.closest('.combobox');
      input.addEventListener('focus', () => combo && combo.classList.add('combobox--open'));
      input.addEventListener('input', e => {
        state.query = e.target.value;
        state.sourceId = null;
        const list = combo?.querySelector('.combobox__list');
        if (list) {
          const items = comboList();
          list.innerHTML = items.length === 0
            ? `<div style="padding:var(--space-5); color:var(--text-tertiary); font-size:var(--fs-sm);">No managers match.</div>`
            : items.map(m => `
                <button class="combobox__item" type="button" data-id="${m.id}" role="option">
                  <span class="combobox__item-seal">${m.state}</span>
                  <span>
                    <span class="combobox__item-name">${escapeHtml(m.name)}</span>
                    <div class="combobox__item-meta">${m.regulationCount} regulations · ${m.ruleCount} rules · ${m.species.join(', ')}</div>
                  </span>
                  ${m.isGroundTruth ? `<span class="manager-card__truth-flag">Ground truth</span>` : ''}
                </button>
              `).join('');
          attachComboItemHandlers(list);
        }
        if (combo) combo.classList.add('combobox--open');
      });
    }

    function attachComboItemHandlers(scope) {
      scope.querySelectorAll('.combobox__item').forEach(btn => {
        btn.addEventListener('mousedown', e => e.preventDefault());
        btn.addEventListener('click', () => {
          state.sourceId = btn.dataset.id;
          state.query = '';
          state.edits = {};
          state.removedRuleIds = new Set();
          state.removedRegIds = new Set();
          state.addedRules = [];
          state.addedRegs = [];
          render();
        });
      });
    }
    if (input) attachComboItemHandlers(root);

    // Manager metadata edits
    root.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('input', e => {
        state.edits[el.dataset.field] = e.target.value;
        const row = el.closest('.edit-row');
        if (row) row.dataset.state = 'edited';
        const sourceLabel = row?.querySelector('.edit-row__source');
        if (sourceLabel) sourceLabel.textContent = 'Edited';
      });
    });

    // New-rule single-select chip toggles (species / ruleType / seasonType)
    root.querySelectorAll('[data-newrule-field][data-newrule-value]').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.newruleField;
        const v = btn.dataset.newruleValue;
        state.newRule[f] = state.newRule[f] === v ? '' : v;
        render();
      });
    });

    // New-rule multi-select chip toggles (sexes / weaponCategories)
    root.querySelectorAll('[data-newrule-multi-field]').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.newruleMultiField;
        const v = btn.dataset.newruleMultiValue;
        const list = state.newRule[f] || [];
        state.newRule[f] = list.includes(v) ? list.filter(x => x !== v) : [...list, v];
        if (f === 'weaponCategories' && !state.newRule[f].includes(v)) {
          delete state.newRule.weaponSpecs?.[v];
        }
        render();
      });
    });

    // Weapon spec chips (typed sub-form)
    root.querySelectorAll('[data-spec-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.specCat;
        const key = btn.dataset.specKey;
        const val = btn.dataset.specValue;
        if (!state.newRule.weaponSpecs[cat]) state.newRule.weaponSpecs[cat] = {};
        const cur = state.newRule.weaponSpecs[cat][key] || [];
        state.newRule.weaponSpecs[cat][key] = cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val];
        render();
      });
    });

    // New-rule text inputs
    root.querySelectorAll('[data-newrule-text]').forEach(el => {
      el.addEventListener('input', e => {
        state.newRule[el.dataset.newruleText] = e.target.value;
        const saveBtn = root.querySelector('[data-action="save-rule"]');
        if (saveBtn) {
          if (newRuleValid()) saveBtn.removeAttribute('disabled');
          else saveBtn.setAttribute('disabled', '');
        }
      });
      if (el.type === 'date') {
        el.addEventListener('change', () => render());
      }
    });

    // Section toggles (progressive disclosure)
    root.querySelectorAll('[data-section-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.sectionToggle;
        if (state.expandedSections.has(k)) state.expandedSections.delete(k);
        else state.expandedSections.add(k);
        render();
      });
    });

    // List editors (limits / requirements / eligibility)
    root.querySelectorAll('[data-list-add]').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.listAdd;
        const list = state.newRule[f] || [];
        const blank = f === 'limits' ? { title: '', content: '' } : { label: '', content: '' };
        state.newRule[f] = [...list, blank];
        render();
        requestAnimationFrame(() => {
          const inputs = root.querySelectorAll(`[data-list-field="${f}"]`);
          if (inputs.length > 0) inputs[inputs.length - 2]?.focus(); // focus the new row label
        });
      });
    });

    root.querySelectorAll('[data-list-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.listRemove;
        const i = Number(btn.dataset.listIndex);
        const list = state.newRule[f] || [];
        state.newRule[f] = list.filter((_, idx) => idx !== i);
        render();
      });
    });

    root.querySelectorAll('[data-list-field]').forEach(el => {
      el.addEventListener('input', e => {
        const f = el.dataset.listField;
        const i = Number(el.dataset.listIndex);
        const k = el.dataset.listKey;
        const list = state.newRule[f] || [];
        if (list[i]) list[i][k] = e.target.value;
      });
    });

    // String list (categories): Enter to add, X to remove
    root.querySelectorAll('[data-strlist-add]').forEach(el => {
      el.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const v = e.target.value.trim();
        if (!v) return;
        const f = el.dataset.strlistAdd;
        state.newRule[f] = [...(state.newRule[f] || []), v];
        e.target.value = '';
        render();
      });
    });

    root.querySelectorAll('[data-strlist-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.strlistRemove;
        const i = Number(btn.dataset.strlistIndex);
        const list = state.newRule[f] || [];
        state.newRule[f] = list.filter((_, idx) => idx !== i);
        render();
      });
    });

    // New-reg species scope radio
    root.querySelectorAll('[data-newreg-scope]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.newReg.speciesScope = btn.dataset.newregScope;
        if (state.newReg.speciesScope === 'all') state.newReg.species = [];
        render();
      });
    });

    // New-reg chip toggles (multi)
    root.querySelectorAll('[data-newreg-multi-field]').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.newregMultiField;
        const v = btn.dataset.newregMultiValue;
        const list = state.newReg[f] || [];
        state.newReg[f] = list.includes(v) ? list.filter(x => x !== v) : [...list, v];
        render();
      });
    });

    // New-reg text inputs
    root.querySelectorAll('[data-newreg-text]').forEach(el => {
      el.addEventListener('input', e => {
        state.newReg[el.dataset.newregText] = e.target.value;
        const saveBtn = root.querySelector('[data-action="save-reg"]');
        if (saveBtn) {
          if (newRegValid()) saveBtn.removeAttribute('disabled');
          else saveBtn.setAttribute('disabled', '');
        }
      });
    });

    // Removals
    root.querySelectorAll('[data-src-rule-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.removedRuleIds.add(btn.dataset.srcRuleRemove);
        render();
      });
    });
    root.querySelectorAll('[data-added-rule-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.addedRules.splice(Number(btn.dataset.addedRuleRemove), 1);
        render();
      });
    });
    root.querySelectorAll('[data-src-reg-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.removedRegIds.add(btn.dataset.srcRegRemove);
        render();
      });
    });
    root.querySelectorAll('[data-added-reg-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.addedRegs.splice(Number(btn.dataset.addedRegRemove), 1);
        render();
      });
    });
    root.querySelectorAll('[data-src-fee-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.removedFeeIds.add(btn.dataset.srcFeeRemove);
        render();
      });
    });
    root.querySelectorAll('[data-added-fee-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.addedFees.splice(Number(btn.dataset.addedFeeRemove), 1);
        render();
      });
    });

    // New-fee chip toggles
    root.querySelectorAll('[data-newfee-field][data-newfee-value]').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.newfeeField;
        const v = btn.dataset.newfeeValue;
        state.newFee[f] = state.newFee[f] === v ? '' : v;
        if (f === 'licenseId') {
          const lic = data.licenseById(state.newFee.licenseId);
          if (lic && lic.purchasingType === 'otc_addon' && lic.requiresLicenseId) {
            state.newFee.baseLicenseId = lic.requiresLicenseId;
          } else {
            state.newFee.baseLicenseId = '';
          }
        }
        render();
      });
    });

    // New-fee text inputs
    root.querySelectorAll('[data-newfee-text]').forEach(el => {
      el.addEventListener('input', e => {
        state.newFee[el.dataset.newfeeText] = e.target.value;
        const saveBtn = root.querySelector('[data-action="save-fee"]');
        if (saveBtn) {
          if (newFeeValid()) saveBtn.removeAttribute('disabled');
          else saveBtn.setAttribute('disabled', '');
        }
      });
    });

    // Top-level actions
    root.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'cancel') router.navigate('library');
        if (action === 'save') {
          alert('Mock prototype: would persist ground truth manager and return to Truth Library.');
          router.navigate('library');
        }
        if (action === 'clear-source') {
          state.sourceId = null;
          state.query = '';
          state.edits = {};
          state.removedRuleIds = new Set();
          state.removedRegIds = new Set();
          state.addedRules = [];
          state.addedRegs = [];
          render();
          requestAnimationFrame(() => root.querySelector('#create-source-input')?.focus());
        }
        if (action === 'open-add-rule') {
          state.adding = 'rule';
          state.newRule = emptyRule();
          render();
          requestAnimationFrame(() => root.querySelector('#newrule-summary')?.focus());
        }
        if (action === 'open-add-reg') {
          state.adding = 'reg';
          state.newReg = emptyReg();
          render();
          requestAnimationFrame(() => root.querySelector('#newreg-title')?.focus());
        }
        if (action === 'open-add-fee') {
          state.adding = 'fee';
          state.newFee = emptyFee();
          render();
        }
        if (action === 'cancel-add') {
          state.adding = null;
          state.newRule = emptyRule();
          state.newReg = emptyReg();
          state.newFee = emptyFee();
          render();
        }
        if (action === 'save-rule') {
          if (!newRuleValid()) return;
          const r = state.newRule;
          const id = 'r-new-' + String(state.addedRules.length + 1).padStart(3, '0');
          state.addedRules.unshift({
            id,
            species: r.species,
            ruleType: r.ruleType,
            seasonType: r.seasonType,
            legalLabel: r.legalLabel.trim(),
            huntCode: r.huntCode.trim(),
            publicLand: r.publicLand.trim(),
            notes: r.notes.trim(),
            sexes: [...r.sexes],
            categories: [...r.categories],
            weaponCategories: [...r.weaponCategories],
            weaponSpecs: JSON.parse(JSON.stringify(r.weaponSpecs || {})),
            equipment: r.equipment.trim(),
            schedule: r.schedule.trim(),
            startDate: r.startDate,
            endDate: r.endDate,
            dateDescription: r.dateDescription.trim(),
            summary: r.summary.trim(),
            limits: r.limits.filter(x => x.title || x.content).map(x => ({ title: x.title.trim(), content: x.content.trim() })),
            requirements: r.requirements.filter(x => x.label || x.content).map(x => ({ label: x.label.trim(), content: x.content.trim() })),
            eligibility: r.eligibility.filter(x => x.label || x.content).map(x => ({ label: x.label.trim(), content: x.content.trim() })),
          });
          state.adding = null;
          state.newRule = emptyRule();
          state.expandedSections = new Set();
          render();
        }
        if (action === 'save-reg') {
          if (!newRegValid()) return;
          const g = state.newReg;
          const id = 'g-new-' + String(state.addedRegs.length + 1).padStart(3, '0');
          state.addedRegs.unshift({
            id,
            title: g.title.trim(),
            content: g.content.trim(),
            species: g.speciesScope === 'all' ? [] : [...g.species],
            iconSource: g.iconSource.trim(),
          });
          state.adding = null;
          state.newReg = emptyReg();
          render();
        }
        if (action === 'save-fee') {
          if (!newFeeValid()) return;
          const f = state.newFee;
          const id = 'lf-new-' + String(state.addedFees.length + 1).padStart(3, '0');
          state.addedFees.unshift({
            id,
            licenseId: f.licenseId,
            baseLicenseId: f.baseLicenseId || null,
            hunterType: f.hunterType,
            fee: parseFloat(f.fee),
            currency: f.currency || 'USD',
          });
          state.adding = null;
          state.newFee = emptyFee();
          render();
        }
      });
    });
  }

  window.Scorer.router.register('create', render);
})();
