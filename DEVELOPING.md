# Developing Mitchell Tech V120.2

## Core constraint: it stays a single HTML file

Open `index.html` in a browser. This is the complete application: no bundler, Node runtime, cloud account, API key, external framework, or hosted dependencies are required to use it. Node.js is only used for optional development tests. Application styles and JavaScript are formatted for human review. The bundled minified Nerdamer engine is the exception: it is embedded as the `CAS_ENGINE_SOURCE` string for offline workers.

## Navigating the source

| Area | Find these symbols / selectors in `index.html` | Responsibility |
| --- | --- | --- |
| Layout and responsive styles | `.layout`, `.calc`, `.functionpanel`, `@media` | Calculator-first desktop/mobile layouts; accessible controls |
| Expression parser | `FUNCS`, `parse`, `evaluate`, `callFn` | Safe grammar and numeric evaluation; no `eval` |
| Numeric output | `fmt`, `TRIG_AXIS_EPS`, `callFn` | Rounded display and domain-sensitive trig behavior |
| Symbolic math | `simplify`, `deriv`, `show` | Rule-based derivative steps, e.g. `x^x` |
| Graphs and analysis | `compile`, `draw`, `roots`, `integral` | Deterministic canvas rendering and numerical methods |
| Calculator controls | `renderKeys`, `calcRun`, `refreshAngle` | On-screen input, history and RAD/DEG |
| Offline tutor | `tutor`, `recallPages` | Explicit rules and local recall; no embedded LLM |
| Storage and portability | `localStorage`, `persist`, `importFile`, `exportWorkspace` | Browser-local state plus transfer through saved JSON |

The calculator panel intentionally comes first in the DOM and responsive layout; educational panels follow it. Keep that order when modifying the interface.

## Numerical correctness policy

- Angle mode applies to sine, cosine, tangent, inverse trig, **and `atan2`**.
- At values *extremely close to exact multiples of 90 degrees (or π/2 radians)*, trig rounding artifacts are normalized only inside trigonometric functions. Do not use a global `Math.abs(x)<1e-12?0:x` display rule; it would hide legitimate small values.
- Tangent is undefined at odd multiples of 90 degrees. The evaluator uses `NaN` for those near-axis singularities; the UI reports undefined rather than a misleading large finite answer.
- The `TRIG_AXIS_EPS` threshold is measured in radians; beware of very large arguments where floating-point input precision already limits reliable range reduction.
- Derivative `x^x` may be simplified to `x^x * (ln(x) + 1)` only in the real domain `x>0`. Keep derivative rules domain-conscious rather than simplifying arbitrary rational factors with an unknown zero denominator.
- Distinguish display precision, approximate numeric accuracy, and symbolic correctness. The original numerical calculator/graphing engine uses ordinary JavaScript floating-point numbers, **not arbitrary precision arithmetic**. The separate Nerdamer CAS supports exact rational/symbolic expressions, but some operations still use numerical approximation; do not describe every CAS result as exact.

## Reproducible checks

From the repository root, with Node.js 22 or another recent supported Node.js release:

```sh
node tests/full-spectrum.cjs
node tests/application-checks.cjs
node tests/unique-benchmarks.cjs
```

`tests/unique-benchmarks.cjs` is the recommended regression gate. It builds 20,000 deterministic generated expressions plus the fixed corpus, distinct tutor requests, angle-mode cases and 16 targeted regressions. Questions are normalized and deduplicated globally; each kept question has a stable `MT-` ID. Output goes to `tests/unique-benchmarks-results.json` with exact inputs, expected/actual values, failures, and duplicate skips. The process exits unsuccessfully when tests fail. The 18 October 2026 corrected source scored **22,242 / 22,242** with two repeated raw expressions skipped.

The engine/application script passed **104 / 104**. Additional browser behavior was checked in Chromium at 390px and 1366px (**22 / 22**), but that browser check used locally injected HTML, *not the deployed web origin*. A proper release should also test persistence after a real reload, backup import/export roundtrips, browser permissions, mobile Safari and Firefox, and hosted GitHub Pages parity.

## Suggested edit-and-release loop

1. Edit the one-file app and preserve the self-contained `index.html` format.
2. Add **a new, distinct math input or tutor question** for every behavior change; do not count an identical question twice. For mode-dependent tests, include RAD or DEG in its identity.
3. Run all three Node commands, and inspect the unique runner's JSON plus exit code.
4. Smoke-test the rendered page in browser widths around 390px and 1366px; verify actual text in the result box, not just toleranced floats.
5. Verify localStorage behavior on the hosted origin and JSON portability on actual devices before describing those workflows as independently tested.
6. Update `BENCHMARKS.md` with the tested revision, actual counts, and any known failures. Only then release to `main`.

## Scope and honesty

This is a local-first scientific calculator and rules-based math tutor. An external AI can drive it through browser automation, but the page does not itself contain an LLM. Local browser state belongs to that browser and origin; moving devices requires a transferred backup, not merely a URL. Keeping this distinction in public documentation makes both the software and its benchmark numbers reproducible.


## Mr. E teaching and benchmark imports

`index.html` now contains `MRE_FUNCTIONS` (function reference), `MRE_TOPICS` (lessons), `mreGraphExplain`, `mrePracticeStart`, `mreBenchmarkExplanation`, and `mreTutor`. The older explicit command tutor is wrapped rather than replaced, keeping existing `solve`, `differentiate`, `integrate`, `plot`, and `recall` behavior. Maintain the app as a self-contained HTML file; imported benchmark JSON is read as local data only and has size, ID, and uniqueness checks. Keep answer rendering through `textContent`. Tests: `node tests/mr-e-checks.cjs`; documentation: [MR-E.md](MR-E.md).

## Embedded CAS and tutorial runner

`CAS_ENGINE_SOURCE` contains the unmodified npm `nerdamer@1.1.13/all.min.js` encoded as a JavaScript string. Its MIT notice is embedded and repeated in THIRD-PARTY-NOTICES.md. Do not remove the notice. No runtime network request or package installation is needed. Application code remains readable outside that vendor string.

`casKernel` is serialized into a disposable worker and must not close over page variables. It validates the input, adapts logarithm notation, and handles system/substitution wrappers. The engine's `rationalize` operation is deliberately not exposed; its semantics are unsuitable for a denominator-rationalization lesson. `casCompute` manages cancellation, cleanup and timeout; `casRun` renders via textContent. `CAS_OPERATIONS` is the shared UI/tutorial directory. Function tutorials use `MRE_FUNCTIONS`; topic and control tutorials reuse MRE_TOPICS and HELP. No generated text is presented as a symbolic derivation trace.

Run `node tests/cas-checks.cjs`, `node tests/mr-e-checks.cjs`, and existing regression suites. `node tests/cas-browser.cjs` additionally requires Playwright and Chromium; set CHROMIUM_EXECUTABLE to an installed browser if necessary. It checks local-file workers, cancellation, API, tutorial navigation, function coverage and narrow/wide layouts without external requests.
