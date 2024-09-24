import { DateTime } from 'luxon';
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
  private reachable: boolean = false;
  private device!: ModbusDevice;
  private lastRequest?: DateTime;
  private lastValidRequest?: DateTime;
  private runningRequest: boolean = false;

  private readRegisterTimeout: undefined | ReturnType<typeof setTimeout>;
  private isRunningIntervalTimeout: undefined | ReturnType<typeof setTimeout>;

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
    if (this.reachable !== availability) {
      this.provider.logger.trace('Setting availability:', availability);

      this.reachable = availability;
      this.provider.setAvailability(this.reachable);
    }
  };

  start = async (): Promise<void> => {
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
    if (this.readRegisterTimeout) {
      this.provider.clearTimeout(this.readRegisterTimeout);
      this.readRegisterTimeout = undefined;
    }

    if (this.isRunningIntervalTimeout) {
      this.provider.clearTimeout(this.isRunningIntervalTimeout);
      this.isRunningIntervalTimeout = undefined;
    }

    this.provider.logger.info('Stopping ModbusSolarman');

    if (this.api?.isConnected()) {
      this.provider.logger.trace('Closing modbus connection');
      this.api.disconnect();
    }
  };

  destroy = async (): Promise<void> => {
    this.provider.logger.trace('Destroying ModbusSolarman');
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
      this.lastValidRequest = DateTime.utc();

      await this.provider.setAttributeValue(parseConfiguration.capabilityId, result);
      parseConfiguration.currentValue = result;
    } else {
      this.provider.logger.error('Invalid value received', value, buffer);
    }

    if (!this.reachable) {
      this.setAvailability(true);
    }
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
    if (!this.api) {
      this.provider.logger.error('ModbusAPI is not initialized');
      return;
    }

    this.provider.logger.trace('Reading registers');

    this.lastRequest = DateTime.utc();

    const diff = this.lastValidRequest ? this.lastRequest.diff(this.lastValidRequest, 'minutes').minutes : 0;
    const { updateInterval } = this.provider.getConfig();

    if (diff > Math.max(2, updateInterval / 60)) {
      this.provider.logger.warn('Device is not reachable, retrying in 60 seconds');
      await this.provider.setAvailability(false);
    }

    while (this.runningRequest) {
      await new Promise(
        (resolve) =>
          (this.isRunningIntervalTimeout = this.provider.setTimeout(async (): Promise<void> => {
            resolve(true);
          }, 500))
      );
    }

    this.runningRequest = true;

    try {
      await this.api.readRegistersInBatch();
    } catch (error: Error | any) {
      this.provider.logger.error('Failed to read registers', error);
      await this.setAvailability(false);

      if (error && error.name && error.name === 'PortNotOpenError') {
        await this.connect();
        return;
      }
    } finally {
      this.runningRequest = false;
    }

    const interval = this.reachable ? Math.max(updateInterval, 2) * 1000 : 60000;

    if (!this.reachable) {
      this.provider.logger.warn('Device is not reachable, retrying in 60 seconds');
    }

    this.readRegisterTimeout = this.provider.setTimeout(this.readRegisters.bind(this), interval);
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
