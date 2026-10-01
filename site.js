const menu=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
menu.addEventListener('click',()=>{const expanded=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!expanded));menu.setAttribute('aria-label',expanded?'เปิดเมนู':'ปิดเมนู');navigation.classList.toggle('open',!expanded);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){navigation.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','เปิดเมนู');}});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));let count=0;document.querySelectorAll('[data-category]').forEach(card=>{const show=card.dataset.cmsHidden!=='true'&&(button.dataset.filter==='ทั้งหมด'||card.dataset.category===button.dataset.filter);card.hidden=!show;if(show)count++;});document.querySelector('.result-count').textContent=`${count} คอร์ส`;}));
const lightbox=document.querySelector('#lightbox');
document.querySelectorAll('[data-lightbox]').forEach(button=>button.addEventListener('click',()=>{const photo=lightbox.querySelector('img');photo.src=button.dataset.lightbox;photo.alt=button.dataset.caption;lightbox.querySelector('p').textContent=button.dataset.caption;lightbox.showModal();}));
lightbox.querySelector('.close-lightbox').addEventListener('click',()=>lightbox.close());
lightbox.addEventListener('click',event=>{if(event.target===lightbox){const bounds=lightbox.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)lightbox.close();}});
const carousel=document.querySelector('.hero-carousel');
if(carousel){
 const slides=[...carousel.querySelectorAll('[data-slide]')];
 const dots=[...carousel.querySelectorAll('[data-go-to]')];
 const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
 slides.forEach((slide,i)=>{slide.hidden=false;slide.classList.toggle('is-active',i===0);slide.setAttribute('aria-hidden',String(i!==0));});
 let index=0;
 let paused=reducedMotion.matches;
 let hovered=false;
 let timer=null;
 let touchStart=null;
 const canPlay=()=>!paused&&!hovered&&!document.hidden&&!carousel.contains(document.activeElement);
 const schedule=()=>{clearTimeout(timer);timer=null;if(canPlay())timer=setTimeout(()=>show(index+1),9000);};
 const show=next=>{index=(next+slides.length)%slides.length;slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===index);slide.setAttribute('aria-hidden',String(i!==index));});dots.forEach((dot,i)=>dot.setAttribute('aria-current',String(i===index)));schedule();};
 carousel.querySelectorAll('[data-slide-step]').forEach(button=>button.addEventListener('click',()=>show(index+Number(button.dataset.slideStep))));
 dots.forEach((dot,i)=>dot.addEventListener('click',()=>show(i)));
 carousel.addEventListener('mouseenter',()=>{hovered=true;schedule();});
 carousel.addEventListener('mouseleave',()=>{hovered=false;schedule();});
 carousel.addEventListener('focusin',schedule);
 carousel.addEventListener('focusout',()=>setTimeout(schedule,0));
 carousel.addEventListener('touchstart',event=>{touchStart={x:event.changedTouches[0].clientX,y:event.changedTouches[0].clientY};clearTimeout(timer);},{passive:true});
 carousel.addEventListener('touchend',event=>{if(touchStart){const dx=event.changedTouches[0].clientX-touchStart.x;const dy=event.changedTouches[0].clientY-touchStart.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))show(index+(dx<0?1:-1));else schedule();touchStart=null;}},{passive:true});
 carousel.addEventListener('touchcancel',()=>{touchStart=null;schedule();},{passive:true});
 document.addEventListener('visibilitychange',schedule);
 reducedMotion.addEventListener('change',event=>{paused=event.matches;schedule();});
 schedule();
}

const mapElement=document.querySelector('#thailand-map');
let activeBranchMap=null;
function initializeBranchMap(){
if(mapElement&&window.L){
 if(activeBranchMap)activeBranchMap.remove();
 const points=JSON.parse(document.querySelector('#branch-points').textContent);
 const thailandBounds=L.latLngBounds([[5.6,97.3],[20.6,105.7]]);
 const map=L.map(mapElement,{scrollWheelZoom:false,maxBounds:thailandBounds.pad(.08),maxBoundsViscosity:1,zoomSnap:.25});
 activeBranchMap=map;
 const overview=()=>{map.setMinZoom(0);map.fitBounds(thailandBounds,{padding:[12,12]});map.setMinZoom(map.getZoom());};
 let resizeTimer;
 window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{map.invalidateSize();overview();map.closePopup();document.querySelectorAll('[data-branch]').forEach(item=>item.setAttribute('aria-pressed','false'));},150);});
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
 let popupCloseTimer;
 const cancelPopupClose=()=>clearTimeout(popupCloseTimer);
 const schedulePopupClose=()=>{cancelPopupClose();popupCloseTimer=setTimeout(()=>map.closePopup(),350);};
 const markers=points.map(point=>{
  const content=document.createElement('div');
  const title=document.createElement('strong');title.textContent=point.name;
  const address=document.createElement('p');address.textContent=point.address;
  const link=document.createElement('a');link.href=point.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='เปิด Google Maps';
  const image=document.createElement('img');image.src=point.image;image.alt='บรรยากาศ '+point.name;image.className='branch-popup-photo';
  content.append(image,title,address,link);
  content.addEventListener('mouseenter',cancelPopupClose);
  content.addEventListener('mouseleave',schedulePopupClose);
  return L.circleMarker(point.coordinates,{radius:8,color:'#ffffff',weight:2,fillColor:'#ef454c',fillOpacity:1}).addTo(map).bindPopup(content,{maxWidth:280,autoPan:false});
 });
 if(window.matchMedia('(hover: hover)').matches)markers.forEach(marker=>{marker.on('mouseover',()=>{cancelPopupClose();marker.openPopup();});marker.on('mouseout',schedulePopupClose);});
 markers.forEach((marker,index)=>marker.on('click',()=>{map.setView(points[index].coordinates,15);document.querySelectorAll('[data-branch]').forEach(item=>item.setAttribute('aria-pressed',String(Number(item.dataset.branch)===index)));}));
 document.querySelectorAll('[data-branch]').forEach(button=>button.addEventListener('click',()=>{
  const index=Number(button.dataset.branch);map.setView(points[index].coordinates,15);markers[index].openPopup();
  document.querySelectorAll('[data-branch]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  if(window.innerWidth<850)mapElement.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }));
 document.querySelector('[data-map-overview]').addEventListener('click',()=>{map.closePopup();overview();document.querySelectorAll('[data-branch]').forEach(item=>item.setAttribute('aria-pressed','false'));});
 const locateButton=document.querySelector('#find-nearest');
 const locationStatus=document.querySelector('#location-status');
 let userMarker=null;
 locateButton.addEventListener('click',()=>{
  if(!navigator.geolocation){locationStatus.textContent='อุปกรณ์นี้ไม่รองรับตำแหน่ง เลือกสาขาจากรายการได้เลย';return;}
  if(!window.isSecureContext){locationStatus.textContent='การใช้ตำแหน่งต้องเปิดเว็บผ่าน HTTPS หรือ localhost';return;}
  locateButton.disabled=true;locationStatus.textContent='กำลังหาตำแหน่ง กรุณาอนุญาตตำแหน่งในเบราว์เซอร์';
  navigator.geolocation.getCurrentPosition(position=>{
   const location=L.latLng(position.coords.latitude,position.coords.longitude);
   const distances=points.map(point=>location.distanceTo(L.latLng(point.coordinates)));
   const nearest=distances.indexOf(Math.min(...distances));
   document.querySelectorAll('[data-branch]').forEach(item=>item.setAttribute('aria-pressed',String(Number(item.dataset.branch)===nearest)));
   if(userMarker)map.removeLayer(userMarker);
   if(thailandBounds.contains(location)){
    userMarker=L.circleMarker(location,{radius:9,color:'#ffffff',weight:3,fillColor:'#173cc0',fillOpacity:1}).addTo(map).bindTooltip('ตำแหน่งของคุณ');
    map.fitBounds(L.latLngBounds([location,points[nearest].coordinates]),{padding:[45,60],maxZoom:14});
   }else map.setView(points[nearest].coordinates,13);
   markers[nearest].openPopup();
   locationStatus.textContent=`สาขาใกล้คุณ: ${points[nearest].name} · ประมาณ ${(distances[nearest]/1000).toLocaleString('th-TH',{maximumFractionDigits:1})} กม. (ระยะทางเส้นตรง)`;
   locateButton.disabled=false;
  },error=>{
   locationStatus.textContent=error.code===1?'ไม่ได้อนุญาตตำแหน่ง เลือกสาขาเองได้จากรายการ':error.code===3?'หาตำแหน่งไม่ทันเวลา ลองอีกครั้งหรือเลือกสาขาจากรายการ':'ยังหาตำแหน่งไม่ได้ ลองเปิดตำแหน่งบนอุปกรณ์แล้วกดอีกครั้ง';
   locateButton.disabled=false;
  },{enableHighAccuracy:false,timeout:12000,maximumAge:60000});
 });
 overview();
}

}
initializeBranchMap();
document.addEventListener("gdd:branches-updated",initializeBranchMap);
