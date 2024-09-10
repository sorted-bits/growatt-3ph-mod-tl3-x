/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { Logger } from 'quantumhub-sdk';
import { ModbusRegister } from './modbus-register';

export interface ModbusDeviceDefinition {
  inputRegisterResultConversion: (
    log: Logger,
    buffer: Buffer,
    register: ModbusRegister
  ) => any;

  holdingRegisterResultConversion: (
    log: Logger,
    buffer: Buffer,
    register: ModbusRegister
  ) => any;

  inputRegisters: ModbusRegister[];
  holdingRegisters: ModbusRegister[];

  deprecatedCapabilities?: string[];
}
