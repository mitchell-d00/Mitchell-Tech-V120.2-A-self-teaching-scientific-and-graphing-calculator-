
## Direct JavaScript API regression — 18 October 2026

A browser-local, keyless `window.MitchellTech` interface was added for mathematical calculation, angle overrides, optional history recording, Mr. E tutor answers, graph editing and point sampling, differentiation, integration and numeric roots. The parser is used directly; expressions are never executed as JavaScript. The global is available to scripts executing in the page, not as an HTTP endpoint. See [JAVASCRIPT-API.md](JAVASCRIPT-API.md).

**Validation on the edited source:** 78/78 Node.js API assertions across 22 nonrepeating expression inputs; 32/32 Chromium API checks at 390px and 1280px; 104/104 existing application checks; 69/69 Mr. E checks; 25/25 clear-controls checks; and the existing fixed full-spectrum suite with zero failures. Browser tests were performed with locally injected HTML and isolated mock storage, **not by exercising the deployed GitHub Pages origin**. The previously published extended 22,242-case benchmark was not rerun during this API change.

CAS and guided tutorial additions:

```sh
node tests/cas-checks.cjs
node tests/cas-worker.cjs
node tests/mr-e-checks.cjs
node tests/javascript-api.cjs
node tests/clear-controls.cjs
# Requires Playwright and an installed Chromium:
node tests/cas-browser.cjs
```

`CHROMIUM_EXECUTABLE` may point to an existing browser. The worker test includes a real eight-second timeout; it uses Node worker_threads and is not browser UI validation. See BENCHMARKS.md for the outstanding browser verification.
