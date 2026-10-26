
## Direct JavaScript API for AI/browser agents (no API key)

The standalone calculator now exposes **`window.MitchellTech`**, a **browser-local JavaScript API** for mathematical evaluation, Mr. E tutoring, graphing and sampling, numeric analysis and safe workspace controls. No API key, server, network or external dependency is required to use it. A browser agent can call it with `page.evaluate`, but a different website cannot read the app's local storage remotely through this interface. See [JAVASCRIPT-API.md](JAVASCRIPT-API.md) for method contracts, examples, security boundaries and tests.

```js
window.MitchellTech.calculate('sqrt(144)+2^3'); // {ok:true, value:20, ...}
window.MitchellTech.askMrE('teach graphing');
window.MitchellTech.addGraph('x^2-4');
```

### Offline computer algebra + Mr. E tutorials

The Computer algebra panel adds symbolic algebra, calculus, equation systems and matrices using an embedded Nerdamer engine. Ask Mr. E **“how do I use sin?”**, **“tutorial factor”** or **“tutorial CAS”**, then use Next step, Back and Run example. See [MR-E.md](MR-E.md) for syntax and mathematical limitations, [JAVASCRIPT-API.md](JAVASCRIPT-API.md) for the asynchronous CAS API, and [BENCHMARKS.md](BENCHMARKS.md) for validation status (browser release verification is pending).
