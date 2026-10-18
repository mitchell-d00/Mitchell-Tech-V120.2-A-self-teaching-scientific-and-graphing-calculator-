# Meet Mr. E — your local math coach

Mr. E is the expanded offline teaching interface in **Mitchell Tech V120.2**. It remains embedded in the single `index.html` file: **no external API, language model, account, or internet connection is needed** to ask supported questions.

## What Mr. E teaches

- **25 function/operator explanations:** `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`, `sinh`, `cosh`, `tanh`, `sqrt`, `cbrt`, `abs`, `ln`, `log`, `exp`, `floor`, `ceil`, `round`, `sign`, `min`, `max`, `pow`, `factorial`, and postfix `%` (called `percent` in the reference).
- **20 local teaching topics:** arithmetic, fractions, percentages, negatives, powers, roots, trigonometry, logarithms, equations, functions/domains, Cartesian graphing, polar coordinates, parametric curves, derivatives, integrals, statistics basics, calculator controls, local memory, and benchmark interpretation. Related words can map to a lesson.
- **Worked calculations:** Reuses the calculator's expression parser, numeric evaluator, linear/quadratic solver, symbolic derivatives, numerical integration, and closed local source recall.
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

**18 October 2026 local verification:** 69 / 69 *unique Mr. E prompt tests*, 2,205 / 2,205 existing mathematical checks, 104 / 104 application checks, and 29 / 29 Chromium tutor/UI checks passed. Chromium tested locally injected HTML, **not the published GitHub Pages deployment**. The earlier 22,242 unique benchmark outcome remains a previously published result, not a claim that the complete extended suite was rerun for this tutor update.

## Limitations worth knowing

Mr. E is a deterministic, local **rules-based teacher**, not a general-purpose LLM or a system that trains itself. It can explain many supported functions and individual expressions but cannot guarantee coverage or correctness of every mathematical topic, proof, or imported test. Symbolic differentiation supports a subset of functions; numerical root and integral routines have convergence, domain, and precision limits. The test importer treats JSON as external data, never executable code, and tutor output is placed into the page using text content rather than untrusted HTML. Device-to-device persistence still requires exporting and importing the workspace JSON.

The JavaScript and topic reference remain inline in `index.html` to keep the whole tool offline-capable. Add new *distinct* examples to `tests/mr-e-checks.cjs` whenever a lesson, calculation method, or test interpretation changes.
