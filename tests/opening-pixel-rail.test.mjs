import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { railwayLayout,railwayPoint,pixelRailwayRuntime } from '../opening-pixel-rail.js';

test('the railway crosses the scene center with every station on the route',()=>{
 for(const width of [240,280,360,640,1000])for(const count of [0,1,2,3,6,7,20]){
  const layout=railwayLayout(width,count);
  assert.equal(layout.stops.length,count);
  assert.equal(layout.closed,false);
  assert.doesNotMatch(layout.path,/Z$/);
  for(const stop of layout.stops){
   const point=railwayPoint(layout,stop.distance);
   assert.ok(Math.abs(point.x-stop.x)<.01&&Math.abs(point.y-stop.y)<.01);
   assert.ok(stop.labelX>=12&&stop.labelX+layout.labelWidth<=width-12);
  }
  for(let at=0;at<=layout.length;at+=4){
   const point=railwayPoint(layout,at);
   assert.ok(Number.isFinite(point.angle));
   if(count&&layout.orientation==='vertical')assert.ok(point.x>=width*.38&&point.x<=width*.62,'phone rails stay in the middle, away from the outside edges');
   if(count&&layout.orientation==='horizontal')assert.equal(point.y,layout.height/2);
   assert.ok(point.x>=27&&point.x<=width-27&&point.y>=27&&point.y<=layout.height-27);
  }
 }
 const desktop=railwayLayout(892,6),phone=railwayLayout(360,6);
 assert.equal(desktop.orientation,'horizontal');assert.equal(desktop.rows,1);
 assert.equal(phone.orientation,'vertical');assert.equal(phone.columns,1);
 for(let i=1;i<phone.stops.length;i++)assert.ok(phone.stops[i].y>phone.stops[i-1].y);
});
test('mobile bends meet smoothly, end buffers terminate the line, and long labels stay clear',()=>{
 const layout=railwayLayout(360,6,100);
 assert.ok(layout.height>600);
 assert.equal(layout.segments.filter(s=>s.type==='curve').length,5);
 for(const s of layout.segments.slice(1)){
  const before=railwayPoint(layout,s.start-.01),after=railwayPoint(layout,s.start+.01);
  assert.ok(Math.hypot(before.x-after.x,before.y-after.y)<.03);
  assert.ok(Math.abs(before.angle-after.angle)<.1);
 }
 assert.deepEqual(railwayPoint(layout,-100),railwayPoint(layout,0));
 assert.deepEqual(railwayPoint(layout,layout.length+100),railwayPoint(layout,layout.length));
 for(const s of layout.stops){
  assert.ok(s.labelY>=12&&s.labelY+100<=layout.height-12);
  assert.ok(s.labelX+layout.labelWidth<=s.x-39||s.labelX>=s.x+39);
 }
 for(let i=1;i<layout.stops.length;i++)assert.ok(layout.stops[i].distance>layout.stops[i-1].distance);
});

function mountRailway({width=360,count=6,selected=0}={}) {
 const frames=new Map(),timers=new Map(),events=new Map(),observers=[],arrivals=[];
 let now=100,id=0;
 const element=()=>({dataset:{},style:{setProperty(k,v){this[k]=v;}},attributes:{},setAttribute(k,v){this.attributes[k]=v;}});
 const car=element(),status=element(),paths=Array.from({length:4},element);
 const buffers=Array.from({length:2},element);
 const svg={...element(),querySelectorAll:s=>s==='.rail-route'?paths:buffers};
 const stops=Array.from({length:count},(_,i)=>({...element(),offsetHeight:50,querySelector:()=>({textContent:'故事'+i})}));
 const map={...element(),clientWidth:width,querySelector:s=>s==='.rail-track'?svg:car,querySelectorAll:()=>stops};
 const root={...element(),querySelector:s=>s==='[data-rail-map]'?map:status};
 root.dataset.selected=String(selected);
 const context={root,arrivals,makeLayout:railwayLayout,pointAt:railwayPoint,
  performance:{now:()=>now},
  requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:i=>frames.delete(i),
  setTimeout:(fn,delay)=>{timers.set(++id,{fn,due:now+delay});return id;},clearTimeout:i=>timers.delete(i),
  window:{addEventListener:(k,fn)=>events.set(k,fn),removeEventListener:k=>events.delete(k)},
  ResizeObserver:class {constructor(fn){this.fn=fn;observers.push(this);}observe(){}disconnect(){}},
  IntersectionObserver:class {constructor(fn){this.fn=fn;observers.push(this);}observe(){}disconnect(){}},
 };
 const runtime=new Script(`(${pixelRailwayRuntime.toString()})(root,index=>{root.dataset.selected=String(index);arrivals.push(index);},makeLayout,pointAt)`).runInNewContext(context);
 function advance(ms){const end=now+ms;while(now<end){now=Math.min(end,now+20);for(const [key,timer] of [...timers])if(timer.due<=now){timers.delete(key);timer.fn();}const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(now));}}
 return {runtime,root,map,car,arrivals,frames,timers,advance,resize(value){map.clientWidth=value;observers[0].fn();},show(value){observers[1].fn([{isIntersecting:value}]);}};
}

test('rail carriage reaches the selected story after travel, then reverses along the same rails at the end',()=>{
 const h=mountRailway({selected:1});h.runtime.start();h.runtime.travel(2);
 h.advance(600);
 assert.equal(h.root.dataset.selected,'1');assert.equal(h.root.dataset.railState,'travelling');
 assert.ok(Number.isFinite(Number(h.car.dataset.angle)));
 h.advance(400);
 assert.deepEqual(h.arrivals,[2]);assert.equal(h.root.dataset.railState,'parked');assert.equal(h.frames.size,0);
 h.advance(7000);assert.equal(h.root.dataset.railState,'parked');
 h.advance(2200);assert.equal(h.root.dataset.railTarget,'3');assert.equal(h.root.dataset.selected,'2');
 h.runtime.setPaused(true);h.runtime.travel(5);h.runtime.setPaused(false);
 h.advance(9100);assert.equal(h.root.dataset.railTarget,'4');assert.equal(h.root.dataset.selected,'5');
 const start=Number(h.car.dataset.distance);h.advance(4200);
 assert.equal(h.root.dataset.selected,'4');assert.ok(Number(h.car.dataset.distance)<start);assert.equal(h.car.dataset.direction,'backward');
});

test('redirecting, resize and resume keep the car on the track; pause and reduced-motion selection do not run frames',()=>{
 const h=mountRailway();h.runtime.travel(5);h.advance(700);
 const before=Number(h.car.dataset.distance);h.runtime.travel(2);
 assert.equal(Number(h.car.dataset.distance),before);assert.equal(h.root.dataset.selected,'0');
 h.advance(400);h.resize(1000);assert.equal(h.map.dataset.railOrientation,'horizontal');
 h.advance(4000);assert.equal(h.root.dataset.selected,'2');
 const destination=railwayLayout(1000,6).stops[2].distance;
 assert.ok(Math.abs(Number(h.car.dataset.distance)-destination)<.01);
 h.runtime.travel(4);h.advance(300);h.show(false);
 const suspended=Number(h.car.dataset.distance);h.advance(1500);
 assert.equal(Number(h.car.dataset.distance),suspended);assert.equal(h.frames.size,0);
 h.show(true);h.advance(4200);assert.equal(h.root.dataset.selected,'4');
 h.runtime.setPaused(true);h.runtime.travel(1);
 assert.equal(h.root.dataset.selected,'1');assert.equal(h.frames.size,0);assert.equal(h.timers.size,0);
 h.runtime.setPaused(false);h.runtime.suspend();h.advance(20000);
 assert.equal(h.root.dataset.selected,'1');assert.equal(h.frames.size,0);assert.equal(h.timers.size,0);
 h.runtime.resume();h.advance(12200);assert.equal(h.root.dataset.selected,'0');
});
