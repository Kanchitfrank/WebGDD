(() => {
 let probe;
 window.gddLocal={available(){return probe||(probe=fetch('../api/admin',{credentials:'same-origin',cache:'no-store'}).then(r=>r.ok?r.json():null).then(value=>value?.local===true).catch(()=>false));},async save(type,data){const response=await fetch('../api/save/'+type,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(data,(key,value)=>key==='_kept'?undefined:value)});const result=await response.json();if(!response.ok)throw Error(result.error||'บันทึกไม่ได้');}};
})();
