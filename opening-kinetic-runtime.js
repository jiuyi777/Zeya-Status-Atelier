// The red hand and the displayed story share one circular coordinate.
export function clockSelection(angle,count) {
  if(!Number.isFinite(angle)||!Number.isInteger(count)||count<1)return -1;
  const turn=((angle%360)+360)%360;
  return Math.floor(turn/360*count+0.5)%count;
}

export function kineticInteraction(clockSelection,railFactory,railLayout,railPoint) {
  const root=document.querySelector('.kinetic');
  if(!root||root.classList.contains('is-reading'))return;
  const entries=[...root.querySelectorAll('[data-entry]')],picks=[...root.querySelectorAll('[data-select]')];
  const clock=root.dataset.theme==='soft-clock',toggle=root.querySelector('[data-motion]');
  const hour=root.querySelector('.hour-hand'),minute=root.querySelector('.minute-hand'),second=root.querySelector('.second-hand');
  const tuner=root.querySelector('[data-radio-tuner]');
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let railway=null;
  let angle=0,selected=-1,savedIndex=0,paused=media.matches,userPaused=false,held=false,holdTimer=0,raf=0,last=0,visible=true,disposed=false;
  let origin=performance.timeOrigin;
  try{origin=window.parent.performance.timeOrigin;}catch{}
  const key='status-atelier:kinetic:'+origin+':'+root.dataset.motionKey;
  function save(){try{sessionStorage.setItem(key,JSON.stringify({angle,selected,paused,userPaused,motionOverride:root.dataset.motionOverride==='true'}));}catch{}}
  try{
    const saved=JSON.parse(sessionStorage.getItem(key)||'null');
    if(saved&&Number.isFinite(saved.angle)&&Number.isInteger(saved.selected)&&saved.selected>=0&&saved.selected<entries.length){
      angle=saved.angle;savedIndex=saved.selected;userPaused=saved.userPaused===true;
      root.dataset.motionOverride=String(saved.motionOverride===true);
      paused=(media.matches&&!saved.motionOverride)||userPaused;
    }
  }catch{}
  function syncRadio(){
    if(!tuner||selected<0)return;
    const ratio=entries.length>1?selected/(entries.length-1):0;
    const frequency=(88+20*ratio).toFixed(1);
    tuner.value=String(selected);
    tuner.setAttribute('aria-valuetext',frequency+' MHz，第 '+(selected+1)+' 篇，'+(entries[selected].querySelector('h2')?.textContent||''));
    root.querySelectorAll('[data-radio-frequency]').forEach(el=>el.textContent=frequency);
    root.style.setProperty('--tuning-angle',(-125+250*ratio)+'deg');
    root.style.setProperty('--tuning-position',(ratio*100)+'%');
  }
  function select(index){
    if(!Number.isInteger(index)||index<0||index>=entries.length||index===selected)return;
    selected=index;root.dataset.selected=String(index);
    entries.forEach((entry,i)=>{entry.hidden=i!==index;});
    picks.forEach(pick=>pick.setAttribute('aria-pressed',String(Number(pick.dataset.select)===index)));
    root.querySelectorAll('[data-current]').forEach(el=>el.textContent=String(index+1).padStart(2,'0'));
    syncRadio();save();
  }
  function drawClock(){
    root.dataset.angle=(angle%360).toFixed(2);
    second?.setAttribute('transform','rotate('+angle+' 260 260)');
    minute?.setAttribute('transform','rotate('+(54+angle/60)+' 260 260)');
    hour?.setAttribute('transform','rotate('+(302+angle/720)+' 260 260)');
  }
  // Snapshot the visible target before a pointer/keyboard activation can cross a sector.
  function release(){held=false;clearTimeout(holdTimer);holdTimer=0;updatePause();}
  function freeze(){held=true;clearTimeout(holdTimer);holdTimer=setTimeout(release,1200);updatePause();save();}
  function locksTarget(e){return (clock||railway)&&e.target.closest('[data-target],[data-preview-edit]');}
  root.addEventListener('pointerdown',e=>{if(locksTarget(e))freeze();},true);
  root.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&locksTarget(e))freeze();},true);
  root.addEventListener('click',e=>{if(locksTarget(e))freeze();},true);
  root.addEventListener('pointercancel',release,true);
  picks.forEach(pick=>pick.addEventListener('click',()=>{
    const index=Number(pick.dataset.select);
    if(railway){railway.travel(index);return;}
    if(clock)angle=Math.floor(angle/360)*360+index/entries.length*360;
    select(index);if(clock)release();drawClock();save();
  }));
  tuner?.addEventListener('input',()=>select(Number(tuner.value)));
  root.querySelectorAll('[data-radio-step]').forEach(button=>button.addEventListener('click',()=>{
    if(entries.length)select((selected+Number(button.dataset.radioStep)+entries.length)%entries.length);
  }));
  function updatePause(){
    root.dataset.paused=String(paused||held);toggle?.setAttribute('aria-pressed',String(paused));
    if(toggle)toggle.textContent=paused?(clock?'继续转动':'播放动态'):(clock?'暂停指针':'暂停动态');
    const state=root.querySelector('[data-motion-state]');if(state)state.textContent=paused?'已停在这一刻':held?'正在打开这一篇':'指针转动中';
    last=0;cancelAnimationFrame(raf);raf=0;
    if(clock&&entries.length&&!paused&&!held&&visible&&!document.hidden&&!disposed)raf=requestAnimationFrame(frame);
    railway?.setPaused(paused||held);railway?.setVisible(visible&&!document.hidden);
  }
  toggle?.addEventListener('click',()=>{paused=!paused;userPaused=paused;root.dataset.motionOverride=String(!paused);release();save();});
  function frame(now){
    raf=0;if(disposed||paused||held||!visible||document.hidden)return;
    const delta=last?Math.min(now-last,100):0;last=now;
    // Keep a continuous turn count so the slower hands never jump at twelve.
    angle+=delta*360/(entries.length*5000);
    select(clockSelection(angle,entries.length));drawClock();
    raf=requestAnimationFrame(frame);
  }
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(rows=>{
    visible=Boolean(rows[0]?.isIntersecting);root.dataset.visible=String(visible&&!document.hidden);updatePause();
  }):null;
  observer?.observe(root);
  const onVisibility=()=>{root.dataset.visible=String(!document.hidden&&visible);updatePause();};
  const onPreference=()=>{if(media.matches)paused=true;root.dataset.motionOverride='false';updatePause();save();};
  document.addEventListener('visibilitychange',onVisibility);media.addEventListener?.('change',onPreference);
  window.addEventListener('pagehide',()=>{save();disposed=true;held=false;clearTimeout(holdTimer);cancelAnimationFrame(raf);railway?.suspend();observer?.disconnect();document.removeEventListener('visibilitychange',onVisibility);media.removeEventListener?.('change',onPreference);});
  window.addEventListener('pageshow',()=>{if(disposed){disposed=false;document.addEventListener('visibilitychange',onVisibility);media.addEventListener?.('change',onPreference);observer?.observe(root);railway?.resume();updatePause();}});
  select(entries.length?(clock?clockSelection(angle,entries.length):savedIndex):-1);
  if(root.dataset.theme==='pixel-dusk'&&railFactory)railway=railFactory(root,select,railLayout,railPoint);
  drawClock();updatePause();
  railway?.start();
}
