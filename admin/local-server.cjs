const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),port=5510,origin=`http://127.0.0.1:${port}`,token=crypto.randomBytes(32).toString('hex');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2'};
const json=(res,code,data)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
const server=http.createServer(async(req,res)=>{
 if(req.headers.host!==`127.0.0.1:${port}`){json(res,403,{error:'เปิดผ่านตัวเปิดแอดมินบนเครื่องเท่านั้น'});return;}
 const url=new URL(req.url,origin);
 if(url.pathname.startsWith('/api/')){
  const cookie=(req.headers.cookie||'').split(';').some(value=>value.trim()===`gdd_admin=${token}`);
  if(!cookie){json(res,401,{error:'กรุณาเปิดหน้าแอดมินใหม่'});return;}
  if(url.pathname==='/api/admin'&&req.method==='GET'){json(res,200,{local:true});return;}
  const match=url.pathname.match(/^\/api\/save\/(site|news)$/);
  if(!match||req.method!=='POST'){json(res,404,{error:'ไม่พบคำสั่ง'});return;}
  if(req.headers.origin!==origin||!/^application\/json\b/.test(req.headers['content-type']||'')){json(res,403,{error:'บันทึกได้จากหน้าแอดมินบนเครื่องเท่านั้น'});return;}
  try{let bytes=0;const chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>40*1024*1024){json(res,413,{error:'ข้อมูลใหญ่เกิน 40 MB กรุณาลดจำนวนรูป'});return;}chunks.push(chunk);}const data=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(data.version!==1)throw Error('รูปแบบข้อมูลไม่ถูกต้อง');
   if(match[1]==='site'&&(!Array.isArray(data.pages)||data.pages.some(p=>!p||typeof p.path!=='string'||!Array.isArray(p.fields)||!Array.isArray(p.extras))))throw Error('ข้อมูลหน้าเว็บไม่ถูกต้อง');
   if(match[1]==='news'&&(!Array.isArray(data.posts)||data.posts.some(p=>!p||typeof p.id!=='string'||typeof p.title!=='string'||typeof p.body!=='string')))throw Error('ข้อมูลข่าวไม่ถูกต้อง');
   const target=path.join(root,'content',match[1]+'.json');const backups=path.join(root,'admin','backups');fs.mkdirSync(backups,{recursive:true});if(fs.existsSync(target))fs.copyFileSync(target,path.join(backups,match[1]+'-'+Date.now()+'-'+crypto.randomBytes(4).toString('hex')+'.json'));const temp=target+'.tmp';fs.writeFileSync(temp,JSON.stringify(data,null,2));fs.renameSync(temp,target);json(res,200,{saved:true});
  }catch(error){json(res,400,{error:error.message});}return;
 }
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 let pathname;try{pathname=decodeURIComponent(url.pathname);}catch{res.writeHead(400);res.end();return;}
 const relative=pathname.replace(/^\/+/,''),target=path.resolve(root,relative);
 if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 if(relative.split(/[\\/]/).some(part=>part.startsWith('.'))||path.relative(root,target).startsWith('admin'+path.sep+'backups')||relative.endsWith('.cjs')||relative.endsWith('.cmd')){res.writeHead(403);res.end();return;}
 let file=target;try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');const real=fs.realpathSync(file);if(!real.startsWith(root+path.sep))throw Error();const content=fs.readFileSync(real);const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};if(relative.startsWith('admin/'))headers['Set-Cookie']=`gdd_admin=${token}; HttpOnly; SameSite=Strict; Path=/`;
  res.writeHead(200,headers);res.end(req.method==='HEAD'?undefined:content);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('ไม่พบหน้าเว็บ');}
});
server.on('error',error=>{if(error.code==='EADDRINUSE')process.exit(0);console.error(error);process.exit(1);});
server.listen(port,'127.0.0.1',()=>console.log('GDD Admin: '+origin+'/admin/index.html'));
