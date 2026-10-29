# Developing Mitchell Tech V120.2

[Overview](README.md) · [Testing](TESTING.md) · [API](JAVASCRIPT-API.md)

## Keep the application self-contained

`index.html` contains the entire runnable application: markup, CSS, application
JavaScript, built-in teaching data, and bundled Nerdamer 1.1.13. Opening it needs
no bundler, Node runtime, API key, server, or dependency download. Node/Python and
Playwright are development-test tools only. `logo.svg` is a repository asset;
the HTML's runtime has no external asset references.

For optional local HTTP serving from the repository root:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000>. Choose an origin/profile intentionally when testing
storage; local files, localhost, and GitHub Pages do not automatically share saves.

## Source map

| Symbols/selectors in `index.html` | Responsibility |
|---|---|
| `.layout`, `.calc`, `.functionpanel`, media queries | Calculator-first responsive layout; preserve DOM/layout order. |
| `FUNCS`, `parse`, `evaluate`, `callFn` | Real-valued grammar, numeric evaluation, function domains and RAD/DEG. |
| `fmt`, `TRIG_AXIS_EPS` | Ten-significant-digit display and narrowly scoped trig normalization. |
| `simplify`, `deriv`, `show` | Original supported symbolic derivatives and teaching steps. |
| `compile`, `draw`, `roots`, `integral`, `slope` | Graphs, sampled rendering and numerical lab. |
| `state`, `validateState`, `persist`, `exportWorkspace` | Active workspace, validation and autosave/export. |
| `HELP`, `LESSONS`, `learning`, `teach` | Built-in control help and 13-lesson course. |
| `memory`, `crawlLocal`, `rankPages`, `recallPages` | Bounded local recall index, personal pages and recent records. |
| `MRE_FUNCTIONS`, `MRE_TOPICS`, `mreTutor` | 25 function/operator references and 19 base topic lessons. CAS adds 18 `cas ...` topic entries at startup. |
| `mrePractice`, `mreTestRecords`, `mreBenchmarkExplanation` | Tab-local practice and imported benchmark explanations. |
| `CAS_ENGINE_SOURCE`, `casKernel`, `casCompute`, `casRun` | Bundled vendor engine, validation/wrappers, worker lifecycle, UI rendering. |
| `CAS_OPERATIONS`, `mreTutorial*` | Shared 18-operation directory and guided tutorials. |
| `MitchellTech`, `mtResponse`, `mtGraphInput` | Public local API 1.1.0, result envelopes and graph validation. |

Most application code is readable inline. The minified `CAS_ENGINE_SOURCE` string
is the vendor exception; avoid dumping that entire line when navigating source.
The API exposes the existing engines rather than a second calculator.

## Mathematical contracts

- Numeric methods use JavaScript floating point, not arbitrary precision. Display rounding and numerical accuracy are separate.
- RAD/DEG affects sine/cosine/tangent, inverse trig, `atan2`, and angular graph parameters. Trig-zero stabilization uses a radians-based threshold near exact axis multiples; do not globally round all small values to zero.
- Tangent near odd quarter turns is undefined; retain the rejection rather than a misleading huge finite result. Large inputs already have range-reduction precision limits.
- The original differentiator can simplify `x^x` to `x^x*(ln(x)+1)` on its real domain `x>0`; it must preserve domain restrictions. Its rule steps are distinct from CAS output.
- Numerical integration uses a fixed 1,600-panel Simpson rule. Roots scan/refine real candidates; stationary points/intersections are bounded numerical searches, not completeness proofs.
- CAS is a separate radians-only symbolic/complex engine. Some results are approximate, incomplete, or unevaluated. Keep original exclusions, branch/convergence caveats, candidate verification and the missing antiderivative `+ C` visible.

## CAS and tutorial implementation

`CAS_ENGINE_SOURCE` embeds the npm `nerdamer@1.1.13/all.min.js` distribution.
Preserve its embedded MIT notice and [third-party notice](THIRD-PARTY-NOTICES.md).
There is no runtime CDN fetch. `casKernel` is serialized into a disposable worker
and must not close over page state. It adapts logarithm notation, validates the
allowlist, and handles `system(...)` / `substitute(...)` wrappers. `rationalize`
is deliberately not exposed as a denominator-rationalization lesson.

`casCompute` cancels prior work, creates/cleans up a Blob worker, and enforces an
eight-second timeout. `casRun` adds UI rendering; direct `MitchellTech.cas()`
returns the Promise result without rendering it. `CAS_OPERATIONS` is shared by
the UI/tutorials; its `ilaplace` directory key uses engine command `ilt(...)`.
Tutorial wording is authored guidance, not a generated derivation trace.

Mr. E wraps the original explicit tutor commands rather than replacing them.
`askMrE('cas ...')` acknowledges an asynchronous UI operation; it does not return
the computed CAS value. Use `await cas(...)` for programmatic results. Preserve
rendering through text content and the distinct benchmark/notebook import paths.

## Persistence and compatibility

Keep existing `parlour.*` storage keys and `parlour-notebook` version-one markers
unless implementing a reviewed migration. Validate imported data and preserve
older backups with optional learning/recall sections absent. Named snapshots,
current workspace, recall data, and lesson progress are separate stores; CAS,
practice, tutorial state, and imported benchmark records are transient. See
[BACKUPS.md](BACKUPS.md) for exact contents/limits and replacement behavior.

Recall is weighted local word matching. It neither uses Combined MPLPB's sealed
provenance engine nor verifies a personal claim or historical calculation. Do not
describe local recall, lesson completion, or benchmark import as autonomous model
training, external retrieval, or independent proof.

## Edit and release

1. Keep changes on a branch and preserve the one-file runtime.
2. For behavior changes, add distinct relevant math/tutor cases; include mode in mode-dependent case identity. Do not inflate uniqueness by counting repeated expressions.
3. Run the relevant checks and the complete [eight-suite Node sequence](TESTING.md). Inspect generated failures and restore historical report artifacts rather than committing them accidentally.
4. Run available real-browser tests and check local-file versus hosted operation, workers, mobile/desktop layout, persistence after actual reload, and export/import. State unavailable checks explicitly.
5. Update the relevant guides and append dated evidence with the tested commit/HTML digest to [BENCHMARKS.md](BENCHMARKS.md). Runner counts overlap; do not add them into one unique total.
6. Open a PR. After review/merge, compare the deployed HTML to the tested source and exercise the hosted page separately before claiming deployed-browser verification.

Any static host can serve the root `index.html`. For branch-based GitHub Pages,
publish **main / (root)**; there is no build output directory. The added
[validation workflow](.github/workflows/calculator-checks.yml) installs its own
test-only Playwright/Chromium and runs the Node/browser suites. This validation
job is separate from Pages hosting; it does not configure branch protection or
prove a deployed site passed. See [testing](TESTING.md) for installation and scope.

The V120.2 app label, API 1.1.0, vendor version, and notebook version are separate.
Record source commits and hashes for reproducibility rather than treating the
repository name as a build identifier.
