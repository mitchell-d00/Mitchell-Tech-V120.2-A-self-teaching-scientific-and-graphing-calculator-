# Smoke test and mathematical regression report

## Current source regression status — 18 October 2026, after fixes

- **22,242 / 22,242** globally unique math, precision, and tutor questions pass in `tests/unique-benchmarks.cjs`. Two repeated raw expressions are skipped, with each executed question assigned its own stable ID in the results JSON.
- **104 / 104** bundled engine/application checks pass.
- **22 / 22** Chromium layout and behavior checks pass at 390px and 1366px, including a visible calculator above the fold, trig zero display, undefined tangent, memory-store handling, tutor output, no horizontal overflow, and zero uncaught JavaScript page errors. The browser harness injected the current HTML into Chromium: it did **not** reverify real-origin storage across reloads or the deployed GitHub Pages app.
- **Resolved:** DEG-mode `atan2` now reports degrees; undefined tangent at odd 90-degree intervals no longer displays giant finite numbers; sine/cosine at canonical axes displays zero without blanket suppression of genuinely small results; the `x^x` derivative display simplifies `x/x` to 1.
- Both inline CSS and JavaScript were reformatted into readable source, with the one-file offline model preserved.

Reproduce the core checks with `node tests/unique-benchmarks.cjs` and `node tests/application-checks.cjs`. See [BENCHMARKS.md](BENCHMARKS.md) for the fresh test scope and earlier failures. **All other numeric scores lower in this file are retained as dated historical snapshots**.

## Earlier test history

Test date: October 18, 2026.

## Scope and results

The published GitHub Pages calculator was exercised through a desktop Chrome browser. A broader code-level suite then ran against the calculator source in this conversation. The packaged build includes corrections; it has not been published to GitHub Pages by this test run.

- Original build: 2,198 / 2,205 code-level checks passed. Seven failing cases represented three defects.
- Patched build: 2,205 / 2,205 math checks passed.
- Patched build: 104 / 104 additional engine/application checks passed.
- Application checks use DOM/canvas stubs; they are not a substitute for a real device/browser test.

## Patched defects

1. Small nonzero numbers such as `1e-13` were formatted as zero. They now retain scientific notation when needed.
2. The equation tutor discarded small nonzero leading polynomial coefficients. `solve 0.000000000000001*x=1` now gives `x = 1000000000000000`.
3. Numerical root detection accepted a small absolute residual as a root. `x^2+0.00000001` produced numerous false roots despite having no real roots. The search now requires refined convergence and scaled/local checks.
4. The Resume lesson label could show the previous lesson number; it now updates when a lesson opens.
5. Graph-input target menus could show an outdated expression; they now refresh when expressions are compiled.

## Code-level math coverage

| Category | Passed | Failed |
| --- | ---: | ---: |
| Fraction arithmetic | 1600 | 0 |
| Decimal arithmetic | 300 | 0 |
| Order, signs and percentages | 22 | 0 |
| Integer powers | 175 | 0 |
| Scientific functions (RAD) | 24 | 0 |
| Factorials | 25 | 0 |
| Small-number display | 5 | 0 |
| Domain handling | 11 | 0 |
| Invalid expressions | 12 | 0 |
| Angle modes | 7 | 0 |
| Function substitution | 4 | 0 |
| Equation tutor | 6 | 0 |
| Numerical roots | 5 | 0 |
| Numerical integration | 3 | 0 |
| Symbolic derivatives | 4 | 0 |
| Closed-page recall | 2 | 0 |

The 1,600 fraction and 300 decimal arithmetic expectations were generated independently with Python Fraction/Decimal arithmetic, using a fixed seed. Scientific, domain, solver and calculus checks use explicit expected values or identities. Output comparisons respect the calculator’s ten-significant-digit display.

## Live browser checks completed

- Fifteen ordinary/scientific calculations, plus angle-mode, memory and prior-answer explanation drills.
- Invalid-input and real-domain rejection examples.
- Worked algebra, differentiation and integration examples.
- Lab values/slopes, roots, stationary points and integrals.
- Recall source ownership, ambiguity choices and missing-information responses.
- Two synthetic recall pages, a named notebook, lesson feedback and lesson-resume behavior.
- Memory, custom-function selection, lesson progress and color settings across a real page reload.
- Native keyboard entry changed touch-key height to 58 pixels; browser geometry confirmed it.
- Graph keyboard input, expanded viewer and Cartesian value table.
- JSON and PNG export download events completed.

## Verification limits

- Browser file-upload calls stalled, so an end-to-end live JSON import round trip remains unverified. The separate application suite verifies import using stubs.
- Export download completion was observed, but independent examination of the downloaded bytes was interrupted.
- Actual iPad, iOS Safari, other browser engines, pinch gestures on a physical device, and responsive breakpoints were not certified.
- The patched source passed code-level checks; the patched version was not re-deployed or re-tested on the live site.
- Browser logs observed during the completed drills showed extension-origin errors, rather than identified calculator-origin errors. This is a scoped observation, not a guarantee of an error-free application.
- This is finite test coverage, not proof of mathematical correctness for every input. Number arithmetic uses JavaScript floating point. Sampled graphing, root finding and fixed-panel integration retain numerical limitations.

## Repeat the packaged drills

No installation or dependencies are needed beyond a recent Node.js runtime. From the extracted project folder:

```sh
node tests/full-spectrum.cjs
node tests/application-checks.cjs
```

The first command writes `tests/full-spectrum-results.json`. The app itself still runs entirely from `index.html`, with no Node.js requirement.


## 18 October 2026 — deduplicated extended benchmarks

A later review of the supplied benchmark ZIP and the current repository source found **two duplicated expression prompts** in the fixed corpus. The new `tests/unique-benchmarks.cjs` runner executes **22,226 distinct questions**, reporting **22,224 passing and two failing** DEG-mode cases. Each question receives a stable ID, duplicates are explicitly excluded, and the generated cases have a fixed seed. The original pre-deduplication 2,205/2,205 figure above remains a *historical* result, not the new unique count.

The confirmed failures are `atan2(1,2)` returning radians in DEG mode and `tan(270)` producing a huge finite number at an undefined tangent. Source-level tests and seven Chromium UI checks succeeded otherwise, but the **live GitHub Pages JavaScript was not run through browser automation in this session**. See [BENCHMARKS.md](BENCHMARKS.md) for complete scope, repeatable commands, sources, and limitations.


## Mr. E tutor expansion — 18 October 2026 (latest)

The renamed, expanded offline teacher now covers **25 function/operator reference entries**, **20 lesson topics**, graph explanations, practice with hints, and human-readable summaries of individual benchmark results imported as local JSON. Run `node tests/mr-e-checks.cjs` to verify individual, non-repeating questions; **69/69 unique prompts passed**. The preexisting test suites also passed on this edited source: **2,205/2,205** mathematical checks in the original, non-deduplicated fixed-case harness and **104/104** app checks. A local Chromium check passed **29/29** tests including UI, report import, and handling of invalid report IDs. This session did not run the deployed GitHub Pages origin or fully rerun the earlier 22,242-case extended generator. See [MR-E.md](MR-E.md) for all user-facing commands and the limitations of explaining arbitrary test cases.
