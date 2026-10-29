# Testing Mitchell Tech V120.2

[Overview](README.md) · [Developing](DEVELOPING.md) · [Dated benchmark evidence](BENCHMARKS.md)

Run commands from the repository root with Node.js 22 or another recent supported
Node release. All eight non-browser suites use built-in Node modules and the
embedded HTML source; no npm installation is required for them.

## Complete Node sequence

```sh
node tests/full-spectrum.cjs
node tests/application-checks.cjs
node tests/unique-benchmarks.cjs
node tests/mr-e-checks.cjs
node tests/javascript-api.cjs
node tests/clear-controls.cjs
node tests/cas-checks.cjs
node tests/cas-worker.cjs
```

| Suite | Coverage | 2026-10-29 local result |
|---|---|---|
| `full-spectrum.cjs` | Fixed expression corpus, domains, modes, tutor, roots, integrals, derivatives and recall; two duplicate expressions skipped. | 2,203 / 2,203 |
| `application-checks.cjs` | Engine/UI initialization, teaching, local recall, storage and backup validation via DOM/canvas doubles. | 104 / 104 |
| `unique-benchmarks.cjs` | Deduplicated fixed cases plus 20,000 fixed-seed expressions, tutor prompts and targeted regressions. | 22,242 / 22,242 |
| `mr-e-checks.cjs` | Function/topic/CAS tutorials, graph explanations, practice and imported-record validation. | 139 / 139 unique prompts |
| `javascript-api.cjs` | Same-page API, state/mutations, angle overrides, graph types and errors. | 78 assertions / 22 distinct expressions |
| `clear-controls.cjs` | Selective graph/history clearing and unrelated-state preservation. | 25 / 25 |
| `cas-checks.cjs` | CAS mathematical output and input validation. | 36 / 36 |
| `cas-worker.cjs` | Real worker source via Node worker_threads: computation, cancellation, supersession, timeout and recovery. | 10 / 10 |

These are overlapping development suites, not a combined unique total or
independent mathematical certification. The unique benchmark uses seed
`20261018`, globally normalizes/deduplicates questions, and assigns stable
`MT-000001`-style IDs. Expected numeric values use separate JS Math/operators;
they share the calculator's IEEE-754 arithmetic limits. Numeric tolerance,
formatted output, symbolic equality, and tutor phrase checks are different tests.

The worker test intentionally waits for one real eight-second timeout. It
does not exercise browser worker policies, rendering, or native storage.

## Generated reports

- `full-spectrum.cjs` writes `tests/full-spectrum-results.json`; the tracked baseline file is a historical report, so review/restore it after a local rerun unless intentionally publishing a new dated result.
- `unique-benchmarks.cjs` writes `tests/unique-benchmarks-results.json`.
- `mr-e-checks.cjs` writes `tests/mr-e-results.json`.

Inspect summaries/failure rows and process exit codes. Generated JSON is not
automatically a release artifact. Preserve historical source cases and reports;
do not silently replace earlier counts with later runs. Mr. E's benchmark loader
can explain saved rows, but loading them does not rerun or authenticate them.

## Actual browser checks

The JavaScript browser suite needs Playwright for Node and an installed Chromium.
In a normal development environment, install Playwright separately and install
its managed browser, or set `CHROMIUM_EXECUTABLE` to an existing compatible one:

```sh
npm install --no-save --package-lock=false playwright@1.58.0
npx playwright install chromium
node tests/cas-browser.cjs
# Or select an existing browser:
CHROMIUM_EXECUTABLE=/path/to/chromium node tests/cas-browser.cjs
```

The test also recognizes `CODEX_PRIMARY_RUNTIME_NODE_MODULES` when that environment
provides Playwright. `CAS_SCREENSHOT_DIR` can point to an existing output directory
for screenshots. Avoid committing optional dependencies or generated screenshots
unless part of a deliberate change. Browser temporary directories must be writable;
set `TMPDIR` to a writable directory if necessary.

`cas-browser.cjs` opens the actual local `index.html` via a file URL at **390px and
1366px**. It exercises Blob workers, factoring, tutorials, all function references,
complex solutions, rejected syntax, cancellation/recovery, and no HTTP requests.
It does not navigate to GitHub Pages or test notebook round trips after reload.

Two older browser scripts use **Python Playwright** plus Chromium hard-coded at
`/usr/bin/chromium`:

```sh
python -m pip install playwright
python tests/javascript-api-browser.py
python tests/clear-controls-browser.py
```

These inject local HTML at phone/desktop widths and replace localStorage with an
isolated in-memory double. They cover UI/API/clear behavior, not hosted origin
persistence. Installing Playwright's managed browser alone does not change their
hard-coded executable path. Adjust it locally if your browser is elsewhere.

The initial 2026-10-29 attempt found a missing executable. The default Playwright
1.62.1 CDN download then returned invalid ZIP data in this workspace. Downloading
the matching Chrome-for-Testing 151.0.7922.34 archive directly from Google's
official storage succeeded and passed archive/hash checks, but startup exited
with `SIGTRAP`. A serverless Chromium 153 build also could not start a page.
These local setup attempts are not browser test passes. Earlier browser runs
remain dated in [BENCHMARKS.md](BENCHMARKS.md).

## Automated browser setup

[calculator-checks.yml](.github/workflows/calculator-checks.yml) runs on PRs to
main, main pushes, or manual dispatch. It installs test-only **Playwright 1.58.0**
in a temporary directory and uses that exact package's CLI to install Chromium
and Linux dependencies. This avoids assuming a browser already exists at a
hard-coded path. A different Playwright version needs its own matching browser
installation; installing one package's Chromium does not populate another's
expected revision.

The job runs all eight Node suites and the local-file CAS/tutorial browser suite,
then uploads reports/screenshots. These dependencies never enter `index.html` or
become an application runtime requirement. Check the workflow result for the
specific candidate commit; merely having YAML is not a passing test or configured
branch-protection rule. Hosted-origin/reload/backup checks below remain separate.

**Verified 2026-10-29:** [Actions run 40881450054](https://github.com/mitchell-d00/Mitchell-Tech-V120.2-A-self-teaching-scientific-and-graphing-calculator-/actions/runs/40881450054)
passed all eight Node suites and **82 Chromium CAS/tutorial checks** at 390px
and 1366px. It installed Chrome/Headless Shell **145.0.7632.6**, Playwright
revision **1208**, using pinned Playwright 1.58.0. Tested candidate:
`628375c440bdf8a2326e98b4f9b4a5113ab0e3ab`. This is successful automated browser
installation/execution on the Ubuntu runner, separate from earlier local startup
failures and from testing a deployed origin.

## Hosted and portability checklist

Separately check the [live site](https://mitchell-d00.github.io/Mitchell-Tech-V120.2-A-self-teaching-scientific-and-graphing-calculator-/):

1. Compare served `index.html` bytes/digest with the tested revision; successful HTTP retrieval does not execute JavaScript.
2. Exercise calculator/angle/graph controls and actual displayed text at phone/desktop sizes; check uncaught errors.
3. Run CAS and tutorial actions, cancel work, and recover with a simple expression. Confirm worker policy and offline operation in the intended browser.
4. Record a distinct calculation, save a named notebook/personal page and lesson progress, reload the same origin, and verify restoration.
5. Export JSON, restore it in an isolated origin/profile, and verify the contents/omissions in [BACKUPS.md](BACKUPS.md). Never clear a user's real store merely to run a test.
6. Check Safari/Firefox and real mobile devices separately; one Chromium run is not cross-browser evidence.

Record tested revision, HTML digest, browser/platform, file versus hosted context,
test counts, failures and omissions. The added CI workflow does not itself
configure required branch checks or automated postdeployment validation.
