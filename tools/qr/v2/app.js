import { MAX_QR_CHARACTERS, countCharacters, splitText, splitOversizedEncoding } from './splitter.js';
import { normalized, rawOffset, reconcileEdit } from './editor.js';
import { zipFiles } from './zip.js';

const byId = id => document.getElementById(id);
const editor = byId('input-text');
const generateButton = byId('generate');
const generateLabel = byId('generate-label');
const list = byId('qr-list');
const results = byId('results');
const editorNotice = byId('editor-notice');
const batchNotice = byId('batch-notice');
const template = byId('qr-card');
const inputLimit = 100_000;
const outputLimit = 256;
const pngSize = 1024;

let text = '';
let revision = 0;
let selection;
let items = [];
let busy = false;

function notify(element, message = '', error = false) {
    element.textContent = message;
    element.classList.toggle('error', error);
}

function updateEditor(value) {
    text = value;
    revision++;
    const count = countCharacters(text);
    byId('input-count').textContent = count.toLocaleString() + (count === 1 ? ' character' : ' characters');
    notify(editorNotice);
    if (items.length) {
        items = [];
        list.replaceChildren();
        results.hidden = true;
    }
}

function setBusy(state) {
    busy = state;
    generateButton.disabled = state;
    generateLabel.textContent = state ? 'Generating…' : 'Generate QR';
}

function fileName(index, total) {
    const width = Math.max(2, String(total).length);
    return 'AP_QR_' + String(index + 1).padStart(width, '0') + '_of_' + total + '.png';
}

function encode(payload) {
    return window.QRCode({ msg: payload, pad: 4, ecl: 'M', ecb: 0 });
}

function renderPng(svg, canvas, context) {
    const units = Number(svg.getAttribute('viewBox').split(' ')[2]);
    const scale = Math.floor(pngSize / units);
    const inset = Math.floor((pngSize - units * scale) / 2) + 4 * scale;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = '#fff';
    context.fillRect(0, 0, pngSize, pngSize);
    context.setTransform(scale, 0, 0, scale, inset, inset);
    context.fillStyle = '#000';
    context.fill(new Path2D(svg.lastElementChild.getAttribute('d')));
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (!blob?.size) {
                reject(new Error('The QR image could not be created. Try again.'));
                return;
            }
            const reader = new FileReader();
            reader.onload = () => resolve({ blob, preview: reader.result });
            reader.onerror = () => reject(new Error('The QR preview could not be created. Try again.'));
            reader.readAsDataURL(blob);
        }, 'image/png');
    });
}

function renderResults(batch, count) {
    const fragment = document.createDocumentFragment();
    batch.forEach((item, index) => {
        const card = template.content.cloneNode(true);
        const label = 'QR ' + (index + 1) + ' of ' + batch.length;
        card.querySelector('article').dataset.index = index;
        card.querySelector('h3').textContent = label;
        card.querySelector('.qr-count').textContent = countCharacters(item.text).toLocaleString() + ' characters';
        const image = card.querySelector('img');
        image.src = item.preview;
        image.alt = label;
        if (index === 0) image.loading = 'eager';
        for (const button of card.querySelectorAll('button')) {
            button.setAttribute('aria-label', button.textContent.trim() + ', ' + label);
        }
        fragment.append(card);
    });
    list.replaceChildren(fragment);
    byId('result-summary').textContent = count.toLocaleString() + (count === 1 ? ' character' : ' characters') +
        (batch.length === 1 ? ' in 1 code' : ' across ' + batch.length + ' codes');
    byId('batch-actions').hidden = batch.length < 2;
    notify(batchNotice);
    results.hidden = false;
    if (!document.activeElement || [document.body, generateButton].includes(document.activeElement)) {
        byId('results-title').focus({ preventScroll: true });
        byId('results-title').scrollIntoView({ block: 'nearest' });
    }
}

async function generate() {
    if (busy) return;
    const original = text;
    const count = countCharacters(original);
    if (!count || count > inputLimit) {
        notify(editorNotice, count ? 'Use up to 100,000 characters per batch.' : 'Paste or type some text first.', true);
        if (!count) editor.focus();
        return;
    }
    if (typeof window.QRCode !== 'function') {
        notify(editorNotice, 'The QR encoder is unavailable. Reopen the app online.', true);
        return;
    }

    const start = revision;
    const batch = [];
    setBusy(true);
    editor.blur();
    notify(editorNotice);
    try {
        const queue = splitText(original).reverse();
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = pngSize;
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new Error('This browser could not start image generation.');

        while (queue.length) {
            // Give the browser time to paint and process edits between images.
            await new Promise(resolve => setTimeout(resolve, 0));
            if (revision !== start) return;
            if (batch.length + queue.length > outputLimit) {
                throw new Error('This batch needs more than 256 QR codes. Generate it in smaller sections.');
            }
            const payload = queue.pop();
            let svg;
            try {
                svg = encode(payload);
            } catch (error) {
                if (error instanceof RangeError && /too long/i.test(error.message)) {
                    const [first, second] = splitOversizedEncoding(payload);
                    queue.push(second, first);
                    continue;
                }
                if (error instanceof RangeError && /utf-16/i.test(error.message)) {
                    throw new Error('The text contains an incomplete Unicode character. Check the pasted text.');
                }
                throw error;
            }
            batch.push({ text: payload, ...await renderPng(svg, canvas, context) });
        }
        if (revision !== start) return;
        if (batch.some(item => countCharacters(item.text) > MAX_QR_CHARACTERS) ||
            batch.map(item => item.text).join('') !== original) {
            throw new Error('The text could not be split without changes. No new codes were saved.');
        }
        renderResults(batch, count);
        items = batch;
    } catch (error) {
        if (revision === start) notify(editorNotice, error instanceof Error ? error.message : 'Generation failed. Try again.', true);
    } finally {
        setBusy(false);
    }
}

function saveBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = name;
    link.href = url;
    document.body.append(link);
    try {
        link.click();
    } finally {
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30_000);
    }
}

function shareFiles(files) {
    if (!navigator.share || (navigator.canShare && !navigator.canShare({ files }))) return false;
    return navigator.share({ files, title: 'AP. QR' });
}

editor.addEventListener('beforeinput', () => { selection = [editor.selectionStart, editor.selectionEnd]; });
editor.addEventListener('input', () => {
    updateEditor(reconcileEdit(text, editor.value, selection));
    selection = undefined;
});
editor.addEventListener('paste', event => {
    if (!event.clipboardData?.types.includes('text/plain')) return;
    const pasted = event.clipboardData.getData('text/plain');
    if (!pasted) return;
    event.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const next = text.slice(0, rawOffset(text, start)) + pasted + text.slice(rawOffset(text, end));
    editor.setRangeText(normalized(pasted), start, end, 'end');
    updateEditor(next);
});
generateButton.addEventListener('click', generate);
byId('clear').addEventListener('click', () => {
    editor.value = '';
    updateEditor('');
    editor.focus();
});
byId('paste').addEventListener('click', async () => {
    const before = revision;
    try {
        const value = await navigator.clipboard?.readText();
        if (before !== revision) return;
        if (!value) {
            notify(editorNotice, 'Use the Paste command in the text field if clipboard access is unavailable.', true);
            return;
        }
        editor.value = value;
        updateEditor(value);
    } catch (_) {
        if (before === revision) notify(editorNotice, 'Use the Paste command in the text field if clipboard access is unavailable.', true);
    }
});
list.addEventListener('click', async event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const card = button.closest('article');
    const notice = card.querySelector('.notice');
    const index = Number(card.dataset.index);
    const item = items[index];
    if (!item) return;
    const name = fileName(index, items.length);
    notify(notice);
    try {
        switch (button.dataset.action) {
            case 'save':
                saveBlob(item.blob, name);
                break;
            case 'share': {
                const share = shareFiles([new File([item.blob], name, { type: 'image/png' })]);
                if (share) await share;
                else {
                    saveBlob(item.blob, name);
                    notify(notice, 'Sharing is unavailable. The PNG download was requested.');
                }
                break;
            }
            case 'copy':
                await navigator.clipboard.writeText(item.text);
                notify(notice, 'Encoded text copied.');
                break;
        }
    } catch (error) {
        if (error.name === 'AbortError') return;
        const messages = {
            copy: 'Clipboard access is unavailable.',
            share: 'Sharing failed. Try Save PNG.',
            save: 'The PNG download could not start. Try Share.'
        };
        notify(notice, messages[button.dataset.action], true);
    }
});

async function exportBatch(share) {
    if (items.length < 2) return;
    const batch = items;
    const button = byId(share ? 'share-all' : 'save-all');
    button.disabled = true;
    notify(batchNotice);
    try {
        if (share) {
            const files = batch.map((item, index) => new File([item.blob], fileName(index, batch.length), { type: 'image/png' }));
            const action = shareFiles(files);
            if (action) {
                await action;
                return;
            }
        }
        const archive = await zipFiles(batch, fileName);
        if (batch !== items) return;
        const name = 'AP_QR_Codes.zip';
        if (share) {
            const action = shareFiles([new File([archive], name, { type: 'application/zip' })]);
            if (action) {
                await action;
                return;
            }
        }
        saveBlob(archive, name);
        if (share) notify(batchNotice, 'Sharing is unavailable. The ZIP download was requested.');
    } catch (error) {
        if (batch === items && error.name !== 'AbortError') {
            notify(batchNotice, share ? 'Sharing failed. Try Save ZIP.' : 'The ZIP download could not start. Try again.', true);
        }
    } finally {
        button.disabled = false;
    }
}
byId('save-all').addEventListener('click', () => exportBatch(false));
byId('share-all').addEventListener('click', () => exportBatch(true));

const offline = byId('offline-status');
let offlineCheck = 0;
function offlineStatus(label, ready = false) {
    offline.textContent = label;
    offline.classList.toggle('ready', ready);
}

function checkOffline() {
    const id = ++offlineCheck;
    const worker = navigator.serviceWorker.controller;
    if (!worker) {
        offlineStatus('Offline not ready');
        return;
    }
    const channel = new MessageChannel();
    const timer = setTimeout(() => {
        channel.port1.close();
        if (id === offlineCheck) offlineStatus('Offline not ready');
    }, 8000);
    channel.port1.onmessage = ({ data }) => {
        clearTimeout(timer);
        channel.port1.close();
        if (id === offlineCheck) offlineStatus(data === 'qr-2-ready' ? 'Offline ready' : 'Offline not ready', data === 'qr-2-ready');
    };
    worker.postMessage('qr-2-status', [channel.port2]);
}

async function enableOffline() {
    if (!('serviceWorker' in navigator)) {
        offlineStatus('Offline unavailable');
        return;
    }
    navigator.serviceWorker.addEventListener('controllerchange', checkOffline);
    window.addEventListener('pageshow', checkOffline);
    window.addEventListener('online', checkOffline);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) checkOffline();
    });
    try {
        await navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' });
        checkOffline();
    } catch (_) {
        offlineStatus('Offline not ready');
    }
}

editor.value = '';
enableOffline();
