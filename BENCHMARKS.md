# Unique-question benchmark report — 18 October 2026

## Current verified status — correction release (18 October 2026)

**22,242 / 22,242 globally unique mathematical and offline-tutor questions passed** (including 16 newly added, individually identified precision and symbolic-clarity regressions); only two duplicate *raw expressions* were excluded. The bundled engine/application check suite passed **104 / 104**. A separate Chromium run of the updated HTML passed **22 / 22** checks at 390px and 1366px (including calculator-first layout, exact trig-zero displays, undefined tangent, cleaner `x^x` tutor steps, and JS errors). The browser run used `page.set_content`, so **origin-bound storage after a real reload and the deployed GitHub Pages site were not reverified**.

Code changes: exact trigonometric zeros at canonical axis angles are stabilized without modifying arbitrary tiny values; undefined tangent at odd quarter turns now yields `NaN` (displayed as an undefined real result); `atan2` follows the selected RAD/DEG mode; differentiation of `x^x` reports `ln(x) + 1` instead of `x/x`; the calculator appears first; the inline CSS and JavaScript are formatted into maintainable blocks while remaining a single offline HTML file.

To reproduce: `node tests/unique-benchmarks.cjs` (nonzero exit code for failures) and `node tests/application-checks.cjs`. The resulting unique-question JSON lists every test ID, question, expected/actual values, skipped duplicates, and pass/fail status. No separate dependencies are needed for the Node checks. Browser checks were conducted locally with Chromium and Playwright, not against the public URL.

## Earlier snapshot (before corrections)

This report compares the supplied benchmark ZIP with the current repository source and exercises the calculator's offline, rule-based tutor. **It does not certify the deployed GitHub Pages app through live browser automation.**

## Results

| Test run | Result | Notes |
| --- | ---: | --- |
| Existing full-spectrum suite, before deduplication | 2,205 / 2,205 pass | The historical run counted two identical mathematical expressions twice. |
| Existing application/engine suite | 104 / 104 pass | DOM/canvas test doubles; not full browser coverage. |
| **New unique-question suite** | **22,224 / 22,226 pass** | 2,149 distinct fixed expressions + 54 other distinct legacy checks + 20,000 new expressions + 20 tutor questions + 3 degree-mode edge checks. |
| New generated numeric expressions | 20,000 / 20,000 pass | Reproducible seed, no mathjs dependency. |
| New offline tutor prompts | 20 / 20 pass | Tests expected answer fragments, *not* an LLM or comprehensive proof of mathematical reasoning. |
| New angle-mode edge cases | 1 / 3 pass | Two reproducible defects below. |
| Local Chromium UI checks | 7 / 7 pass | Loaded the repository HTML into Chromium; not the deployed site; browser storage survival was not tested in this run. |
| Supplied separate advanced script | 45 / 46 pass | The sole reported failure is an incorrect ordering expectation for two valid quadratic roots. |

**Deduplication:** There are **22,226 individually identified, distinct questions** in the extended run, with stable `MT-000001`-style IDs. Only **two exact repeat questions** were skipped: `(-2)^2` and `0!`. Whitespace and case differences do not create new questions. Different actual *questions* remain distinct: for example, `roots sin(x) in [-4,4]` is not the same question as `differentiate sin(x) at x=0`, and `DEG: atan(1)` is not the same question as its RAD-mode equivalent.

## How to rerun

From the repository root with Node.js 22 or a recent supported Node.js runtime:

```sh
node tests/full-spectrum.cjs
node tests/application-checks.cjs
node tests/unique-benchmarks.cjs
```

The ordinary full-spectrum runner now skips its two duplicate expressions, so its *new* execution count is 2,203 (not the historical 2,205). The extended runner writes **`tests/unique-benchmarks-results.json`** with each tested question, category, ID, actual result, expected result, duplicate list, and failure list. A nonzero exit code from the extended runner signals failed checks. It uses only built-in Node.js modules, with no `mathjs` installation required.

The supplied archive's **`benchmark3.js`** and saved **`benchmark-20000-results.json`** were inspected. The saved report claimed 20,000/20,000, but that exact archived random run was **not reproduced**, because the script uses nondeterministic random inputs and depends on `mathjs`, which was not installed here. The 20,000/20,000 result above is from **a new fixed-seed run** with its own documented generator and reference math, not a claim that the archived random trial was rerun.

## Historical failures (resolved in the current source)

1. **`atan2(1,2)` in DEG mode:** The app gives approximately `0.463647609` radians; the expected degree result is approximately `26.565051177`. `Math.atan2` is passed through without converting the output into degrees.
2. **`tan(270)` in DEG mode:** The app produces about `5.443746451065123e15` instead of rejecting or marking the mathematically undefined tangent. Floating-point proximity to an odd 90° angle should be treated cautiously.

These defects were documented in the earlier snapshot. **They are now fixed in the current `main` source** and covered by newly added unique regression questions. The older counts above are preserved for historical comparison rather than presented as current failures.

## What was actually compared

- The **ZIP's `index.html` has the same Git blob SHA as the repository `index.html`**, `701ee7252c4d728cef31774f87c46fd29786dccb`, at the time of review. Thus these source-level runs apply to that specific checked repository revision.
- The published GitHub Pages URL rendered the expected Mitchell Tech V120.2 interface in an online read, but **the hosted JavaScript was not exercised**. Direct navigation to the public URL (and even local HTTP/file URLs) was blocked for the automated browser in the testing environment.
- Seven *actual Chromium controls* were tested by injecting the identical repository HTML into an otherwise empty browser page: a distinct calculator expression, storing its result in memory, two unique tutor inputs (algebra and differentiation), degree-mode button switching, 390-pixel horizontal layout, and zero uncaught page errors. **This is not a persistence/reload test**, because the isolated in-memory page does not have the website's storage origin.

## Method and limitations

The new generator uses fixed pseudorandom seed **20261018**, creating distinct arithmetic, powers, scientific functions, and nested expressions. Reference expectations are computed separately using JavaScript operators and standard `Math` functions rather than the calculator parser. These checks detect implementation mismatches but **do not establish independent arbitrary-precision correctness**: the app and reference both use IEEE-754 floating point. The supplied 2,151-case fixed corpus was retained as input, with the two exact repeats excluded from execution.

Numeric comparisons use a mixed absolute/relative tolerance, and the old fixed cases respect the calculator's 10-significant-digit display. Tutor tests verify distinct commands and expected snippets only; they are smoke tests, not a comprehensive assessment of explanations. Real iOS/Android devices, Safari/Firefox, downloaded JSON contents, browser storage across real reloads, file restoration across computers, and external AI/browser-agent integrations were not retested here.

**Important:** The existing `tests/full-spectrum-results.json` committed before this report is a *historical artifact*. Re-run the scripts to produce fresh reports from the modified harness. Nothing in this report supports the claim that an embedded LLM is present: the tutor is offline and rule-based, and the source-recall system is local.

## Follow-up recommendations

DEG-mode `atan2` and tangent singularities are now corrected and regression-tested. Next, run a real deployed-site browser matrix (Chrome, Firefox, Safari, mobile browsers) and test actual JSON export/import, browser storage persistence, and AI-agent UI navigation. Save both results and the exact deployed source revision so the site and repository can be compared byte for byte.


## Mr. E tutor-specific tests — 18 October 2026

**69 / 69 distinct tutoring prompts passed** in `tests/mr-e-checks.cjs`, covering every supported function reference, all 20 built-in topics, practice, graph explanations, distinct imported report entries, and import validation. The updated app also passed **2,205 / 2,205 cases in the original, non-deduplicated fixed-case harness**, **104 / 104 application checks**, and **29 / 29 local Chromium behavior checks**. This is a separate tutor-update run; the earlier 22,242/22,242 extended benchmark result was **not rerun in full** for this change. See [MR-E.md](MR-E.md).

Test explanations are derived from the imported `name`, `category`, `actual`, `expected`, and `pass` fields plus supported local math rules. Loading a record does **not** independently validate that record's original outcome. Unsupported expressions receive a limitation message rather than invented mathematical proof.

## Offline CAS and guided tutorials — 26 October 2026

Revision: feature/offline-cas-mr-e-tutorials (embedded Nerdamer 1.1.13; API 1.1.0).

| Gate | Result |
| --- | --- |
| Existing unique benchmark runner | 22,242 / 22,242 |
| Fixed full-spectrum runner | 2,203 / 2,203 unique questions |
| Application checks | 104 / 104 |
| Mr. E prompt tests, including new CAS lessons and tutorial navigation | 139 / 139 unique prompts |
| JavaScript API | 78 assertions across 22 distinct expressions |
| Clear controls | 25 / 25 |
| CAS mathematical results and input validation | 36 / 36 |
| CAS worker execution, cancellation, supersession, eight-second timeout and recovery | 10 / 10 assertions using Node worker_threads |

Counts from different runners overlap; do not add them into a claimed unique total. Worker tests execute the exact Blob worker source under a browser-like Node worker shim, not a browser. No engine timings or universal symbolic correctness claims are made.

**Browser verification pending:** Playwright's Chromium download returned an invalid archive. An alternate Chromium 153 package downloaded, but exited with SIGTRAP before opening a page in this environment. The new `tests/cas-browser.cjs` is provided but has not passed here. Review must verify 390px/1366px layout, actual local-file and hosted-origin Blob-worker support, tutorial buttons, offline requests and cancellation before release. No hosted deployment or mobile Safari/Firefox verification was performed for this change.
