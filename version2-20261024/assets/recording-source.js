/* Fetch the public replay from VitalDB itself; no dataset copy is hosted here. */
(()=>{'use strict';
const source='https://api.vitaldb.net/fhir/Location/OR1/$sample?at=2000-01-01T01:00:00Z&window=120&code=SNUADC%2FECG_II,SNUADC%2FPLETH,SNUADC%2FART,Solar8000%2FHR,Solar8000%2FART_SBP,Solar8000%2FART_DBP';
let pending;
async function getRecording(){
 const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
 if(local){try{const r=await fetch('assets/vitaldb-case1.json');if(r.ok)return await r.json();}catch{}}
 const response=await fetch(source,{credentials:'omit',signal:AbortSignal.timeout(25000)});
 if(!response.ok)throw Error('VitalDB HTTP '+response.status);
 const bundle=await response.json(),channels={};
 for(const entry of bundle.entry||[]){const r=entry.resource,v=r?.valueSampledData;if(!v||!r.code?.text)continue;
 const hz=1000/v.period,stride=hz===500?5:1,tokens=v.data.trim().split(/\s+/),values=[];
 for(let i=0;i<tokens.length;i+=stride){const token=tokens[i],number=Number(token),physical=number*(v.factor??1)+(v.origin?.value??0);values.push(token!==''&&Number.isFinite(number)&&Number.isFinite(physical)?Math.round(physical*1e5)/1e5:null);}
 channels[r.code.text]={hz:hz/stride,unit:v.origin?.unit||'',values};}
 for(const name of ['SNUADC/ECG_II','SNUADC/PLETH','SNUADC/ART','Solar8000/HR','Solar8000/ART_SBP','Solar8000/ART_DBP'])if(!channels[name]?.values?.length)throw Error('Missing '+name);
 return {caseid:1,offsetSec:3600,durationSec:120,channels,source};
}
window.loadVitalRecording=()=>pending||(pending=getRecording().catch(error=>{pending=null;throw error;}));
})();
