const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const nodes=new Map(),storage=new Map();const ctx=new Proxy({},{get:()=>()=>{}});
function node(id){if(!nodes.has(id))nodes.set(id,{value:'',options:[],dataset:{},style:{setProperty(k,v){this[k]=v},removeProperty(k){delete this[k]}},classList:{add(){},remove(){},toggle(){},contains(){return true}},innerHTML:'',textContent:'',getContext:()=>ctx,getBoundingClientRect:()=>({width:900,height:460,left:0,top:0}),setAttribute(){},removeAttribute(){},scrollIntoView(){},addEventListener(){},focus(){},showModal(){},close(){},setPointerCapture(){},click(){this.onclick?.({target:this})},get selectionStart(){return this.value.length},get selectionEnd(){return this.value.length},setRangeText(s){this.value+=s}});return nodes.get(id)}
const doc={addEventListener(){},querySelector:node,querySelectorAll:()=>[],body:node('body'),activeElement:null,createElement:()=>node('new')};
const sandbox={console,document:doc,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame:fn=>fn(),structuredClone,Math,Number,Date,JSON,Error,Set,Map,Object,Array,String,parseFloat,devicePixelRatio:1,getComputedStyle:()=>({getPropertyValue:()=> '#101619'}),setTimeout:()=>0,clearTimeout(){},window:{addEventListener(){}},Blob,URL};vm.createContext(sandbox);vm.runInContext(script,sandbox);
// Independent Mr. E regression gate: every question is unique.
const asked=new Set(),results=[];
function run(s){return vm.runInContext(s,sandbox)}
function verify(question, expected, category='Mr. E'){
 const normal=question.toLowerCase().replace(/\s+/g,'');
 assert(!asked.has(normal),'Duplicate prompt: '+question);asked.add(normal);
 let actual;try{actual=run('tutor('+JSON.stringify(question)+')')}catch(e){actual='ERROR '+e.message}
 const pass=actual.includes(expected);
 results.push({id:'MRE-'+String(results.length+1).padStart(4,'0'),category,question,expected,actual,pass});
 if(!pass)console.error('FAIL '+question+' needed '+expected+' got '+actual.slice(0,180));
}
for(const [name,metadata] of Object.entries(run('MRE_FUNCTIONS')))
 verify('what is '+name,metadata[1],'Function reference');
for(const topic of Object.keys(run('MRE_TOPICS')))
 verify('teach '+topic,'Mr. E ·','Learning topics');
for(const [q,v] of [
 ['explain graph x^2-4','x=-2'],['explain graph sqrt(x)','undefined'],
 ['explain graph 1/x','undefined'],['explain graph y=x^3','y-intercept'],
 ['why is tan(90) undefined?','division by zero'],
 ['why does sqrt(-1) fail?','no real value'],['why does ln(-2) fail?','real only'],
 ['why is 1/0 invalid?','undefined'],
 ['list functions','atan2'],
 ['solve x^2-5*x+6=0','x₁ ='],['differentiate x^x','ln(x)'],
 ['integrate x^2 from 0 to 3','Signed area'],['explain 2*(3+4)','Answer: 14'],
 ['explain test sin(pi)','on-demand explanation'],
 ['explain test MT-000001','Load benchmark JSON'],
 ['explain test DEG tan(90)','undefined'],
 ['practice trigonometry','Practice'],['hint','Hint'],
 ['answer 0.5','Correct!'],['show solution','Solution'],
 ['practice powers','Practice'],['answer 512','Correct!'],
 ['explain 4!','Answer: 24'],
 ['tell me a joke','explicit commands']
]) verify(q,v,'Applied teaching');
for (const name of Object.keys(run('MRE_FUNCTIONS')))
 verify('how do I use '+name+'?', 'Step 1 of 3', 'Guided function tutorials');
for (const name of Object.keys(run('CAS_OPERATIONS')))
 verify('tutorial '+name, 'Step 1 of 3', 'CAS tutorials');
verify('next', 'Step 2 of 3', 'Tutorial navigation');
verify('back', 'Step 1 of 3', 'Tutorial navigation');
verify('repeat', 'Step 1 of 3', 'Tutorial navigation');
verify('tutorial memStore', 'Step 1 of', 'Control tutorial');
verify('tutorial imaginaryFeature', 'do not have an exact tutorial', 'Unknown tutorial');
verify('stop tutorial', 'Tutorial stopped', 'Tutorial navigation');
verify('next step', 'Start with', 'Tutorial navigation');
verify('list tutorials', 'determinant', 'Tutorial directory');
verify('list CAS functions', 'partfrac', 'CAS directory');
const functionCoverage=run('[...FUNCS].every(f => !!MRE_FUNCTIONS[f])');
assert(functionCoverage,'Every calculator function must have a Mr. E explanation');
assert.equal(asked.size,results.length);
assert(results.every(r=>r.pass),results.filter(r=>!r.pass).map(r=>r.question).join(', '));
(async()=>{
 const nodeInput=node('#mreImport');
 const good=JSON.stringify({results:[
 {id:'MT-000001',category:'Angle modes',name:'DEG sin(180)',pass:true,actual:0,expected:0},
 {id:'MT-000002',category:'Symbolic derivatives',name:'differentiate x^3',pass:true,actual:'3*x^2',expected:'3*x^2'}]});
 nodeInput.files=[{size:good.length,text:async()=>good}];await nodeInput.onchange();
 assert(run('mreTestRecords.size===2'));
 verify('explain test MT-000002','f′(x)','Benchmark import');
 const bad=JSON.stringify({results:[{id:'MT-000003',name:'2+2',category:'Math',pass:true},{id:'MT-000003',name:'3+3',category:'Math',pass:true}]});
 nodeInput.files=[{size:bad.length,text:async()=>bad}];await nodeInput.onchange();
 assert(node('#mreImportStatus').textContent.includes('Repeated test ID'));
 assert(run('mreTestRecords.size===2'),'Bad report must not replace loaded records');
 fs.writeFileSync(require('path').join(__dirname,'mr-e-results.json'),JSON.stringify({summary:{unique_questions:asked.size,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length},results},null,2));
 console.log(JSON.stringify({unique_questions:asked.size,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length}));
})().catch(e=>{console.error(e);process.exitCode=1});
