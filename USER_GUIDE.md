# Using Mitchell Tech V120.2

[Overview](README.md) · [Mr. E](MR-E.md) · [Saving and file formats](BACKUPS.md)

## Start and calculate

Open the [live calculator](https://mitchell-d00.github.io/Mitchell-Tech-V120.2-A-self-teaching-scientific-and-graphing-calculator-/), or download `index.html` and open it locally. There is no installation/build step. The HTML embeds its styles, scripts, and symbolic engine. A current browser needs Canvas 2D, modern JavaScript, and Blob workers for CAS; browser storage policies control autosave.

Type `sqrt(144)+2^3` and press **=** or Enter to get 20. **Standard**, **Scientific**, and **My board** change available keys; Scientific/My board expose angle controls and the function board. All supported numeric functions remain available by typing. Choose custom function keys and display settings in **Settings**.

| Syntax | Meaning/example |
|---|---|
| `+ - * / ^` | Arithmetic; `^` is power, not JavaScript XOR. |
| Parentheses / implicit multiplication | `2(x+1)` or `2*x`; named symbols are not split into individual letters. |
| Power/unary minus | `2^3^2` means `2^(3^2)`; `-2^2` is −4, `(-2)^2` is 4. |
| `%` | Literal division by 100: `80+20%` is 80.2; use `80*(1+20%)` for a 20% increase. |
| `!` / `factorial(n)` | Whole-number factorial, 0–170 in the numeric engine. |
| `pi`, `e` | Constants; `π` is normalized to `pi`. |
| `ans`, `mem`, `a`, `b` | Last answer, memory slot, and slider values. |
| `x`, `t` | Graph/analysis inputs; ordinary Calculator asks you to use the lab for `x`/`t`. The API can supply explicit variables. |
| Function calls | `sin(x)`, `sqrt(x)`, `ln(x)`, `log(x)`; two arguments for `min`, `max`, `pow`, `atan2`. |

`ln` is natural log; `log` is base ten. RAD/DEG affects trig input, inverse-trig output, `atan2`, and angular graph parameters. Hyperbolic functions do not use angle conversion. Numeric calculations are real-valued IEEE-754 operations, displayed to about ten significant digits. Undefined/nonfinite results are rejected. Use [CAS](MR-E.md) for symbolic variables, exact rational expressions, or complex calculations.

**MS** stores the latest answer in `mem`; **MR** inserts `mem`; **MC** clears that slot. History retains up to 40 calculations, showing the eight most recent. Clicking history restores the expression for another calculation; saved input context supports reproducible teaching explanations.

## Graphs and the numerical lab

Add/edit up to **12 expressions** and choose a graph type beside each rule:

| Type | Input | Plot |
|---|---|---|
| Cartesian | `x^2-4` | `y=f(x)`. |
| Polar | `4*cos(5*t)` | Radius `r(t)` converted to XY; one turn, 0–2π RAD or 0–360 DEG. |
| Parametric | `3*cos(t);2*sin(t)` | `x(t);y(t)` separated by a semicolon, over the same one-turn range. |

Use each expression's visibility toggle or remove button; sliders `a`/`b` change shared parameters. On-screen keys can target Calculator or a graph: check the **Keys target** selector before using **AC** or **=**. **Graph keys** provides another graph-entry board. Selecting **Explore** loads a sample study into the current workspace; export/save existing work first if you want to keep it separately.

Drag to pan, scroll/pinch or use +/− to zoom. **Fit y** fits sampled Cartesian values vertically; **1:1** equalizes axis scale; **Reset view** restores the viewing window. **Expand** enlarges the viewer. **Trace** follows the first visible Cartesian curve. **f′** draws a numerical derivative overlay. **Table** samples visible Cartesian rules, not polar/parametric paths. PNG exports the graph canvas, not an editable session.

In **Inspect the mathematics**, select a valid Cartesian curve, choose an operation, enter bounds, and press **Analyze function**:

- Value/slope evaluates at the first bound; slope uses a centered finite difference.
- Roots scans/refines candidates within an increasing finite interval.
- Definite integral uses **1,600-panel composite Simpson integration** and signed area; reversed bounds reverse the sign.
- Stationary points are numerical derivative-zero candidates, not a classification of all extrema.
- Intersections use the next visible valid Cartesian curve, wrapping through the list.

Finite sampling can miss narrow features, close roots, singularities, or discontinuities. The graph and lab are numerical tools, not proofs of completeness or convergence. The original symbolic differentiator, numeric integration/root routines, and embedded CAS have distinct contracts; see [the API comparison](JAVASCRIPT-API.md).

## Learn, inspect controls, and recall

**Teaching on/off** shows or hides the teaching card. **Explain a control** enters an inspection mode: selecting a control explains it rather than performing its ordinary action. Exit inspection mode to operate controls normally. **Start learning** / **Resume lesson** opens 13 progressive lessons; completion/progress is saved locally. Mr. E's topic lessons and guided function/CAS tutorials are separate from this 13-lesson course.

**Crawl & recall** rebuilds a bounded local index of built-in help/lessons, current work, calculation history, saved notebook notes, personal pages, and recent records. Add a page in your own words, or remember a teaching card. `recall square root` also queries the index through Mr. E.

Recall ranks matching words in titles, keywords, and text. A clear match displays the page and its source; close scores offer choices; no qualifying match says “Not in these pages.” It is a lightweight local index inspired by MPLPB, not the separate Combined MPLPB sealed/hash/provenance engine. A recalled historical calculation or personal claim is not freshly verified mathematical evidence. There is no web search, filesystem crawl, model training, or autonomous code modification.

## Clearing and saving

| Action | Effect |
|---|---|
| AC | Clears the current keypad target; for Calculator, resets displayed entry/result without clearing stored `ans`, history, or memory. |
| MC | Sets the numeric memory slot to zero. |
| Clear History | Removes calculation history; retained recall records can still contain earlier calculations. |
| Clear All Graphs | Removes graph rules and transient analysis markers/shading; other saved work remains. |
| Delete a named notebook | Removes that saved snapshot from this browser. |
| Forget a personal recall page | Removes that page from personal memory; other records/backups are separate. |

Workspace autosave, named notebooks, recall memory, and lesson progress are different stores. None of the selective-clear controls is a full data purge. See [backup contents and restore behavior](BACKUPS.md) before changing devices or clearing browser storage.

## Keyboard and troubleshooting

Enter evaluates Calculator. Ctrl/⌘+Enter submits Mr. E or runs the CAS input when focused there. With the graph focused, arrow keys pan, +/− zoom, and Home resets the view.

- Wrong trig result: check RAD/DEG; CAS always uses radians regardless of that toggle.
- Graph appears empty: check type, variables, domain, visibility, parameters, and viewing range.
- CAS is unchanged/unevaluated: the engine may not support that operation/input. Inspect domain restrictions and verify candidates; `ok:true` is not a proof.
- CAS cannot start: the browser may block Blob workers. Try an environment that permits them; keep exported backups if changing origin.
- Autosave reports storage unavailable: use Export JSON; saving a local file and visiting the hosted site need not share storage.
- Imported benchmark is not found: benchmark imports are tab-only. Reload the report with **Load benchmark JSON**, not notebook import.
