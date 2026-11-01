const {test}=require('node:test');const assert=require('node:assert/strict');const {calculate}=require('../public/pricing');
test('tarifs réception semaine, week-end et jour férié',()=>{
assert.equal(calculate({pack:'standard',date:'2027-06-07'}).total,3000);
assert.equal(calculate({pack:'standard',date:'2027-06-11'}).total,3500);
assert.equal(calculate({pack:'golden',date:'2027-06-07'}).total,4000);
assert.equal(calculate({pack:'golden',date:'2027-06-11'}).total,4500);
assert.equal(calculate({pack:'golden',date:'2027-06-07',holiday:true}).total,4500);
});
test('remise saisonnière, limites inclusives, options proportionnelles',()=>{
assert.equal(calculate({date:'2027-09-15'}).total,4400);
assert.equal(calculate({date:'2027-05-31'}).total,4400);
assert.equal(calculate({date:'2027-06-01'}).total,5500);
assert.equal(calculate({date:'2027-09-14'}).total,5500);
assert.equal(calculate({guests:250,selected:['sweet','variety','savory']}).total,8000);
assert.equal(calculate({pack:'standard',selected:['dinner','cake','music']}).total,3000);
});
test('supplément soirée de 200 DT pour chaque palier de 50 invités après 250',()=>{
for(const [guests,extra]of [[250,0],[300,200],[350,400],[400,600],[450,800],[500,1000]]){
assert.equal(calculate({guests,date:'2027-06-07'}).total,5500+extra);
assert.equal(calculate({guests,date:'2027-01-04'}).total,(5500+extra)*.8);
}
});
