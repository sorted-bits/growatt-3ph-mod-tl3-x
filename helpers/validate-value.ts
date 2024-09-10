import { RegisterDataType } from '../repositories/device-repository/models/enum/register-datatype';

/**
 * Validate the value based on the data type.
 *
 * @param value The value
 * @param dataType The data type
 */
export const validateValue = (value: any, dataType: RegisterDataType): boolean => {
    switch (dataType) {
        case RegisterDataType.UINT8:
            return Number.isInteger(value) && value >= 0 && value <= 255;
        case RegisterDataType.UINT16:
            return Number.isInteger(value) && value >= 0 && value <= 65535;
        case RegisterDataType.UINT32:
            return Number.isInteger(value) && value >= 0 && value <= 4294967295;
        case RegisterDataType.INT16:
            return Number.isInteger(value) && value >= -32768 && value <= 32767;
        case RegisterDataType.INT32:
            return Number.isInteger(value) && value >= -2147483648 && value <= 2147483647;
        case RegisterDataType.FLOAT32:
            return typeof value === 'number';
        case RegisterDataType.STRING:
            return true;
        default:
            return true;
    }
};
