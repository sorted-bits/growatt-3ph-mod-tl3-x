/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

export enum RegisterDataType {
    UINT8 = 'UINT8',
    UINT16 = 'UINT16',
    UINT32 = 'UINT32',
    INT16 = 'INT16',
    INT32 = 'INT32',
    STRING = 'STRING',
    FLOAT32 = 'FLOAT32',
}

export const lengthForDataType = (dataType: RegisterDataType): number => {
    switch (dataType) {
        case RegisterDataType.UINT8:
            return 1;
        case RegisterDataType.UINT16:
        case RegisterDataType.INT16:
            return 2;
        case RegisterDataType.UINT32:
        case RegisterDataType.INT32:
        case RegisterDataType.FLOAT32:
            return 4;
        case RegisterDataType.STRING:
            return 8;
    }
};

export const bufferForDataType = (dataType: RegisterDataType, value: any): Buffer => {
    const buffer = Buffer.allocUnsafe(lengthForDataType(dataType));

    switch (dataType) {
        case RegisterDataType.UINT8:
            buffer.writeUInt8(value);
            break;
        case RegisterDataType.UINT16:
            buffer.writeUInt16BE(value);
            break;
        case RegisterDataType.INT16:
            buffer.writeInt16BE(value);
            break;
        case RegisterDataType.UINT32:
            buffer.writeUint32BE(value);
            break;
        case RegisterDataType.INT32:
            buffer.writeInt32BE(value);
            break;
        case RegisterDataType.FLOAT32:
            buffer.writeFloatBE(value, 0);
            break;
        case RegisterDataType.STRING:
            return Buffer.from(value);
    }

    return buffer;
};
