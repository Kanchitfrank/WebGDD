(() => {
 const root=new URL('.',document.currentScript.src);
 const el=(tag,text,className)=>{const node=document.createElement(tag);if(text)node.textContent=text;if(className)node.className=className;return node;};
 const safeImage=value=>typeof value==='string'&&(/^data:image\/(png|jpeg|webp);base64,/.test(value)||/^assets\/[\w./-]+$/.test(value));
 const dateLabel=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)?new Date(value+'T00:00:00').toLocaleDateString('th-TH',{year:'numeric',month:'long',day:'numeric'}):'';
 const article=document.querySelector('#news-article');
 const feeds=[...document.querySelectorAll('[data-news-feed]')];
 const originalCards=new Map(feeds.map(feed=>[feed,[...feed.children].map(card=>card.cloneNode(true))]));
 let last='';
 function refresh(){if(document.hidden)return;fetch(new URL('content/news.json',root),{cache:'no-store'}).then(response=>{if(!response.ok)throw Error();return response.json();}).then(data=>{
  const serialized=JSON.stringify(data);if(serialized===last)return;last=serialized;
  const posts=(Array.isArray(data.posts)?data.posts:[]).filter(p=>p&&p.published===true&&typeof p.id==='string'&&typeof p.title==='string').sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  if(article){
   const post=posts.find(p=>p.id===new URLSearchParams(location.search).get('id'));
   article.replaceChildren();const back=el('a','← ข่าวทั้งหมด','breadcrumb');back.href=new URL('news/index.html',root);article.append(back);
   if(!post){article.append(el('h1','ไม่พบข่าวนี้'),el('p','ข่าวอาจถูกนำออกจากเว็บไซต์แล้ว'));return;}
   document.title=post.title+' | GDD CODING SCHOOL';
   const heading=el('div',null,'page-heading');heading.append(el('span',post.category||'ข่าวสาร','eyebrow'),el('h1',post.title),el('time',dateLabel(post.date),'news-date'));article.append(heading);
   if(safeImage(post.image)){const img=el('img',null,'news-detail-photo');img.src=post.image.startsWith('data:')?post.image:new URL(post.image,root);img.alt=post.title;article.append(img);}
   article.append(el('div',post.body||'','article-copy news-article-body'));return;
  }
  feeds.forEach(feed=>{
   feed.replaceChildren();
   posts.forEach(post=>{
    const card=el('article',null,'news-card');const url=new URL('news/article/index.html',root);url.searchParams.set('id',post.id);
    if(safeImage(post.image)){const link=el('a',null,'story-image-link');link.href=url;link.setAttribute('aria-label',post.title);const img=el('img');img.src=post.image.startsWith('data:')?post.image:new URL(post.image,root);img.alt=post.title;img.loading='lazy';link.append(img);card.append(link);}
    const copy=el('div',null,'card-copy');const title=el('h3');const link=el('a',post.title);link.href=url;title.append(link);copy.append(el('span',post.category||'ข่าวสาร','eyebrow'),el('time',dateLabel(post.date),'news-date'),title,el('p',post.summary||''));card.append(copy);feed.insertBefore(card,feed.children[posts.indexOf(post)]||null);
   });
   const limit=Number(feed.dataset.newsLimit);if(limit>0)[...feed.children].slice(limit).forEach(card=>card.remove());
  });
  document.dispatchEvent(new Event('gdd:news-updated'));
 }).catch(()=>{if(article)article.replaceChildren(el('p','โหลดข่าวไม่ได้ กรุณารีเฟรชหน้าเว็บอีกครั้ง'));});}
 refresh();setInterval(refresh,15000);document.addEventListener('visibilitychange',refresh);
})();
