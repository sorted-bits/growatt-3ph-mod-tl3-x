import { DeviceInformation } from '../models/responses/get-device-list-response';

/**
 * Converts a DeviceInformation object to a BlauHoffDevice object.
 *
 * @param deviceInformation - The DeviceInformation object to convert.
 * @returns The converted BlauHoffDevice object.
 */
export const convertDeviceInformationToBlauHoffDevice = (deviceInformation: DeviceInformation) => {
    return {
        id: deviceInformation.id,
        serial: deviceInformation.deviceSn,
        model: deviceInformation.deviceModel,
    };
};
