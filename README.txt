// Copie tout ce code dans Google Apps Script (script.google.com)
const SHEET_ID = "COLLE_ICI_ID_DE_TON_GOOGLE_SHEET";
function doPost(e){
  const data=JSON.parse(e.postData.contents);
  const ss=SpreadsheetApp.openById(SHEET_ID);
  const live=ss.getSheetByName('live')||ss.insertSheet('live');
  const req=ss.getSheetByName('requests')||ss.insertSheet('requests');
  if(live.getLastRow()<1) live.appendRow(['dj','event']);
  if(req.getLastRow()<1) req.appendRow(['id','time','name','type','message','status']);
  if(data.action==='setLive'){
    live.clear(); live.appendRow(['dj','event']); live.appendRow([data.dj,data.event]);
    return out({ok:true});
  }
  if(data.action==='getLive'){
    const v=live.getRange(2,1,1,2).getValues()[0];
    return out({dj:v[0]||'DJ 6PaC',event:v[1]||'Soirée au Nash'});
  }
  if(data.action==='addRequest'){
    const id=String(Date.now()); req.appendRow([id,data.time,data.name,data.type,data.message,'new']);
    return out({ok:true,id});
  }
  if(data.action==='getRequests'){
    const vals=req.getDataRange().getValues().slice(1).filter(r=>r[5]!=='done').reverse();
    return out({requests:vals.map(r=>({id:r[0],time:r[1],name:r[2],type:r[3],message:r[4]}))});
  }
  if(data.action==='markDone'){
    const vals=req.getDataRange().getValues();
    for(let i=1;i<vals.length;i++){ if(String(vals[i][0])===String(data.id)){ req.getRange(i+1,6).setValue('done'); break; } }
    return out({ok:true});
  }
  return out({error:'action inconnue'});
}
function doGet(){return out({ok:true,name:'DJ NASH API'});}
function out(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
