const { createPlaywrightRunner } = require('/home/user/arena-forge-online-server/replay_worker');
const fs = require('fs');
(async () => {
  const [recPath, html] = process.argv.slice(2);
  const rec = JSON.parse(fs.readFileSync(recPath, 'utf8'));
  const run = createPlaywrightRunner({ htmlPath: html });
  const out = {};
  for (const headless of [false, true]) {
    const t = Date.now(); const r = await run(rec, { headless });
    out[headless ? 'headless' : 'draw'] = { ms: Date.now() - t, frames: r.frames, matched: r.matchedFinal, ck: (r.ckMismatch || []).length, err: r.error, fin: r.fin && r.fin.hash, stop: r.stop, errs: r.errs && r.errs.length };
  }
  console.log(JSON.stringify(out));
})();
