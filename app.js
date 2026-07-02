const DJ_NASH = {
  adminPassword: 'nashadmin',
  djs: {
    '6pac': { name: 'DJ 6PaC', password: 'nashdj' },
    'frank': { name: 'DJ Frank', password: 'frankdj' },
    'lamb3rt': { name: 'DJ LAMB3RT', password: 'lamb3rtdj' }
  }
};
const $ = (id)=>document.getElementById(id);
const page = document.body.dataset.page;
function getState(){return JSON.parse(localStorage.getItem('djNashState')||'{"currentDj":"DJ 6PaC","eventName":"Soirée au Nash","requests":[]}')}
function setState(s){localStorage.setItem('djNashState',JSON.stringify(s));}
function renderLive(){const s=getState(); if($('clientDjName')) $('clientDjName').textContent=s.currentDj; if($('clientEventName')) $('clientEventName').textContent=s.eventName; if($('djDashName')) $('djDashName').textContent=s.currentDj; if($('djDashEvent')) $('djDashEvent').textContent=s.eventName;}
function addRequest(req){const s=getState(); s.requests.unshift(req); setState(s)}
function renderRequests(targetId){const el=$(targetId); if(!el)return; const s=getState(); if(!s.requests.length){el.innerHTML='<p class="muted">Aucune demande pour l’instant.</p>';return;} el.innerHTML=s.requests.map((r,i)=>`<div class="request-card ${r.played?'played':''}"><div class="meta">${r.time} • ${r.type}</div><h3>${escapeHtml(r.name)}</h3><p>${escapeHtml(r.message)}</p><button onclick="markPlayed(${i})">${r.played?'Remettre en attente':'Jouée ✅'}</button></div>`).join('')}
function markPlayed(i){const s=getState(); s.requests[i].played=!s.requests[i].played; setState(s); renderRequests('requestsList'); renderRequests('adminRequests')}
function escapeHtml(str){return String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
if(page==='client'){
  renderLive();
  $('requestForm').addEventListener('submit',e=>{e.preventDefault(); addRequest({name:$('requestName').value.trim(),type:$('requestType').value,message:$('requestMessage').value.trim(),time:new Date().toLocaleTimeString('fr-CA',{hour:'2-digit',minute:'2-digit'}),played:false}); $('requestForm').reset(); $('sentMsg').classList.remove('hidden'); setTimeout(()=>$('sentMsg').classList.add('hidden'),3500);});
}
if(page==='dj'){
  $('djLoginBtn').onclick=()=>{const key=$('djSelect').value; if($('djPassword').value===DJ_NASH.djs[key].password){sessionStorage.setItem('djNashDj',key); $('djLogin').classList.add('hidden'); $('djDashboard').classList.remove('hidden'); renderLive(); renderRequests('requestsList')}else $('djLoginError').classList.remove('hidden')};
  $('djLogoutBtn').onclick=()=>{sessionStorage.removeItem('djNashDj'); location.reload()};
  if(sessionStorage.getItem('djNashDj')){$('djLogin').classList.add('hidden'); $('djDashboard').classList.remove('hidden'); renderLive(); renderRequests('requestsList')}
  setInterval(()=>renderRequests('requestsList'),2000);
}
if(page==='admin'){
  $('adminLoginBtn').onclick=()=>{if($('adminPassword').value===DJ_NASH.adminPassword){sessionStorage.setItem('djNashAdmin','yes'); openAdmin()}else $('adminLoginError').classList.remove('hidden')};
  $('adminLogoutBtn').onclick=()=>{sessionStorage.removeItem('djNashAdmin'); location.reload()};
  function openAdmin(){const s=getState(); $('adminLogin').classList.add('hidden'); $('adminDashboard').classList.remove('hidden'); $('adminCurrentDj').value=s.currentDj; $('adminEventName').value=s.eventName; renderRequests('adminRequests')}
  $('saveLiveBtn').onclick=()=>{const s=getState(); s.currentDj=$('adminCurrentDj').value; s.eventName=$('adminEventName').value||'Soirée au Nash'; setState(s); $('adminSaved').classList.remove('hidden'); setTimeout(()=>$('adminSaved').classList.add('hidden'),3000)};
  if(sessionStorage.getItem('djNashAdmin')) openAdmin();
  setInterval(()=>renderRequests('adminRequests'),2000);
}
