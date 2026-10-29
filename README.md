# Mitchell Tech V120.2 — self-teaching scientific and graphing calculator

An offline scientific calculator and graphing workbench with **symbolic computer algebra** and **Mr. E**, a local rules-based math coach. The application is contained in `index.html`, including its bundled Nerdamer 1.1.13 CAS engine; no API key, account, server or runtime dependency download is required.

[Open the live calculator](https://mitchell-d00.github.io/Mitchell-Tech-V120.2-A-self-teaching-scientific-and-graphing-calculator-/), or download `index.html` and open it in a modern browser that supports Blob workers.

A fresh workspace starts in Standard mode with a sample `x+2` graph; saved work
can restore a different setup. Choose
**Scientific** or **My board** for advanced keys and the RAD/DEG control. The
V120.2 application label, JavaScript API 1.1.0, bundled Nerdamer 1.1.13, and
version-one notebook format are separate version identifiers.

## Explore and save your work

- Plot up to **12 Cartesian, polar, or parametric rules**; use sliders `a` and
  `b`, drag/pinch navigation, Graph/Table, Trace, and numerical analysis.
- Use **Teaching on**, **Explain a control**, and the **13 progressive lessons**
  alongside Mr. E's topic/function/CAS tutorials. “Self-teaching” refers to local
  lessons and rules; the app does not train or rewrite itself.
- Save up to **50 named workspace snapshots** in this browser. Export a JSON
  backup to transfer the current workspace, lesson progress, and personal/recent
  recall pages. A backup does not contain every saved notebook or the current CAS
  result; see [saving and file formats](BACKUPS.md).
- **Crawl & recall** indexes this application's local guide, workspace, notebooks,
  history, and personal pages. It does not crawl websites or arbitrary local files.
  Matching uses weighted words, not the Combined MPLPB provenance engine or
  independent fact checking.

See the [user guide](USER_GUIDE.md) for controls, expression syntax, clearing,
keyboard shortcuts, and troubleshooting.

## Numerical calculator and symbolic CAS

The original calculator methods and the new **Computer algebra** panel have separate interfaces:

| Task | Original calculator API | Symbolic CAS API |
| --- | --- | --- |
| Differentiate | `MitchellTech.differentiate('x^3')`: supported symbolic rules with teaching steps | `await MitchellTech.cas('diff(x^3,x)')`: symbolic engine result |
| Integrate | `MitchellTech.integrate('x^2',0,3)`: numerical Simpson approximation | `await MitchellTech.cas('integrate(x^2,x)')`: antiderivative `(1/3)*x^3`; add `+ C` |
| Find solutions | `MitchellTech.findRoots('x^2-4',-3,3)`: numerical real-root search | `await MitchellTech.cas('solve(x^2-4=0,x)')`: equation solver; verify candidates and completeness |
| Factor | Use the CAS panel | `await MitchellTech.cas('factor(x^2-4)')` |
| Expand | Use the CAS panel | `await MitchellTech.cas('expand((x+1)^3)')` |
| Simplify | Use the CAS panel | `await MitchellTech.cas('simplify((x^2-1)/(x-1))')`; original exclusion `x≠1` still applies |

The CAS also provides systems, limits, finite sums/products, substitution, matrix determinants/inverses/transposes, partial fractions and Laplace transforms. Its 18 guided operations are listed in `MitchellTech.casOperations()`.

This is an embedded symbolic CAS with documented limits, not a guarantee that every expression can be solved. Unsupported operations may remain unevaluated; solver results may be incomplete or approximate. Domain, branch and convergence conditions are not automatically certified. CAS uses radians and supports complex values, while ordinary calculations and graphs use the original real-valued engine and RAD/DEG setting. Definite CAS integrals may use numerical approximation. CAS work can be cancelled and stops after eight seconds.

## Mr. E lessons and tutorials

Ask **“how do I use sin?”**, **“tutorial factor”** or **“tutorial CAS”**, then use **Next step**, **Back**, **Run example** and **Stop tutorial**. Tutorials cover all 25 existing function/operator references and all 18 guided CAS operations, alongside topic and control guidance.

For a calculation through Mr. E, enter **`cas factor(x^2-4)`**. The result appears in the Computer algebra panel. A bare request such as `factor x^2-4` is not a supported tutor command. `tutorial factor` explains the operation; `run example` executes its example. Mr. E is a deterministic rules-based teacher, not an embedded language model or a universal proof generator.

## JavaScript API (1.1.0)

In the calculator page's developer console:

```js
const mt = window.MitchellTech;
mt.calculate('sqrt(144)+2^3'); // {ok:true, value:20, ...}
mt.askMrE('tutorial factor');
mt.addGraph('x^2-4');
await mt.cas('factor(x^2-9)'); // {ok:true, result:'(-3+x)*(3+x)'}
await mt.cas('integrate(x^2,x)'); // {ok:true, result:'(1/3)*x^3'}; add + C
```

`cas()` is asynchronous; existing numerical, graphing and tutoring methods remain synchronous. Browser agents can call the API in this page's context with `page.evaluate`. This is a local JavaScript interface, not a remote HTTP service.

## Documentation and verification

- [User guide](USER_GUIDE.md): calculator, graphs, numerical lab, lessons, recall and settings.
- [Saving and file formats](BACKUPS.md): autosave, named snapshots, JSON/PNG, limits and restore behavior.
- [JavaScript API](JAVASCRIPT-API.md): method contracts, numerical/symbolic distinctions and examples.
- [Mr. E guide](MR-E.md): lessons, tutorials, CAS syntax and limitations.
- [Developing](DEVELOPING.md) and [Testing](TESTING.md): implementation and repeatable checks.
- [Benchmarks](BENCHMARKS.md): measured results and outstanding verification.
- [Third-party notices](THIRD-PARTY-NOTICES.md): bundled Nerdamer license.
- [Documentation review — 29 October 2026](DOCUMENTATION_AUDIT_2026-10-29.md): source/live parity, corrections and checks actually run.

On 29 October 2026, the downloaded live HTML matched the repository source
byte for byte and all eight Node suites passed, including 22,242 unique benchmark
questions. The new [CI workflow](.github/workflows/calculator-checks.yml) also
installed its matching Chromium successfully and passed **82 real-browser CAS
and tutorial checks** at 390px and 1366px. Counts across suites overlap and must
not be summed. These browser tests open the local HTML; hosted persistence and
cross-device restoration remain separate checks. See the dated review and
[benchmark history](BENCHMARKS.md) for exact evidence and limits.

## Licence

[MIT](LICENSE), with the bundled Nerdamer notice retained in the HTML and
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
