// A geographic texture projected onto a shaded sphere. Rotation changes longitude,
// not the position of a flat image. The low-resolution print texture is intentional.
(() => {
  const canvas = document.querySelector('[data-earth]');
  const sphere = canvas.closest('.earth-sphere');
  const toggle = document.querySelector('[data-earth-toggle]');
  const panel = document.querySelector('.earth-terminal');
  const content = document.getElementById('status-content');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ctx = canvas.getContext('2d', { alpha: true });
  const size = 240, textureWidth = 1024, textureHeight = 512;
  const frameInterval = 1000 / 20, revolutionMs = 90000;
  const tau = Math.PI * 2;
  const bayer = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
  const palette = [8, 39, 91, 164, 237];
  const surface = [];
  let imageData, texture, raf = 0, lastTime = null, rotation = .535;
  let paused = false, visible = false, ready = false, failed = false;

  function reflectButton() {
    const stopped = paused || reduced.matches;
    toggle.disabled = failed || reduced.matches;
    toggle.setAttribute('aria-pressed', String(stopped));
    toggle.setAttribute('aria-label', failed ? '地球静态背景' : reduced.matches ? '地球静态显示（减少动态效果）' : paused ? '继续地球自转' : '暂停地球自转');
    toggle.textContent = stopped || failed ? '▷' : 'Ⅱ';
  }

  function paint() {
    if (!ready) return;
    const data = imageData.data;
    const offset = Math.floor(rotation * textureWidth);
    for (const point of surface) {
      const tx = (point.longitude + offset) % textureWidth;
      const mapIndex = (point.row * textureWidth + tx) * 4;
      const r = texture[mapIndex], g = texture[mapIndex + 1], b = texture[mapIndex + 2];
      // Blue oceans remain dark; land and ice carry the bright photocopy ink.
      const land = Math.max(0, Math.min(1, (r * .65 + g * .7 - b * .82 - 5) / 43));
      const relief = (.3 * r + .59 * g + .11 * b) / 255;
      const intensity = Math.min(1, (.16 + land * .61 + relief * .22) * point.light);
      const scaled = Math.max(0, Math.min(4, intensity * 4));
      const low = Math.floor(scaled);
      const tone = Math.min(4, low + (scaled - low > point.threshold ? 1 : 0));
      const value = palette[tone];
      const index = point.index;
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = Math.max(0, value - 6);
      data[index + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function canRun() {
    return ready && visible && !paused && !reduced.matches && !document.hidden && !content.hidden;
  }

  function tick(time) {
    raf = 0;
    if (!canRun()) { lastTime = null; return; }
    if (lastTime === null) lastTime = time;
    const elapsed = time - lastTime;
    if (elapsed >= frameInterval) {
      rotation = (rotation + Math.min(elapsed, 150) / revolutionMs) % 1;
      lastTime = time;
      paint();
    }
    raf = requestAnimationFrame(tick);
  }

  function sync() {
    if (canRun()) {
      if (!raf) { lastTime = null; raf = requestAnimationFrame(tick); }
    } else {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      lastTime = null;
    }
  }

  function fallback() {
    ready = false;
    failed = true;
    sphere.dataset.ready = 'false';
    reflectButton();
    sync();
  }

  toggle.addEventListener('click', () => { paused = !paused; reflectButton(); sync(); });
  reduced.addEventListener('change', () => { reflectButton(); sync(); });
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(panel);
  new MutationObserver(sync).observe(content, { attributes: true, attributeFilter: ['hidden'] });
  addEventListener('pagehide', () => { if (raf) cancelAnimationFrame(raf); raf = 0; lastTime = null; });
  addEventListener('pageshow', sync);
  reflectButton();
  if (!ctx) { fallback(); return; }

  const radius = size / 2 - 2;
  imageData = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x - size / 2) / radius, ny = (size / 2 - y) / radius;
      const rr = nx * nx + ny * ny;
      if (rr > 1) continue;
      const nz = Math.sqrt(1 - rr);
      const longitude = (Math.atan2(nx, nz) / tau + 1) % 1;
      const latitude = Math.asin(ny) / Math.PI;
      const light = .14 + 1.06 * Math.max(0, -nx * .45 + ny * .3 + nz * .84);
      surface.push({ index: (y * size + x) * 4, longitude: Math.floor(longitude * textureWidth), row: Math.max(0, Math.min(textureHeight - 1, Math.floor((.5 - latitude) * textureHeight))), light, threshold: (bayer[(y % 4) * 4 + (x % 4)] + .5) / 16 });
    }
  }
  const map = new Image();
  map.crossOrigin = 'anonymous';
  map.onload = async () => {
    try {
      await map.decode();
      const source = document.createElement('canvas');
      source.width = textureWidth; source.height = textureHeight;
      const sourceContext = source.getContext('2d', { willReadFrequently: true });
      if (!sourceContext) { fallback(); return; }
      sourceContext.drawImage(map, 0, 0, textureWidth, textureHeight);
      texture = sourceContext.getImageData(0, 0, textureWidth, textureHeight).data;
      ready = true;
      paint();
      sphere.dataset.ready = 'true';
      sync();
    } catch { fallback(); }
  };
  map.onerror = fallback;
  map.src = 'assets/earth-atmos-2048.jpg';
})();
