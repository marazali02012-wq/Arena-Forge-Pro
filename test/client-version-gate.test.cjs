'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createClientVersionGate } = require('../sunucu/client-version-gate.cjs');

test('Play dağıtımı öncesinde eski istemci kabul edilir', () => {
  const gate = createClientVersionGate({});
  assert.equal(gate(null, { type: 'hello' }), true);
  assert.equal(gate(null, { type: 'rejoin', clientVersionCode: 306 }), true);
});

test('Play dağıtımı sonrası eşleşme ve geri katılımda minimum uygulanır', () => {
  const gate = createClientVersionGate({ AFP_MIN_ONLINE_VERSION_CODE: '308' });
  for (const type of ['hello', 'rejoin']) {
    for (const clientVersionCode of [undefined, 307, '308', 308.5]) {
      const frames = [];
      const socket = {
        send: frame => frames.push(JSON.parse(frame)),
        close: (code, reason) => frames.push({ code, reason })
      };
      assert.equal(gate(socket, { type, clientVersionCode }), false);
      assert.equal(frames[0].minimumClientVersionCode, 308);
      assert.equal(frames[1].code, 4406);
    }
    assert.equal(gate(null, { type, clientVersionCode: 308 }), true);
    assert.equal(gate(null, { type, clientVersionCode: 309 }), true);
  }
});

test('hatalı minimum yapılandırması sessizce çalışmaz', () => {
  for (const value of ['-1', '', '308.5', '209x', '2100000001']) {
    assert.throws(() => createClientVersionGate({ AFP_MIN_ONLINE_VERSION_CODE: value }));
  }
});
