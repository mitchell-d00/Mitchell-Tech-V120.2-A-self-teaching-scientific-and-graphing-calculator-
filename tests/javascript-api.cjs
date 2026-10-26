'use strict';
// Independent browser-side API tests; no external packages or credentials.
const fs=require('fs'),assert=require('assert'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const nodes=new Map(),storage=new Map(),canvas=new Proxy({},{get:()=>()=>{}});
function node(id){ if(!nodes.has(id)){const classes=new Set();nodes.set(id,{value:'',options:[],dataset:{},disabled:false,
 style:{setProperty(){},removeProperty(){}},classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),toggle:(k,f)=>f===undefined?(classes.has(k)?classes.delete(k):classes.add(k)):f?classes.add(k):classes.delete(k),contains:k=>classes.has(k)},innerHTML:'',textContent:'',getContext:()=>canvas,
 getBoundingClientRect:()=>({width:800,height:400,left:0,top:0}),addEventListener(){},focus(){},showModal(){},close(){},setAttribute(){},removeAttribute(){},scrollIntoView(){},setPointerCapture(){},click(){this.onclick?.({target:this})},get selectionStart(){return this.value.length},get selectionEnd(){return this.value.length},setRangeText(v){this.value+=v}});}return nodes.get(id)}
const sandbox={document:{querySelector:node,querySelectorAll:()=>[],addEventListener(){},body:node('body'),activeElement:null,createElement:()=>node('new')},window:{addEventListener(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v))},console,Math,Date,Number,JSON,Set,Map,Array,String,Object,Error,parseFloat,structuredClone,devicePixelRatio:1,Blob,URL,requestAnimationFrame:fn=>fn(),setTimeout:fn=>{fn();return 0},clearTimeout(){},getComputedStyle:()=>({getPropertyValue:()=> '#101619'})};
vm.createContext(sandbox);vm.runInContext(script,sandbox);
const API=sandbox.window.MitchellTech;
let cases=0;function check(title,condition){assert(condition,title);cases++}
function ok(response,title){check(title, response&&response.ok===true);return response}
function bad(response,title,pattern){check(title,response&&response.ok===false&&pattern.test(response.error||''))}
check('API published under a stable name',API&&API.version==='1.1.0');
check('API is frozen',Object.isFrozen(API));
check('functions discoverable',API.functions().includes('atan2')&&API.functions().includes('sin'));
check('capabilities discoverable',API.capabilities.includes('askMrE')&&API.capabilities.includes('addGraph'));
const before=API.getState();
check('default angle radians',before.angle==='rad');
check('initial graph exists',before.graphs.length===1);
const exprs=new Set();
function unique(input){assert(!exprs.has(input),'Repeated mathematical question: '+input);exprs.add(input);return input}
check('parser precedence',ok(API.calculate(unique('2^3^2')),'math precedence').value===512);
check('angle override degrees',Math.abs(ok(API.calculate(unique('sin(30)'),{angle:'deg'}),'DEG query').value-0.5)<1e-12);
check('angle restored after override',API.getState().angle==='rad');
check('variables supported',ok(API.calculate(unique('a*x+b'),{variables:{a:3,b:4,x:5}}),'variable override').value===19);
check('variables do not mutate workspace',API.getState().a===before.a&&API.getState().b===before.b);
check('no history for pure calculation',API.getHistory().length===before.historyCount);
bad(API.calculate(unique('sqrt(-4)')),'reject non-real',/Undefined/i);
bad(API.calculate(unique('alert(1)')),'reject script text',/Unknown|function/i);
bad(API.calculate(unique('2+1'),{angle:'grad'}),'reject invalid angle',/Angle/);
bad(API.calculate(unique('x+7'),{variables:{x:Infinity}}),'reject nonfinite variable',/nonfinite/i);
bad(API.calculate(unique('5+6'),{variables:{constructor:3}}),'reject unknown variable',/Unsupported/);
bad(API.calculate(unique('sqrt(81)'),{record:true,angle:'deg'}),'reject ambiguous recorded mode',/Recorded/);
check('state unchanged after invalid input',API.getState().ans===before.ans);
check('recorded answer',ok(API.calculate(unique('7*13'),{record:true}),'record calculation').value===91);
check('record added to history',API.getHistory()[0].expr==='7*13'&&API.getState().ans===91);
const history=API.getHistory();history[0].expr='mutation';
check('history returns a defensive copy',API.getHistory()[0].expr==='7*13');
check('Mr. E teaches without credentials',ok(API.askMrE('teach fractions'),'Mr. E').answer.includes('Mr. E'));
check('Mr. E function reference',ok(API.askMrE('what is sqrt'),'Mr. E sqrt').answer.includes('sqrt'));
bad(API.askMrE(123),'reject non-string tutor question',/question/i);
check('derivative supported',ok(API.differentiate(unique('x^4')),'differentiate').derivative.includes('4'));
check('numerical integral',Math.abs(ok(API.integrate(unique('x^2'),0,3),'integrate').value-9)<1e-8);
check('roots',JSON.stringify(ok(API.findRoots(unique('x^2-9'),-4,4),'findRoots').roots).includes('-3'));
bad(API.findRoots(unique('x^3'),5,5),'reject incorrect interval',/increasing/);
check('graph listing',API.listGraphs().length===1);
const g=ok(API.addGraph(unique('x^2-4')),'add cart graph');
check('new graph index',g.index===1);
check('sample graph',ok(API.sampleGraph(1,3),'sample cart').y===5);
const param=ok(API.addGraph(unique('2*cos(t); 3*sin(t)'),{type:'param'}),'add param graph');
const sample=ok(API.sampleGraph(param.index,0),'sample param');
check('sample param coordinates',sample.x===2&&sample.y===0);
const polar=ok(API.addGraph(unique('3*cos(t)'),{type:'polar'}),'add polar graph');
check('sample polar',Math.abs(ok(API.sampleGraph(polar.index,0),'sample polar').x-3)<1e-12);
bad(API.addGraph(unique('x+(')),'reject invalid graph before mutation',/expected|unmatched|token|parenthesis/i);
bad(API.addGraph(unique('x^2+7'),{type:'script'}),'reject invalid graph type',/type/i);
check('failed graph did not mutate state',API.listGraphs().length===4);
check('update graph',ok(API.updateGraph(1,unique('x^2+1')),'update graph').graph.text==='x^2+1');
check('updated graph sample',ok(API.sampleGraph(1,2),'updated sample').y===5);
bad(API.sampleGraph(-1,0),'reject negative index',/index/i);
bad(API.sampleGraph(1,NaN),'reject invalid sample coordinate',/finite/i);
check('remove graph',ok(API.removeGraph(2),'remove graph').remaining===3);
check('angle switch',ok(API.setAngle('deg'),'set DEG').angle==='deg');
check('DEG calculation respects mode',Math.abs(ok(API.calculate(unique('atan2(1,1)')),'atan2 DEG').value-45)<1e-10);
bad(API.setAngle('grad'),'reject invalid setAngle',/Angle/);
check('invalid angle left state intact',API.getState().angle==='deg');
check('graph reset',ok(API.clearGraphs(),'clear graphs').remaining===0);
check('no graphs in snapshot',API.getState().graphs.length===0);
check('clear history',ok(API.clearHistory(),'clear history').remaining===0);
check('last answer preserved',API.getState().ans===91);
check('no history after clearing',API.getHistory().length===0);
check('memory unaffected',API.getState().mem===before.mem);
check('graph readd works after clear',ok(API.addGraph(unique('sin(x)')),'readd graph').index===0);
check('current graph from UI',node('#expressions').innerHTML.includes('sin(x)'));
check('no network or eval required',!/\beval\s*\(/.test(script.replace(/\/\/[^\n]*/g,''))&&typeof sandbox.fetch==='undefined');
console.log(cases+' API regression assertions passed across '+exprs.size+' distinct expressions.');
