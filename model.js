export const KEY='lilla-torg-match-v1';
export function today(now=new Date()){return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;}
export function fresh(teams){return {version:1,date:today(),history:[],teams:teams||{home:{name:'Lilla Torg FF',players:[]},away:{name:'Utmanare',players:[]}},elapsed:0,startedAt:null,goals:[]};}
export function seconds(s,now=Date.now()){return Math.floor((s.elapsed+(s.startedAt===null?0:Math.max(0,now-s.startedAt)))/1000);}
export function format(n){return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;}
export function parseTime(s){if(!/^\d{1,4}:[0-5]\d$/.test(s))throw Error('Ange tid som 12:34.');let [m,n]=s.split(':').map(Number);return m*60+n;}
export function toggle(s,now=Date.now()){if(s.startedAt===null)s.startedAt=now;else{s.elapsed+=Math.max(0,now-s.startedAt);s.startedAt=null;}}
export function score(s){return s.goals.reduce((n,g)=>(n[g.team]++,n),{home:0,away:0});}
export function ordered(s){return [...s.goals].sort((a,b)=>a.time-b.time||a.createdAt-b.createdAt);}
function validMatch(s){return !!s&&s.version===1&&Number.isFinite(s.elapsed)&&s.elapsed>=0&&(s.startedAt===null||(Number.isFinite(s.startedAt)&&s.startedAt>=0))&&['home','away'].every(k=>s.teams?.[k]&&typeof s.teams[k].name==='string'&&Array.isArray(s.teams[k].players)&&s.teams[k].players.every(p=>typeof p==='string'))&&Array.isArray(s.goals)&&s.goals.every(g=>typeof g.id==='string'&&['home','away'].includes(g.team)&&Number.isInteger(g.time)&&g.time>=0&&Number.isFinite(g.createdAt)&&typeof g.scorer==='string'&&typeof g.assist==='string');}

export function migrate(s){
 if(!valid(s))throw Error('Ogiltig matchdata');
 if(!s.date)s.date=today();
 if(!s.history)s.history=[];
 if(s.teams.away.name==='Bortalag')s.teams.away.name='Utmanare';
 if(s.teams.home.name==='Hemmalag')s.teams.home.name='Lilla Torg FF';
 return s;
}
export function archiveAndNew(s,now=Date.now()){
 const saved=JSON.parse(JSON.stringify(s));delete saved.history;
 if(saved.startedAt!==null)toggle(saved,now);
 saved.savedAt=now;
 const next=fresh(JSON.parse(JSON.stringify(s.teams)));
 next.history=[...(s.history||[]),saved];
 return next;
}

function validDate(d){return typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;}
export function valid(s){return validMatch(s)&&(s.date===undefined||validDate(s.date))&&(s.history===undefined||(Array.isArray(s.history)&&s.history.every(m=>validMatch(m)&&validDate(m.date)&&Number.isFinite(m.savedAt))));}
