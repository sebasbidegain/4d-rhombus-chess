/**
 * RhombusChess 4D Puzzle Generator v4
 * ─────────────────────────────────────
 * Three template families — all mate-in-1:
 *
 *  A — Edge-level corner, QUEEN checks along z-axis
 *  B — Edge-level corner, ROOK  checks along z-axis
 *  D — Edge-level mid-z,  QUEEN checks along z-axis (non-corner king position)
 *
 * Rule that makes retrograde work: the checking piece must be the ONLY piece
 * covering one particular escape square. When it's absent (pre-move), that
 * square is open → black has a legal move → valid puzzle start.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const LEVELS = 15, SZ = 8, MID = 7;
function lsz(l) { return Math.max(1, SZ - Math.abs(l - MID)); }

// ── Board ─────────────────────────────────────────────────────────────────────
let board = [];
function initBoard() {
  board = [];
  for (let i = 0; i < LEVELS; i++) {
    board[i] = [];
    for (let j = 0; j < lsz(i); j++) {
      board[i][j] = [];
      for (let k = 0; k < SZ; k++) board[i][j][k] = null;
    }
  }
}
function place(l, x, z, type, color) {
  if (l>=0&&l<LEVELS&&x>=0&&x<lsz(l)&&z>=0&&z<SZ) { board[l][x][z]={type,color}; return true; }
  return false;
}
function remove(l, x, z) {
  if (l>=0&&l<LEVELS&&x>=0&&x<lsz(l)&&z>=0&&z<SZ) board[l][x][z]=null;
}

// ── Moves (exact port from game) ──────────────────────────────────────────────
function getMoves(l, x, z) {
  const p = board[l][x][z]; if (!p) return [];
  const {type, color} = p;
  const enemy = color==='white'?'black':'white';
  const moves = [];
  function tryAdd(nl,nx,nz) {
    if (nx<0||nx>=lsz(nl)||nz<0||nz>=SZ||nl<0||nl>=LEVELS) return false;
    const occ = board[nl][nx][nz];
    if (occ) { if (occ.color===enemy) moves.push({l:nl,x:nx,z:nz}); return false; }
    moves.push({l:nl,x:nx,z:nz}); return true;
  }
  function slide(dl,dx,dz) {
    let cl=l+dl,cx=x+dx,cz=z+dz;
    while(cl>=0&&cl<LEVELS){if(cx<0||cx>=lsz(cl)||cz<0||cz>=SZ)break;if(!tryAdd(cl,cx,cz))break;cl+=dl;cx+=dx;cz+=dz;}
  }
  if (type==='rook')   [[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],[1,0,0],[-1,0,0]].forEach(v=>slide(...v));
  if (type==='queen')  [[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],[0,1,1],[0,1,-1],[0,-1,1],[0,-1,-1],[1,0,0],[-1,0,0],[1,1,0],[1,-1,0],[-1,1,0],[-1,-1,0],[1,0,1],[1,0,-1],[-1,0,1],[-1,0,-1]].forEach(v=>slide(...v));
  if (type==='king')   { for(let dl=-1;dl<=1;dl++) for(let dx=-1;dx<=1;dx++) for(let dz=-1;dz<=1;dz++) if(dl||dx||dz) tryAdd(l+dl,x+dx,z+dz); }
  if (type==='knight') [[0,2,1],[0,2,-1],[0,-2,1],[0,-2,-1],[0,1,2],[0,1,-2],[0,-1,2],[0,-1,-2],[1,1,1],[1,1,-1],[1,-1,1],[1,-1,-1],[-1,1,1],[-1,1,-1],[-1,-1,1],[-1,-1,-1]].forEach(v=>tryAdd(l+v[0],x+v[1],z+v[2]));
  return moves;
}
function findKing(color) {
  for(let l=0;l<LEVELS;l++) { const s=lsz(l); for(let x=0;x<s;x++) for(let z=0;z<SZ;z++) { const p=board[l][x][z]; if(p&&p.type==='king'&&p.color===color) return{l,x,z}; } }
  return null;
}
function inCheck(color) {
  const k=findKing(color); if(!k) return false;
  const en=color==='white'?'black':'white';
  for(let l=0;l<LEVELS;l++) { const s=lsz(l); for(let x=0;x<s;x++) for(let z=0;z<SZ;z++) { const p=board[l][x][z]; if(p&&p.color===en) for(const m of getMoves(l,x,z)) if(m.l===k.l&&m.x===k.x&&m.z===k.z) return true; } }
  return false;
}
function getLegal(l, x, z) {
  const p=board[l][x][z]; if(!p) return [];
  const legal=[];
  for(const mv of getMoves(l,x,z)) {
    const cap=board[mv.l][mv.x][mv.z];
    board[mv.l][mv.x][mv.z]=p; board[l][x][z]=null;
    if(!inCheck(p.color)) legal.push(mv);
    board[l][x][z]=p; board[mv.l][mv.x][mv.z]=cap;
  }
  return legal;
}
function anyMoves(color) {
  for(let l=0;l<LEVELS;l++){const s=lsz(l);for(let x=0;x<s;x++)for(let z=0;z<SZ;z++){const p=board[l][x][z];if(p&&p.color===color&&getLegal(l,x,z).length>0)return true;}}
  return false;
}
function isCheckmate(color) { return inCheck(color)&&!anyMoves(color); }
function serialize() {
  const out=[];
  for(let l=0;l<LEVELS;l++){const s=lsz(l);for(let x=0;x<s;x++)for(let z=0;z<SZ;z++){const p=board[l][x][z];if(p)out.push({l,x,z,type:p.type,color:p.color});}}
  return out;
}

// ── Generic retrograde ────────────────────────────────────────────────────────
const QDIRS = [[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],[0,1,1],[0,1,-1],[0,-1,1],[0,-1,-1],[1,0,0],[-1,0,0],[1,1,0],[1,-1,0],[-1,1,0],[-1,-1,0],[1,0,1],[1,0,-1],[-1,0,1],[-1,0,-1]];
const RDIRS = [[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],[1,0,0],[-1,0,0]];

function retrograde(pl, px, pz) {
  const piece = board[pl][px][pz]; if (!piece) return [];
  const dirs = piece.type==='queen' ? QDIRS : RDIRS;
  remove(pl, px, pz);
  const origins = [];
  for (const [dl,dx,dz] of dirs) {
    let cl=pl+dl, cx=px+dx, cz=pz+dz;
    while(cl>=0&&cl<LEVELS){if(cx<0||cx>=lsz(cl)||cz<0||cz>=SZ)break;if(board[cl][cx][cz])break;origins.push({l:cl,x:cx,z:cz});cl+=dl;cx+=dx;cz+=dz;}
  }
  place(pl, px, pz, piece.type, piece.color);
  const puzzles=[];
  for (const orig of origins) {
    remove(pl, px, pz);
    place(orig.l, orig.x, orig.z, piece.type, piece.color);
    const pos = serialize();
    if (!inCheck('white') && !inCheck('black') && anyMoves('black')) {
      const legal = getLegal(orig.l, orig.x, orig.z);
      if (legal.some(m=>m.l===pl&&m.x===px&&m.z===pz))
        puzzles.push({ position: pos, solution:[{from:{l:orig.l,x:orig.x,z:orig.z},to:{l:pl,x:px,z:pz}}] });
    }
    remove(orig.l, orig.x, orig.z);
    place(pl, px, pz, piece.type, piece.color);
  }
  return puzzles;
}

// ── FAMILY A — Edge level corner, queen checks along z ────────────────────────
// King at (bkl,0,bkz). Queen at (bkl,0,qz) checks+covers bkz±1.
// Rooks on adjL cover (adjL,0,*) and (adjL,1,*).
function buildA() {
  const cfgs=[];
  for (const bkl of [0,LEVELS-1]) {
    const adjL = bkl===0?1:LEVELS-2;
    for (const bkz of [0,SZ-1]) {
      const lo=bkz===0?2:0, hi=bkz===0?SZ-1:SZ-3;
      for (let qz=lo;qz<=hi;qz++)
        for (let rAz=lo;rAz<=hi;rAz++)
          for (let rBz=lo;rBz<=hi;rBz++) {
            const wkl=MID,wkx=lsz(MID)-1,wkz=SZ-1;
            const keys=new Set([`${bkl},0,${bkz}`,`${bkl},0,${qz}`,`${adjL},0,${rAz}`,`${adjL},1,${rBz}`,`${wkl},${wkx},${wkz}`]);
            if(keys.size<5) continue;
            cfgs.push({family:'A',bkl,bkz,adjL,qz,rAz,rBz,wkl,wkx,wkz,checkPl:bkl,checkPx:0,checkPz:qz});
          }
    }
  }
  return cfgs;
}
function applyA(c) {
  initBoard();
  place(c.bkl,0,c.bkz,'king','black');
  place(c.bkl,0,c.qz,'queen','white');
  place(c.adjL,0,c.rAz,'rook','white');
  place(c.adjL,1,c.rBz,'rook','white');
  place(c.wkl,c.wkx,c.wkz,'king','white');
}

// ── FAMILY B — Edge level corner, rook checks along z ────────────────────────
// King at (bkl,0,bkz). Rook at (bkl,0,rChkz) checks+covers bkz±1.
// Queen+rook on adjL cover escape squares.
function buildB() {
  const cfgs=[];
  for (const bkl of [0,LEVELS-1]) {
    const adjL = bkl===0?1:LEVELS-2;
    for (const bkz of [0,SZ-1]) {
      const lo=bkz===0?2:0, hi=bkz===0?SZ-1:SZ-3;
      for (let rChkz=lo;rChkz<=hi;rChkz++)
        for (let qz=lo;qz<=hi;qz++)
          for (let rBz=lo;rBz<=hi;rBz++) {
            const wkl=MID,wkx=lsz(MID)-1,wkz=SZ-1;
            const keys=new Set([`${bkl},0,${bkz}`,`${bkl},0,${rChkz}`,`${adjL},0,${qz}`,`${adjL},1,${rBz}`,`${wkl},${wkx},${wkz}`]);
            if(keys.size<5) continue;
            cfgs.push({family:'B',bkl,bkz,adjL,rChkz,qz,rBz,wkl,wkx,wkz,checkPl:bkl,checkPx:0,checkPz:rChkz});
          }
    }
  }
  return cfgs;
}
function applyB(c) {
  initBoard();
  place(c.bkl,0,c.bkz,'king','black');
  place(c.bkl,0,c.rChkz,'rook','white');
  place(c.adjL,0,c.qz,'queen','white');
  place(c.adjL,1,c.rBz,'rook','white');
  place(c.wkl,c.wkx,c.wkz,'king','white');
}

// ── FAMILY D — Edge level mid-z, queen checks z, extra rook from adj2L ────────
// King at (bkl,0,bkz) where bkz∈{2,3,4,5}  (non-corner).
// Queen at (bkl,0,qz=bkz+qDir*2) checks along z, covers bkz+qDir (one z-escape).
// Rook C at (adj2L,0,bkz-qDir) covers the OTHER z-escape of king via level-slide.
// Rooks A,B on adjL cover all level+1 escapes.
//
// Key: queen is sole cover for bkz+qDir  → removed in pre-move → black has a move.
function buildD() {
  const cfgs=[];
  for (const bkl of [0,LEVELS-1]) {
    const adjL  = bkl===0?1:LEVELS-2;
    const adj2L = bkl===0?2:LEVELS-3;
    const wkl=MID,wkx=lsz(MID)-1,wkz=SZ-1;
    for (const bkz of [2,3,4,5]) {
      for (const qDir of [+1,-1]) {
        const qz  = bkz + qDir*2;
        const rCz = bkz - qDir;       // rook C covers bkz-qDir (other z-escape)
        if (qz<0||qz>=SZ||rCz<0||rCz>=SZ) continue;
        // rA,rB must cover bkz-1,bkz,bkz+1 on adjL
        // Parametrize rAz,rBz: must not be adjacent to king (|rAz-bkz|≥2)
        for (let rAz=0; rAz<SZ; rAz++) {
          if (Math.abs(rAz-bkz)<2) continue;
          for (let rBz=0; rBz<SZ; rBz++) {
            if (Math.abs(rBz-bkz)<2) continue;
            const keys=new Set([
              `${bkl},0,${bkz}`,
              `${bkl},0,${qz}`,
              `${adj2L},0,${rCz}`,
              `${adjL},0,${rAz}`,
              `${adjL},1,${rBz}`,
              `${wkl},${wkx},${wkz}`
            ]);
            if(keys.size<6) continue;
            cfgs.push({family:'D',bkl,bkz,adjL,adj2L,qz,rCz,rAz,rBz,wkl,wkx,wkz,checkPl:bkl,checkPx:0,checkPz:qz});
          }
        }
      }
    }
  }
  return cfgs;
}
function applyD(c) {
  initBoard();
  place(c.bkl,  0,      c.bkz, 'king',  'black');
  place(c.bkl,  0,      c.qz,  'queen', 'white');
  place(c.adj2L,0,      c.rCz, 'rook',  'white');
  place(c.adjL, 0,      c.rAz, 'rook',  'white');
  place(c.adjL, 1,      c.rBz, 'rook',  'white');
  place(c.wkl,  c.wkx,  c.wkz,'king',  'white');
}

// ── Main ──────────────────────────────────────────────────────────────────────
const PER_FAMILY   = 40;
const TOTAL_TARGET = 100;
const seen = new Set();
function posKey(p) { return p.map(q=>`${q.l}.${q.x}.${q.z}.${q.type[0]}.${q.color[0]}`).sort().join('|'); }
const DIFF = {A:'beginner',B:'intermediate',D:'advanced'};

const FAMILIES = [
  {name:'A', build:buildA, apply:applyA},
  {name:'B', build:buildB, apply:applyB},
  {name:'D', build:buildD, apply:applyD},
];

console.log('\n  🔷  RhombusChess 4D — Puzzle Generator v4');
console.log('  ══════════════════════════════════════════');
console.log(`  Target: ${TOTAL_TARGET} | Families: A B D | Cap: ${PER_FAMILY}/family\n`);

const t0=Date.now();
const buckets={A:[],B:[],D:[]};

for (const fam of FAMILIES) {
  const cfgs=fam.build();
  let verified=0;
  for (const cfg of cfgs) {
    if (buckets[fam.name].length>=PER_FAMILY) break;
    fam.apply(cfg);
    if (!isCheckmate('black')) continue;
    verified++;
    const newPuz = retrograde(cfg.checkPl, cfg.checkPx, cfg.checkPz);
    for (const pz of newPuz) {
      if (buckets[fam.name].length>=PER_FAMILY) break;
      const key=posKey(pz.position);
      if (seen.has(key)) continue;
      seen.add(key);
      buckets[fam.name].push({...pz,family:fam.name,difficulty:DIFF[fam.name]});
    }
  }
  console.log(`  Family ${fam.name}: ${cfgs.length} configs → ${verified} checkmates → ${buckets[fam.name].length} puzzles`);
}

// Interleave A/B/D for variety
const combined=[];
const idx={A:0,B:0,D:0};
while(combined.length<TOTAL_TARGET){
  let added=false;
  for(const f of FAMILIES){
    if(combined.length>=TOTAL_TARGET) break;
    if(idx[f.name]<buckets[f.name].length){combined.push(buckets[f.name][idx[f.name]++]);added=true;}
  }
  if(!added) break;
}

const puzzles=combined.map((p,i)=>({
  id:`mate_in_1_${String(i+1).padStart(3,'0')}`,
  type:'mate-in-1',
  family:p.family,
  difficulty:p.difficulty,
  toMove:'white',
  position:p.position,
  solution:p.solution,
}));

const elapsed=((Date.now()-t0)/1000).toFixed(2);
console.log(`\n  Total: ${puzzles.length} puzzles  (${elapsed}s)`);

const byDiff={};
puzzles.forEach(p=>{byDiff[p.difficulty]=(byDiff[p.difficulty]||0)+1;});
console.log('  Difficulty:',Object.entries(byDiff).map(([d,n])=>`${d}=${n}`).join(', '));

if(!puzzles.length){console.error('\n  ⚠️  No puzzles!');process.exit(1);}

// Sample per family
for(const f of FAMILIES){
  const s=puzzles.find(p=>p.family===f.name);
  if(s){const mv=s.solution[0];const mp=s.position.find(p=>p.l===mv.from.l&&p.x===mv.from.x&&p.z===mv.from.z);console.log(`  Family ${f.name} sample: ${mp?mp.type:'?'} (L${mv.from.l},x${mv.from.x},z${mv.from.z})→(L${mv.to.l},x${mv.to.x},z${mv.to.z})`);}
}

const outPath=path.join(__dirname,'..','www','puzzles.json');
fs.writeFileSync(outPath,JSON.stringify({generated:new Date().toISOString(),engine:'RhombusChess 4D v4',levels:LEVELS,total:puzzles.length,puzzles},null,2));
const kb=Math.round(fs.statSync(outPath).size/1024);
console.log(`\n  📁  Saved → www/puzzles.json  (${kb} KB)\n`);
