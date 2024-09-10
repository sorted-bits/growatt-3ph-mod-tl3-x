import { Logger } from 'quantumhub-sdk';
import { BlauHoffDeviceStatus } from '../models/blauhoff-device-status';
import { QueryDeviceResponse } from '../models/responses/query-device.response';

/**
 * Converts device information to BlauHoff device status.
 *
 * @param log - The logger instance.
 * @param deviceInfo - The device information response.
 * @returns An array of arrays representing the BlauHoff device status.
 */
export const convertDeviceInfoToBlauHoffDeviceStatus = (
  log: Logger,
  deviceInfo: QueryDeviceResponse
): BlauHoffDeviceStatus[][] => {
  // These fields should contain the same amount of items
  if (deviceInfo.data.columns.length !== deviceInfo.data.metadata.length) {
    log.error(
      'deviceInfo.data.columns.length !== deviceInfo.data.metadata.length',
      deviceInfo.data.columns.length,
      deviceInfo.data.metadata.length
    );

    return [];
  }

  const rowData = deviceInfo.data.rows.map(
    (row, index): BlauHoffDeviceStatus[] => {
      const data: BlauHoffDeviceStatus[] = [];

      deviceInfo.data.columns.forEach((column, columnIndex) => {
        const metadata = deviceInfo.data.metadata[columnIndex];
        const value = row[columnIndex];

        data.push({
          name: column,
          dataType: metadata,
          value,
        });
      });

      return data;
    }
  );

  return rowData;
};
