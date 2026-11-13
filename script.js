(() => {
  const $ = (id) => document.getElementById(id);
  const card = $("card"), intro = $("intro"), video = $("introVideo"), soundBtn = $("soundToggle");
  const animSection = $("animSection"), animVideo = $("animVideo");
  const loveAudio = $("loveAudio");
  const brideFirst = $("brideFirst"), brideLast = $("brideLast");
  const lineAnd = $("lineAnd");
  const groomFirst = $("groomFirst"), groomLast = $("groomLast");

  let isMuted = true;

  video.play().catch(() => {});

  soundBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    isMuted = !isMuted;
    video.muted = isMuted;
    animVideo.muted = isMuted;
    loveAudio.muted = isMuted;
    soundBtn.innerHTML = isMuted ? "&#128263; Tap for Sound" : "&#128266; Sound On";
    if (!isMuted) {
      video.play().catch(() => {});
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
  }

  function transitionToNamesPage() {
    animSection.classList.add("fade-out");
    card.classList.add("show");
    card.removeAttribute("aria-hidden");
    sparkleBurst();

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

  // Golden Star-Dust Dusting System (4-point diamond glints + glowing gold micro-orbs)
  const cv = $("petals"), ctx = cv.getContext("2d");
  let W, H, sparkles = [], running = true;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
  addEventListener("resize", resize);
  resize();

  const goldPalette = [
    { fill: "#fff6d6", glow: "rgba(255, 246, 214, 0.9)" }, // Diamond light
    { fill: "#fadb7f", glow: "rgba(250, 219, 127, 0.85)" }, // Warm champagne
    { fill: "#d4af37", glow: "rgba(212, 175, 55, 0.8)" },  // Royal metallic gold
    { fill: "#ffea9f", glow: "rgba(255, 234, 159, 0.9)" }  // Luminous amber
  ];

  function createSparkle(isBurst) {
    const angle = Math.random() * Math.PI * 2;
    const speed = isBurst ? Math.random() * 6.5 + 2.5 : Math.random() * 0.9 + 0.3;
    const color = goldPalette[(Math.random() * goldPalette.length) | 0];

    return {
      x: isBurst ? W / 2 + (Math.random() - 0.5) * 40 : Math.random() * W,
      y: isBurst ? H * 0.52 + (Math.random() - 0.5) * 40 : -15,
      vx: isBurst ? Math.cos(angle) * speed : (Math.random() - 0.5) * 0.6,
      vy: isBurst ? Math.sin(angle) * speed - 1.8 : Math.random() * 0.9 + 0.4,
      size: Math.random() * 5 + 3,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.08,
      isStar: Math.random() > 0.35, // 65% 4-point stars, 35% glowing round dust
      color: color,
      alpha: isBurst ? 1 : Math.random() * 0.5 + 0.5,
      decay: isBurst ? Math.random() * 0.012 + 0.008 : 0.003,
      twinklePhase: Math.random() * Math.PI * 2,
      isBurst: isBurst
    };
  }

  function drawStar(x, y, r, rotation, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.shadowColor = color.glow;
    ctx.shadowBlur = r * 2.2;
    ctx.fillStyle = color.fill;

    // Elegant 4-pointed sparkle
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.quadraticCurveTo(0, 0, 0, r);
    ctx.quadraticCurveTo(0, 0, -r, 0);
    ctx.quadraticCurveTo(0, 0, 0, -r);
    ctx.closePath();
    ctx.fill();

    // Central white-hot core
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
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

  function sparkleBurst() {
    if (reduce) return;
    for (let i = 0; i < 70; i++) {
      sparkles.push(createSparkle(true));
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);

    // Subtle gentle ambient dusting continually floating down
    if (!reduce && sparkles.length < 32 && Math.random() < 0.08) {
      sparkles.push(createSparkle(false));
    }

    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];

      s.x += s.vx;
      s.y += s.vy;
      s.rotation += s.rotSpeed;
      s.twinklePhase += 0.08;

      if (s.isBurst) {
        s.vx *= 0.96;
        s.vy += 0.08; // Gravity
        s.alpha -= s.decay;
      } else {
        // Natural swaying drift
        s.x += Math.sin(s.y / 30) * 0.35;
        if (s.y > H + 10) s.alpha = 0;
      }

      // Dynamic twinkle modulation
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
})();
