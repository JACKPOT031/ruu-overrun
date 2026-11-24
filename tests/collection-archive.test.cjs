/* Node 18+: node tests/collection-archive.test.cjs
 * Pure module checks; also verify the shipped integration anchors.
 */
function runCollectionTests(source,index){
 const tests=[];
 const assert=(ok,msg='assertion failed')=>{if(!ok)throw new Error(msg)};
 const equal=(a,b,msg='')=>assert(a===b,(msg?msg+': ':'')+String(a)+' != '+String(b));
 const test=(name,fn)=>{fn();tests.push(name)};
 const seed=()=>({values:new Map(),writes:0,getItem(k){return this.values.get(k)||null},setItem(k,v){this.writes++;this.values.set(k,v)}});
 const cfg={weapons:[{id:'pulse',type:'WEAPON',name:'pulse'},{id:'orbit',type:'WEAPON',name:'orbit'},{id:'speed',type:'PASSIVE',name:'speed'}],
 fusions:[{id:'frostThunder',name:'fusion'}],finishers:[{id:'city',name:'city'}],jackpots:[{key:'duo',label:'duo'}],pilots:[{id:'elio',jp:'Elio',desc:'Guard'}]};
 function fixture(storage=seed(),ach=[],dev=false){
  const window={RUU_LOCAL_DEV_MODE:dev,RUU_EXPANSION:{status:()=>ach.map(id=>({id,unlocked:true}))},addEventListener(){}};
  const rng={getRandomValues(){throw new Error('Use explicit rolls in tests')}};
  new Function('window','localStorage','document','crypto',source)(window,storage,undefined,rng);
  const c=window.RUU_COLLECTION;c.register(cfg);
  const g={player:{mods:{pulse:1,orbit:0},x:0,y:0},time:0};
  c.begin(g);
  return {c,g,window,storage};
 }
 const chest=()=>({x:0,y:0});
 const enemy=(kind,flags={})=>({kind,hp:0,x:0,y:0,r:20,...flags});
 const roll=(first,second=0)=>{let n=0;return()=>n++===0?first:second};
 function markup(c,view,filter){const root={innerHTML:'',querySelectorAll:()=>[],querySelector:()=>({})};c.render(root,view,filter,()=>{});return root.innerHTML}
 test('initial inventory and real starting weapon only',()=>{
  const {c,g}=fixture();equal(c.ownedCount(),0);equal(c.counts('weapon').total,2);equal(c.counts('weapon').found,1);equal(g.collectionStyle,'normal');equal(c.snapshot().shards,0);
 });
 test('chest probability boundary and one roll per chest',()=>{
  const {c,g}=fixture();c.onChest(g,chest(),roll(.40));equal(c.ownedCount(),0);
  const item=chest();c.onChest(g,item,roll(.399));c.onChest(g,item,roll(0));equal(c.ownedCount(),1);equal(g.collectionRun.loot,1);
 });
 test('duplicates convert to shards and can exchange exactly once',()=>{
  const {c,g}=fixture();for(let i=0;i<4;i++)c.onChest(g,chest(),roll(0));
  equal(c.snapshot().relics.dust,4);equal(c.snapshot().shards,3);equal(g.collectionRun.duplicateCount,3);
  equal(c.exchange('rust'),true);equal(c.snapshot().shards,0);equal(c.ownedCount(),2);
  equal(c.exchange('rust'),false);equal(c.exchange('quintet'),false);equal(c.exchange('unknown'),false);
 });
 test('all 20 collection entries have reachable reward paths',()=>{
  const {c,g}=fixture();
  // Sample the conditional weighted draws, not their chance of occurring.
  const sources=[()=>({kind:'brute',elite:true}),()=>({kind:'boss'}),()=>({kind:'final'}),
    ()=>({kind:'true_devora',trueDevora:true,trueBossRole:'HUNTER'}),
    ()=>({kind:'true_devora',trueDevora:true,secretReinforcement:true,trueBossRole:'HUNTER'}),
    ()=>({kind:'secret_ruu',secretRuu:true}),()=>({kind:'enemy_astraea',enemyAstraea:true})];
  for(let i=0;i<100;i++){
    c.onChest(g,chest(),roll(0,i/100));for(const make of sources){const e=make();c.onKill(g,enemy(e.kind,e),roll(0,i/100))}
  }
  g.trueEndCleared=true;g.trueEndCount=5;c.onKill(g,enemy('true_devora',{trueDevora:true,trueBossRole:'REAPER'}),roll(1));
  g.secretBossCleared=true;c.onKill(g,enemy('secret_ruu',{secretRuu:true}),roll(1));equal(c.ownedCount(),20);
 });
 test('normal enemy encounters require visibility, and kill records are independent of sighting',()=>{
  const {c,g}=fixture(),e=enemy('runner',{hp:10,x:1000,mutation:{type:'frenzy'}});
  c.observe(g,e,g.player);equal(c.counts('enemy').found,0);e.x=20;c.observe(g,e,g.player);equal(c.counts('enemy').found,2);
  e.hp=0;c.onKill(g,e,roll(1));c.onKill(g,e,roll(1));const s=c.snapshot();
  equal(s.archive['enemy/runner'],3);equal(s.kills['enemy/runner'],1);equal(s.kills['enemy/mutation-frenzy'],1);
 });
 test('ordinary kills and screen cleanup do not grant relics',()=>{
  const {c,g}=fixture();c.onKill(g,enemy('runner'),roll(0));c.onKill(g,enemy('brute',{secretScreen:true,secretScreenCleaned:true}),roll(0));
  equal(c.ownedCount(),0);assert(!c.snapshot().archive['enemy/screen-brute']);
 });
 test('distinct true-core, reinforcement and hostile identities',()=>{
  const {c,g}=fixture();c.onKill(g,enemy('true_devora',{trueDevora:true,trueBossRole:'HUNTER'}),roll(1));
  c.onKill(g,enemy('true_devora',{trueDevora:true,secretReinforcement:true,trueBossRole:'HUNTER'}),roll(1));
  c.onKill(g,enemy('enemy_astraea',{enemyAstraea:true}),roll(1));
  for(const id of ['true-hunter','reinforce-hunter','hostile-astraea'])equal(c.snapshot().archive['enemy/'+id],3);
 });
 test('guaranteed quintet and complete relics only once per run',()=>{
  const {c,g}=fixture(),core=()=>enemy('true_devora',{trueDevora:true,trueBossRole:'REAPER'});
  g.trueEndCleared=true;g.trueEndCount=3;c.onKill(g,core(),roll(1));equal(c.ownedCount(),0);
  g.trueEndCount=5;c.onKill(g,core(),roll(1));c.onKill(g,core(),roll(1));equal(c.snapshot().relics.quintet,1);
  const boss=()=>enemy('secret_ruu',{secretRuu:true});
  c.onKill(g,boss(),roll(1));assert(!c.snapshot().relics.terminus);
  g.secretBossCleared=true;c.onKill(g,boss(),roll(1));c.onKill(g,boss(),roll(1));equal(c.snapshot().relics.terminus,1);
 });
 test('upgrade recorded only if the real acquired flag is set',()=>{
  const {c,g}=fixture();c.onUpgrade(g,{type:'WEAPON',id:'orbit'});equal(c.counts('weapon').found,1);
  g.player.mods.orbit=1;c.onUpgrade(g,{type:'WEAPON',id:'orbit'});equal(c.counts('weapon').found,2);
  c.onUpgrade(g,{type:'FUSION',id:'frostThunder'});equal(c.counts('evolution').found,0);
  g.fusions={frostThunder:true};c.onUpgrade(g,{type:'FUSION',id:'frostThunder'});g.evolved=true;c.onUpgrade(g,{type:'EVOLUTION',id:'evolve'});equal(c.counts('evolution').found,2);
 });
 test('finisher, jackpot and pilot identities, no aggregate guessing',()=>{
  const {c,g}=fixture(seed(),['signature','jackpot','escort']);for(const group of ['finisher','jackpot','support'])equal(c.counts(group).found,0);
  c.record(g,'finisher','city');c.record(g,'jackpot','duo');c.record(g,'support','elio');c.record(g,'support','astraea');
  equal(c.counts('finisher').found,1);equal(c.counts('jackpot').found,1);equal(c.counts('support').found,2);
 });
 test('legacy achievements migrate only known facts',()=>{
  const {c}=fixture(seed(),['boss','final','eclipse_clear','true_core','signature']);const s=c.snapshot();
  equal(s.archive['enemy/boss'],3);equal(s.archive['enemy/final'],3);equal(s.archive['enemy/eclipse'],3);
  equal(c.counts('enemy').found,3);assert(!s.kills['enemy/boss']);equal(c.counts('finisher').found,0);
 });
 test('locked costume and previously achieved complete-clear costume',()=>{
  let {c}=fixture();equal(c.selectStyle('eclipse'),false);
  const store=seed();({c}=fixture(store,['eclipse_clear']));equal(c.selectStyle('eclipse'),true);equal(c.selectedStyle(),'eclipse');
  const next=fixture(store,['eclipse_clear']);equal(next.g.collectionStyle,'eclipse');equal(next.c.selectStyle('normal'),true);
  const noAchievement=fixture(store);equal(noAchievement.c.selectedStyle(),'normal');
 });
 test('wardrobe selection is frozen on a run and drawing uses existing atlas cells',()=>{
  const {c,g,window}=fixture(seed(),['eclipse_clear']);c.selectStyle('eclipse');equal(g.collectionStyle,'normal');c.begin(g);
  const atlas={complete:true,naturalWidth:1280,naturalHeight:1280};window.RUU_SECRET_BOSS={ATLAS:atlas};
  const calls=[],ctx={save(){},restore(){},scale(){},drawImage(...a){calls.push(a)}};
  assert(c.drawStyle(ctx,g,'down',false,8,144,true));equal(calls[0][0],atlas);equal(calls[0][2],0);
  assert(c.drawStyle(ctx,g,'left',true,7,144,true));equal(calls[1][1],960);equal(calls[1][2],320);
  g.player.dashRemain=1;assert(c.drawStyle(ctx,g,'right',true,4,144,true));equal(calls[2][2],640);
  assert(c.drawStyle(ctx,g,'right',true,4,144,false));equal(calls[3][1],0);equal(calls[3][2],0);
  equal(calls[3][7],144);equal(calls[3][8],144);
  c.selectStyle('normal');equal(g.collectionStyle,'eclipse');
 });
 test('missing art falls back to normal drawing, static art fallback is supported',()=>{
  const {c,g,window}=fixture(seed(),['eclipse_clear']);c.selectStyle('eclipse');c.begin(g);
  const ctx={save(){},restore(){},scale(){},drawImage(){}};
  equal(c.drawStyle(ctx,g,'down',true,0,144,true),false);
  window.RUU_SECRET_BOSS={ART:{complete:true,naturalWidth:100,naturalHeight:200}};
  equal(c.drawStyle(ctx,g,'down',true,0,144,true),true);
 });
 test('collection persist across reload; old keys untouched',()=>{
  const storage=seed();storage.values.set('RUU_ACHIEVEMENTS_V1','["boss"]');
  const {c,g}=fixture(storage);c.onChest(g,chest(),roll(0));c.onKill(g,enemy('runner'),roll(1));c.finish(g);
  const next=fixture(storage);equal(next.c.snapshot().relics.dust,1);equal(next.c.snapshot().kills['enemy/runner'],1);
  equal(storage.getItem('RUU_ACHIEVEMENTS_V1'),'["boss"]');
 });
 test('development mode does not write, collect, equip or exchange',()=>{
  const {c,g,storage}=fixture(seed(),['eclipse_clear'],true);c.onChest(g,chest(),roll(0));c.onKill(g,enemy('boss'),roll(0));c.record(g,'support','elio');c.finish(g);
  equal(c.ownedCount(),0);equal(c.selectStyle('eclipse'),false);equal(c.exchange('dust'),false);equal(storage.writes,0);equal(c.runHTML(g),'');
 });
 test('collection rolls never call the game Math.random stream',()=>{
  const {c,g}=fixture();const math=Object.create(Math);math.random=()=>{throw new Error('Gameplay RNG called')};
  const window={RUU_EXPANSION:{status:()=>[]},addEventListener(){}};
  const storage=seed();new Function('window','localStorage','document','crypto','Math',source)(window,storage,undefined,{getRandomValues(a){a[0]=0;return a}},math);
  const sys=window.RUU_COLLECTION;sys.register(cfg);sys.begin(g);sys.onChest(g,chest());equal(sys.ownedCount(),1);
 });
 test('locked archive and relic details never reveal hidden boss names',()=>{
  const {c}=fixture();const arc=markup(c,'archive','enemy'),rel=markup(c,'relics','all'),sty=markup(c,'style','');
  assert(arc.includes('???'));assert(!arc.includes('RUU : ECLIPSE'));assert(!arc.includes('ASTRAEA // HOSTILE'));
  assert(!rel.includes('終焉の証'));assert(!rel.includes('ECLIPSE'));assert(!sty.includes('secret_ruu.webp'));
 });
 test('save corruption is contained and storage failure is nonfatal',()=>{
  let store=seed();store.values.set('RUU_COLLECTION_V1','{invalid');const {c,g}=fixture(store);
  c.onChest(g,chest(),roll(0));equal(c.ownedCount(),1);
  store={getItem(){throw new Error('blocked')},setItem(){throw new Error('blocked')}};const f=fixture(store);
  f.c.onChest(f.g,chest(),roll(0));equal(f.c.ownedCount(),1);assert(markup(f.c,'relics','all').includes('ブラウザ保存'));
 });
 test('shipped integration records real actions and both result screens',()=>{
  for(const marker of ["collection-archive.js?v=1.33.0","collection-archive.css?v=1.33.0","RUU_COLLECTION?.begin(g)","RUU_COLLECTION?.onKill(g,e)","RUU_COLLECTION?.onChest(g,ch)","RUU_COLLECTION?.onUpgrade(g,u)","RUU_COLLECTION?.observe(g,e,p)","RUU_COLLECTION?.record(g,'finisher',f.id)","RUU_COLLECTION?.record(g,'jackpot',j.key)","RUU_COLLECTION?.record(g,'support','astraea')","RUU_COLLECTION?.drawStyle(ctx,g","state='collection'","id=\"collectionBtn\"","id=\"completeArchiveBtn\"","RUU_COLLECTION?.register("])assert(index.includes(marker),'Missing '+marker);
  equal(index.split('RUU_COLLECTION?.runHTML(g)').length-1,2);
  equal(index.split('id="resultTitleBtn"').length-1,2);
  const i=index.indexOf('<script>\n(()=>{'),j=index.indexOf('</script>',i);assert(i>=0&&j>i);new Function(index.slice(i+8,j));
 });
 return tests;
}

if(typeof module!=='undefined'&&require.main===module){
 const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
 const tests=runCollectionTests(fs.readFileSync(path.join(root,'collection-archive.js'),'utf8'),fs.readFileSync(path.join(root,'index.html'),'utf8'));
 for(const name of tests)console.log('PASS: '+name);
 console.log(tests.length+' collection/wardrobe/archive checks passed');
}
