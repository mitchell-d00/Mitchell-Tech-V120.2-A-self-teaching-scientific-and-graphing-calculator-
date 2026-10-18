const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const nodes=new Map(),storage=new Map();const ctx=new Proxy({},{get:()=>()=>{}});
function node(id){if(!nodes.has(id))nodes.set(id,{value:'',options:[],dataset:{},style:{setProperty(k,v){this[k]=v},removeProperty(k){delete this[k]}},classList:{add(){},remove(){},toggle(){},contains(){return true}},innerHTML:'',textContent:'',getContext:()=>ctx,getBoundingClientRect:()=>({width:900,height:460,left:0,top:0}),setAttribute(){},removeAttribute(){},scrollIntoView(){},addEventListener(){},focus(){},showModal(){},close(){},setPointerCapture(){},click(){this.onclick?.({target:this})},get selectionStart(){return this.value.length},get selectionEnd(){return this.value.length},setRangeText(s){this.value+=s}});return nodes.get(id)}
const doc={addEventListener(){},querySelector:node,querySelectorAll:()=>[],body:node('body'),activeElement:null,createElement:()=>node('new')};
const sandbox={console,document:doc,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame:fn=>fn(),structuredClone,Math,Number,Date,JSON,Error,Set,Map,Object,Array,String,parseFloat,devicePixelRatio:1,getComputedStyle:()=>({getPropertyValue:()=> '#101619'}),setTimeout:()=>0,clearTimeout(){},window:{addEventListener(){}},Blob,URL};vm.createContext(sandbox);vm.runInContext(script,sandbox);
const cases=JSON.parse(fs.readFileSync(require('path').join(__dirname,'cases.json'),'utf8')),results=[];
function run(s){return vm.runInContext(s,sandbox)}
const asked=new Set(),skippedQuestions=[];let repeatsSkipped=0;function record(category,name,pass,actual,expected){const q=String(name).toLowerCase().replace(/\s+/g,'');if(asked.has(q)){repeatsSkipped++;skippedQuestions.push({category,name});return false}asked.add(q);results.push({id:'MT-'+String(results.length+1).padStart(6,'0'),category,name,pass,actual,expected});return true}
for(const c of cases){try{const actual=run('fmt(evaluate(parse('+JSON.stringify(c.expr)+'),vars()))');const expected=Number(c.expected.toPrecision(10));const tol=Math.max(Math.abs(expected)*1e-9,1e-300);record(c.category,c.expr,Number.isFinite(+actual)&&Math.abs(+actual-expected)<=tol,actual,expected)}catch(e){record(c.category,c.expr,false,e.message,c.expected)}}
for(const expr of ['1/0','0/0','sqrt(-1)','ln(0)','ln(-1)','log(-3)','asin(2)','acos(-2)','(-2)!','171!','exp(1000)']){let rejected=false,out;try{out=run('evaluate(parse('+JSON.stringify(expr)+'),vars())');rejected=!Number.isFinite(out)}catch(e){rejected=true;out=e.message}record('Domain handling',expr,rejected,String(out),'throw or nonfinite value (calculator must reject)')}
for(const expr of ['alert(1)','constructor','2**3','2+','sqrt()','min(3)','pow(2)','sin(1,2)','(2+3','2+3)','x=3','[1,2]']){let rejected=false;try{run('parse('+JSON.stringify(expr)+')')}catch{rejected=true}record('Invalid expressions',expr,rejected,rejected?'rejected':'accepted','rejected')}
run("angle='deg'");for(const [expr,exp]of [['sin(30)',.5],['cos(60)',.5],['tan(45)',1],['asin(.5)',30],['acos(.5)',60],['atan(1)',45],['atan2(1,0)',90]]){const n=run('evaluate(parse('+JSON.stringify(expr)+'),vars())');record('Angle modes','DEG: '+expr,Math.abs(n-exp)<1e-10,n,exp)}run("angle='rad'");
for(const [expr,exp]of [['2*x',6],['x^2',9],['sin(x)',Math.sin(3)],['a*x+b',8]]){const n=run('evaluate(parse('+JSON.stringify(expr)+'),{x:3,a:2,b:2})');record('Function substitution',expr,Math.abs(n-exp)<1e-10,n,exp)}
for(const [q,need]of [['solve 2*x+4=0','x = -2'],['solve x^2-5*x+6=0','x₁ = 3'],['solve x^2+1=0','No real roots'],['solve x=x','Every real x'],['solve 0*x=1','No solution'],['solve 0.000000000000001*x=1','x = 1e+15']]){const out=run('tutor('+JSON.stringify(q)+')');record('Equation tutor',q,q==='solve 0.000000000000001*x=1'?Number(out.match(/x = ([^\n]+)/)?.[1])===1e15:out.includes(need),out,q==='solve 0.000000000000001*x=1'?'x numerically equals 1000000000000000':need)}
for(const [expr,lo,hi,expected]of [['x^2-4',-3,3,[-2,2]],['(x-1.12345)^2',-3,3,[1.12345]],['x^2+0.00000001',-1,1,[]],['1/x',-1,1,[]],['sin(x)',-4,4,[-Math.PI,0,Math.PI]]]){const rs=run('roots(x=>safeEval(parse('+JSON.stringify(expr)+'),x),'+lo+','+hi+')');const okay=rs.length===expected.length&&rs.every((x,i)=>Math.abs(x-expected[i])<1e-5);record('Numerical roots','roots '+expr+' in ['+lo+','+hi+']',okay,Array.from(rs),expected)}
for(const [expr,a,b,exp]of [['x^2',0,3,9],['sin(x)',0,Math.PI,2],['x',2,0,-2]]){const v=run('integral(x=>safeEval(parse('+JSON.stringify(expr)+'),x),'+a+','+b+').value');record('Numerical integration','integrate '+expr+' from '+a+' to '+b,Math.abs(v-exp)<1e-8,v,exp)}
for(const [expr,x,exp]of [['x^2',3,6],['sin(x)',0,1],['ln(x)',2,.5],['x^x',2,4*(Math.log(2)+1)]]){const v=run('evaluate(simplify(deriv(parse('+JSON.stringify(expr)+'))),{x:'+x+'})');record('Symbolic derivatives','differentiate '+expr+' at x='+x,Math.abs(v-exp)<1e-8,v,exp)}
for(const [q,kind]of [['square root','one'],['imaginarysmoketestword','none']]){const out=run('recallPages('+JSON.stringify(q)+')');record('Closed-page recall',q,out.kind===kind,out.kind,kind)}

 
// Extended deterministic benchmark: 20,000 additional globally unique expressions,
// 20 distinct offline-tutor prompts, and 3 unique DEG-mode regression questions.
// References use standard JS Math/operators independent from the app's parser.
let uniqueSeed=20261018;
function nextUnique(){uniqueSeed^=uniqueSeed<<13;uniqueSeed^=uniqueSeed>>>17;uniqueSeed^=uniqueSeed<<5;return (uniqueSeed>>>0)/4294967296}
function uniqueReal(a,b){return Number((a+(b-a)*nextUnique()).toFixed(5))}
function uniqueNonzero(a,b){const n=uniqueReal(a,b);return Math.abs(n)<.001?1.125:n}
const uniqueFunctions=[['sin',Math.sin,-30,30],['cos',Math.cos,-30,30],['tan',Math.tan,-1.25,1.25],['sqrt',Math.sqrt,.002,200],['abs',Math.abs,-200,200],['ln',Math.log,.002,1000],['log',Math.log10,.002,1000],['exp',Math.exp,-7,7],['floor',Math.floor,-100,100],['ceil',Math.ceil,-100,100],['round',Math.round,-100,100],['sinh',Math.sinh,-5,5],['cosh',Math.cosh,-5,5],['tanh',Math.tanh,-5,5],['asin',Math.asin,-.95,.95],['acos',Math.acos,-.95,.95],['atan',Math.atan,-100,100],['cbrt',Math.cbrt,-100,100]];
let uniqueGenerated=0,uniqueAttempts=0;
while(uniqueGenerated<20000&&uniqueAttempts++<80000){
 const family=uniqueGenerated%8,a=uniqueReal(-50,50),b=uniqueNonzero(-50,50),c=uniqueReal(-50,50),d=uniqueNonzero(-50,50);
 let expression,wanted;
 if(family===0){expression=`(${a})+(${b})`;wanted=a+b}
 else if(family===1){expression=`(${a})-(${b})`;wanted=a-b}
 else if(family===2){expression=`(${a})*(${b})`;wanted=a*b}
 else if(family===3){expression=`(${a})/(${b})`;wanted=a/b}
 else if(family===4){expression=`((${a})*(${b})+(${c}))/(${d})`;wanted=(a*b+c)/d}
 else if(family===5){const x=uniqueReal(.1,12),y=Math.floor(nextUnique()*9)-4;expression=`(${x})^(${y})`;wanted=x**y}
 else if(family===6){const [name,fn,lo,hi]=uniqueFunctions[Math.floor(nextUnique()*uniqueFunctions.length)],x=uniqueReal(lo,hi);expression=`${name}(${x})`;wanted=fn(x)}
 else {const x=uniqueReal(-8,8),y=uniqueNonzero(-8,8),z=uniqueReal(-8,8);expression=`abs(${x})+(${y})^2-(${z})`;wanted=Math.abs(x)+y**2-z}
 if(!Number.isFinite(wanted))continue;
 try{const got=run('evaluate(parse('+JSON.stringify(expression)+'),vars())');
  const good=Number.isFinite(got)&&Math.abs(got-wanted)<=Math.max(1e-9,1e-8*Math.max(Math.abs(got),Math.abs(wanted)));
  if(record('Generated unique expressions',expression,good,got,wanted))uniqueGenerated++;
 }catch(e){if(record('Generated unique expressions',expression,false,String(e.message),wanted))uniqueGenerated++}
}
if(uniqueGenerated!==20000)throw Error('Failed to generate 20,000 unique expressions');
const uniqueTutor=[
 ['solve 7*x-21=0','x = 3'],['solve x^2-11*x+30=0','x₁ ='],['solve x^2+9=0','No real roots'],
 ['solve 0*x=19','No solution'],['solve 11*x+44=0','x = -4'],
 ['differentiate x^4+3*x^2','f′(x) ='],['differentiate sin(x)+exp(x)','f′(x) ='],
 ['integrate x^3 from 0 to 2','Signed area ≈ 4'],['integrate cos(x) from 0 to pi/2','Signed area ≈ 1'],
 ['calculate 13*(2+7)','117'],['explain (1+2)^4','81'],['evaluate sin(pi/3)','0.8660254038'],
 ['plot x^3-7*x','Added x^3-7*x to the graph'],
 ['recall unlikely_rubidium_ghost_question_93454','Not in these pages'],
 ['solve x^2-16=0','x₂ ='],['integrate 3*x^2 from 1 to 3','Signed area ≈ 26'],
 ['differentiate ln(x^2+1)','f′(x) ='],['explain sqrt(121)+6','17'],
 ['plot sin(x)+cos(2*x)','Added sin(x)+cos(2*x) to the graph'],
 ['who won the planetary marbles olympics 2987?','I use local mathematical rules']
];
for(const [q,expected] of uniqueTutor){
 try{const got=run('tutor('+JSON.stringify(q)+')');record('Offline tutor / bot',q,String(got).includes(expected),String(got).slice(0,500),expected)}
 catch(e){record('Offline tutor / bot',q,false,String(e.message),expected)}
}
run("angle='deg'");
for(const [expression,expected,note] of [
 ['atan2(1,2)',Math.atan2(1,2)*180/Math.PI,'DEG atan2 expected degrees'],
 ['tan(270)',NaN,'DEG tan(270) is mathematically undefined'],
 ['sin(150)',.5,'DEG sin(150) expected 0.5']
]){
 try{const got=run('evaluate(parse('+JSON.stringify(expression)+'),vars())');
  const good=Number.isNaN(expected)?!Number.isFinite(got):Number.isFinite(got)&&Math.abs(got-expected)<1e-8;
  record('Degree-mode edge cases',expression,good,got,note)}
 catch(e){record('Degree-mode edge cases',expression,Number.isNaN(expected),e.message,note)}
}
run("angle='rad'");

// Distinct regression questions for corrected trigonometry and tutoring.
for(const [mode,expr,expected] of [
 ['deg','sin(180)',0],['deg','cos(90)',0],['deg','sin(360)',0],
 ['deg','tan(180)',0],['deg','cos(270)',0],['deg','tan(90)',NaN],
 ['deg','atan2(-1,-1)',-135],['deg','atan2(0,-1)',180],
 ['deg','tan(90.000000001)',Infinity],
 ['rad','sin(pi)',0],['rad','cos(pi/2)',0],['rad','tan(pi)',0],
 ['rad','tan(pi/2)',NaN],['rad','sin(1e-9)',Math.sin(1e-9)],
 ['rad','1e-14',1e-14]
]){
 run('angle='+JSON.stringify(mode));
 const value=run('evaluate(parse('+JSON.stringify(expr)+'),vars())');
 const pass=Number.isNaN(expected)?Number.isNaN(value):expected===Infinity?
   Number.isFinite(value)&&Math.abs(value)>1e8:
   expected===0?Object.is(value,0):Math.abs(value-expected)<1e-12;
 record('Unique trig and precision regressions',mode.toUpperCase()+' '+expr,pass,value,expected===Infinity?'large but finite':expected);
}
run("angle='rad'");
const explainedPower=run("tutor('differentiate x^x')");
record('Unique symbolic clarity regression','differentiate x^x — simplified output',
 explainedPower.includes('ln(x) + 1')&&!explainedPower.includes('x / x'),
 explainedPower,'(x ^ x) * (ln(x) + 1)');

const groups={};for(const r of results){groups[r.category]??={passed:0,failed:0};groups[r.category][r.pass?'passed':'failed']++}
const summary={unique_questions:asked.size,duplicate_questions_skipped:repeatsSkipped,skipped_questions:skippedQuestions,tests:results.length,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,categories:groups,failures:results.filter(r=>!r.pass)};fs.writeFileSync(require('path').join(__dirname,'unique-benchmarks-results.json'),JSON.stringify({summary,results},null,2));console.log(JSON.stringify(summary,null,2));

if(summary.failed)process.exitCode=1;
