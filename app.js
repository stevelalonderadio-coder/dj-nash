const DJ_PASSWORDS = {"DJ 6PaC":"nashdj","DJ Frank":"frankdj","DJ LAMB3RT":"lamb3rtdj"};
const ADMIN_PASS = "nashadmin";
const store = {
  get live(){return JSON.parse(localStorage.getItem('djNashLive')||'{"dj":"DJ 6PaC","event":"Soirée au Nash"}')},
  set live(v){localStorage.setItem('djNashLive',JSON.stringify(v)); window.dispatchEvent(new Event('storage'))},
  get requests(){return JSON.parse(localStorage.getItem('djNashRequests')||'[]')},
  set requests(v){localStorage.setItem('djNashRequests',JSON.stringify(v)); window.dispatchEvent(new Event('storage'))}
};
function $(id){return document.getElementById(id)}
function updateLive(){const l=store.live; ['liveDj','djCurrent'].forEach(id=>$(id)&&($(id).textContent=l.dj)); ['liveEvent','eventCurrent'].forEach(id=>$(id)&&($(id).textContent=l.event)); if($('adminDj')) $('adminDj').value=l.dj; if($('adminEvent')) $('adminEvent').value=l.event;}
function addRequest(r){const list=store.requests; list.unshift({...r,id:Date.now(),time:new Date().toLocaleTimeString('fr-CA',{hour:'2-digit',minute:'2-digit'}),played:false}); store.requests=list;}
function renderRequests(targetId){const el=$(targetId); if(!el)return; const reqs=store.requests; el.innerHTML=reqs.length?'':'<p class="hint">Aucune demande pour le moment.</p>'; reqs.forEach(r=>{const d=document.createElement('div'); d.className='req '+(r.played?'played':''); d.innerHTML=`<strong>${r.type}</strong><br><small>${r.time} • ${r.name||'Client'} ${r.table?'• '+r.table:''}</small><p>${r.message}</p><div class="req-actions"><button class="btn ghost" data-play="${r.id}">✓ Jouée</button><button class="btn ghost" data-del="${r.id}">Supprimer</button></div>`; el.appendChild(d);}); el.querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>{store.requests=store.requests.map(r=>r.id==b.dataset.play?{...r,played:true}:r)}); el.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{store.requests=store.requests.filter(r=>r.id!=b.dataset.del)});}
function initClient(){updateLive(); $('requestForm')?.addEventListener('submit',e=>{e.preventDefault(); addRequest({name:$('clientName').value,type:$('requestType').value,table:$('tableNumber').value,message:$('message').value}); $('status').textContent='Demande envoyée au DJ ✅'; e.target.reset();});}
function initDj(){updateLive(); renderRequests('requestsList'); $('djLogin')?.addEventListener('submit',e=>{e.preventDefault(); const dj=$('djName').value, pass=$('djPass').value; if(DJ_PASSWORDS[dj]!==pass){alert('Mot de passe incorrect'); return;} store.live={...store.live,dj}; updateLive(); alert(`${dj} est maintenant en direct`);}); $('clearPlayed')?.addEventListener('click',()=>{store.requests=store.requests.filter(r=>!r.played)});}
function initAdmin(){updateLive(); renderRequests('adminRequests'); $('adminLogin')?.addEventListener('submit',e=>{e.preventDefault(); if($('adminPass').value!==ADMIN_PASS){alert('Mot de passe admin incorrect'); return;} $('adminPanel').classList.remove('hidden');}); $('saveLive')?.addEventListener('click',()=>{store.live={dj:$('adminDj').value,event:$('adminEvent').value||'Soirée au Nash'}; alert('Soirée mise en direct');});}
window.addEventListener('storage',()=>{updateLive(); renderRequests('requestsList'); renderRequests('adminRequests');});
const page=document.body.dataset.page; if(page==='client')initClient(); if(page==='dj')initDj(); if(page==='admin')initAdmin();
