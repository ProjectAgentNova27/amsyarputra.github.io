/* Lossless, paragraph-first segmentation with an 800-code-point limit. */
export const MAX_QR_CHARACTERS = 800;

const abbreviations = new Set(['dr.', 'mr.', 'mrs.', 'ms.', 'prof.', 'sgt.', 'insp.', 'e.g.', 'i.e.', 'approx.', 'vs.']);

export function countCharacters(text) {
    let count = 0;
    for (const character of text) count++;
    return count;
}

function startsSentence(text, offset) {
    return offset === text.length || /^[“‘"'«‹(\[]*\p{Lu}/u.test(text.slice(offset, offset + 16));
}

function protectedPeriod(text, period, next) {
    // Inspect a bounded suffix before the period. Include the separator so
    // a title or initial inside a longer token does not match.
    const suffix = text.slice(Math.max(0, period - 32), period + 1);
    const token = /(?:^|[^\p{L}\p{M}\p{N}_.@])((?:\p{L}\.){2,}|\p{Lu}\.|[A-Za-z]{2,8}\.)$/u.exec(suffix)?.[1];
    if (!token) return false;
    const lower = token.toLowerCase();
    if (lower === 'etc.') return !startsSentence(text, next);
    return abbreviations.has(lower) || /^(?:\p{L}\.){2,}$|^\p{Lu}\.$/u.test(token);
}

function collectBoundaries(text) {
    const paragraphs = [];
    const sentences = [];
    const words = [];
    const spaces = new Map();
    const protectedSpaces = new Set();

    for (const { 0: space, index } of text.matchAll(/\s+/gu)) {
        spaces.set(index, index + space.length);
        let breaks = 0;
        let paragraphEnd = 0;
        for (const line of space.matchAll(/\r\n|[\r\n\u2028\u2029]/gu)) {
            breaks += line[0] === '\u2029' ? 2 : 1;
            paragraphEnd = index + line.index + line[0].length;
        }
        if (breaks >= 2) paragraphs.push([paragraphEnd, paragraphEnd]);
    }

    for (const { 0: ending, 1: marks, index } of text.matchAll(/([.!?…。！？｡؟։।॥]+)["'”’»›)\]}）】」』》〉〕〗]*/gu)) {
        const end = index + ending.length;
        const following = spaces.get(end);
        // ASCII punctuation needs a separator. CJK terminators also work
        // in scripts where sentences are commonly written without spaces.
        if (following === undefined && end !== text.length && !/[。！？｡]/u.test(marks)) continue;
        const next = following ?? end;
        if (marks === '.' && protectedPeriod(text, index, next)) {
            if (following !== undefined) protectedSpaces.add(end);
            continue;
        }
        if ((marks.includes('…') || marks.length > 1) && /^[.…]+$/u.test(marks) && !startsSentence(text, next)) continue;
        sentences.push([end, next]);
    }

    for (const [start, end] of spaces) {
        if (!protectedSpaces.has(start)) words.push([start + 1, end]);
    }
    return { paragraphs, sentences, words };
}

// Boundary ranges and string slices use UTF-16 offsets. The caller converts
// the code-point budget to an offset before comparing any boundary to it.
function lastCut(ranges, start, limit) {
    let low = 0;
    let high = ranges.length;
    while (low < high) {
        const middle = (low + high) >>> 1;
        if (ranges[middle][0] <= limit) low = middle + 1;
        else high = middle;
    }
    const range = ranges[low - 1];
    return range && range[0] > start ? Math.min(range[1], limit) : 0;
}

export function splitText(original, max = MAX_QR_CHARACTERS) {
    if (typeof original !== 'string' || !original.length) throw new Error('Paste or type some text first.');
    if (!Number.isSafeInteger(max) || max < 1 || max > MAX_QR_CHARACTERS) throw new Error('Invalid QR limit.');

    const offsets = [0];
    for (const character of original) offsets.push(offsets[offsets.length - 1] + character.length);
    const length = offsets.length - 1;
    if (length <= max) return [original];

    const { paragraphs, sentences, words } = collectBoundaries(original);
    const chunks = [];
    for (let point = 0; point < length;) {
        const start = offsets[point];
        let limit = offsets[Math.min(point + max, length)];
        if (original[limit - 1] === '\r' && original[limit] === '\n') limit--;
        const cut = limit === original.length ? limit :
            lastCut(paragraphs, start, limit) ||
            lastCut(sentences, start, limit) ||
            lastCut(words, start + 1, limit) ||
            limit;
        const chunk = original.slice(start, cut);
        const size = countCharacters(chunk);
        if (cut <= start || !size || size > max) throw new Error('No safe QR boundary fits the character limit.');
        chunks.push(chunk);
        point += size;
    }
    if (chunks.join('') !== original) throw new Error('The text could not be split without changes.');
    return chunks;
}

export function splitOversizedEncoding(chunk) {
    const length = countCharacters(chunk);
    if (length <= 1) throw new Error('A character could not be encoded.');
    const first = splitText(chunk, Math.floor(length / 2))[0];
    return [first, chunk.slice(first.length)];
}
