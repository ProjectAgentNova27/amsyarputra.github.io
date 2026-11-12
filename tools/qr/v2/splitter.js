/* Deterministic, lossless segmentation in Unicode code points. */
export const MAX_QR_CHARACTERS = 800;

export function countCharacters(text) {
    let count = 0;
    for (const character of text) count++;
    return count;
}

function lastBoundary(window, limit, pattern) {
    let last = 0;
    for (const match of window.matchAll(pattern)) {
        const end = match.index + match[0].length;
        if (end > limit) break;
        last = end;
    }
    return last;
}

export function splitText(original, max = MAX_QR_CHARACTERS) {
    if (typeof original !== 'string' || !original.length) throw new Error('Paste or type some text first.');
    if (!Number.isSafeInteger(max) || max < 1 || max > MAX_QR_CHARACTERS) throw new Error('Invalid QR limit.');

    const points = Array.from(original);
    const chunks = [];
    for (let offset = 0; offset < points.length;) {
        const end = Math.min(points.length, offset + max);
        const prefix = points.slice(offset, end).join('');
        let size = prefix.length;
        if (end < points.length) {
            // One code point of look-ahead keeps a truncated separator from
            // being mistaken for the end of a paragraph or sentence.
            const window = prefix + points[end];
            size = lastBoundary(window, size, /(?:\r\n|\n|\r(?!\n))(?:[ \t]*(?:\r\n|\n|\r(?!\n)))+(?![\r\n])/g)
                || lastBoundary(window, size, /[.!?…][”’"')\]]*(?=[ \t\r\n])[ \t\r\n]*/gu)
                || lastBoundary(window, size, /[ \t\r\n]+/g)
                || size;
            if (size > 1 && window[size - 1] === '\r' && window[size] === '\n') size--;
        }
        const chunk = prefix.slice(0, size);
        chunks.push(chunk);
        offset += countCharacters(chunk);
    }
    return chunks;
}

export function splitOversizedEncoding(chunk) {
    const length = countCharacters(chunk);
    if (length <= 1) throw new Error('A character could not be encoded.');
    const first = splitText(chunk, Math.floor(length / 2))[0];
    return [first, chunk.slice(first.length)];
}
