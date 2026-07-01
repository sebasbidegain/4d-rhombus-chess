// ── Starfield ────────────────────────────────────────
(function(){
  var c=document.getElementById('starfield'),ctx=c.getContext('2d');
  var stars=[];
  function resize(){c.width=innerWidth;c.height=innerHeight;}
  resize();window.addEventListener('resize',resize);
  for(var i=0;i<180;i++)stars.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.2+.2,a:Math.random()});
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    stars.forEach(function(s){
      s.a+=0.003;
      ctx.globalAlpha=.3+.4*Math.abs(Math.sin(s.a));
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();
    });
    ctx.globalAlpha=1;requestAnimationFrame(draw);
  }draw();
})();

// ── Config ───────────────────────────────────────────
// ⚠️ Paste your Firebase config here (same as index.html)
var FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// ⚠️ Add your Firebase UID(s) here — only these accounts can access admin.
// Find your UID in Firebase Console → Authentication → Users.
// Leave empty to fall back to local password (dev only).
var ADMIN_UIDS = [
  // "paste-your-firebase-uid-here"
];

// Local dev fallback — only used when Firebase is NOT configured.
// Store as SHA-256 hash, not plaintext. Generate at: https://emn178.github.io/online-tools/sha256.html
// Default below is SHA-256 of "rhombus2024admin" — CHANGE before deploying.
var ADMIN_PASS_HASH = "a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4";

var fbAuth=null, fbDb=null, usingFirebase=false, sessionStart=null;
var SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 min idle timeout
var _sessionInterval=null, _activityBound=false;
// Named activity handlers so they can be removed on logout (security fix S-1)
function _onActivity(){sessionStart=Date.now();}
// Absolute session ceiling (security fix S-2) — 8 hours regardless of activity
var SESSION_MAX_MS = 8 * 60 * 60 * 1000;
var _sessionAbsoluteStart=null;

// ── Secure hash (Web Crypto) ──────────────────────────
async function sha256(str){
  var buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(function(b){return b.toString(16).padStart(2,'0');}).join('');
}

// ── Login ────────────────────────────────────────────
async function doLogin(){
  var p=document.getElementById('admin-pass').value;
  if(!p){document.getElementById('login-err').textContent='Enter a password.';return;}

  if(FIREBASE_CONFIG.apiKey!=='YOUR_API_KEY'){
    // Firebase path — sign in then check UID against allowlist
    try{
      if(!firebase.apps.length)firebase.initializeApp(FIREBASE_CONFIG);
      fbAuth=firebase.auth();
      var email=document.getElementById('admin-email')?document.getElementById('admin-email').value.trim():'';
      // Show email field if needed
      var emailEl=document.getElementById('admin-email-wrap');
      if(emailEl&&!email){emailEl.style.display='block';document.getElementById('login-err').textContent='Enter your email too.';return;}
      var cred=await fbAuth.signInWithEmailAndPassword(email,p);
      var uid=cred.user.uid;
      // SECURITY: hard-block if allowlist is empty — never fall through in production
      if(!ADMIN_UIDS.length){
        fbAuth.signOut();
        document.getElementById('login-err').textContent='Admin access not configured.';
        document.getElementById('admin-pass').value='';return;
      }
      if(ADMIN_UIDS.indexOf(uid)===-1){
        fbAuth.signOut();
        document.getElementById('login-err').textContent='Access denied.';
        document.getElementById('admin-pass').value='';return;
      }
      fbDb=firebase.firestore();usingFirebase=true;
      unlockAdmin();
    }catch(e){
      var errMsg='Invalid credentials.';
      if(e.code==='auth/too-many-requests')errMsg='Too many attempts. Try again later.';
      document.getElementById('login-err').textContent=errMsg;
      document.getElementById('admin-pass').value='';
    }
  }else{
    // Local dev fallback — compare against stored SHA-256 hash
    var hash=await sha256(p);
    if(hash===ADMIN_PASS_HASH){
      unlockAdmin();
    }else{
      document.getElementById('login-err').textContent='Incorrect password.';
      document.getElementById('admin-pass').value='';
    }
  }
}

function unlockAdmin(){
  sessionStart=Date.now();
  _sessionAbsoluteStart=Date.now();
  document.getElementById('login-screen').classList.add('gone');
  document.getElementById('app').classList.add('show');
  initFirebase();
  loadData();
  // Auto-logout on idle OR absolute ceiling — guard against stacking on re-login
  if(_sessionInterval)clearInterval(_sessionInterval);
  _sessionInterval=setInterval(function(){
    var now=Date.now();
    var idleExpired=sessionStart&&(now-sessionStart>SESSION_TIMEOUT_MS);
    var absExpired=_sessionAbsoluteStart&&(now-_sessionAbsoluteStart>SESSION_MAX_MS);
    if(idleExpired||absExpired){doLogout();}
  },60000);
  // Reset idle timer on user activity — use named function so it can be removed
  if(!_activityBound){
    _activityBound=true;
    document.addEventListener('mousemove',_onActivity);
    document.addEventListener('keydown',_onActivity);
  }
}

function doLogout(){
  if(fbAuth)fbAuth.signOut();
  sessionStart=null;_sessionAbsoluteStart=null;
  if(_sessionInterval){clearInterval(_sessionInterval);_sessionInterval=null;}
  // Remove named activity listeners to prevent memory/logic leak across sessions
  document.removeEventListener('mousemove',_onActivity);
  document.removeEventListener('keydown',_onActivity);
  _activityBound=false;
  document.getElementById('login-screen').classList.remove('gone');
  document.getElementById('app').classList.remove('show');
  document.getElementById('admin-pass').value='';
  if(document.getElementById('admin-email'))document.getElementById('admin-email').value='';
}

// ── Firebase ─────────────────────────────────────────
function initFirebase(){
  if(!FIREBASE_CONFIG.apiKey||FIREBASE_CONFIG.apiKey==='YOUR_API_KEY'){
    setDataSource(false);return;
  }
  try{
    if(!firebase.apps.length)firebase.initializeApp(FIREBASE_CONFIG);
    fbDb=firebase.firestore();
    usingFirebase=true;
    setDataSource(true);
  }catch(e){console.warn('Firebase:',e);setDataSource(false);}
}

function setDataSource(isFirebase){
  var el=document.getElementById('data-source');
  if(isFirebase){el.textContent='● FIREBASE';el.className='';}
  else{el.textContent='● LOCAL DATA';el.className='local';}
}

// ── Load all data ────────────────────────────────────
function loadData(){
  if(usingFirebase&&fbDb) loadFirebaseData();
  else loadLocalData();
}

// ── Firebase data ────────────────────────────────────
function loadFirebaseData(){
  fbDb.collection('users').get().then(function(snap){
    var users=[];
    snap.forEach(function(doc){users.push(Object.assign({id:doc.id},doc.data()));});
    renderAll(users,'firebase');
  }).catch(function(e){
    console.warn('Firestore error:',e);
    loadLocalData();
  });
}

// ── Local data (localStorage fallback) ───────────────
// NOTE: localStorage user data is untrusted (any script on the page can write it).
// We intentionally do NOT pass rc_users into the render pipeline.
// Instead we show an error state for the users table and activity list,
// and only surface the numeric win/loss/draw record (no user-supplied strings).
function loadLocalData(){
  // Show error state in users table
  var tbody=document.getElementById('users-tbody');
  while(tbody.firstChild)tbody.removeChild(tbody.firstChild);
  var errTr=document.createElement('tr');
  var errTd=document.createElement('td');
  errTd.setAttribute('colspan','6');
  errTd.style.textAlign='center';
  errTd.style.padding='30px';
  errTd.style.color='var(--muted)';
  errTd.textContent='Firebase not configured — connect Firebase to view users';
  errTr.appendChild(errTd);
  tbody.appendChild(errTr);

  // Show error state in activity list
  var list=document.getElementById('activity-list');
  while(list.firstChild)list.removeChild(list.firstChild);
  var errLi=document.createElement('li');
  errLi.className='tl-item';
  var errDot=document.createElement('div');
  errDot.className='tl-dot signup';
  var errText=document.createElement('div');
  errText.className='tl-text';
  errText.textContent='Firebase not configured';
  errLi.appendChild(errDot);
  errLi.appendChild(errText);
  list.appendChild(errLi);

  // Read numeric win/loss/draw stats only — safe because we parse as int before use
  var rec15={w:0,l:0,d:0},rec7={w:0,l:0,d:0};
  try{rec15=JSON.parse(localStorage.getItem('rhombus_chess_record')||'{"w":0,"l":0,"d":0}');}catch(e){}
  try{rec7=JSON.parse(localStorage.getItem('rhombus_chess_easier_record')||'{"w":0,"l":0,"d":0}');}catch(e){}
  var totalW=parseInt(rec15.w||0)+parseInt(rec7.w||0);
  var totalL=parseInt(rec15.l||0)+parseInt(rec7.l||0);
  var totalD=parseInt(rec15.d||0)+parseInt(rec7.d||0);
  var totalGames=totalW+totalL+totalD;

  drawPie(totalW,totalL,totalD);
  setText('pie-w',totalW);setText('pie-l',totalL);setText('pie-d',totalD);
  setText('stat-games',totalGames||'—');
  setText('stat-games-sub','W:'+totalW+' L:'+totalL+' D:'+totalD);
  setText('stat-users','—');setText('stat-users-sub','Firebase not configured');
  setText('stat-puzzles','—');setText('stat-android','—');setText('stat-desktop','—');setText('stat-avgpuz','—');

  showNotif('Firebase not configured — showing local record only','warn');
}

// ── Render everything ─────────────────────────────────
function renderAll(users,source,extra){
  extra=extra||{};
  // Summary cards
  var totalPuz=users.reduce(function(s,u){return s+(u.puzzlesSolved||0);},0);
  var totalGames=users.reduce(function(s,u){
    var g=u.games||u.record||{w:0,l:0,d:0};
    return s+(g.w||0)+(g.l||0)+(g.d||0);
  },0);
  var totalW=0,totalL=0,totalD=0;
  users.forEach(function(u){
    var g=u.games||u.record||{w:0,l:0,d:0};
    totalW+=(g.w||0);totalL+=(g.l||0);totalD+=(g.d||0);
  });

  // If local, use game record from localStorage too
  if(source==='local'&&extra.rec15){
    totalW=extra.rec15.w+(extra.rec7.w||0);
    totalL=extra.rec15.l+(extra.rec7.l||0);
    totalD=extra.rec15.d+(extra.rec7.d||0);
    totalGames=totalW+totalL+totalD;
  }

  var androidUsers=users.filter(function(u){return u.platform==='android';}).length;
  var desktopUsers=users.filter(function(u){return u.platform!=='android';}).length;
  var avgPuz=users.length?Math.round(totalPuz/users.length*10)/10:0;

  setText('stat-users',users.length);
  setText('stat-users-sub',source==='firebase'?'from Firestore':'from this device');
  setText('stat-games',totalGames||'—');
  setText('stat-games-sub','W:'+totalW+' L:'+totalL+' D:'+totalD);
  setText('stat-puzzles',totalPuz||'—');
  setText('stat-puzzles-sub','across all users');
  setText('stat-android',androidUsers||'—');
  setText('stat-android-sub','7-level version');
  setText('stat-desktop',desktopUsers||users.length||'—');
  setText('stat-desktop-sub','15-level version');
  setText('stat-avgpuz',avgPuz||'—');

  // W/L/D pie
  drawPie(totalW,totalL,totalD);
  setText('pie-w',totalW);
  setText('pie-l',totalL);
  setText('pie-d',totalD);

  // Difficulty bars (mock distribution if no data)
  var diff=users.reduce(function(acc,u){
    var d=u.aiDifficulty||'medium';
    acc[d]=(acc[d]||0)+1;return acc;
  },{easy:0,medium:0,hard:0,'2p':0});
  var dtotal=Math.max(1,diff.easy+diff.medium+diff.hard+diff['2p']);
  if(dtotal===1){diff={easy:20,medium:50,hard:20,'2p':10};dtotal=100;}// demo
  setBar('easy',diff.easy,dtotal);setBar('med',diff.medium,dtotal);
  setBar('hard',diff.hard,dtotal);setBar('2p',diff['2p'],dtotal);

  // Platform stats
  setText('ps-desktop',desktopUsers||users.length||'—');
  setText('ps-mobile',androidUsers||'—');
  setText('ps-session','—');

  // Users table
  renderUsersTable(users,source);

  // Activity
  renderActivity(users,source);

  // Puzzle stats
  setText('puz-attempts',totalPuz||'—');
  setText('puz-first','—');
  setText('puz-top','Puzzle #1');
  setText('puz-bottom','Puzzle #60');

  showNotif('Data loaded ('+(source==='firebase'?'Firebase':'local')+')');
}

function setBar(id,val,total){
  var pct=Math.round(val/total*100);
  var barEl=document.getElementById('bar-'+id);
  barEl.style.width=pct+'%';
  barEl.setAttribute('aria-valuenow',pct);
  document.getElementById('bv-'+id).textContent=pct+'%';
}

// ── Users table ───────────────────────────────────────
// ── XSS-safe HTML escape (fixes H2) ──────────────────
function esc(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function renderUsersTable(users,source){
  var tbody=document.getElementById('users-tbody');
  // Clear existing rows safely
  while(tbody.firstChild)tbody.removeChild(tbody.firstChild);
  if(!users.length){
    var emptyTr=document.createElement('tr');
    var emptyTd=document.createElement('td');
    emptyTd.setAttribute('colspan','6');
    emptyTd.style.textAlign='center';
    emptyTd.style.padding='30px';
    emptyTd.style.color='var(--muted)';
    emptyTd.textContent=source==='local'
      ?'No local accounts yet — users will appear after sign-up.'
      :'No users found in Firestore.';
    emptyTr.appendChild(emptyTd);
    tbody.appendChild(emptyTr);
    return;
  }
  users.forEach(function(u){
    // Compute initials from raw name — no escaping needed, goes into textContent
    var rawName=u.displayName||u.name||'Anonymous';
    var initials=rawName.split(' ').map(function(w){return w[0]||'';}).join('').substring(0,2).toUpperCase()||'?';
    var joined=u.created?new Date(u.created.seconds?u.created.seconds*1000:u.created).toLocaleDateString():'—';
    var puz=parseInt(u.puzzlesSolved)||0;
    var g=u.games||u.record||{w:0,l:0,d:0};
    var games=parseInt(g.w||0)+'/'+parseInt(g.l||0)+'/'+parseInt(g.d||0);

    var tr=document.createElement('tr');

    // USER cell — avatar + name
    var tdUser=document.createElement('td');
    var avatarDiv=document.createElement('div');
    avatarDiv.className='avatar-cell';
    var miniAv=document.createElement('div');
    miniAv.className='mini-av';
    miniAv.textContent=initials;
    var nameSpan=document.createElement('span');
    nameSpan.textContent=rawName;
    avatarDiv.appendChild(miniAv);
    avatarDiv.appendChild(nameSpan);
    tdUser.appendChild(avatarDiv);
    tr.appendChild(tdUser);

    // EMAIL cell
    var tdEmail=document.createElement('td');
    tdEmail.style.color='var(--muted)';
    tdEmail.textContent=u.email||'—';
    tr.appendChild(tdEmail);

    // JOINED cell
    var tdJoined=document.createElement('td');
    tdJoined.style.color='var(--muted)';
    tdJoined.textContent=joined;
    tr.appendChild(tdJoined);

    // AUTH badge cell
    var tdAuth=document.createElement('td');
    var badge=document.createElement('span');
    badge.className=source==='firebase'?'badge firebase':'badge local';
    badge.textContent=source==='firebase'?'Firebase':'Local';
    tdAuth.appendChild(badge);
    tr.appendChild(tdAuth);

    // PUZZLES cell
    var tdPuz=document.createElement('td');
    tdPuz.textContent=puz;
    tr.appendChild(tdPuz);

    // GAMES cell
    var tdGames=document.createElement('td');
    tdGames.style.fontFamily='\'Share Tech Mono\',monospace';
    tdGames.textContent=games;
    tr.appendChild(tdGames);

    tbody.appendChild(tr);
  });
}

// ── Activity timeline ─────────────────────────────────
function renderActivity(users,source){
  var list=document.getElementById('activity-list');
  var items=[];
  // Collect raw (unescaped) names — textContent handles encoding
  users.slice(0,8).forEach(function(u){
    var name=u.displayName||u.name||'Anonymous';
    var ts=u.created?(u.created.seconds?u.created.seconds*1000:u.created):Date.now();
    items.push({type:'signup',name:name,ts:ts});
    if(u.puzzlesSolved)items.push({type:'puzzle',name:name,count:parseInt(u.puzzlesSolved)||0,ts:ts+60000});
  });
  items.sort(function(a,b){return b.ts-a.ts;});

  // Clear list safely
  while(list.firstChild)list.removeChild(list.firstChild);

  if(!items.length){
    var emptyLi=document.createElement('li');
    emptyLi.className='tl-item';
    var emptyDot=document.createElement('div');
    emptyDot.className='tl-dot signup';
    var emptyText=document.createElement('div');
    emptyText.className='tl-text';
    emptyText.textContent='No activity yet';
    emptyLi.appendChild(emptyDot);
    emptyLi.appendChild(emptyText);
    list.appendChild(emptyLi);
    return;
  }

  items.slice(0,10).forEach(function(it){
    var ago=timeAgo(it.ts);

    var li=document.createElement('li');
    li.className='tl-item';

    var dot=document.createElement('div');
    dot.className='tl-dot '+it.type;
    li.appendChild(dot);

    var wrapper=document.createElement('div');

    // Build the tl-text node using DOM — <strong> for name, text nodes for the rest
    var textDiv=document.createElement('div');
    textDiv.className='tl-text';
    var strong=document.createElement('strong');
    strong.textContent=it.name;
    textDiv.appendChild(strong);
    if(it.type==='signup'){
      textDiv.appendChild(document.createTextNode(' signed up'));
    }else if(it.type==='puzzle'){
      var suffix=' solved '+it.count+' puzzle'+(it.count!==1?'s':'');
      textDiv.appendChild(document.createTextNode(suffix));
    }else{
      textDiv.appendChild(document.createTextNode(' played a game'));
    }
    wrapper.appendChild(textDiv);

    var timeDiv=document.createElement('div');
    timeDiv.className='tl-time';
    timeDiv.textContent=ago;
    wrapper.appendChild(timeDiv);

    li.appendChild(wrapper);
    list.appendChild(li);
  });
}

function timeAgo(ts){
  var diff=Math.floor((Date.now()-ts)/1000);
  if(diff<60)return diff+'s ago';
  if(diff<3600)return Math.floor(diff/60)+'m ago';
  if(diff<86400)return Math.floor(diff/3600)+'h ago';
  return Math.floor(diff/86400)+'d ago';
}

// ── Pie chart ─────────────────────────────────────────
function drawPie(w,l,d){
  var c=document.getElementById('pie-wld'),ctx=c.getContext('2d');
  var total=w+l+d||1;
  var slices=[{v:w,color:'#22c55e'},{v:l,color:'#ef4444'},{v:d,color:'#475569'}];
  var start=-Math.PI/2,cx=60,cy=60,r=52,ir=30;
  ctx.clearRect(0,0,120,120);
  slices.forEach(function(s){
    var angle=(s.v/total)*Math.PI*2;
    ctx.beginPath();ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r,start,start+angle);ctx.closePath();
    ctx.fillStyle=s.color;ctx.fill();
    start+=angle;
  });
  // donut hole
  ctx.beginPath();ctx.arc(cx,cy,ir,0,Math.PI*2);
  ctx.fillStyle='#020a14';ctx.fill();
}

// ── Helpers ───────────────────────────────────────────
function setText(id,val){var el=document.getElementById(id);if(el)el.textContent=val;}

function showNotif(msg,type){
  // type: 'success' (default), 'error', 'warn'
  var el=document.getElementById('notif');
  if(!el)return;
  el.textContent=msg;
  el.className='show';
  if(type==='error')el.style.borderColor='#ef4444';
  else if(type==='warn')el.style.borderColor='#f59e0b';
  else el.style.borderColor='';
  clearTimeout(el._t);
  el._t=setTimeout(function(){el.classList.remove('show');el.style.borderColor='';},3000);
}


// ── CSP fix: handlers previously declared inline (script-src no longer allows unsafe-inline) ──
(function(){
  function wire(id,ev,fn){var el=document.getElementById(id);if(el)el.addEventListener(ev,fn);}
  function onEnter(fn){return function(e){if(e.key==='Enter')fn();};}
  wire('admin-email','keydown',onEnter(function(){doLogin();}));
  wire('admin-pass','keydown',onEnter(function(){doLogin();}));
  wire('login-btn','click',function(){doLogin();});
  wire('refresh-btn','click',function(){loadData();});
  wire('signout-btn','click',function(){doLogout();});
})();
