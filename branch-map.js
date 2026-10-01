const mapElement=document.querySelector('#thailand-map');
let activeBranchMap=null,branchCleanup=null,lastUserLocation=null,lastRouteRequest=0;
function initializeBranchMap(){
 if(!mapElement||!window.L)return;
 branchCleanup?.();activeBranchMap?.remove();document.querySelector('#branch-route')?.remove();
 const points=JSON.parse(document.querySelector('#branch-points').textContent);if(!points.length){mapElement.textContent='ยังไม่มีสาขาที่เปิดให้บริการ';return;}
 const bounds=L.latLngBounds([[5.6,97.3],[20.6,105.7]]);
 const map=L.map(mapElement,{scrollWheelZoom:true,maxBounds:bounds.pad(.08),maxBoundsViscosity:1,zoomSnap:.25});activeBranchMap=map;
 map.attributionControl.addAttribution('Routes: <a href="https://project-osrm.org">OSRM</a> / <a href="https://routing.openstreetmap.de/about.html">FOSSGIS</a> · <a href="https://www.openstreetmap.org/fixthemap">แก้ไขแผนที่</a>');
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
 const overview=()=>{map.setMinZoom(0);map.fitBounds(bounds,{padding:[12,12]});map.setMinZoom(map.getZoom());};
 const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text)node.textContent=text;if(cls)node.className=cls;return node;};
 const box=el('section',null,'route-box');box.id='branch-route';
 const title=el('h3','วางแผนไปสาขา'),result=el('p','เลือกจุดเริ่มต้นจากช่องค้นหา หรือกดหาสาขาใกล้ฉัน','route-result');result.setAttribute('role','status');
 const label=el('label','จุดเริ่มต้น'),start=el('input');label.append(start);
 const modes=el('label','เดินทางด้วย'),mode=el('select');
 for(const [value,text] of [['driving','รถยนต์'],['walking','เดิน'],['transit','ขนส่งสาธารณะ (Google Maps)']]){const option=el('option',text);option.value=value;mode.append(option);}modes.append(mode);
 const destinationLabel=el('label','เลือกสาขาที่ต้องการไป'),destination=el('select');const placeholder=el('option','เลือกสาขา');placeholder.value='';destination.append(placeholder);for(const [index,point] of points.entries()){const option=el('option',point.name);option.value=String(index);destination.append(option);}destinationLabel.append(destination);
 const originGroup=el('div',null,'route-origin-group');originGroup.append(label);const manual=el('div',null,'route-origin-fields');manual.append(originGroup,destinationLabel,modes);
 const actions=el('div',null,'route-actions'),calculateButton=el('button','คำนวณเส้นทาง','button primary'),google=el('a','นำทางต่อใน Google Maps ↗','button outline');calculateButton.type='button';google.target='_blank';google.rel='noopener';google.hidden=true;actions.append(calculateButton,google);
 box.append(title,manual,result,actions);document.querySelector('.locations-layout').before(box);
 let manualOrigin=null,selected=null,userMarker=null,line=null,controller=null,request=0,routeTimer,popupTimer,resizeTimer,hasRoute=false;
 const cache=new Map(),getOrigin=()=>start.value.trim()?manualOrigin?.coordinates||null:lastUserLocation;
 const locateButton=document.querySelector('#find-nearest'),locationStatus=document.querySelector('#location-status');locationStatus.textContent='';
 function googleURL(){
  const origin=getOrigin();google.hidden=selected===null||!origin||(!hasRoute&&mode.value!=='transit');
  if(selected===null)return;const url=new URL('https://www.google.com/maps/dir/');url.searchParams.set('api','1');url.searchParams.set('destination',points[selected].coordinates.join(','));url.searchParams.set('travelmode',mode.value);if(origin)url.searchParams.set('origin',origin.join(','));google.href=url.href;
 }
 function clearRoute(){controller?.abort();request++;clearTimeout(routeTimer);calculateButton.disabled=false;hasRoute=false;if(line){map.removeLayer(line);line=null;}googleURL();}
 function showOrigin(){if(userMarker){map.removeLayer(userMarker);userMarker=null;}const origin=getOrigin();if(origin&&bounds.contains(origin))userMarker=L.circleMarker(origin,{radius:9,color:'white',weight:3,fillColor:'#173cc0',fillOpacity:1}).addTo(map).bindTooltip(manualOrigin?.name||'ตำแหน่งของคุณ');}
 function nearest(origin){const distances=points.map(point=>L.latLng(origin).distanceTo(L.latLng(point.coordinates)));return distances.indexOf(Math.min(...distances));}
 async function calculate(){
  clearTimeout(routeTimer);const origin=getOrigin();
  if(!origin){result.textContent=start.value.trim()?'เลือกสถานที่จากรายการแนะนำก่อนคำนวณ':'พิมพ์จุดเริ่มต้น หรือกดหาสาขาใกล้ฉัน';if(start.value.trim())placeSearch?.search();return;}
  if(selected===null){choose(nearest(origin));return;}
  if(mode.value==='transit'){result.textContent='เส้นทางรถเมล์และรถไฟฟ้าดูได้ใน Google Maps';googleURL();return;}
  const index=selected,travelMode=mode.value,id=++request,from=origin.slice(),to=points[index].coordinates;
  const key=travelMode+':'+from.join(',')+';'+to.join(',');controller?.abort();const routeController=new AbortController();controller=routeController;
  const timeout=setTimeout(()=>routeController.abort(),12000);calculateButton.disabled=true;result.textContent=travelMode==='walking'?'กำลังคำนวณเส้นทางเดิน…':'กำลังคำนวณเส้นทางรถยนต์…';
  try{
   let route=cache.get(key);
   if(!route){
    const wait=Math.max(0,1100-(Date.now()-lastRouteRequest));if(wait)await new Promise(resolve=>setTimeout(resolve,wait));
    if(id!==request||routeController.signal.aborted)return;lastRouteRequest=Date.now();
    const coordinates=[from,to].map(([lat,lng])=>lng+','+lat).join(';');
    const endpoint=travelMode==='walking'?'https://routing.openstreetmap.de/routed-foot/route/v1/driving/':'https://router.project-osrm.org/route/v1/driving/';
    const response=await fetch(endpoint+coordinates+'?overview=full&geometries=geojson&steps=false',{signal:routeController.signal});if(!response.ok)throw Error();
    const data=await response.json();route=data.code==='Ok'?data.routes?.[0]:null;
    if(!route||!Number.isFinite(route.distance)||!Number.isFinite(route.duration)||route.geometry?.type!=='LineString')throw Error();cache.set(key,route);
   }
   if(id!==request||index!==selected||travelMode!==mode.value)return;
   if(line)map.removeLayer(line);line=L.geoJSON(route.geometry,{style:{color:'#234be4',weight:5,opacity:.85}}).addTo(map);
   map.fitBounds(line.getBounds(),{padding:[35,35],maxZoom:14});map.closePopup();
   const minutes=Math.ceil(route.duration/60),time=minutes>=60?Math.floor(minutes/60)+' ชม. '+minutes%60+' นาที':minutes+' นาที';
   result.textContent=(travelMode==='walking'?'เดิน':'รถยนต์')+' · '+(route.distance/1000).toLocaleString('th-TH',{maximumFractionDigits:1})+' กม. · ประมาณ '+time;hasRoute=true;googleURL();
  }catch{if(id===request){result.textContent='คำนวณไม่สำเร็จ ลองอีกครั้งหรือนำทางต่อใน Google Maps';hasRoute=true;googleURL();}}
  finally{clearTimeout(timeout);if(id===request)calculateButton.disabled=false;}
 }
 function selectRoute(index){clearRoute();calculateButton.disabled=false;selected=index;destination.value=String(index);title.textContent='เส้นทางไป '+points[index].name;googleURL();if(getOrigin()){result.textContent='กำลังเตรียมเส้นทาง…';routeTimer=setTimeout(calculate,450);}else result.textContent='เลือกจุดเริ่มต้นจากช่องค้นหา หรือกดหาสาขาใกล้ฉัน';}
 const closePopup=()=>{clearTimeout(popupTimer);popupTimer=setTimeout(()=>map.closePopup(),350);};
 const markers=points.map((point,index)=>{
  const content=el('div'),img=el('img',null,'branch-popup-photo');img.src=point.image;img.alt=point.name;
  const link=el('button','คำนวณเส้นทางไปสาขานี้','map-route-button');link.type='button';link.onclick=()=>selectRoute(index);content.append(img,el('strong',point.name),el('p',point.address),link);
  content.onmouseenter=()=>clearTimeout(popupTimer);content.onmouseleave=closePopup;
  const marker=L.circleMarker(point.coordinates,{radius:8,color:'white',weight:2,fillColor:'#ef454c',fillOpacity:1}).addTo(map).bindPopup(content,{maxWidth:280,autoPan:false});
  if(matchMedia('(hover:hover)').matches){marker.on('mouseover',()=>{clearTimeout(popupTimer);marker.openPopup();});marker.on('mouseout',closePopup);}marker.on('click',()=>choose(index));return marker;
 });
 function choose(index){map.setView(points[index].coordinates,15);markers[index].openPopup();document.querySelectorAll('[data-branch]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.branch)===index)));selectRoute(index);}
 document.querySelectorAll('[data-branch]').forEach(button=>button.onclick=()=>{choose(Number(button.dataset.branch));if(innerWidth<850)mapElement.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});});
 document.querySelector('[data-map-overview]').onclick=()=>{clearRoute();calculateButton.disabled=false;selected=null;destination.value='';title.textContent='วางแผนไปสาขา';result.textContent='เลือกสาขาที่ต้องการไป';map.closePopup();overview();googleURL();document.querySelectorAll('[data-branch]').forEach(button=>button.setAttribute('aria-pressed','false'));};
 const placeSearch=window.attachPlaceSearch?.(start,place=>{clearRoute();manualOrigin=place;showOrigin();if(place.coordinates)choose(selected===null?nearest(place.coordinates):selected);else result.textContent='ยังหาพิกัดไม่พบ ลองเลือกสถานที่ใกล้เคียง';},()=>points[selected??0].coordinates);
 start.oninput=()=>{manualOrigin=null;clearRoute();calculateButton.disabled=false;showOrigin();result.textContent=start.value.trim()?'เลือกสถานที่จากรายการแนะนำ':'พิมพ์จุดเริ่มต้น หรือกดหาสาขาใกล้ฉัน';if(!start.value.trim()&&lastUserLocation&&selected!==null)routeTimer=setTimeout(calculate,450);};
 destination.onchange=()=>{if(destination.value!=='')choose(Number(destination.value));else{clearRoute();selected=null;title.textContent='วางแผนไปสาขา';googleURL();result.textContent='เลือกสาขาที่ต้องการไป';document.querySelectorAll('[data-branch]').forEach(button=>button.setAttribute('aria-pressed','false'));}};
 mode.onchange=()=>{clearRoute();calculateButton.disabled=false;if(getOrigin()&&selected!==null)calculate();else result.textContent='เลือกจุดเริ่มต้นและสาขาที่ต้องการไป';};calculateButton.onclick=calculate;
 locateButton.onclick=()=>{
  if(!navigator.geolocation||!isSecureContext){locationStatus.textContent='ใช้ตำแหน่งไม่ได้ พิมพ์จุดเริ่มต้นในช่องค้นหาได้เลย';return;}
  locateButton.disabled=true;locationStatus.textContent='กำลังหาตำแหน่ง กรุณาอนุญาตในเบราว์เซอร์';
  navigator.geolocation.getCurrentPosition(position=>{lastUserLocation=[position.coords.latitude,position.coords.longitude];manualOrigin=null;placeSearch?.clear();start.value='';showOrigin();const index=nearest(lastUserLocation);locationStatus.textContent='สาขาที่ใกล้คุณ: '+points[index].name;choose(index);locateButton.disabled=false;},error=>{locationStatus.textContent=error.code===1?'ไม่ได้อนุญาตตำแหน่ง พิมพ์จุดเริ่มต้นในช่องค้นหาได้':'ยังหาตำแหน่งไม่ได้ ลองอีกครั้งหรือพิมพ์จุดเริ่มต้น';locateButton.disabled=false;},{enableHighAccuracy:false,timeout:12000,maximumAge:60000});
 };
 let pickLocation=false;const pickMessage=e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='gdd-pick-location'){pickLocation=true;mapElement.scrollIntoView({block:'center'});mapElement.style.cursor='crosshair';}};window.addEventListener('message',pickMessage);map.on('click',e=>{if(pickLocation){pickLocation=false;mapElement.style.cursor='';parent.postMessage({type:'gdd-location-picked',coordinates:[e.latlng.lat,e.latlng.lng]},location.origin);}});
 googleURL();overview();showOrigin();
 const resize=()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>map.invalidateSize(),150);};window.addEventListener('resize',resize);
 branchCleanup=()=>{window.removeEventListener("message",pickMessage);placeSearch?.dispose();clearRoute();clearTimeout(popupTimer);clearTimeout(resizeTimer);window.removeEventListener('resize',resize);};
}
initializeBranchMap();document.addEventListener('gdd:branches-updated',initializeBranchMap);
