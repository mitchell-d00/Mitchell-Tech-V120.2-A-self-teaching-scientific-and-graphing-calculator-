# Mitchell Tech direct JavaScript API (v1.1.0)

**No API key, server, account, token, subscription, network connection, or runtime dependency download is required. The Nerdamer symbolic engine is bundled in the HTML.** The standalone `index.html` exposes a browser-local object, `window.MitchellTech`, once the page finishes loading. External AI agents can operate this object **if they can execute JavaScript in the calculator's page** (for example with browser automation); merely knowing the public URL does not grant remote access to someone's locally stored data.

This is a **JavaScript API**, **not an HTTP/REST API**. Code running on another website cannot directly reach the calculator through the usual cross-origin browser security rules. Browser scripts share the current page's privileges, so run only scripts or agents you trust. There is no remote authentication layer because the API is not reachable over the network by itself.

## Choose the mathematical interface

The original methods remain available: `differentiate()` provides supported symbolic rules and teaching steps, while `integrate()` uses numerical Simpson integration and `findRoots()` searches numerically. The added **`cas()` method is asynchronous** and exposes the embedded symbolic engine for simplification, expansion, factoring, equation solving, antiderivatives and other operations. Testing only the original methods does not exercise the CAS.

| Task | Call | Meaning |
| --- | --- | --- |
| Numerical integral | `mt.integrate('x^2',0,3)` | Approximate definite integral, about 9 |
| Symbolic antiderivative | `await mt.cas('integrate(x^2,x)')` | `(1/3)*x^3`; add an arbitrary `+ C` |
| Numerical roots | `mt.findRoots('x^2-4',-3,3)` | Real candidates from interval search |
| CAS equation solving | `await mt.cas('solve(x^2-4=0,x)')` | Engine candidates; verify in the original equation |
| Symbolic factoring | `await mt.cas('factor(x^2-4)')` | Product of factors |
| Symbolic expansion | `await mt.cas('expand((x+1)^3)')` | Expanded polynomial |
| Symbolic simplification | `await mt.cas('simplify((x^2-1)/(x-1))')` | `1+x`; retain the original exclusion `x≠1` |

## Try it in your own browser

Open the [GitHub Pages calculator](https://mitchell-d00.github.io/Mitchell-Tech-V120.2-A-self-teaching-scientific-and-graphing-calculator-/) and use the browser's Developer Tools console:

```js
const mt = window.MitchellTech;
mt.version;                               // "1.1.0"
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
await mt.cas('factor(x^2-9)');            // {ok:true, result:'(-3+x)*(3+x)'}
await mt.cas('integrate(x^2,x)');         // {ok:true, result:'(1/3)*x^3'}; add + C
mt.casOperations();                       // guided CAS operations and examples
```

The `sampleGraph(1,3)` example assumes the initial built-in graph remains at index `0`. Indices are zero-based. Use the index returned from `addGraph` rather than guessing it in automation.

## Capabilities and responses

| Method | Input | What it does |
| --- | --- | --- |
| `calculate(expression, options?)` | Expression string; `{angle:'rad'|'deg', variables:{x,t,a,b,ans,mem}}` | Numeric evaluation without changing history, settings, or `ans` by default |
| `calculate(expression, {record:true})` | Expression string | Enters the expression through the real calculator UI, saving the answer and history; uses workspace angle and variables |
| `askMrE(question)` | Tutor question or command | Returns Mr. E's local rule-based teaching response; commands such as `plot ...` can update the graph |
| `functions()` | — | Returns a sorted array of original calculator function names; use `casOperations()` for guided CAS operations |
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

`cas(expression)` returns a Promise; await it to receive `{ok:true,result:string}` or `{ok:false,error:string}`. The existing methods in the table above remain synchronous.

| CAS method | Input | Response / behavior |
| --- | --- | --- |
| `cas(expression)` | CAS expression or command string | Promise of a result/error object; fresh worker; cancels previous CAS work |
| `casOperations()` | — | Copy of the guided operation directory: each key maps to `[title, example, guidance]`; not an exhaustive engine-function list |
| `cancelCAS()` | — | Cancels the current request, if any; returns `undefined` |

Synchronous action and numeric methods generally return `{ok:true,...}` for success and `{ok:false,error:'message'}` for invalid inputs or undefined real results. Query methods `functions`, `getState`, `getHistory`, and `listGraphs` return arrays or plain data objects directly. No endpoint or auth credential is involved.

The original calculator parser and the CAS input validator reject unsupported syntax. User expressions are parsed as mathematics, **never executed as JavaScript**. Numeric methods use IEEE-754 floating-point math and the current real-number domain. Results for undefined operations return a structured error. Numerical root finding or integration are approximations, not formal proofs.

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
node tests/cas-checks.cjs
node tests/cas-worker.cjs
node tests/cas-browser.cjs
python tests/javascript-api-browser.py
node tests/application-checks.cjs
node tests/mr-e-checks.cjs
node tests/clear-controls.cjs
node tests/full-spectrum.cjs
```

The Node API, CAS math and worker tests require no additional packages. `tests/cas-browser.cjs` requires Playwright and Chromium; optionally set `CHROMIUM_EXECUTABLE`. Browser checks remain pending for the CAS release; see BENCHMARKS.md. The Python smoke test needs Playwright and a locally installed Chromium executable (`/usr/bin/chromium`) and uses isolated browser storage rather than the hosted GitHub Pages origin. The installed app itself does not need Node or Python.

## Symbolic API (1.1.0)

```js
await MitchellTech.cas('factor(x^2-9)');
// { ok: true, result: '(-3+x)*(3+x)' }
await MitchellTech.cas('system(x+y=3;x-y=1)');
MitchellTech.casOperations(); // names, runnable examples, teaching guidance
MitchellTech.cancelCAS();    // cancels the current symbolic request
```

`cas()` returns a Promise containing `{ok:true,result:string}` or `{ok:false,error:string}`. It uses a fresh offline worker, shares one active request with the UI, and cancels previous work on a new request. The timeout is eight seconds. CAS is separate from the numerical `calculate`/`integrate` methods and the original rule-based symbolic `differentiate` method: radians, symbolic variables, complex values, and the limitations documented in MR-E.md apply. `askMrE('tutorial factor')` returns the current guided step. `askMrE('cas ...')` and `askMrE('run example')` can start work in the CAS panel; use `await cas(...)` to obtain the computed result programmatically.

### CAS syntax, results and limits

Use command syntax such as `factor(x^2-4)`, `expand((x+1)^3)`, `integrate(x^2,x)` or `system(x+y=3;x-y=1)`. In Mr. E, use **`cas factor(x^2-4)`** to start a calculation in the Computer algebra panel; bare `factor x^2-4` is not a recognized tutor command. `askMrE('cas ...')` returns an acknowledgement synchronously, not the computed result. Use `await MitchellTech.cas(...)` when your program needs the result.

`cas()` accepts 1–1,000 characters, at most 40 nested groups, and 2–6 equations in a system. Its eight-second timeout and `cancelCAS()` terminate the worker. Failed, cancelled and timed-out requests resolve to an error object. Starting a new request cancels the previous one, including requests started through the UI. CAS state and results are not saved in workspace backups.

CAS uses radians, symbolic variables, exact rational expressions and complex values. It does not read calculator memory, `ans`, sliders or the RAD/DEG setting. Input/output `ln` means natural log; input `log`/`log10` means base ten and may be returned as an exact ratio of natural logs.

`ok:true` means the engine returned an expression; it does not certify that every requested operation was evaluated, every solution found, or a proof established. Preserve original domain exclusions after cancellation; check solution candidates and branch conditions. Indefinite integration returns an antiderivative without an appended `+ C`; callers must supply that arbitrary constant when presenting the general family. Definite CAS integration may be approximate, and convergence conditions are not certified automatically. CAS results do not include the original differentiator's recorded teaching steps. See [MR-E.md](MR-E.md) for full guidance.
