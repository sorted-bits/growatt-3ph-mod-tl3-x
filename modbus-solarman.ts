import { Attribute, Device, Provider, SelectAttribute } from 'quantumhub-sdk';
import { IAPI } from './api/iapi';
import { ModbusAPI } from './api/modbus/modbus-api';
import { Solarman } from './api/solarman/solarman';
import { DeviceRepository } from './repositories/device-repository/device-repository';
import { ModbusDevice } from './repositories/device-repository/models/modbus-device';
import { ModbusRegister, ModbusRegisterParseConfiguration } from './repositories/device-repository/models/modbus-register';

class ModbusSolarman implements Device {
  private provider!: Provider;

  private api?: IAPI;
  private availability: boolean = false;
  private device!: ModbusDevice;
  private runningRequest: boolean = false;
  private isStopping: boolean = false;

  private readRegisterTimeout: undefined | ReturnType<typeof setTimeout>;

  init = async (provider: Provider): Promise<boolean> => {
    this.provider = provider;

    const { device } = this.provider.getConfig();

    this.device = DeviceRepository.getInstance().getDeviceById(device) as ModbusDevice;

    if (!this.device) {
      this.provider.logger.error('Device not found');
      return false;
    }

    this.provider.logger.trace('Initializing ', this.device.name);

    this.setAvailability(false);

    return true;
  };

  setAvailability = async (availability: boolean): Promise<void> => {
    if (this.availability !== availability) {
      this.provider.logger.trace('Setting availability:', availability);

      this.availability = availability;
      this.provider.setAvailability(this.availability);
    }
  };

  start = async (): Promise<void> => {
    this.isStopping = false;
    this.api?.setIsStopping(false);

    this.provider.logger.info('Starting ModbusSolarman');

    await this.connect();
  };

  onSelectChanged = async (attribute: SelectAttribute, value: string): Promise<void> => {
    if (attribute.key === 'ems_mode') {
      this.provider.logger.info('EMS mode changed to', value);
    }
  };

  valueChanged = async (attribute: Attribute, value: any): Promise<void> => {
    this.provider.logger.trace(`Attribute ${attribute} changed to ${value}`);
  };

  stop = async (): Promise<void> => {
    this.provider.logger.info('Stopping ModbusSolarman');
    await this.cleanUp();
  };

  destroy = async (): Promise<void> => {
    this.provider.logger.trace('Destroying ModbusSolarman');
    await this.cleanUp();
  };

  private cleanUp = async (): Promise<void> => {
    this.isStopping = true;
    this.api?.setIsStopping(true);
    if (this.readRegisterTimeout) {
      this.provider.clearTimeout(this.readRegisterTimeout);
      this.readRegisterTimeout = undefined;
    }

    if (this.api?.isConnected()) {
      this.provider.logger.trace('Closing modbus connection');
      this.api.disconnect();
    }
  };

  private onError = async (error: unknown, register: ModbusRegister): Promise<void> => {
    if (error && (error as any)['name'] && (error as any)['name'] === 'TransactionTimedOutError') {
      await this.setAvailability(false);
    } else {
      this.provider.logger.error('Request failed', error);
    }
  };

  private onDataReceived = async (value: any, buffer: Buffer, parseConfiguration: ModbusRegisterParseConfiguration) => {
    const result = parseConfiguration.calculateValue(value, buffer, this.provider.logger);

    const validationResult = parseConfiguration.validateValue(result, this.provider.logger);
    if (validationResult.valid) {
      await this.provider.setAttributeValue(parseConfiguration.capabilityId, result);
      parseConfiguration.currentValue = result;
    } else {
      this.provider.logger.error('Invalid value received', value, buffer);
    }

    this.setAvailability(true);
  };

  private onDisconnect = async (): Promise<void> => {
    this.provider.logger.warn('Disconnected');

    if (this.readRegisterTimeout) {
      this.provider.clearTimeout(this.readRegisterTimeout);
      this.readRegisterTimeout = undefined;
    }

    if (!this.api) {
      return;
    }

    const isOpen = this.api.connect();

    if (!isOpen) {
      this.provider.logger.error('Failed to reconnect, reconnecting in 60 seconds');

      await this.provider.setAvailability(false);

      this.readRegisterTimeout = await this.provider.setTimeout(this.onDisconnect.bind(this), 60000);
    } else {
      this.provider.logger.trace('Reconnected to device');
      await this.provider.setAvailability(true);
      await this.readRegisters();
    }
  };

  private readRegisters = async (): Promise<void> => {
    if (this.readRegisterTimeout) {
      this.provider.clearTimeout(this.readRegisterTimeout);
      this.readRegisterTimeout = undefined;
    }

    if (!this.api) {
      this.provider.logger.error('ModbusAPI is not initialized');
      return;
    }

    this.provider.logger.trace('Reading registers');

    const { updateInterval } = this.provider.getConfig();

    if (this.runningRequest) {
      this.readRegisterTimeout = this.provider.setTimeout(this.readRegisters.bind(this), 500);
      return;
    }

    this.runningRequest = true;

    try {
      await this.api.readRegistersInBatch();
      await this.setAvailability(true);
    } catch (error: Error | any) {
      this.provider.logger.error('Failed to read registers', error);
      await this.setAvailability(false);

      if (error && error.name && error.name === 'PortNotOpenError') {
        await this.connect();
        return;
      }
    } finally {
      this.runningRequest = false;

      const interval = this.availability ? Math.max(updateInterval, 2) * 1000 : 60000;

      if (!this.availability) {
        this.provider.logger.warn('Device is not reachable, retrying in 60 seconds');
      }

      if (!this.isStopping) {
        this.readRegisterTimeout = this.provider.setTimeout(this.readRegisters.bind(this), interval);
      }
    }
  };

  connect = async (): Promise<void> => {
    this.runningRequest = false;

    const { host, port, unitId, solarman, serial } = this.provider.getConfig();

    if (this.readRegisterTimeout) {
      this.provider.clearTimeout(this.readRegisterTimeout);
    }

    this.provider.logger.trace(`Connecting to ${host}:${port} with unitId ${unitId} (solarman: ${solarman}, serial: ${serial})`);

    this.api = solarman ? new Solarman(this.provider.logger, this.device, host, serial, 8899, 1) : new ModbusAPI(this.provider.logger, host, port, unitId, this.device);

    this.api?.setOnError(this.onError);
    this.api?.setOnDisconnect(this.onDisconnect);
    this.api?.setOnDataReceived(this.onDataReceived);

    const isOpen = await this.api.connect();

    if (isOpen) {
      this.setAvailability(true);
      await this.readRegisters();
    }
  };
}

export default ModbusSolarman;
