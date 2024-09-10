export const calculateFrameChecksum = (buffer: Buffer) => {
    let checksum = 0;
    for (let i = 1; i < buffer.length - 2; i++) {
        checksum += buffer[i] & 0xff;
    }

    return Number(checksum & 0xff);
};
