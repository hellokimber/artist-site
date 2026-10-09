const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../public/newsletter.js'), 'utf8');
async function run(result, fail = false) {
  let submit;
  const button = {disabled:false,textContent:'Join the list'};
  const input = {removeAttribute(){},setAttribute(){}};
  const status = {textContent:'',children:[],append(...nodes){this.children.push(...nodes)}};
  const form = {
    action:'https://app.kit.com/forms/10021383/subscriptions',
    querySelector(selector){return selector==='button'?button:input},
    addEventListener(type,callback){submit=callback},
    reportValidity(){return true},setAttribute(){},removeAttribute(){}
  };
  let requests=0;
  vm.runInNewContext(source, {
    document:{querySelector(selector){return selector==='.newsletter-form'?form:status},createElement(){return {}}},
    URL, AbortController, setTimeout, clearTimeout, FormData:class {},
    fetch:async(url,options)=>{requests++;assert.equal(url,form.action);assert.equal(options.method,'POST');if(fail)throw Error('offline');return {ok:true,json:async()=>result}}
  });
  await submit({preventDefault(){}});
  assert.equal(requests,1);
  return {button,status};
}
(async()=>{
  let r=await run({status:'success'});
  assert.match(r.status.textContent,/Check your email/);assert.equal(r.button.disabled,true);
  r=await run({status:'error',errors:{messages:['Email is invalid'],fields:['email_address']}});
  assert.equal(r.status.textContent,'Email is invalid');assert.equal(r.button.disabled,false);
  r=await run(null,true);assert.match(r.status.textContent,/couldn’t confirm/);assert.equal(r.button.disabled,false);
  r=await run({status:'quarantined',url:'https://app.kit.com/confirm/test'});
  assert.equal(r.status.children[0].href,'https://app.kit.com/confirm/test');
  r=await run({status:'success',consent:{enabled:true,url:'https://app.kit.com/consent/test'}});
  assert.match(r.status.textContent,/One more step/);
  r=await run({status:'quarantined',url:'https://untrusted.example/'});
  assert.match(r.status.textContent,/couldn’t confirm/);
  console.log('PASS: success, validation error, network failure, verification, consent, and untrusted redirect handling. No live signups sent.');
})().catch(error=>{console.error(error);process.exit(1)});
