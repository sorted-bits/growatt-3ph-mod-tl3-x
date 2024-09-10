import { calculateFrameChecksum } from '../helpers/frame-crc-calculator';

interface WrappedResult {
    buffer: Buffer;
    sequenceNumber: number;
}

export class FrameDefinition {
    readonly start: Buffer;
    readonly controlCode: Buffer;
    readonly frameType: Buffer;
    readonly sensorType: Buffer;
    readonly deliveryTime: Buffer;
    readonly powerOnTime: Buffer;
    readonly offsetTime: Buffer;
    readonly checksum: Buffer;
    readonly end: Buffer;

    readonly serialNumber: Buffer;
    private sequenceNumber = 1;

    private ignoreProtocolErrors = true;

    constructor(serialNumber: string) {
        this.start = Buffer.from('A5', 'hex');
        this.controlCode = Buffer.from('1045', 'hex');
        this.frameType = Buffer.from('02', 'hex');
        this.sensorType = Buffer.from('0000', 'hex');
        this.deliveryTime = Buffer.from('00000000', 'hex');
        this.powerOnTime = Buffer.from('00000000', 'hex');
        this.offsetTime = Buffer.from('00000000', 'hex');
        this.checksum = Buffer.from('00', 'hex');
        this.end = Buffer.from('15', 'hex');

        this.serialNumber = Buffer.alloc(4);
        this.serialNumber.writeUInt32LE(Number(serialNumber), 0);
    }

    wrapModbusFrame(modbusFrame: Buffer): WrappedResult {
        this.sequenceNumber += 1;
        if (this.sequenceNumber > 255) {
            this.sequenceNumber = 1;
        }

        const sequenceNr = this.sequenceNumber;

        const sequence = Buffer.alloc(2);
        sequence.writeUInt16LE(sequenceNr, 0);

        const length = Buffer.alloc(2);
        length.writeUInt16LE(modbusFrame.length + 15, 0);

        const frame = Buffer.concat([
            // header
            this.start,
            length,
            this.controlCode,
            sequence,
            this.serialNumber,
            // payload
            this.frameType,
            this.sensorType,
            this.deliveryTime,
            this.powerOnTime,
            this.offsetTime,
            modbusFrame,
            // footer
            this.checksum,
            this.end,
        ]);

        frame[frame.length - 2] = calculateFrameChecksum(frame);

        return {
            buffer: frame,
            sequenceNumber: sequenceNr,
        };
    }

    unwrapResponseFrame(responseFrame: Buffer): WrappedResult {
        let frameLength = responseFrame.length;
        const payloadLength = responseFrame.readUInt16LE(1);

        const headerLength = 13;

        let sequenceNr = responseFrame[5];

        if (frameLength !== headerLength + payloadLength) {
            if (!this.ignoreProtocolErrors) {
                throw new Error('Frame length does not match payload length.');
            }

            frameLength = headerLength + payloadLength;
        }

        if (responseFrame[0] !== this.start.readUInt8() || responseFrame[frameLength - 1] !== this.end.readUInt8()) {
            throw new Error('Frame contains invalid start or end values.');
        }

        if (responseFrame[frameLength - 2] !== calculateFrameChecksum(responseFrame)) {
            throw new Error('Frame contains invalid V5 checksum.');
        }

        if (responseFrame[5] !== this.sequenceNumber) {
            if (!this.ignoreProtocolErrors) {
                throw new Error('Frame contains invalid sequence number. Got ' + responseFrame[5] + ', expected ' + this.sequenceNumber + '.');
            }
        }

        if (responseFrame.subarray(7, 11).toString() !== this.serialNumber.toString()) {
            throw new Error('Frame contains incorrect data logger serial number.');
        }

        if (responseFrame.readUint16LE(3) !== 0x1510) {
            throw new Error('Frame contains incorrect control code.');
        }

        if (responseFrame[11] !== 0x02) {
            throw new Error('Frame contains invalid frame type.');
        }

        const modbusFrame = responseFrame.subarray(25, frameLength - 2);

        if (modbusFrame.length < 5) {
            throw new Error('Frame does not contain a valid Modbus RTU frame.');
        }

        return {
            buffer: modbusFrame,
            sequenceNumber: sequenceNr,
        };
    }
}
