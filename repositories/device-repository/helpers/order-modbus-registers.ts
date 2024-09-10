/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { ModbusRegister } from '../models/modbus-register';

/**
 * Orders an array of Modbus registers based on their address.
 *
 * @param registers - The array of Modbus registers to be ordered.
 * @returns The ordered array of Modbus registers.
 * @param registers - The array of Modbus registers to be ordered.
 * @returns The ordered array of Modbus registers.
 */
export const orderModbusRegisters = (registers: ModbusRegister[]) => {
    return registers.sort((a, b) => a.address - b.address);
};
