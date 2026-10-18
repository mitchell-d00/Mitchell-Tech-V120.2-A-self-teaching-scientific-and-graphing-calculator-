
## Direct JavaScript API for AI/browser agents (no API key)

The standalone calculator now exposes **`window.MitchellTech`**, a **browser-local JavaScript API** for mathematical evaluation, Mr. E tutoring, graphing and sampling, numeric analysis and safe workspace controls. No API key, server, network or external dependency is required to use it. A browser agent can call it with `page.evaluate`, but a different website cannot read the app's local storage remotely through this interface. See [JAVASCRIPT-API.md](JAVASCRIPT-API.md) for method contracts, examples, security boundaries and tests.

```js
window.MitchellTech.calculate('sqrt(144)+2^3'); // {ok:true, value:20, ...}
window.MitchellTech.askMrE('teach graphing');
window.MitchellTech.addGraph('x^2-4');
```
