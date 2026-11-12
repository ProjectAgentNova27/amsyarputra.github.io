// Textareas normalize CRLF and CR to LF. Keep pasted separators in memory
// and map unchanged spans back to the original text when the editor changes.
export function normalized(text) {
    return text.replace(/\r\n?/g, '\n');
}

export function rawOffset(raw, displayOffset) {
    let offset = 0;
    for (let position = 0; position < displayOffset; position++, offset++) {
        if (raw[offset] === '\r' && raw[offset + 1] === '\n') offset++;
    }
    return offset;
}

export function reconcileEdit(raw, current, selection) {
    const previous = normalized(raw);
    if (raw === previous) return current;
    // Prefer the beforeinput selection for replacements of identical text.
    if (selection) {
        const [start, end] = selection;
        const tail = previous.slice(end);
        if (current.length >= start + tail.length &&
            current.startsWith(previous.slice(0, start)) && current.endsWith(tail)) {
            return raw.slice(0, rawOffset(raw, start)) + current.slice(start, current.length - tail.length)
                + raw.slice(rawOffset(raw, end));
        }
    }
    let start = 0;
    let suffix = 0;
    while (start < previous.length && previous[start] === current[start]) start++;
    while (suffix < Math.min(previous.length, current.length) - start &&
        previous[previous.length - suffix - 1] === current[current.length - suffix - 1]) suffix++;
    return raw.slice(0, rawOffset(raw, start)) + current.slice(start, current.length - suffix)
        + raw.slice(rawOffset(raw, previous.length - suffix));
}
