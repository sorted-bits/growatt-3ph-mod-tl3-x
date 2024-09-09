import ModbusRTU from 'modbus-serial';
import { Device, Logger, Provider } from 'quantumhub-sdk';

class Growatt3PHModTL3X implements Device {
  private provider!: Provider;
  private logger!: Logger;

  public client!: ModbusRTU;

  id: string = 'growatt-3ph-mod-tl3-x';

  host?: string;
  port: number = 502;
  unitId: number = 1;

  async init(provider: Provider, logger: Logger): Promise<boolean> {
    this.provider = provider;
    this.logger = logger;

    this.logger.info('Initializing Growatt 3PH Mod TL3-X');

    this.client = new ModbusRTU();

    const { host, port, unitId } = this.provider.getConfig();

    this.host = host;
    if (port) {
      this.port = port;
    }

    if (unitId) {
      this.unitId = unitId;
    }

    this.client.setID(this.unitId);
    this.client.setTimeout(1000);

    return true;
  }

  async start(): Promise<void> {
    if (!this.host) {
      this.logger.error('No host defined');
    }

    await this.client.connectTCP(this.host!, {
      port: this.port,
      keepAlive: true,
      timeout: 1000,
    });

    await this.provider.setAttributeValue('connected', 'on');
  }

  async valueChanged(attribute: string, value: any): Promise<void> {
    this.logger.info(`Attribute ${attribute} changed to ${value}`);
  }

  stop(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  destroy(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export default Growatt3PHModTL3X;
