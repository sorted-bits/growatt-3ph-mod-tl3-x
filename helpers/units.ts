/**
 * Returns the unit symbol for a given capability.
 * @param capabilityId - The capability ID.
 * @returns The unit symbol corresponding to the capability.
 */
export const unitForCapability = (capabilityId: string): string => {
    const parts = capabilityId.split('.');
    if (parts.length < 1) {
        return '';
    }

    const capability = parts[0];

    switch (capability) {
        case 'measure_voltage':
            return 'V';
        case 'measure_current':
            return 'A';
        case 'measure_power':
            return 'W';
        case 'measure_percentage':
            return '%';
        case 'measure_temperature':
            return '°C';
        case 'meter_power':
            return 'kWh';

        default:
            return '';
    }
};
