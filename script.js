// script.js — Aakruthi 2K26 Cyberpunk Website

// ─── PARTICLES.JS ────────────────────────────────────────────────────────────
(function initParticles() {
  const isMobile =
    window.matchMedia("(max-width: 768px)").matches ||
    navigator.maxTouchPoints > 0;
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

  let resizeTimer;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
      }, 200);
    },
    { passive: true },
  );

  const COLORS = ["#00f0ff", "#ff2d78", "#7b2fff", "#00ff9d", "#ffffff"];
  const PARTICLE_COUNT = 70;
  const CONNECTION_DIST = 120;
  const CONNECTION_DIST_SQ = CONNECTION_DIST * CONNECTION_DIST;

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(init = false) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : Math.random() < 0.5 ? -10 : H + 10;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.r = Math.random() * 1.8 + 0.6;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.5 + 0.3;
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
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const particles = Array.from(
    { length: PARTICLE_COUNT },
    () => new Particle(),
  );

  function drawConnections() {
    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i],
          b = particles[j];
        const dx = a.x - b.x,
          dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < CONNECTION_DIST_SQ) {
          const alpha = (1 - Math.sqrt(distSq) / CONNECTION_DIST) * 0.22;
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = a.color;
          ctx.shadowColor = a.color;
          ctx.shadowBlur = 3;
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
    ctx.clearRect(0, 0, W, H);
    ctx.shadowBlur = 0;
    drawConnections();
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    animId = requestAnimationFrame(loop);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else loop();
  });

  loop();
})();

// ─── MAIN DOMContentLoaded ────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // ─── LOADER ─────────────────────────────────────
  const loader = document.getElementById("loader");
  if (loader) {
    setTimeout(() => {
      loader.classList.add("hidden");
      triggerReveal();
    }, 1400);
  }

  // ─── CUSTOM CURSOR (desktop only) ───────────────
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  const isTouchDevice = navigator.maxTouchPoints > 0;

  if (dot && ring && !isTouchDevice) {
    let mouseX = 0,
      mouseY = 0,
      ringX = 0,
      ringY = 0;

    document.addEventListener(
      "mousemove",
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + "px";
        dot.style.top = mouseY + "px";
      },
      { passive: true },
    );

    function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document
      .querySelectorAll(
        "a, button, .event-card, .faq-question, .contact-btn, .filter-btn, .mem-item, .gal-btn, .gal-playpause, .gal-slider",
      )
      .forEach((el) => {
        el.addEventListener("mouseenter", () => ring.classList.add("hover"), {
          passive: true,
        });
        el.addEventListener(
          "mouseleave",
          () => ring.classList.remove("hover"),
          { passive: true },
        );
      });

    document.addEventListener("mouseleave", () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    });
  } else if (dot && ring) {
    dot.style.display = "none";
    ring.style.display = "none";
  }

  // ─── HAMBURGER MENU ─────────────────────────────
  const hamburger = document.getElementById("hamburger");
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

  // ─── COUNTDOWN ──────────────────────────────────
  const targetDate = new Date("2026-03-12T09:00:00").getTime();
  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minEl = document.getElementById("cd-min");
  const secEl = document.getElementById("cd-sec");

  if (daysEl) {
    function updateCountdown() {
      const diff = targetDate - Date.now();
      if (diff <= 0) {
        daysEl.textContent =
          hoursEl.textContent =
          minEl.textContent =
          secEl.textContent =
            "00";
        return;
      }
      daysEl.textContent = String(Math.floor(diff / 86400000)).padStart(2, "0");
      hoursEl.textContent = String(
        Math.floor((diff % 86400000) / 3600000),
      ).padStart(2, "0");
      minEl.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(
        2,
        "0",
      );
      secEl.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(
        2,
        "0",
      );
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ─── SCROLL REVEAL ──────────────────────────────
  function triggerReveal() {
    const revealEls = document.querySelectorAll(".reveal");
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const siblings =
              entry.target.parentElement?.querySelectorAll(".reveal");
            let idx = 0;
            if (siblings) {
              siblings.forEach((el, j) => {
                if (el === entry.target) idx = j;
              });
            }
            setTimeout(() => entry.target.classList.add("visible"), idx * 80);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  // Hero reveals
  setTimeout(() => {
    document.querySelectorAll("#hero .reveal").forEach((el, i) => {
      setTimeout(() => el.classList.add("visible"), i * 150 + 300);
    });
  }, 1200);

  // ─── NAVBAR SCROLL EFFECT ────────────────────────
  const navbar = document.querySelector(".navbar");

  // Grab every text-bearing element inside the navbar
  const navLinks   = navbar ? navbar.querySelectorAll(".nav-links a") : [];
  const navTitle   = navbar ? navbar.querySelector(".nav-title")      : null;
  const navSub     = navbar ? navbar.querySelector(".nav-sub")        : null;
  const navRegister= navbar ? navbar.querySelector(".nav-register")   : null;
  const hamburgerBars = navbar ? navbar.querySelectorAll(".hamburger .bar") : [];

  if (navbar) {
    let ticking = false;

    function applyNavbarState(scrolled) {
      if (scrolled) {
        // ── SCROLLED: black bar, white text ──────────────────
        navbar.style.background   = "#000000";
        navbar.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
        navbar.style.boxShadow    = "0 2px 24px rgba(0,0,0,0.5)";

        navLinks.forEach((a) => {
          a.style.color = "#ffffff";
        });
        if (navTitle)    navTitle.style.color    = "#ffffff";
        if (navSub)      navSub.style.color      = "rgba(255,255,255,0.55)";
        hamburgerBars.forEach((bar) => {
          bar.style.background  = "#ffffff";
          bar.style.boxShadow   = "none";
        });

      } else {
        // ── AT TOP: restore light navbar ─────────────────────
        navbar.style.background   = "#ffffff";
        navbar.style.borderBottom = "1px solid rgba(100,80,200,0.14)";
        navbar.style.boxShadow    = "0 2px 24px rgba(100,80,200,0.09)";

        navLinks.forEach((a) => {
          a.style.color = "";   // falls back to CSS var(--text-muted)
        });
        if (navTitle)    navTitle.style.color    = "";   // var(--text)
        if (navSub)      navSub.style.color      = "";   // var(--text-muted)
        hamburgerBars.forEach((bar) => {
          bar.style.background  = "";
          bar.style.boxShadow   = "";
        });
      }
    }

    // Set correct state immediately on page load (handles refresh mid-page)
    applyNavbarState(window.scrollY > 50);

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            applyNavbarState(window.scrollY > 50);
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true },
    );
  }

  // ─── GLITCH TEXT RANDOM TRIGGER ──────────────────
  document.querySelectorAll(".glitch").forEach((el) => {
    setInterval(
      () => {
        el.style.animation = "none";
        setTimeout(() => {
          el.style.animation = "";
        }, 50);
      },
      Math.random() * 8000 + 4000,
    );
  });



  // ════════════════════════════════════════════════════════════
  //  MEMORIES PAGE — Gallery Controls + Image Loading + Lightbox
  //  Only runs on memories.html (checks for #memoryWall)
  // ════════════════════════════════════════════════════════════
  const memoryWall = document.getElementById("memoryWall");
  if (!memoryWall) return; // not on memories page — stop here

  const cols = Array.from(memoryWall.querySelectorAll(".mem-col"));
  const btnPlayPause = document.getElementById("btnPlayPause");
  const speedSlider = document.getElementById("speedSlider");
  const speedValEl = document.getElementById("speedVal");
  const btnDefault = document.getElementById("btnDefault");
  const btnReverse = document.getElementById("btnReverse");
  const galStatus = document.getElementById("galStatus");

  // ── 1. IMAGE LOADING ────────────────────────────
  memoryWall.querySelectorAll(".mem-item").forEach((item) => {
    const img = item.querySelector("img");
    if (!img) return;

    function onLoaded() {
      img.classList.add("img-loaded");
      item.classList.add("img-done");
    }
    function onBroken() {
      item.classList.add("img-broken", "img-done");
    }

    if (img.complete) {
      if (img.naturalWidth > 0) onLoaded();
      else onBroken();
    } else {
      img.addEventListener("load", onLoaded, { once: true });
      img.addEventListener("error", onBroken, { once: true });
    }

    item.addEventListener(
      "mouseenter",
      () => {
        if (!paused)
          item.closest(".mem-col").style.animationPlayState = "paused";
      },
      { passive: true },
    );
    item.addEventListener(
      "mouseleave",
      () => {
        if (!paused)
          item.closest(".mem-col").style.animationPlayState = "running";
      },
      { passive: true },
    );

    item.addEventListener("click", () => {
      if (!item.classList.contains("img-broken")) openLightbox(img.src);
    });
  });

  // ── 2. GALLERY STATE ────────────────────────────
  let paused = false;
  let speed = 1;
  let reversed = false;

  const origClass = cols.map((col) => {
    if (col.classList.contains("up2")) return "up2";
    if (col.classList.contains("down")) return "down";
    return "up";
  });

  const reverseOf = { up: "down", down: "up", up2: "down" };
  const baseDur = cols.map((col) => parseFloat(col.dataset.dur) || 30);

  function setDuration(col, idx) {
    col.style.animationDuration = baseDur[idx] / speed + "s";
  }

  cols.forEach((col, i) => setDuration(col, i));

  // ── 3. PLAY / PAUSE ─────────────────────────────
  function setPaused(v) {
    paused = v;
    memoryWall.classList.toggle("gallery-paused", paused);

    if (paused) {
      btnPlayPause.textContent = "▶";
      btnPlayPause.classList.add("paused");
      galStatus.textContent = "⏸ PAUSED";
      galStatus.classList.add("is-paused");
    } else {
      btnPlayPause.textContent = "⏸";
      btnPlayPause.classList.remove("paused");
      galStatus.textContent = "● LIVE";
      galStatus.classList.remove("is-paused");
      cols.forEach((col) => {
        col.style.animationPlayState = "running";
      });
    }
  }

  btnPlayPause.addEventListener("click", () => setPaused(!paused));

  // ── 4. SPEED SLIDER ─────────────────────────────
  function applySpeed(newSpeed) {
    speed = newSpeed;
    speedValEl.textContent = speed + "×";
    cols.forEach((col, i) => setDuration(col, i));
  }

  speedSlider.addEventListener("input", () => {
    applySpeed(parseFloat(speedSlider.value));
  });

  // ── 5. DIRECTION TOGGLE ─────────────────────────
  function setDirection(rev) {
    reversed = rev;
    btnDefault.classList.toggle("active", !rev);
    btnReverse.classList.toggle("active", rev);

    cols.forEach((col, i) => {
      const targetClass = rev ? reverseOf[origClass[i]] : origClass[i];
      col.classList.remove("up", "down", "up2");
      col.classList.add(targetClass);
      setDuration(col, i);
    });
  }

  btnDefault.addEventListener("click", () => setDirection(false));
  btnReverse.addEventListener("click", () => setDirection(true));

  // ── 6. KEYBOARD SHORTCUTS ───────────────────────
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    if (e.code === "Space") {
      e.preventDefault();
      setPaused(!paused);
    }
    if (e.code === "ArrowRight") {
      const next = Math.min(3, parseFloat(speedSlider.value) + 0.25);
      speedSlider.value = next;
      applySpeed(next);
    }
    if (e.code === "ArrowLeft") {
      const prev = Math.max(0.25, parseFloat(speedSlider.value) - 0.25);
      speedSlider.value = prev;
      applySpeed(prev);
    }
    if (e.code === "Escape") {
      closeLightbox();
    }
  });

  // ── 7. LIGHTBOX ─────────────────────────────────
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbClose = document.getElementById("lbClose");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");
  const lbCounter = document.getElementById("lbCounter");

  function getImageList() {
    const seen = new Set();
    return Array.from(memoryWall.querySelectorAll(".mem-item img.img-loaded"))
      .map((img) => img.src)
      .filter((src) => {
        if (seen.has(src)) return false;
        seen.add(src);
        return true;
      });
  }

  let lbImages = [];
  let lbIndex = 0;

  function openLightbox(src) {
    lbImages = getImageList();
    lbIndex = lbImages.indexOf(src);
    if (lbIndex < 0) lbIndex = 0;
    renderLightbox();
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    setPaused(true);
  }

  function closeLightbox() {
    if (!lightbox.classList.contains("open")) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    setPaused(false);
  }

  function renderLightbox() {
    lbImg.src = lbImages[lbIndex] || "";
    lbCounter.textContent =
      String(lbIndex + 1).padStart(2, "0") +
      " / " +
      String(lbImages.length).padStart(2, "0");
  }

  function lbStep(dir) {
    lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
    renderLightbox();
  }

  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", () => lbStep(-1));
  lbNext.addEventListener("click", () => lbStep(+1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  let touchStartX = 0;
  lightbox.addEventListener(
    "touchstart",
    (e) => { touchStartX = e.touches[0].clientX; },
    { passive: true },
  );
  lightbox.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 45) lbStep(dx < 0 ? 1 : -1);
    },
    { passive: true },
  );
}); // end DOMContentLoaded