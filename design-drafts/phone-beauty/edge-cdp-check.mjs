const port = Number(process.env.PHONE_BEAUTY_CDP_PORT || 9227);
const baseUrl = `http://127.0.0.1:${port}`;
const targetUrl = process.argv.find(value => value.startsWith('http')) || 'http://127.0.0.1:8765/';
const screenshotOnly = process.argv.includes('--screenshot');
const screenshotOutput = process.argv.find(value => value.startsWith('--output='))?.slice('--output='.length) || '';
const viewportWidth = Number(process.env.PHONE_BEAUTY_VIEWPORT_WIDTH || 375);
const viewportHeight = Number(process.env.PHONE_BEAUTY_VIEWPORT_HEIGHT || 812);
const emulateReducedMotion = process.env.PHONE_BEAUTY_REDUCED_MOTION === '1';
const screenshotPrototype = process.env.PHONE_BEAUTY_SCREENSHOT_PROTOTYPE || 'clamshell';
const screenshotApp = process.env.PHONE_BEAUTY_SCREENSHOT_APP || '';

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
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
});

const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++messageId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});

const evaluate = async expression => {
  const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Browser evaluation failed');
  return result.result.value;
};

await call('Page.enable');
await call('Runtime.enable');
await call('Emulation.setDeviceMetricsOverride', {
  width: viewportWidth, height: viewportHeight, deviceScaleFactor: 1, mobile: true,
  screenWidth: viewportWidth, screenHeight: viewportHeight,
});
if (emulateReducedMotion) await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await call('Page.navigate', { url: targetUrl });

for (let attempt = 0; attempt < 40; attempt += 1) {
  if (await evaluate("document.readyState === 'complete' && document.querySelectorAll('.shell').length === 3")) break;
  await new Promise(resolve => setTimeout(resolve, 50));
}

if (screenshotOnly) {
  await evaluate(`(() => {
    const article = document.getElementById(${JSON.stringify(screenshotPrototype)});
    const appId = ${JSON.stringify(screenshotApp)};
    if (appId) article.querySelector('[data-app-id="' + appId + '"]')?.click();
    article.scrollIntoView({block:'start', behavior:'instant'});
    return true;
  })()`);
  await new Promise(resolve => setTimeout(resolve, 450));
  const capture = await call('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  if (screenshotOutput) {
    const { writeFile } = await import('node:fs/promises');
    await writeFile(screenshotOutput, Buffer.from(capture.data, 'base64'));
    console.log(screenshotOutput);
  } else {
    console.log(capture.data);
  }
  socket.close();
  process.exit(0);
}

const initial = await evaluate(`(() => {
  const shells = [...document.querySelectorAll('.shell')];
  const appButtons = [...document.querySelectorAll('.phone-app')];
  const backTargets = [...document.querySelectorAll('.back-button')];
  return {
    viewport: [innerWidth, innerHeight],
    shellTypes: shells.map(shell => shell.dataset.phoneShell),
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    appTargetMinimum: appButtons.every(button => button.getBoundingClientRect().width >= 44 && button.getBoundingClientRect().height >= 44),
    initialBackButtonCount: backTargets.length,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    orbitAnimationDuration: getComputedStyle(document.querySelector('.orbit-ring')).animationDuration,
  };
})()`);

const interactions = [];
for (const [prototypeId, appId] of [['clamshell', 'Personal'], ['orbit', 'Wechat'], ['slider', 'Shop']]) {
  interactions.push(await evaluate(`(() => {
    const article = document.getElementById(${JSON.stringify(prototypeId)});
    const shell = article.querySelector('.shell');
    article.querySelector('[data-app-id=${JSON.stringify(appId)}]').click();
    const back = shell.querySelector('.back-button');
    const opened = shell.dataset.activeApp === ${JSON.stringify(appId)} && !shell.querySelector('.screen-page').hidden;
    const backRect = back.getBoundingClientRect();
    back.click();
    return {
      prototypeId: ${JSON.stringify(prototypeId)}, appId: ${JSON.stringify(appId)}, opened,
      backTargetMinimum: backRect.width >= 44 && backRect.height >= 44,
      returnedHome: !shell.dataset.activeApp && !shell.querySelector('.screen-home').hidden,
    };
  })()`));
}

console.log(JSON.stringify({ initial, interactions }, null, 2));
socket.close();
