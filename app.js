// DJ NASH SYNC - Correction formulaire + Google Apps Script sans refresh
// Colle l'URL de ton Web App Google ici :
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbyfJnt2TfmX0CsNvdyPjPLvwlraCfjTJ0rjKCkcuCh4ulwbX-3palXHqWZ3DDvqoS5_og/exec";

const DEFAULT_STATE = {
  liveDj: "6pac",
  eventName: "Soirée au Nash",
  eventDesc: "Scanne, écris ta demande, et le DJ la reçoit.",
  posterUrl: "",
  djs: [
    { id:"6pac", name:"DJ 6PaC", pass:"nashdj", photo:"" },
    { id:"frank", name:"DJ Frank", pass:"frankdj", photo:"" },
    { id:"lamb3rt", name:"DJ LAMB3RT", pass:"lamb3rtdj", photo:"" }
  ],
  requests: []
};

function localGet(){
  return JSON.parse(localStorage.getItem("djNashState") || JSON.stringify(DEFAULT_STATE));
}
function localSet(state){
  localStorage.setItem("djNashState", JSON.stringify(state));
}

function jsonp(action, data = {}){
  return new Promise((resolve, reject) => {
    if(!BACKEND_URL || BACKEND_URL.includes("REMPLACE_PAR_TON_URL")){
      const s = localGet();
      if(action === "getState") return resolve(s);
      if(action === "saveState"){ localSet(data.state); return resolve({ok:true}); }
      if(action === "addRequest"){
        s.requests.unshift({
          id: Date.now().toString(),
          clientName: data.clientName || "",
          type: data.type || "Demande spéciale",
          message: data.message || "",
          status: "new",
          time: new Date().toLocaleString("fr-CA")
        });
        localSet(s);
        return resolve({ok:true});
      }
    }

    const cb = "djNashCb_" + Date.now() + "_" + Math.floor(Math.random() * 99999);
    window[cb] = (response) => {
      delete window[cb];
      script.remove();
      resolve(response);
    };

    const params = new URLSearchParams({
      action,
      callback: cb,
      payload: JSON.stringify(data)
    });

    const script = document.createElement("script");
    script.src = BACKEND_URL + "?" + params.toString();
    script.onerror = () => {
      delete window[cb];
      script.remove();
      reject(new Error("Erreur de connexion backend"));
    };
    document.body.appendChild(script);
  });
}

async function getState(){
  return await jsonp("getState");
}

async function saveState(state){
  return await jsonp("saveState", {state});
}

function setBg(el, url){
  if(!el) return;
  el.style.backgroundImage = url ? `url("${url}")` : "";
}

async function startClientPage(){
  try{
    const state = await getState();
    const dj = (state.djs || DEFAULT_STATE.djs).find(d => d.id === state.liveDj) || DEFAULT_STATE.djs[0];

    document.getElementById("liveDj").textContent = dj.name;
    document.getElementById("eventName").textContent = state.eventName || "Soirée au Nash";
    document.getElementById("eventDesc").textContent = state.eventDesc || "Scanne, écris ta demande, et le DJ la reçoit.";
    setBg(document.getElementById("djPhoto"), dj.photo);

    const posterBox = document.getElementById("eventPosterBox");
    const poster = document.getElementById("eventPoster");
    if(posterBox && poster && state.posterUrl){
      poster.src = state.posterUrl;
      posterBox.classList.remove("hidden");
    }

    const form = document.getElementById("requestForm");
    if(form){
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const button = form.querySelector("button");
        const status = document.getElementById("statusMsg");
        button.disabled = true;
        button.textContent = "Envoi...";
        status.textContent = "";

        try{
          await jsonp("addRequest", {
            clientName: document.getElementById("clientName").value,
            type: document.getElementById("requestType").value,
            message: document.getElementById("requestMsg").value
          });

          status.textContent = "Demande envoyée au DJ ✅";
          form.reset();
        }catch(err){
          status.textContent = "Erreur d'envoi. Réessaie.";
        }

        button.disabled = false;
        button.textContent = "Envoyer au DJ";
      });
    }
  }catch(err){
    console.error(err);
  }
}

let currentDj = null;

function startDjPage(){}

async function djLogin(){
  const state = await getState();
  const user = document.getElementById("djUser").value.trim().toLowerCase();
  const pass = document.getElementById("djPass").value;
  const dj = (state.djs || []).find(d => d.id === user && d.pass === pass);

  if(!dj){
    document.getElementById("loginMsg").textContent = "Accès refusé";
    return;
  }

  currentDj = dj;
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("djPanel").classList.remove("hidden");
  document.getElementById("djNameTitle").textContent = dj.name;
  document.getElementById("photoUrl").value = dj.photo || "";
  setBg(document.getElementById("profilePreview"), dj.photo);
  loadRequests();
}

async function saveDjPhoto(){
  const state = await getState();
  const photo = document.getElementById("photoUrl").value.trim();
  const dj = state.djs.find(d => d.id === currentDj.id);
  dj.photo = photo;
  currentDj.photo = photo;
  await saveState(state);
  setBg(document.getElementById("profilePreview"), photo);
  alert("Photo sauvegardée partout ✅");
}

async function loadRequests(){
  const state = await getState();
  const box = document.getElementById("requestsList");
  if(!box) return;
  box.innerHTML = "";
  (state.requests || []).forEach((r) => {
    const div = document.createElement("div");
    div.className = "request";
    div.innerHTML = `<b>${r.clientName || "Client"}</b><br>${r.type}<br>${r.message}<br><small>${r.time || ""}</small>`;
    box.appendChild(div);
  });
}

function startAdminPage(){}

async function adminLogin(){
  const pass = document.getElementById("adminPass").value;
  if(pass !== "nashadmin"){
    document.getElementById("adminMsg").textContent = "Accès refusé";
    return;
  }
  document.getElementById("adminLoginBox").classList.add("hidden");
  document.getElementById("adminPanel").classList.remove("hidden");
  loadAdmin();
}

async function loadAdmin(){
  const state = await getState();
  const sel = document.getElementById("liveDjSelect");
  sel.innerHTML = "";

  (state.djs || []).forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.name;
    if(d.id === state.liveDj) opt.selected = true;
    sel.appendChild(opt);
  });

  document.getElementById("eventInput").value = state.eventName || "";
  document.getElementById("descInput").value = state.eventDesc || "";
  document.getElementById("posterInput").value = state.posterUrl || "";
  loadDjs();
}

async function saveLiveSettings(){
  const state = await getState();
  state.liveDj = document.getElementById("liveDjSelect").value;
  state.eventName = document.getElementById("eventInput").value;
  state.eventDesc = document.getElementById("descInput").value;
  state.posterUrl = document.getElementById("posterInput").value;
  await saveState(state);
  alert("Mise en direct sauvegardée ✅");
}

async function createDj(){
  const state = await getState();
  const name = document.getElementById("newDjName").value.trim();
  const id = document.getElementById("newDjUser").value.trim().toLowerCase();
  const pass = document.getElementById("newDjPass").value.trim();
  const photo = document.getElementById("newDjPhoto").value.trim();

  if(!name || !id || !pass){
    alert("Nom, identifiant et mot de passe obligatoires");
    return;
  }

  state.djs.push({id, name, pass, photo});
  await saveState(state);
  alert("DJ créé ✅");
  loadAdmin();
}

async function loadDjs(){
  const state = await getState();
  const box = document.getElementById("djList");
  if(!box) return;
  box.innerHTML = "";

  (state.djs || []).forEach(d => {
    const div = document.createElement("div");
    div.className = "djrow";
    div.innerHTML = `<b>${d.name}</b><br>Identifiant: ${d.id}<br>${d.photo ? "Photo: OK" : "Photo: vide"}`;
    box.appendChild(div);
  });
}
