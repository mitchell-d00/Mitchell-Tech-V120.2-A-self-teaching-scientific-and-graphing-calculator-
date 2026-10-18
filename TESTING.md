# Smoke test and mathematical regression report

Test date: October 18, 2026.

## Scope and results

The published GitHub Pages calculator was exercised through a desktop Chrome browser. A broader code-level suite then ran against the calculator source in this conversation. The packaged build includes corrections; it has not been published to GitHub Pages by this test run.

- Original build: 2,198 / 2,205 code-level checks passed. Seven failing cases represented three defects.
- Patched build: 2,205 / 2,205 math checks passed.
- Patched build: 104 / 104 additional engine/application checks passed.
- Application checks use DOM/canvas stubs; they are not a substitute for a real device/browser test.

## Patched defects

1. Small nonzero numbers such as `1e-13` were formatted as zero. They now retain scientific notation when needed.
2. The equation tutor discarded small nonzero leading polynomial coefficients. `solve 0.000000000000001*x=1` now gives `x = 1000000000000000`.
3. Numerical root detection accepted a small absolute residual as a root. `x^2+0.00000001` produced numerous false roots despite having no real roots. The search now requires refined convergence and scaled/local checks.
4. The Resume lesson label could show the previous lesson number; it now updates when a lesson opens.
5. Graph-input target menus could show an outdated expression; they now refresh when expressions are compiled.

## Code-level math coverage

| Category | Passed | Failed |
| --- | ---: | ---: |
| Fraction arithmetic | 1600 | 0 |
| Decimal arithmetic | 300 | 0 |
| Order, signs and percentages | 22 | 0 |
| Integer powers | 175 | 0 |
| Scientific functions (RAD) | 24 | 0 |
| Factorials | 25 | 0 |
| Small-number display | 5 | 0 |
| Domain handling | 11 | 0 |
| Invalid expressions | 12 | 0 |
| Angle modes | 7 | 0 |
| Function substitution | 4 | 0 |
| Equation tutor | 6 | 0 |
| Numerical roots | 5 | 0 |
| Numerical integration | 3 | 0 |
| Symbolic derivatives | 4 | 0 |
| Closed-page recall | 2 | 0 |

The 1,600 fraction and 300 decimal arithmetic expectations were generated independently with Python Fraction/Decimal arithmetic, using a fixed seed. Scientific, domain, solver and calculus checks use explicit expected values or identities. Output comparisons respect the calculator’s ten-significant-digit display.

## Live browser checks completed

- Fifteen ordinary/scientific calculations, plus angle-mode, memory and prior-answer explanation drills.
- Invalid-input and real-domain rejection examples.
- Worked algebra, differentiation and integration examples.
- Lab values/slopes, roots, stationary points and integrals.
- Recall source ownership, ambiguity choices and missing-information responses.
- Two synthetic recall pages, a named notebook, lesson feedback and lesson-resume behavior.
- Memory, custom-function selection, lesson progress and color settings across a real page reload.
- Native keyboard entry changed touch-key height to 58 pixels; browser geometry confirmed it.
- Graph keyboard input, expanded viewer and Cartesian value table.
- JSON and PNG export download events completed.

## Verification limits

- Browser file-upload calls stalled, so an end-to-end live JSON import round trip remains unverified. The separate application suite verifies import using stubs.
- Export download completion was observed, but independent examination of the downloaded bytes was interrupted.
- Actual iPad, iOS Safari, other browser engines, pinch gestures on a physical device, and responsive breakpoints were not certified.
- The patched source passed code-level checks; the patched version was not re-deployed or re-tested on the live site.
- Browser logs observed during the completed drills showed extension-origin errors, rather than identified calculator-origin errors. This is a scoped observation, not a guarantee of an error-free application.
- This is finite test coverage, not proof of mathematical correctness for every input. Number arithmetic uses JavaScript floating point. Sampled graphing, root finding and fixed-panel integration retain numerical limitations.

## Repeat the packaged drills

No installation or dependencies are needed beyond a recent Node.js runtime. From the extracted project folder:

```sh
node tests/full-spectrum.cjs
node tests/application-checks.cjs
```

The first command writes `tests/full-spectrum-results.json`. The app itself still runs entirely from `index.html`, with no Node.js requirement.
