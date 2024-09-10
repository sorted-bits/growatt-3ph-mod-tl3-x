import { Logger } from 'quantumhub-sdk';

export const readBit = (buffer: Buffer, byteIndex: number, bitIndex: number): number => {
  return (buffer[byteIndex] >> (7 - bitIndex)) & 1;
};

export const readBitBE = (buffer: Buffer, bitIndex: number): number => {
  const byteIndex = buffer.length - 1 - Math.floor(bitIndex / 8);
  const bitInByteIndex = 7 - (bitIndex % 8);

  return (buffer[byteIndex] >> (7 - bitInByteIndex)) & 1;
};

export const writeBitsToBufferBE = (buffer: Buffer, bits: number[], startBitIndex: number = 0): Buffer => {
  const result = Buffer.from(buffer);

  for (let i = 0; i < bits.length; i++) {
    const bitIndex = startBitIndex + i;
    const byteIndex = buffer.length - 1 - Math.floor(bitIndex / 8);
    const bitInByteIndex = bitIndex % 8;

    let byte = result[byteIndex];

    if (bits[i] === 1) {
      byte = byte | (1 << bitInByteIndex);
    } else if (bits[i] === 0) {
      byte = byte & ~(1 << bitInByteIndex);
    }

    result[byteIndex] = byte;
  }

  return result;
};

export const writeBitsToBuffer = (
  buffer: Buffer,
  byteIndex: number,
  bits: number[],
  startBitIndex: number = 0
): Buffer => {
  const result = Buffer.from(buffer);

  let byte = result[byteIndex];

  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === 1) {
      byte = byte | (1 << (i + startBitIndex));
    } else if (bits[i] === 0) {
      byte = byte & ~(1 << (i + startBitIndex));
    }
  }

  result[byteIndex] = byte;

  return result;
};

export const logBits = (logger: Logger, buffer: Buffer): void => {
  for (let i = 0; i < buffer.length; i++) {
    let outputBits = '';
    for (let j = 0; j < 8; j++) {
      const bitValue = readBit(buffer, i, j);
      outputBits += bitValue + ' ';
    }
    logger.trace('Byte', i, 'bits', outputBits);
  }
};
