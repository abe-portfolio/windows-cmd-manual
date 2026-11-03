import test from 'node:test';
import assert from 'node:assert/strict';

class FakeEl {
  constructor() { this.dataset={};this.children=[];this.attributes={};this.value='';this.style={};this.textContent='';this.innerHTML='';this.classList={ add(){},remove(){},toggle(){},contains(){return false;} };this.isConnected=true; }
  addEventListener(name,fn) { this['on'+name]=fn; }
  appendChild(e) {this.children.push(e);return e;}
  setAttribute(k,v){this.attributes[k]=v;}
  querySelectorAll(){return [];}
}

test('ES module startup wires UI and renders initial content', async()=>{
  const elements=new Map();
  const document={
    getElementById(id){if(!elements.has(id))elements.set(id,new FakeEl());return elements.get(id);},
    querySelectorAll(){return [];},
    createElement(){return new FakeEl();}
  };
  globalThis.document=document;
  try {
    await import('../js/main.js?test=startup');
    assert.ok(document.getElementById('commandList').children.length>20);
    assert.match(document.getElementById('commandDetail').innerHTML,/コマンドプロンプトとは/);
    assert.ok(document.getElementById('terminalOutput').children.length>0);
    const input=document.getElementById('terminalInput');
    const submit=document.getElementById('terminalForm').onsubmit;
    for (const cmd of ['mkdir sample', 'dir', 'echo hello > one.txt', 'type one.txt', 'type one.txt | find "hello"', 'cd sample', 'cd ..']) {
      input.value=cmd;
      submit({preventDefault(){}});
    }
    const printed=document.getElementById('terminalOutput').children.map(x=>x.textContent).join('\n');
    assert.match(printed,/hello/);
    assert.match(printed,/sample/);
  } finally {delete globalThis.document;}
});
