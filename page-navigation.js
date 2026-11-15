(() => {
  const pages = ['card', 'familyDetails', 'eventDetails', 'venueDetails', 'closingDetails'].map(id => document.getElementById(id));
  if (pages.some(page => !page)) return;
  const closing = document.getElementById('closingDetails');
  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) closing.removeAttribute('aria-hidden');
    });
  }, { threshold: .1 }).observe(closing);
  const family = document.getElementById('familyDetails');
  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) family.removeAttribute('aria-hidden');
    });
  }, { threshold: .1 }).observe(family);
  new IntersectionObserver(entries => {
    entries.forEach(entry => family.classList.toggle('leaving', entry.isIntersecting));
  }, { threshold: .35 }).observe(document.getElementById('eventDetails'));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let start = null, busy = false, frame = 0, wheelTimer = 0, wheelTotal = 0;
  const height = () => document.documentElement.clientHeight;
  const top = page => page.getBoundingClientRect().top + window.scrollY;
  const active = () => !document.body.classList.contains('locked') && pages[0].classList.contains('show');
  const excluded = target => target instanceof Element && !!target.closest('#scratchCanvas:not(.revealed), a, button, input, textarea, select, [contenteditable="true"]');
  function index() {
    let found = 0;
    pages.forEach((page, i) => { if (top(page) <= window.scrollY + 3) found = i; });
    return found;
  }
  function moveTo(y) {
    const from = window.scrollY;
    const target = Math.max(0, Math.min(y, document.documentElement.scrollHeight - height()));
    if (Math.abs(target - from) < 1) return;
    busy = true;
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    const began = performance.now();
    function step(now) {
      const p = reduced ? 1 : Math.min(1, (now - began) / 1000);
      const ease = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      window.scrollTo(0, from + (target - from) * ease);
      if (p < 1) frame = requestAnimationFrame(step);
      else { root.style.scrollBehavior = previous; busy = false; }
    }
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(step);
  }
  function navigate(direction) {
    if (!active() || busy) return;
    const i = index(), y = window.scrollY;
    const beginning = top(pages[i]);
    let end = Math.max(beginning, beginning + pages[i].offsetHeight - height());
    if (direction > 0 && ['eventDetails', 'familyDetails'].includes(pages[i].id)) {
      const countdown = pages[i].querySelector('.countdown-block, .family-end');
      if (countdown) {
        // Layout coordinates exclude reveal-animation transforms and trailing padding.
        let bottom = countdown.offsetHeight;
        for (let node = countdown; node; node = node.offsetParent) bottom += node.offsetTop;
        const viewportBottom = window.visualViewport
          ? window.visualViewport.offsetTop + window.visualViewport.height : height();
        end = Math.max(beginning, Math.min(end, bottom - viewportBottom));
      }
    }
    if (direction > 0) {
      if (y < end - 3) moveTo(Math.min(end, y + height() * .8));
      else if (i < pages.length - 1) moveTo(top(pages[i + 1]));
    } else {
      if (y > beginning + 3) moveTo(Math.max(beginning, y - height() * .8));
      else if (i > 0) moveTo(Math.max(top(pages[i - 1]), top(pages[i - 1]) + pages[i - 1].offsetHeight - height()));
    }
  }
  const arrowStyles = document.createElement('style');
  arrowStyles.textContent = `
    .page-next-cue{appearance:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;flex-shrink:0;min-width:64px;min-height:64px;padding:8px;margin:0 auto;border:0;background:transparent;color:var(--gold-deep);cursor:pointer;font-family:'Cinzel',serif;font-size:.68rem;font-weight:700;letter-spacing:.24em;text-transform:uppercase;text-shadow:0 1px 2px rgba(255,243,207,.8)}
    .page-next-cue svg{display:block;width:32px;height:32px;overflow:visible;animation:pageNextBob 1.7s ease-in-out infinite;filter:drop-shadow(0 1px 2px rgba(143,101,27,.2))}
    .page-next-cue:hover{color:var(--maroon-deep)}
    .page-next-cue:focus-visible{outline:2px solid var(--gold-deep);outline-offset:4px;border-radius:12px}
    @keyframes pageNextBob{0%,100%{transform:translateY(0);opacity:.7}50%{transform:translateY(7px);opacity:1}}
    @media(prefers-reduced-motion:reduce){.page-next-cue svg{animation:none}}
  `;
  document.head.appendChild(arrowStyles);
  pages.slice(1, -1).forEach((page, offset) => {
    const next = pages[offset + 2];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'page-next-cue';
    button.setAttribute('aria-label', 'Continue to ' + ({eventDetails:'the date and countdown',venueDetails:'the venue',closingDetails:'Sharing Happiness'}[next.id]));
    button.setAttribute('aria-controls', next.id);
    button.innerHTML = '<span aria-hidden="true">Scroll</span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5v16m0 0l-7-7m7 7l7-7" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    button.addEventListener('click', () => {
      if (active() && !busy) moveTo(top(next));
    });
    const area = page.querySelector('.writing-area');
    if (area) area.appendChild(button);
  });
  document.addEventListener('touchstart', e => {
    start = active() && !excluded(e.target) && e.touches.length === 1
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
  }, { passive: true });
  document.addEventListener('touchmove', e => {
    if (!start) return;
    if (e.touches.length !== 1) { start = null; return; }
    const dx = e.touches[0].clientX - start.x;
    const dy = e.touches[0].clientY - start.y;
    if (Math.abs(dy) > Math.abs(dx) && e.cancelable) e.preventDefault();
  }, { passive: false });
  document.addEventListener('touchend', e => {
    if (!start || !e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    start = null;
    if (Math.abs(dy) >= 45 && Math.abs(dy) > Math.abs(dx)) navigate(dy < 0 ? 1 : -1);
  }, { passive: true });
  document.addEventListener('touchcancel', () => { start = null; }, { passive: true });
  document.addEventListener('wheel', e => {
    if (!active() || excluded(e.target) || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (e.cancelable) e.preventDefault();
    clearTimeout(wheelTimer);
    wheelTotal += e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? height() : 1);
    wheelTimer = setTimeout(() => { wheelTotal = 0; }, 180);
    if (Math.abs(wheelTotal) >= 45) { navigate(wheelTotal > 0 ? 1 : -1); wheelTotal = 0; }
  }, { passive: false });
  document.addEventListener('keydown', e => {
    if (!active() || excluded(e.target) || e.altKey || e.ctrlKey || e.metaKey) return;
    const down = ['ArrowDown', 'PageDown', ' '].includes(e.key);
    const up = ['ArrowUp', 'PageUp'].includes(e.key);
    if (!down && !up) return;
    e.preventDefault();
    navigate(up || (e.key === ' ' && e.shiftKey) ? -1 : 1);
  });
})();
