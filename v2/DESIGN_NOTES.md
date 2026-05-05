# Scorer Prototype, Design Notes

Static HTML / CSS / vanilla JS. No backend, no build step. Open `index.html` in a browser to walk through.

## Information architecture

Five stages map to the QA evaluation lifecycle:

1. **Truth Library**, browse and pick from curated ground truth managers.
2. **Curate**, build a new ground truth manager (fork from existing or blank).
3. **Score**, paste a raw extraction and pick what to score it against.
4. **Report**, the rule-level diff with three buckets.
5. **History**, past runs per manager with a trend line.

Stages are rendered as a top rail (not a sidebar), because they read as a workflow more than a set of independent views. The active stage uses the existing client's indigo accent + glow pattern so the rail feels native to the existing app.

## Visual system

Adopts the existing `client/style.css` palette and conventions so the prototype feels like the same product:

- Background `#0f1115`, translucent white card surfaces (3% bg, 8% border).
- Indigo accent `#6366f1` with the existing glow shadow on active elements, hover, and focus.
- Outfit font (UI), system mono for IDs and counts.
- 12 to 20px radii on cards, 6 to 8px on chips and inputs.
- Status colors map to the existing client tokens:
  - **Correct** → `--status-completed` (emerald)
  - **Missing** → `--status-cancelled` (amber, dashed border to read as a gap)
  - **Extra** → `--status-failed` (red)

The intent is that the prototype establishes the patterns we will migrate the rest of the existing client toward.

## Signature: the harvest tag

The atomic unit of the system is a **rule**, so every rule renders as a tag component. Same component is used in three places, with status-aware variants:

- **Selection panel** (Flow B), neutral, with a checkbox affordance, drives sub-selection.
- **Report drill-down** (Flow C), correct (emerald, soft fill), missing (amber, dashed, no fill, reads as a hole), extra (red, soft fill, reads as out-of-place).
- **Curate flow** (Flow A), copied tags carry an amber edit-row marker so untouched fields are obvious.

A leading colored dot on every tag (with a soft glow) makes the status legible at a glance even in dense lists.

## Hotspot decisions

**1. Manager picker (Flow B).** The picker lives inline on the right of the score stage. Filters are chip rows for state and species (multi-axis, instant local filter), plus a free-text search. A "Recently used" row sits on top of the chip row when no filter is active so the most likely pick is one click away. Cards are compact `manager-card` instances with state seal, regulation/rule counts, and species tags. Hovering glows the border in indigo, picking promotes the card and replaces the picker with a single `picked-manager` summary, freeing the canvas for sub-selection.

**2. Sub-selection inside a manager.** Default view is **group-level**, two cross-cuts: by species, and by rule type. Each group head shows `selected/total` counts and a `Select all` / `Deselect` toggle. Drill-down is a click-to-expand into individual harvest tags with checkboxes, so power users can cherry pick. A sticky **run bar** at the bottom shows the running tally (`N rules selected of M`, with a Bear/Turkey breakdown) and the primary `Run scoring` button. The mental model "score this extraction against just the Bear rules in PA's Northeast Region" is one chip + one Select all click.

**3. Report readability.** Three buckets sit as a top row of full-bleed cards, each with a colored top edge (emerald / amber / red) and a glowing accent bar. The number is the headline, the caption explains what bucket means in QA terms (e.g. "Missing: rules in ground truth that ingestion did not produce"). Tapping a bucket drills into the rules below, grouped by species (default), rule type, or flat. Group switching is a chip row, no page reload.

The accuracy headline (e.g. `55%`) is a separate score-summary card above the buckets so the punchline is visible without doing math on counts.

**4. Fork flow (Flow A).** The editor's edit rows carry an explicit state per field: **Copied** (amber bar + italic gray text + amber legend dot), **Edited** (emerald bar + sharp text), **New** (indigo bar with glow + sharp text). Untouched copies are visually weaker than edited fields, so QA can scan a draft and tell what still needs review at a glance. Saving a draft with everything still amber is *possible* but the visual weakness is intentional.

## Empty states

- **Truth Library**, "No ground truth managers match these filters" with a clear-filters CTA.
- **Score**, no input pasted disables the run button and dims the run bar; no manager picked hides the sub-selection panel entirely.
- **Picker**, "No matches" with hint to clear filters or fork from Truth Library.
- **Report bucket**, "Nothing in this bucket" with bucket-specific reassurance ("ingestion stayed in scope, no hallucinations").
- **History**, "No runs yet" with a CTA to run a comparison.

## Interactions wired up

- All filter chips work locally on mocked data.
- Manager picker, sub-selection, and tally update in real time.
- Run scoring jumps to the precomputed sample report.
- Report bucket selection and group-by switching are interactive.
- History row click opens the matching report (only the current sample report has data; others alert as "would open archived").
- Hash routing is back/forward friendly; URLs are human readable (`#score?manager=pa-ne`).

## Where each field actually lives in the schema

After reading `go/model/season_species_rule.go`, `general_regulation.go`, `season.go`, `license.go`, `license_fee.go`, `eligibility_category.go`, `weapon.go`, `weapon_category.go`, `location.go`:

**Inline on `HuntRule`** (the `season_species.rules` JSONB):
- `legal_label`, `hunt_code`, `notes`, `public_land`
- `categories[]` (free-text strings, *not* foreign keys to `regulation_category`)
- `sexes[]` (enum), `equipment`, `schedule`
- `dates` (optional, overrides parent season for a specific hunt code)
- `limits[]` (title/content), `requirements[]` (label/content), `eligibility[]` (label/content) → all inline structs, no separate tables.

**Foreign-key references on `HuntRule`** (the entity exists elsewhere, the rule just stores IDs):
- `weapon_ids` → `weapon`
- `weapon_category_ids` → `weapon_category`
- `required_license_ids` → `license`
- `location_ids`, `excluded_location_ids` → `location` (state-scoped, hierarchical)
- `eligibility_ids` → `eligibility_category` (the rule can carry both inline `eligibility[]` *and* category links)

**Manager-level entities** (one DocumentManager → many of these):
- `general_regulation` (broad policies, optional species link, optional `icon_source`).
- `license_fee` (per `license × manager × hunter_type → fee + currency`). Rendered in the prototype as the dedicated **License fees** section.
- `season` (per `document_id`) carries the canonical `start_date / end_date / date_description / valid_days_of_week / valid_weeks_of_month / notes` and a `season_type_id`. **The prototype currently flattens season-level dates into the rule for v1.** Real ground truth would have a Seasons section above Rules where date ranges live.

**State-level shared entities** (curate flow picks from a list, doesn't create them):
- `weapon`, `weapon_category`, `license`, `location`, `season_type`, `eligibility_category`, `regulation_category`. These are scoped to a state and shared across managers.

**TL;DR: eligibility, requirements, legal label, hunt code, limits, categories** are inline on the rule. **Weapons, licenses, locations, eligibility categories, season types** are shared entities the rule references. **License fees** and **regulations** are manager-level. **Seasons** are conceptually between manager and rule, simplified in v1.

## What the prototype does not show

- **Backend persistence**, save/cancel actions are mocked with `alert()`.
- **Field-level diff** inside a rule, scoping decision for v1.
- **Versioning** of ground truth managers, scoping decision for v1.
- **File upload** for the extraction input (textarea only for the prototype).
- **Real diff algorithm**, the report uses a precomputed mocked breakdown.

## Open questions for the Jonathan walkthrough

1. Should the report persist the full extraction text alongside the buckets so QA can re-render the diff later, or just the result counts?
2. For history, do we want a per-(manager, scope) trend or the simpler per-manager trend the prototype shows?
3. Is it worth giving the manager picker a saved-search ("favorites") affordance for QA workflows that re-pick the same five managers?
4. Bulk run: do we want to score one extraction against multiple ground truth managers in a single run, or keep one-at-a-time?
