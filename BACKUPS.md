# Saving, backups, and file formats

[Overview](README.md) · [User guide](USER_GUIDE.md)

## Choose what to save

| Mechanism | Contains | Persistence/restore |
|---|---|---|
| Workspace autosave | Graphs, parameters, view, answer/memory, history/context, notes, angle, calculator mode, theme/display settings. | `localStorage` in this browser/origin; workspace writes are debounced by 250 ms. |
| Named notebook | One workspace snapshot with name, ID, date, and notes inside its workspace. | Up to 50 snapshots in this browser; opening replaces the active workspace. It does not snapshot the whole recall/lesson store. |
| Export JSON | Current workspace, lesson state, personal pages, and recent recall records. | Portable version-one JSON; import restores those sections, not all named notebooks. |
| PNG | Current graph canvas. | Image only; cannot restore/edit the workspace from it. |
| Load benchmark JSON | Imported expected/actual/pass records for Mr. E explanations. | Current tab only; no workspace/lesson restore. Imported outcomes are claims, not rerun certification. |

Autosave can fail because of permissions, quotas, file-URL policy, or browser
clearing/eviction. The UI reports storage failure, but it cannot guarantee
retention. There is no cloud account or device sync. Keep exported files outside
the browser's storage when you need a portable copy.

Saving a 51st named notebook keeps the newest 50 and drops the oldest snapshot.

## Export and restore

1. Use **Save → Export JSON**, **Notebooks → Export current workspace**, or **Crawl & recall → Export backup**.
2. To export an older named notebook, open it first, then export the current workspace. Export the previous active workspace beforehand if needed.
3. On the destination, open the app and choose **Notebooks → Import JSON**.
4. Select a supported version-one backup and inspect restored graphs, parameters, settings, memory, history, lesson progress, and personal pages.
5. Use **Save** to retain a named snapshot on that destination if desired.

Import replaces the active workspace. When present, imported `learning` and
`memory` replace their respective active stores; they are not merged with existing
personal pages/progress. Older files without those optional fields retain the
existing stores. Named notebooks already saved on the destination are not erased,
and importing does not automatically create a named notebook. Save writes can
still fail after validation; keep the original backup.

## Version-one notebook JSON

Export filename: `Mitchell-Tech-V120.2-Notebook.json`.

| Field | Meaning |
|---|---|
| `format` | `parlour-notebook`, retained for compatibility. |
| `version` | `1`; this is the file-format version, not API 1.1.0 or app V120.2. |
| `saved` | ISO export timestamp. |
| `workspace` | Current workspace object. |
| `learning` | Teaching switch, completed lesson indices, current lesson index. Optional on import. |
| `memory` | `pages` and `records` for personal/recent recall. Optional on import. |

`workspace` contains `expressions` (`text`, `type`, `on`), `a`, `b`, `view`
(`xmin`, `xmax`, `ymin`, `ymax`), `history`, `ans`, `mem`, `angle`, `theme`,
`notes`, `calcMode`, and `display`. History entries contain expression/value and,
when available, the evaluation's parameter/answer/memory/angle context. Display
contains custom colors, curve colors, text/key/graph sizing, line width, grid,
wide-board preference, and custom function keys.

Import checks the marker/version and validates/sanitizes workspace, display,
learning, and memory data. Graph-expression text is parsed when compiled, so a
structurally accepted backup can still contain an invalid mathematical rule
that the graph editor reports. The JSON is data, not executable code or an
authenticated/signed archive.

### Bounds and omissions

- Import rejects files **larger than 5,000,000 bytes**; the UI calls this “5 MB.” The exporter does not enforce an equivalent output-size cap, so large exports may need reducing before reimport.
- At most **12 graph expressions**, each at most 1,000 characters; **40 history items**; notes at most 10,000 characters after validation.
- At most **150 personal pages** and **80 recent recall records**; validated titles/IDs are capped at 150 characters and text at 6,000 characters.
- Recall indexing is rebuilt from local content and capped at 500 entries. Export stores pages/records, not that transient index or its last-crawl time.
- JSON does **not** include the list of all named notebooks, CAS input/results, an active guided tutorial, practice state, imported benchmark records, or transient graph trace/markers/shading.
- Numeric nonfinite state is not accepted as a retained answer/history value; optional invalid settings may be defaulted, filtered, or clamped. Import validation is not mathematical proof.

## Browser stores

The retained key names are `parlour.workspace`, `parlour.notebooks`,
`parlour.learning`, and `parlour.ledger`. These names remain from the earlier
Parlour-based implementation; changing them without migration would lose automatic
access to existing saves. Hosted storage belongs to its origin, while local-file
storage behavior varies by browser. Moving the HTML to another device/location
does not transfer the old browser's data automatically.

Selective history/graph clearing does not erase recall records or exported
backups. If managing sensitive notes, consider each separate store and any files
you exported; the app has no single “delete all copies” operation.

## Benchmark JSON is a different import

Mr. E's **Load benchmark JSON** accepts an object with a `results` array, at most
35,000 records, and no more than 16,000,000 file bytes. Each row requires unique
`MT-000001`-style IDs (six digits), a question in `name`, a `category`, and boolean
`pass`; expected/actual fields are retained for explanation. It does not read
notebook-format JSON. See [Mr. E](MR-E.md) and [testing](TESTING.md).
