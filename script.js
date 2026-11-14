(() => {
  const $ = (id) => document.getElementById(id);
  const card = $("card"), intro = $("intro"), video = $("introVideo"), soundBtn = $("soundToggle");
  const animSection = $("animSection"), animVideo = $("animVideo");
  const firstpageAudio = $("firstpageAudio");
  const loveAudio = $("loveAudio");
  const brideFirst = $("brideFirst"), brideLast = $("brideLast");
  const lineAnd = $("lineAnd");
  const groomFirst = $("groomFirst"), groomLast = $("groomLast");
  const scrollCue = $("scrollCue");
  const eventDetails = $("eventDetails");

  let isMuted = true;

  video.play().catch(() => {});
  firstpageAudio.muted = isMuted;
  firstpageAudio.play().catch(() => {});

  soundBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    isMuted = !isMuted;
    video.muted = isMuted;
    animVideo.muted = isMuted;
    firstpageAudio.muted = isMuted;
    loveAudio.muted = isMuted;
    soundBtn.innerHTML = isMuted ? "&#128263; Tap for Sound" : "&#128266; Sound On";
    if (!isMuted) {
      video.play().catch(() => {});
      // firstpage.mp3 loops only while the intro screen is still showing.
      if (!intro.classList.contains("open") && firstpageAudio.paused) {
        firstpageAudio.play().catch(() => {});
      }
      if (intro.classList.contains("open") && loveAudio.paused) {
        loveAudio.play().catch(() => {});
      }
    }
  });

  function typeText(element, text, speed) {
    return new Promise((resolve) => {
      element.classList.add("type-cursor");
      let i = 0;
      function step() {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          setTimeout(step, speed);
        } else {
          element.classList.remove("type-cursor");
          resolve();
        }
      }
      step();
    });
  }

  async function startTypewriter() {
    brideFirst.textContent = "";
    brideLast.textContent = "";
    lineAnd.textContent = "";
    groomFirst.textContent = "";
    groomLast.textContent = "";
    lineAnd.classList.remove("show");

    const TYPING_SPEED = 200;

    await new Promise((r) => setTimeout(r, 450));
    await typeText(brideFirst, "Azeena", TYPING_SPEED);
    await new Promise((r) => setTimeout(r, 180));
    await typeText(brideLast, "Azeez", TYPING_SPEED);

    lineAnd.textContent = "and";
    lineAnd.classList.add("show");
    await new Promise((r) => setTimeout(r, 400));

    await typeText(groomFirst, "Ali", TYPING_SPEED);
    await new Promise((r) => setTimeout(r, 180));
    await typeText(groomLast, "Shamsudheen", TYPING_SPEED);

    // Show the scroll direction 4 seconds after the names are fully shown.
    setTimeout(() => {
      scrollCue.classList.add("show");
      eventDetails.removeAttribute("aria-hidden");
    }, 4000);
  }

  function transitionToNamesPage() {
    animSection.classList.add("fade-out");
    card.classList.add("show");
    card.removeAttribute("aria-hidden");
    sparkleBurst(W / 2, H * 0.52, 60);

    setTimeout(() => {
      animSection.classList.remove("active", "fade-out");
      animSection.style.display = "none";
      try { animVideo.pause(); } catch (_) {}
    }, 600);

    startTypewriter();
  }

  function openInvitation() {
    if (intro.classList.contains("open")) return;
    intro.classList.add("open");
    document.body.classList.remove("locked");

    // Stop the intro audio as soon as the guest opens the invitation.
    firstpageAudio.pause();

    loveAudio.currentTime = 0;
    loveAudio.muted = isMuted;
    loveAudio.play().catch(() => {});

    animVideo.muted = true;
    animSection.style.display = "block";
    requestAnimationFrame(() => {
      animSection.classList.add("active");
    });

    const playPromise = animVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        transitionToNamesPage();
      });
    }

    setTimeout(() => { try { video.pause(); } catch (_) {} }, 500);

    let handled = false;
    function onAnimComplete() {
      if (handled) return;
      handled = true;
      transitionToNamesPage();
    }

    animVideo.addEventListener("ended", onAnimComplete, { once: true });
    animVideo.addEventListener("error", onAnimComplete, { once: true });
  }

  intro.addEventListener("click", openInvitation);
  intro.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openInvitation();
    }
  });

  // Celestial Constellation Bloom Interactive Particle Engine
  const cv = $("petals"), ctx = cv.getContext("2d");
  let W, H, sparkles = [], rings = [], running = true;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
  addEventListener("resize", resize);
  resize();

  const goldPalette = [
    { fill: "#ffffff", glow: "rgba(255, 255, 255, 0.95)" }, // Pure diamond light
    { fill: "#fff6d6", glow: "rgba(255, 246, 214, 0.9)" },  // Starlight ivory
    { fill: "#fadb7f", glow: "rgba(250, 219, 127, 0.85)" }, // Warm champagne
    { fill: "#d4af37", glow: "rgba(212, 175, 55, 0.8)" },   // 24k Royal gold
    { fill: "#ffea9f", glow: "rgba(255, 234, 159, 0.9)" }   // Radiant amber
  ];

  function createSparkle(originX, originY, isTapBurst) {
    const angle = Math.random() * Math.PI * 2;
    // Slower, calmer radial drift for tap bursts
    const speed = isTapBurst ? Math.random() * 2.4 + 0.8 : Math.random() * 0.9 + 0.3;
    const color = goldPalette[(Math.random() * goldPalette.length) | 0];

    return {
      x: originX !== undefined ? originX : Math.random() * W,
      y: originY !== undefined ? originY : -15,
      vx: isTapBurst ? Math.cos(angle) * speed : (Math.random() - 0.5) * 0.6,
      vy: isTapBurst ? Math.sin(angle) * speed : Math.random() * 0.9 + 0.4,
      size: Math.random() * 5 + 3,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.05,
      isStar: Math.random() > 0.3,
      color: color,
      alpha: 1,
      decay: isTapBurst ? Math.random() * 0.005 + 0.003 : 0.003,
      twinklePhase: Math.random() * Math.PI * 2,
      isTapBurst: isTapBurst
    };
  }

  function sparkleBurst(x, y, count) {
    if (reduce) return;
    const n = count || 32;
    // Softer, slower expanding shockwave ring on tap
    rings.push({ x: x, y: y, r: 4, maxR: 70, alpha: 0.65 });
    for (let i = 0; i < n; i++) {
      sparkles.push(createSparkle(x, y, true));
    }
  }

  // Interactive tap / touch listener on the card stage
  function handleTap(e) {
    if (!card.classList.contains("show")) return;
    const touch = e.touches ? e.touches[0] : e;
    const x = touch.clientX || touch.pageX;
    const y = touch.clientY || touch.pageY;
    sparkleBurst(x, y, 32);
  }

  window.addEventListener("pointerdown", (e) => {
    // Only trigger interactive tap bloom once the card is active
    if (card.classList.contains("show")) {
      handleTap(e);
    }
  }, { passive: true });

  function drawStar(x, y, r, rotation, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.shadowColor = color.glow;
    ctx.shadowBlur = r * 2.4;
    ctx.fillStyle = color.fill;

    // 4-pointed radiant star glint
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.quadraticCurveTo(0, 0, 0, r);
    ctx.quadraticCurveTo(0, 0, -r, 0);
    ctx.quadraticCurveTo(0, 0, 0, -r);
    ctx.closePath();
    ctx.fill();

    // Specular center
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawOrb(x, y, r, color, alpha) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.shadowColor = color.glow;
    ctx.shadowBlur = r * 2.5;
    ctx.fillStyle = color.fill;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);

    // Subtle gentle ambient background dusting
    if (!reduce && sparkles.length < 24 && Math.random() < 0.06) {
      sparkles.push(createSparkle());
    }

    // Render expanding shockwave rings from tap points
    for (let i = rings.length - 1; i >= 0; i--) {
      const ring = rings[i];
      ring.r += 1.4;
      ring.alpha -= 0.016;
      if (ring.alpha <= 0) {
        rings.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, ring.alpha);
      ctx.strokeStyle = "#fadb7f";
      ctx.lineWidth = 1.1;
      ctx.shadowColor = "rgba(250, 219, 127, 0.85)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw constellation tracer lines connecting nearby burst stars
    const burstParticles = sparkles.filter((s) => s.isTapBurst && s.alpha > 0.4);
    if (burstParticles.length >= 2) {
      ctx.save();
      for (let i = 0; i < Math.min(burstParticles.length, 14); i++) {
        for (let j = i + 1; j < Math.min(burstParticles.length, 14); j++) {
          const dx = burstParticles[i].x - burstParticles[j].x;
          const dy = burstParticles[i].y - burstParticles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 65) {
            const lineAlpha = (1 - dist / 65) * 0.35 * Math.min(burstParticles[i].alpha, burstParticles[j].alpha);
            ctx.strokeStyle = "#fff2b2";
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(burstParticles[i].x, burstParticles[i].y);
            ctx.lineTo(burstParticles[j].x, burstParticles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    // Render and update individual sparkles
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];

      s.x += s.vx;
      s.y += s.vy;
      s.rotation += s.rotSpeed;
      s.twinklePhase += 0.05;

      if (s.isTapBurst) {
        s.vx *= 0.975; // Gentle, longer-lasting drag deceleration
        s.vy *= 0.975;
        s.vy += 0.015; // Very gentle gravity
        s.alpha -= s.decay;
      } else {
        // Natural gentle swaying drift for ambient dusting
        s.x += Math.sin(s.y / 30) * 0.35;
        if (s.y > H + 10) s.alpha = 0;
      }

      // Shimmer / twinkle modulation
      const currentAlpha = s.alpha * (0.7 + 0.3 * Math.sin(s.twinklePhase));

      if (s.alpha <= 0) {
        sparkles.splice(i, 1);
        continue;
      }

      if (s.isStar) {
        drawStar(s.x, s.y, s.size, s.rotation, s.color, currentAlpha);
      } else {
        drawOrb(s.x, s.y, s.size, s.color, currentAlpha);
      }
    }

    if (running) requestAnimationFrame(loop);
  }

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) loop();
  });

  loop();

  // Reveal event-detail blocks one by one as the guest scrolls.
  const revealBlocks = document.querySelectorAll("[data-reveal]");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.28 });

  revealBlocks.forEach((block) => revealObserver.observe(block));

  // Scratch-to-reveal wedding date card
  const scratchCanvas = $("scratchCanvas");
  const scratchCard = $("scratchCard");
  const scratchCtx = scratchCanvas.getContext("2d");
  let scratchReady = false;
  let isScratching = false;
  let lastScratchX = null;
  let lastScratchY = null;
  let revealChecked = false;

  function setupScratchCanvas() {
    const rect = scratchCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    scratchCanvas.width = Math.max(1, Math.round(rect.width * dpr));
    scratchCanvas.height = Math.max(1, Math.round(rect.height * dpr));
    scratchCtx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Gold foil base
    const foil = scratchCtx.createLinearGradient(0, 0, w, h);
    foil.addColorStop(0, "#8f651b");
    foil.addColorStop(0.28, "#d4af37");
    foil.addColorStop(0.5, "#fff3cf");
    foil.addColorStop(0.72, "#c99a2c");
    foil.addColorStop(1, "#7a5411");
    scratchCtx.fillStyle = foil;
    scratchCtx.fillRect(0, 0, w, h);

    // Damask-inspired gold scrollwork
    scratchCtx.globalAlpha = 0.24;
    scratchCtx.strokeStyle = "#5c3d08";
    scratchCtx.lineWidth = 1.1;

    const cell = Math.max(34, w / 8);
    for (let y = -cell; y < h + cell; y += cell) {
      for (let x = -cell; x < w + cell; x += cell) {
        scratchCtx.beginPath();
        scratchCtx.arc(x + cell / 2, y + cell / 2, cell * 0.27, 0, Math.PI * 2);
        scratchCtx.stroke();

        scratchCtx.beginPath();
        scratchCtx.arc(x, y, cell * 0.15, 0, Math.PI * 2);
        scratchCtx.stroke();

        scratchCtx.beginPath();
        scratchCtx.moveTo(x, y + cell / 2);
        scratchCtx.quadraticCurveTo(x + cell / 2, y, x + cell, y + cell / 2);
        scratchCtx.stroke();
      }
    }

    // Baroque corner flourishes
    scratchCtx.globalAlpha = 0.55;
    scratchCtx.strokeStyle = "#fff3cf";
    scratchCtx.lineWidth = 2;
    const corners = [
      [16, 16, 1, 1],
      [w - 16, 16, -1, 1],
      [16, h - 16, 1, -1],
      [w - 16, h - 16, -1, -1]
    ];

    corners.forEach(([cx, cy, sx, sy]) => {
      scratchCtx.beginPath();
      scratchCtx.moveTo(cx, cy + sy * 34);
      scratchCtx.quadraticCurveTo(cx, cy, cx + sx * 34, cy);
      scratchCtx.stroke();

      scratchCtx.beginPath();
      scratchCtx.arc(cx + sx * 13, cy + sy * 13, 5, 0, Math.PI * 2);
      scratchCtx.stroke();
    });

    scratchCtx.globalAlpha = 1;
    scratchReady = true;
  }

  function getScratchPoint(event) {
    const rect = scratchCanvas.getBoundingClientRect();
    const touch = event.touches ? event.touches[0] : event;
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }

  function scratchAt(x, y) {
    if (!scratchReady || scratchCanvas.classList.contains("revealed")) return;

    scratchCtx.globalCompositeOperation = "destination-out";
    scratchCtx.lineWidth = 38;
    scratchCtx.lineCap = "round";
    scratchCtx.lineJoin = "round";

    scratchCtx.beginPath();
    scratchCtx.moveTo(x, y);
    scratchCtx.lineTo(x + 0.01, y + 0.01);
    scratchCtx.stroke();

    if (lastScratchX !== null && lastScratchY !== null) {
      scratchCtx.beginPath();
      scratchCtx.moveTo(lastScratchX, lastScratchY);
      scratchCtx.lineTo(x, y);
      scratchCtx.stroke();
    }

    scratchCtx.globalCompositeOperation = "source-over";
    lastScratchX = x;
    lastScratchY = y;
    checkScratchProgress();
  }

  function checkScratchProgress() {
    if (revealChecked) return;

    const { width, height } = scratchCanvas;
    const data = scratchCtx.getImageData(0, 0, width, height).data;
    let cleared = 0;
    let total = 0;

    for (let i = 3; i < data.length; i += 32) {
      total++;
      if (data[i] < 40) cleared++;
    }

    if (total && cleared / total > 0.45) {
      revealChecked = true;
      scratchCanvas.classList.add("revealed");
      scratchCard.classList.add("scratched");
      sparkleBurst(
        scratchCard.getBoundingClientRect().left + scratchCard.offsetWidth / 2,
        scratchCard.getBoundingClientRect().top + scratchCard.offsetHeight / 2,
        34
      );
    }
  }

  function startScratch(event) {
    isScratching = true;
    const point = getScratchPoint(event);
    scratchAt(point.x, point.y);
  }

  function moveScratch(event) {
    if (!isScratching) return;
    event.preventDefault();
    const point = getScratchPoint(event);
    scratchAt(point.x, point.y);
  }

  function endScratch() {
    isScratching = false;
    lastScratchX = null;
    lastScratchY = null;
  }

  scratchCanvas.addEventListener("pointerdown", startScratch);
  scratchCanvas.addEventListener("pointermove", moveScratch);
  window.addEventListener("pointerup", endScratch);
  window.addEventListener("pointercancel", endScratch);
  window.addEventListener("resize", () => {
    if (!scratchCanvas.classList.contains("revealed")) {
      scratchReady = false;
      revealChecked = false;
      setupScratchCanvas();
    }
  });

  // Initialize the scratch layer once it has layout.
  requestAnimationFrame(setupScratchCanvas);

  // Real-time countdown to the Nikkah: 17 January 2027, 11:30 AM local time.
  const weddingDate = new Date(2027, 0, 17, 11, 30, 0);
  const daysEl = $("countDays");
  const hoursEl = $("countHours");
  const minutesEl = $("countMinutes");
  const secondsEl = $("countSeconds");

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function updateCountdown() {
    const diff = Math.max(0, weddingDate.getTime() - Date.now());
    const totalSeconds = Math.floor(diff / 1000);

    daysEl.textContent = pad(Math.floor(totalSeconds / 86400));
    hoursEl.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
    minutesEl.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
    secondsEl.textContent = pad(totalSeconds % 60);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
})();
