(() => {
  'use strict';
  const people = [
    {id:'lin',name:'林见夏',role:'书店店员 · 熟悉的同行者',symbol:'❦',subtitle:'把普通的一天，也悄悄写进手记。',location:'街角书店 · 靠窗的位置',mood:'☘ 有一点期待',value:72,note:'已经习惯把窗边的位置留给你。',action:'抱着刚整理好的笔记本，等你一起出门。',outfit:'鼠尾草绿开衫、奶油色碎花裙，旧皮鞋擦得很干净。',thought:'如果你也不着急的话，今天能不能绕一点远路？',plan:'沿着河边散步，顺路买一束小雏菊。',speech:['你来啦！窗边的位置还给你留着呢。','今天的风很舒服，要一起走走吗？','这本手记……等写完了，再给你看。'],colors:['#708e78','#e7eddf','#4e6755','#c3d1b6']},
    {id:'shen',name:'沈予舟',role:'旅行作家 · 安静的倾听者',symbol:'✧',subtitle:'那些没有说完的话，可以留到路上。',location:'旧车站 · 月台长椅',mood:'☁ 从容放松',value:58,note:'话不多，但会记得你随口提过的小事。',action:'把外套搭在肩上，确认下一班列车的时间。',outfit:'浅蓝衬衫、深色长裤，口袋里装着一张折好的地图。',thought:'这次行程没有写终点。你想去哪里，就在那里多停一会儿。',plan:'去海边看看，再找一家还没打烊的小店。',speech:['不用赶，下一班车也来得及。','地图你拿着吧，今天听你的。','冷的话就说，外套给你。'],colors:['#748b9a','#e4edf0','#4e677b','#bdced6']},
    {id:'tang',name:'唐小满',role:'花店学徒 · 快乐收藏家',symbol:'✿',subtitle:'遇到喜欢的小事，就要大声告诉你。',location:'花店门前 · 遮阳棚下',mood:'✿ 快乐冒泡',value:86,note:'看到好看的花，第一反应就是想送给你。',action:'挑了一朵小花，认真比划要别在哪里。',outfit:'淡紫贝雷帽、白色泡泡袖，裙角带着一点花香。',thought:'今天的幸运花要给你。不过，陪我去吃甜点就当回礼啦！',plan:'把花送完，然后去尝新出的草莓蛋糕。',speech:['别动别动！这里别一朵花，刚刚好！','我发现一家超可爱的甜品店！','这朵送你，今天也要开心呀。'],colors:['#9a7d99','#efe5ed','#7b5f7c','#d8c3d5']}
  ];
  const $ = id => document.getElementById(id);
  let index = 0, pickerId = null, toastTimer, db = null;
  const pictures = new Map(), lines = new Map();
  const tabs = [], dots = [];
  function toast(message) { $('toast').textContent = message; $('toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('show'), 3000); }
  function setArt(element, person, miniature = false) {
    element.replaceChildren();
    const picture = pictures.get(person.id);
    element.classList.toggle('uploaded', !!picture);
    element.style.backgroundImage = picture ? 'none' : '';
    element.style.backgroundPosition = `${people.indexOf(person) * 50}% ${miniature ? '0%' : '50%'}`;
    if (picture) { const img = new Image(); img.src = picture.url; img.alt = miniature ? '' : `${person.name}的立绘`; element.append(img); }
  }
  function render() {
    $('portrait-art').classList.remove('is-bouncing');
    const p = people[index];
    ['accent','wash','ink','soft'].forEach((name,i) => $('character-card').style.setProperty(`--${name}`,p.colors[i]));
    for (const key of ['role','symbol','name','subtitle','location','mood','action','outfit','thought','plan']) $('character-'+key).textContent = p[key];
    $('relationship-label').textContent = '与你的亲近程度';
    $('relationship-value').textContent = `${p.value} / 100`;
    $('relationship-note').textContent = p.note;
    $('relationship-meter').setAttribute('aria-valuenow',p.value);
    $('relationship-fill').style.width = p.value+'%';
    $('page-number').textContent = `0${index+1} / 03`;
    $('portrait-button').setAttribute('aria-label',`点击${p.name}，听听心声`);
    $('speech-bubble').hidden = true;
    setArt($('portrait-art'),p);
    const picture = pictures.get(p.id);
    $('reset-image').hidden = !picture;
    $('image-status').textContent = picture ? (picture.saved ? '你的立绘 · 已保存在当前浏览器' : '你的立绘 · 仅在本次页面中保留') : '样板立绘 · 每个人都可以换成自己的图片';
    people.forEach((person,i) => { tabs[i].setAttribute('aria-pressed',i===index); dots[i].setAttribute('aria-current',i===index); setArt(tabs[i].firstChild,person,true); });
  }
  function select(i) { index = (i+people.length)%people.length; render(); }
  people.forEach((p,i) => {
    const tab = document.createElement('button'); tab.className = 'person-tab';
    const art = document.createElement('span'); art.className = 'mini-portrait';
    const name = document.createElement('span'); name.textContent = p.name;
    tab.append(art,name); tab.addEventListener('click',()=>select(i)); $('character-tabs').append(tab); tabs.push(tab);
    const dot = document.createElement('button'); dot.setAttribute('aria-label',`查看${p.name}`); dot.addEventListener('click',()=>select(i)); $('page-dots').append(dot); dots.push(dot);
  });
  $('previous').onclick = () => select(index-1); $('next').onclick = () => select(index+1);
  let suppressClickUntil = 0, swipe = null;
  $('portrait-button').onclick = () => {
    if (Date.now()<suppressClickUntil) return;
    const p=people[index], line=lines.get(p.id)||0;
    $('speech-label').textContent = `${p.name} · 轻声说`;
    $('speech-text').textContent = p.speech[line%p.speech.length]; lines.set(p.id,line+1);
    $('speech-bubble').hidden = false;
    const art = $('portrait-art');
    art.classList.remove('is-bouncing');
    void art.offsetWidth;
    art.classList.add('is-bouncing');
  };
  $('portrait-art').addEventListener('animationend', () => $('portrait-art').classList.remove('is-bouncing'));
  $('close-speech').onclick = () => { $('speech-bubble').hidden=true; };
  $('character-card').addEventListener('keydown',e=>{ if(e.key==='ArrowLeft'||e.key==='ArrowRight'){ e.preventDefault();select(index+(e.key==='ArrowLeft'?-1:1)); } if(e.key==='Escape') $('speech-bubble').hidden=true; });
  $('swipe-area').addEventListener('pointerdown',e=>{ if(!e.isPrimary || e.button!==0 || e.target.closest('button:not(#portrait-button),input'))return; swipe={id:e.pointerId,x:e.clientX,y:e.clientY}; });
  window.addEventListener('pointerup',e=>{ if(!swipe || swipe.id!==e.pointerId)return; const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y; swipe=null; if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4){ suppressClickUntil=Date.now()+400;select(index+(dx<0?1:-1)); } });
  window.addEventListener('pointercancel',()=>{swipe=null;});
  function openDB(){ return new Promise((resolve,reject)=>{ const request=indexedDB.open('同行手记-人物立绘',1); request.onupgradeneeded=()=>request.result.createObjectStore('portraits'); request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error); request.onblocked=()=>reject(new Error('storage blocked')); }); }
  function persist(id,blob){ return new Promise((resolve,reject)=>{ if(!db){reject(new Error('storage unavailable'));return;} const tx=db.transaction('portraits','readwrite'); if(blob)tx.objectStore('portraits').put(blob,id);else tx.objectStore('portraits').delete(id); tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error); }); }
  function replacePicture(id,blob,saved){ const old=pictures.get(id);if(old)URL.revokeObjectURL(old.url); if(blob)pictures.set(id,{url:URL.createObjectURL(blob),saved});else pictures.delete(id);render(); }
  $('change-image').onclick=()=>{pickerId=people[index].id;$('image-file').value='';$('image-file').click();};
  const busy = new Set();
  $('image-file').onchange=async()=>{
    const file=$('image-file').files[0], id=pickerId;if(!file||!id)return;
    if(busy.has(id)){toast('这位人物的图片正在保存，请稍候。');return;}
    if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)){toast('请选择 PNG、JPG、WebP 或 GIF 图片。');return;}
    if(file.size>10*1024*1024){toast('图片请控制在 10 MB 以内。');return;}
    busy.add(id);const url=URL.createObjectURL(file);
    try{
      await new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=reject;img.src=url;});
      let saved=true;try{await persist(id,file);}catch{saved=false;}
      replacePicture(id,file,saved);toast(saved?'已保存这位人物的新立绘。':'浏览器暂时无法保存，图片仅在本次页面中保留。');
    }catch{toast('这张图片无法读取，请换一张试试。');}finally{URL.revokeObjectURL(url);busy.delete(id);}
  };
  $('reset-image').onclick=async()=>{const id=people[index].id;if(busy.has(id)){toast('图片正在保存，请稍候。');return;}busy.add(id);try{if(db)await persist(id,null);replacePicture(id,null,false);toast('已恢复这位人物的样板立绘。');}catch{toast('暂时无法清除已保存图片，请稍后再试。');}finally{busy.delete(id);}};
  render();
  $('change-image').disabled=true;
  (async()=>{try{db=await openDB();const tx=db.transaction('portraits','readonly');await Promise.all(people.map(p=>new Promise(resolve=>{const request=tx.objectStore('portraits').get(p.id);request.onsuccess=()=>{if(request.result instanceof Blob) pictures.set(p.id,{url:URL.createObjectURL(request.result),saved:true});resolve();};request.onerror=resolve;})));render();}catch{document.querySelector('.page-foot span:last-child').textContent='示例人物与状态 · 当前浏览器仅支持临时换图';}finally{$('change-image').disabled=false;}})();
  window.addEventListener('unload',()=>{pictures.forEach(p=>URL.revokeObjectURL(p.url));if(db)db.close();});
})();
