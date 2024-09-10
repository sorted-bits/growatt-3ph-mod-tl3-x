import { DeviceRepository } from '../device-repository';
import { Brand } from '../models/enum/brand';
import { RegisterType } from '../models/enum/register-type';

describe('device-repository', () => {
    test('get models for brand', async () => {
        const response = DeviceRepository.getInstance().getDevicesByBrand(Brand.Deye);
        expect(response).toBeDefined();
        expect(response.length).toBe(1);

        const model = response[0];

        expect(model.id).toBe('sun-xk-sg01hp3-eu-am2');
        expect(model.inputRegisters).toBeDefined();

        const growatts = DeviceRepository.getInstance().getDevicesByBrand(Brand.Growatt);
        expect(growatts).toBeDefined();
        expect(growatts.length).toBe(2);
    });

    test('check if holding registers have the right type', async () => {
        const device = DeviceRepository.getInstance().getDeviceById('sun-xk-sg01hp3-eu-am2');
        expect(device).toBeDefined();

        const registers = device?.holdingRegisters;
        expect(registers).toBeDefined();
        expect(registers?.length).toBeGreaterThan(0);

        const holdingRegister = registers![0];
        expect(holdingRegister.registerType).toBe(RegisterType.Holding);
    });

    test('check if input registers have the right type', async () => {
        const device = DeviceRepository.getInstance().getDeviceById('af-xk-th-three-phase-hybrid');
        expect(device).toBeDefined();

        const registers = device?.inputRegisters;
        expect(registers).toBeDefined();
        expect(registers?.length).toBeGreaterThan(0);

        const holdingRegister = registers![0];
        expect(holdingRegister.registerType).toBe(RegisterType.Input);
    });

    test('getDeviceModel with existing model', async () => {
        const response = DeviceRepository.getInstance().getDevicesByBrand(Brand.Deye);
        expect(response.length).toBeGreaterThan(0);
        const model = response[0];

        const queryModel = DeviceRepository.getInstance().getDeviceById(model.id);

        expect(queryModel).toBeDefined();
        expect(queryModel?.brand).toBe(Brand.Deye);
        expect(queryModel).toEqual(model);
    });

    test('getDeviceModel with non existing model', async () => {
        const model = DeviceRepository.getInstance().getDeviceById('non-existing-model');
        expect(model).toBeUndefined();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
