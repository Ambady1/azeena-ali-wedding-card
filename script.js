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
    if (!isMuted) video.play().catch(() => {});
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
    // 1. Instantly fire love.MP3 (no waiting for fade transition)
    loveAudio.currentTime = 0;
    loveAudio.muted = isMuted;
    loveAudio.play().catch(() => {});

    // 2. Seamlessly display names card
    animSection.classList.add("fade-out");
    card.classList.add("show");
    card.removeAttribute("aria-hidden");
    burst();

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

    // Prime loveAudio immediately on user tap gesture to unlock mobile autoplay
    loveAudio.load();

    // Reveal intermediate animation
    animVideo.muted = isMuted;
    animSection.style.display = "block";
    requestAnimationFrame(() => {
      animSection.classList.add("active");
    });

    const playPromise = animVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback: if browser blocks unmuted playback, play muted
        animVideo.muted = true;
        animVideo.play().catch(transitionToNamesPage);
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
