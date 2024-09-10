import { Logger } from 'quantumhub-sdk';
import { lengthForDataType } from '../../../repositories/device-repository/models/enum/register-datatype';
import { ModbusRegister } from '../../../repositories/device-repository/models/modbus-register';

export const parseResponse2 = (
  log: Logger,
  response: Buffer
): Array<number> => {
  const length = response.readUInt8(2);

  const result: number[] = [];

  for (let i = 0; i < length; i += 2) {
    const value = response.readUInt16BE(i + 3);
    result.push(value);
  }

  return result;
};

export const parseResponse = (
  log: Logger,
  response: Buffer,
  registers: ModbusRegister[]
): Array<Buffer> => {
  const data = response.subarray(3);

  let offset = 0;

  const result: Array<Buffer> = [];
  registers.forEach((register, index) => {
    const length = lengthForDataType(register.dataType);
    const registerData = data.subarray(offset, offset + length);
    result.push(registerData);
    //        log.log('Register: ', register.capabilityId, ' Data: ', registerData, ' Length: ', length);

    offset += length;
  });

  return result;
};
