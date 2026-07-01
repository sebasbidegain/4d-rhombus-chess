
// Redirect Android to the 7-level easier version
if(window.Capacitor&&window.Capacitor.getPlatform()==='android'){window.location.replace('easier.html');}
// ══════════════════════════════════════════════════════
// 4D RHOMBUS CHESS — THREE.JS RENDERER + FULL GAME
// ══════════════════════════════════════════════════════

// ── OrbitControls (inline) ───────────────────────────
THREE.OrbitControls=function(obj,dom){
  this.object=obj;this.domElement=dom;this.enabled=true;
  this.target=new THREE.Vector3();this.minDistance=0;this.maxDistance=Infinity;
  this.minPolarAngle=0;this.maxPolarAngle=Math.PI;
  this.enableDamping=false;this.dampingFactor=0.05;
  this.enableZoom=true;this.zoomSpeed=1.0;this.rotateSpeed=0.3;
  var s=this,sp=new THREE.Spherical(),sd=new THREE.Spherical();
  var sc=1,rs=new THREE.Vector2(),re=new THREE.Vector2(),rd=new THREE.Vector2(),dn=false;
  function gz(){return Math.pow(0.95,s.zoomSpeed);}
  this.update=function(){
    var o=new THREE.Vector3(),q=new THREE.Quaternion().setFromUnitVectors(obj.up,new THREE.Vector3(0,1,0)),qi=q.clone().inverse();
    o.copy(s.object.position).sub(s.target);o.applyQuaternion(q);
    sp.setFromVector3(o);sp.theta+=sd.theta;sp.phi+=sd.phi;
    sp.phi=Math.max(s.minPolarAngle,Math.min(s.maxPolarAngle,sp.phi));
    sp.makeSafe();sp.radius*=sc;sp.radius=Math.max(s.minDistance,Math.min(s.maxDistance,sp.radius));
    o.setFromSpherical(sp);o.applyQuaternion(qi);
    s.object.position.copy(s.target).add(o);s.object.lookAt(s.target);
    if(s.enableDamping){sd.theta*=(1-s.dampingFactor);sd.phi*=(1-s.dampingFactor);}else sd.set(0,0,0);
    sc=1;
  };
  // Touch support
  var touches={},pinching=false,lastPinchDist=0;
  dom.addEventListener('touchstart',function(e){
    e.preventDefault();
    if(e.touches.length===3){
      // three-finger: track for level scroll (feature 15)
      threeFinger=true;threeFingerStartY=(e.touches[0].clientY+e.touches[1].clientY+e.touches[2].clientY)/3;
    }else if(e.touches.length===2){
      pinching=true;dn=false;threeFinger=false;
      var dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;
      lastPinchDist=Math.sqrt(dx*dx+dy*dy);
    }else if(e.touches.length===1){
      pinching=false;dn=true;threeFinger=false;rs.set(e.touches[0].clientX,e.touches[0].clientY);
    }
  },{passive:false});
  var threeFinger=false,threeFingerStartY=0;
  dom.addEventListener('touchmove',function(e){
    e.preventDefault();
    if(e.touches.length===3&&threeFinger){
      var cy=(e.touches[0].clientY+e.touches[1].clientY+e.touches[2].clientY)/3;
      var delta=threeFingerStartY-cy;
      if(Math.abs(delta)>20){
        var slider=document.getElementById('lvlslider');
        var val=parseInt(slider.value)+(delta>0?1:-1);
        val=Math.max(1,Math.min(LEVELS,val));
        slider.value=val;slider.dispatchEvent(new Event('input'));
        threeFingerStartY=cy;
      }
    }else if(e.touches.length===2&&pinching){
      var dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;
      var dist=Math.sqrt(dx*dx+dy*dy);
      sc*=dist>lastPinchDist?1/gz():gz();
      lastPinchDist=dist;s.update();
    }else if(e.touches.length===1&&dn){
      re.set(e.touches[0].clientX,e.touches[0].clientY);rd.subVectors(re,rs).multiplyScalar(s.rotateSpeed);
      sd.theta-=Math.PI*rd.x/dom.clientHeight;sd.phi-=Math.PI*rd.y/dom.clientHeight;
      rs.copy(re);s.update();
    }
  },{passive:false});
  dom.addEventListener('touchend',function(e){dn=false;pinching=false;threeFinger=false;},{passive:false});
  dom.addEventListener('mousedown',function(e){dn=true;rs.set(e.clientX,e.clientY);});
  window.addEventListener('mouseup',function(){dn=false;});
  window.addEventListener('mousemove',function(e){
    if(!dn)return;re.set(e.clientX,e.clientY);rd.subVectors(re,rs).multiplyScalar(s.rotateSpeed);
    sd.theta-=Math.PI*rd.x/dom.clientHeight;sd.phi-=Math.PI*rd.y/dom.clientHeight;
    rs.copy(re);s.update();
  });
  dom.addEventListener('wheel',function(e){e.preventDefault();sc*=e.deltaY<0?1/gz():gz();s.update();},{passive:false});
};

// ── Audio ────────────────────────────────────────────
var AC=null;
function getAC(){if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();return AC;}
function beep(f,t,d,v,dl){
  v=v||.18;dl=dl||0;
  try{var c=getAC(),s=c.currentTime+dl,o=c.createOscillator(),g=c.createGain();
  o.connect(g);g.connect(c.destination);o.type=t;o.frequency.value=f;
  g.gain.setValueAtTime(v,s);g.gain.exponentialRampToValueAtTime(.001,s+d);
  o.start(s);o.stop(s+d);}catch(e){}
}
var SFX={
  sel:function(){beep(880,'sine',.12,.2);beep(1320,'sine',.1,.13,.05);},
  move:function(){beep(440,'square',.06,.12);beep(660,'square',.07,.1,.06);},
  cap:function(){beep(220,'sawtooth',.14,.26);beep(110,'sawtooth',.16,.2,.08);},
  chk:function(){[880,1100,1320].forEach(function(f,i){beep(f,'square',.16,.16,i*.07);});},
  bad:function(){beep(150,'sawtooth',.09,.16);},
  over:function(){[440,330,220,110].forEach(function(f,i){beep(f,'sawtooth',.4,.26,i*.18);});},
  go:function(){[440,550,660,880].forEach(function(f,i){beep(f,'sine',.15,.2,i*.08);});},
  lvl:function(){beep(660,'sine',.10,.2);beep(880,'sine',.10,.18,.08);beep(1100,'sine',.10,.15,.16);}
};

// ── Constants ────────────────────────────────────────
var LEVELS=15,SZ=8,MID=Math.floor(LEVELS/2),GAP=1.8;
function lsz(l){
  if(LEVELS===7)return Math.max(2,SZ-2*Math.abs(l-MID));
  return Math.max(1,SZ-Math.abs(l-MID));
}
function lhalf(l){return lsz(l)/2;}

// ── Theme definitions ────────────────────────────────
var THEMES={
  trooper:{n:'TROOPER',ico:'🪖',wPiece:0xeeeeee,bPiece:0x888899,wRough:0.3,bRough:0.3,wMetal:0.4,bMetal:0.5,
    lightTile:0x8aaabb,darkTile:0x111a22,accent:0x3399ff,crown:0xffcc44,crownE:0x886600,queen:0x8844ff,queenE:0x440088},
  robot:{n:'ROBOTS',ico:'🤖',wPiece:0x88ccff,bPiece:0xff7755,wRough:0.2,bRough:0.2,wMetal:0.7,bMetal:0.7,
    lightTile:0x556688,darkTile:0x1a1a2e,accent:0x44aaff,crown:0x44ffcc,crownE:0x228866,queen:0xff44aa,queenE:0xaa2266},
  crystal:{n:'CRYSTALS',ico:'💎',wPiece:0xaaeeff,bPiece:0xffaacc,wRough:0.1,bRough:0.1,wMetal:0.6,bMetal:0.6,
    lightTile:0x445566,darkTile:0x112233,accent:0x88ddff,crown:0xffee88,crownE:0xaa9944,queen:0xaa66ff,queenE:0x663399},
  medieval:{n:'MEDIEVAL',ico:'⚔️',wPiece:0xddccaa,bPiece:0x88aa77,wRough:0.5,bRough:0.5,wMetal:0.2,bMetal:0.2,
    lightTile:0x887755,darkTile:0x2a2a1a,accent:0xddaa44,crown:0xffdd44,crownE:0xaa8800,queen:0xcc6622,queenE:0x884411},
  alien:{n:'ALIENS',ico:'👾',wPiece:0x88ff88,bPiece:0xcc55ff,wRough:0.2,bRough:0.2,wMetal:0.5,bMetal:0.5,
    lightTile:0x335544,darkTile:0x0a1a0a,accent:0x44ff88,crown:0x88ffcc,crownE:0x449966,queen:0xff44ff,queenE:0x992299},
  popeye:{n:'POPEYE',ico:'🫒',wPiece:0xf0e8c8,bPiece:0x223366,wRough:0.4,bRough:0.4,wMetal:0.2,bMetal:0.3,
    lightTile:0x4a7a20,darkTile:0x1a2a08,accent:0x66cc33,crown:0xffdd22,crownE:0xaa8800,queen:0xcc3322,queenE:0x881111},
  greek:{n:'GREEK',ico:'⚡',wPiece:0xede8d8,bPiece:0x1a1a2a,wRough:0.25,bRough:0.3,wMetal:0.15,bMetal:0.2,
    lightTile:0xd4c9a8,darkTile:0x2a2520,accent:0xd4a830,crown:0xffe033,crownE:0xaa7000,queen:0x4a7a40,queenE:0x1a3a18}
};
var TKEYS=Object.keys(THEMES);
var tidx=0;

// ── Game state ───────────────────────────────────────
var board=[];
for(var i=0;i<LEVELS;i++){board[i]=[];var s=lsz(i);for(var j=0;j<s;j++){board[i][j]=[];for(var k=0;k<SZ;k++)board[i][j][k]=null;}}
var theme='trooper',vsAI=true,aiDepth=2;
var turn='white',moveNum=1,selPiece=null;
var historyLog=[],capW=[],capB=[];
var gameOver=false,aiRunning=false,started=false;
var hlMoves=[];

// ── Undo stack (feature 2) ──────────────────────────
var undoStack=[];

// ── En passant target (C9) ──────────────────────────
var enPassantTarget=null; // {l,x,z} — the square a pawn just double-stepped through

// ── Chess clock (feature 3) ─────────────────────────
var clockWhite=0,clockBlack=0,clockLastTick=0,clockRunning=false;

// ── Last move highlight (feature 7) ─────────────────
var lastMoveFrom=null,lastMoveTo=null,lastMoveHighlights=[];

// ── AI move preview (feature 9) ─────────────────────
var aiPreviewHighlights=[],aiPreviewTimer=null;

// ── Threatened pieces indicators (feature 10) ───────
var threatIndicators=[];

// ── Win/loss record (feature 11) ────────────────────
var record={w:0,l:0,d:0};
try{var savedRec=localStorage.getItem('rhombus_chess_record');if(savedRec){var _sr=JSON.parse(savedRec);record={w:parseInt(_sr.w)||0,l:parseInt(_sr.l)||0,d:parseInt(_sr.d)||0};}}catch(e){}

// ── Camera snap targets (feature 5) ─────────────────
var camTarget=null,camTargetLookAt=null,camLerping=false;

// ── Three.js Scene ───────────────────────────────────
var scene=new THREE.Scene();
scene.background=new THREE.Color(0x000408);
scene.fog=new THREE.FogExp2(0x000510,0.015);
var camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,0.1,500);
camera.position.set(20,28,20);
var renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
// Note: global tone mapping / sRGB intentionally NOT enabled — it washed out the
// board's dark tiles. Premium reflections come purely from the env map on pieces.
document.body.insertBefore(renderer.domElement,document.body.firstChild);
renderer.domElement.style.position='fixed';
renderer.domElement.style.top='0';
renderer.domElement.style.left='0';
renderer.domElement.style.zIndex='1';

// ── Studio environment map for realistic reflections (generated in-browser, no external files) ──
(function(){
  var pmrem=new THREE.PMREMGenerator(renderer);
  var c=document.createElement('canvas');c.width=16;c.height=256;
  var ctx=c.getContext('2d');
  var grd=ctx.createLinearGradient(0,0,0,256);
  grd.addColorStop(0.00,'#e6f0ff'); // bright studio sky
  grd.addColorStop(0.35,'#8fb0d8');
  grd.addColorStop(0.62,'#3a4a63');
  grd.addColorStop(1.00,'#05070d'); // dark floor
  ctx.fillStyle=grd;ctx.fillRect(0,0,16,256);
  var tex=new THREE.CanvasTexture(c);
  tex.mapping=THREE.EquirectangularReflectionMapping;
  scene.environment=pmrem.fromEquirectangular(tex).texture;
  tex.dispose();pmrem.dispose();
})();

var controls=new THREE.OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=0.06;
controls.minDistance=8;controls.maxDistance=80;
controls.target.set(0,11,0);controls.update();

// Lighting
scene.add(new THREE.AmbientLight(0x1a2a3a,1.4));
var sun=new THREE.DirectionalLight(0xffffff,1.4);
// Real directional shadows are OFF: on a stacked/gapped board they bleed through
// each level onto the boards below. Pieces are grounded by fake contact shadows instead.
sun.position.set(20,30,10);sun.castShadow=false;scene.add(sun);
var rim=new THREE.DirectionalLight(0x4488ff,0.5);rim.position.set(-15,5,-10);scene.add(rim);
var fillLight=new THREE.PointLight(0x002244,1.0,120);fillLight.position.set(0,15,0);scene.add(fillLight);

// ── Fake contact shadow: a soft disc under each piece, grounding it on its OWN
//    level only (no bleed to lower boards). Shared texture/material/geometry. ──
var _contactShadowTex=(function(){
  var c=document.createElement('canvas');c.width=64;c.height=64;
  var g=c.getContext('2d').createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(0,0,0,0.5)');g.addColorStop(0.65,'rgba(0,0,0,0.22)');g.addColorStop(1,'rgba(0,0,0,0)');
  var ctx=c.getContext('2d');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
  return new THREE.CanvasTexture(c);
})();
var _contactShadowMat=new THREE.MeshBasicMaterial({map:_contactShadowTex,transparent:true,depthWrite:false,opacity:0.9});
var _contactShadowGeo=new THREE.PlaneGeometry(0.85,0.85);
function makeContactShadow(){
  var m=new THREE.Mesh(_contactShadowGeo,_contactShadowMat);
  m.rotation.x=-Math.PI/2;      // lay flat on the board
  m.position.y=-0.095;          // just above the tile surface (piece origin sits 0.10 above tile top)
  m.renderOrder=1;m.userData.isContactShadow=true;
  return m;
}

// Stars
(function(){var g=new THREE.BufferGeometry(),p=[];
for(var i=0;i<2000;i++)p.push((Math.random()-.5)*300,(Math.random()-.5)*300,(Math.random()-.5)*300);
g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
scene.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:0.18})));})();

// ── Materials (theme-dependent, rebuilt on theme change) ──
var MAT={};
function buildMaterials(){
  var t=THEMES[theme];
  MAT.light=new THREE.MeshStandardMaterial({color:t.lightTile,roughness:0.4,metalness:0.3,envMapIntensity:0});
  MAT.dark=new THREE.MeshStandardMaterial({color:t.darkTile,roughness:0.6,metalness:0.2,envMapIntensity:0});
  MAT.edge=new THREE.MeshStandardMaterial({color:0x223344,roughness:0.8,metalness:0.1,envMapIntensity:0});
  MAT.white=new THREE.MeshStandardMaterial({color:t.wPiece,roughness:t.wRough,metalness:t.wMetal,envMapIntensity:1.4});
  MAT.black=new THREE.MeshStandardMaterial({color:t.bPiece,roughness:t.bRough,metalness:t.bMetal,envMapIntensity:1.4});
  MAT.glow=new THREE.MeshStandardMaterial({color:t.accent,emissive:t.accent,roughness:1.0});
  MAT.sel=new THREE.MeshStandardMaterial({color:0x00ffcc,emissive:0x00aa88,roughness:0.2,transparent:true,opacity:0.85});
  MAT.valid=new THREE.MeshStandardMaterial({color:0x44ff44,emissive:0x22aa22,roughness:0.3,transparent:true,opacity:0.6});
  MAT.capMat=new THREE.MeshStandardMaterial({color:0xff4444,emissive:0xaa1111,roughness:0.3,transparent:true,opacity:0.7});
  MAT.check=new THREE.MeshStandardMaterial({color:0xff8800,emissive:0xcc4400,roughness:0.2,transparent:true,opacity:0.7});
  MAT.lvlUp=new THREE.MeshStandardMaterial({color:0xffdd00,emissive:0xaa8800,roughness:0.2,transparent:true,opacity:0.65});
  MAT.crown=new THREE.MeshStandardMaterial({color:t.crown,emissive:t.crownE,roughness:0.4,metalness:0.6,envMapIntensity:1.6});
  MAT.queenOrb=new THREE.MeshStandardMaterial({color:t.queen,emissive:t.queenE,roughness:0.2,metalness:0.4,envMapIntensity:1.6});
  MAT.lastMove=new THREE.MeshStandardMaterial({color:0x6644cc,emissive:0x4422aa,roughness:0.3,transparent:true,opacity:0.55});
  MAT.aiPreview=new THREE.MeshStandardMaterial({color:0xff8800,emissive:0xcc5500,roughness:0.3,transparent:true,opacity:0.65});
  MAT.threat=new THREE.MeshStandardMaterial({color:0xff2222,emissive:0xcc0000,roughness:0.3,transparent:true,opacity:0.5});
}
buildMaterials();

// ── Board tiles ──────────────────────────────────────
var tileGroups=[],tileMap={},pillarMeshes=[];
var indGeo=new THREE.CylinderGeometry(0.36,0.36,0.04,16);
var threatGeo=new THREE.CylinderGeometry(0.18,0.18,0.03,12);

function buildBoard(){
  // remove old tiles
  tileGroups.forEach(function(g){scene.remove(g);});
  tileGroups=[];tileMap={};
  // remove old pillars
  pillarMeshes.forEach(function(p){scene.remove(p);});
  pillarMeshes=[];
  for(var l=0;l<LEVELS;l++){
    var sz=lsz(l),half=sz/2,g=new THREE.Group();
    for(var x=0;x<sz;x++){
      for(var z=0;z<SZ;z++){
        var m=new THREE.Mesh(new THREE.BoxGeometry(1,0.12,1),(x+z)%2===0?MAT.light:MAT.dark);
        m.position.set(x-half+0.5,l*GAP,z-SZ/2+0.5);
        m.receiveShadow=true;m.userData={l:l,x:x,z:z};
        tileMap[l+','+x+','+z]=m;g.add(m);
      }
    }
    var fr=new THREE.Mesh(new THREE.BoxGeometry(sz+0.3,0.06,SZ+0.3),MAT.edge);
    fr.position.set(0,l*GAP-0.09,0);g.add(fr);
    scene.add(g);tileGroups.push(g);
  }
  // Pillars
  var pg=new THREE.CylinderGeometry(0.06,0.06,LEVELS*GAP,6);
  var pm=new THREE.MeshStandardMaterial({color:0x223344,roughness:0.7});
  [[-SZ/2,-SZ/2],[SZ/2,-SZ/2],[-SZ/2,SZ/2],[SZ/2,SZ/2]].forEach(function(pos){
    var p=new THREE.Mesh(pg,pm);p.position.set(pos[0],LEVELS*GAP/2,pos[1]);scene.add(p);pillarMeshes.push(p);
  });
  applyLevelVisibility();
}
buildBoard();

// ── Switch level count ──────────────────────────────
function setLevelCount(n){
  LEVELS=n;MID=Math.floor(LEVELS/2);
  // Reinitialize board array
  board=[];
  for(var i=0;i<LEVELS;i++){board[i]=[];var s=lsz(i);for(var j=0;j<s;j++){board[i][j]=[];for(var k=0;k<SZ;k++)board[i][j][k]=null;}}
  // Rebuild 3D board
  buildBoard();
  // Update level slider
  var slider=document.getElementById('lvlslider');
  slider.max=LEVELS;slider.value=LEVELS;
  document.getElementById('lvlval').textContent=LEVELS;
  // Update camera and orbit target
  controls.target.set(0,LEVELS*GAP/2,0);
  camera.position.set(20,LEVELS*GAP*1.1,20);
  controls.update();
  // Reset game
  initPieces();resetGame();
}

// ── Level visibility (feature 8) ────────────────────
function applyLevelVisibility(){
  var maxVisible=parseInt(document.getElementById('lvlslider').value);
  for(var i=0;i<tileGroups.length;i++){
    tileGroups[i].visible=(i<maxVisible);
  }
  // Also hide/show pieces on hidden levels
  if(typeof pieceMeshes!=='undefined'&&pieceMeshes){
    pieceMeshes.forEach(function(pm){
      pm.visible=(pm.userData.l<maxVisible);
    });
  }
}

document.getElementById('lvlslider').addEventListener('input',function(){
  document.getElementById('lvlval').textContent=this.value;
  applyLevelVisibility();
});

// ── Piece 3D Models ──────────────────────────────────
function mkTrooper(mat,sc){
  sc=sc||1;
  var g=new THREE.Group();
  function add(geo,m,y,cb){var mesh=new THREE.Mesh(geo,m);mesh.position.y=y*sc;if(cb)cb(mesh);g.add(mesh);}
  add(new THREE.CylinderGeometry(.28*sc,.32*sc,.08*sc,16),mat,0);
  add(new THREE.CylinderGeometry(.16*sc,.20*sc,.32*sc,12),mat,.22*sc);
  add(new THREE.CylinderGeometry(.08*sc,.10*sc,.10*sc,10),mat,.42*sc);
  add(new THREE.SphereGeometry(.18*sc,14,10,0,Math.PI*2,0,Math.PI*.7),mat,.54*sc);
  add(new THREE.CylinderGeometry(.17*sc,.14*sc,.12*sc,12),mat,.50*sc);
  var vm=new THREE.MeshStandardMaterial({color:0x111111,roughness:0.1,metalness:0.8});
  add(new THREE.BoxGeometry(.22*sc,.07*sc,.10*sc),vm,.54*sc,function(m){m.position.z=.10*sc;});
  var eg=new THREE.SphereGeometry(.025*sc,6,6);
  [-0.06,0.06].forEach(function(ex){var e=new THREE.Mesh(eg,MAT.glow);e.position.set(ex*sc,.56*sc,.16*sc);g.add(e);});
  g.traverse(function(c){if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
  return g;
}
function mkKing(mat){
  var g=mkTrooper(mat,1.15);
  for(var i=0;i<5;i++){var s=new THREE.Mesh(new THREE.ConeGeometry(.04,.18,5),MAT.crown),a=(i/5)*Math.PI*2;s.position.set(Math.cos(a)*.12,.85,Math.sin(a)*.12);g.add(s);}
  return g;
}
function mkQueen(mat){
  var g=mkTrooper(mat,1.08);
  var o=new THREE.Mesh(new THREE.SphereGeometry(.07,10,10),MAT.queenOrb);
  o.position.y=.88;g.add(o);return g;
}
function mkRook(mat){
  var g=mkTrooper(mat,.90);
  for(var i=0;i<4;i++){var a=(i/4)*Math.PI*2+Math.PI/4,m=new THREE.Mesh(new THREE.BoxGeometry(.08,.12,.08),mat);m.position.set(Math.cos(a)*.14,.75,Math.sin(a)*.14);g.add(m);}
  return g;
}
function mkKnight(mat){
  var g=mkTrooper(mat,.90);
  var h=new THREE.Mesh(new THREE.ConeGeometry(.04,.22,6),new THREE.MeshStandardMaterial({color:0x334455,roughness:0.5}));
  h.rotation.x=-.6;h.position.set(0,.80,.10);g.add(h);return g;
}
function mkBishop(mat){
  var g=mkTrooper(mat,.95);
  var s=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.28,6),mat);s.position.y=.90;g.add(s);
  var b=new THREE.Mesh(new THREE.SphereGeometry(.055,8,8),mat);b.position.y=1.06;g.add(b);return g;
}
function mkPawn(mat){return mkTrooper(mat,.72);}

var pieceBuilders={king:mkKing,queen:mkQueen,rook:mkRook,knight:mkKnight,bishop:mkBishop,pawn:mkPawn};

// ═══ POPEYE THEME — Character piece builders ═══════════
// Fixed character materials (not theme-dependent)
var PM={
  skin: new THREE.MeshStandardMaterial({color:0xd49870,roughness:0.7}),
  navy: new THREE.MeshStandardMaterial({color:0x1a2a4a,roughness:0.5,metalness:0.1}),
  wht:  new THREE.MeshStandardMaterial({color:0xeeeeee,roughness:0.5}),
  yel:  new THREE.MeshStandardMaterial({color:0xd4a820,roughness:0.5}),
  blk:  new THREE.MeshStandardMaterial({color:0x222222,roughness:0.7}),
  grn:  new THREE.MeshStandardMaterial({color:0x228822,roughness:0.5,emissive:0x114411}),
  slv:  new THREE.MeshStandardMaterial({color:0x999999,roughness:0.3,metalness:0.6}),
  brn:  new THREE.MeshStandardMaterial({color:0x8b4513,roughness:0.7}),
  red:  new THREE.MeshStandardMaterial({color:0xcc2222,roughness:0.5}),
  tan:  new THREE.MeshStandardMaterial({color:0xc8a882,roughness:0.6}),
  pipe: new THREE.MeshStandardMaterial({color:0x4a3000,roughness:0.8}),
  anch: new THREE.MeshStandardMaterial({color:0x2244bb,emissive:0x1122aa,roughness:0.3})
};

// Helper: add a mesh to group at position, optional rotations
function popM(g,geo,mat,x,y,z,rx,ry,rz){
  var m=new THREE.Mesh(geo,mat);
  m.position.set(x,y,z);
  if(rx!==undefined)m.rotation.x=rx;
  if(ry!==undefined)m.rotation.y=ry;
  if(rz!==undefined)m.rotation.z=rz;
  m.castShadow=true;m.receiveShadow=true;
  g.add(m);return m;
}

// PAWN — Spinach Can (iconic!)
function mkPopeyePawn(mat){
  var g=new THREE.Group();
  popM(g,new THREE.CylinderGeometry(.28,.32,.08,16),mat,0,0,0);       // pedestal (team color)
  popM(g,new THREE.CylinderGeometry(.20,.20,.34,16),PM.slv,0,.25,0);  // can body
  popM(g,new THREE.CylinderGeometry(.205,.205,.12,16),PM.wht,0,.23,0);// white label
  for(var i=0;i<3;i++){var a=(i/3)*Math.PI*2;                          // green stars on label
    popM(g,new THREE.SphereGeometry(.026,6,6),PM.grn,Math.cos(a)*.205,.23,Math.sin(a)*.205);}
  popM(g,new THREE.SphereGeometry(.195,12,8,0,Math.PI*2,0,Math.PI*.55),PM.grn,0,.418,0); // spinach dome
  g.traverse(function(c){if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
  return g;
}

// KNIGHT — The Bulldog (Eugene / Rough-House)
function mkPopeyeKnight(mat){
  var g=new THREE.Group();
  popM(g,new THREE.CylinderGeometry(.28,.32,.08,16),mat,0,0,0);        // pedestal
  popM(g,new THREE.SphereGeometry(.20,10,8),PM.tan,0,.28,0);           // torso
  popM(g,new THREE.SphereGeometry(.16,8,6),PM.tan,0,.18,-.12);         // haunches
  popM(g,new THREE.CylinderGeometry(.07,.07,.18,8),PM.tan,-.10,.17,.10,Math.PI/2); // front leg L
  popM(g,new THREE.CylinderGeometry(.07,.07,.18,8),PM.tan,.10,.17,.10,Math.PI/2);  // front leg R
  popM(g,new THREE.CylinderGeometry(.12,.14,.12,10),PM.tan,0,.44,.04); // neck
  popM(g,new THREE.SphereGeometry(.18,12,10),PM.tan,0,.60,.04);        // head
  popM(g,new THREE.SphereGeometry(.12,8,6),PM.tan,0,.535,.15);         // jowls/muzzle
  popM(g,new THREE.BoxGeometry(.16,.09,.10),PM.tan,0,.535,.20);        // snout box
  popM(g,new THREE.SphereGeometry(.10,8,6),PM.brn,-.17,.63,-.02);      // ear L
  popM(g,new THREE.SphereGeometry(.10,8,6),PM.brn,.17,.63,-.02);       // ear R
  popM(g,new THREE.SphereGeometry(.034,6,6),PM.blk,-.06,.635,.16);     // eye L
  popM(g,new THREE.SphereGeometry(.034,6,6),PM.blk,.06,.635,.16);      // eye R
  popM(g,new THREE.CylinderGeometry(.13,.13,.04,12),PM.brn,0,.48,0);   // collar
  g.traverse(function(c){if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
  return g;
}

// BISHOP — Wimpy (J. Wellington Wimpy)
function mkPopeyeBishop(mat){
  var g=new THREE.Group();
  popM(g,new THREE.CylinderGeometry(.28,.32,.08,16),mat,0,0,0);         // pedestal
  popM(g,new THREE.SphereGeometry(.24,12,10),PM.wht,0,.32,0);           // big round belly
  popM(g,new THREE.SphereGeometry(.19,10,8),PM.blk,-.10,.32,0);         // jacket L
  popM(g,new THREE.SphereGeometry(.19,10,8),PM.blk,.10,.32,0);          // jacket R
  popM(g,new THREE.BoxGeometry(.06,.16,.04),PM.red,0,.34,.22);          // tie
  popM(g,new THREE.CylinderGeometry(.09,.11,.10,10),PM.skin,0,.55,0);   // neck
  popM(g,new THREE.SphereGeometry(.15,12,10),PM.skin,0,.70,0);          // head
  popM(g,new THREE.CylinderGeometry(.20,.20,.03,16),PM.blk,0,.84,0);    // bowler brim
  popM(g,new THREE.SphereGeometry(.135,10,8,0,Math.PI*2,0,Math.PI*.65),PM.blk,0,.845,0); // bowler dome
  popM(g,new THREE.BoxGeometry(.09,.05,.07),PM.brn,0,.50,.23);          // burger bun
  popM(g,new THREE.BoxGeometry(.08,.025,.06),PM.grn,0,.525,.23);        // lettuce
  g.traverse(function(c){if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
  return g;
}

// ROOK — Bluto / Brutus
function mkPopeyeRook(mat){
  var g=new THREE.Group();
  popM(g,new THREE.CylinderGeometry(.28,.32,.08,16),mat,0,0,0);         // pedestal
  popM(g,new THREE.CylinderGeometry(.25,.22,.20,12),PM.yel,0,.14,0);    // yellow pants
  popM(g,new THREE.CylinderGeometry(.28,.25,.36,12),PM.blk,0,.38,0);    // massive torso
  popM(g,new THREE.SphereGeometry(.22,10,8),PM.blk,-.28,.46,0);         // shoulder L
  popM(g,new THREE.SphereGeometry(.22,10,8),PM.blk,.28,.46,0);          // shoulder R
  popM(g,new THREE.CylinderGeometry(.11,.10,.28,8),PM.skin,-.30,.32,0); // arm L
  popM(g,new THREE.CylinderGeometry(.11,.10,.28,8),PM.skin,.30,.32,0);  // arm R
  popM(g,new THREE.CylinderGeometry(.13,.16,.08,10),PM.skin,0,.59,0);   // neck
  popM(g,new THREE.SphereGeometry(.20,12,10),PM.skin,0,.76,0);          // head
  popM(g,new THREE.SphereGeometry(.17,10,8),PM.blk,0,.625,.05);         // thick beard
  popM(g,new THREE.CylinderGeometry(.16,.20,.05,12),PM.navy,0,.90,0);   // cap brim
  popM(g,new THREE.CylinderGeometry(.11,.11,.09,12),PM.navy,0,.95,0);   // cap dome
  g.traverse(function(c){if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
  return g;
}

// QUEEN — Olive Oyl
function mkPopeyeQueen(mat){
  var g=new THREE.Group();
  popM(g,new THREE.CylinderGeometry(.28,.32,.08,16),mat,0,0,0);         // pedestal
  popM(g,new THREE.CylinderGeometry(.16,.22,.22,12),PM.blk,0,.19,0);    // skirt flare
  popM(g,new THREE.CylinderGeometry(.11,.16,.32,12),PM.blk,0,.46,0);    // dress bodice
  popM(g,new THREE.CylinderGeometry(.10,.12,.12,12),PM.red,0,.66,0);    // red blouse
  popM(g,new THREE.TorusGeometry(.10,.025,8,16),PM.wht,0,.73,0);        // white collar
  // thin arms
  var armG=new THREE.CylinderGeometry(.035,.035,.22,6);
  var la=new THREE.Mesh(armG,PM.skin);la.position.set(-.17,.58,0);la.rotation.z=.5;la.castShadow=true;g.add(la);
  var ra=new THREE.Mesh(armG,PM.skin);ra.position.set(.17,.58,0);ra.rotation.z=-.5;ra.castShadow=true;g.add(ra);
  popM(g,new THREE.CylinderGeometry(.06,.07,.10,8),PM.skin,0,.80,0);    // neck
  // head (slightly oval)
  var hm=new THREE.Mesh(new THREE.SphereGeometry(.12,10,10),PM.skin);
  hm.scale.y=1.2;hm.position.set(0,.93,0);hm.castShadow=true;g.add(hm);
  popM(g,new THREE.SphereGeometry(.10,8,8),PM.blk,0,1.04,0);            // hair bun
  popM(g,new THREE.BoxGeometry(.10,.02,.02),PM.blk,0,.94,.13);          // eyelashes
  g.traverse(function(c){if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
  return g;
}

// KING — Popeye himself
function mkPopeyeKing(mat){
  var g=new THREE.Group();
  popM(g,new THREE.CylinderGeometry(.30,.34,.08,16),mat,0,0,0);          // pedestal
  // legs
  popM(g,new THREE.CylinderGeometry(.08,.09,.24,8),PM.navy,-.07,.20,0);
  popM(g,new THREE.CylinderGeometry(.08,.09,.24,8),PM.navy,.07,.20,0);
  // stocky torso (navy shirt)
  popM(g,new THREE.CylinderGeometry(.22,.20,.30,12),PM.navy,0,.47,0);
  // CROSSED forearms (hallmark!) — two massive cylinders crossing
  var faG=new THREE.CylinderGeometry(.115,.095,.34,8);
  var lfa=new THREE.Mesh(faG,PM.skin);lfa.position.set(-.05,.53,.10);lfa.rotation.z=1.2;lfa.castShadow=true;g.add(lfa);
  var rfa=new THREE.Mesh(faG,PM.skin);rfa.position.set(.05,.53,.10);rfa.rotation.z=-1.2;rfa.castShadow=true;g.add(rfa);
  // anchor tattoo hint on forearm
  popM(g,new THREE.SphereGeometry(.028,4,4),PM.anch,-.16,.53,.13);
  // collar
  popM(g,new THREE.CylinderGeometry(.12,.14,.06,12),PM.wht,0,.65,0);
  // neck
  popM(g,new THREE.CylinderGeometry(.09,.11,.08,10),PM.skin,0,.72,0);
  // head — Popeye has a distinctive shape: big chin + squinting
  popM(g,new THREE.SphereGeometry(.16,12,10),PM.skin,0,.86,0);
  // jutting chin
  popM(g,new THREE.SphereGeometry(.10,8,8),PM.skin,0,.775,.13);
  // one big squinting eye
  popM(g,new THREE.SphereGeometry(.042,6,6),PM.blk,-.07,.875,.14);
  // pipe stem
  popM(g,new THREE.CylinderGeometry(.022,.022,.15,8),PM.pipe,0,.79,.19,Math.PI/2);
  // pipe bowl (perpendicular)
  popM(g,new THREE.CylinderGeometry(.032,.028,.07,8),PM.pipe,0,.835,.265);
  // sailor hat brim
  popM(g,new THREE.CylinderGeometry(.195,.195,.04,16),PM.wht,0,.97,0);
  // hat crown lower
  popM(g,new THREE.CylinderGeometry(.135,.18,.05,16),PM.wht,0,1.01,0);
  // hat crown band (navy)
  popM(g,new THREE.CylinderGeometry(.09,.135,.04,16),PM.navy,0,1.05,0);
  g.traverse(function(c){if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
  return g;
}

var popeyeBuilders={king:mkPopeyeKing,queen:mkPopeyeQueen,rook:mkPopeyeRook,
  knight:mkPopeyeKnight,bishop:mkPopeyeBishop,pawn:mkPopeyePawn};

var THEME_BUILDERS={popeye:popeyeBuilders};
// ═══ GREEK MYTHOLOGY THEME ══════════════════════════
var GK={
  marble:new THREE.MeshStandardMaterial({color:0xe8dcc8,roughness:0.3,metalness:0.0}),
  gold:  new THREE.MeshStandardMaterial({color:0xd4a830,roughness:0.2,metalness:0.8,emissive:new THREE.Color(0x5a3800)}),
  bronze:new THREE.MeshStandardMaterial({color:0x8b6914,roughness:0.3,metalness:0.6}),
  wht:   new THREE.MeshStandardMaterial({color:0xf5f0e8,roughness:0.4}),
  teal:  new THREE.MeshStandardMaterial({color:0x2a7a6a,roughness:0.5}),
  skin:  new THREE.MeshStandardMaterial({color:0xc8a070,roughness:0.6}),
  slv:   new THREE.MeshStandardMaterial({color:0xb0b8c0,roughness:0.2,metalness:0.7}),
  bolt:  new THREE.MeshStandardMaterial({color:0xffe033,roughness:0.1,metalness:0.5,emissive:new THREE.Color(0xaa7000)}),
  grn:   new THREE.MeshStandardMaterial({color:0x4a7a40,roughness:0.5}),
  blk:   new THREE.MeshStandardMaterial({color:0x111111,roughness:0.7}),
  brn:   new THREE.MeshStandardMaterial({color:0x6a4020,roughness:0.6}),
  dark:  new THREE.MeshStandardMaterial({color:0x1a1a2a,roughness:0.6}),
  red:   new THREE.MeshStandardMaterial({color:0xcc2222,roughness:0.6})
};

// PAWN — Greek Hoplite
function mkGreekPawn(mat){
  var g=new THREE.Group();
  popM(g,new THREE.CylinderGeometry(.28,.32,.08,16),mat,0,0,0);
  popM(g,new THREE.CylinderGeometry(.07,.07,.20,8),GK.skin,-.06,.18,0);
  popM(g,new THREE.CylinderGeometry(.07,.07,.20,8),GK.skin,.06,.18,0);
  popM(g,new THREE.CylinderGeometry(.18,.16,.26,12),GK.bronze,0,.38,0);
  popM(g,new THREE.CylinderGeometry(.18,.18,.04,16),GK.bronze,0,.38,.17);
  popM(g,new THREE.SphereGeometry(.05,6,6),GK.gold,0,.38,.20);
  popM(g,new THREE.CylinderGeometry(.07,.09,.08,8),GK.skin,0,.53,0);
  popM(g,new THREE.SphereGeometry(.13,10,10),GK.skin,0,.64,0);
  popM(g,new THREE.SphereGeometry(.145,10,10),GK.bronze,0,.65,0);
  popM(g,new THREE.ConeGeometry(.04,.20,6),GK.bronze,0,.83,0);
  popM(g,new THREE.BoxGeometry(.04,.10,.06),GK.bronze,-.10,.60,0);
  popM(g,new THREE.BoxGeometry(.04,.10,.06),GK.bronze,.10,.60,0);
  popM(g,new THREE.CylinderGeometry(.015,.015,.50,6),GK.slv,0,.52,-.10);
  popM(g,new THREE.ConeGeometry(.03,.10,6),GK.gold,0,.76,-.10);
  g.traverse(function(c){if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
  return g;
}

// KNIGHT — Pegasus
function mkGreekKnight(mat){
  var g=new THREE.Group();
  popM(g,new THREE.CylinderGeometry(.28,.32,.08,16),mat,0,0,0);
  popM(g,new THREE.CylinderGeometry(.08,.07,.20,8),GK.wht,-.08,.18,.06);
  popM(g,new THREE.CylinderGeometry(.08,.07,.20,8),GK.wht,.08,.18,.06);
  var body=new THREE.Mesh(new THREE.SphereGeometry(.20,12,10),GK.wht);
  body.scale.set(1,1.3,0.85);body.position.set(0,.42,-.04);body.castShadow=true;g.add(body);
  popM(g,new THREE.SphereGeometry(.16,10,8),GK.wht,0,.36,.10);
  popM(g,new THREE.CylinderGeometry(.07,.06,.22,8),GK.wht,-.08,.52,.12,Math.PI/2+1.0);
  popM(g,new THREE.CylinderGeometry(.07,.06,.22,8),GK.wht,.08,.52,.12,Math.PI/2+1.0);
  popM(g,new THREE.CylinderGeometry(.10,.12,.22,8),GK.wht,0,.64,-.02,0.5);
  popM(g,new THREE.SphereGeometry(.14,10,8),GK.wht,0,.78,-.08);
  popM(g,new THREE.SphereGeometry(.09,8,6),GK.wht,0,.74,.06);
  popM(g,new THREE.SphereGeometry(.03,6,6),GK.blk,.08,.80,.04);
  popM(g,new THREE.TorusGeometry(.24,.03,6,16,Math.PI*.7),GK.wht,-.22,.50,0,-.6,Math.PI/6,0);
  popM(g,new THREE.TorusGeometry(.24,.03,6,16,Math.PI*.7),GK.wht,.22,.50,0,.6,-Math.PI/6,0);
  popM(g,new THREE.BoxGeometry(.28,.04,.06),GK.wht,-.26,.48,0,0,0,-.5);
  popM(g,new THREE.BoxGeometry(.28,.04,.06),GK.wht,.26,.48,0,0,0,.5);
  popM(g,new THREE.CylinderGeometry(.03,.06,.18,6),GK.wht,0,.30,.14,.7);
  g.traverse(function(c){if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
  return g;
}

// BISHOP — Artemis
function mkGreekBishop(mat){
  var g=new THREE.Group();
  popM(g,new THREE.CylinderGeometry(.28,.32,.08,16),mat,0,0,0);
  popM(g,new THREE.CylinderGeometry(.18,.24,.28,12),GK.wht,0,.22,0);
  popM(g,new THREE.CylinderGeometry(.12,.18,.20,12),GK.wht,0,.48,0);
  popM(g,new THREE.CylinderGeometry(.125,.125,.04,12),GK.gold,0,.52,0);
  popM(g,new THREE.CylinderGeometry(.04,.04,.20,6),GK.skin,-.14,.52,0,0,0,.4);
  popM(g,new THREE.CylinderGeometry(.04,.04,.20,6),GK.skin,.14,.52,0,0,0,-.4);
  popM(g,new THREE.CylinderGeometry(.06,.07,.08,8),GK.skin,0,.68,0);
  popM(g,new THREE.SphereGeometry(.12,10,10),GK.skin,0,.80,0);
  popM(g,new THREE.SphereGeometry(.09,8,8),GK.brn,0,.91,0);
  popM(g,new THREE.TorusGeometry(.09,.02,6,12),GK.gold,0,.83,0,Math.PI/2);
  popM(g,new THREE.TorusGeometry(.20,.025,6,14,Math.PI*1.2),GK.brn,-.15,.55,0,.2,Math.PI/2);
  popM(g,new THREE.CylinderGeometry(.008,.008,.38,4),GK.slv,-.15,.55,0,0,0,Math.PI/2);
  popM(g,new THREE.CylinderGeometry(.045,.045,.22,8),GK.brn,.14,.56,-.08);
  popM(g,new THREE.CylinderGeometry(.008,.008,.16,4),GK.slv,.10,.70,-.08);
  popM(g,new THREE.CylinderGeometry(.008,.008,.16,4),GK.slv,.14,.70,-.08);
  popM(g,new THREE.CylinderGeometry(.008,.008,.16,4),GK.slv,.18,.70,-.08);
  g.traverse(function(c){if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
  return g;
}

// ROOK — Poseidon
function mkGreekRook(mat){
  var g=new THREE.Group();
  popM(g,new THREE.CylinderGeometry(.28,.32,.06,16),mat,0,0,0);
  var rock=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),GK.marble);
  rock.scale.set(1.1,0.55,1.0);rock.position.set(0,.10,0);rock.castShadow=true;g.add(rock);
  popM(g,new THREE.CylinderGeometry(.20,.28,.22,12),GK.teal,0,.24,0);
  var torso=new THREE.Mesh(new THREE.SphereGeometry(.24,12,10),GK.teal);
  torso.scale.set(1,0.9,0.9);torso.position.set(0,.40,0);torso.castShadow=true;g.add(torso);
  popM(g,new THREE.SphereGeometry(.18,10,8),GK.skin,0,.44,.08);
  popM(g,new THREE.CylinderGeometry(.09,.08,.28,8),GK.skin,-.18,.46,0,0,0,.2);
  popM(g,new THREE.CylinderGeometry(.09,.08,.22,8),GK.skin,.18,.42,0,0,0,-.3);
  popM(g,new THREE.CylinderGeometry(.11,.13,.10,10),GK.skin,0,.62,0);
  popM(g,new THREE.SphereGeometry(.18,12,10),GK.skin,0,.78,0);
  popM(g,new THREE.SphereGeometry(.16,10,8),GK.marble,0,.64,.06);
  popM(g,new THREE.ConeGeometry(.10,.18,8),GK.marble,0,.58,.04,.15);
  var hair=new THREE.Mesh(new THREE.SphereGeometry(.20,10,8),GK.marble);
  hair.scale.set(1.1,0.8,1);hair.position.set(0,.84,0);hair.castShadow=true;g.add(hair);
  popM(g,new THREE.TorusGeometry(.16,.025,6,12),GK.gold,0,.90,0,Math.PI/2);
  popM(g,new THREE.CylinderGeometry(.025,.025,.80,8),GK.bronze,-.20,.68,0);
  popM(g,new THREE.CylinderGeometry(.020,.015,.18,6),GK.gold,-.20,1.12,0);
  popM(g,new THREE.CylinderGeometry(.015,.010,.14,6),GK.gold,-.30,1.10,0,0,0,.25);
  popM(g,new THREE.CylinderGeometry(.015,.010,.14,6),GK.gold,-.10,1.10,0,0,0,-.25);
  popM(g,new THREE.ConeGeometry(.025,.06,6),GK.gold,-.10,1.22,0);
  popM(g,new THREE.ConeGeometry(.025,.06,6),GK.gold,-.20,1.24,0);
  popM(g,new THREE.ConeGeometry(.025,.06,6),GK.gold,-.30,1.22,0);
  g.traverse(function(c){if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
  return g;
}

// QUEEN — Athena
function mkGreekQueen(mat){
  var g=new THREE.Group();
  popM(g,new THREE.CylinderGeometry(.28,.32,.08,16),mat,0,0,0);
  popM(g,new THREE.CylinderGeometry(.14,.20,.30,12),GK.grn,0,.23,0);
  popM(g,new THREE.CylinderGeometry(.13,.14,.26,12),GK.grn,0,.52,0);
  popM(g,new THREE.CylinderGeometry(.135,.135,.04,12),GK.gold,0,.60,0);
  popM(g,new THREE.CylinderGeometry(.07,.08,.10,8),GK.skin,0,.74,0);
  popM(g,new THREE.SphereGeometry(.14,12,10),GK.skin,0,.87,0);
  popM(g,new THREE.SphereGeometry(.155,10,10),GK.bronze,0,.88,0);
  popM(g,new THREE.ConeGeometry(.04,.28,6),GK.bronze,0,1.08,0);
  popM(g,new THREE.CylinderGeometry(.03,.015,.22,6),GK.red,0,1.06,0,.1);
  popM(g,new THREE.BoxGeometry(.04,.12,.05),GK.bronze,-.12,.82,0);
  popM(g,new THREE.BoxGeometry(.04,.12,.05),GK.bronze,.12,.82,0);
  popM(g,new THREE.CylinderGeometry(.018,.018,.70,6),GK.slv,.22,.72,0);
  popM(g,new THREE.ConeGeometry(.03,.12,6),GK.gold,.22,1.10,0);
  popM(g,new THREE.CylinderGeometry(.20,.20,.04,16),GK.bronze,-.20,.50,0,0,0,.2);
  popM(g,new THREE.TorusGeometry(.20,.025,8,16),GK.gold,-.20,.50,0,Math.PI/2,0,.2);
  popM(g,new THREE.SphereGeometry(.07,8,8),GK.marble,-.22,.50,.03);
  for(var i=0;i<4;i++){var sa=(i/4)*Math.PI*2;
    popM(g,new THREE.ConeGeometry(.02,.08,4),GK.dark,-.22+Math.cos(sa)*.09,.50+Math.sin(sa)*.09,.03);}
  popM(g,new THREE.CylinderGeometry(.06,.06,.22,6),GK.skin,-.14,.52,0,0,0,-.5);
  g.traverse(function(c){if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
  return g;
}

// KING — Zeus on throne with lightning bolt
function mkGreekKing(mat){
  var g=new THREE.Group();
  popM(g,new THREE.CylinderGeometry(.30,.34,.08,16),mat,0,0,0);
  popM(g,new THREE.BoxGeometry(.50,.12,.40),GK.marble,0,.14,0);
  popM(g,new THREE.BoxGeometry(.44,.40,.06),GK.marble,0,.38,-.17);
  popM(g,new THREE.BoxGeometry(.06,.06,.32),GK.gold,-.20,.24,-.04);
  popM(g,new THREE.BoxGeometry(.06,.06,.32),GK.gold,.20,.24,-.04);
  popM(g,new THREE.CylinderGeometry(.22,.30,.20,12),GK.wht,0,.20,0);
  var torsoK=new THREE.Mesh(new THREE.SphereGeometry(.28,12,10),GK.wht);
  torsoK.scale.set(1,0.85,0.9);torsoK.position.set(0,.38,0);torsoK.castShadow=true;g.add(torsoK);
  popM(g,new THREE.SphereGeometry(.18,10,8),GK.skin,0,.44,.10);
  popM(g,new THREE.CylinderGeometry(.10,.09,.30,8),GK.skin,-.22,.44,0,0,0,.4);
  popM(g,new THREE.CylinderGeometry(.09,.08,.22,8),GK.skin,.20,.40,0,0,0,-.4);
  popM(g,new THREE.CylinderGeometry(.12,.14,.10,10),GK.skin,0,.65,0);
  popM(g,new THREE.SphereGeometry(.20,12,10),GK.skin,0,.82,0);
  popM(g,new THREE.SphereGeometry(.18,10,8),GK.marble,0,.68,.08);
  popM(g,new THREE.ConeGeometry(.12,.22,8),GK.marble,0,.60,.06,.15);
  var hairK=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),GK.marble);
  hairK.scale.set(1.1,0.7,1);hairK.position.set(0,.89,0);hairK.castShadow=true;g.add(hairK);
  popM(g,new THREE.TorusGeometry(.18,.03,6,12),GK.gold,0,.97,0,Math.PI/2);
  for(var ci=0;ci<5;ci++){var ca=(ci/5)*Math.PI*2;
    popM(g,new THREE.ConeGeometry(.03,.14,5),GK.gold,Math.cos(ca)*.18,.99,Math.sin(ca)*.18);}
  // Lightning bolt — Zeus's signature
  popM(g,new THREE.BoxGeometry(.06,.28,.04),GK.bolt,-.22,.72,0,0,0,.5);
  popM(g,new THREE.BoxGeometry(.06,.28,.04),GK.bolt,-.32,.50,0,0,0,-.4);
  popM(g,new THREE.ConeGeometry(.04,.10,4),GK.bolt,-.36,.37,0,0,0,-.4);
  popM(g,new THREE.SphereGeometry(.06,8,8),GK.bolt,-.22,.82,0);
  g.traverse(function(c){if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
  return g;
}

var greekBuilders={king:mkGreekKing,queen:mkGreekQueen,rook:mkGreekRook,
  knight:mkGreekKnight,bishop:mkGreekBishop,pawn:mkGreekPawn};
THEME_BUILDERS.greek=greekBuilders;
// ═══ END GREEK MYTHOLOGY THEME ══════════════════════
// ═══ END POPEYE THEME ═════════════════════

// ── Piece meshes tracking ────────────────────────────
var pieceMeshes=[];  // all 3D piece groups currently in scene

function clearPieceMeshes(){
  pieceMeshes.forEach(function(m){scene.remove(m);});
  pieceMeshes=[];
}

function createPieceMesh(type,color,l,x,z){
  var mat=color==='white'?MAT.white:MAT.black;
  var builders=THEME_BUILDERS[theme]||pieceBuilders;
  var mesh=builders[type](mat);
  mesh.position.set(x-lhalf(l)+0.5,l*GAP+0.16,z-SZ/2+0.5);
  mesh.userData={type:type,color:color,l:l,x:x,z:z,isPiece:true};
  mesh.add(makeContactShadow());  // grounds the piece on its own board; no bleed
  scene.add(mesh);pieceMeshes.push(mesh);
  return mesh;
}

function setPieceMeshPos(mesh,l,x,z){
  mesh.position.set(x-lhalf(l)+0.5,l*GAP+0.16,z-SZ/2+0.5);
  mesh.userData.l=l;mesh.userData.x=x;mesh.userData.z=z;
}

function removePieceMesh(mesh){
  scene.remove(mesh);
  var idx=pieceMeshes.indexOf(mesh);
  if(idx>=0)pieceMeshes.splice(idx,1);
}

function findPieceMeshAt(l,x,z){
  for(var i=0;i<pieceMeshes.length;i++){
    var u=pieceMeshes[i].userData;
    if(u.l===l&&u.x===x&&u.z===z)return pieceMeshes[i];
  }
  return null;
}

// ── Piece setup ──────────────────────────────────────
var BACK=['rook','knight','bishop','queen','king','bishop','knight','rook'];
function initPieces(){
  for(var l=0;l<LEVELS;l++){var s=lsz(l);for(var x=0;x<s;x++)for(var z=0;z<SZ;z++)board[l][x][z]=null;}
  clearPieceMeshes();
  BACK.forEach(function(t,i){
    board[MID][0][i]={type:t,color:'white'};
    createPieceMesh(t,'white',MID,0,i);
    board[MID][7][i]={type:t,color:'black'};
    createPieceMesh(t,'black',MID,7,i);
  });
  for(var i=0;i<SZ;i++){
    board[MID][1][i]={type:'pawn',color:'white'};
    createPieceMesh('pawn','white',MID,1,i);
    board[MID][6][i]={type:'pawn',color:'black'};
    createPieceMesh('pawn','black',MID,6,i);
  }
}

// ── Move logic ───────────────────────────────────────
function getMoves(l,x,z){
  var p=board[l][x][z];if(!p)return[];
  var type=p.type,color=p.color,enemy=color==='white'?'black':'white';
  var sz=lsz(l),moves=[];
  function tryAdd(nl,nx,nz,capOnly,moveOnly){
    var nsz=lsz(nl);
    if(nx<0||nx>=nsz||nz<0||nz>=SZ||nl<0||nl>=LEVELS)return false;
    var occ=board[nl][nx][nz];
    if(occ){if(!moveOnly&&occ.color===enemy)moves.push({l:nl,x:nx,z:nz,cap:true});return false;}
    if(!capOnly)moves.push({l:nl,x:nx,z:nz,cap:false});return true;
  }
  function slide(dl,dx,dz){
    var cl=l+dl,cx=x+dx,cz=z+dz;
    while(cl>=0&&cl<LEVELS){var nsz2=lsz(cl);if(cx<0||cx>=nsz2||cz<0||cz>=SZ)break;if(!tryAdd(cl,cx,cz))break;cl+=dl;cx+=dx;cz+=dz;}
  }
  if(type==='pawn'){
    var dir=color==='white'?1:-1,st=color==='white'?1:6;
    // Forward move along x-axis (east-west orientation)
    var nx=x+dir;
    if(nx>=0&&nx<sz)tryAdd(l,nx,z,false,true);
    // Double move from starting column
    if(x===st&&nx>=0&&nx<sz&&!board[l][nx][z]){var nx2=x+dir*2;if(nx2>=0&&nx2<sz)tryAdd(l,nx2,z,false,true);}
    // Diagonal capture (along z-axis)
    [-1,1].forEach(function(dz){
      var nnx=x+dir,nnz=z+dz;
      if(nnx>=0&&nnx<sz&&nnz>=0&&nnz<SZ&&board[l][nnx]&&board[l][nnx][nnz]&&board[l][nnx][nnz].color===enemy)
        moves.push({l:l,x:nnx,z:nnz,cap:true});
    });
    // En passant capture (C9)
    if(enPassantTarget&&enPassantTarget.l===l){
      [-1,1].forEach(function(dz){
        if(x+dir===enPassantTarget.x&&z+dz===enPassantTarget.z)
          moves.push({l:l,x:enPassantTarget.x,z:enPassantTarget.z,cap:true,enPassant:true});
      });
    }
    // Level movement — both colors can go up OR down one level
    [-1,1].forEach(function(lvlDir){
      var nl=l+lvlDir;
      if(nl>=0&&nl<LEVELS){
        var nsz=lsz(nl);
        if(x<nsz){
          tryAdd(nl,x,z,false,true);
          [-1,1].forEach(function(dz){
            var nnz=z+dz;
            if(nnz>=0&&nnz<SZ&&board[nl]&&board[nl][x]&&board[nl][x][nnz]&&board[nl][x][nnz].color===enemy)
              moves.push({l:nl,x:x,z:nnz,cap:true});
          });
        }
      }
    });
  }else if(type==='rook'){[[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],[1,0,0],[-1,0,0]].forEach(function(v){slide(v[0],v[1],v[2]);});}
  else if(type==='bishop'){[[0,1,1],[0,1,-1],[0,-1,1],[0,-1,-1],[1,1,0],[1,-1,0],[-1,1,0],[-1,-1,0]].forEach(function(v){slide(v[0],v[1],v[2]);});}
  else if(type==='queen'){[[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],[0,1,1],[0,1,-1],[0,-1,1],[0,-1,-1],[1,0,0],[-1,0,0],[1,1,0],[1,-1,0],[-1,1,0],[-1,-1,0],[1,0,1],[1,0,-1],[-1,0,1],[-1,0,-1]].forEach(function(v){slide(v[0],v[1],v[2]);});}
  else if(type==='king'){for(var dl=-1;dl<=1;dl++)for(var dx=-1;dx<=1;dx++)for(var dz2=-1;dz2<=1;dz2++)if(dl||dx||dz2)tryAdd(l+dl,x+dx,z+dz2);}
  else if(type==='knight'){[[0,2,1],[0,2,-1],[0,-2,1],[0,-2,-1],[0,1,2],[0,1,-2],[0,-1,2],[0,-1,-2],[1,1,1],[1,1,-1],[1,-1,1],[1,-1,-1],[-1,1,1],[-1,1,-1],[-1,-1,1],[-1,-1,-1]].forEach(function(v){tryAdd(l+v[0],x+v[1],z+v[2]);});}
  return moves;
}

function findKing(color){for(var l=0;l<LEVELS;l++){var s=lsz(l);for(var x=0;x<s;x++)for(var z=0;z<SZ;z++){var p=board[l][x][z];if(p&&p.type==='king'&&p.color===color)return{l:l,x:x,z:z};}}return null;}
function inCheck(color){
  var k=findKing(color);if(!k)return false;
  var en=color==='white'?'black':'white';
  for(var l=0;l<LEVELS;l++){var s=lsz(l);for(var x=0;x<s;x++)for(var z=0;z<SZ;z++){var p=board[l][x][z];if(p&&p.color===en){var mv=getMoves(l,x,z);for(var i=0;i<mv.length;i++)if(mv[i].l===k.l&&mv[i].x===k.x&&mv[i].z===k.z)return true;}}}return false;
}
// Legal moves: filter pseudo-legal moves that leave own king in check
function getLegalMoves(l,x,z){
  var p=board[l][x][z];if(!p)return[];
  var pseudo=getMoves(l,x,z),legal=[];
  for(var i=0;i<pseudo.length;i++){
    var mv=pseudo[i];
    var captured=board[mv.l][mv.x][mv.z];
    // En passant: also temporarily remove the side-captured pawn for check detection
    var epPos=null,epPiece=null;
    if(mv.enPassant){
      var epDir=p.color==='white'?1:-1;
      epPos={l:mv.l,x:mv.x-epDir,z:mv.z};
      epPiece=board[epPos.l][epPos.x][epPos.z];
      board[epPos.l][epPos.x][epPos.z]=null;
    }
    board[mv.l][mv.x][mv.z]=p;board[l][x][z]=null;
    if(!inCheck(p.color))legal.push(mv);
    board[l][x][z]=p;board[mv.l][mv.x][mv.z]=captured;
    if(epPos)board[epPos.l][epPos.x][epPos.z]=epPiece;
  }
  return legal;
}
function anyMoves(color){for(var l=0;l<LEVELS;l++){var s=lsz(l);for(var x=0;x<s;x++)for(var z=0;z<SZ;z++){var p=board[l][x][z];if(p&&p.color===color&&getLegalMoves(l,x,z).length>0)return true;}}return false;}

// ── Check if a specific piece is under attack (feature 10) ──
function isSquareAttacked(tl,tx,tz,byColor){
  for(var l=0;l<LEVELS;l++){var s=lsz(l);for(var x=0;x<s;x++)for(var z=0;z<SZ;z++){
    var p=board[l][x][z];if(p&&p.color===byColor){
      var mv=getMoves(l,x,z);
      for(var i=0;i<mv.length;i++)if(mv[i].l===tl&&mv[i].x===tx&&mv[i].z===tz)return true;
    }
  }}
  return false;
}

// ── AI ───────────────────────────────────────────────
var VALS={pawn:10,knight:30,bishop:30,rook:50,queen:90,king:900};
function evalB(){var s=0;for(var l=0;l<LEVELS;l++){var sz=lsz(l);for(var x=0;x<sz;x++)for(var z=0;z<SZ;z++){var p=board[l][x][z];if(p){var v=(VALS[p.type]||0)+(LEVELS-Math.abs(l-MID))*.3;s+=p.color==='black'?v:-v;}}}return s;}
function simM(l,x,z,mv){var p=board[l][x][z],cap=board[mv.l][mv.x][mv.z];board[l][x][z]=null;board[mv.l][mv.x][mv.z]=p;return{p:p,fl:l,fx:x,fz:z,cap:cap,tl:mv.l,tx:mv.x,tz:mv.z};}
function undoM(s){board[s.tl][s.tx][s.tz]=s.cap;board[s.fl][s.fx][s.fz]=s.p;}
function minimax(dep,a,b,max){
  if(dep===0)return evalB();
  var col=max?'black':'white',best=max?-Infinity:Infinity;
  outer:for(var l=0;l<LEVELS;l++){var sz=lsz(l);for(var x=0;x<sz;x++)for(var z=0;z<SZ;z++){
    var p=board[l][x][z];if(!p||p.color!==col)continue;
    var mv=getLegalMoves(l,x,z);
    for(var i=0;i<mv.length;i++){
      var st=simM(l,x,z,mv[i]);var sc=minimax(dep-1,a,b,!max);undoM(st);
      if(max){if(sc>best)best=sc;if(sc>a)a=sc;}else{if(sc<best)best=sc;if(sc<b)b=sc;}
      if(b<=a)break outer;
    }
  }}
  return(best===Infinity||best===-Infinity)?evalB():best;
}
function bestMoveAI(){
  var best=-Infinity,bl=-1,bx=-1,bz=-1,bmv=null;
  var pieces=[];
  for(var l=0;l<LEVELS;l++){var sz=lsz(l);for(var x=0;x<sz;x++)for(var z=0;z<SZ;z++){if(board[l][x][z]&&board[l][x][z].color==='black')pieces.push([l,x,z]);}}
  pieces.sort(function(){return Math.random()-.5;});
  for(var pi=0;pi<pieces.length;pi++){
    var ll=pieces[pi][0],xx=pieces[pi][1],zz=pieces[pi][2];
    var mv=getLegalMoves(ll,xx,zz);
    for(var i=0;i<mv.length;i++){
      var st=simM(ll,xx,zz,mv[i]);var sc=minimax(aiDepth-1,-Infinity,Infinity,false);undoM(st);
      if(sc>best){best=sc;bl=ll;bx=xx;bz=zz;bmv=mv[i];}
    }
  }
  return bl>=0?{fl:bl,fx:bx,fz:bz,mv:bmv}:null;
}

// ── Pawn promotion (feature 1) ──────────────────────
var promotionType=null; // set before doMove when player chooses
var pendingPromoMove=null; // stores {fl,fx,fz,target} while UI is shown

function isPromotionMove(fl,fx,fz,mv){
  var p=board[fl][fx][fz];
  if(!p||p.type!=='pawn')return false;
  var promoteCol=p.color==='white'?lsz(fl)-1:0;
  return mv.x===promoteCol;
}

function checkPromotion(l,x,z){
  var p=board[l][x][z];
  if(!p||p.type!=='pawn')return;
  var promoteCol=p.color==='white'?lsz(l)-1:0;
  if(x===promoteCol){
    var newType=promotionType||'queen'; // player choice or default queen (AI)
    p.type=newType;
    board[l][x][z]=p;
    // Replace 3D mesh
    var oldMesh=findPieceMeshAt(l,x,z);
    if(oldMesh)removePieceMesh(oldMesh);
    createPieceMesh(newType,p.color,l,x,z);
    applyLevelVisibility();
  }
}

function showPromotionUI(color){
  var overlay=document.getElementById('promo-overlay');
  overlay.classList.add('show');
  // Color the icons based on side
  var icons=color==='white'?['♕','♖','♗','♘']:['♛','♜','♝','♞'];
  var btns=overlay.querySelectorAll('.promo-btn');
  btns[0].querySelector('.promo-icon').textContent=icons[0];
  btns[1].querySelector('.promo-icon').textContent=icons[1];
  btns[2].querySelector('.promo-icon').textContent=icons[2];
  btns[3].querySelector('.promo-icon').textContent=icons[3];
}

function hidePromotionUI(){
  document.getElementById('promo-overlay').classList.remove('show');
}

function completePromotion(chosenType){
  hidePromotionUI();
  promotionType=chosenType;
  var m=pendingPromoMove;
  if(!m)return;
  var chk=doMove(m.fl,m.fx,m.fz,m.target,false);
  selPiece=null;clearHighlights();clearThreatIndicators();
  if(!gameOver){
    turn=turn==='white'?'black':'white';moveNum++;
    if(!chk)setSt(vsAI?'AI IS THINKING...':(turn.toUpperCase()+"'S TURN"));
    updateUI();
    if(vsAI&&turn==='black')setTimeout(doAI,400);
  }
  pendingPromoMove=null;
  promotionType=null;
}

// ── Execute move ─────────────────────────────────────
function doMove(fl,fx,fz,mv,isAI){
  var p=board[fl][fx][fz],color=p.color,enemy=color==='white'?'black':'white';
  var lvlChg=mv.l!==fl;
  var kingCaptured=false;
  var capturedData=null,capturedType=null,capturedColor=null;

  // Build undo entry before modifying state
  var undoEntry={
    fromL:fl,fromX:fx,fromZ:fz,
    toL:mv.l,toX:mv.x,toZ:mv.z,
    pieceType:p.type,pieceColor:p.color,
    capturedPiece:null,
    prevTurn:turn,prevMoveNum:moveNum,
    wasCap:mv.cap,
    isAI:!!isAI,
    clockWhite:clockWhite,clockBlack:clockBlack
  };

  if(mv.cap){
    if(mv.enPassant){
      // En passant: captured pawn is one step behind the destination
      var epDir=color==='white'?1:-1;
      var epCapX=mv.x-epDir;
      var epCapData=board[mv.l][epCapX][mv.z];
      if(epCapData){
        undoEntry.capturedPiece={type:epCapData.type,color:epCapData.color};
        undoEntry.epCapturePos={l:mv.l,x:epCapX,z:mv.z};
        (color==='white'?capB:capW).push(epCapData.type);
        var epMesh=findPieceMeshAt(mv.l,epCapX,mv.z);
        if(epMesh)removePieceMesh(epMesh);
        board[mv.l][epCapX][mv.z]=null;
      }
    }else{
      var capData=board[mv.l][mv.x][mv.z];
      if(capData){
        undoEntry.capturedPiece={type:capData.type,color:capData.color};
        if(capData.type==='king')kingCaptured=true;
        (color==='white'?capB:capW).push(capData.type);
        var capMesh=findPieceMeshAt(mv.l,mv.x,mv.z);
        if(capMesh)removePieceMesh(capMesh);
      }
    }
  }
  board[fl][fx][fz]=null;board[mv.l][mv.x][mv.z]=p;
  // Update the 3D mesh position
  var pMesh=findPieceMeshAt(fl,fx,fz);
  if(pMesh)setPieceMeshPos(pMesh,mv.l,mv.x,mv.z);

  // Check pawn promotion (feature 1)
  checkPromotion(mv.l,mv.x,mv.z);
  // Store if promoted for undo
  if(undoEntry.pieceType!==p.type){
    undoEntry.promoted=true;
    undoEntry.originalType=undoEntry.pieceType;
  }

  var note=p.type[0].toUpperCase()+' '+String.fromCharCode(65+fx)+(fz+1)+(lvlChg?' L'+(fl+1)+'→'+(mv.l+1):'')+' → '+String.fromCharCode(65+mv.x)+(mv.z+1)+(mv.cap?'✕':'');
  historyLog.push({color:color,note:note});
  if(mv.cap)SFX.cap();else if(lvlChg)SFX.lvl();else SFX.move();

  // Store and update en passant target (C9)
  undoEntry.prevEnPassantTarget=enPassantTarget;
  enPassantTarget=null;
  if(p.type==='pawn'&&Math.abs(mv.x-fx)===2){
    enPassantTarget={l:mv.l,x:Math.round((fx+mv.x)/2),z:mv.z};
  }

  // Push undo entry
  undoStack.push(undoEntry);

  // Last move highlight (feature 7)
  clearLastMoveHighlights();
  lastMoveFrom={l:fl,x:fx,z:fz};
  lastMoveTo={l:mv.l,x:mv.x,z:mv.z};
  showLastMoveHighlights();

  hlMoves=[];selPiece=null;clearHighlights();clearThreatIndicators();

  // AI move preview (feature 9)
  if(isAI){
    showAIPreview(fl,fx,fz,mv.l,mv.x,mv.z);
  }

  // King captured — instant win
  if(kingCaptured){
    gameOver=true;SFX.over();clockRunning=false;
    showMsg(color.toUpperCase()+' WINS!');
    setSt('☆ '+color.toUpperCase()+' CAPTURED THE KING — VICTORY! ☆');
    updateRecord(color==='white'?'w':'l');
    return true;
  }

  var chk=inCheck(enemy);
  if(chk){
    if(!anyMoves(enemy)){gameOver=true;SFX.over();clockRunning=false;showMsg('CHECKMATE! '+color.toUpperCase()+' WINS');setSt('☆ CHECKMATE — '+color.toUpperCase()+' WINS ☆');updateRecord(color==='white'?'w':'l');}
    else{SFX.chk();flashMsg('CHECK!');setSt('CHECK! '+enemy.toUpperCase()+' KING THREATENED');hlKingCheck(enemy);}
  }
  // Stalemate check
  if(!chk&&!anyMoves(enemy)){gameOver=true;SFX.over();clockRunning=false;showMsg('STALEMATE!');setSt('DRAW — '+enemy.toUpperCase()+' HAS NO LEGAL MOVES');updateRecord('d');}

  applyLevelVisibility();
  return chk;
}

function doAI(){
  if(gameOver||aiRunning)return;
  aiRunning=true;
  document.getElementById('ait').classList.add('on');
  setSt('AI CALCULATING...');
  setTimeout(function(){
    var r=bestMoveAI();
    if(r){
      // L13 — AI promotion visual feedback
      var aiWasPawn=board[r.fl][r.fx][r.fz]&&board[r.fl][r.fx][r.fz].type==='pawn';
      var chk=doMove(r.fl,r.fx,r.fz,r.mv,true);
      if(!gameOver){
        turn='white';moveNum++;
        var aiPromMsg='';
        if(aiWasPawn&&board[r.mv.l]&&board[r.mv.l][r.mv.x]&&board[r.mv.l][r.mv.x][r.mv.z]&&board[r.mv.l][r.mv.x][r.mv.z].type!=='pawn'){
          aiPromMsg=' — AI PROMOTED TO '+board[r.mv.l][r.mv.x][r.mv.z].type.toUpperCase();
        }
        if(!chk)setSt('YOUR TURN'+aiPromMsg);updateUI();
      }
    }
    else{setSt('AI HAS NO MOVES — YOU WIN!');gameOver=true;SFX.over();clockRunning=false;updateRecord('w');}
    document.getElementById('ait').classList.remove('on');aiRunning=false;
  },80);
}

// ── Highlights (3D rings) ────────────────────────────
var highlightMeshes=[];
function clearHighlights(){highlightMeshes.forEach(function(m){scene.remove(m);});highlightMeshes=[];}

function showHighlights(l,x,z,moves){
  clearHighlights();
  // selection ring
  var h0=new THREE.Mesh(indGeo,MAT.sel);
  h0.position.set(x-lhalf(l)+0.5,l*GAP+0.08,z-SZ/2+0.5);
  scene.add(h0);highlightMeshes.push(h0);
  // move rings
  moves.forEach(function(m){
    var mat=m.cap?MAT.capMat:(m.l!==l?MAT.lvlUp:MAT.valid);
    var hm=new THREE.Mesh(indGeo,mat);
    hm.position.set(m.x-lhalf(m.l)+0.5,m.l*GAP+0.08,m.z-SZ/2+0.5);
    hm.userData.moveTarget=m;
    scene.add(hm);highlightMeshes.push(hm);
  });
}

function hlKingCheck(color){
  var k=findKing(color);if(!k)return;
  var hm=new THREE.Mesh(indGeo,MAT.check);
  hm.position.set(k.x-lhalf(k.l)+0.5,k.l*GAP+0.10,k.z-SZ/2+0.5);
  scene.add(hm);highlightMeshes.push(hm);
}

// ── Last move highlights (feature 7) ────────────────
function clearLastMoveHighlights(){
  lastMoveHighlights.forEach(function(m){scene.remove(m);});
  lastMoveHighlights=[];
}
function showLastMoveHighlights(){
  clearLastMoveHighlights();
  if(!lastMoveFrom||!lastMoveTo)return;
  var positions=[lastMoveFrom,lastMoveTo];
  positions.forEach(function(pos){
    var hm=new THREE.Mesh(indGeo,MAT.lastMove);
    hm.position.set(pos.x-lhalf(pos.l)+0.5,pos.l*GAP+0.07,pos.z-SZ/2+0.5);
    scene.add(hm);lastMoveHighlights.push(hm);
  });
}

// ── AI preview highlights (feature 9) ───────────────
function clearAIPreview(){
  aiPreviewHighlights.forEach(function(m){scene.remove(m);});
  aiPreviewHighlights=[];
  if(aiPreviewTimer){clearTimeout(aiPreviewTimer);aiPreviewTimer=null;}
}
function showAIPreview(fl,fx,fz,tl,tx,tz){
  clearAIPreview();
  [{l:fl,x:fx,z:fz},{l:tl,x:tx,z:tz}].forEach(function(pos){
    var hm=new THREE.Mesh(indGeo,MAT.aiPreview);
    hm.position.set(pos.x-lhalf(pos.l)+0.5,pos.l*GAP+0.09,pos.z-SZ/2+0.5);
    scene.add(hm);aiPreviewHighlights.push(hm);
  });
  aiPreviewTimer=setTimeout(function(){clearAIPreview();},2000);
}

// ── Threatened pieces indicators (feature 10) ───────
function clearThreatIndicators(){
  threatIndicators.forEach(function(m){scene.remove(m);});
  threatIndicators=[];
}
function showThreatenedPieces(currentColor){
  clearThreatIndicators();
  var enemy=currentColor==='white'?'black':'white';
  for(var l=0;l<LEVELS;l++){var s=lsz(l);for(var x=0;x<s;x++)for(var z=0;z<SZ;z++){
    var p=board[l][x][z];
    if(p&&p.color===currentColor&&isSquareAttacked(l,x,z,enemy)){
      var hm=new THREE.Mesh(threatGeo,MAT.threat);
      hm.position.set(x-lhalf(l)+0.5,l*GAP+0.06,z-SZ/2+0.5);
      scene.add(hm);threatIndicators.push(hm);
    }
  }}
}

// ── Click handling (raycaster) ───────────────────────
var raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2(),mdPos=new THREE.Vector2();
var touchStartPos=null,touchMoved=false;

renderer.domElement.addEventListener('mousedown',function(e){mdPos.set(e.clientX,e.clientY);});
renderer.domElement.addEventListener('mouseup',function(e){
  if(Math.abs(e.clientX-mdPos.x)>5||Math.abs(e.clientY-mdPos.y)>5)return;
  handleClick(e.clientX,e.clientY);
});
renderer.domElement.addEventListener('touchstart',function(e){
  if(e.touches.length===1){
    touchStartPos={x:e.touches[0].clientX,y:e.touches[0].clientY};
    touchMoved=false;
  }
},{passive:true});
renderer.domElement.addEventListener('touchmove',function(){touchMoved=true;},{passive:true});
renderer.domElement.addEventListener('touchend',function(e){
  if(!touchMoved&&touchStartPos){handleClick(touchStartPos.x,touchStartPos.y);}
  touchStartPos=null;
},{passive:true});

function handleClick(cx,cy){
  if(!started||gameOver||aiRunning||pendingPromoMove)return;
  if(vsAI&&turn==='black')return;

  mouse.set((cx/innerWidth)*2-1,-(cy/innerHeight)*2+1);
  raycaster.setFromCamera(mouse,camera);

  // Check highlight ring clicks first
  if(selPiece&&highlightMeshes.length){
    var hlHits=raycaster.intersectObjects(highlightMeshes);
    if(hlHits.length&&hlHits[0].object.userData.moveTarget){
      var target=hlHits[0].object.userData.moveTarget;
      // Check if this is a pawn promotion move
      if(isPromotionMove(selPiece.l,selPiece.x,selPiece.z,target)){
        pendingPromoMove={fl:selPiece.l,fx:selPiece.x,fz:selPiece.z,target:target};
        selPiece=null;clearHighlights();clearThreatIndicators();
        showPromotionUI(board[pendingPromoMove.fl][pendingPromoMove.fx][pendingPromoMove.fz].color);
        return;
      }
      var puzFL=selPiece.l,puzFX=selPiece.x,puzFZ=selPiece.z;
      var chk=doMove(selPiece.l,selPiece.x,selPiece.z,target,false);
      selPiece=null;clearHighlights();clearThreatIndicators();
      if(puzzleMode&&!puzzleSolved){afterPuzzleMove(puzFL,puzFX,puzFZ,target);return;}
      if(!gameOver){
        turn=turn==='white'?'black':'white';moveNum++;
        if(!chk)setSt(vsAI?'AI IS THINKING...':(turn.toUpperCase()+"'S TURN"));
        updateUI();
        if(vsAI&&turn==='black')setTimeout(doAI,400);
      }
      return;
    }
  }

  // Piece clicks
  var allMeshChildren=[];
  pieceMeshes.forEach(function(pm){pm.traverse(function(c){if(c.isMesh)allMeshChildren.push(c);});});
  var hits=raycaster.intersectObjects(allMeshChildren);
  if(hits.length){
    var clicked=hits[0].object;
    while(clicked.parent&&!clicked.userData.isPiece)clicked=clicked.parent;
    if(!clicked.userData.isPiece)return;
    var u=clicked.userData;
    if(u.color!==turn){SFX.bad();setSt("IT'S "+turn.toUpperCase()+"'S TURN");return;}
    if(selPiece&&selPiece.l===u.l&&selPiece.x===u.x&&selPiece.z===u.z){selPiece=null;clearHighlights();clearThreatIndicators();setSt(turn.toUpperCase()+"'S TURN");return;}
    selPiece={l:u.l,x:u.x,z:u.z};
    hlMoves=getLegalMoves(u.l,u.x,u.z);
    SFX.sel();showHighlights(u.l,u.x,u.z,hlMoves);
    // Show threatened pieces (feature 10)
    showThreatenedPieces(turn);
    setSt(u.type.toUpperCase()+' SELECTED — '+hlMoves.length+' MOVES');
  }else{
    // Also check tile clicks for move targets
    var allTiles=[];
    tileGroups.forEach(function(g){g.traverse(function(c){if(c.isMesh&&c.userData.l!==undefined)allTiles.push(c);});});
    var tileHits=raycaster.intersectObjects(allTiles);
    if(tileHits.length&&selPiece){
      var tu=tileHits[0].object.userData;
      for(var i=0;i<hlMoves.length;i++){
        if(hlMoves[i].l===tu.l&&hlMoves[i].x===tu.x&&hlMoves[i].z===tu.z){
          var puzFL2=selPiece.l,puzFX2=selPiece.x,puzFZ2=selPiece.z;
          var chk2=doMove(selPiece.l,selPiece.x,selPiece.z,hlMoves[i],false);
          selPiece=null;clearHighlights();clearThreatIndicators();
          if(puzzleMode&&!puzzleSolved){afterPuzzleMove(puzFL2,puzFX2,puzFZ2,hlMoves[i]);return;}
          if(!gameOver){
            turn=turn==='white'?'black':'white';moveNum++;
            if(!chk2)setSt(vsAI?'AI IS THINKING...':(turn.toUpperCase()+"'S TURN"));
            updateUI();
            if(vsAI&&turn==='black')setTimeout(doAI,400);
          }
          return;
        }
      }
    }
    selPiece=null;hlMoves=[];clearHighlights();clearThreatIndicators();
    if(started)setSt(turn.toUpperCase()+"'S TURN");
  }
}

// ── UI helpers ───────────────────────────────────────
function setSt(m){document.getElementById('stat').textContent=m;}
var msgTimer=null;
function showMsg(m){var el=document.getElementById('chkmsg');el.textContent=m;el.style.opacity='1';var al=document.getElementById('a11y-announce');if(al){al.textContent='';setTimeout(function(){al.textContent=m;},50);}}
function flashMsg(m){var el=document.getElementById('chkmsg');el.textContent=m;el.style.opacity='1';var al=document.getElementById('a11y-announce');if(al){al.textContent='';setTimeout(function(){al.textContent=m;},50);}clearTimeout(msgTimer);msgTimer=setTimeout(function(){el.style.opacity='0';},2000);}

function fmtTime(sec){var m=Math.floor(sec/60),s=Math.floor(sec%60);return m+':'+(s<10?'0':'')+s;}

function updateUI(){
  document.getElementById('dot').className=turn==='white'?'w':'b';
  document.getElementById('ttxt').textContent=vsAI?(turn==='white'?'YOUR TURN':'AI THINKING...'):(turn.toUpperCase()+"'S TURN");
  document.getElementById('mnum').textContent='MOVE '+moveNum;
  document.getElementById('sub').textContent=THEMES[theme].n+' · '+(vsAI?'VS AI':'2 PLAYER');
  document.getElementById('aib').style.display=vsAI?'inline':'none';
  document.getElementById('clockdisp').textContent='W: '+fmtTime(clockWhite)+' | B: '+fmtTime(clockBlack);
  var ll=document.getElementById('ll');ll.innerHTML='';
  historyLog.slice(-14).reverse().forEach(function(m){var d=document.createElement('div');d.className='hm';d.textContent='['+m.color[0].toUpperCase()+'] '+m.note;ll.appendChild(d);});
  document.getElementById('wl').textContent=capW.length?capW.map(function(t){return t[0].toUpperCase();}).join(' '):'—';
  document.getElementById('bl').textContent=capB.length?capB.map(function(t){return t[0].toUpperCase();}).join(' '):'—';
  document.getElementById('b-ai').classList.toggle('on',vsAI);
  document.getElementById('b-2p').classList.toggle('on',!vsAI);
  document.getElementById('b-ai').setAttribute('aria-pressed',vsAI?'true':'false');
  document.getElementById('b-2p').setAttribute('aria-pressed',vsAI?'false':'true');
  document.getElementById('b-diff').textContent=['','EASY','MEDIUM','HARD'][aiDepth];
  document.getElementById('b-theme').textContent=THEMES[theme].ico+' THEME';
  document.getElementById('wlrec').textContent='W:'+record.w+' L:'+record.l+' D:'+record.d;
}

// ── Win/loss record (feature 11) ────────────────────
function updateRecord(result){
  if(result==='w')record.w++;
  else if(result==='l')record.l++;
  else record.d++;
  try{localStorage.setItem('rhombus_chess_record_'+_uid(),JSON.stringify(record));}catch(e){}
  updateUI();
}

// ── Theme rebuild ────────────────────────────────────
function applyTheme(){
  buildMaterials();
  // Rebuild board tiles
  tileGroups.forEach(function(g){scene.remove(g);});
  tileGroups=[];tileMap={};
  buildBoard();
  // Rebuild all pieces
  var savedPieces=[];
  pieceMeshes.forEach(function(m){
    savedPieces.push({type:m.userData.type,color:m.userData.color,l:m.userData.l,x:m.userData.x,z:m.userData.z});
  });
  clearPieceMeshes();
  savedPieces.forEach(function(sp){createPieceMesh(sp.type,sp.color,sp.l,sp.x,sp.z);});
  // Rebuild last move highlights
  clearLastMoveHighlights();showLastMoveHighlights();
  applyLevelVisibility();
}

function resetGame(){
  initPieces();selPiece=null;hlMoves=[];turn='white';moveNum=1;
  historyLog=[];capW=[];capB=[];gameOver=false;aiRunning=false;
  undoStack=[];enPassantTarget=null;
  clockWhite=0;clockBlack=0;clockLastTick=Date.now();clockRunning=true;
  clearHighlights();clearLastMoveHighlights();clearAIPreview();clearThreatIndicators();
  lastMoveFrom=null;lastMoveTo=null;
  document.getElementById('chkmsg').style.opacity='0';
  document.getElementById('ait').classList.remove('on');
  applyLevelVisibility();
  updateUI();setSt('SELECT A PIECE TO BEGIN');
}

// ── Undo move (feature 2) ───────────────────────────
function undoLastMove(){
  if(undoStack.length===0||aiRunning||!started)return;
  // If vs AI, undo both AI move and player move
  if(vsAI&&undoStack.length>=2){
    var aiEntry=undoStack[undoStack.length-1];
    if(aiEntry.isAI){
      performUndo(undoStack.pop());
      if(undoStack.length>0){
        performUndo(undoStack.pop());
      }
    }else{
      performUndo(undoStack.pop());
    }
  }else if(!vsAI){
    performUndo(undoStack.pop());
  }else if(vsAI&&undoStack.length===1){
    // Only one entry, undo it if it's not an AI move currently in progress
    var entry=undoStack[undoStack.length-1];
    if(!entry.isAI){
      performUndo(undoStack.pop());
    }
  }
  clearHighlights();clearLastMoveHighlights();clearAIPreview();clearThreatIndicators();
  selPiece=null;hlMoves=[];
  // Rebuild last move from remaining undo stack
  if(undoStack.length>0){
    var last=undoStack[undoStack.length-1];
    lastMoveFrom={l:last.fromL,x:last.fromX,z:last.fromZ};
    lastMoveTo={l:last.toL,x:last.toX,z:last.toZ};
    showLastMoveHighlights();
  }else{
    lastMoveFrom=null;lastMoveTo=null;
  }
  document.getElementById('chkmsg').style.opacity='0';
  gameOver=false;
  updateUI();setSt(turn.toUpperCase()+"'S TURN");
}

function performUndo(entry){
  // Remove piece from target
  var meshAtTarget=findPieceMeshAt(entry.toL,entry.toX,entry.toZ);
  if(meshAtTarget)removePieceMesh(meshAtTarget);

  // Restore original piece type (handle promotion undo)
  var restoredType=entry.promoted?entry.originalType:entry.pieceType;
  board[entry.fromL][entry.fromX][entry.fromZ]={type:restoredType,color:entry.pieceColor};
  board[entry.toL][entry.toX][entry.toZ]=null;
  createPieceMesh(restoredType,entry.pieceColor,entry.fromL,entry.fromX,entry.fromZ);

  // Restore captured piece
  if(entry.capturedPiece){
    var restorePos=entry.epCapturePos||{l:entry.toL,x:entry.toX,z:entry.toZ};
    board[restorePos.l][restorePos.x][restorePos.z]=entry.capturedPiece;
    createPieceMesh(entry.capturedPiece.type,entry.capturedPiece.color,restorePos.l,restorePos.x,restorePos.z);
    // Remove from captured list
    if(entry.pieceColor==='white'){
      var idx=capB.lastIndexOf(entry.capturedPiece.type);if(idx>=0)capB.splice(idx,1);
    }else{
      var idx2=capW.lastIndexOf(entry.capturedPiece.type);if(idx2>=0)capW.splice(idx2,1);
    }
  }

  // Restore en passant target (C9)
  enPassantTarget=entry.prevEnPassantTarget!==undefined?entry.prevEnPassantTarget:null;

  // Restore turn, moveNum, clock
  turn=entry.prevTurn;moveNum=entry.prevMoveNum;
  clockWhite=entry.clockWhite;clockBlack=entry.clockBlack;
  clockLastTick=Date.now();

  // Remove last history entry
  if(historyLog.length>0)historyLog.pop();

  applyLevelVisibility();
}

// ── Save/Load game (feature 12) ─────────────────────
function saveGame(){
  // Serialize board
  var boardData=[];
  for(var l=0;l<LEVELS;l++){var s=lsz(l);for(var x=0;x<s;x++)for(var z=0;z<SZ;z++){
    var p=board[l][x][z];
    if(p)boardData.push({l:l,x:x,z:z,type:p.type,color:p.color});
  }}
  var saveData={
    board:boardData,turn:turn,moveNum:moveNum,
    historyLog:historyLog,capW:capW,capB:capB,
    theme:theme,vsAI:vsAI,aiDepth:aiDepth,
    clockWhite:clockWhite,clockBlack:clockBlack,
    gameOver:gameOver,undoStack:undoStack,enPassantTarget:enPassantTarget
  };
  try{
    localStorage.setItem('rhombus_chess_save_'+_uid(),JSON.stringify(saveData));
    setSt('GAME SAVED ✓');SFX.sel();
  }catch(e){setSt('SAVE FAILED — STORAGE FULL');}
}

function loadGame(){
  try{
    var raw=localStorage.getItem('rhombus_chess_save_'+_uid());
    if(!raw){setSt('NO SAVED GAME FOUND');return;}
    var data=JSON.parse(raw);
    // Clear everything
    for(var l=0;l<LEVELS;l++){var s=lsz(l);for(var x=0;x<s;x++)for(var z=0;z<SZ;z++)board[l][x][z]=null;}
    clearPieceMeshes();clearHighlights();clearLastMoveHighlights();clearAIPreview();clearThreatIndicators();
    undoStack=[];selPiece=null;hlMoves=[];

    // Restore theme — whitelist against known keys
    theme=(TKEYS.indexOf(data.theme)!==-1)?data.theme:'trooper';tidx=TKEYS.indexOf(theme);
    vsAI=data.vsAI===true||data.vsAI===false?data.vsAI:true;
    aiDepth=Math.max(1,Math.min(3,parseInt(data.aiDepth)||2));
    applyTheme();

    // Restore board — validate every field before use (prevents prototype pollution
    // and out-of-bounds crashes from crafted localStorage data)
    var VALID_TYPES={king:1,queen:1,rook:1,bishop:1,knight:1,pawn:1};
    var VALID_COLORS={white:1,black:1};
    data.board.forEach(function(p){
      if(!VALID_TYPES[p.type]||!VALID_COLORS[p.color])return;
      var l=p.l|0,x=p.x|0,z=p.z|0;
      if(l<0||l>=LEVELS||x<0||x>=lsz(l)||z<0||z>=SZ)return;
      board[l][x][z]={type:p.type,color:p.color};
      createPieceMesh(p.type,p.color,l,x,z);
    });

    turn=(data.turn==='black')?'black':'white';moveNum=Math.max(1,parseInt(data.moveNum)||1);
    historyLog=Array.isArray(data.historyLog)?data.historyLog:[];
    capW=Array.isArray(data.capW)?data.capW:[];capB=Array.isArray(data.capB)?data.capB:[];
    clockWhite=data.clockWhite||0;clockBlack=data.clockBlack||0;
    clockLastTick=Date.now();clockRunning=true;
    gameOver=data.gameOver||false;
    undoStack=Array.isArray(data.undoStack)?data.undoStack:[];
    enPassantTarget=data.enPassantTarget||null;
    started=true;

    document.getElementById('start').classList.add('gone');
    document.getElementById('chkmsg').style.opacity='0';
    applyLevelVisibility();
    updateUI();setSt('GAME LOADED!');SFX.sel();
  }catch(e){setSt('LOAD FAILED!');}
}

// ── Export game (feature 14) ─────────────────────────
function exportGame(){
  if(historyLog.length===0){setSt('NO MOVES TO EXPORT');return;}
  var text='4D Rhombus Chess — Move History\n';
  text+='Theme: '+THEMES[theme].n+' | Mode: '+(vsAI?'VS AI':'2 PLAYER')+'\n\n';
  historyLog.forEach(function(m,i){
    text+=(i+1)+'. ['+m.color[0].toUpperCase()+'] '+m.note+'\n';
  });
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(function(){setSt('MOVE HISTORY COPIED TO CLIPBOARD');}).catch(function(){fallbackCopy(text);});
  }else{fallbackCopy(text);}
}
function fallbackCopy(text){
  var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.left='-9999px';
  document.body.appendChild(ta);ta.select();
  try{document.execCommand('copy');setSt('MOVE HISTORY COPIED TO CLIPBOARD');}catch(e){setSt('COPY FAILED');}
  document.body.removeChild(ta);
}

// ── Camera snap (feature 5) ─────────────────────────
var CAM_PRESETS={
  top:{pos:new THREE.Vector3(0,50,0.1),target:new THREE.Vector3(0,11,0)},
  side:{pos:new THREE.Vector3(45,14,0),target:new THREE.Vector3(0,11,0)},
  wpov:{pos:new THREE.Vector3(-22,18,0),target:new THREE.Vector3(3,11,0)},
  bpov:{pos:new THREE.Vector3(22,18,0),target:new THREE.Vector3(-3,11,0)}
};

function snapCamera(preset){
  var p=CAM_PRESETS[preset];if(!p)return;
  camTarget=p.pos.clone();camTargetLookAt=p.target.clone();camLerping=true;
}

// ── Tooltip (features 4 & 6) ────────────────────────
var tooltipEl=document.getElementById('tooltip');
var tooltipRay=new THREE.Raycaster();
var tooltipMouse=new THREE.Vector2();

function updateTooltip(e){
  if(!started){tooltipEl.style.display='none';return;}
  var cx=e.clientX,cy=e.clientY;
  tooltipMouse.set((cx/innerWidth)*2-1,-(cy/innerHeight)*2+1);
  tooltipRay.setFromCamera(tooltipMouse,camera);

  // Check pieces first
  var allMeshChildren=[];
  pieceMeshes.forEach(function(pm){pm.traverse(function(c){if(c.isMesh)allMeshChildren.push(c);});});
  var hits=tooltipRay.intersectObjects(allMeshChildren);
  if(hits.length){
    var clicked=hits[0].object;
    while(clicked.parent&&!clicked.userData.isPiece)clicked=clicked.parent;
    if(clicked.userData.isPiece){
      var u=clicked.userData;
      var col=String.fromCharCode(65+u.x);
      var label=u.color.charAt(0).toUpperCase()+u.color.slice(1)+' '+u.type.charAt(0).toUpperCase()+u.type.slice(1);
      tooltipEl.textContent='Level '+(u.l+1)+' · '+label+' · '+col+(u.z+1);
      tooltipEl.style.display='block';
      tooltipEl.style.left=(cx+14)+'px';tooltipEl.style.top=(cy-24)+'px';
      return;
    }
  }

  // Check tiles
  var allTiles=[];
  tileGroups.forEach(function(g){g.traverse(function(c){if(c.isMesh&&c.userData.l!==undefined)allTiles.push(c);});});
  var tileHits=tooltipRay.intersectObjects(allTiles);
  if(tileHits.length){
    var tu=tileHits[0].object.userData;
    var col2=String.fromCharCode(65+tu.x);
    var info='Level '+(tu.l+1)+' · '+col2+(tu.z+1);
    var p=board[tu.l][tu.x]?board[tu.l][tu.x][tu.z]:null;
    if(p)info+=' · '+p.color.charAt(0).toUpperCase()+p.color.slice(1)+' '+p.type.charAt(0).toUpperCase()+p.type.slice(1);
    tooltipEl.textContent=info;
    tooltipEl.style.display='block';
    tooltipEl.style.left=(cx+14)+'px';tooltipEl.style.top=(cy-24)+'px';
    return;
  }

  tooltipEl.style.display='none';
}
window.addEventListener('mousemove',updateTooltip);

// ── Button wiring ────────────────────────────────────
document.getElementById('b-ai').onclick=function(){vsAI=true;updateUI();resetGame();};
document.getElementById('b-2p').onclick=function(){vsAI=false;updateUI();resetGame();};
document.getElementById('b-diff').onclick=function(){aiDepth=aiDepth%3+1;updateUI();};
document.getElementById('b-theme').onclick=function(){tidx=(tidx+1)%TKEYS.length;theme=TKEYS[tidx];applyTheme();updateUI();SFX.sel();};
document.getElementById('b-reset').onclick=function(){if(started&&!gameOver&&moveNum>3&&!confirm('Start a new game? Current progress will be lost.'))return;resetGame();SFX.sel();};
document.getElementById('b-lvls').onclick=function(){
  var newLvl=LEVELS===15?7:15;
  setLevelCount(newLvl);
  document.getElementById('b-lvls').textContent=LEVELS+' LEVELS';
  SFX.sel();
};
document.getElementById('b-menu').onclick=function(){document.getElementById('start').classList.remove('gone');clockRunning=false;SFX.sel();};
// M1 — Resign button with confirmation
document.getElementById('b-resign').onclick=function(){
  if(!started||gameOver)return;
  if(!confirm('Resign this game?'))return;
  gameOver=true;clockRunning=false;SFX.over();
  showMsg((turn==='white'?'BLACK':'WHITE')+' WINS!');
  setSt('☆ '+(turn==='white'?'WHITE':'BLACK')+' RESIGNED ☆');
  updateRecord(turn==='white'?'l':'w');
};

// Row 2 buttons
document.getElementById('b-top').onclick=function(){snapCamera('top');};
document.getElementById('b-side').onclick=function(){snapCamera('side');};
document.getElementById('b-wpov').onclick=function(){snapCamera('wpov');};
document.getElementById('b-bpov').onclick=function(){snapCamera('bpov');};
document.getElementById('b-undo').onclick=function(){undoLastMove();SFX.sel();};
document.getElementById('b-save').onclick=function(){saveGame();};
document.getElementById('b-load').onclick=function(){loadGame();};
document.getElementById('b-export').onclick=function(){exportGame();};
document.getElementById('b-tut').onclick=function(){document.getElementById('tutorial').classList.toggle('show');};
// A11Y — dismiss tutorial by clicking the backdrop or pressing Escape (beta-test fix)
(function(){
  var tut=document.getElementById('tutorial');
  if(!tut)return;
  tut.addEventListener('click',function(e){if(e.target===tut)tut.classList.remove('show');});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&tut.classList.contains('show'))tut.classList.remove('show');
  });
})();
// CSP fix: wire buttons that previously used inline onclick (blocked by script-src 'self')
(function(){
  function wire(id,fn){var el=document.getElementById(id);if(el)el.onclick=fn;}
  wire('tut-close-btn',function(){document.getElementById('tutorial').classList.remove('show');});
  wire('puz-retry-btn',function(){puzzleRetry();});
  wire('puz-go-btn',function(){nextPuzzle();});
  wire('puz-exit-btn',function(){exitPuzzleMode();});
  wire('signin-btn',function(){showAuthModal('login');});
  wire('user-signout',function(){authSignOut();});
  wire('auth-close',function(){hideAuthModal();});
  wire('tab-login',function(){switchAuthTab('login');});
  wire('tab-signup',function(){switchAuthTab('signup');});
  wire('auth-submit',function(){authSubmit();});
  wire('auth-google',function(){authGoogle();});
})();
// L6 — Scanline toggle with localStorage persistence
(function(){var off=localStorage.getItem('rc_scan_off')==='1';if(off)document.body.classList.add('no-scan');document.getElementById('b-scan').classList.toggle('on',off);})();
document.getElementById('b-scan').onclick=function(){
  var off=document.body.classList.toggle('no-scan');
  try{localStorage.setItem('rc_scan_off',off?'1':'0');}catch(e){}
  this.classList.toggle('on',off);
};

// ── Promotion button wiring ─────────────────────────
document.querySelectorAll('.promo-btn').forEach(function(btn){
  btn.onclick=function(){completePromotion(btn.dataset.piece);};
});

// ── Start screen wiring ─────────────────────────────
var ssTheme='trooper',ssAI=true,ssDiff=2,ssLevels=15;
document.querySelectorAll('.cc').forEach(function(card){
  card.onclick=function(){
    document.querySelectorAll('.cc').forEach(function(c){c.classList.remove('on');});
    card.classList.add('on');ssTheme=card.dataset.t;SFX.sel();
  };
});
function setOb(ids,active){ids.forEach(function(id){document.getElementById(id).classList.toggle('on',id===active);});}
document.getElementById('ss-15l').onclick=function(){ssLevels=15;setOb(['ss-15l','ss-7l'],'ss-15l');};
document.getElementById('ss-7l').onclick=function(){ssLevels=7;setOb(['ss-15l','ss-7l'],'ss-7l');};
document.getElementById('ss-ai').onclick=function(){ssAI=true;setOb(['ss-ai','ss-2p'],'ss-ai');};
document.getElementById('ss-2p').onclick=function(){ssAI=false;setOb(['ss-ai','ss-2p'],'ss-2p');};
document.getElementById('ss-d1').onclick=function(){ssDiff=1;setOb(['ss-d1','ss-d2','ss-d3'],'ss-d1');};
document.getElementById('ss-d2').onclick=function(){ssDiff=2;setOb(['ss-d1','ss-d2','ss-d3'],'ss-d2');};
document.getElementById('ss-d3').onclick=function(){ssDiff=3;setOb(['ss-d1','ss-d2','ss-d3'],'ss-d3');};
// A11Y — keyboard activation for all role="button" elements (Enter / Space)
document.addEventListener('keydown',function(e){
  if((e.key==='Enter'||e.key===' ')&&e.target.getAttribute('role')==='button'){
    e.preventDefault();e.target.click();
  }
});
// ── Puzzle mode ───────────────────────────────────────
// ── Firebase Auth ────────────────────────────────────
// ⚠️  Paste your Firebase project config here.
// Get it from: Firebase Console → Project Settings → Your Apps → SDK setup
var FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

var fbAuth=null, fbDb=null, currentUser=null, authTab='login';

// ── Local auth (localStorage fallback when Firebase not configured) ──
function _uid(){return (currentUser&&currentUser.uid)||'guest';}
function _lcUsers(){try{return JSON.parse(localStorage.getItem('rc_users')||'{}');}catch(e){return{};}}
function _svUsers(u){try{localStorage.setItem('rc_users',JSON.stringify(u));}catch(e){console.warn('Storage full — users not saved');}}
function _lcSession(u){try{if(u)localStorage.setItem('rc_session',JSON.stringify(u));else localStorage.removeItem('rc_session');}catch(e){}}
function _getSession(){try{return JSON.parse(localStorage.getItem('rc_session')||'null');}catch(e){return null;}}
function _hashPass(p,saltHex){
  // PBKDF2 with per-user random salt (H2). Returns Promise<{hash,salt}>.
  var enc=new TextEncoder();
  var saltArr=saltHex?new Uint8Array(saltHex.match(/.{2}/g).map(function(h){return parseInt(h,16);})):crypto.getRandomValues(new Uint8Array(16));
  var saltOut=Array.from(saltArr).map(function(b){return b.toString(16).padStart(2,'0');}).join('');
  return crypto.subtle.importKey('raw',enc.encode(p),'PBKDF2',false,['deriveBits'])
    .then(function(key){return crypto.subtle.deriveBits({name:'PBKDF2',salt:saltArr,iterations:100000,hash:'SHA-256'},key,256);})
    .then(function(bits){return {hash:Array.from(new Uint8Array(bits)).map(function(b){return b.toString(16).padStart(2,'0');}).join(''),salt:saltOut};});
}
function _hashPassLegacy(p){
  // Legacy fallback: old accounts stored with hardcoded salt
  var enc=new TextEncoder();
  return crypto.subtle.importKey('raw',enc.encode(p),'PBKDF2',false,['deriveBits'])
    .then(function(key){return crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode('rhombus-chess-local-v1'),iterations:100000,hash:'SHA-256'},key,256);})
    .then(function(bits){return Array.from(new Uint8Array(bits)).map(function(b){return b.toString(16).padStart(2,'0');}).join('');});
}

function localSignup(name,email,pass){
  var users=_lcUsers();
  if(users[email])return Promise.reject({code:'auth/email-already-in-use'});
  return _hashPass(pass).then(function(r){
    var uid='local_'+Date.now();
    users[email]={uid:uid,displayName:name,email:email,photoURL:null,_p:r.hash,_s:r.salt,puzzlesSolved:0,created:Date.now(),loginAttempts:0,lockUntil:0};
    try{_svUsers(users);}catch(e){throw{code:'auth/storage-full'};}
    var sess={uid:uid,displayName:name,email:email,photoURL:null};
    _lcSession(sess);return sess;
  });
}
function localLogin(email,pass){
  var users=_lcUsers();
  var u=users[email];
  if(!u)return Promise.reject({code:'auth/user-not-found'});
  if(u.lockUntil&&Date.now()<u.lockUntil)return Promise.reject({code:'auth/too-many-requests'});
  var hashP=u._s?_hashPass(pass,u._s).then(function(r){return r.hash;}):_hashPassLegacy(pass);
  return hashP.then(function(hash){
    if(u._p!==hash)throw{code:'auth/wrong-password'};
    u.loginAttempts=0;u.lockUntil=0;
    try{_svUsers(users);}catch(e2){}
    var sess={uid:u.uid,displayName:u.displayName,email:email,photoURL:null};
    _lcSession(sess);return sess;
  }).catch(function(e){
    if(e.code==='auth/wrong-password'){
      u.loginAttempts=(u.loginAttempts||0)+1;
      if(u.loginAttempts>=5)u.lockUntil=Date.now()+15*60*1000;
      try{_svUsers(users);}catch(e2){}
    }
    throw e;
  });
}
function localSignOut(){_lcSession(null);}

(function initFirebase(){
  if(!FIREBASE_CONFIG.apiKey||FIREBASE_CONFIG.apiKey==='YOUR_API_KEY'){
    // No Firebase — restore local session
    currentUser=_getSession();
    updateUserBadge();
    return;
  }
  try{
    firebase.initializeApp(FIREBASE_CONFIG);
    fbAuth=firebase.auth();
    fbDb=firebase.firestore();
    fbAuth.onAuthStateChanged(function(user){
      currentUser=user;
      updateUserBadge();
    });
  }catch(e){console.warn('Firebase init failed:',e);}
})();

function updateUserBadge(){
  try{var _r2=localStorage.getItem('rhombus_chess_record_'+((currentUser&&currentUser.uid)||'guest'));if(_r2){var _rp=JSON.parse(_r2);record={w:parseInt(_rp.w)||0,l:parseInt(_rp.l)||0,d:parseInt(_rp.d)||0};}}catch(_e2){}
  var guest=document.getElementById('user-badge-guest');
  var loggedin=document.getElementById('user-badge-loggedin');
  if(!guest||!loggedin)return;
  if(currentUser){
    guest.style.display='none';
    loggedin.style.display='flex';
    var name=currentUser.displayName||currentUser.email.split('@')[0];
    document.getElementById('user-name').textContent=name.toUpperCase();
    var initials=(currentUser.displayName||'?').split(' ').map(function(w){return w[0];}).join('').substring(0,2).toUpperCase();
    var avatarEl=document.getElementById('user-initials');
    var avatarWrap=document.getElementById('user-avatar');
    if(currentUser.photoURL){
      var img=document.createElement('img');img.alt='avatar';img.src=currentUser.photoURL;
      avatarWrap.innerHTML='';avatarWrap.appendChild(img);
    }else{
      avatarWrap.innerHTML='';
      var sp=document.createElement('span');sp.id='user-initials';sp.textContent=initials;
      avatarWrap.appendChild(sp);
    }
  }else{
    guest.style.display='flex';
    loggedin.style.display='none';
  }
}

function showAuthModal(tab){
  switchAuthTab(tab||'login');
  document.getElementById('auth-modal').classList.add('show');
  setTimeout(function(){document.getElementById('auth-email').focus();},100);
}
function hideAuthModal(){
  document.getElementById('auth-modal').classList.remove('show');
  document.getElementById('auth-err').textContent='';
  document.getElementById('auth-email').value='';
  document.getElementById('auth-pass').value='';
  document.getElementById('auth-name').value='';
}
function switchAuthTab(tab){
  authTab=tab;
  document.getElementById('tab-login').classList.toggle('active',tab==='login');
  document.getElementById('tab-signup').classList.toggle('active',tab==='signup');
  document.getElementById('auth-submit').textContent=tab==='login'?'LOG IN':'CREATE ACCOUNT';
  document.getElementById('auth-name-field').style.display=tab==='signup'?'flex':'none';
  document.getElementById('auth-err').textContent='';
  document.getElementById('auth-pass').setAttribute('autocomplete',tab==='login'?'current-password':'new-password');
}
function authSetErr(msg){document.getElementById('auth-err').textContent=msg;}

function authSubmit(){
  var email=document.getElementById('auth-email').value.trim();
  var pass=document.getElementById('auth-pass').value;
  var name=document.getElementById('auth-name').value.trim();
  if(!email||!pass){authSetErr('Please enter email and password.');return;}
  document.getElementById('auth-submit').textContent='...';

  if(fbAuth){
    // Firebase path
    if(authTab==='login'){
      fbAuth.signInWithEmailAndPassword(email,pass)
        .then(function(){hideAuthModal();})
        .catch(function(e){authSetErr(friendlyAuthErr(e));document.getElementById('auth-submit').textContent='LOG IN';});
    }else{
      if(!name){authSetErr('Please enter a display name.');document.getElementById('auth-submit').textContent='CREATE ACCOUNT';return;}
      fbAuth.createUserWithEmailAndPassword(email,pass)
        .then(function(cred){
          return cred.user.updateProfile({displayName:name}).then(function(){
            if(fbDb)fbDb.collection('users').doc(cred.user.uid).set({name:name,email:email,created:firebase.firestore.FieldValue.serverTimestamp(),puzzlesSolved:0},{merge:true});
          });
        })
        .then(function(){hideAuthModal();updateUserBadge();})
        .catch(function(e){authSetErr(friendlyAuthErr(e));document.getElementById('auth-submit').textContent='CREATE ACCOUNT';});
    }
  }else{
    // Local auth fallback (async PBKDF2)
    var localPromise;
    if(authTab==='login'){
      localPromise=localLogin(email,pass);
    }else{
      if(!name){authSetErr('Please enter a display name.');document.getElementById('auth-submit').textContent='CREATE ACCOUNT';return;}
      localPromise=localSignup(name,email,pass);
    }
    localPromise.then(function(sess){
      currentUser=sess;
      updateUserBadge();
      hideAuthModal();
    }).catch(function(e){
      authSetErr(friendlyAuthErr(e));
      document.getElementById('auth-submit').textContent=authTab==='login'?'LOG IN':'CREATE ACCOUNT';
    });
  }
}

function authGoogle(){
  if(!fbAuth){authSetErr('Google sign-in requires Firebase setup.');return;}
  var provider=new firebase.auth.GoogleAuthProvider();
  fbAuth.signInWithPopup(provider)
    .then(function(result){
      if(fbDb&&result.additionalUserInfo.isNewUser){
        fbDb.collection('users').doc(result.user.uid).set({name:result.user.displayName,email:result.user.email,created:firebase.firestore.FieldValue.serverTimestamp(),puzzlesSolved:0},{merge:true});
      }
      hideAuthModal();
    })
    .catch(function(e){authSetErr(friendlyAuthErr(e));});
}

function authSignOut(){
  if(fbAuth){fbAuth.signOut();}
  else{localSignOut();currentUser=null;updateUserBadge();}
}

function friendlyAuthErr(e){
  var m={
    'auth/invalid-email':'Invalid email address.',
    'auth/user-not-found':'No account with that email.',
    'auth/wrong-password':'Incorrect password.',
    'auth/email-already-in-use':'That email is already registered.',
    'auth/weak-password':'Password must be at least 6 characters.',
    'auth/too-many-requests':'Too many attempts. Try again later.',
    'auth/popup-closed-by-user':''
  };
  return m[e.code]||e.message||'Something went wrong.';
}

// Close modal on backdrop click
document.getElementById('auth-modal').addEventListener('click',function(e){
  if(e.target===this)hideAuthModal();
});

// ── Puzzles ──────────────────────────────────────────
var puzzleMode=false,puzzleIndex=0,puzzleSolved=false;
var puzzleData=[{"id":"mate_in_1_001","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":1,"x":0,"z":3},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_002","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":2,"type":"rook","color":"white"},{"l":2,"x":0,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":2,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_003","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":3,"x":0,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":3,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_004","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":2,"type":"rook","color":"white"},{"l":2,"x":0,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":2,"x":0,"z":4},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_005","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":2,"type":"rook","color":"white"},{"l":3,"x":0,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":3,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_006","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":4,"x":0,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":4,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_007","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":2,"type":"rook","color":"white"},{"l":3,"x":0,"z":5,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":3,"x":0,"z":5},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_008","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":2,"type":"rook","color":"white"},{"l":4,"x":0,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":4,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_009","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":5,"x":0,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":5,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_010","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":2,"type":"rook","color":"white"},{"l":4,"x":0,"z":6,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":4,"x":0,"z":6},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_011","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":2,"type":"rook","color":"white"},{"l":5,"x":0,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":5,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_012","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":6,"x":0,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":6,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_013","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":2,"type":"rook","color":"white"},{"l":5,"x":0,"z":7,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":5,"x":0,"z":7},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_014","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":2,"type":"rook","color":"white"},{"l":6,"x":0,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":6,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_015","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":7,"x":0,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":7,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_016","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":2,"type":"queen","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":1,"x":1,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_017","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":2,"type":"rook","color":"white"},{"l":7,"x":0,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":7,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_018","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":8,"x":0,"z":4,"type":"queen","color":"white"}],"solution":[{"from":{"l":8,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_019","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":2,"x":2,"z":2,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":2,"x":2,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_020","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":8,"x":0,"z":2,"type":"rook","color":"white"}],"solution":[{"from":{"l":8,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_021","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":9,"x":0,"z":4,"type":"queen","color":"white"}],"solution":[{"from":{"l":9,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_022","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":3,"x":3,"z":2,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":3,"x":3,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_023","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":9,"x":0,"z":2,"type":"rook","color":"white"}],"solution":[{"from":{"l":9,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_024","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":10,"x":0,"z":4,"type":"queen","color":"white"}],"solution":[{"from":{"l":10,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_025","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":4,"x":4,"z":2,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":4,"x":4,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_026","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":10,"x":0,"z":2,"type":"rook","color":"white"}],"solution":[{"from":{"l":10,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_027","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":11,"x":0,"z":4,"type":"queen","color":"white"}],"solution":[{"from":{"l":11,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_028","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":5,"x":5,"z":2,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":5,"x":5,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_029","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":11,"x":0,"z":2,"type":"rook","color":"white"}],"solution":[{"from":{"l":11,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_030","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":12,"x":0,"z":4,"type":"queen","color":"white"}],"solution":[{"from":{"l":12,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_031","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":6,"x":6,"z":2,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":6,"x":6,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_032","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":12,"x":0,"z":2,"type":"rook","color":"white"}],"solution":[{"from":{"l":12,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_033","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":13,"x":0,"z":4,"type":"queen","color":"white"}],"solution":[{"from":{"l":13,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_034","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":7,"x":7,"z":2,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":7,"x":7,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_035","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":13,"x":0,"z":2,"type":"rook","color":"white"}],"solution":[{"from":{"l":13,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_036","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":14,"x":0,"z":4,"type":"queen","color":"white"}],"solution":[{"from":{"l":14,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_037","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":1,"x":0,"z":3},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_038","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":14,"x":0,"z":2,"type":"rook","color":"white"}],"solution":[{"from":{"l":14,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_039","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"queen","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":1,"x":1,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_040","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":2,"x":0,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":2,"x":0,"z":4},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_041","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":2,"x":0,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":2,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_042","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":2,"x":2,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":2,"x":2,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_043","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":3,"x":0,"z":5,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":3,"x":0,"z":5},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_044","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":3,"x":0,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":3,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_045","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":3,"x":3,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":3,"x":3,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_046","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":4,"x":0,"z":6,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":4,"x":0,"z":6},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_047","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":4,"x":0,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":4,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_048","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":4,"x":4,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":4,"x":4,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_049","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":5,"x":0,"z":7,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":5,"x":0,"z":7},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_050","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":5,"x":0,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":5,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_051","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":5,"x":5,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":5,"x":5,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_052","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":2,"type":"queen","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":1,"x":1,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_053","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":6,"x":0,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":6,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_054","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":6,"x":6,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":6,"x":6,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_055","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":2,"x":2,"z":2,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":2,"x":2,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_056","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":7,"x":0,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":7,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_057","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":7,"x":7,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":7,"x":7,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_058","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":3,"x":3,"z":2,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":3,"x":3,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_059","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":8,"x":0,"z":2,"type":"rook","color":"white"}],"solution":[{"from":{"l":8,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_060","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":0,"z":5,"type":"queen","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":1,"x":0,"z":5},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_061","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":4,"x":4,"z":2,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":4,"x":4,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_062","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":9,"x":0,"z":2,"type":"rook","color":"white"}],"solution":[{"from":{"l":9,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_063","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":2,"x":0,"z":6,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":2,"x":0,"z":6},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_064","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":5,"x":5,"z":2,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":5,"x":5,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_065","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":10,"x":0,"z":2,"type":"rook","color":"white"}],"solution":[{"from":{"l":10,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_066","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":3,"x":0,"z":7,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":3,"x":0,"z":7},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_067","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":6,"x":6,"z":2,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":6,"x":6,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_068","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":11,"x":0,"z":2,"type":"rook","color":"white"}],"solution":[{"from":{"l":11,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_069","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":3,"x":0,"z":1,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":3,"x":0,"z":1},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_070","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":7,"x":7,"z":2,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":7,"x":7,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_071","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":12,"x":0,"z":2,"type":"rook","color":"white"}],"solution":[{"from":{"l":12,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_072","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":0,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":4,"x":0,"z":0,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":4,"x":0,"z":0},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_073","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":1,"x":0,"z":3},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_074","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":13,"x":0,"z":2,"type":"rook","color":"white"}],"solution":[{"from":{"l":13,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_075","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":3,"x":0,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":3,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_076","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":2,"x":0,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":2,"x":0,"z":4},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_077","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":3,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":14,"x":0,"z":2,"type":"rook","color":"white"}],"solution":[{"from":{"l":14,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_078","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":4,"x":0,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":4,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_079","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":3,"x":0,"z":5,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":3,"x":0,"z":5},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_080","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":2,"x":0,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":2,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_081","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":5,"x":0,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":5,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_082","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":4,"x":0,"z":6,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":4,"x":0,"z":6},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_083","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":3,"x":0,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":3,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_084","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":6,"x":0,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":6,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_085","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":5,"x":0,"z":7,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":5,"x":0,"z":7},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_086","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":4,"x":0,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":4,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_087","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":7,"x":0,"z":4,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":7,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_088","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":2,"type":"queen","color":"white"},{"l":1,"x":1,"z":5,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":1,"x":1,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_089","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":5,"x":0,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":5,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_090","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":8,"x":0,"z":4,"type":"queen","color":"white"}],"solution":[{"from":{"l":8,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_091","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":5,"type":"rook","color":"white"},{"l":2,"x":2,"z":2,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":2,"x":2,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_092","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":6,"x":0,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":6,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_093","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":9,"x":0,"z":4,"type":"queen","color":"white"}],"solution":[{"from":{"l":9,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_094","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":5,"type":"rook","color":"white"},{"l":3,"x":3,"z":2,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":3,"x":3,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_095","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":7,"x":0,"z":2,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":7,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_096","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":10,"x":0,"z":4,"type":"queen","color":"white"}],"solution":[{"from":{"l":10,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_097","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":5,"type":"rook","color":"white"},{"l":4,"x":4,"z":2,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":4,"x":4,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_098","type":"mate-in-1","family":"B","difficulty":"intermediate","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":3,"type":"queen","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":8,"x":0,"z":2,"type":"rook","color":"white"}],"solution":[{"from":{"l":8,"x":0,"z":2},"to":{"l":0,"x":0,"z":2}}]},{"id":"mate_in_1_099","type":"mate-in-1","family":"D","difficulty":"advanced","toMove":"white","position":[{"l":0,"x":0,"z":2,"type":"king","color":"black"},{"l":1,"x":0,"z":0,"type":"rook","color":"white"},{"l":1,"x":1,"z":4,"type":"rook","color":"white"},{"l":2,"x":0,"z":1,"type":"rook","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"},{"l":11,"x":0,"z":4,"type":"queen","color":"white"}],"solution":[{"from":{"l":11,"x":0,"z":4},"to":{"l":0,"x":0,"z":4}}]},{"id":"mate_in_1_100","type":"mate-in-1","family":"A","difficulty":"beginner","toMove":"white","position":[{"l":0,"x":0,"z":0,"type":"king","color":"black"},{"l":1,"x":0,"z":2,"type":"rook","color":"white"},{"l":1,"x":1,"z":5,"type":"rook","color":"white"},{"l":5,"x":5,"z":2,"type":"queen","color":"white"},{"l":7,"x":7,"z":7,"type":"king","color":"white"}],"solution":[{"from":{"l":5,"x":5,"z":2},"to":{"l":0,"x":0,"z":2}}]}];

function loadPuzzles(cb){cb();} // data already inline
// ── Puzzle Progress Persistence ────────────────────────────────────────────
function _loadPuzProgress(){
  try{return JSON.parse(localStorage.getItem('rc_puzzle_progress_'+_uid())||'{}')}catch(e){return{};}
}
function _savePuzSolved(id){
  var prog=_loadPuzProgress();
  prog[id]=Date.now();
  try{localStorage.setItem('rc_puzzle_progress_'+_uid(),JSON.stringify(prog));}catch(e){}
}
function _isPuzSolved(id){return !!_loadPuzProgress()[id];}
function _countSolved(){return Object.keys(_loadPuzProgress()).length;}

function startPuzzleMode(idx){
  loadPuzzles(function(){
    if(!puzzleData.length){setSt('NO PUZZLES FOUND');return;}
    puzzleIndex=(idx||0)%puzzleData.length;
    beginPuzzle(puzzleIndex);
  });
}

function beginPuzzle(idx){
  var puz=puzzleData[idx];if(!puz)return;
  document.getElementById('start').classList.add('gone');
  puzzleMode=true;puzzleSolved=false;
  vsAI=false;turn=puz.toMove||'white';moveNum=1;
  gameOver=false;aiRunning=false;started=true;
  historyLog=[];capW=[];capB=[];undoStack=[];enPassantTarget=null;
  // Clear board
  for(var li=0;li<LEVELS;li++){var s=lsz(li);for(var xi=0;xi<s;xi++)for(var zi=0;zi<SZ;zi++)board[li][xi][zi]=null;}
  clearPieceMeshes();
  // Place puzzle pieces
  puz.position.forEach(function(p){
    board[p.l][p.x][p.z]={type:p.type,color:p.color};
    createPieceMesh(p.type,p.color,p.l,p.x,p.z);
  });
  applyLevelVisibility();
  clearHighlights();clearLastMoveHighlights();clearAIPreview();clearThreatIndicators();
  lastMoveFrom=null;lastMoveTo=null;
  document.getElementById('chkmsg').style.opacity='0';
  document.getElementById('puz-banner').textContent='🧩 PUZZLE '+(idx+1)+'/'+puzzleData.length+' — MATE IN 1 — '+_countSolved()+' SOLVED ✓';
  document.getElementById('puz-banner').classList.add('show');
  document.getElementById('puz-result').classList.remove('show');
  applyTheme();updateUI();
  setSt('FIND THE CHECKMATE IN 1 MOVE ♟');
}

function afterPuzzleMove(fl,fx,fz,target){
  if(!puzzleMode||puzzleSolved)return;
  var puz=puzzleData[puzzleIndex];if(!puz)return;
  var sol=puz.solution[0];
  var correct=(sol.from.l===fl&&sol.from.x===fx&&sol.from.z===fz&&
               sol.to.l===target.l&&sol.to.x===target.x&&sol.to.z===target.z);
  if(correct){
    _savePuzSolved(puzzleData[puzzleIndex].id);
    puzzleSolved=true;gameOver=true;SFX.over();
    showMsg('✓ CHECKMATE!');
    setTimeout(function(){
      document.getElementById('puz-result-msg').textContent='✓  CHECKMATE!';
      document.getElementById('puz-result-sub').textContent='PUZZLE '+(puzzleIndex+1)+' SOLVED';
      document.getElementById('puz-result').classList.add('show');
    },1000);
  }else{
    SFX.bad();flashMsg('WRONG MOVE');
    setSt('NOT CHECKMATE — TRY AGAIN ↺');
    setTimeout(function(){
      undoLastMove();
      gameOver=false;turn='white';
      setSt('FIND THE CHECKMATE IN 1 MOVE ♟');
    },700);
  }
}

function nextPuzzle(){
  puzzleIndex=(puzzleIndex+1)%puzzleData.length;
  beginPuzzle(puzzleIndex);
}

function puzzleRetry(){beginPuzzle(puzzleIndex);}

function exitPuzzleMode(){
  puzzleMode=false;puzzleSolved=false;
  document.getElementById('puz-banner').classList.remove('show');
  document.getElementById('puz-result').classList.remove('show');
  started=false;gameOver=false;
  document.getElementById('start').classList.remove('gone');
}

document.getElementById('puz-go').onclick=function(){var fi=puzzleData.findIndex(function(p){return !_isPuzSolved(p.id);});startPuzzleMode(fi>=0?fi:0);};

document.getElementById('go').onclick=function(){
  theme=ssTheme;vsAI=ssAI;aiDepth=ssDiff;puzzleMode=false;
  tidx=TKEYS.indexOf(theme);
  if(ssLevels!==LEVELS)setLevelCount(ssLevels);
  document.getElementById('b-lvls').textContent=LEVELS+' LEVELS';
  document.getElementById('start').classList.add('gone');
  started=true;
  applyTheme();resetGame();SFX.go();
  setSt('CLICK PIECES · DRAG TO ORBIT · SCROLL TO ZOOM');
  // H12 — First-run tutorial auto-show
  if(!localStorage.getItem('rc_tutorial_seen')){
    try{localStorage.setItem('rc_tutorial_seen','1');}catch(e){}
    document.getElementById('tutorial').classList.add('show');
  }
};

// ── Resize ───────────────────────────────────────────
window.addEventListener('resize',function(){
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

// ── Animate ──────────────────────────────────────────
var t=0;
initPieces();updateUI();setSt('PRESS START GAME');

(function animate(){
  requestAnimationFrame(animate);t+=0.008;

  // Camera snap lerp (feature 5)
  if(camLerping&&camTarget&&camTargetLookAt){
    camera.position.lerp(camTarget,0.06);
    controls.target.lerp(camTargetLookAt,0.06);
    if(camera.position.distanceTo(camTarget)<0.1){camLerping=false;}
  }

  controls.update();
  fillLight.intensity=0.8+Math.sin(t*.7)*.2;
  highlightMeshes.forEach(function(h,i){h.position.y+=Math.sin(t*3+i)*0.0008;h.rotation.y+=0.02;});
  lastMoveHighlights.forEach(function(h,i){h.rotation.y+=0.015;});
  aiPreviewHighlights.forEach(function(h,i){h.rotation.y+=0.03;h.position.y+=Math.sin(t*4+i)*0.001;});
  threatIndicators.forEach(function(h,i){h.rotation.y+=0.025;h.position.y+=Math.sin(t*5+i)*0.0006;});

  // Chess clock (feature 3)
  if(clockRunning&&started&&!gameOver){
    var now=Date.now();
    var dt=(now-clockLastTick)/1000;
    clockLastTick=now;
    if(turn==='white')clockWhite+=dt;else clockBlack+=dt;
    document.getElementById('clockdisp').textContent='W: '+fmtTime(clockWhite)+' | B: '+fmtTime(clockBlack);
  }

  renderer.render(scene,camera);
})();
