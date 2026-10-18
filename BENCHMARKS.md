# Unique-question benchmark report — 18 October 2026

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

## Independently reproduced failures

1. **`atan2(1,2)` in DEG mode:** The app gives approximately `0.463647609` radians; the expected degree result is approximately `26.565051177`. `Math.atan2` is passed through without converting the output into degrees.
2. **`tan(270)` in DEG mode:** The app produces about `5.443746451065123e15` instead of rejecting or marking the mathematically undefined tangent. Floating-point proximity to an odd 90° angle should be treated cautiously.

The app itself was **not patched** for these issues: keeping the regression failures visible avoids silently claiming a perfect score. After a fix, rerun the suite and update this record.

## What was actually compared

- The **ZIP's `index.html` has the same Git blob SHA as the repository `index.html`**, `701ee7252c4d728cef31774f87c46fd29786dccb`, at the time of review. Thus these source-level runs apply to that specific checked repository revision.
- The published GitHub Pages URL rendered the expected Mitchell Tech V120.2 interface in an online read, but **the hosted JavaScript was not exercised**. Direct navigation to the public URL (and even local HTTP/file URLs) was blocked for the automated browser in the testing environment.
- Seven *actual Chromium controls* were tested by injecting the identical repository HTML into an otherwise empty browser page: a distinct calculator expression, storing its result in memory, two unique tutor inputs (algebra and differentiation), degree-mode button switching, 390-pixel horizontal layout, and zero uncaught page errors. **This is not a persistence/reload test**, because the isolated in-memory page does not have the website's storage origin.

## Method and limitations

The new generator uses fixed pseudorandom seed **20261018**, creating distinct arithmetic, powers, scientific functions, and nested expressions. Reference expectations are computed separately using JavaScript operators and standard `Math` functions rather than the calculator parser. These checks detect implementation mismatches but **do not establish independent arbitrary-precision correctness**: the app and reference both use IEEE-754 floating point. The supplied 2,151-case fixed corpus was retained as input, with the two exact repeats excluded from execution.

Numeric comparisons use a mixed absolute/relative tolerance, and the old fixed cases respect the calculator's 10-significant-digit display. Tutor tests verify distinct commands and expected snippets only; they are smoke tests, not a comprehensive assessment of explanations. Real iOS/Android devices, Safari/Firefox, downloaded JSON contents, browser storage across real reloads, file restoration across computers, and external AI/browser-agent integrations were not retested here.

**Important:** The existing `tests/full-spectrum-results.json` committed before this report is a *historical artifact*. Re-run the scripts to produce fresh reports from the modified harness. Nothing in this report supports the claim that an embedded LLM is present: the tutor is offline and rule-based, and the source-recall system is local.

## Follow-up recommendations

First fix and regression-test DEG-mode `atan2` and tangent singularities. Then run a real deployed-site browser matrix (Chrome, Firefox, Safari, mobile browsers) and test actual JSON export/import, browser storage persistence, and AI-agent UI navigation. Save both results and the exact deployed source revision so the site and repository can be compared byte for byte.
