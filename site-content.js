(() => {
 const root=new URL('.',document.currentScript.src);
 const pagePath=decodeURIComponent(location.pathname).slice(root.pathname.length)||'index.html';
 const path=pagePath.endsWith('/')?pagePath+'index.html':pagePath;
 const originals=new Map([...document.querySelectorAll('[data-cms-id]')].map(node=>[node.dataset.cmsId,{node,html:node.innerHTML,src:node.getAttribute('src'),href:node.getAttribute('href')}]));
 let last='',baseline=null;
 const safeURL=(value,image=false)=>{if(typeof value!=='string'||!value.trim())return null;if(image&&/^data:image\/(png|jpeg|webp);base64,/.test(value))return value;try{const url=new URL(value,root);return (['http:','https:'].includes(url.protocol)||(!image&&['tel:','mailto:'].includes(url.protocol)))?url.href:null;}catch{return null;}};
 async function refresh(override){
  if(document.hidden)return;
  try{const response=await fetch(new URL('content/site.json',root),{cache:'no-store'});if(!response.ok)return;const raw=override?.pages?JSON.stringify(override):await response.text();if(raw===last)return;const data=JSON.parse(raw);const page=data.pages?.find(p=>p.path===path);if(!page)return;
   if(!baseline)baseline=new Map(page.fields.map(f=>[f.id,f.value]));
   document.querySelectorAll('[data-cms-hidden]').forEach(node=>{node.hidden=false;delete node.dataset.cmsHidden;});
   page.fields.forEach(field=>{const original=originals.get(field.id);if(!original)return;const node=document.querySelector(`[data-cms-id="${field.id}"]`);if(!node)return;
    if(field.type==='text'){const initialText=original.html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();const temp=document.createElement('div');temp.innerHTML=original.html;const text=temp.textContent.replace(/\s+/g,' ').trim();if(field.value===text||field.value===initialText)node.innerHTML=original.html;else (node.matches('.branch-select')?node.querySelector('span:last-child'):(node.querySelector('a')||node)).textContent=field.value;}
    else if(field.type==='image'){const url=safeURL(field.value,true);if(url){node.src=url;const trigger=node.closest('[data-lightbox]');if(trigger)trigger.dataset.lightbox=url;}}
    else if(field.type==='video'){const url=safeURL(field.value);if(url&&/^https:\/\/(www\.)?(youtube-nocookie\.com|youtube\.com)\/embed\//.test(url))node.src=url;}
    else if(field.type==='link'){const url=safeURL(field.value);if(url)node.href=url;}
   });
   page.fields.filter(field=>field.visible===false).forEach(field=>{const node=document.querySelector(`[data-cms-id="${field.id}"]`);if(node){const target=node.closest('.course-card,.news-card,.award-card,.gallery-item,.branch-card,.teacher-card,.video-card')||node;target.hidden=true;target.dataset.cmsHidden='true';}});
   document.querySelectorAll('.cms-extra').forEach(n=>n.remove());document.querySelector('#cms-extra-sections')?.remove();const holder=document.createElement('div');holder.id='cms-extra-sections';
   const anchors=[...document.querySelectorAll('main>section')];(page.extras||[]).filter(item=>item.published!==false).forEach(item=>{const section=document.createElement('section');section.className='section cms-extra';const title=document.createElement('h2');title.textContent=item.title||'';section.append(title);const src=safeURL(item.image,true);if(src){const img=document.createElement('img');img.src=src;img.alt=item.title||'';img.loading='lazy';section.append(img);}const body=document.createElement('p');body.className='news-article-body';body.textContent=item.body||'';section.append(body);const href=safeURL(item.link);if(href&&item.link){const link=document.createElement('a');link.href=href;link.className='button outline';link.textContent=item.linkLabel||'ดูรายละเอียด';section.append(link);}if(Number.isInteger(item.placement)&&anchors[item.placement])anchors[item.placement].before(section);else holder.append(section);});document.querySelector('main')?.append(holder);
   const branchScript=document.querySelector('#branch-points');if(branchScript&&!branchScript.dataset.collectionOwned){const points=JSON.parse(branchScript.textContent);document.querySelectorAll('.branch-card').forEach((card,i)=>{if(!points[i])return;points[i].name=card.querySelector('.branch-select')?.textContent.replace(/^\s*\d+\s*/,'').trim()||points[i].name;points[i].address=card.querySelector('p')?.textContent||points[i].address;points[i].image=card.querySelector('img')?.src||points[i].image;points[i].url=card.querySelector('a')?.href||points[i].url;if(page.branches?.[i]?.coordinates?.length===2)points[i].coordinates=page.branches[i].coordinates;});branchScript.textContent=JSON.stringify(points);document.dispatchEvent(new Event('gdd:branches-updated'));}
   last=raw;
  }catch{/* Keep the existing page usable when offline or during deployment. */}
 }
 document.addEventListener('gdd:news-updated',()=>{last='';refresh();});
 window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===parent&&parent!==window&&event.data?.type==='gdd-preview')refresh(event.data.site).then(()=>{if(!event.data.focus)return;const target=document.querySelector('[data-cms-id="'+event.data.focus+'"]');const slide=target?.closest('.hero-slide');if(slide){document.querySelectorAll('.hero-slide').forEach(n=>n.classList.toggle('is-active',n===slide));}target?.scrollIntoView({block:'center'});});});
 refresh();if(!new URLSearchParams(location.search).has('editor-preview')){setInterval(refresh,15000);document.addEventListener('visibilitychange',refresh);}
})();
