<?php
/**
 * Template Name: Ranks & Points
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header(); ?>

<style>
/* ============================================================
   RANKS PAGE — 4D Rhombus Chess
   ============================================================ */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body { background: #020a14; color: #e2e8f0; font-family: 'Inter', sans-serif; overflow-x: hidden; }

/* ---------- STARFIELD ---------- */
#starfield {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
}

/* ---------- PAGE WRAPPER ---------- */
.ranks-page { position: relative; z-index: 1; }

/* ---------- HERO ---------- */
.ranks-hero {
  text-align: center;
  padding: 100px 20px 60px;
  background: linear-gradient(180deg, rgba(0,212,255,0.06) 0%, transparent 100%);
  border-bottom: 1px solid rgba(0,212,255,0.12);
}
.ranks-hero .eyebrow {
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  letter-spacing: 0.4em;
  color: #00d4ff;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.ranks-hero h1 {
  font-family: 'Cinzel', serif;
  font-size: clamp(2.2rem, 5vw, 4rem);
  font-weight: 700;
  background: linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #f5a623 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.15;
  margin-bottom: 20px;
}
.ranks-hero p {
  font-size: 1.1rem;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
}

/* ---------- SECTION LAYOUT ---------- */
.section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 70px 24px;
}
.section-title {
  font-family: 'Cinzel', serif;
  font-size: 1.6rem;
  color: #e2e8f0;
  margin-bottom: 10px;
  text-align: center;
}
.section-title span { color: #00d4ff; }
.section-sub {
  text-align: center;
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 48px;
  letter-spacing: 0.05em;
}

/* ---------- RANK CARDS ---------- */
.ranks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.rank-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 28px 20px 22px;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  cursor: default;
}
.rank-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, var(--accent, #00d4ff) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
}
.rank-card:hover { transform: translateY(-6px); }
.rank-card:hover::before { opacity: 0.08; }
.rank-card:hover { border-color: var(--accent, #00d4ff); box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px var(--accent, #00d4ff); }

/* Glow line at top of card */
.rank-card .glow-bar {
  position: absolute;
  top: 0; left: 20%; right: 20%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent, #00d4ff), transparent);
  border-radius: 2px;
  opacity: 0.6;
}

.rank-icon {
  font-size: 2.8rem;
  margin-bottom: 12px;
  display: block;
  filter: drop-shadow(0 0 10px var(--accent, #00d4ff));
  animation: float 3s ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.rank-name {
  font-family: 'Cinzel', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6px;
  letter-spacing: 0.05em;
}
.rank-points {
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  color: var(--accent, #00d4ff);
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 14px;
}
.rank-desc {
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.6;
}

/* Special styling for top ranks */
.rank-card.legendary {
  background: linear-gradient(135deg, rgba(245,166,35,0.06), rgba(168,85,247,0.06));
  border-color: rgba(245,166,35,0.25);
}
.rank-card.legendary:hover {
  box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 20px rgba(245,166,35,0.15), 0 0 0 1px #f5a623;
}

/* ---------- POINTS BREAKDOWN ---------- */
.points-section { background: rgba(0,212,255,0.025); border-top: 1px solid rgba(0,212,255,0.08); border-bottom: 1px solid rgba(0,212,255,0.08); }

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}
@media(max-width:700px) { .two-col { grid-template-columns: 1fr; } }

.glass-box {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 28px 24px;
}
.glass-box h3 {
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  color: #00d4ff;
  margin-bottom: 20px;
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pts-table { width: 100%; border-collapse: collapse; }
.pts-table tr { border-bottom: 1px solid rgba(255,255,255,0.05); }
.pts-table tr:last-child { border-bottom: none; }
.pts-table td { padding: 11px 6px; font-size: 0.88rem; }
.pts-table td:first-child { color: #cbd5e1; }
.pts-table td:last-child { text-align: right; font-weight: 700; font-family: 'Cinzel', serif; font-size: 0.9rem; }
.pts-table .win  td:last-child { color: #4ade80; }
.pts-table .loss td:last-child { color: #f87171; }
.pts-table .draw td:last-child { color: #94a3b8; }
.pts-table .bonus td:last-child { color: #f5a623; }

.mult-table { width: 100%; border-collapse: collapse; }
.mult-table tr { border-bottom: 1px solid rgba(255,255,255,0.05); }
.mult-table tr:last-child { border-bottom: none; }
.mult-table td { padding: 11px 6px; font-size: 0.88rem; }
.mult-table td:first-child { color: #cbd5e1; }
.mult-table td:last-child { text-align: right; font-weight: 700; color: #a855f7; font-size: 0.9rem; }

/* ---------- CLIMB TIPS ---------- */
.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}
.tip-card {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 24px 20px;
  position: relative;
  overflow: hidden;
}
.tip-card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #a855f7, transparent);
  opacity: 0.4;
}
.tip-num {
  font-family: 'Cinzel', serif;
  font-size: 2rem;
  font-weight: 700;
  color: rgba(168,85,247,0.2);
  line-height: 1;
  margin-bottom: 10px;
}
.tip-card h4 { font-size: 0.95rem; color: #e2e8f0; margin-bottom: 8px; font-weight: 600; }
.tip-card p { font-size: 0.82rem; color: #64748b; line-height: 1.6; }

/* ---------- CTA ---------- */
.ranks-cta {
  text-align: center;
  padding: 70px 24px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.ranks-cta h2 {
  font-family: 'Cinzel', serif;
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  color: #fff;
  margin-bottom: 16px;
}
.ranks-cta p { color: #64748b; margin-bottom: 32px; font-size: 0.95rem; }
.btn-glow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 40px;
  background: linear-gradient(135deg, #00d4ff, #a855f7);
  border: none;
  border-radius: 50px;
  color: #fff;
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 24px rgba(0,212,255,0.3);
}
.btn-glow:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,212,255,0.5); color: #fff; text-decoration: none; }

/* ---------- PROGRESS BAR VISUAL ---------- */
.rank-progress-wrap {
  max-width: 900px;
  margin: 0 auto 64px;
}
.rank-progress-bar {
  display: flex;
  align-items: center;
  gap: 0;
  width: 100%;
  margin: 0 auto 14px;
}
.rank-pip {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  position: relative;
  overflow: hidden;
}
.rank-pip .fill {
  position: absolute;
  inset: 0;
  border-radius: 3px;
  background: var(--accent);
  transform-origin: left;
  animation: fillBar 1.4s cubic-bezier(0.22,1,0.36,1) forwards;
  animation-delay: var(--delay, 0s);
  transform: scaleX(0);
}
@keyframes fillBar { to { transform: scaleX(1); } }
.rank-pip-label {
  text-align: center;
  font-size: 0.65rem;
  color: #475569;
  margin-top: 6px;
  letter-spacing: 0.05em;
}
.rank-pips-row { display: flex; gap: 0; }
.rank-pip-col { flex: 1; padding: 0 2px; }

/* ---------- RESPONSIVE ---------- */
@media (max-width: 600px) {
  .ranks-grid { grid-template-columns: 1fr 1fr; }
  .two-col { grid-template-columns: 1fr; }
  .ranks-hero { padding: 80px 16px 48px; }
}
@media (max-width: 400px) {
  .ranks-grid { grid-template-columns: 1fr; }
}
</style>

<!-- Starfield canvas -->
<canvas id="starfield"></canvas>

<div class="ranks-page">

  <!-- HERO -->
  <section class="ranks-hero">
    <p class="eyebrow">Competitive System</p>
    <h1>Ranks &amp; Points</h1>
    <p>Every match counts. Win games, earn points, and climb through the ranks — from humble Ensign to legendary Grand Master of the 4th Dimension.</p>
  </section>

  <!-- RANK TIERS GRID -->
  <section class="section">
    <h2 class="section-title">The <span>Eight Ranks</span></h2>
    <p class="section-sub">Earn points through victories to rise through the ranks</p>

    <div class="ranks-grid">

      <div class="rank-card" style="--accent:#64748b; --delay:0s;">
        <div class="glow-bar"></div>
        <span class="rank-icon" style="--delay:0.0s;">⚓</span>
        <div class="rank-name">Ensign</div>
        <div class="rank-points">0 – 999 pts</div>
        <div class="rank-desc">Every Grand Master started here. Learn the rules, find your footing across the levels.</div>
      </div>

      <div class="rank-card" style="--accent:#22d3ee; --delay:0.05s;">
        <div class="glow-bar"></div>
        <span class="rank-icon" style="--delay:0.1s;">⭐</span>
        <div class="rank-name">Lieutenant</div>
        <div class="rank-points">1,000 – 2,999 pts</div>
        <div class="rank-desc">You've grasped the multi-level board. Tactics are sharpening and opponents feel it.</div>
      </div>

      <div class="rank-card" style="--accent:#00d4ff; --delay:0.1s;">
        <div class="glow-bar"></div>
        <span class="rank-icon" style="--delay:0.2s;">⭐⭐</span>
        <div class="rank-name">Captain</div>
        <div class="rank-points">3,000 – 5,999 pts</div>
        <div class="rank-desc">A seasoned player commanding multiple levels with confidence and purpose.</div>
      </div>

      <div class="rank-card" style="--accent:#818cf8; --delay:0.15s;">
        <div class="glow-bar"></div>
        <span class="rank-icon" style="--delay:0.3s;">⭐⭐⭐</span>
        <div class="rank-name">Commander</div>
        <div class="rank-points">6,000 – 9,999 pts</div>
        <div class="rank-desc">You orchestrate cross-level attacks. The 4th dimension bends to your strategy.</div>
      </div>

      <div class="rank-card" style="--accent:#a78bfa; --delay:0.2s;">
        <div class="glow-bar"></div>
        <span class="rank-icon" style="--delay:0.4s;">🔱</span>
        <div class="rank-name">Commodore</div>
        <div class="rank-points">10,000 – 14,999 pts</div>
        <div class="rank-desc">Elite-tier play. You see threats six moves ahead across three board levels simultaneously.</div>
      </div>

      <div class="rank-card" style="--accent:#a855f7; --delay:0.25s;">
        <div class="glow-bar"></div>
        <span class="rank-icon" style="--delay:0.5s;">👑</span>
        <div class="rank-name">Admiral</div>
        <div class="rank-points">15,000 – 24,999 pts</div>
        <div class="rank-desc">Top 5% of all players. Your moves are studied by those climbing beneath you.</div>
      </div>

      <div class="rank-card" style="--accent:#f5a623; --delay:0.3s;">
        <div class="glow-bar" style="background: linear-gradient(90deg, transparent, #f5a623, transparent);"></div>
        <span class="rank-icon" style="--delay:0.6s;">👑⚡</span>
        <div class="rank-name">Fleet Admiral</div>
        <div class="rank-points">25,000 – 49,999 pts</div>
        <div class="rank-desc">Feared across all levels. A single match against you is a lesson in dimensional chess mastery.</div>
      </div>

      <div class="rank-card legendary" style="--accent:#f5a623; --delay:0.35s;">
        <div class="glow-bar" style="background: linear-gradient(90deg, transparent, #f5a623, transparent);"></div>
        <span class="rank-icon" style="--delay:0.7s; filter:drop-shadow(0 0 16px #f5a623);">🏆</span>
        <div class="rank-name">Grand Master</div>
        <div class="rank-points">50,000+ pts</div>
        <div class="rank-desc">The pinnacle. You are the 4th Dimension. Fewer than 1% of players ever reach this rank.</div>
      </div>

    </div>
  </section>

  <!-- POINTS BREAKDOWN -->
  <section class="points-section">
    <div class="section">
      <h2 class="section-title">How <span>Points</span> Work</h2>
      <p class="section-sub">Points are awarded instantly at the end of every match</p>

      <div class="two-col">

        <div class="glass-box">
          <h3>⚔️ Base Points per Match</h3>
          <table class="pts-table">
            <tr class="win">
              <td>Victory</td>
              <td>+100 pts</td>
            </tr>
            <tr class="loss">
              <td>Defeat</td>
              <td>−20 pts</td>
            </tr>
            <tr class="draw">
              <td>Draw / Stalemate</td>
              <td>+10 pts</td>
            </tr>
            <tr class="loss">
              <td>Resign mid-game</td>
              <td>−30 pts</td>
            </tr>
            <tr class="loss">
              <td>Disconnect / Abandon</td>
              <td>−30 pts</td>
            </tr>
            <tr class="bonus">
              <td>First win of the day</td>
              <td>+50 bonus</td>
            </tr>
          </table>
          <p style="margin-top:16px; font-size:0.78rem; color:#475569; line-height:1.5;">
            ℹ️ Your total points can never drop below 0. No matter how many losses you take as an Ensign, you stay at 0 — not in the negatives.
          </p>
        </div>

        <div class="glass-box">
          <h3>✨ Score Multipliers</h3>
          <table class="mult-table">
            <tr>
              <td>Playing on 15-level board</td>
              <td>×1.5</td>
            </tr>
            <tr>
              <td>Defeating a higher-ranked player</td>
              <td>×1.3</td>
            </tr>
            <tr>
              <td>Winning in under 30 moves</td>
              <td>×1.2</td>
            </tr>
            <tr>
              <td>Win streak (3+ games)</td>
              <td>×1.1</td>
            </tr>
            <tr>
              <td>Defeating AI on Hard mode</td>
              <td>×0.5 (PvE only)</td>
            </tr>
          </table>
          <p style="margin-top:16px; font-size:0.78rem; color:#475569; line-height:1.5;">
            ℹ️ Multipliers stack. For example: beating a higher-ranked player in a 15-level game gives ×1.5 × ×1.3 = ×1.95 — nearly double points.
          </p>
        </div>

      </div>
    </div>
  </section>

  <!-- TIPS TO CLIMB -->
  <section class="section">
    <h2 class="section-title">Tips to <span>Climb Faster</span></h2>
    <p class="section-sub">Strategy for the leaderboard, not just the board</p>

    <div class="tips-grid">

      <div class="tip-card">
        <div class="tip-num">01</div>
        <h4>Play the 15-Level Board</h4>
        <p>Every win on the 15-level board earns 1.5× points. It's harder, but the rewards scale with your ambition.</p>
      </div>

      <div class="tip-card">
        <div class="tip-num">02</div>
        <h4>Win Your Daily First Game</h4>
        <p>The first victory each day grants +50 bonus points on top of the match reward. Log in daily and make it count.</p>
      </div>

      <div class="tip-card">
        <div class="tip-num">03</div>
        <h4>Target Higher-Ranked Opponents</h4>
        <p>Seek out players above your rank. The ×1.3 bonus for an upset victory can rocket you up the leaderboard.</p>
      </div>

      <div class="tip-card">
        <div class="tip-num">04</div>
        <h4>Never Resign — Play to the End</h4>
        <p>Resigning costs −30 points. Even if you lose, you only take −20. A comeback might be one level-shift away.</p>
      </div>

      <div class="tip-card">
        <div class="tip-num">05</div>
        <h4>Build a Win Streak</h4>
        <p>Three or more consecutive wins activates the ×1.1 streak multiplier. Momentum pays — stay consistent.</p>
      </div>

      <div class="tip-card">
        <div class="tip-num">06</div>
        <h4>Master Level Transitions</h4>
        <p>Most players only think in 2D. Controlling piece movement between board levels creates attacks your opponent cannot see coming.</p>
      </div>

    </div>
  </section>

  <!-- RANK PROGRESS VISUAL -->
  <section class="section" style="padding-top:0;">
    <h2 class="section-title" style="margin-bottom:40px;">The <span>Road to Grand Master</span></h2>
    <div class="rank-progress-wrap">
      <div class="rank-pips-row">
        <div class="rank-pip-col"><div class="rank-pip" style="--accent:#64748b;"><div class="fill" style="--delay:0.1s;"></div></div><div class="rank-pip-label">Ensign<br>0</div></div>
        <div class="rank-pip-col"><div class="rank-pip" style="--accent:#22d3ee;"><div class="fill" style="--delay:0.2s;"></div></div><div class="rank-pip-label">Lieutenant<br>1K</div></div>
        <div class="rank-pip-col"><div class="rank-pip" style="--accent:#00d4ff;"><div class="fill" style="--delay:0.3s;"></div></div><div class="rank-pip-label">Captain<br>3K</div></div>
        <div class="rank-pip-col"><div class="rank-pip" style="--accent:#818cf8;"><div class="fill" style="--delay:0.4s;"></div></div><div class="rank-pip-label">Commander<br>6K</div></div>
        <div class="rank-pip-col"><div class="rank-pip" style="--accent:#a78bfa;"><div class="fill" style="--delay:0.5s;"></div></div><div class="rank-pip-label">Commodore<br>10K</div></div>
        <div class="rank-pip-col"><div class="rank-pip" style="--accent:#a855f7;"><div class="fill" style="--delay:0.6s;"></div></div><div class="rank-pip-label">Admiral<br>15K</div></div>
        <div class="rank-pip-col"><div class="rank-pip" style="--accent:#f5a623;"><div class="fill" style="--delay:0.7s;"></div></div><div class="rank-pip-label">Fleet Adm.<br>25K</div></div>
        <div class="rank-pip-col"><div class="rank-pip" style="--accent:#f5a623; background:rgba(245,166,35,0.15);"><div class="fill" style="--delay:0.8s;"></div></div><div class="rank-pip-label">Grand Master<br>50K</div></div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="ranks-cta">
    <h2>Ready to Start Climbing?</h2>
    <p>Download the game, create your account, and play your first ranked match today.</p>
    <a href="/download/" class="btn-glow">🎮 Download &amp; Play</a>
  </section>

</div><!-- .ranks-page -->

<script>
/* ========= STARFIELD ========= */
(function(){
  var c = document.getElementById('starfield');
  var ctx = c.getContext('2d');
  var stars = [];
  function resize(){
    c.width = window.innerWidth;
    c.height = document.body.scrollHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  for(var i=0;i<200;i++){
    stars.push({
      x: Math.random()*c.width,
      y: Math.random()*c.height,
      r: Math.random()*1.2+0.2,
      o: Math.random()*0.6+0.1,
      speed: Math.random()*0.003+0.001
    });
  }
  var t = 0;
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    t += 0.016;
    stars.forEach(function(s){
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,'+(s.o*(0.6+0.4*Math.sin(t*s.speed*100)))+')';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ========= INTERSECTION OBSERVER for bar animations ========= */
(function(){
  var fills = document.querySelectorAll('.rank-pip .fill');
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.style.animationPlayState = 'running';
        obs.unobserve(e.target);
      }
    });
  }, {threshold:0.3});
  fills.forEach(function(f){
    f.style.animationPlayState = 'paused';
    obs.observe(f);
  });

  /* Card entrance animations */
  var cards = document.querySelectorAll('.rank-card, .glass-box, .tip-card');
  var cardObs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        cardObs.unobserve(e.target);
      }
    });
  },{threshold:0.1});
  cards.forEach(function(c){
    c.style.opacity = '0';
    c.style.transform = 'translateY(20px)';
    c.style.transition = 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease, border-color 0.3s ease';
    cardObs.observe(c);
  });
})();
</script>

<?php get_footer(); ?>
