import {test} from 'node:test';
import assert from 'node:assert/strict';
import {messages,errorText} from '../../mobile/src/i18n.ts';
import {extras,questions} from '../../mobile/src/extraMessages.ts';
test('all supported UI languages have complete nonempty message catalogs',()=>{
 const keys=Object.keys(messages.ko).sort();
 for(const lang of ['ko','en','ja']){
  assert.deepEqual(Object.keys(messages[lang]).sort(),keys);
  for(const value of Object.values(messages[lang])) assert.ok(value.trim());
  for(const entry of extras) assert.ok(entry[lang].trim());
  assert.equal(questions[lang].length,questions.ko.length);
  assert.ok(questions[lang].length >= 3);
 }
 assert.match(errorText('unauthorized','ja'),/ログイン/);
 assert.equal(errorText('unknown','ja'),messages.ja.error);
});
