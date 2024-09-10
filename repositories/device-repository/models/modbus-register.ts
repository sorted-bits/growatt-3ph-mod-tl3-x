/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { randomUUID } from 'crypto';
import { Logger } from 'quantumhub-sdk';
import { AccessMode } from './enum/access-mode';
import { RegisterDataType } from './enum/register-datatype';
import { RegisterType } from './enum/register-type';

export type Transformation = (value: any, buffer: Buffer, log: Logger) => any;

export interface ModbusRegisterOptions {
  validValueMin?: number;
  validValueMax?: number;
  maxAddDelta?: number;
  maxSubDelta?: number;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export class ModbusRegisterParseConfiguration {
  register: ModbusRegister;
  capabilityId: string;
  transformation?: Transformation;
  scale?: number;
  guid: string;
  options: ModbusRegisterOptions;
  currentValue: any;
  decimals?: number;

  constructor(register: ModbusRegister, capabilityId: string, transformation?: Transformation, scale?: number, options: ModbusRegisterOptions = {}, decimals?: number) {
    this.register = register;
    this.capabilityId = capabilityId;
    this.transformation = transformation;
    this.scale = scale;
    this.options = options;
    this.decimals = decimals;

    this.guid = randomUUID();
  }

  calculateValue(value: any, buffer: Buffer, log: Logger): any {
    if (this.scale) {
      const numberValue = parseFloat(value);

      if (isNaN(numberValue)) {
        return undefined;
      }

      let result = numberValue * this.scale;

      if (this.decimals !== undefined) {
        var p = Math.pow(10, this.decimals);
        result = Math.round(result * p) / p;
      }

      return result;
    }

    if (this.transformation) {
      return this.transformation(value, buffer, log);
    }

    return value;
  }
  calculatePayload(value: any, log: Logger): any {
    const result = Number(value) && this.scale ? value / this.scale : value;
    return result;
  }

  validateValue(value: any, log: Logger): ValidationResult {
    if (this.register.dataType === RegisterDataType.STRING) {
      return { valid: true };
    }

    if (this.transformation) {
      return { valid: true };
    }

    if (this.scale && isNaN(parseFloat(value))) {
      log.error('Received value is not a number', value, this.register.address);
      return { valid: false, message: 'Received value is not a number' };
    }

    const numberValue = parseFloat(value);

    if (this.options.validValueMax !== undefined && numberValue > this.options.validValueMax) {
      log.error('Value is above defined max', value, '>', this.options.validValueMax);
      return { valid: false, message: 'Value is above defined max' };
    }

    if (this.options.validValueMin !== undefined && numberValue < this.options.validValueMin) {
      log.error('Value is below defined min', value, '<', this.options.validValueMin);
      return { valid: false, message: 'Value is below defined min' };
    }

    if (this.currentValue !== undefined && this.options.maxAddDelta !== undefined) {
      const delta = numberValue - this.currentValue;

      if (delta > this.options.maxAddDelta) {
        return { valid: false, message: 'Add delta is above defined max' };
      }
    }

    if (this.currentValue !== undefined && this.options.maxSubDelta !== undefined) {
      const delta = this.currentValue - numberValue;

      if (delta > this.options.maxSubDelta) {
        return { valid: false, message: 'Sub delta is above defined max' };
      }
    }

    return { valid: true };
  }
}

export class ModbusRegister {
  address: number;
  length: number;
  dataType: RegisterDataType;
  accessMode: AccessMode;

  registerType: RegisterType = RegisterType.Input;

  parseConfigurations: ModbusRegisterParseConfiguration[] = [];

  hasCapability(capabilityId: string): boolean {
    return this.parseConfigurations.some((config) => config.capabilityId === capabilityId);
  }

  constructor(address: number, length: number, dataType: RegisterDataType, accessMode: AccessMode = AccessMode.ReadOnly) {
    this.address = address;
    this.length = length;
    this.dataType = dataType;
    this.accessMode = accessMode;
  }

  addDefault = (capabilityId: string, options?: ModbusRegisterOptions): ModbusRegister => {
    const configuration = new ModbusRegisterParseConfiguration(this, capabilityId, undefined, undefined, options);
    this.parseConfigurations.push(configuration);
    return this;
  };

  addScale = (capabilityId: string, scale: number, options?: ModbusRegisterOptions, round?: number): ModbusRegister => {
    const configuration = new ModbusRegisterParseConfiguration(this, capabilityId, undefined, scale, options, round);
    this.parseConfigurations.push(configuration);
    return this;
  };

  addTransform = (capabilityId: string, transformation: Transformation, options?: ModbusRegisterOptions): ModbusRegister => {
    const configuration = new ModbusRegisterParseConfiguration(this, capabilityId, transformation, undefined, options);
    this.parseConfigurations.push(configuration);
    return this;
  };

  calculateValue(value: any, buffer: Buffer, log: Logger): any {
    if (this.parseConfigurations.length !== 1) {
      throw new Error('Invalid number of parse configurations for this method to work');
    }

    const parseConfiguration = this.parseConfigurations[0];
    return parseConfiguration.calculateValue(value, buffer, log);
  }

  calculatePayload(value: any, log: Logger): any {
    if (this.parseConfigurations.length !== 1) {
      throw new Error('Invalid number of parse configurations for this method to work');
    }

    const parseConfiguration = this.parseConfigurations[0];
    return parseConfiguration.calculatePayload(value, log);
  }

  static transform(capabilityId: string, address: number, length: number, dataType: RegisterDataType, transformation: Transformation, accessMode: AccessMode = AccessMode.ReadOnly, options: ModbusRegisterOptions = {}) {
    return new ModbusRegister(address, length, dataType, accessMode).addTransform(capabilityId, transformation, options);
  }

  static default(capabilityId: string, address: number, length: number, dataType: RegisterDataType, accessMode: AccessMode = AccessMode.ReadOnly, options: ModbusRegisterOptions = {}) {
    return new ModbusRegister(address, length, dataType, accessMode).addDefault(capabilityId, options);
  }

  static scale(capabilityId: string, address: number, length: number, dataType: RegisterDataType, scale: number, accessMode: AccessMode = AccessMode.ReadOnly, options: ModbusRegisterOptions = {}, decimals?: number) {
    return new ModbusRegister(address, length, dataType, accessMode).addScale(capabilityId, scale, options, decimals);
  }
}
