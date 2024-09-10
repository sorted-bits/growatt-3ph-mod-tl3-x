import { DateTime } from 'luxon';
import { Device, Logger, Provider } from 'quantumhub-sdk';
import { IAPI } from './api/iapi';
import { ModbusAPI } from './api/modbus/modbus-api';
import { Solarman } from './api/solarman/solarman';
import { DeviceRepository } from './repositories/device-repository/device-repository';
import { ModbusDevice } from './repositories/device-repository/models/modbus-device';
import { ModbusRegister, ModbusRegisterParseConfiguration } from './repositories/device-repository/models/modbus-register';

class ModbusSolarman implements Device {
  private provider!: Provider;
  private logger!: Logger;

  private api?: IAPI;
  private reachable: boolean = false;
  private device!: ModbusDevice;
  private lastRequest?: DateTime;
  private lastValidRequest?: DateTime;
  private runningRequest: boolean = false;

  private readRegisterTimeout: undefined | ReturnType<typeof setTimeout>;

  async init(provider: Provider, logger: Logger): Promise<boolean> {
    this.provider = provider;
    this.logger = logger;

    const { device } = this.provider.getConfig();

    this.device = DeviceRepository.getInstance().getDeviceById(device) as ModbusDevice;

    if (!this.device) {
      this.logger.error('Device not found');
      return false;
    }

    this.logger.trace('Initializing ', this.device.name);

    this.setAvailability(false);

    return true;
  }

  async setAvailability(availability: boolean): Promise<void> {
    this.logger.trace('Setting availability:', availability);

    this.reachable = availability;
    this.provider.setAvailability(this.reachable);
  }

  async start(): Promise<void> {
    this.logger.info('Starting ModbusSolarman');

    await this.connect();
  }

  async valueChanged(attribute: string, value: any): Promise<void> {
    this.logger.trace(`Attribute ${attribute} changed to ${value}`);
  }

  async stop(): Promise<void> {
    this.logger.info('Stopping ModbusSolarman');

    if (this.api?.isConnected()) {
      this.logger.trace('Closing modbus connection');
      this.api.disconnect();
    }
  }

  async destroy(): Promise<void> {
    this.logger.trace('Destroying ModbusSolarman');
  }

  private onError = async (error: unknown, register: ModbusRegister): Promise<void> => {
    if (error && (error as any)['name'] && (error as any)['name'] === 'TransactionTimedOutError') {
      await this.setAvailability(false);
    } else {
      this.logger.error('Request failed', error);
    }
  };

  private onDataReceived = async (value: any, buffer: Buffer, parseConfiguration: ModbusRegisterParseConfiguration) => {
    const result = parseConfiguration.calculateValue(value, buffer, this.logger);

    const validationResult = parseConfiguration.validateValue(result, this.logger);
    if (validationResult.valid) {
      this.lastValidRequest = DateTime.utc();

      await this.provider.setAttributeValue(parseConfiguration.capabilityId, result);
      parseConfiguration.currentValue = result;
    }

    if (!this.reachable) {
      this.setAvailability(true);
    }
  };

  private onDisconnect = async (): Promise<void> => {
    this.logger.warn('Disconnected');

    if (this.readRegisterTimeout) {
      clearTimeout(this.readRegisterTimeout);
      this.readRegisterTimeout = undefined;
    }

    if (!this.api) {
      return;
    }

    const isOpen = this.api.connect();

    if (!isOpen) {
      this.logger.error('Failed to reconnect, reconnecting in 60 seconds');

      await this.provider.setAvailability(false);

      this.readRegisterTimeout = setTimeout(() => {
        this.onDisconnect();
      }, 60000);
    } else {
      await this.provider.setAvailability(true);
      await this.readRegisters();
    }
  };

  private readRegisters = async (): Promise<void> => {
    if (!this.api) {
      this.logger.error('ModbusAPI is not initialized');
      return;
    }

    this.lastRequest = DateTime.utc();

    const diff = this.lastValidRequest ? this.lastRequest.diff(this.lastValidRequest, 'minutes').minutes : 0;
    const { updateInterval } = this.provider.getConfig();

    if (diff > Math.max(2, updateInterval / 60)) {
      await this.provider.setAvailability(false);
    }

    while (this.runningRequest) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    this.runningRequest = true;

    try {
      await this.api.readRegistersInBatch();
    } finally {
      this.runningRequest = false;
    }

    const interval = this.reachable ? (updateInterval < 5 ? 5 : updateInterval) * 1000 : 60000;

    if (!this.reachable) {
      this.logger.warn('Device is not reachable, retrying in 60 seconds');
    }

    this.readRegisterTimeout = await setTimeout(this.readRegisters.bind(this), interval);
  };

  connect = async (): Promise<void> => {
    const { host, port, unitId, solarman, serial } = this.provider.getConfig();

    if (this.readRegisterTimeout) {
      clearTimeout(this.readRegisterTimeout);
    }

    this.logger.trace(`Connecting to ${host}:${port} with unitId ${unitId} (solarman: ${solarman}, serial: ${serial})`);

    this.api = solarman ? new Solarman(this.logger, this.device, host, serial, 8899, 1) : new ModbusAPI(this.logger, host, port, unitId, this.device);

    this.api?.setOnError(this.onError);
    this.api?.setOnDisconnect(this.onDisconnect);
    this.api?.setOnDataReceived(this.onDataReceived);

    const isOpen = await this.api.connect();

    if (isOpen) {
      await this.readRegisters();
    }
  };
}

export default ModbusSolarman;
