(() => {
  const EVENT = {
    title: "Nikkah of Azeena & Ali",
    start: new Date("2027-01-17T11:30:00+05:30"),
    durationHrs: 3,
    location: "Highness Auditorium, Pukkattupady"
  };

  const $ = (id) => document.getElementById(id);
  const card = $("card"), intro = $("intro"), video = $("introVideo"), soundBtn = $("soundToggle");

  // Attempt autoplay muted (browser policy compliant)
  video.play().catch(() => {});

  // Dedicated sound toggle button so user can unmute without dismissing the intro
  soundBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    soundBtn.innerHTML = video.muted ? "&#128263; Tap for Sound" : "&#128266; Sound On";
    if (!video.muted) video.play().catch(() => {});
  });

  // Open invitation by tapping anywhere on the intro screen
  function openInvitation() {
    if (intro.classList.contains("open")) return;
    intro.classList.add("open");
    document.body.classList.remove("locked");
    card.classList.add("show");
    card.removeAttribute("aria-hidden");
    window.scrollTo(0, 0);
    burst();
    observeReveals();
    // Pause video after transition finishes to save battery/data
    setTimeout(() => { try { video.pause(); } catch (_) {} }, 1200);
  }

  intro.addEventListener("click", openInvitation);
  intro.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openInvitation();
    }
  });

  // Scroll reveal
  function observeReveals() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach((el, i) => {
      el.style.transitionDelay = Math.min(i, 4) * 0.08 + "s";
      io.observe(el);
    });
  }

  // Countdown
  function tick() {
    let diff = Math.max(0, EVENT.start - new Date());
    const d = Math.floor(diff / 864e5); diff %= 864e5;
    const h = Math.floor(diff / 36e5); diff %= 36e5;
    const m = Math.floor(diff / 6e4); const s = Math.floor((diff % 6e4) / 1e3);
    $("cd-d").textContent = d;
    $("cd-h").textContent = String(h).padStart(2, "0");
    $("cd-m").textContent = String(m).padStart(2, "0");
    $("cd-s").textContent = String(s).padStart(2, "0");
  }
  tick(); setInterval(tick, 1000);

  // Add to calendar (.ics)
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  $("calBtn").addEventListener("click", () => {
    const end = new Date(EVENT.start.getTime() + EVENT.durationHrs * 36e5);
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Card//EN", "BEGIN:VEVENT",
      "UID:azeena-ali-2027@wedding", "DTSTAMP:" + fmt(new Date()),
      "DTSTART:" + fmt(EVENT.start), "DTEND:" + fmt(end),
      "SUMMARY:" + EVENT.title, "LOCATION:" + EVENT.location,
      "DESCRIPTION:Your presence will make our day more special.",
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:Nikkah tomorrow", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "azeena-ali-nikkah.ics";
    document.body.appendChild(a); a.click(); a.remove();
  });

  // WhatsApp share
  const msg = "You are cordially invited to the wedding of Azeena & Ali - Sunday, 17 January 2027, 11:30 AM, Highness Auditorium, Pukkattupady.\n" + location.href;
  $("shareBtn").href = "https://wa.me/?text=" + encodeURIComponent(msg);

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
