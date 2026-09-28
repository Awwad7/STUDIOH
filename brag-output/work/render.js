// usage: node render.js stills <outdir> t1 t2 ...   |   node render.js video <out.mp4>
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require(process.env.PW_CORE || 'playwright-core');

const FPS = 30, DUR = 23.5;
const [mode, out, ...times] = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--force-color-profile=srgb', '--hide-scrollbars', '--font-render-hinting=none'],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, 'index.html'));
  await page.evaluate(() => document.fonts.ready);
  const draw = t => page.evaluate(t => { window.render(t); return document.fonts.ready.then(() => 0); }, t);

  if (mode === 'stills') {
    for (const t of times) {
      await draw(parseFloat(t));
      await page.screenshot({ path: path.join(out, `still_${t}.png`) });
    }
  } else {
    const ff = spawn(process.env.FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round(DUR * FPS);
    for (let i = 0; i < n; i++) {
      await draw(i / FPS);
      const buf = await page.screenshot({ type: 'png' });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 60 === 0) process.stdout.write(`frame ${i}/${n}\n`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
