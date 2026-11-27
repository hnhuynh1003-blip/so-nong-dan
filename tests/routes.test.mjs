import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {routes,resolveRoute} from '../dist/shell/routes.js';
test('six unique module routes',()=>{assert.equal(routes.length,6);assert.equal(new Set(routes.map(r=>r.route)).size,6)});
for(const r of routes) test(`module boundary: ${r.route}`,()=>{assert.deepEqual(resolveRoute('#/'+r.route),{kind:'module',route:r});assert.ok(r.checkpoint.startsWith('CP-'));assert.ok(r.description)});
test('home and invalid route',()=>{assert.equal(resolveRoute('#/').kind,'home');assert.equal(resolveRoute('').kind,'home');assert.equal(resolveRoute('#/invalid').kind,'missing')});
test('synthetic fixture preserves unknown values and string weight',async()=>{const f=JSON.parse(await readFile(new URL('../fixtures/synthetic.json',import.meta.url)));assert.equal(f.synthetic,true);assert.equal(f.coverage,'unknown');assert.equal(f.sample.amountVnd,null);assert.equal(f.sample.roundingPolicy,null);assert.equal(f.sample.landUnitConversion,null);assert.equal(typeof f.sample.weightGram,'string')});
