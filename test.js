'use strict';

const test = require('ava');

const testGot = require('.');

test('basic', async t => {
  t.is(typeof testGot, 'function');

  const wrapped = testGot((req, res) => {
    res.write(req.url);
    res.end();
  });
  t.is(typeof wrapped, 'function');
  t.is(typeof wrapped.stream, 'function');

  const helpers = ['get', 'post', 'put', 'patch', 'delete'];
  helpers.forEach(helper => {
    t.is(typeof wrapped[helper], 'function');
    t.is(typeof wrapped.stream[helper], 'function');
  });

  const res = await wrapped('/what');
  t.is(res.body, '/what');
});
