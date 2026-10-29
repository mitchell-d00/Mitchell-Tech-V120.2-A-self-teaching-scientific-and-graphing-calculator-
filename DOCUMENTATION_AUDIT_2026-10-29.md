# Documentation review — 29 October 2026

[Overview](README.md) · [User guide](USER_GUIDE.md) · [Testing](TESTING.md)

Reviewed main at **`07693feaef5d589d1ad82f8488fd43f6d5537a60`**, after the
offline CAS/tutorial implementation and its documentation clarification.
This change updates documentation and browser-test setup. It does not change the application,
mathematical engine, vendor bundle, storage format, test cases, or historical
report bytes.

## Findings and corrections

| Finding | Correction |
|---|---|
| README explained CAS but gave little guidance on graph controls, lessons, recall or saving. | Added current feature/storage overview and focused user/backup guides. |
| TESTING.md began with an old API update and omitted several current suites. | Added the complete eight-suite Node sequence, coverage, generated reports, and three distinct browser harnesses. |
| DEVELOPING.md mixed older measured results with appended implementation notes. | Reorganized source map, math contracts, storage compatibility, CAS lifecycle and release procedure; centralized testing details. |
| Base Mr. E topics were called 20. | Source inspection found 19 base topics, 18 additional CAS topic entries, 25 function/operator references, and a separate 13-lesson course. |
| API graph example assumed graph index 1. | Use the successful `addGraph` response's actual index. |
| Direct CAS versus UI acknowledgement/rendering could be confused. | Documented Promise results, shared cancellation, separate UI rendering and different function/operator sets. |
| Notebook/JSON semantics and omissions were scattered in inline help. | Documented four browser stores, replacement on import, snapshot/export distinctions, size bounds and transient CAS/tutorial/practice state. |
| Historical reports looked like current verification. | Added a dated benchmark section and retained earlier results as historical. |
| tests/Readme was empty. | Added a pointer to complete test instructions and report-preservation policy. |
| Chromium was assumed to exist in the test environment. | Added a CI job that installs pinned test-only Playwright and its matching Chromium before running the existing suites. |

The root [third-party notice](THIRD-PARTY-NOTICES.md) already matches embedded
Nerdamer 1.1.13 and its MIT notice, so it was retained unchanged alongside the
project [license](LICENSE).

## Source and live-site parity

Downloaded the supplied [live calculator HTML](https://mitchell-d00.github.io/Mitchell-Tech-V120.2-A-self-teaching-scientific-and-graphing-calculator-/).
It matched repository `index.html` byte for byte:

- Size: **652,498 bytes**.
- SHA-256: **`7b673ae049997f6e14f0aadaf122f1efb85e44bcd6624c4f03311260750c1242`**.
- App label: **V120.2**; page-local API: **1.1.0**; Nerdamer: **1.1.13**; notebook format: **1**.

The HTML parser found no external `src` or `href` asset references. Downloaded
HTML/source parity does not execute the application, prove browser storage
retention, or establish universal mathematical correctness.

## Executed checks

All eight non-browser Node scripts passed under **Node.js 24.22.1**:

| Suite | Passed |
|---|---|
| Fixed full-spectrum | 2,203 / 2,203 unique questions; two duplicates skipped |
| Application/engine | 104 / 104 |
| Extended unique benchmark | 22,242 / 22,242; two duplicates skipped |
| Mr. E | 139 / 139 unique prompts |
| JavaScript API | 78 assertions / 22 distinct expressions |
| Selective clear controls | 25 / 25 |
| CAS mathematical/validation | 36 / 36 |
| CAS worker/lifecycle | 10 / 10, including cancellation, supersession, timeout and recovery |

Counts overlap across runners. The extended benchmark is deterministic developer
coverage, not independent evaluation or 22,242 symbolic proofs. Worker execution
uses Node worker_threads with browser-like wrappers, not a real browser.

The fixed-spectrum script rewrites its tracked JSON report when run. The
historical tracked file was restored after reviewing the new 2,203-case result;
generated Mr. E/unique reports were inspected without replacing frozen records.
Final checks verify local documentation links, script references, diff whitespace,
and unchanged application/test/vendor bytes.

## Browser checks and remaining work

`node tests/cas-browser.cjs` was attempted. The first launch could not create its
temporary directory in this environment. Retrying with a writable `TMPDIR`
resolved that, then failed because Playwright's Chromium executable was missing.
The Playwright 1.62.1 CDN returned invalid ZIP data. A direct official
Chrome-for-Testing 151.0.7922.34 download matched its 120,231,126-byte length,
upstream MD5 and ZIP integrity; it installed but exited with `SIGTRAP` before
opening a page. A serverless Chromium 153 build also failed at startup. No local
browser pass is claimed. The two Python browser scripts were not rerun locally.

The provided CAS browser harness opens the local file; the Python API/clear
harnesses inject HTML with mocked storage. Neither is a hosted persistence or
device-to-device backup test. Follow [TESTING.md](TESTING.md) for those separate
checks, plus Safari/Firefox and real mobile devices.

The baseline had no tracked CI workflow. The added
[calculator validation workflow](.github/workflows/calculator-checks.yml) installs
Playwright 1.58.0 and matching Chromium/Linux dependencies, runs the eight Node
suites plus the real local-file browser harness, and preserves reports/screenshots.
Its result belongs to the candidate commit tested. It does not configure required
branch checks, deploy the app, or verify hosted persistence. The live source
comparison above records the existing published page only.

### CI outcome

After correcting runner-specific path setup in the first workflow draft,
[Actions run 40881450054](https://github.com/mitchell-d00/Mitchell-Tech-V120.2-A-self-teaching-scientific-and-graphing-calculator-/actions/runs/40881450054)
passed for candidate `628375c440bdf8a2326e98b4f9b4a5113ab0e3ab`: all eight Node
suites plus **82 / 82 Chromium CAS/tutorial checks** at 390px and 1366px.
Playwright 1.58.0 installed Chrome/Headless Shell 145.0.7632.6 (revision 1208)
and Linux dependencies successfully. This verifies the new automatic browser
setup and existing local-file harness on Ubuntu, rather than claiming the local
workspace startup failures were resolved or the hosted origin was exercised.
