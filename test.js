import test from 'ava';
import testGot from '.';

test('basic', t => {
  t.is(typeof testGot, 'function');
});
