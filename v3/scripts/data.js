window.Scorer = window.Scorer || {};

window.Scorer.data = (() => {
  const STATES = {
    PA: { code: 'PA', name: 'Pennsylvania' },
    MN: { code: 'MN', name: 'Minnesota' },
    TX: { code: 'TX', name: 'Texas' },
    SD: { code: 'SD', name: 'South Dakota' },
    MT: { code: 'MT', name: 'Montana' },
  };

  const SPECIES = ['Bear', 'Turkey'];

  const MANAGERS = [
    {
      id: 'pa-ne',
      name: 'Pennsylvania Bear & Turkey',
      state: 'PA',
      seasonWindow: 'Fall 2026',
      species: ['Bear', 'Turkey'],
      isGroundTruth: true,
      regulationCount: 14,
      ruleCount: 20,
      lastCuratedAt: '2026-04-22',
      curatedBy: 'Rafael Flores',
      lastUsedAt: '2026-05-04',
    },
    {
      id: 'mn-z2',
      name: 'Minnesota Bear & Turkey',
      state: 'MN',
      seasonWindow: 'Fall 2026',
      species: ['Bear', 'Turkey'],
      isGroundTruth: true,
      regulationCount: 9,
      ruleCount: 12,
      lastCuratedAt: '2026-04-15',
      curatedBy: 'Nicolas Rivera',
      lastUsedAt: '2026-04-30',
    },
    {
      id: 'tx-south',
      name: 'Texas Turkey',
      state: 'TX',
      seasonWindow: 'Spring 2026',
      species: ['Turkey'],
      isGroundTruth: true,
      regulationCount: 11,
      ruleCount: 8,
      lastCuratedAt: '2026-03-30',
      curatedBy: 'Rafael Flores',
      lastUsedAt: '2026-04-12',
    },
    {
      id: 'sd-bh',
      name: 'South Dakota Bear & Turkey',
      state: 'SD',
      seasonWindow: 'Fall 2026',
      species: ['Bear', 'Turkey'],
      isGroundTruth: true,
      regulationCount: 7,
      ruleCount: 6,
      lastCuratedAt: '2026-04-29',
      curatedBy: 'Nicolas Rivera',
      lastUsedAt: '2026-05-02',
    },
    {
      id: 'mt-d2',
      name: 'Montana Bear',
      state: 'MT',
      seasonWindow: 'Fall 2026',
      species: ['Bear'],
      isGroundTruth: false,
      regulationCount: 8,
      ruleCount: 5,
      lastCuratedAt: '2026-04-01',
      curatedBy: null,
      lastUsedAt: null,
    },
  ];

  const RULE_TYPES = [
    'Bag Limit',
    'Season Dates',
    'Weapon Restriction',
    'License Required',
    'Antler / Sex Restriction',
    'Hunter Education',
    'Reporting',
    'Tag Requirement',
    'Hours of Take',
    'Method of Take',
  ];

  const SEASON_TYPES = ['Archery', 'Firearm', 'Muzzleloader', 'General'];
  const SEX_TYPES = ['MALE', 'FEMALE', 'EITHER'];
  const WEAPON_CATEGORIES = ['Archery', 'Crossbow', 'Shotgun', 'Rifle', 'Muzzleloader', 'Handgun'];
  const HUNTER_TYPES = ['resident', 'non_resident', 'youth', 'senior'];
  const CURRENCIES = ['USD'];

  const LICENSES = [
    { id: 'lic-pa-gen',    stateCode: 'PA', name: 'General Hunting License', purchasingType: 'otc' },
    { id: 'lic-pa-bear',   stateCode: 'PA', name: 'Bear License',           purchasingType: 'otc' },
    { id: 'lic-pa-turkey', stateCode: 'PA', name: 'Turkey License',         purchasingType: 'otc' },
    { id: 'lic-pa-arch',   stateCode: 'PA', name: 'Archery Stamp',          purchasingType: 'otc_addon', requiresLicenseId: 'lic-pa-gen' },
    { id: 'lic-mn-gen',    stateCode: 'MN', name: 'Small Game License',     purchasingType: 'otc' },
    { id: 'lic-mn-bear',   stateCode: 'MN', name: 'Bear License',           purchasingType: 'otc' },
    { id: 'lic-mn-turkey', stateCode: 'MN', name: 'Turkey Permit',          purchasingType: 'draw' },
    { id: 'lic-tx-gen',    stateCode: 'TX', name: 'Hunting License',        purchasingType: 'otc' },
    { id: 'lic-tx-turkey', stateCode: 'TX', name: 'Turkey Stamp',           purchasingType: 'otc_addon', requiresLicenseId: 'lic-tx-gen' },
    { id: 'lic-sd-bear',   stateCode: 'SD', name: 'Black Hills Bear Tag',   purchasingType: 'draw' },
  ];

  const LOCATIONS = [
    { id: 'loc-pa', stateCode: 'PA', name: 'Pennsylvania', type: 'STATE',   parentId: null },
    { id: 'loc-pa-ne', stateCode: 'PA', name: 'Northeast Region', type: 'REGION', parentId: 'loc-pa' },
    { id: 'loc-pa-z2', stateCode: 'PA', name: 'WMU 2A', type: 'WMU', parentId: 'loc-pa-ne' },
    { id: 'loc-pa-z3', stateCode: 'PA', name: 'WMU 2B', type: 'WMU', parentId: 'loc-pa-ne' },
    { id: 'loc-pa-z4', stateCode: 'PA', name: 'WMU 2C', type: 'WMU', parentId: 'loc-pa-ne' },
    { id: 'loc-pa-wma1', stateCode: 'PA', name: 'State Game Lands 045', type: 'WMA', parentId: 'loc-pa-z2' },
    { id: 'loc-pa-wma2', stateCode: 'PA', name: 'State Game Lands 057', type: 'WMA', parentId: 'loc-pa-z3' },
    { id: 'loc-mn', stateCode: 'MN', name: 'Minnesota', type: 'STATE', parentId: null },
    { id: 'loc-mn-z2', stateCode: 'MN', name: 'Zone 2 Northwest', type: 'ZONE', parentId: 'loc-mn' },
    { id: 'loc-mn-z2-1', stateCode: 'MN', name: 'Permit Area 12', type: 'PERMIT_AREA', parentId: 'loc-mn-z2' },
  ];

  const WEAPON_SPECS_SCHEMA = {
    'Shotgun':     { gauge: ['10', '12', '20', '28', '.410'], shot_size: ['BB', '2', '4', '6', '7.5', '8'], choke: ['cylinder', 'modified', 'full'] },
    'Rifle':       { caliber: ['.22', '.243', '.270', '.308', '.30-06', '.300 Win Mag'], action: ['bolt', 'lever', 'semi-auto'] },
    'Archery':     { draw_weight_min: ['35 lbs', '40 lbs', '45 lbs', '50 lbs'], type: ['compound', 'recurve', 'longbow'] },
    'Crossbow':    { draw_weight_min: ['100 lbs', '125 lbs', '150 lbs'], cocking: ['hand', 'crank', 'rope'] },
    'Muzzleloader':{ caliber: ['.40', '.45', '.50', '.54'], ignition: ['flintlock', 'percussion', 'in-line'] },
    'Handgun':     { caliber: ['.357', '.44 Mag', '10mm'], action: ['revolver', 'semi-auto'] },
  };

  const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const WEEKS_OF_MONTH = ['1st', '2nd', '3rd', '4th', '5th'];

  const ELIGIBILITY_CATEGORIES = [
    { id: 'elig-youth',     name: 'Youth',     description: 'Under 18, supervision required' },
    { id: 'elig-senior',    name: 'Senior',    description: 'Age 65+' },
    { id: 'elig-mentored',  name: 'Mentored',  description: 'New hunter under licensed mentor' },
    { id: 'elig-resident',  name: 'Resident',  description: 'State resident' },
    { id: 'elig-disabled',  name: 'Disabled',  description: 'Permit for disabled hunters' },
  ];

  let ruleCounter = 1;
  const rule = (managerId, partial) => ({
    id: 'r-' + String(ruleCounter++).padStart(4, '0'),
    managerId,
    species: '',
    ruleType: '',
    seasonType: '',
    legalLabel: '',
    huntCode: '',
    sex: 'EITHER',
    bagLimit: '',
    startDate: '',
    endDate: '',
    summary: '',
    weaponCategories: [],
    ...partial,
  });

  let regCounter = 1;
  const reg = (managerId, partial) => ({
    id: 'g-' + String(regCounter++).padStart(4, '0'),
    managerId,
    title: '',
    content: '',
    species: [],
    ...partial,
  });

  const REGULATIONS = [
    reg('pa-ne', { title: 'Hunter Education Required', content: 'All first time license buyers must complete a hunter education course before purchasing a hunting license.', species: [] }),
    reg('pa-ne', { title: 'Harvest Reporting', content: 'Successful hunters must report their harvest within 24 hours via the PGC online portal or by phone.', species: ['Bear', 'Turkey'] }),
    reg('pa-ne', { title: 'Tag Carriage', content: 'Hunters must carry their bear or turkey tag with them at all times during the season.', species: ['Bear', 'Turkey'] }),
    reg('pa-ne', { title: 'Sunday Hunting', content: 'Sunday hunting is permitted on three Sundays only: November 16, November 23, and November 30, 2026.', species: [] }),
    reg('pa-ne', { title: 'Fluorescent Orange', content: '250 sq inches of fluorescent orange required during firearm bear and big game seasons.', species: ['Bear'] }),
    reg('pa-ne', { title: 'Crossbow Permit', content: 'Crossbow use during archery seasons requires a separate permit issued by PGC.', species: ['Bear', 'Turkey'] }),
    reg('pa-ne', { title: 'Drone Use Prohibited', content: 'Use of drones to scout, locate, or pursue game is prohibited during all hunting seasons.', species: [] }),
    reg('mn-z2', { title: 'Hunter Education', content: 'Hunter education certification required for hunters born after December 31, 1979.', species: [] }),
    reg('mn-z2', { title: 'Bear Bait Site Registration', content: 'Bait sites must be registered with DNR and posted with hunter name and license number.', species: ['Bear'] }),
    reg('tx-south', { title: 'Public Hunting Permit', content: 'A Public Hunting Permit is required to hunt on TPWD wildlife management areas.', species: [] }),
    reg('sd-bh', { title: 'Hunter Safety', content: 'Hunters under 16 must be accompanied by a licensed adult.', species: [] }),
    reg('mt-d2', { title: 'Bear Identification Test', content: 'All black bear hunters must pass an online bear identification test before the season.', species: ['Bear'] }),
  ];

  const RULES_PA = [
    rule('pa-ne', { species: 'Bear', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'One bear per year', huntCode: 'B-GEN-001', bagLimit: '1 bear', summary: 'One bear per license year, statewide' }),
    rule('pa-ne', { species: 'Bear', ruleType: 'Season Dates', seasonType: 'Archery', legalLabel: 'Archery bear', huntCode: 'B-ARC-101', startDate: '2026-10-18', endDate: '2026-11-01', weaponCategories: ['Archery', 'Crossbow'], summary: 'Archery bear: Oct 18 to Nov 1, 2026' }),
    rule('pa-ne', { species: 'Bear', ruleType: 'Season Dates', seasonType: 'Firearm', legalLabel: 'Firearm bear', huntCode: 'B-FIR-201', startDate: '2026-11-22', endDate: '2026-11-25', weaponCategories: ['Rifle', 'Shotgun'], summary: 'Firearm bear: Nov 22 to Nov 25, 2026' }),
    rule('pa-ne', { species: 'Bear', ruleType: 'Season Dates', seasonType: 'Muzzleloader', legalLabel: 'Muzzleloader bear', huntCode: 'B-MUZ-301', startDate: '2026-10-18', endDate: '2026-10-25', weaponCategories: ['Muzzleloader'], summary: 'Muzzleloader bear: Oct 18 to Oct 25, 2026' }),
    rule('pa-ne', { species: 'Bear', ruleType: 'Antler / Sex Restriction', seasonType: 'General', legalLabel: 'No cubs', sex: 'EITHER', summary: 'No cubs less than 50 lbs, no sows with cubs' }),
    rule('pa-ne', { species: 'Bear', ruleType: 'Method of Take', seasonType: 'General', legalLabel: 'No baiting', summary: 'Baiting prohibited statewide' }),
    rule('pa-ne', { species: 'Bear', ruleType: 'Hours of Take', seasonType: 'General', legalLabel: 'Daylight only', summary: 'One half hour before sunrise to one half hour after sunset' }),
    rule('pa-ne', { species: 'Bear', ruleType: 'License Required', seasonType: 'General', legalLabel: 'Bear license', summary: 'Bear license tag required in addition to general license' }),
    rule('pa-ne', { species: 'Turkey', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'Two bearded', sex: 'MALE', bagLimit: '2 bearded turkeys, 1 per day', summary: 'Two bearded turkeys, only one per day' }),
    rule('pa-ne', { species: 'Turkey', ruleType: 'Season Dates', seasonType: 'General', legalLabel: 'Spring gobbler', huntCode: 'T-SPR-101', sex: 'MALE', startDate: '2026-05-02', endDate: '2026-05-30', summary: 'Spring gobbler: May 2 to May 30, 2026' }),
    rule('pa-ne', { species: 'Turkey', ruleType: 'Season Dates', seasonType: 'General', legalLabel: 'Fall turkey', huntCode: 'T-FAL-201', startDate: '2026-10-31', endDate: '2026-11-13', summary: 'Fall turkey: Oct 31 to Nov 13, 2026' }),
    rule('pa-ne', { species: 'Turkey', ruleType: 'Weapon Restriction', seasonType: 'Archery', legalLabel: 'Archery legal', weaponCategories: ['Archery', 'Crossbow'], summary: 'Archery and crossbow legal during all turkey seasons' }),
    rule('pa-ne', { species: 'Turkey', ruleType: 'Weapon Restriction', seasonType: 'Firearm', legalLabel: 'Shot size 4 to 8', weaponCategories: ['Shotgun'], summary: 'Shotgun shot size 4 to 8, no rifled slugs' }),
    rule('pa-ne', { species: 'Turkey', ruleType: 'Method of Take', seasonType: 'General', legalLabel: 'No dogs in spring', summary: 'Use of dogs prohibited in spring season' }),
    rule('pa-ne', { species: 'Turkey', ruleType: 'Hours of Take', seasonType: 'General', legalLabel: 'Half day spring', summary: 'One half hour before sunrise until 12:00 PM during spring season' }),
  ];

  const RULES_MN = [
    rule('mn-z2', { species: 'Bear', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'One bear per license', bagLimit: '1 bear', summary: 'One bear per license, no quota in Zone 2' }),
    rule('mn-z2', { species: 'Bear', ruleType: 'Season Dates', seasonType: 'General', legalLabel: 'Bear season', huntCode: 'B-GEN-MN2', startDate: '2026-09-01', endDate: '2026-10-18', summary: 'Bear: Sep 1 to Oct 18, 2026' }),
    rule('mn-z2', { species: 'Bear', ruleType: 'Method of Take', seasonType: 'General', legalLabel: 'Baiting allowed', summary: 'Baiting allowed with restrictions on container size' }),
    rule('mn-z2', { species: 'Turkey', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'Two bearded', sex: 'MALE', bagLimit: '2 bearded', summary: 'Two bearded turkeys per spring season' }),
    rule('mn-z2', { species: 'Turkey', ruleType: 'Season Dates', seasonType: 'General', legalLabel: 'Spring turkey', huntCode: 'T-SPR-MN2', sex: 'MALE', startDate: '2026-04-15', endDate: '2026-05-31', summary: 'Spring turkey: Apr 15 to May 31, 2026' }),
  ];

  const RULES_TX = [
    rule('tx-south', { species: 'Turkey', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'Four gobblers', sex: 'MALE', bagLimit: '4 gobblers', summary: 'Four turkey gobblers per fall season' }),
    rule('tx-south', { species: 'Turkey', ruleType: 'Season Dates', seasonType: 'General', legalLabel: 'Fall turkey TX', huntCode: 'T-FAL-TX1', startDate: '2026-11-01', endDate: '2027-01-04', summary: 'Fall turkey: Nov 1 to Jan 4, 2027' }),
  ];

  const RULES_SD = [
    rule('sd-bh', { species: 'Bear', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'One black bear', bagLimit: '1 bear', summary: 'One black bear per license year' }),
    rule('sd-bh', { species: 'Turkey', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'One bearded', sex: 'MALE', bagLimit: '1 bearded', summary: 'One bearded turkey, additional units by tag' }),
  ];

  const RULES_MT = [
    rule('mt-d2', { species: 'Bear', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'One black bear', bagLimit: '1 bear', summary: 'One black bear per license year' }),
    rule('mt-d2', { species: 'Bear', ruleType: 'Season Dates', seasonType: 'General', legalLabel: 'Spring bear', huntCode: 'B-SPR-MT2', startDate: '2026-04-15', endDate: '2026-06-15', summary: 'Spring bear: Apr 15 to Jun 15, 2026' }),
  ];

  const ALL_RULES = [...RULES_PA, ...RULES_MN, ...RULES_TX, ...RULES_SD, ...RULES_MT];
  const ALL_REGS = REGULATIONS;

  let feeCounter = 1;
  const fee = (managerId, licenseId, hunterType, amount) => ({
    id: 'lf-' + String(feeCounter++).padStart(4, '0'),
    managerId, licenseId, hunterType, fee: amount, currency: 'USD',
  });

  const LICENSE_FEES = [
    fee('pa-ne', 'lic-pa-gen', 'resident', 20.97),
    fee('pa-ne', 'lic-pa-gen', 'non_resident', 101.97),
    fee('pa-ne', 'lic-pa-bear', 'resident', 16.97),
    fee('pa-ne', 'lic-pa-bear', 'non_resident', 36.97),
    fee('pa-ne', 'lic-pa-turkey', 'resident', 11.97),
    fee('pa-ne', 'lic-pa-turkey', 'non_resident', 21.97),
    fee('pa-ne', 'lic-pa-arch', 'resident', 16.97),
    fee('mn-z2', 'lic-mn-bear', 'resident', 44.00),
    fee('mn-z2', 'lic-mn-bear', 'non_resident', 230.00),
    fee('mn-z2', 'lic-mn-turkey', 'resident', 26.00),
    fee('tx-south', 'lic-tx-turkey', 'resident', 7.00),
    fee('sd-bh', 'lic-sd-bear', 'resident', 30.00),
  ];

  const SAMPLE_INPUT_JSON = `{
  "manager": "Northeast Region",
  "state": "PA",
  "extracted_at": "2026-05-05T10:14:22Z",
  "model": "gemini-2.0-pro",
  "rules": [
    {"species": "Bear", "type": "Bag Limit", "summary": "One bear per license year, statewide"},
    {"species": "Bear", "type": "Season Dates", "summary": "Archery bear: Oct 18 to Nov 1, 2026"},
    {"species": "Bear", "type": "Season Dates", "summary": "Firearm bear: Nov 22 to Nov 25, 2026"},
    {"species": "Bear", "type": "Method of Take", "summary": "Baiting prohibited statewide"},
    {"species": "Bear", "type": "Hours of Take", "summary": "One half hour before sunrise to one half hour after sunset"},
    {"species": "Bear", "type": "License Required", "summary": "Bear license tag required in addition to general license"},
    {"species": "Bear", "type": "Hide Submission", "summary": "Hide and skull surrender required at check station"},
    {"species": "Bear", "type": "Drone Use", "summary": "Drones permitted for scouting up to 48 hours pre-season"}
  ]
}`;

  const SAMPLE_REPORT = {
    id: 'vrun-pa-ne-12',
    managerId: 'pa-ne',
    referenceLabel: 'PA Bear & Turkey · ground truth',
    candidateLabel: 'extraction-2026-05-05.json',
    inputFormat: 'json',
    inputPreview: SAMPLE_INPUT_JSON,
    scope: {
      label: 'Bear rules only',
      species: ['Bear'],
      regulationCount: 24,
      ruleCount: 12,
    },
    ranAt: '2026-05-05T14:32:00Z',
    ranBy: 'jim@onx',
    score: 0.55,
    phases: [
      {
        name: 'count_and_match',
        label: 'Count and match',
        status: 'completed',
        durationMs: 84,
        summary: 'Matched 8 by direct name, 4 leftovers passed to reconciliation',
        kind: 'deterministic',
      },
      {
        name: 'reconcile_names',
        label: 'Reconcile names',
        status: 'completed',
        durationMs: 3120,
        summary: 'LLM resolved 2 typos / alt-names; 2 remained unresolved (added to extra)',
        kind: 'llm',
      },
      {
        name: 'field_and_report',
        label: 'Field and report',
        status: 'completed',
        durationMs: 47,
        summary: '10 correct, 2 missing, 2 extra; final accuracy 55%',
        kind: 'deterministic',
      },
    ],
    buckets: {
      correct: [
        { id: 'r-0001', species: 'Bear', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'One bear per year', huntCode: 'B-GEN-001', summary: 'One bear per license year, statewide' },
        { id: 'r-0002', species: 'Bear', ruleType: 'Season Dates', seasonType: 'Archery', legalLabel: 'Archery bear', huntCode: 'B-ARC-101', summary: 'Archery bear: Oct 18 to Nov 1, 2026' },
        { id: 'r-0003', species: 'Bear', ruleType: 'Season Dates', seasonType: 'Firearm', legalLabel: 'Firearm bear', huntCode: 'B-FIR-201', summary: 'Firearm bear: Nov 22 to Nov 25, 2026' },
        { id: 'r-0006', species: 'Bear', ruleType: 'Method of Take', seasonType: 'General', legalLabel: 'No baiting', summary: 'Baiting prohibited statewide' },
        { id: 'r-0007', species: 'Bear', ruleType: 'Hours of Take', seasonType: 'General', legalLabel: 'Daylight only', summary: 'One half hour before sunrise to one half hour after sunset' },
        { id: 'r-0008', species: 'Bear', ruleType: 'License Required', seasonType: 'General', legalLabel: 'Bear license', summary: 'Bear license tag required in addition to general license' },
      ],
      missing: [
        { id: 'r-0004', species: 'Bear', ruleType: 'Season Dates', seasonType: 'Muzzleloader', legalLabel: 'Muzzleloader bear', huntCode: 'B-MUZ-301', summary: 'Muzzleloader bear: Oct 18 to Oct 25, 2026' },
        { id: 'r-0005', species: 'Bear', ruleType: 'Antler / Sex Restriction', seasonType: 'General', legalLabel: 'No cubs', summary: 'No cubs less than 50 lbs, no sows with cubs' },
      ],
      extra: [
        { id: 'x-001', species: 'Bear', ruleType: 'Hide Submission', seasonType: 'General', legalLabel: 'Hide check', summary: 'Hide and skull surrender required at check station' },
        { id: 'x-002', species: 'Bear', ruleType: 'Drone Use', seasonType: 'General', legalLabel: 'Drone scouting', summary: 'Drones permitted for scouting up to 48 hours pre-season' },
      ],
    },
    regulationsBuckets: {
      correct: [
        { id: 'g-0001', title: 'Hunter Education Required', content: 'All first time license buyers must complete a hunter education course before purchasing a hunting license.', species: [] },
        { id: 'g-0002', title: 'Harvest Reporting', content: 'Successful hunters must report their harvest within 24 hours via the PGC online portal or by phone.', species: ['Bear', 'Turkey'] },
        { id: 'g-0003', title: 'Tag Carriage', content: 'Hunters must carry their bear or turkey tag with them at all times during the season.', species: ['Bear', 'Turkey'] },
      ],
      missing: [
        { id: 'g-0004', title: 'Sunday Hunting', content: 'Sunday hunting is permitted on three Sundays only: November 16, November 23, and November 30, 2026.', species: [] },
        { id: 'g-0005', title: 'Fluorescent Orange', content: '250 sq inches of fluorescent orange required during firearm bear and big game seasons.', species: ['Bear'] },
      ],
      extra: [
        { id: 'gx-001', title: 'Mandatory Field Reporting', content: 'All hunters required to report kill site GPS coordinates within 12 hours.', species: ['Bear'] },
      ],
    },
  };

  const HISTORY = [
    { id: 'rep-pa-ne-1',  managerId: 'pa-ne', ranAt: '2026-02-10', score: 0.62, correct: 7, missing: 5, extra: 4, scope: 'Bear rules only', ranBy: 'rafael@onx' },
    { id: 'rep-pa-ne-3',  managerId: 'pa-ne', ranAt: '2026-02-28', score: 0.69, correct: 8, missing: 4, extra: 3, scope: 'Bear rules only', ranBy: 'jonathan@onx' },
    { id: 'rep-pa-ne-5',  managerId: 'pa-ne', ranAt: '2026-03-14', score: 0.74, correct: 9, missing: 3, extra: 3, scope: 'Bear rules only', ranBy: 'jim@onx' },
    { id: 'rep-pa-ne-7',  managerId: 'pa-ne', ranAt: '2026-03-29', score: 0.81, correct: 9, missing: 2, extra: 2, scope: 'Bear rules only', ranBy: 'jim@onx' },
    { id: 'rep-pa-ne-9',  managerId: 'pa-ne', ranAt: '2026-04-12', score: 0.85, correct: 10, missing: 1, extra: 2, scope: 'Bear + Turkey', ranBy: 'rafael@onx' },
    { id: 'rep-pa-ne-11', managerId: 'pa-ne', ranAt: '2026-04-26', score: 0.91, correct: 10, missing: 1, extra: 1, scope: 'Bear rules only', ranBy: 'jonathan@onx' },
    { id: 'rep-pa-ne-12', managerId: 'pa-ne', ranAt: '2026-05-05', score: 0.55, correct: 6, missing: 2, extra: 2, scope: 'Bear rules only', ranBy: 'jim@onx' },
  ];

  return {
    STATES,
    SPECIES,
    SEASON_TYPES,
    RULE_TYPES,
    SEX_TYPES,
    WEAPON_CATEGORIES,
    HUNTER_TYPES,
    CURRENCIES,
    LICENSES,
    ELIGIBILITY_CATEGORIES,
    WEAPON_SPECS_SCHEMA,
    MANAGERS,
    RULES: ALL_RULES,
    REGULATIONS: ALL_REGS,
    LICENSE_FEES,
    SAMPLE_REPORT,
    SAMPLE_INPUT_JSON,
    HISTORY,
    rulesForManager(managerId) {
      return ALL_RULES.filter(r => r.managerId === managerId);
    },
    regulationsForManager(managerId) {
      return ALL_REGS.filter(g => g.managerId === managerId);
    },
    licenseFeesForManager(managerId) {
      return LICENSE_FEES.filter(f => f.managerId === managerId);
    },
    licensesForState(stateCode) {
      return LICENSES.filter(l => l.stateCode === stateCode);
    },
    licenseById(id) {
      return LICENSES.find(l => l.id === id);
    },
    managerById(id) {
      return MANAGERS.find(m => m.id === id);
    },
    groundTruthManagers() {
      return MANAGERS.filter(m => m.isGroundTruth);
    },
    forkSourceManagers() {
      return MANAGERS;
    },
  };
})();
