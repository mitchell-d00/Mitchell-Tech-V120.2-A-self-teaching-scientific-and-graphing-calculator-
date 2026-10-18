"""Chromium clear-control checks using locally injected HTML and mocked storage.
Requires Python Playwright and a Chromium executable at /usr/bin/chromium.
This tests state restoration in a fresh page, not native-origin reload persistence.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

repo = Path(__file__).resolve().parent.parent
html = (repo / "index.html").read_text()
checks = []
def check(label, cond):
    checks.append((label, bool(cond)))
    if not cond:
        raise AssertionError(label)
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width in [390, 1280]:
        page = browser.new_page(viewport={'width':width, 'height':844})
        errors = []
        page.on('pageerror', lambda err: errors.append(str(err)))
        page.evaluate("""() => {
            const bag=new Map();
            Object.defineProperty(window,'localStorage',{configurable:true,value:{
                getItem:k=>bag.get(k)??null, setItem:(k,v)=>bag.set(k,String(v))
            }});
        }""")
        page.set_content(html,wait_until='load')
        check(f'{width}: both clear buttons exist', page.locator('#clearHistory').count() == 1 and page.locator('#clearGraphs').count() == 1)
        check(f'{width}: clean history hidden', 'hidden' in page.locator('#historyActions').get_attribute('class'))
        check(f'{width}: default graph present', page.evaluate('state.expressions.length') == 1)
        page.locator('#calc').fill('13*7')
        page.locator('#calc').press('Enter')
        page.locator('#calc').fill('5+11')
        page.locator('#calc').press('Enter')
        page.locator('#memStore').click()
        check(f'{width}: two history items', page.evaluate('state.history.length') == 2 and page.locator('#history button').count() == 2)
        check(f'{width}: clear history available', page.locator('#clearHistory').is_visible())
        page.locator('#clearHistory').click()
        check(f'{width}: clear history only', page.evaluate('state.history.length === 0 && state.ans === 16 && state.mem === 16 && state.expressions.length === 1'))
        check(f'{width}: history controls hidden again', not page.locator('#historyActions').is_visible() and page.locator('#history button').count() == 0)
        page.locator('#add').click()
        page.locator('[data-expr="1"]').fill('x^2 + 2')
        check(f'{width}: two graph expressions', page.evaluate('state.expressions.length') == 2)
        page.locator('#clearGraphs').click()
        check(f'{width}: clear graphs only', page.evaluate('state.expressions.length === 0 && state.history.length === 0 && state.ans === 16 && state.mem === 16 && compiled.length === 0'))
        check(f'{width}: graph clear disabled when empty', page.locator('#clearGraphs').is_disabled() and page.locator('[data-expr]').count() == 0)
        check(f'{width}: graph result reset', 'Add a graph expression' in page.locator('#analysisResult').inner_text())
        check(f'{width}: mobile/desktop no horizontal overflow', page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'))
        page.wait_for_timeout(440)
        saved = page.evaluate("JSON.parse(localStorage.getItem('parlour.workspace'))")
        check(f'{width}: cleared state stored locally', saved['history'] == [] and saved['expressions'] == [] and saved['ans'] == 16 and saved['mem'] == 16)
        restored=browser.new_page(viewport={'width':width,'height':844})
        restored.evaluate("""data=>{
          const bag=new Map([['parlour.workspace',JSON.stringify(data)]]);
          Object.defineProperty(window,'localStorage',{configurable:true,value:{
            getItem:k=>bag.get(k)??null,setItem:(k,v)=>bag.set(k,String(v))
          }});
        }""", saved)
        restored.set_content(html,wait_until='load')
        check(f'{width}: cleared state restored on app initialization', restored.evaluate('state.history.length === 0 && state.expressions.length === 0 && state.mem === 16 && state.ans === 16'))
        restored.locator('#add').click()
        check(f'{width}: can add new graph after clearing', restored.locator('[data-expr]').count() == 1 and restored.locator('#clearGraphs').is_enabled())
        check(f'{width}: no page JS errors', not errors)
        restored.close()
        page.close()
    browser.close()
print(f'{sum(v for _,v in checks)}/{len(checks)} browser clear-control checks passed')
