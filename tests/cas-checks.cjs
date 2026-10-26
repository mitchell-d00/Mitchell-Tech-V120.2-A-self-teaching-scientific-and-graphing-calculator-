const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const source=JSON.parse(html.match(/const CAS_ENGINE_SOURCE = (.*);/)[1]);
const ctx={};vm.createContext(ctx);vm.runInContext(source,ctx);
vm.runInContext(html.slice(html.indexOf('function casKernel('),html.indexOf('let casPending=')),ctx);
let checks=0;
function check(input,expected){const result=ctx.casKernel(input);assert.equal(result,expected,input);checks++;}
check('1/3+1/6','1/2');check('factor(x^2-9)','(-3+x)*(3+x)');
check('expand((x+2)^3)','12*x+6*x^2+x^3+8');
check('simplify((x^2-1)/(x-1))','1+x');check('solve(x^2-5*x+6=0,x)','[2,3]');
check('solve(x^2+1=0,x)','[i,-i]');check('system(x+y=3;x-y=1)','[["x",2],["y",1]]');
check('diff(x^4,x)','4*x^3');check('integrate(x^2,x)','(1/3)*x^3');check('defint(x^2,0,3,x)','9');
check('limit(sin(x)/x,x,0)','1');check('sum(k^2,k,1,5)','55');check('product(k,k,1,5)','120');
check('substitute(x^2+y,x,3)','9+y');check('determinant(matrix([1,2],[3,4]))','-2');
check('transpose(matrix([1,2],[3,4]))','matrix([1,3],[2,4])');
check('invert(matrix([1,2],[3,4]))','matrix([-2,1],[3/2,-1/2])');
check('partfrac(1/(x^2-1),x)','(-1/2)*(1+x)^(-1)+(1/2)*(-1+x)^(-1)');
check('ln(e)','1');check('log(1000)','ln(10)^(-1)*ln(1000)');
check('diff(ln(x),x)','x^(-1)');check('ilt(1/s^2,s,t)','t');
for(const bad of ['', 'x'.repeat(1001),'alert(1)','set(x,1)','x=1','1;2','ans+1','mem','substitute(x,2,3)','system(x=1)','[1','x.constructor','importScripts(1)','sum(1,1,1,2);alert(1)']){assert.throws(()=>ctx.casKernel(bad),undefined,bad);checks++;}
console.log(checks+' CAS mathematical and validation checks passed');
