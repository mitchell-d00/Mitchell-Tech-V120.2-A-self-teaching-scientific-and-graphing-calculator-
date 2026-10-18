# Mitchell Tech direct JavaScript API (v1.0)

**No API key, server, account, token, subscription, network connection, or external library is required.** The standalone `index.html` exposes a synchronous, browser-local object, `window.MitchellTech`, once the page finishes loading. External AI agents can operate this object **if they can execute JavaScript in the calculator's page** (for example with browser automation); merely knowing the public URL does not grant remote access to someone's locally stored data.

This is a **JavaScript API**, **not an HTTP/REST API**. Code running on another website cannot directly reach the calculator through the usual cross-origin browser security rules. Browser scripts share the current page's privileges, so run only scripts or agents you trust. There is no remote authentication layer because the API is not reachable over the network by itself.

## Try it in your own browser

Open the [GitHub Pages calculator](https://mitchell-d00.github.io/Mitchell-Tech-V120.2-A-self-teaching-scientific-and-graphing-calculator-/) and use the browser's Developer Tools console:

```js
const mt = window.MitchellTech;
mt.version;                               // "1.0.0"
mt.functions();                           // supported math functions
mt.calculate('sqrt(144)+2^3');            // {ok:true, value:20, formatted:'20', ...}
mt.calculate('sin(30)', {angle:'deg'});     // approx. 0.5; workspace angle unchanged
mt.askMrE('teach graphing');              // {ok:true, answer:'Mr. E ...'}
mt.addGraph('x^2-4');                     // adds a visible Cartesian graph
mt.listGraphs();                          // copies of current graph records
mt.sampleGraph(1, 3);                    // {ok:true, x:3, y:5, ...}
mt.differentiate('x^3');                  // symbolic derivative where supported
mt.integrate('x^2', 0, 3);                // numerical integral ≈ 9
mt.findRoots('x^2-4', -3, 3);             // numerical roots ≈ [-2,2]
```

The `sampleGraph(1,3)` example assumes the initial built-in graph remains at index `0`. Indices are zero-based. Use the index returned from `addGraph` rather than guessing it in automation.

## Capabilities and responses

| Method | Input | What it does |
| --- | --- | --- |
| `calculate(expression, options?)` | Expression string; `{angle:'rad'|'deg', variables:{x,t,a,b,ans,mem}}` | Numeric evaluation without changing history, settings, or `ans` by default |
| `calculate(expression, {record:true})` | Expression string | Enters the expression through the real calculator UI, saving the answer and history; uses workspace angle and variables |
| `askMrE(question)` | Tutor question or command | Returns Mr. E's local rule-based teaching response; commands such as `plot ...` can update the graph |
| `functions()` | — | Returns a sorted array of available function names |
| `getState()` | — | Read-only snapshot of angle, parameters, last answer, memory, viewport, history count and graphs |
| `getHistory()` | — | Defensive copy of recent recorded calculator operations |
| `listGraphs()` | — | Read-only copies of the graph expressions and indexes |
| `addGraph(expression, {type?,on?})` | Valid math expression; graph type `'cart'`, `'polar'`, or `'param'` | Adds a plotted rule and autosaves; maximum 12 rules |
| `updateGraph(index, expression, options?)` | Existing zero-based index plus new valid rule | Updates and redraws a graph; autosaves |
| `removeGraph(index)` | Zero-based graph index | Removes one rule; autosaves |
| `sampleGraph(index, input)` | Index and real-valued x or t | Evaluates a Cartesian, polar, or parametric curve at a point; no state change |
| `clearGraphs()` | — | Clears plotted rules, preserves history, memory and saved notebooks |
| `clearHistory()` | — | Clears recent calculations, preserves answer, memory and plotted rules |
| `setAngle('rad'|'deg')` | Exact mode string | Changes the application's angle mode and redraws/auto-saves |
| `differentiate(expression)` | Valid supported expression | Returns a symbolic derivative and recorded rule steps, where available |
| `integrate(expression, from, to)` | Expression and finite numeric bounds | Approximates a definite integral by Simpson's method |
| `findRoots(expression, from, to)` | Expression and increasing finite bounds | Searches numerically for real roots; no completeness guarantee |

All methods are synchronous and return serializable objects/arrays. Action and numeric methods generally return `{ok:true,...}` for success and `{ok:false,error:'message'}` for invalid inputs or undefined real results. Query methods `functions`, `getState`, `getHistory`, and `listGraphs` return arrays or plain data objects directly. No endpoint or auth credential is involved.

Invalid expressions are rejected by the existing math parser, **never executed as JavaScript**. Numeric methods use IEEE-754 floating-point math and the current real-number domain. Results for undefined operations return a structured error. Numerical root finding or integration are approximations, not formal proofs.

### AI/browser automation example

In Playwright (JavaScript), after the calculator page loads:

```js
const answer = await page.evaluate(() =>
  window.MitchellTech.calculate('sin(pi/2)')
);
const graph = await page.evaluate(() =>
  window.MitchellTech.addGraph('x^2-4')
);
const points = await page.evaluate(index =>
  window.MitchellTech.sampleGraph(index, 3), graph.index
);
```

The browser agent needs access to that **page context**; it does **not** need an OpenAI API key to use the calculator. An AI service, if the agent uses one, may have its own billing or authentication completely separate from this local JavaScript API.

### Persistence and trust

`calculate()` (default), `sampleGraph`, `differentiate`, `integrate` and `findRoots` do not modify the current calculator history. `calculate(...,{record:true})` and graph editing commands change the current workspace and use its existing autosave behavior. `askMrE` is a *command dispatcher*, not strictly read-only: asking it to `plot` adds a graph, and practice commands maintain local tutor state. The JavaScript API is not exposed as a network service and cannot access someone else's private browser storage across origins. It does not install a background agent.

## Repeatable tests

```sh
node tests/javascript-api.cjs
python tests/javascript-api-browser.py
node tests/application-checks.cjs
node tests/mr-e-checks.cjs
node tests/clear-controls.cjs
node tests/full-spectrum.cjs
```

The Node.js API tests require no packages. The Python smoke test needs Playwright and a locally installed Chromium executable (`/usr/bin/chromium`) and uses isolated browser storage rather than the hosted GitHub Pages origin. The installed app itself does not need Node or Python.
