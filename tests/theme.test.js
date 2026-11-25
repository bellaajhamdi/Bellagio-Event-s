import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_THEME, validTheme, completeTheme, applyTheme } from '../src/theme.js';

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

test('light mode applies readable tokens and switching back clears light mode', () => {
  const values={};
  globalThis.document={documentElement:{dataset:{},style:{setProperty:(key,value)=>{values[key]=value}}}};
  try {
    const t={...DEFAULT_THEME,palette:'light'};
    assert.equal(validTheme(t),true);
    applyTheme(t);
    assert.equal(document.documentElement.dataset.themePalette,'light');
    assert.equal(values['--bg'],'#f4f7fa');
    assert.match(values['--cyan-soft'],/#17374c/);
    applyTheme(DEFAULT_THEME);
    assert.equal(document.documentElement.dataset.themePalette,'noir');
    assert.equal(values['--bg'],'#05080e');
    assert.match(values['--cyan-soft'],/white/);
  } finally { delete globalThis.document; }
});
