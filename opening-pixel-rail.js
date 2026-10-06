// One central route supplies the visible rails, stations and carriage movement.
export function railwayLayout(width,count,labelHeight=50) {
  width=Math.max(240,Number(width)||640);
  count=Math.max(0,Math.trunc(count)||0);
  const horizontal=width>=560&&(width-64)/Math.max(1,count)>=88;
  const labelWidth=horizontal?Math.min(146,(width-64)/Math.max(1,count)-12):Math.min(210,width*.56-54);
  const gap=Math.max(82,labelHeight+32),height=horizontal?labelHeight*2+104:128+Math.max(0,count-1)*gap;
  const stops=[],segments=[];
  let length=0,path='',cursor=null;
  const n=value=>Math.round(value*100)/100;
  function line(x,y){
    if(!cursor){cursor={x,y};path=`M${n(x)} ${n(y)}`;return;}
    const size=Math.hypot(x-cursor.x,y-cursor.y);
    if(size)segments.push({type:'line',x1:cursor.x,y1:cursor.y,x2:x,y2:y,start:length,length:size});
    length+=size;path+=` L${n(x)} ${n(y)}`;cursor={x,y};
  }
  function bend(x,y){
    const from=cursor,dy=y-from.y;
    const s={type:'curve',x1:from.x,y1:from.y,c1x:from.x,c1y:from.y+dy*.5,c2x:x,c2y:y-dy*.5,x2:x,y2:y,start:length,samples:[{t:0,length:0}]};
    let previous=from,size=0;
    for(let i=1;i<=40;i++){
      const t=i/40,u=1-t;
      const p={x:u*u*u*s.x1+3*u*u*t*s.c1x+3*u*t*t*s.c2x+t*t*t*x,y:u*u*u*s.y1+3*u*u*t*s.c1y+3*u*t*t*s.c2y+t*t*t*y};
      size+=Math.hypot(p.x-previous.x,p.y-previous.y);s.samples.push({t,length:size});previous=p;
    }
    s.length=size;segments.push(s);length+=size;
    path+=` C${n(s.c1x)} ${n(s.c1y)} ${n(s.c2x)} ${n(s.c2y)} ${n(x)} ${n(y)}`;cursor={x,y};
  }
  if(count&&horizontal){
    const y=labelHeight+52,slot=(width-64)/count;
    line(28,y);
    for(let i=0;i<count;i++){
      const x=32+slot*(i+.5),side=i%2?'bottom':'top';line(x,y);
      stops.push({x,y,distance:length,index:i,side,labelX:x-labelWidth/2,labelY:side==='top'?y-32-labelHeight:y+32});
    }
    line(width-28,y);
  }else if(count){
    line(width*.56,28);
    for(let i=0;i<count;i++){
      const x=width*(i%2?.44:.56),y=64+i*gap,side=i%2?'left':'right';
      if(i)bend(x,y);else line(x,y);
      stops.push({x,y,distance:length,index:i,side,labelX:i%2?x+40:x-40-labelWidth,labelY:y-labelHeight/2});
    }
    line(cursor.x,height-28);
  }
  return {width,height,columns:horizontal?count:1,rows:horizontal?1:count,orientation:horizontal?'horizontal':'vertical',labelWidth,stops,segments,length,path,closed:false};
}

export function railwayPoint(layout,distance) {
  if(!layout.segments.length)return {x:layout.width/2,y:64,angle:0};
  distance=Math.max(0,Math.min(layout.length,distance));
  const s=layout.segments.find(segment=>distance<=segment.start+segment.length)||layout.segments.at(-1);
  const local=distance-s.start;
  if(s.type==='line'){
    const t=Math.max(0,Math.min(1,local/s.length));
    return {x:s.x1+(s.x2-s.x1)*t,y:s.y1+(s.y2-s.y1)*t,angle:Math.atan2(s.y2-s.y1,s.x2-s.x1)*180/Math.PI};
  }
  const found=s.samples.findIndex(sample=>sample.length>=local),index=found<0?s.samples.length-1:Math.max(1,found),a=s.samples[index-1],b=s.samples[index];
  const t=a.t+(b.t-a.t)*Math.max(0,Math.min(1,(local-a.length)/(b.length-a.length))),u=1-t;
  const x=u*u*u*s.x1+3*u*u*t*s.c1x+3*u*t*t*s.c2x+t*t*t*s.x2;
  const y=u*u*u*s.y1+3*u*u*t*s.c1y+3*u*t*t*s.c2y+t*t*t*s.y2;
  const dx=3*u*u*(s.c1x-s.x1)+6*u*t*(s.c2x-s.c1x)+3*t*t*(s.x2-s.c2x);
  const dy=3*u*u*(s.c1y-s.y1)+6*u*t*(s.c2y-s.c1y)+3*t*t*(s.y2-s.c2y);
  return {x,y,angle:Math.atan2(dy,dx)*180/Math.PI};
}

// A small top-view pixel carriage can turn on the same path on both screen sizes.
export function pixelRailCar() {
  return `<svg viewBox="-34 -18 68 36" aria-hidden="true" shape-rendering="crispEdges"><g fill="#473b44"><path d="M-24-16h7v5h-7zm34 0h7v5h-7zm-34 27h7v5h-7zm34 0h7v5h-7z"/><path d="M-31-9h4v-5h48v3h8v5h3v12h-3v5h-8v3h-48v-5h-4z"/></g><path fill="#a5757c" d="M-27-9h4v-2h43v3h7v16h-7v3h-43v-2h-4z"/><path fill="#f0d5ad" d="M-22-9h39v2h7v14h-7v2h-39z"/><path fill="#c4a09c" d="M-22-7h35v14h-35z"/><path fill="#f4e4c8" d="M-17-7h25v14h-25z"/><path fill="#617478" d="M16-5h7v10h-7zm-40 1h4v8h-4z"/><path fill="#a6b6af" d="M17-4h5v3h-5zm-40 1h2v3h-2z"/><path fill="#967379" d="M-13-4h5v8h-5zm12 0h5v8h-5z"/><path fill="#e5c3ad" d="M-12-3h3v2h-3zm12 0h3v2h-3z"/><path fill="#b69184" d="M-21 9h39v2h-39z"/><g class="rail-headlight" fill="#ffeab1"><path d="M28-6h4v3h-4zm0 9h4v3h-4z"/></g><g class="rail-tail-light" fill="#efb693"><path d="M-31-6h3v3h-3zm0 9h3v3h-3z"/></g></svg>`;
}

export function pixelRailwayRuntime(root,onArrive,makeLayout,pointAt) {
  const map=root.querySelector('[data-rail-map]');
  if(!map)return null;
  const svg=map.querySelector('.rail-track'),paths=[...svg.querySelectorAll('.rail-route')],buffers=[...svg.querySelectorAll('[data-rail-buffer]')];
  const car=map.querySelector('[data-rail-car]'),stops=[...map.querySelectorAll('[data-select]')];
  const status=root.querySelector('[data-rail-status]');
  const count=stops.length;
  let layout=null,distance=0,target=Math.max(0,Number(root.dataset.selected)||0),start=0,end=0,elapsed=0,duration=0,direction=1;
  let travelling=false,paused=false,rootVisible=true,mapVisible=true,disposed=false,raf=0,last=0,timer=0,due=0,dwell=4600,lastWidth=0;
  const name=index=>stops[index]?.querySelector('.rail-stop-title')?.textContent||'';
  function describe(){
    root.dataset.railState=paused?'paused':travelling?'travelling':'parked';
    root.dataset.railTarget=String(target);
    if(status)status.textContent=count?(travelling?'开往 ':'停靠 ')+String(target+1).padStart(2,'0')+' · '+name(target):'添加第一站，开始这段旅程。';
    stops.forEach((stop,i)=>stop.dataset.enroute=String(travelling&&i===target));
    map.dataset.moving=String(travelling&&!paused);
  }
  function draw(){
    if(!layout||!count)return;
    const p=pointAt(layout,distance);
    car.style.transform=`translate(${p.x}px,${p.y}px) translate(-50%,-50%) rotate(${p.angle}deg)`;
    car.dataset.distance=distance.toFixed(2);car.dataset.angle=p.angle.toFixed(2);car.dataset.direction=direction>0?'forward':'backward';
  }
  function cancel(){
    cancelAnimationFrame(raf);raf=0;last=0;
    if(timer){dwell=Math.max(0,due-performance.now());clearTimeout(timer);timer=0;}
  }
  function wake(){
    cancelAnimationFrame(raf);raf=0;last=0;
    map.dataset.railActive=String(!paused&&rootVisible&&mapVisible&&!disposed);
    if(paused||!rootVisible||!mapVisible||disposed||count<2)return;
    if(travelling)raf=requestAnimationFrame(frame);
    else if(!timer){due=performance.now()+dwell;timer=setTimeout(()=>{
      timer=0;
      if(target+direction>=count||target+direction<0)direction*=-1;
      travel(target+direction,false);
    },dwell);}
  }
  function arrive(index){
    target=index;distance=layout.stops[index].distance;travelling=false;onArrive(index);describe();draw();wake();
  }
  function travel(index,manual=true){
    if(!layout||!Number.isInteger(index)||index<0||index>=count)return;
    cancel();target=index;dwell=manual?9000:4600;
    const delta=layout.stops[index].distance-distance;
    if(Math.abs(delta)>.2)direction=delta>0?1:-1;
    if(paused||Math.abs(delta)<.2){arrive(index);return;}
    planJourney();
    travelling=true;describe();wake();
  }
  function planJourney(){
    distance=Math.max(0,Math.min(layout.length,distance));
    start=distance;end=layout.stops[target].distance;
    if(Math.abs(end-start)>.2)direction=end>start?1:-1;
    elapsed=0;duration=Math.max(800,Math.min(3800,Math.abs(end-start)/110*1000));
  }
  function frame(now){
    raf=0;if(paused||!rootVisible||!mapVisible||disposed)return;
    const delta=last?Math.min(now-last,100):0;last=now;elapsed+=delta;
    const t=Math.min(1,elapsed/duration),eased=t*t*(3-2*t);
    distance=start+(end-start)*eased;draw();
    if(t>=1){arrive(target);return;}
    raf=requestAnimationFrame(frame);
  }
  function build(){
    const width=map.clientWidth||640;
    if(Math.abs(width-lastWidth)<1&&layout)return;
    lastWidth=width;
    const measure=makeLayout(width,count);
    stops.forEach(stop=>{stop.style.width=measure.labelWidth+'px';stop.style.height='auto';});
    const labelHeight=Math.max(46,...stops.map(stop=>stop.offsetHeight));
    const progress=layout?.length?distance/layout.length:0;
    layout=makeLayout(width,count,labelHeight);
    map.style.height=layout.height+'px';map.dataset.railReady='true';map.dataset.railRows=String(layout.rows);map.dataset.railOrientation=layout.orientation;
    svg.setAttribute('viewBox',`0 0 ${layout.width} ${layout.height}`);
    paths.forEach(path=>path.setAttribute('d',layout.path));
    buffers.forEach((buffer,i)=>{const p=pointAt(layout,i?layout.length:0);buffer.setAttribute('transform',`translate(${p.x},${p.y}) rotate(${p.angle})`);buffer.setAttribute('visibility',count?'visible':'hidden');});
    stops.forEach((stop,i)=>{const s=layout.stops[i];stop.style.left=s.labelX+'px';stop.style.top=s.labelY+'px';stop.style.height=labelHeight+'px';stop.dataset.side=s.side;stop.style.setProperty('--rail-dot-x',(s.x-s.labelX)+'px');stop.style.setProperty('--rail-dot-y',(s.y-s.labelY)+'px');});
    if(count){
      distance=travelling?layout.length*progress:layout.stops[target].distance;
      if(travelling)planJourney();
    }
    car.hidden=!count;draw();describe();
  }
  const resize=typeof ResizeObserver==='function'?new ResizeObserver(build):null;
  const intersection=typeof IntersectionObserver==='function'?new IntersectionObserver(rows=>{mapVisible=Boolean(rows[0]?.isIntersecting);cancel();wake();}):null;
  build();resize?.observe(map);intersection?.observe(map);window.addEventListener('resize',build);
  return {
    travel,
    setPaused(value){if(paused===value)return;paused=value;cancel();describe();wake();},
    setVisible(value){if(rootVisible===value)return;rootVisible=value;cancel();wake();},
    suspend(){disposed=true;cancel();resize?.disconnect();intersection?.disconnect();window.removeEventListener('resize',build);},
    resume(){disposed=false;build();resize?.observe(map);intersection?.observe(map);window.addEventListener('resize',build);wake();},
    start(){wake();},
  };
}
