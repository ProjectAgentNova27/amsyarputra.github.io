// Store PNGs without recompressing them. ZIP checksums cover the original bytes.
const utf8 = new TextEncoder();
const u16 = value => [value & 255, (value >>> 8) & 255];
const u32 = value => [value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255];

const crcTable = new Uint32Array(256);
for (let index = 0; index < crcTable.length; index++) {
    let value = index;
    for (let bit = 0; bit < 8; bit++) {
        value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
    }
    crcTable[index] = value;
}

function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
}

export async function zipFiles(items, fileName) {
    const parts = [];
    const directory = [];
    let offset = 0;
    for (const [index, item] of items.entries()) {
        const data = new Uint8Array(await item.blob.arrayBuffer());
        const name = utf8.encode(fileName(index, items.length));
        const entry = [
            ...u16(20), ...u16(0x800), ...u16(0), ...u16(0), ...u16(0x21),
            ...u32(crc32(data)), ...u32(data.length), ...u32(data.length),
            ...u16(name.length), ...u16(0)
        ];
        const local = new Uint8Array([80, 75, 3, 4, ...entry, ...name]);
        const central = new Uint8Array([
            80, 75, 1, 2, ...u16(20), ...entry, ...u16(0), ...u16(0),
            ...u16(0), ...u32(0), ...u32(offset), ...name
        ]);
        parts.push(local, data);
        directory.push(central);
        offset += local.length + data.length;
    }
    const dirLength = directory.reduce((sum, part) => sum + part.length, 0);
    const footer = new Uint8Array([
        80, 75, 5, 6, ...u16(0), ...u16(0), ...u16(items.length),
        ...u16(items.length), ...u32(dirLength), ...u32(offset), ...u16(0)
    ]);
    return new Blob([...parts, ...directory, footer], { type: 'application/zip' });
}
