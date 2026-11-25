import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_THEME, validTheme, completeTheme } from '../src/theme.js';

test('the default and suggested themes are valid', () => {
  assert.equal(validTheme(DEFAULT_THEME), true);
  for (const accent of ['#22d3ee','#a78bfa','#fb7185','#fbbf24','#4ade80','#60a5fa']) {
    assert.equal(validTheme({...DEFAULT_THEME, accent}), true, accent);
  }
});
test('unreadable colors, CSS injection and unknown styles are rejected', () => {
  for (const change of [{accent:'#000000'}, {accent:'red'}, {accent:'#fff;--bg:red'}, {palette:'__proto__'}, {radius:'unexpected'}, {font:'<script>'}, {density:'wide'}, {cards:'bad'}, {buttons:'bad'}, {width:'bad'}, {effects:'bad'}]) {
    assert.equal(validTheme({...DEFAULT_THEME,...change}), false);
  }
});

test('existing saved themes retain their original colors when new controls are added', () => {
  const old={palette:'midnight',accent:'#a78bfa',radius:'soft',font:'classic',density:'compact'};
  assert.equal(validTheme(old),true);
  assert.deepEqual(completeTheme(old),{...DEFAULT_THEME,...old});
});
