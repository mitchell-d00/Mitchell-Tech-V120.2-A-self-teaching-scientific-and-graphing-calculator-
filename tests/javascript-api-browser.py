"""Real Chromium smoke tests for the zero-key, same-page JavaScript API.
Requires Python Playwright and Chromium. No network and no external services.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

HTML = (Path(__file__).resolve().parent.parent / 'index.html').read_text()
checks = []
def check(label, condition):
    checks.append((label, bool(condition)))
    if not condition:
        raise AssertionError(label)

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    for width in (390, 1280):
        page = browser.new_page(viewport={'width':width,'height':844})
        errors = []
        requests = []
        page.on('pageerror',lambda error: errors.append(str(error)))
        page.on('request',lambda req: requests.append(req.url))
        page.evaluate("""() => {const mem=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,String(v))}})}""")
        page.set_content(HTML,wait_until='load')
        check(f'{width}: API present',page.evaluate('typeof window.MitchellTech === "object"'))
        check(f'{width}: calculate',page.evaluate('window.MitchellTech.calculate("sqrt(144)+2^3").value===20'))
        check(f'{width}: calculation does not record',page.evaluate('window.MitchellTech.getHistory().length===0'))
        check(f'{width}: mode override',page.evaluate('Math.abs(window.MitchellTech.calculate("sin(30)",{angle:"deg"}).value-0.5)<1e-12 && window.MitchellTech.getState().angle==="rad"'))
        check(f'{width}: recorded calculation',page.evaluate('window.MitchellTech.calculate("9*9",{record:true}).recorded && window.MitchellTech.getHistory()[0].value===81'))
        check(f'{width}: Mr E lesson',page.evaluate('window.MitchellTech.askMrE("teach fractions").answer.includes("Mr. E")'))
        check(f'{width}: graph add',page.evaluate('window.MitchellTech.addGraph("x^2-4").index===1 && window.MitchellTech.sampleGraph(1,3).y===5'))
        check(f'{width}: DOM graph refreshed',page.locator('input[data-expr="1"]').count()==1)
        check(f'{width}: no extra horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
        check(f'{width}: invalid code refused',page.evaluate('window.MitchellTech.calculate("alert(1)").ok===false'))
        check(f'{width}: clear graphs preserves history',page.evaluate('window.MitchellTech.clearGraphs().remaining===0 && window.MitchellTech.getHistory().length===1'))
        check(f'{width}: clear history preserves answer',page.evaluate('window.MitchellTech.clearHistory().remaining===0 && window.MitchellTech.getState().ans===81'))
        check(f'{width}: degree toggle updates DOM',page.evaluate('window.MitchellTech.setAngle("deg").angle==="deg" && document.querySelector("#angle").textContent==="DEG"'))
        page.wait_for_timeout(400)
        check(f'{width}: autosave reflects clearing',page.evaluate('(() => {const s=JSON.parse(localStorage.getItem("parlour.workspace"));return s.expressions.length===0&&s.history.length===0&&s.ans===81&&s.angle==="deg"})()'))
        check(f'{width}: zero page errors',not errors)
        check(f'{width}: zero external requests',not requests)
        page.close()
    browser.close()
print(f'{sum(b for _,b in checks)}/{len(checks)} Chromium API checks passed')
