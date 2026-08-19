const port = Number(process.env.PHONE_BEAUTY_CDP_PORT || 9227);
const baseUrl = `http://127.0.0.1:${port}`;
const targetUrl = process.argv.find(value => value.startsWith('http')) || 'http://127.0.0.1:8771/design-drafts/phone-beauty/integrated-preview.html';
const viewportWidth = Number(process.env.PHONE_BEAUTY_VIEWPORT_WIDTH || 375);
const viewportHeight = Number(process.env.PHONE_BEAUTY_VIEWPORT_HEIGHT || 812);
const emulateReducedMotion = process.env.PHONE_BEAUTY_REDUCED_MOTION === '1';
const enlargeText = process.env.PHONE_BEAUTY_LARGE_TEXT === '1';
const screenshotOutput = process.argv.find(value => value.startsWith('--output='))?.slice('--output='.length) || '';

const target = await fetch(`${baseUrl}/json/new?${encodeURIComponent(targetUrl)}`, { method: 'PUT' }).then(response => {
  if (!response.ok) throw new Error(`Unable to create browser target: ${response.status}`);
  return response.json();
});

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let messageId = 0;
const pending = new Map();
socket.addEventListener('message', event => {
  const message = JSON.parse(String(event.data));
  if (!message.id || !pending.has(message.id)) return;
  const handlers = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) handlers.reject(new Error(message.error.message)); else handlers.resolve(message.result);
});

const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++messageId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'Browser evaluation failed');
  return result.result.value;
};

await call('Page.enable');
await call('Runtime.enable');
await call('Emulation.setDeviceMetricsOverride', {
  width: viewportWidth,
  height: viewportHeight,
  deviceScaleFactor: 1,
  mobile: true,
  screenWidth: viewportWidth,
  screenHeight: viewportHeight,
});
if (emulateReducedMotion) {
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
}
await call('Page.navigate', { url: targetUrl });

let ready = false;
for (let attempt = 0; attempt < 80; attempt += 1) {
  ready = await evaluate(`document.readyState === 'complete' && [...document.querySelectorAll('iframe')].length === 4 && [...document.querySelectorAll('iframe')].every(frame => frame.contentDocument?.querySelector('.zeya-regex-status.is-phone-home'))`);
  if (ready) break;
  await new Promise(resolve => setTimeout(resolve, 50));
}
if (!ready) throw new Error('Integrated phone previews did not become ready');

if (enlargeText) {
  await evaluate(`[...document.querySelectorAll('iframe')].forEach(frame => { frame.contentDocument.documentElement.style.fontSize = '125%'; })`);
}

const initial = await evaluate(`(() => {
  const frames = [...document.querySelectorAll('iframe')];
  return {
    viewport: [innerWidth, innerHeight],
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    largeText: ${enlargeText},
    shells: frames.map(frame => {
      const doc = frame.contentDocument;
      const root = doc.querySelector('.zeya-regex-status');
      const buttons = [...doc.querySelectorAll('.zrs-tab')];
      const rootRect = root.getBoundingClientRect();
      return {
        shellStyle: root.dataset.phoneShell,
        appCount: buttons.length,
        appTargetMinimum: buttons.every(button => {
          const rect = button.getBoundingClientRect();
          return rect.width >= 44 && rect.height >= 44;
        }),
        frameHorizontalOverflow: doc.documentElement.scrollWidth > frame.clientWidth,
        rootFitsFrame: rootRect.left >= 0 && rootRect.right <= frame.clientWidth + 1,
        orbitAnimation: root.dataset.phoneShell === 'orbit' ? getComputedStyle(doc.querySelector('.zrs-tabs')).animationName : null,
      };
    }),
  };
})()`);

const interactionPlan = [['classic', 'Personal'], ['clamshell', 'Memo'], ['orbit', 'Wechat'], ['slider', 'Shop']];
const interactions = [];
for (const [shellStyle, appId] of interactionPlan) {
  interactions.push(await evaluate(`(() => {
    const article = document.querySelector('[data-shell="${shellStyle}"]');
    const doc = article.querySelector('iframe').contentDocument;
    const root = doc.querySelector('.zeya-regex-status');
    doc.querySelector('.zrs-app-icon[data-app-id="${appId}"]').closest('button').click();
    const back = doc.querySelector('.zrs-phone-back');
    const backRect = back.getBoundingClientRect();
    const opened = !root.classList.contains('is-phone-home') && root.dataset.phonePage === '${appId}' && getComputedStyle(doc.querySelector('.zrs-fields')).display !== 'none';
    const dockVisibleOnPage = getComputedStyle(doc.querySelector('.zrs-tabs')).display !== 'none';
    back.click();
    return {
      shellStyle: '${shellStyle}',
      appId: '${appId}',
      opened,
      backTargetMinimum: backRect.width >= 44 && backRect.height >= 44,
      dockVisibleOnPage,
      returnedHome: root.classList.contains('is-phone-home'),
    };
  })()`));
}

if (screenshotOutput) {
  await evaluate(`document.querySelector('[data-shell="clamshell"]').scrollIntoView({ block: 'start', behavior: 'instant' })`);
  const capture = await call('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  const { mkdir, writeFile } = await import('node:fs/promises');
  const { dirname } = await import('node:path');
  await mkdir(dirname(screenshotOutput), { recursive: true });
  await writeFile(screenshotOutput, Buffer.from(capture.data, 'base64'));
}

console.log(JSON.stringify({ initial, interactions, screenshotOutput }, null, 2));
socket.close();
