(() => {
  const $ = (id) => document.getElementById(id);
  const card = $("card"), intro = $("intro"), video = $("introVideo"), soundBtn = $("soundToggle");
  const line1 = $("line1"), lineAnd = $("lineAnd"), line2 = $("line2");

  video.play().catch(() => {});

  soundBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    soundBtn.innerHTML = video.muted ? "&#128263; Tap for Sound" : "&#128266; Sound On";
    if (!video.muted) video.play().catch(() => {});
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
    line1.textContent = "";
    lineAnd.textContent = "";
    line2.textContent = "";
    lineAnd.classList.remove("show");

    await new Promise((r) => setTimeout(r, 450));
    await typeText(line1, "Azeena Azeez", 200);

    lineAnd.textContent = "and";
    lineAnd.classList.add("show");
    await new Promise((r) => setTimeout(r, 400));

    await typeText(line2, "Ali Shamsudheen", 200);
  }

  function openInvitation() {
    if (intro.classList.contains("open")) return;
    intro.classList.add("open");
    document.body.classList.remove("locked");
    card.classList.add("show");
    card.removeAttribute("aria-hidden");
    window.scrollTo(0, 0);
    burst();
    setTimeout(() => { try { video.pause(); } catch (_) {} }, 1200);
    startTypewriter();
  }

  intro.addEventListener("click", openInvitation);
  intro.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openInvitation();
    }
  });

  // Falling petals
  const cv = $("petals"), ctx = cv.getContext("2d");
  let W, H, petals = [], running = true;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
  addEventListener("resize", resize); resize();
  const colors = ["#a8192e", "#c9a45f", "#d9556a", "#f0d9a8"];
  function petal(burstMode) {
    return {
      x: burstMode ? W / 2 : Math.random() * W,
      y: burstMode ? H * 0.6 : -20,
      r: 4 + Math.random() * 6,
      vx: burstMode ? (Math.random() - 0.5) * 8 : (Math.random() - 0.5) * 0.8,
      vy: burstMode ? -Math.random() * 8 - 2 : 0.6 + Math.random() * 1.2,
      rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.06,
      c: colors[(Math.random() * colors.length) | 0], life: burstMode ? 1 : 0
    };
  }
  function burst() { if (!reduce) for (let i = 0; i < 60; i++) petals.push(petal(true)); }
  function loop() {
    ctx.clearRect(0, 0, W, H);
    if (!reduce && petals.length < 26 && Math.random() < 0.06) petals.push(petal(false));
    petals = petals.filter((p) => p.y < H + 20);
    for (const p of petals) {
      p.x += p.vx + Math.sin(p.y / 40) * 0.4; p.y += p.vy; p.rot += p.vr;
      if (p.life) { p.vy += 0.18; p.vx *= 0.99; if (p.vy > 1.8) p.vy = 1.8; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c; ctx.globalAlpha = 0.8;
      ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    if (running) requestAnimationFrame(loop);
  }
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) loop(); });
  loop();
})();
