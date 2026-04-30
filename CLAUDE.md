# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run start` — Vite dev server on port 8000 with `--watch` rebuild, opens `/demo/`.
- `npm run build` — Production library build (ES module) to `dist/`.
- `npm run watch` — Build only, watch mode.
- `npm run types` — Regenerate `src/definition-schema.d.ts` from `src/definition-schema.json` via `json2ts` (run after editing the schema).
- `npm run analyze` — Custom Elements Manifest analysis (`@custom-elements-manifest/analyzer --litelement`).
- `npm run release` — Build, regen types, `npm version patch`, push commit + tag (CI publishes on tag).
- `npm run link` / `npm run unlink` — Link/unlink against sibling `../RESWARM/frontend` for local integration.

No test framework or linter is configured. Node `>=24.9.0`, npm `>=10.0.2`.

## Architecture

Single-file Lit 3 web component (`src/widget-table.ts`) wrapping `@vaadin/grid` (peer dependency, externalized in the bundle). The component is registered as `widget-table-versionplaceholder`; the Vite build replaces `versionplaceholder` with the package version via `@rollup/plugin-replace`, so the live tag is e.g. `widget-table-1.1.17`. Consumers must use the version-suffixed tag matching the installed package — this lets multiple widget versions coexist on one page in the IronFlock dashboard.

Build pipeline (`vite.config.ts`):
- Library mode, ES-only output, entry `src/widget-table.ts` → `dist/widget-table.js`.
- Externalizes `lit*`, `@lit*`, `@vaadin*` so consumers provide them.
- `tslib` aliased to `tslib/tslib.es6.js`; `process.env.NODE_ENV` defined to `"production"`.

### IronFlock platform contract

The widget exposes two reactive properties consumed by the host dashboard:
- `inputData: InputData` — typed by `src/definition-schema.d.ts`, generated from `src/definition-schema.json`. The JSON schema is the source of truth for both the runtime type and the dashboard's config UI (note the non-standard `order`, `dataDrivenDisabled`, `condition.showIfValueIn`, and `color: true` keys consumed by the IronFlock config editor).
- `theme: { theme_name, theme_object }` — ECharts-style theme object. `registerTheme()` resolves colors with this precedence: CSS custom properties (`--re-text-color`, `--re-tile-background-color`, `--re-hover-color`, `--re-border-color`) on the host element override `theme_object` values.

### Data shape and rendering

`inputData.columns` is column-oriented (each column carries its own `values[]`). `transformInputData()` pivots columns into row records keyed `col_<index>` for Vaadin Grid, then reverses (newest-first). Vaadin sort paths use `col_<index>.value`.

Cell rendering dispatches on `column.type` in `renderCell()`: `string`, `number` (with `precision`), `boolean`, `state` (parses `stateMap` string `"'ONLINE': 'green', ..."` into a colored `.statusbox`), `button`, `image`, `timestamp`. Timestamps use a hand-rolled Unicode LDML subset (`yyyy MM dd HH mm ss SSS`) — see `parseTimestamp` / `formatTimestamp`. If `timestampParseFormat` is empty, values are treated as Unix epoch milliseconds.

Text alignment is column-type-driven (`getTextAlign`): numbers/timestamps end, booleans/state/image center, others start.

### Demo harness

`demo/index.html` builds the tag dynamically from `package.json` version using `lit/static-html`, applies `demo/themes/light.json`, and randomizes select cell values every 1s via the external `ObjectRandomizer.js` script — useful for verifying reactivity but means the demo will not run fully offline.

## Releasing

CI (`.github/workflows/build-publish.yml`) publishes to npm on any pushed tag. The standard flow is `npm run release` (patch bump). Because the custom element name embeds the version, every release ships a new tag name; do not hand-edit the `versionplaceholder` literal.
