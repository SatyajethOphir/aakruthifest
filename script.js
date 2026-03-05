// script.js — Aakruthi 2K26

// ─── BACKGROUND: Deep Space Galaxy Environment ───────────────────
(function initBackground() {
  const isMobile =
    window.matchMedia("(max-width: 768px)").matches ||
    navigator.maxTouchPoints > 0;

  // Skip canvas background entirely on mobile for performance
  if (isMobile) return;

  const canvas = document.createElement("canvas");
  canvas.id = "particleCanvas";
  Object.assign(canvas.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "0",
  });
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext("2d", { alpha: true });
  let W = (canvas.width = window.innerWidth);
  let H = (canvas.height = window.innerHeight);

  let mouseX = W / 2;
  let mouseY = H / 2;
  let targetMouseX = W / 2;
  let targetMouseY = H / 2;

  window.addEventListener(
    "mousemove",
    (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    },
    { passive: true },
  );

  const STAR_COUNT = 340;
  const stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const mag = Math.random();
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: mag * 1.1 + 0.15,
      alpha: mag * 0.55 + 0.08,
      parallax: mag * 0.018 + 0.002,
      twinkleSpeed: Math.random() * 0.025 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
      color: (() => {
        const roll = Math.random();
        if (roll < 0.55) return "#ffffff";
        if (roll < 0.7) return "#b0d4ff";
        if (roll < 0.82) return "#ffd8a8";
        if (roll < 0.91) return "#ffb3c6";
        return "#d0aaff";
      })(),
    });
  }

  const NEBULA_COUNT = 5;
  const nebulae = [];
  const NEBULA_PALETTES = [
    ["#ff008888", "#b800ff44", "#00cfff22"],
    ["#b800ff66", "#ff008844", "#0044aa22"],
    ["#00cfff55", "#3dff2222", "#b800ff33"],
    ["#ff5c0044", "#ff008866", "#b800ff22"],
    ["#3dff2233", "#00cfff44", "#ffffff11"],
  ];
  for (let i = 0; i < NEBULA_COUNT; i++) {
    const palette = NEBULA_PALETTES[i % NEBULA_PALETTES.length];
    nebulae.push({
      x: Math.random() * W,
      y: Math.random() * H,
      rx: (Math.random() * 0.22 + 0.14) * W,
      ry: (Math.random() * 0.18 + 0.1) * H,
      colors: palette,
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.04,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.0004,
      parallax: Math.random() * 0.025 + 0.008,
      alpha: Math.random() * 0.22 + 0.1,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.006 + 0.002,
    });
  }

  const galaxyCore = {
    x: W * 0.5,
    y: H * 0.45,
    radiusX: W * 0.32,
    radiusY: H * 0.07,
    rotation: -0.22,
    alpha: 0.1,
  };

  const PARTICLE_COLORS = [
    "#0077cc", "#c200b8", "#7700cc", "#00cfff",
    "#ff0088", "#b800ff", "#3dff22", "#ffffff",
  ];
  const PARTICLE_COUNT = 55;
  const CONNECT_DIST = 120;
  const CONNECT_SQ = CONNECT_DIST * CONNECT_DIST;

  class EnergyParticle {
    constructor(init = false) {
      this.reset(init);
    }
    reset(init = false) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : Math.random() < 0.5 ? -10 : H + 10;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r = Math.random() * 1.8 + 0.5;
      this.color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
      this.alpha = Math.random() * 0.5 + 0.15;
      this.glowSize = Math.random() * 8 + 4;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -20) this.x = W + 20;
      if (this.x > W + 20) this.x = -20;
      if (this.y < -20) this.y = H + 20;
      if (this.y > H + 20) this.y = -20;
    }
    draw() {
      ctx.globalAlpha = this.alpha;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = this.glowSize;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const energyParticles = Array.from(
    { length: PARTICLE_COUNT },
    () => new EnergyParticle(true),
  );

  const MAX_SHOOTERS = 2;
  class ShootingStar {
    constructor() {
      this.spawn();
    }
    spawn() {
      const edge = Math.random();
      if (edge < 0.6) {
        this.x = Math.random() * W;
        this.y = -10;
      } else {
        this.x = -10;
        this.y = Math.random() * H * 0.6;
      }
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 5 + 6;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.len = Math.random() * 90 + 60;
      this.alpha = 0;
      this.maxAlpha = Math.random() * 0.6 + 0.3;
      this.life = 0;
      this.maxLife = Math.random() * 60 + 50;
      this.color = Math.random() < 0.7 ? "#ffffff" : "#00cfff";
      this.active = true;
      this.width = Math.random() * 1.2 + 0.4;
    }
    update() {
      if (!this.active) return;
      this.life++;
      const t = this.life / this.maxLife;
      this.alpha =
        t < 0.2
          ? (t / 0.2) * this.maxAlpha
          : this.maxAlpha * (1 - (t - 0.2) / 0.8);
      this.x += this.vx;
      this.y += this.vy;
      if (this.life >= this.maxLife || this.x > W + 50 || this.y > H + 50)
        this.active = false;
    }
    draw() {
      if (!this.active || this.alpha <= 0) return;
      const tailX = this.x - this.vx * (this.len / Math.hypot(this.vx, this.vy));
      const tailY = this.y - this.vy * (this.len / Math.hypot(this.vx, this.vy));
      const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(0.7, `rgba(255,255,255,${this.alpha * 0.4})`);
      grad.addColorStop(
        1,
        this.color === "#ffffff"
          ? `rgba(255,255,255,${this.alpha})`
          : `rgba(0,207,255,${this.alpha})`,
      );
      ctx.globalAlpha = 1;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = grad;
      ctx.lineWidth = this.width;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const shooters = Array.from({ length: MAX_SHOOTERS }, () => {
    const s = new ShootingStar();
    s.active = false;
    return s;
  });
  let shooterTimer = 0;
  const SHOOTER_INTERVAL = 280;

  const DUST_COUNT = 22;
  const dust = [];
  for (let i = 0; i < DUST_COUNT; i++) {
    dust.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.08,
      r: Math.random() * 2.5 + 1.0,
      alpha: Math.random() * 0.12 + 0.02,
      color: "#b0c8ff",
    });
  }

  let frame = 0;

  function drawGalaxyCore(px, py) {
    ctx.save();
    const cx = galaxyCore.x + px * 0.015,
      cy = galaxyCore.y + py * 0.015;
    ctx.translate(cx, cy);
    ctx.rotate(galaxyCore.rotation);
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxyCore.radiusX);
    halo.addColorStop(0.0, `rgba(180,120,255,${galaxyCore.alpha * 0.9})`);
    halo.addColorStop(0.25, `rgba(100,60,200,${galaxyCore.alpha * 0.7})`);
    halo.addColorStop(0.55, `rgba(40,10,80,${galaxyCore.alpha * 0.4})`);
    halo.addColorStop(1.0, "rgba(0,0,0,0)");
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.scale(1, galaxyCore.radiusY / galaxyCore.radiusX);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, galaxyCore.radiusX, 0, Math.PI * 2);
    ctx.fill();
    ctx.scale(1, galaxyCore.radiusX / galaxyCore.radiusY);
    const nucleus = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxyCore.radiusX * 0.12);
    nucleus.addColorStop(0, `rgba(255,230,255,${galaxyCore.alpha * 3})`);
    nucleus.addColorStop(0.4, `rgba(200,140,255,${galaxyCore.alpha * 1.5})`);
    nucleus.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = nucleus;
    ctx.beginPath();
    ctx.arc(0, 0, galaxyCore.radiusX * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawNebulae(px, py) {
    for (const n of nebulae) {
      n.x += n.vx;
      n.y += n.vy;
      n.rotation += n.rotSpeed;
      n.pulsePhase += n.pulseSpeed;
      if (n.x < -n.rx) n.x = W + n.rx;
      if (n.x > W + n.rx) n.x = -n.rx;
      if (n.y < -n.ry) n.y = H + n.ry;
      if (n.y > H + n.ry) n.y = -n.ry;
      const pulse = 1 + Math.sin(n.pulsePhase) * 0.08;
      ctx.save();
      ctx.translate(n.x + px * n.parallax, n.y + py * n.parallax);
      ctx.rotate(n.rotation);
      ctx.scale(1, n.ry / n.rx);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, n.rx * pulse);
      for (let ci = 0; ci < n.colors.length; ci++)
        grad.addColorStop((ci / (n.colors.length - 1)) * 0.7, n.colors[ci]);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = n.alpha * pulse;
      ctx.shadowBlur = 0;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, n.rx * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawStars(px, py) {
    for (const s of stars) {
      s.twinklePhase += s.twinkleSpeed;
      const twinkle = 0.75 + Math.sin(s.twinklePhase) * 0.25;
      ctx.globalAlpha = s.alpha * twinkle;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = s.r > 0.8 ? 5 : 2;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(
        s.x + px * s.parallax,
        s.y + py * s.parallax,
        s.r * (0.85 + twinkle * 0.15),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  function drawDust(px, py) {
    for (const d of dust) {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < -20) d.x = W + 20;
      if (d.x > W + 20) d.x = -20;
      if (d.y < -20) d.y = H + 20;
      if (d.y > H + 20) d.y = -20;
      ctx.globalAlpha = d.alpha;
      ctx.shadowBlur = 4;
      ctx.shadowColor = d.color;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(d.x + px * 0.005, d.y + py * 0.005, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawEnergyConnections() {
    ctx.lineWidth = 0.6;
    for (let i = 0; i < energyParticles.length; i++) {
      for (let j = i + 1; j < energyParticles.length; j++) {
        const a = energyParticles[i], b = energyParticles[j];
        const dx = a.x - b.x, dy = a.y - b.y, dSq = dx * dx + dy * dy;
        if (dSq < CONNECT_SQ) {
          const t = 1 - Math.sqrt(dSq) / CONNECT_DIST;
          ctx.globalAlpha = t * t * 0.22;
          ctx.strokeStyle = a.color;
          ctx.shadowColor = a.color;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  let animId;
  function loop() {
    frame++;
    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;
    const px = mouseX - W / 2, py = mouseY - H / 2;
    ctx.clearRect(0, 0, W, H);
    ctx.shadowBlur = 0;
    drawGalaxyCore(px, py);
    drawNebulae(px, py);
    drawStars(px, py);
    drawDust(px, py);
    drawEnergyConnections();
    ctx.shadowBlur = 0;
    energyParticles.forEach((p) => { p.update(); p.draw(); });
    shooterTimer++;
    if (shooterTimer >= SHOOTER_INTERVAL) {
      for (const s of shooters) {
        if (!s.active) { s.spawn(); break; }
      }
      shooterTimer = 0;
    }
    ctx.shadowBlur = 0;
    for (const s of shooters) { s.update(); s.draw(); }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    animId = requestAnimationFrame(loop);
  }

  let resizeTimer;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        mouseX = targetMouseX = W / 2;
        mouseY = targetMouseY = H / 2;
        galaxyCore.x = W * 0.5;
        galaxyCore.y = H * 0.45;
        galaxyCore.radiusX = W * 0.32;
        galaxyCore.radiusY = H * 0.07;
      }, 200);
    },
    { passive: true },
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else loop();
  });

  loop();
})();

// ═══════════════════════════════════════════════════════════════════
//  3D CARD POP — Desktop only (mouse-tracked tilt)
// ═══════════════════════════════════════════════════════════════════
(function init3DCards() {
  // Skip 3D tilt entirely on touch/mobile devices
  if (window.matchMedia("(max-width: 768px)").matches || navigator.maxTouchPoints > 0) return;

  const css = `
    .events-grid {
      perspective: 1100px;
      perspective-origin: 50% 40%;
    }
    .event-card {
      transform-style: preserve-3d;
      transition: box-shadow 0.35s ease, border-color 0.35s ease;
      position: relative;
      overflow: visible !important;
      will-change: transform;
    }
    .event-card .card-face-overlay {
      position: absolute; inset: 0; z-index: 8; pointer-events: none;
      background: repeating-linear-gradient(
        0deg, transparent, transparent 3px,
        rgba(0,245,255,0.018) 3px, rgba(0,245,255,0.018) 4px
      );
      opacity: 0; transition: opacity 0.3s;
    }
    .event-card:hover .card-face-overlay { opacity: 1; }
    .event-card .card-glint {
      position: absolute; inset: 0; z-index: 9; pointer-events: none;
      background: linear-gradient(
        125deg,
        transparent 0%, transparent 30%,
        rgba(0,245,255,0.07) 47%, rgba(255,255,255,0.13) 50%, rgba(0,245,255,0.05) 53%,
        transparent 70%, transparent 100%
      );
      background-size: 250% 100%; background-position: 200% 0;
      opacity: 0; transition: opacity 0.2s, background-position 0.55s ease;
    }
    .event-card:hover .card-glint { opacity: 1; background-position: -50% 0; }
    .card-wall {
      position: absolute; pointer-events: none; opacity: 0; z-index: -1;
      transform-style: preserve-3d; transition: opacity 0.08s linear; overflow: hidden;
    }
    .card-wall-right {
      top: 0; right: 0; height: 100%; width: 44px;
      transform-origin: right center; transform: rotateY(90deg);
      background: linear-gradient(to right, rgba(0,245,255,0.0) 0%, rgba(0,245,255,0.12) 50%, rgba(0,245,255,0.30) 100%);
      border-right: 2px solid rgba(0,245,255,0.95);
      box-shadow: inset -10px 0 24px rgba(0,245,255,0.25), 6px 0 40px rgba(0,245,255,0.55);
    }
    .card-wall-left {
      top: 0; left: 0; height: 100%; width: 44px;
      transform-origin: left center; transform: rotateY(-90deg);
      background: linear-gradient(to left, rgba(255,0,85,0.0) 0%, rgba(255,0,85,0.12) 50%, rgba(255,0,85,0.28) 100%);
      border-left: 2px solid rgba(255,0,85,0.9);
      box-shadow: inset 10px 0 24px rgba(255,0,85,0.22), -6px 0 40px rgba(255,0,85,0.5);
    }
    .card-wall-bottom {
      bottom: 0; left: 0; width: 100%; height: 44px;
      transform-origin: center bottom; transform: rotateX(-90deg);
      background: linear-gradient(to bottom, rgba(232,255,0,0.0) 0%, rgba(232,255,0,0.12) 50%, rgba(232,255,0,0.28) 100%);
      border-bottom: 2px solid rgba(232,255,0,0.88);
      box-shadow: inset 0 10px 24px rgba(232,255,0,0.18), 0 8px 40px rgba(232,255,0,0.45);
    }
    .card-wall-top {
      top: 0; left: 0; width: 100%; height: 44px;
      transform-origin: center top; transform: rotateX(90deg);
      background: linear-gradient(to top, rgba(0,245,255,0.0) 0%, rgba(0,245,255,0.08) 60%, rgba(0,245,255,0.18) 100%);
      border-top: 1px solid rgba(0,245,255,0.5);
      box-shadow: inset 0 -6px 18px rgba(0,245,255,0.12);
    }
    .card-corner-el {
      position: absolute; width: 16px; height: 16px;
      border-color: var(--cyan, #00f5ff); border-style: solid;
      opacity: 0; z-index: 10; pointer-events: none;
      transition: opacity 0.2s, border-color 0.4s, box-shadow 0.4s;
    }
    .event-card:hover .card-corner-el {
      opacity: 1;
      box-shadow: 0 0 8px #00f5ff, 0 0 22px rgba(0,245,255,0.6);
      animation: ccPulse 1.1s ease infinite;
    }
    .card-corner-el.cc-tl { top:6px; left:6px; border-width:2px 0 0 2px; }
    .card-corner-el.cc-tr { top:6px; right:6px; border-width:2px 2px 0 0; animation-delay:0.55s !important; }
    .card-corner-el.cc-bl { bottom:6px; left:6px; border-width:0 0 2px 2px; animation-delay:0.28s !important; }
    .card-corner-el.cc-br { bottom:6px; right:6px; border-width:0 2px 2px 0; animation-delay:0.82s !important; }
    @keyframes ccPulse {
      0%,100% { border-color:#00f5ff; box-shadow:0 0 8px #00f5ff, 0 0 22px rgba(0,245,255,0.6); }
      50%      { border-color:#ff0055; box-shadow:0 0 8px #ff0055, 0 0 22px rgba(255,0,85,0.6); }
    }
    .event-card:hover {
      border-color: rgba(0,245,255,0.75) !important;
      box-shadow:
        0 0 0 1px rgba(0,245,255,0.8),
        0 32px 80px rgba(0,0,0,0.88),
        0 0 50px rgba(0,245,255,0.28),
        0 0 90px rgba(255,0,85,0.12);
    }
    .event-card:hover .event-name {
      color: #00f5ff;
      text-shadow: 0 0 8px #00f5ff, 0 0 22px rgba(0,245,255,0.6), 0 0 55px rgba(0,245,255,0.25);
    }
    .event-card:hover .event-img {
      filter: saturate(1.3) brightness(1.08) hue-rotate(0deg);
      transform: scale(1.04);
    }
  `;
  const styleTag = document.createElement("style");
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  function buildCard(card) {
    const overlay = document.createElement("div");
    overlay.className = "card-face-overlay";
    card.appendChild(overlay);

    const glint = document.createElement("div");
    glint.className = "card-glint";
    card.appendChild(glint);

    ["right", "left", "bottom", "top"].forEach((side) => {
      const wall = document.createElement("div");
      wall.className = `card-wall card-wall-${side}`;
      card.appendChild(wall);
    });

    ["tl", "tr", "bl", "br"].forEach((pos) => {
      const c = document.createElement("div");
      c.className = `card-corner-el cc-${pos}`;
      card.appendChild(c);
    });
  }

  const TILT = 15;
  const LIFT = 42;

  function attachTilt(card) {
    let isHover = false;
    let tRX = 0, tRY = 0;
    let cRX = 0, cRY = 0;
    let raf = null;

    const walls = {
      right:  card.querySelector(".card-wall-right"),
      left:   card.querySelector(".card-wall-left"),
      bottom: card.querySelector(".card-wall-bottom"),
      top:    card.querySelector(".card-wall-top"),
    };

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tick() {
      cRX = lerp(cRX, tRX, 0.11);
      cRY = lerp(cRY, tRY, 0.11);

      const tz = isHover ? LIFT : 0;
      const scale = isHover ? 1.03 : 1.0;
      card.style.transform = `rotateX(${cRX.toFixed(3)}deg) rotateY(${cRY.toFixed(3)}deg) translateZ(${tz}px) scale(${scale})`;

      const ryN = cRY / TILT;
      const rxN = cRX / TILT;
      const minVis = isHover ? 0.08 : 0;

      walls.right.style.opacity  = Math.max(minVis, -ryN * 0.95).toFixed(3);
      walls.left.style.opacity   = Math.max(minVis,  ryN * 0.95).toFixed(3);
      walls.bottom.style.opacity = Math.max(minVis,  rxN * 0.95).toFixed(3);
      walls.top.style.opacity    = Math.max(minVis, -rxN * 0.95).toFixed(3);

      const stillMoving =
        Math.abs(cRX - tRX) > 0.02 ||
        Math.abs(cRY - tRY) > 0.02 ||
        isHover;

      if (stillMoving) {
        raf = requestAnimationFrame(tick);
      } else {
        card.style.transform = "";
        walls.right.style.opacity  = "0";
        walls.left.style.opacity   = "0";
        walls.bottom.style.opacity = "0";
        walls.top.style.opacity    = "0";
        raf = null;
      }
    }

    card.addEventListener("mousemove", (e) => {
      isHover = true;
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / (r.width / 2);
      const dy = (e.clientY - cy) / (r.height / 2);
      tRX = -dy * TILT;
      tRY = dx * TILT;
      if (!raf) raf = requestAnimationFrame(tick);
    });

    card.addEventListener("mouseenter", () => {
      isHover = true;
      if (!raf) raf = requestAnimationFrame(tick);
    });

    card.addEventListener("mouseleave", () => {
      isHover = false;
      tRX = 0;
      tRY = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    });
  }

  function initAll() {
    document.querySelectorAll(".event-card").forEach((card) => {
      buildCard(card);
      attachTilt(card);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();

// ─── MAIN DOMContentLoaded ────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const isMobile =
    window.matchMedia("(max-width: 768px)").matches ||
    navigator.maxTouchPoints > 0;

  // ─── LOADER ──────────────────────────────────────
  const loader = document.getElementById("loader");
  if (loader) {
    setTimeout(() => {
      loader.classList.add("hidden");
      triggerReveal();
    }, 1400);
  }

  // ─── CUSTOM CURSOR (desktop only) ────────────────
  const dot  = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");

  if (dot && ring) {
    if (isMobile) {
      // Hide cursor elements completely on mobile
      dot.style.display  = "none";
      ring.style.display = "none";
    } else {
      let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

      document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + "px";
        dot.style.top  = mouseY + "px";
      }, { passive: true });

      function animateRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        ring.style.left = ringX + "px";
        ring.style.top  = ringY + "px";
        requestAnimationFrame(animateRing);
      }
      animateRing();

      document
        .querySelectorAll("a, button, .event-card, .faq-question, .contact-btn, .filter-btn, .mem-item")
        .forEach((el) => {
          el.addEventListener("mouseenter", () => ring.classList.add("hover"),    { passive: true });
          el.addEventListener("mouseleave", () => ring.classList.remove("hover"), { passive: true });
        });

      document.addEventListener("mouseleave", () => {
        dot.style.opacity  = "0";
        ring.style.opacity = "0";
      });
      document.addEventListener("mouseenter", () => {
        dot.style.opacity  = "1";
        ring.style.opacity = "1";
      });
    }
  }

  // ─── HAMBURGER ───────────────────────────────────
  const hamburger  = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      const isOpen = hamburger.classList.toggle("active");
      mobileMenu.classList.toggle("active", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        mobileMenu.classList.remove("active");
        document.body.style.overflow = "";
      });
    });
    mobileMenu.addEventListener("click", (e) => {
      if (e.target === mobileMenu) {
        hamburger.classList.remove("active");
        mobileMenu.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }

  // ─── COUNTDOWN ───────────────────────────────────
  const targetDate = new Date("2026-03-12T09:00:00").getTime();
  const daysEl  = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minEl   = document.getElementById("cd-min");
  const secEl   = document.getElementById("cd-sec");

  if (daysEl) {
    function updateCountdown() {
      const diff = targetDate - Date.now();
      if (diff <= 0) {
        daysEl.textContent = hoursEl.textContent = minEl.textContent = secEl.textContent = "00";
        return;
      }
      daysEl.textContent  = String(Math.floor(diff / 86400000)).padStart(2, "0");
      hoursEl.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0");
      minEl.textContent   = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      secEl.textContent   = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ─── SCROLL REVEAL ───────────────────────────────
  function triggerReveal() {
    const revealEls = document.querySelectorAll(".reveal");
    if (!revealEls.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const siblings = entry.target.parentElement?.querySelectorAll(".reveal");
            let idx = 0;
            if (siblings) siblings.forEach((el, j) => { if (el === entry.target) idx = j; });
            setTimeout(() => entry.target.classList.add("visible"), idx * 80);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  setTimeout(() => {
    document.querySelectorAll("#hero .reveal").forEach((el, i) => {
      setTimeout(() => el.classList.add("visible"), i * 150 + 300);
    });
  }, 1200);

  // ─── GLITCH (desktop only — saves CPU on mobile) ──
  if (!isMobile) {
    document.querySelectorAll(".glitch").forEach((el) => {
      setInterval(
        () => {
          el.style.animation = "none";
          setTimeout(() => { el.style.animation = ""; }, 50);
        },
        Math.random() * 8000 + 4000,
      );
    });
  }

  // ════════════════════════════════════════════════════
  //  MEMORIES PAGE
  // ════════════════════════════════════════════════════
  const memoryWall = document.getElementById("memoryWall");
  if (!memoryWall) return;

  const cols         = Array.from(memoryWall.querySelectorAll(".mem-col"));
  const btnPlayPause = document.getElementById("btnPlayPause");
  const speedSlider  = document.getElementById("speedSlider");
  const speedValEl   = document.getElementById("speedVal");
  const btnDefault   = document.getElementById("btnDefault");
  const btnReverse   = document.getElementById("btnReverse");
  const galStatus    = document.getElementById("galStatus");

  memoryWall.querySelectorAll(".mem-item").forEach((item) => {
    const img = item.querySelector("img");
    if (!img) return;

    function onLoaded() { img.classList.add("img-loaded"); item.classList.add("img-done"); }
    function onBroken() { item.classList.add("img-broken", "img-done"); }

    if (img.complete) {
      if (img.naturalWidth > 0) onLoaded(); else onBroken();
    } else {
      img.addEventListener("load",  onLoaded, { once: true });
      img.addEventListener("error", onBroken, { once: true });
    }

    // Pause-on-hover only on desktop
    if (!isMobile) {
      item.addEventListener("mouseenter", () => {
        if (!paused) item.closest(".mem-col").style.animationPlayState = "paused";
      }, { passive: true });
      item.addEventListener("mouseleave", () => {
        if (!paused) item.closest(".mem-col").style.animationPlayState = "running";
      }, { passive: true });
    }

    item.addEventListener("click", () => {
      if (!item.classList.contains("img-broken")) openLightbox(img.src);
    });
  });

  let paused = false, speed = 1, reversed = false;
  const origClass = cols.map((c) =>
    c.classList.contains("up2") ? "up2" : c.classList.contains("down") ? "down" : "up",
  );
  const reverseOf = { up: "down", down: "up", up2: "down" };
  const baseDur = cols.map((c) => parseFloat(c.dataset.dur) || 30);

  function setDuration(col, i) { col.style.animationDuration = baseDur[i] / speed + "s"; }
  cols.forEach((col, i) => setDuration(col, i));

  function setPaused(v) {
    paused = v;
    memoryWall.classList.toggle("gallery-paused", paused);
    if (paused) {
      if (btnPlayPause) { btnPlayPause.textContent = "▶"; btnPlayPause.classList.add("paused"); }
      if (galStatus)    { galStatus.textContent = "⏸ PAUSED"; galStatus.classList.add("is-paused"); }
    } else {
      if (btnPlayPause) { btnPlayPause.textContent = "⏸"; btnPlayPause.classList.remove("paused"); }
      if (galStatus)    { galStatus.textContent = "● LIVE"; galStatus.classList.remove("is-paused"); }
      cols.forEach((c) => { c.style.animationPlayState = "running"; });
    }
  }

  if (btnPlayPause) btnPlayPause.addEventListener("click", () => setPaused(!paused));

  function applySpeed(s) {
    speed = s;
    if (speedValEl) speedValEl.textContent = s + "×";
    cols.forEach((c, i) => setDuration(c, i));
  }
  if (speedSlider) speedSlider.addEventListener("input", () => applySpeed(parseFloat(speedSlider.value)));

  function setDirection(rev) {
    reversed = rev;
    if (btnDefault) btnDefault.classList.toggle("active", !rev);
    if (btnReverse) btnReverse.classList.toggle("active", rev);
    cols.forEach((col, i) => {
      const target = rev ? reverseOf[origClass[i]] : origClass[i];
      col.classList.remove("up", "down", "up2");
      col.classList.add(target);
      setDuration(col, i);
    });
  }
  if (btnDefault) btnDefault.addEventListener("click", () => setDirection(false));
  if (btnReverse) btnReverse.addEventListener("click", () => setDirection(true));

  // Keyboard shortcuts — desktop only
  if (!isMobile) {
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.code === "Space") { e.preventDefault(); setPaused(!paused); }
      if (e.code === "ArrowRight") {
        const n = Math.min(3, parseFloat(speedSlider.value) + 0.25);
        speedSlider.value = n; applySpeed(n);
      }
      if (e.code === "ArrowLeft") {
        const n = Math.max(0.25, parseFloat(speedSlider.value) - 0.25);
        speedSlider.value = n; applySpeed(n);
      }
      if (e.code === "Escape") closeLightbox();
    });
  }

  // ─── LIGHTBOX ────────────────────────────────────
  const lightbox  = document.getElementById("lightbox");
  const lbImg     = document.getElementById("lbImg");
  const lbClose   = document.getElementById("lbClose");
  const lbPrev    = document.getElementById("lbPrev");
  const lbNext    = document.getElementById("lbNext");
  const lbCounter = document.getElementById("lbCounter");
  let lbImages = [], lbIndex = 0;

  function getImageList() {
    const seen = new Set();
    return Array.from(memoryWall.querySelectorAll(".mem-item img.img-loaded"))
      .map((img) => img.src)
      .filter((src) => { if (seen.has(src)) return false; seen.add(src); return true; });
  }

  function openLightbox(src) {
    lbImages = getImageList();
    lbIndex  = lbImages.indexOf(src);
    if (lbIndex < 0) lbIndex = 0;
    renderLightbox();
    if (lightbox) { lightbox.classList.add("open"); document.body.style.overflow = "hidden"; }
    setPaused(true);
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains("open")) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    setPaused(false);
  }

  function renderLightbox() {
    if (lbImg)     lbImg.src = lbImages[lbIndex] || "";
    if (lbCounter) lbCounter.textContent =
      String(lbIndex + 1).padStart(2, "0") + " / " + String(lbImages.length).padStart(2, "0");
  }

  function lbStep(dir) {
    lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
    renderLightbox();
  }

  if (lbClose)  lbClose.addEventListener("click", closeLightbox);
  if (lbPrev)   lbPrev.addEventListener("click",  () => lbStep(-1));
  if (lbNext)   lbNext.addEventListener("click",  () => lbStep(+1));
  if (lightbox) {
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

    // Touch swipe for lightbox (kept — this is lightweight UX, not heavy animation)
    let touchStartX = 0;
    lightbox.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 45) lbStep(dx < 0 ? 1 : -1);
    }, { passive: true });

    // Escape key for lightbox on desktop
    if (!isMobile) {
      document.addEventListener("keydown", (e) => {
        if (e.code === "Escape") closeLightbox();
      });
    }
  }

}); // end DOMContentLoaded