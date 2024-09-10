import { unitForCapability } from '../units';

describe('unitForCapability', () => {
    it('should return "V" for "measure_voltage"', () => {
        expect(unitForCapability('measure_voltage')).toBe('V');
    });

    it('should return "A" for "measure_current"', () => {
        expect(unitForCapability('measure_current')).toBe('A');
    });

    it('should return "W" for "measure_power"', () => {
        expect(unitForCapability('measure_power')).toBe('W');
    });

    it('should return "%" for "measure_percentage"', () => {
        expect(unitForCapability('measure_percentage')).toBe('%');
    });

    it('should return "°C" for "measure_temperature"', () => {
        expect(unitForCapability('measure_temperature')).toBe('°C');
    });

    it('should return "kWh" for "meter_power"', () => {
        expect(unitForCapability('meter_power')).toBe('kWh');
    });

    it('should return "" for an unknown capability', () => {
        expect(unitForCapability('unknown_capability')).toBe('');
    });

    it('should return "" if capabilityId does not contain a "."', () => {
        expect(unitForCapability('noDotHere')).toBe('');
    });
});
