# Meet Mr. E — your local math coach

Mr. E is the expanded offline teaching interface in **Mitchell Tech V120.2**. It remains embedded in the single `index.html` file: **no external API, language model, account, or internet connection is needed** to ask supported questions.

## Two calculation interfaces

The original `differentiate` tutor command uses symbolic rules with steps; `integrate … from … to …` uses numerical Simpson integration. Those commands remain available alongside the new symbolic CAS.

For symbolic algebra, enter **`cas factor(x^2-4)`**, **`cas expand((x+1)^3)`** or **`cas integrate(x^2,x)`** in Mr. E. Results appear in the **Computer algebra** panel. A bare prompt such as `factor x^2-4` is not a recognized command. You can also enter `factor(x^2-4)` directly in that panel, or use `await MitchellTech.cas('factor(x^2-4)')` in the page console. An indefinite CAS integral returns an antiderivative; add `+ C` for the general family.

For guided teaching, ask `tutorial factor`, then use Next step, Back and Run example. Tutorials explain methods and examples; they do not produce a derivation trace for every CAS result.

## What Mr. E teaches

- **25 function/operator explanations:** `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`, `sinh`, `cosh`, `tanh`, `sqrt`, `cbrt`, `abs`, `ln`, `log`, `exp`, `floor`, `ceil`, `round`, `sign`, `min`, `max`, `pow`, `factorial`, and postfix `%` (called `percent` in the reference).
- **20 local teaching topics:** arithmetic, fractions, percentages, negatives, powers, roots, trigonometry, logarithms, equations, functions/domains, Cartesian graphing, polar coordinates, parametric curves, derivatives, integrals, statistics basics, calculator controls, local memory, and benchmark interpretation. Related words can map to a lesson.
- **Symbolic CAS:** Simplification, expansion, factoring, equation systems, symbolic integration and other operations through the `cas` command and Computer algebra panel; see the CAS section below for limits.
- **Original worked calculations:** Reuses the calculator's expression parser, numeric evaluator, linear/quadratic solver, symbolic derivatives, numerical integration, and closed local source recall.
- **Graph walkthroughs:** Explains how to plot a Cartesian expression, shows example `x→y` points, identifies a sampled y-intercept, flags possible symmetry *without claiming a proof*, and connects the graph to Trace, f′, and the numerical lab.
- **Practice:** Distinct prompts for major topics, simple answer checking, hints, and a shown solution. The current practice task is held in the active browser tab; it is not an adaptive AI tutor.

Try these prompts directly in **Mr. E · Math coach**:

```text
teach fractions
teach graphing
teach derivatives
what is atan2
what is logarithm
list functions
explain graph x^2-4
explain graph sqrt(x)
why is tan(90) undefined?
practice powers
hint
answer 512
show solution
solve x^2-5*x+6=0
differentiate x^x
integrate sin(x) from 0 to pi
explain test sin(pi)
```

## Explain an actual benchmark test

Run `node tests/unique-benchmarks.cjs` at the repo root to produce `tests/unique-benchmarks-results.json`, then use **Load benchmark JSON** under Mr. E to select the generated report. Ask, for example, `explain test MT-000001` to see:

1. The report's own test ID and category.
2. The stored input question and its saved expected and actual values.
3. The report's pass/fail claim (clearly identified as *imported*, not independently certified).
4. A teaching explanation when the parser, symbolic engine, or tutor supports it—or a clear limitation and next-step suggestion when it does not.

The loader accepts up to **35,000 test records** in a JSON file smaller than 16 MB, checks individual IDs and rejects duplicate IDs. Imported records are kept **in this tab only**, not automatically written to browser storage. The user controls which local report is opened. `explain test <expression>` also works without importing a report, but has no saved expected/actual result to compare.

**Not every benchmark can be algebraically explained.** For example, a specialized graph root-search test may need an interval, and sampled/numerical work is not an exact proof. Mr. E reports when it cannot independently reproduce a test rather than inventing an explanation.

## Independent Mr. E regression tests

```sh
node tests/mr-e-checks.cjs
node tests/full-spectrum.cjs
node tests/application-checks.cjs
node tests/unique-benchmarks.cjs
```

The new `mr-e-checks.cjs` verifies coverage of all supported function references, all 20 teaching topics, distinct graph and math explanations, a practice session, and validation of imported benchmark records.

**18 October 2026 local verification:** 69 / 69 *unique Mr. E prompt tests*, 2,205 / 2,205 checks using the original fixed-case legacy harness (before repository deduplication), 104 / 104 application checks, and 29 / 29 Chromium tutor/UI checks passed. Chromium tested locally injected HTML, **not the published GitHub Pages deployment**. The earlier 22,242 unique benchmark outcome remains a previously published result, not a claim that the complete extended suite was rerun for this tutor update.

## Limitations worth knowing

Mr. E is a deterministic, local **rules-based teacher**, not a general-purpose LLM or a system that trains itself. It can explain many supported functions and individual expressions but cannot guarantee coverage or correctness of every mathematical topic, proof, or imported test. Symbolic differentiation supports a subset of functions; numerical root and integral routines have convergence, domain, and precision limits. The test importer treats JSON as external data, never executable code, and tutor output is placed into the page using text content rather than untrusted HTML. Device-to-device persistence still requires exporting and importing the workspace JSON.

The JavaScript and topic reference remain inline in `index.html` to keep the whole tool offline-capable. Add new *distinct* examples to `tests/mr-e-checks.cjs` whenever a lesson, calculation method, or test interpretation changes.

## Computer algebra and guided tutorials (26 October 2026)

The new **Computer algebra** panel embeds Nerdamer 1.1.13 (Algebra, Calculus, Solve and Extra) inside the HTML. It works without a CDN or server. Select an operation to load its example, then choose **Run CAS** or **Mr. E: teach this**.

18 guided operations cover simplification, expansion, factoring, equation solving (including complex candidates), systems, differentiation, symbolic and definite integration, limits, finite sums/products, substitution, determinants, inverse/transpose matrices, partial fractions and Laplace/inverse Laplace transforms.

Try `how do I use sin?`, `tutorial factor`, `tutorial CAS`, `tutorial memStore`, `teach cas limit`, or `list tutorials`. All 25 existing function/operator references and all CAS operations have guided tutorials. Existing topic lessons and controls can also be opened by exact name/ID. **Next step**, **Back**, **Run example** and **Stop tutorial** operate the active tutorial. Numeric examples use the current RAD/DEG mode and report it; CAS examples run in the CAS panel. Lessons about controls/topics provide instructions rather than automatically manipulating controls. Unknown requests explicitly report missing coverage.

Useful CAS commands:

```text
factor(x^2-9)
expand((x+2)^3)
solve(x^2+1=0,x)
system(x+y=3; x-y=1)
diff(sin(x)*x^2,x)
integrate(x^2,x)
defint(x^2,0,3,x)
limit(sin(x)/x,x,0)
sum(k^2,k,1,5)
substitute(x^2+y,x,3)
determinant(matrix([1,2],[3,4]))
partfrac(1/(x^2-1),x)
```

`cas <command>` in Mr. E starts the operation and displays its result in Computer algebra. `list CAS functions` lists the guided command examples. General expressions accept the engine's supported mathematical functions through an explicit allowlist; JavaScript, assignments and arbitrary engine commands are not accepted.

CAS is a separate symbolic mode: **radians only**, arbitrary symbols, exact rational arithmetic and complex values. It does not read `ans`, `mem`, sliders or the numeric calculator's angle setting. `ln` means natural logarithm; `log` and `log10` mean base ten. Base-ten logarithms are preserved as exact natural-log ratios (for example `ln(1000)/ln(10)`), rather than forced into floating-point approximations. Natural logarithms in results are displayed as `ln`.

This is broad computer algebra support, not a promise to solve every problem. Preserve restrictions from the original expression after cancellation; add **+ C** to indefinite integrals; verify roots by substitution. Solver results may be incomplete, branch/domain and convergence conditions are not automatically certified, and unsupported integrals/transforms may remain unevaluated. Definite integration can use approximate numerical methods. The engine may leave expressions such as `factorial(1)` symbolic. Numeric graphing retains the original real-valued engine.

Each CAS request runs in a fresh Web Worker, with **Cancel** and an eight-second timeout. Starting another request cancels the previous one. This also resets engine variables between requests. Inputs are limited to 1,000 characters and 40 nested groups; systems accept 2–6 equations. Tutorial state and CAS output stay in the current tab and are not included in workspace backups. Browsers must permit Blob workers.
