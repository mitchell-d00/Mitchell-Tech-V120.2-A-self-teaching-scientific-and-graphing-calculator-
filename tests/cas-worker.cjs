// Execute the exact Blob worker source with Node worker_threads. This verifies
// lifecycle and computation, but does not substitute for browser policy/layout QA.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),{Worker:Thread}=require('worker_threads');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const source=JSON.parse(html.match(/const CAS_ENGINE_SOURCE = (.*);/)[1]);
const blobs=new Map();let id=0,terminated=0;
class Worker {
 constructor(url){this.thread=new Thread("const {parentPort}=require('worker_threads');globalThis.module=undefined;globalThis.exports=undefined;globalThis.require=undefined;globalThis.self=globalThis;self.postMessage=x=>parentPort.postMessage(x);"+blobs.get(url)+"\nparentPort.on('message',x=>self.onmessage({data:x}));",{eval:true});this.thread.on('message',data=>this.onmessage?.({data}));this.thread.on('error',e=>this.onerror?.(e));}
 postMessage(data){this.thread.postMessage(data)}
 terminate(){terminated++;this.thread.terminate()}
}
const ctx={Worker,CAS_ENGINE_SOURCE:source,Blob:class{constructor(parts){this.source=parts.join('')}},URL:{createObjectURL(b){const key=String(++id);blobs.set(key,b.source);return key},revokeObjectURL(key){blobs.delete(key)}},setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(html.slice(html.indexOf('function casKernel('),html.indexOf('const CAS_NOTE=')),ctx);
(async()=>{
 assert.equal((await ctx.casCompute('factor(x^2-9)')).result,'(-3+x)*(3+x)');
 assert.equal((await ctx.casCompute('substitute(ln(x),x,e)')).result,'1');
 assert.equal((await ctx.casCompute('alert(1)')).ok,false);
 const p=ctx.casCompute('sum(k,k,1,100000000)');ctx.casCancel();assert.equal((await p).error,'Calculation cancelled.');
 const first=ctx.casCompute('sum(k,k,1,100000000)'),second=ctx.casCompute('3+4');assert.equal((await first).error,'Calculation cancelled.');assert.equal((await second).result,'7');
 assert.equal((await ctx.casCompute('sum(k,k,1,100000000)')).error,'Stopped after 8 seconds. Try a simpler expression or smaller bounds.');
 assert.equal((await ctx.casCompute('integrate(x,x)')).result,'(1/2)*x^2');
 assert.equal(blobs.size,0);assert.equal(terminated,8);
 console.log('10 CAS worker/lifecycle assertions passed (Node worker_threads; not browser UI)');
})().catch(e=>{console.error(e);process.exitCode=1});
