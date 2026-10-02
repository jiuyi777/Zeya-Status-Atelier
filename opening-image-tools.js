export function httpsImageUrl(value) {
 try { const u=new URL(String(value||'').trim()); return u.protocol==='https:'&&!u.username&&!u.password?u.href:''; } catch { return ''; }
}
export function insertImageAt(text,start,end,url,alt='图片') {
 const src=httpsImageUrl(url);if(!src)throw new Error('请使用图床返回的 HTTPS 图片链接');
 const caption=String(alt).replace(/[\[\]\r\n]/g,' ').trim()||'图片';
 const tag=`\n\n![${caption}](${src.replaceAll('(','%28').replaceAll(')','%29')})\n\n`;
 return {text:String(text).slice(0,start)+tag+String(text).slice(end),cursor:start+tag.length};
}
export function renderImageText(value,escape) {
 const text=String(value??''),pattern=/!\[([^\]\n]*)\]\((https:\/\/[^\s)]+)\)/g;let html='',offset=0;
 for(const match of text.matchAll(pattern)){html+=escape(text.slice(offset,match.index));const url=httpsImageUrl(match[2]);html+=url?`<figure class="inline-picture"><img src="${escape(url)}" alt="${escape(match[1])}" loading="lazy" decoding="async">${match[1]&&match[1]!=='图片'?`<figcaption>${escape(match[1])}</figcaption>`:''}</figure>`:escape(match[0]);offset=match.index+match[0].length;}
 return html+escape(text.slice(offset));
}
export async function compressOpeningImage(file,{maxEdge=1200,maxBytes=220*1024,quality=.78}={}) {
 if(!['image/png','image/jpeg','image/webp','image/avif'].includes(file.type))throw new Error('请选择 JPG、PNG、WebP 或 AVIF 静态图片');
 if(file.size>30*1024*1024)throw new Error('图片大于 30MB，请先缩小尺寸');
 const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
 try {
  let scale=Math.min(1,maxEdge/Math.max(bitmap.width,bitmap.height)),blob,width,height;
  for(let pass=0;pass<9;pass++){
   width=Math.max(1,Math.round(bitmap.width*scale));height=Math.max(1,Math.round(bitmap.height*scale));
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d').drawImage(bitmap,0,0,width,height);
   blob=await new Promise((resolve,reject)=>canvas.toBlob(v=>v?resolve(v):reject(Error('图片压缩失败')),'image/webp',quality));
   if(blob.size<=maxBytes)break;
   if(quality>.53)quality-=.1;else scale*=.8;
  }
  if(blob.size>maxBytes)throw new Error('图片仍然过大，请降低长边尺寸');
  const extension=blob.type==='image/webp'?'webp':'png';
  return {blob,file:new File([blob],`opening-${Date.now()}.${extension}`,{type:blob.type}),width,height,originalBytes:file.size,bytes:blob.size};
 } finally {bitmap.close();}
}
export async function uploadOpeningImage(file,settings,{fetcher=fetch,signal}={}) {
 const form=new FormData();let endpoint;
 if(settings.provider==='cloudinary'){
  if(!/^[a-z0-9_-]+$/i.test(settings.cloud||'')||!settings.preset?.trim())throw new Error('请填写 Cloudinary cloud name 和 unsigned upload preset');
  endpoint=`https://api.cloudinary.com/v1_1/${settings.cloud}/image/upload`;form.append('file',file);form.append('upload_preset',settings.preset.trim());
 } else if(settings.provider==='imgbb'){
  if(!settings.key?.trim())throw new Error('请填写 ImgBB API Key（仅用于当前窗口）');
  endpoint='https://api.imgbb.com/1/upload';form.append('image',file);form.append('key',settings.key.trim());
 } else throw new Error('请选择并配置图床');
 const response=await fetcher(endpoint,{method:'POST',body:form,signal});
 if(!response.ok)throw new Error(`图床上传失败（HTTP ${response.status}），压缩图片仍可下载`);
 const result=await response.json(),url=httpsImageUrl(settings.provider==='cloudinary'?result.secure_url:result.data?.url);
 if(!url)throw new Error('图床没有返回有效的 HTTPS 图片链接');return url;
}
