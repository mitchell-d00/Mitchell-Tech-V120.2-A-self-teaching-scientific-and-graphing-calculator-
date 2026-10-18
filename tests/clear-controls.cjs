'use strict';
// Dependency-free regression for two distinct clear actions and their saved state.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
assert(html.includes('id="clearHistory"')&&html.includes('id="clearGraphs"'),'Both controls must appear in HTML');
const source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const nodes=new Map(),store=new Map(),fakeCanvas=new Proxy({},{get:()=>()=>{}});
function node(id){
 if(!nodes.has(id)){
  const classes=new Set();
  nodes.set(id,{
   value:'',options:[],dataset:{},disabled:false,style:{setProperty(){},removeProperty(){}},
   classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),toggle:(k,force)=>force===undefined?(classes.has(k)?classes.delete(k):classes.add(k)):force?classes.add(k):classes.delete(k),contains:k=>classes.has(k)},
   innerHTML:'',textContent:'',getContext:()=>fakeCanvas,
   getBoundingClientRect:()=>({width:900,height:460,left:0,top:0}),
   addEventListener(){},focus(){},showModal(){},close(){},setAttribute(){},removeAttribute(){},scrollIntoView(){},setPointerCapture(){},
   click(){this.onclick?.({target:this})},
   get selectionStart(){return this.value.length},get selectionEnd(){return this.value.length},setRangeText(x){this.value+=x}
  });
 }
 return nodes.get(id);
}
const storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v))};
const doc={querySelector:node,querySelectorAll:()=>[],addEventListener(){},body:node('body'),activeElement:null,createElement:()=>node('new')};
const sandbox={document:doc,localStorage:storage,console,Math,Date,Number,JSON,Set,Map,Array,String,Object,Error,parseFloat,
 structuredClone,devicePixelRatio:1,window:{addEventListener(){}},Blob,URL,requestAnimationFrame:fn=>fn(),
 setTimeout:fn=>{fn();return 0},clearTimeout(){},getComputedStyle:()=>({getPropertyValue:()=> '#101619'})};
vm.createContext(sandbox);vm.runInContext(source,sandbox);
const run=code=>vm.runInContext(code,sandbox);
let checks=0;
function verify(label,predicate){assert(predicate,label);checks++}
verify('default curve',run('state.expressions.length')===1);
node('#calc').value='13*7';run('calcRun()');
node('#calc').value='5+11';run('calcRun()');
node('#memStore').click();
verify('distinct calculations recorded',run('state.history.length')===2);
verify('history control available',!node('#historyActions').classList.contains('hidden'));
run("state.notes='do not clear notes';notebooks.push({name:'saved graph',date:'now',workspace:{expressions:[{text:'x',type:'cart',on:true}]}})");
node('#clearHistory').click();
verify('clear history',run('state.history.length')===0);
verify('clear history rows',node('#history').innerHTML==='');
verify('clear history button hidden',node('#historyActions').classList.contains('hidden'));
verify('last answer preserved',run('state.ans')===16);
verify('number memory preserved',run('state.mem')===16);
verify('graphs untouched by history',run('state.expressions.length')===1);
verify('notebooks untouched by history',run('notebooks.length')===1);
node('#clearHistory').click();
verify('empty history no-op',run('state.history.length')===0);
run("state.expressions.push({text:'x^2+2',type:'cart',on:true});renderExpressions()");
verify('two curves before clear',run('state.expressions.length')===2);
node('#clearGraphs').click();
verify('no expressions remain',run('state.expressions.length')===0);
verify('no compiled curves remain',run('compiled.length')===0);
verify('graph controls disabled when empty',node('#clearGraphs').disabled===true);
verify('analysis reset',node('#analysisResult').textContent.includes('Add a graph expression'));
verify('history still empty',run('state.history.length')===0);
verify('graph clear preserves answer and memory',run('state.ans===16 && state.mem===16'));
verify('graph clear preserves notes and notebooks',run("state.notes==='do not clear notes' && notebooks.length===1"));
node('#clearGraphs').click();
verify('empty graph clear no-op',run('state.expressions.length')===0);
const saved=JSON.parse(storage.getItem('parlour.workspace'));
verify('stored history cleared',saved.history.length===0);
verify('stored expressions cleared',saved.expressions.length===0);
verify('stored answer and memory preserved',saved.ans===16&&saved.mem===16);
verify('saved workspace remains valid',run('validateState(JSON.parse(localStorage.getItem("parlour.workspace"))).expressions.length')===0);
run("state.expressions.push({text:'x^3',type:'cart',on:true});renderExpressions()");
verify('can graph again',run('state.expressions.length')===1&&!node('#clearGraphs').disabled);
console.log(checks+' clear-control regression checks passed');
