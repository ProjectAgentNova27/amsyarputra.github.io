// Development-only. Install/locate Playwright, jsQR, sharp and JSZip separately.
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium, webkit, devices } = require('playwright');
const jsQR = require('jsqr');
const sharp = require('sharp');
const JSZip = require('jszip');

const root = path.resolve(__dirname, '..');
const baseline = '5f073880d2231e9a80526bc4a552f08951cc4e26';
const screenshotDir = process.env.SCREENSHOT_DIR;
const capturing = new WeakSet();
const single = 'Workshop handover\n\nThe demo kits are on shelf B.\nLabel the spare cables before packing.\n\nTomorrow\nSet out four practice boards and test the projector before the practice session.';
const report = [
    'Morning setup\n\n' +
        'Set four demonstration boards along the west wall. Leave the aisle clear from the entrance to the back table. ' +
        'Put the spare markers, masking tape and blank labels in the shallow tray beside the sign-in sheet. ' +
        'Use the printed room plan to match the bench numbers to the practice stations. ' +
        'Run the projector with the sample slides and confirm that the timer is visible from the far bench. ' +
        'If the screen looks washed out, close the left blind halfway. ' +
        'Leave one assembled sample kit at each station and put the unopened kits under the centre table. ' +
        'Keep a small stack of blank scorecards at the door for late arrivals.',
    'Practice session\n\n' +
        'Start each group with a two-minute walk-through of the sample board. ' +
        'Give everyone a blank scorecard and ask them to mark the three checkpoints before moving to the next station. ' +
        'Record the station number and the type of issue if a kit needs a replacement part. ' +
        'When the timer sounds, ask each group to put loose parts in the tray and move clockwise. ' +
        'Leave the projector on the reference slide during the rotation. ' +
        'Keep one spare kit on the centre table so the session can continue if a component is missing. ' +
        'Before the final round, collect the completed practice cards and compare the station counts with the sign-in sheet.',
    'End-of-day handover\n\n' +
        'Return spare leads to the labelled trays and put the sample cards back in order. ' +
        'Check that each kit contains a board, a lead and a blank label. ' +
        'Place incomplete kits on the left shelf with a paper note showing what is missing. ' +
        'Put the used scorecards in the blue folder and leave the clean copies in the sign-in tray. ' +
        'Switch off the projector after the fan has stopped. ' +
        'Move the demonstration boards back to the storage rack, with the numbered tags facing out. ' +
        'Leave the room plan on top of the blue folder so the next group can find the layout. ' +
        'The following session starts with the same setup and a fresh set of practice cards.'
].join('\n\n');

const cases = [
    ['178 with paragraphs', single, 1],
    ['799', 'a'.repeat(799), 1],
    ['800', 'b'.repeat(800), 1],
    ['801', 'c'.repeat(801), 2],
    ['1600', 'd'.repeat(1600), 2],
    ['2400', 'e'.repeat(2400), 3],
    ['report', report, 3],
    ['Unicode punctuation', 'It’s ready — “check again”…\n\nD’Angelo’s sample: café, 東京.', 1],
    ['CRLF, LF and blank runs', 'First.\r\n\r\nSecond.\n\n\nThird.\rLast line.\r\n', 1],
    ['long sentences', 'First ' + 'sample '.repeat(174) + 'ends. Second ' + 'fixture '.repeat(96) + 'ends.'],
    ['long tokens', 'Start here.\n\n' + 'x'.repeat(901) + '\n\nEnd.'],
    ['Unicode capacity', '🧪'.repeat(800), undefined, 2]
];

const mime = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
    '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon', '.woff2': 'font/woff2'
};
let version = 'candidate';
let missing = '';
let originUnavailable = false;
const requests = [];
const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, 'http://localhost');
    requests.push([request.method, request.url]);
    if (originUnavailable) {
        request.socket.destroy();
        return;
    }
    if (url.pathname === '/test-health') {
        response.writeHead(200, { 'Content-Type': 'text/html' }).end('<title>Local fixture</title>');
        return;
    }
    let file = url.pathname.slice(1);
    if (file === 'tools/qr/') file += 'index.html';
    if (file === missing || (file !== 'favicon.png' && !/^(tools\/qr|assets)\/[\w./-]+$/.test(file)) || file.includes('..')) {
        response.writeHead(404).end();
        return;
    }
    try {
        const data = version === 'baseline' && file.startsWith('tools/qr/') && !file.startsWith('tools/qr/v2/') ?
            execFileSync('git', ['show', baseline + ':' + file], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }) :
            await fs.readFile(path.join(root, file));
        response.writeHead(200, {
            'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream',
            'Cache-Control': 'no-store',
            'Content-Security-Policy': "default-src 'self'; object-src 'none'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
            'X-Content-Type-Options': 'nosniff'
        }).end(data);
    } catch (_) {
        response.writeHead(404).end();
    }
});

async function decode(buffer) {
    assert.deepEqual([...buffer.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.equal(info.width, 1024);
    assert.equal(info.height, 1024);
    const qr = jsQR(new Uint8ClampedArray(data.buffer, data.byteOffset, data.length), info.width, info.height);
    assert.ok(qr, 'PNG decodes');
    for (const coordinate of [0, 1023, 1024 * 1023, 1024 * 1024 - 1]) {
        assert.equal(data[coordinate * 4], 255, 'white quiet-zone corner');
    }
    return qr.data;
}

async function paste(page, text) {
    const input = page.locator('textarea');
    await input.fill('');
    await input.evaluate((element, text) => {
        const clipboardData = new DataTransfer();
        clipboardData.setData('text/plain', text);
        element.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }));
    }, text);
}

async function generate(page, text) {
    await paste(page, text);
    await page.locator('#generate').click();
    await page.locator('#results').waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Generate QR' }).waitFor();
    const previews = await page.locator('.qr-image').evaluateAll(images => images.map(img => img.src.split(',')[1]));
    return previews.map(base64 => Buffer.from(base64, 'base64'));
}

async function waitOffline(page, ready = true) {
    await page.waitForFunction(ready => document.querySelector('#offline-status').textContent ===
        (ready ? 'Offline ready' : 'Offline not ready'), ready);
}

async function download(page, button, name) {
    const [file] = await Promise.all([page.waitForEvent('download'), button.click()]);
    assert.equal(file.suggestedFilename(), name);
    const filename = await file.path();
    return fs.readFile(filename);
}

async function screenshot(page, filename) {
    if (!screenshotDir) return;
    await fs.mkdir(screenshotDir, { recursive: true });
    await page.evaluate(() => document.fonts.ready);
    for (const img of await page.locator('.qr-image').all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(image => image.decode());
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    capturing.add(page);
    try {
        await page.screenshot({ path: path.join(screenshotDir, filename), fullPage: true, caret: 'initial' });
        await page.evaluate(() => document.readyState);
    } finally {
        capturing.delete(page);
    }
}

async function layout(page) {
    const metrics = await page.evaluate(() => ({
        page: document.documentElement.scrollWidth,
        viewport: innerWidth,
        editor: parseFloat(getComputedStyle(document.querySelector('textarea')).fontSize),
        controls: [...document.querySelectorAll('button')].filter(button => button.offsetHeight).map(button => button.offsetHeight),
        font: document.fonts.check('16px Inter')
    }));
    assert.ok(metrics.page <= metrics.viewport, JSON.stringify(metrics));
    assert.ok(metrics.editor >= 16 && metrics.controls.every(height => height >= 44) && metrics.font);
}

async function browserSuite(browser, engine, url, split) {
    const isWebKit = engine === 'webkit';
    const context = await browser.newContext({
        ...devices[isWebKit ? 'iPhone 13' : 'Pixel 7'],
        viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'dark',
        acceptDownloads: true
    });
    const errors = [];
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        const text = message.text();
        // Playwright's WebKit capture injects an inline body {} stylesheet to
        // sync animations. Both CSP policies intentionally reject that style.
        if (capturing.has(page) && /^Refused to apply a stylesheet/.test(text) && message.location().lineNumber === 0) return;
        if (/content security policy|refused to/i.test(text)) errors.push({ text, location: message.location() });
    });
    const visited = new Set();
    context.on('request', request => visited.add(request.url()));
    await page.goto(url);
    await waitOffline(page);
    await page.evaluate(() => document.fonts.ready);
    await layout(page);
    if (isWebKit) await screenshot(page, 'A-iphone-dark-empty.png');
    await page.locator('#generate').click();
    await page.getByText('Paste or type some text first.', { exact: true }).waitFor();
    if (isWebKit) await screenshot(page, 'F-iphone-dark-validation.png');

    const requestCount = requests.length;
    for (const [name, value, expected, min] of cases) {
        const previews = await generate(page, value);
        if (expected) assert.equal(previews.length, expected, name);
        if (min) assert.ok(previews.length >= min, name);
        const decoded = [];
        for (const preview of previews) decoded.push(await decode(preview));
        assert.ok(decoded.every(chunk => split.countCharacters(chunk) <= 800), name);
        assert.equal(decoded.join(''), value, name);
        if (isWebKit && name === '178 with paragraphs') await screenshot(page, 'B-iphone-dark-one-qr.png');
    }
    const previews = await generate(page, report);
    if (isWebKit) await screenshot(page, 'C-iphone-dark-three-qr.png');

    const png = await download(page, page.getByRole('button', { name: 'Save PNG, QR 2 of 3', exact: true }), 'AP_QR_02_of_3.png');
    assert.deepEqual(png, previews[1]);
    const zip = await download(page, page.locator('#save-all'), 'AP_QR_Codes.zip');
    const archive = await JSZip.loadAsync(zip, { checkCRC32: true });
    assert.deepEqual(Object.keys(archive.files), ['AP_QR_01_of_3.png', 'AP_QR_02_of_3.png', 'AP_QR_03_of_3.png']);
    for (const [index, file] of Object.values(archive.files).entries()) {
        assert.deepEqual(await file.async('nodebuffer'), previews[index]);
    }

    await page.evaluate(() => {
        const canned = (property, value) => Object.defineProperty(navigator, property, { configurable: true, value });
        canned('share', async ({ files }) => { window.testShared = files.map(file => file.name); });
        canned('canShare', () => true);
        canned('clipboard', {
            readText: async () => 'Sample A\r\n\r\nSample B',
            writeText: async text => { window.testCopied = text; }
        });
    });
    await page.getByRole('button', { name: 'Share, QR 2 of 3', exact: true }).click();
    assert.deepEqual(await page.evaluate(() => window.testShared), ['AP_QR_02_of_3.png']);
    await page.locator('#share-all').click();
    assert.equal((await page.evaluate(() => window.testShared)).length, 3);
    await page.evaluate(() => Object.defineProperty(navigator, 'canShare', {
        configurable: true, value: ({ files }) => files.every(file => file.type === 'application/zip')
    }));
    await page.locator('#share-all').click();
    await page.waitForFunction(() => window.testShared[0] === 'AP_QR_Codes.zip');
    await page.getByRole('button', { name: 'Copy text, QR 2 of 3', exact: true }).click();
    assert.equal(await page.evaluate(() => window.testCopied), await decode(previews[1]));
    await page.evaluate(() => Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => false }));
    await download(page, page.getByRole('button', { name: 'Share, QR 2 of 3', exact: true }), 'AP_QR_02_of_3.png');
    await download(page, page.locator('#share-all'), 'AP_QR_Codes.zip');
    await page.evaluate(() => {
        Object.defineProperty(navigator, 'canShare', { value: () => true });
        Object.defineProperty(navigator, 'share', { value: async () => { throw new DOMException('test', 'NotAllowedError'); } });
    });
    await page.locator('#share-all').click();
    await page.getByText('Sharing failed. Try Save ZIP.', { exact: true }).waitFor();
    await page.evaluate(() => {
        window.savedCreateURL = URL.createObjectURL;
        URL.createObjectURL = () => { throw new Error('Synthetic export failure'); };
    });
    await page.locator('#save-all').click();
    await page.getByText('The ZIP download could not start. Try again.', { exact: true }).waitFor();
    await page.evaluate(() => { URL.createObjectURL = window.savedCreateURL; });

    await page.locator('#paste').click();
    await page.locator('#generate').click();
    await page.locator('#results').waitFor({ state: 'visible' });
    assert.equal(await decode(Buffer.from((await page.locator('.qr-image').getAttribute('src')).split(',')[1], 'base64')), 'Sample A\r\n\r\nSample B');
    await page.locator('#clear').click();
    assert.equal(await page.locator('textarea').inputValue(), '');
    assert.equal(await page.locator('#results').isHidden(), true);

    await page.getByRole('button', { name: /Appearance/ }).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    if (isWebKit) {
        await generate(page, single);
        await screenshot(page, 'D-iphone-light.png');
    }
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    assert.equal(await page.locator('textarea').inputValue(), '');
    assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), ['ap-qr-theme']);
    assert.deepEqual(await page.evaluate(() => Object.keys(sessionStorage)), []);
    originUnavailable = true;
    const coldPage = await context.newPage();
    try {
        await coldPage.goto(url);
        await waitOffline(coldPage);
        const offlinePreviews = await generate(coldPage, single);
        assert.equal(await decode(offlinePreviews[0]), single);
    } finally {
        originUnavailable = false;
    }
    const cache = await coldPage.evaluate(async () => {
        const keys = await caches.keys();
        const entries = await (await caches.open(keys[0])).keys();
        return { keys, entries: entries.map(entry => entry.url) };
    });
    assert.deepEqual(cache.keys, ['ap-qr-static-v2']);
    assert.equal(cache.entries.length, 17);
    assert.ok(cache.entries.every(entry => /^http:\/\/127\.0\.0\.1:\d+\/(tools\/qr|assets)\//.test(entry)));
    assert.ok(requests.slice(requestCount).every(([method, target]) => method === 'GET' &&
        /^\/(tools\/qr|assets)\/[a-z0-9/_.-]*$/i.test(target)), 'only static GET requests');
    assert.ok([...visited].every(request => request.startsWith(new URL(url).origin)), 'no cross-origin traffic');
    assert.deepEqual(errors, []);
    await context.close();
    console.log(engine + ' ' + browser.version() + ': PNG decode/quiet zone, ZIP CRC and order, share and copy, fallbacks, privacy, offline restart PASS');

    const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', colorScheme: 'dark' });
    const wide = await desktop.newPage();
    await wide.goto(url);
    await waitOffline(wide);
    await wide.evaluate(() => document.fonts.ready);
    await generate(wide, report);
    assert.ok(await wide.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches));
    for (const width of [320, 390, 440, 768, 1440]) {
        await wide.setViewportSize({ width, height: 1000 });
        await layout(wide);
    }
    if (isWebKit) await screenshot(wide, 'E-desktop-dark.png');
    await desktop.close();
    console.log(engine + ': 320/390/440/768/1440px, dark/light, reduced motion PASS');
}

async function updates(browser, url) {
    const context = await browser.newContext();
    context.setDefaultTimeout(10_000);
    const page = await context.newPage();
    version = 'baseline';
    await page.goto(url);
    await waitOffline(page);
    version = 'candidate';
    missing = 'tools/qr/v2/zip.js';
    await page.evaluate(async () => {
        const reg = await navigator.serviceWorker.getRegistration();
        const finish = new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Incomplete worker did not fail')), 8000);
            reg.addEventListener('updatefound', () => {
                const worker = reg.installing;
                worker.addEventListener('statechange', () => {
                    if (worker.state === 'redundant') {
                        clearTimeout(timer);
                        resolve();
                    }
                });
            }, { once: true });
        });
        await reg.update();
        await finish;
    });
    assert.equal(await page.locator('meta[name=ap-qr-release]').count(), 0);
    missing = '';
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
    await page.waitForFunction(async () => (await navigator.serviceWorker.getRegistration()).waiting?.state === 'installed');
    await page.reload();
    assert.equal(await page.locator('meta[name=ap-qr-release]').count(), 0, 'open v1 client continues using v1');
    await page.close();
    const next = await context.newPage();
    await next.goto(new URL('/test-health', url).href);
    await next.waitForFunction(async () => !(await caches.has('ap-qr-static-v1')) && await caches.has('ap-qr-static-v2'));
    await next.goto(url);
    await waitOffline(next);
    assert.equal(await next.locator('meta[name=ap-qr-release]').getAttribute('content'), '2');
    assert.deepEqual(await next.evaluate(() => caches.keys()), ['ap-qr-static-v2']);
    originUnavailable = true;
    const cold = await context.newPage();
    await cold.goto(url);
    assert.equal(await decode((await generate(cold, single))[0]), single);
    await cold.close();
    originUnavailable = false;
    await next.evaluate(async () => (await caches.open('ap-qr-static-v2')).delete('/tools/qr/v2/icon-512.png'));
    originUnavailable = true;
    await next.reload();
    await waitOffline(next, false);
    originUnavailable = false;
    await next.reload();
    await waitOffline(next);
    assert.equal(await next.evaluate(async () => (await (await caches.open('ap-qr-static-v2')).keys()).length), 17);
    version = 'baseline';
    await next.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
    await next.waitForFunction(async () => await caches.has('ap-qr-static-v1') && !(await caches.has('ap-qr-static-v2')));
    assert.equal(await decode((await generate(next, single))[0]), single, 'the open v2 page still generates');
    await next.reload();
    await waitOffline(next);
    assert.equal(await next.locator('meta[name=ap-qr-release]').count(), 0);
    await context.close();
    console.log('Chromium: v1 → v2 failed install, waiting worker, active-client continuity, offline restart, cache repair and scoped rollback PASS');
}

async function main() {
    const split = await import(pathToFileURL(path.join(root, 'tools/qr/v2/splitter.js')));
    const editor = await import(pathToFileURL(path.join(root, 'tools/qr/v2/editor.js')));
    assert.equal(single.length, 178);
    assert.throws(() => split.splitText(''), /some text/);
    for (const [name, value, expected] of cases) {
        const chunks = split.splitText(value);
        if (expected) assert.equal(chunks.length, expected, name);
        assert.equal(chunks.join(''), value, name);
        assert.ok(chunks.every(chunk => split.countCharacters(chunk) <= 800), name);
    }
    assert.equal(split.splitText('a'.repeat(600) + '\r\n\r\n' + 'b'.repeat(400))[0], 'a'.repeat(600) + '\r\n\r\n');
    assert.equal(split.splitText('a'.repeat(699) + '. ' + 'b'.repeat(400))[0], 'a'.repeat(699) + '. ');
    assert.equal(split.splitText('a'.repeat(799) + ' ' + 'b'.repeat(400))[0].length, 800);
    assert.equal(split.splitText('a'.repeat(799) + '\r\n' + 'b'.repeat(400))[0].length, 799);
    assert.equal(editor.reconcileEdit('A\r\nB\nC', 'A\nNew B\nC', [2, 2]), 'A\r\nNew B\nC');
    console.log('Deterministic splitter and pasted line ending tests PASS');
    if (process.env.QR_UNIT_ONLY) return;

    await new Promise((resolve, reject) => server.listen(0, '127.0.0.1', resolve).once('error', reject));
    const url = 'http://127.0.0.1:' + server.address().port + '/tools/qr/';
    for (const [engine, runner] of [['webkit', webkit], ['chromium', chromium]]) {
        if (process.env.QR_ENGINE && process.env.QR_ENGINE !== engine) continue;
        const browser = await runner.launch(engine === 'chromium' && process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
        try {
            if (!process.env.QR_UPDATE_ONLY) await browserSuite(browser, engine, url, split);
            if (engine === 'chromium') await updates(browser, url);
        } finally {
            await browser.close();
        }
    }
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
