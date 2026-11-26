import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProduct } from '../worker/index.js';
import { renderProductCard } from '../src/products.js';

const product={brand:'Test',name:'Laptop',category:'portable',price:1000,image:'/images/hero.jpg',desc:'',chips:[],specs:[],featured:true};
test('stock validation keeps old products and clients compatible',()=>{
  assert.equal(validateProduct(product,'1').stock,'available');
  assert.equal(validateProduct({...product,stock:'sold_out'},'1').stock,'sold_out');
  assert.equal(validateProduct({...product,stock:'available'},'1',{stock:'sold_out'}).stock,'available');
  assert.equal(validateProduct(product,'1',{stock:'sold_out'}).stock,'sold_out');
  assert.equal(validateProduct({...product,stock:'invalid'},'1'),null);
});
test('sold out cards display status and cannot order',()=>{
  const sold=renderProductCard({...product,id:'1',stock:'sold_out',badge:'gaming'});
  assert.match(sold,/Stock épuisé/);
  assert.match(sold,/disabled/);
  assert.doesNotMatch(sold,/data-order=/);
  assert.match(renderProductCard({...product,id:'1'}),/data-order=/);
});
