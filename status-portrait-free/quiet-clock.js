const HAND_PERIODS = { hour: 43_200_000, minute: 3_600_000, second: 60_000 };

// Read local device time directly: phones use their own clock and time zone.
export function getDeviceClockTime(now = new Date()) {
  const hour = now.getHours(), minute = now.getMinutes(), second = now.getSeconds();
  const elapsed = ((hour % 12 * 60 + minute) * 60 + second) * 1000 + now.getMilliseconds();
  const label = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  return {
    label,
    datetime: `${label}:${String(second).padStart(2, '0')}`,
    elapsed,
    angles: Object.fromEntries(Object.entries(HAND_PERIODS).map(([hand, period]) => [hand, elapsed % period / period * 360])),
  };
}

if (typeof document !== 'undefined') {
  const clock = document.querySelector('[data-device-clock]');
  const display = document.querySelector('[data-clock-readout]');
  const card = clock?.closest('.status');
  if (clock && display && card) {
    const toggle = card.querySelector('[data-clock-motion]');
    const caption = card.querySelector('[data-clock-caption]');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    // Persistent compositor animations move all three hands between wall-clock samples.
    const hands = Object.entries(HAND_PERIODS).map(([name, duration]) => {
      const element = clock.querySelector(`.${name}-hand`);
      const animation = element.animate?.([
        { transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' },
      ], { duration, iterations: Infinity, easing: 'linear' });
      animation?.pause();
      return { name, element, animation, duration };
    });
    let visible = false, pageActive = true, motionChoice = null, running = false, timer;
    const wantsMotion = () => motionChoice ?? !reduced.matches;
    const renderTime = () => {
      const time = getDeviceClockTime();
      if (display.textContent !== time.label) display.textContent = time.label;
      display.setAttribute('datetime', time.datetime);
      clock.setAttribute('aria-label', `本地时间 ${time.datetime}`);
      for (const { name, element, animation, duration } of hands) {
        if (animation) animation.currentTime = time.elapsed % duration;
        else element.style.transform = `rotate(${time.angles[name]}deg)`;
      }
    };
    const tick = () => {
      if (!running) return;
      renderTime();
      // Sample device clock changes without accumulating intervals.
      timer = setTimeout(tick, 1000 - new Date().getMilliseconds());
    };
    const syncMotion = () => {
      clearTimeout(timer);
      running = wantsMotion() && visible && pageActive && !document.hidden && card.dataset.collapsed !== 'true';
      if (running) {
        tick();
        for (const { animation } of hands) animation?.play();
      } else {
        for (const { animation } of hands) animation?.pause();
      }
      clock.dataset.running = String(running);
      if (toggle) {
        const label = wantsMotion() ? '暂停时钟' : '继续时钟';
        toggle.hidden = false;
        toggle.setAttribute('aria-label', label);
        toggle.setAttribute('aria-pressed', String(!wantsMotion()));
        toggle.title = label;
        toggle.textContent = wantsMotion() ? 'Ⅱ' : '▷';
      }
      if (caption) caption.textContent = wantsMotion() ? '本地时间' : '已暂停';
    };
    renderTime();
    clock.dataset.clockReady = 'true';
    new MutationObserver(syncMotion).observe(card, { attributes: true, attributeFilter: ['data-collapsed'] });
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncMotion(); }).observe(clock);
    toggle?.addEventListener('click', () => { motionChoice = !wantsMotion(); syncMotion(); });
    reduced.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncMotion);
    window.addEventListener('pagehide', () => { pageActive = false; syncMotion(); });
    window.addEventListener('pageshow', () => { pageActive = true; syncMotion(); });
    syncMotion();
  }
}
