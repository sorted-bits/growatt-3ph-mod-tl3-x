import fetch from 'node-fetch';
import { Logger } from 'quantumhub-sdk';
import { convertDeviceInfoToBlauHoffDeviceStatus } from './helpers/device-info-to-blauhoff-device-status';
import { convertDeviceInformationToBlauHoffDevice } from './helpers/device-information-to-blauhoff-device';
import {
  createQueryBooleanResponse,
  createQueryResponse,
  isValidResponse,
} from './helpers/is-valid-response';
import { isNotInRange } from './helpers/number';
import { BlauHoffDevice } from './models/blauhoff-device';
import { BlauHoffDeviceStatus } from './models/blauhoff-device-status';
import { QueryDeviceOptions } from './models/options/query-device.options';
import {
  Mode1,
  Mode2,
  Mode3,
  Mode4,
  Mode5,
  Mode6,
  Mode7,
} from './models/options/set-mode.options';
import { BaseResponse } from './models/responses/base.response';
import { BindDeviceResponse } from './models/responses/bind-device.response';
import { GetDeviceListResponse } from './models/responses/get-device-list-response';
import {
  GetRatePowerResponse,
  Rates,
} from './models/responses/get-rate-power-response';
import { GetUserTokenResponse } from './models/responses/get-user-token-response';
import { QueryDeviceResponse } from './models/responses/query-device.response';
import { QueryResponse } from './models/responses/query-response';

const INVALID_PARAMETER_RESPONSE = {
  success: false,
  code: 410,
  data: false,
};

/**
 * Represents the API class for interacting with the BlauHoff API.
 */
export class BlauHoffAPI {
  private baseUrl: string = 'https://api-vpp-au.weiheng-tech.com/api/vpp';
  private accessId: string = 'XXX';
  private accessSecret: string = 'XXX';

  private userToken: string = '';
  log: Logger;

  constructor(log: Logger) {
    this.log = log;
  }

  updateBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  /**
   * Retrieves the authentication information.
   * @returns An object containing the access ID and access secret.
   */
  getAuthenticationInfo = (): { accessId: string; accessSecret: string } => {
    return {
      accessId: this.accessId,
      accessSecret: this.accessSecret,
    };
  };

  /**
   * Sets the authentication information for the API.
   * @param accessId - The access ID.
   * @param accessSecret - The access secret.
   */
  setAuthenticationInfo = (accessId: string, accessSecret: string) => {
    this.accessId = accessId;
    this.accessSecret = accessSecret;

    this.userToken = '';
  };

  /**
   * Sets the user token.
   *
   * @param userToken - The user token to set.
   */
  setUserToken = (userToken: string) => {
    this.userToken = userToken;
  };

  /**
   * Retrieves the user token.
   *
   * @returns {string} The user token.
   */
  getUserToken = (): string => {
    return this.userToken;
  };

  /**
   * Validates the user token by querying devices. Dumb way to do it, but it works.
   * @returns A promise that resolves to a boolean indicating whether the user token is valid.
   */
  validateUserToken = async (): Promise<QueryResponse<boolean>> => {
    const response = await this.queryDeviceList(10);
    return {
      success: response.success,
      code: response.code,
      data: response.success,
    };
  };

  /**
   * Updates the settings for the BlauHoff API.
   *
   * @param baseUrl - The base URL of the BlauHoff API.
   * @param accessId - The access ID for authentication.
   * @param accessSecret - The access secret for authentication.
   * @param refreshInterval - The refresh interval in milliseconds.
   * @returns A Promise that resolves when the settings are updated.
   */
  updateSettings = async (
    accessId: string,
    accessSecret: string
  ): Promise<QueryResponse<boolean>> => {
    this.setAuthenticationInfo(accessId, accessSecret);
    return this.fetchUserToken();
  };

  /**
   * Retrieves the list of BlauHoff devices.
   *
   * @returns A promise that resolves to an array of BlauHoffDevice objects.
   */
  queryDeviceList = async (
    pageSize: number = 10
  ): Promise<QueryResponse<BlauHoffDevice[]>> => {
    const devices: BlauHoffDevice[] = [];

    const page1 = await this.queryDeviceListPage(1, pageSize);

    const result = createQueryResponse<BlauHoffDevice[]>(page1);
    if (!result.success) {
      this.log.error('Failed to queryDeviceList', JSON.stringify(page1));
      return result;
    }

    page1!.data.data.forEach((item) => {
      devices.push(convertDeviceInformationToBlauHoffDevice(item));
    });

    for (let pageNr = 2; pageNr <= page1!.data.totalPages; pageNr++) {
      const page = await this.queryDeviceListPage(pageNr, pageSize);
      if (isValidResponse(page)) {
        page!.data.data.forEach((item) => {
          devices.push(convertDeviceInformationToBlauHoffDevice(item));
        });
      }
    }

    result.data = devices;
    return result;
  };

  /**
   * Retrieves the status of a BlauHoff device.
   *
   * @param device - The BlauHoff device for which to retrieve the status.
   * @returns A promise that resolves to an array of BlauHoffDeviceStatus objects representing the device status.
   */
  queryDevice = async (
    device: BlauHoffDevice,
    options: QueryDeviceOptions
  ): Promise<QueryResponse<BlauHoffDeviceStatus[][]>> => {
    const path = '/v1/hub/device/info/query';

    const params = {
      ...options,
      deviceSn: device.serial,
    };

    const response = await this.performRequest<QueryDeviceResponse>(
      path,
      'post',
      params
    );

    const result = createQueryResponse<BlauHoffDeviceStatus[][]>(response);
    if (!result.success) {
      this.log.error('Failed to queryDevice', JSON.stringify(response));
      return result;
    }

    result.data = convertDeviceInfoToBlauHoffDeviceStatus(this.log, response!);

    return result;
  };

  /**
   * Binds a device to the hub.
   *
   * @param serial - The serial number of the device to bind.
   * @returns A promise that resolves when the device is successfully bound.
   */
  bindDevice = async (serial: string): Promise<QueryResponse<boolean>> => {
    const path = '/v1/hub/device/bind';

    const params = {
      deviceSnList: [serial],
    };

    const response = await this.performRequest<BindDeviceResponse>(
      path,
      'post',
      params
    );
    const result = createQueryBooleanResponse(response);

    if (!result.success) {
      this.log.error('Failed to bindDevice', JSON.stringify(response));
      return result;
    }

    return result;
  };

  /**
   * Queries the rate power of a BlauHoff device.
   *
   * @param device - The BlauHoff device to query.
   * @returns A promise that resolves to the rate power of the device.
   */
  getRatePower = async (
    device: BlauHoffDevice
  ): Promise<QueryResponse<Rates>> => {
    const path = `/v1/hub/device/info?deviceSn=${device.serial}`;

    const response = await this.performRequest<GetRatePowerResponse>(
      path,
      'get'
    );

    const result = createQueryResponse<Rates>(response);
    if (!result.success) {
      this.log.error('Failed to getRatePower', JSON.stringify(response));
      return result;
    }

    this.log.info(`Got device info: ${JSON.stringify(result)}`);

    result.data = response!.data;
    return result;
  };

  /**
   * Sets the mode1 for a BlauHoffDevice.
   *
   * @param device - The BlauHoffDevice to set the mode1 for.
   * @param options - The options for setting the mode1.
   * @returns A promise that resolves to a boolean indicating whether the mode1 was set successfully.
   */
  setMode1 = async (
    device: BlauHoffDevice,
    options: Mode1
  ): Promise<QueryResponse<boolean>> => {
    const { maxFeedInLimit, batCapMin } = options;

    if (isNotInRange(maxFeedInLimit, 0, 100)) {
      this.log.error('maxFeedInLimit must be between 0 and 100');
      return INVALID_PARAMETER_RESPONSE;
    }

    if (isNotInRange(batCapMin, 10, 100)) {
      this.log.error('batCapMin must be between 10 and 100');
      return INVALID_PARAMETER_RESPONSE;
    }

    const path = '/v1/hub/device/vpp/mode1';

    const params = {
      ...options,
      deviceSn: device.serial,
    };

    return this.genericSetMode(1, path, params);
  };

  /**
   * Sets the mode2 of the BlauHoff device.
   * Direct charge at specified power level
   *
   * @param device - The BlauHoff device to set the mode2 for.
   * @param options - The options for setting the mode2.
   * @returns A promise that resolves to a boolean indicating whether the mode2 was set successfully.
   */
  setMode2 = async (
    device: BlauHoffDevice,
    options: Mode2
  ): Promise<QueryResponse<boolean>> => {
    const { batPower, batCapMin, timeout } = options;

    this.log.info('Setting mode2', options);
    if (isNotInRange(batPower, -6000, 0)) {
      this.log.error('batteryPower must be between -6000 and 0');
      return INVALID_PARAMETER_RESPONSE;
    }

    if (isNotInRange(batCapMin, 10, 100)) {
      this.log.error('batCapMin must be between 10 and 100');
      return INVALID_PARAMETER_RESPONSE;
    }

    if (isNotInRange(timeout, 0, 80)) {
      this.log.error('timeout must be between 0 and 80');
      return INVALID_PARAMETER_RESPONSE;
    }

    const path = '/v1/hub/device/vpp/mode2';

    const params = {
      ...options,
      timeout: options.timeout * 60,
      deviceSn: device.serial,
    };

    return this.genericSetMode(2, path, params);
  };

  /**
   * Sets the mode3 of the BlauHoff device.
   * Direct discharge at specified power level
   *
   * @param device - The BlauHoff device to set the mode3 for.
   * @param options - The options for setting the mode3.
   * @returns A promise that resolves to a boolean indicating whether the mode3 was set successfully.
   */
  setMode3 = async (
    device: BlauHoffDevice,
    options: Mode3
  ): Promise<QueryResponse<boolean>> => {
    const { batPower, batCapMin, timeout } = options;

    if (isNotInRange(batPower, 0, 6000)) {
      this.log.error('batteryPower must be between 0 and 6000');
      return INVALID_PARAMETER_RESPONSE;
    }

    if (isNotInRange(batCapMin, 10, 100)) {
      this.log.error('batCapMin must be between 10 and 100');
      return INVALID_PARAMETER_RESPONSE;
    }

    if (isNotInRange(timeout, 0, 80)) {
      this.log.error('timeout must be between 0 and 80');
      return INVALID_PARAMETER_RESPONSE;
    }

    const path = '/v1/hub/device/vpp/mode3';

    const params = {
      ...options,
      timeout: options.timeout * 60,
      deviceSn: device.serial,
    };

    return this.genericSetMode(3, path, params);
  };

  /**
   * Sets the mode4 of the BlauHoff device.
   * Discharge only to the load, avoid charging.
   *
   * @param device - The BlauHoff device to set the mode4 for.
   * @param options - The options for setting the mode4.
   * @returns A promise that resolves to a boolean indicating whether the mode4 was set successfully.
   */
  setMode4 = async (
    device: BlauHoffDevice,
    options: Mode4
  ): Promise<QueryResponse<boolean>> => {
    const { maxFeedInLimit, batCapMin, timeout } = options;

    if (isNotInRange(maxFeedInLimit, 0, 100)) {
      this.log.error('maxFeedInLimit must be between 0 and 100');
      return INVALID_PARAMETER_RESPONSE;
    }

    if (isNotInRange(batCapMin, 10, 100)) {
      this.log.error('batCapMin must be between 10 and 100');
      return INVALID_PARAMETER_RESPONSE;
    }

    if (isNotInRange(timeout, 0, 80)) {
      this.log.error('timeout must be between 0 and 80');
      return INVALID_PARAMETER_RESPONSE;
    }

    const path = '/v1/hub/device/vpp/mode4';

    const params = {
      ...options,
      timeout: options.timeout * 60,
      deviceSn: device.serial,
    };

    return this.genericSetMode(4, path, params);
  };

  /**
   * Sets the mode5 of the BlauHoff device.
   * Change only，no discharging
   *
   * @param device - The BlauHoff device to set the mode5 for.
   * @param options - The options for setting the mode5.
   * @returns A promise that resolves to a boolean indicating whether the mode5 was set successfully.
   */
  setMode5 = async (
    device: BlauHoffDevice,
    options: Mode5
  ): Promise<QueryResponse<boolean>> => {
    const { maxFeedInLimit, batCapMin, timeout } = options;

    if (isNotInRange(maxFeedInLimit, 0, 100)) {
      this.log.error('maxFeedInLimit must be between 0 and 100');
      return INVALID_PARAMETER_RESPONSE;
    }

    if (isNotInRange(batCapMin, 10, 100)) {
      this.log.error('batCapMin must be between 10 and 100');
      return INVALID_PARAMETER_RESPONSE;
    }

    if (isNotInRange(timeout, 0, 80)) {
      this.log.error('timeout must be between 0 and 80');
      return INVALID_PARAMETER_RESPONSE;
    }

    const path = '/v1/hub/device/vpp/mode5';

    const params = {
      ...options,
      timeout: options.timeout * 60,
      deviceSn: device.serial,
    };

    return this.genericSetMode(5, path, params);
  };

  /**
   * Sets the mode6 of the BlauHoff device.
   * Inverter outputs at specified power
   *
   * @param device - The BlauHoff device to set the mode6 for.
   * @param options - The options for setting the mode6.
   * @returns A promise that resolves to a boolean indicating whether the mode6 was set successfully.
   */
  setMode6 = async (
    device: BlauHoffDevice,
    options: Mode6
  ): Promise<QueryResponse<boolean>> => {
    const { batPower, batPowerInvLimit, batCapMin, timeout } = options;

    if (isNotInRange(batPower, 0, 6000)) {
      this.log.error('batPower must be between 0 and 6000');
      return INVALID_PARAMETER_RESPONSE;
    }

    if (isNotInRange(batPowerInvLimit, 0, 6000)) {
      this.log.error('batPowerInvLimit must be between 0 and 6000');
      return INVALID_PARAMETER_RESPONSE;
    }

    if (isNotInRange(batCapMin, 10, 100)) {
      this.log.error('batCapMin must be between 10 and 100');
      return INVALID_PARAMETER_RESPONSE;
    }

    if (isNotInRange(timeout, 0, 80)) {
      this.log.error('timeout must be between 0 and 80');
      return INVALID_PARAMETER_RESPONSE;
    }

    const path = '/v1/hub/device/vpp/mode6';

    const params = {
      ...options,
      timeout: options.timeout * 60,
      deviceSn: device.serial,
    };

    return this.genericSetMode(6, path, params);
  };

  /**
   * Sets the mode7 of the BlauHoff device.
   * Inverter operates at the specified power
   *
   * @param device - The BlauHoff device to set the mode7 for.
   * @param options - The options for setting the mode7.
   * @returns A promise that resolves to a boolean indicating whether the mode7 was set successfully.
   */
  setMode7 = async (
    device: BlauHoffDevice,
    options: Mode7
  ): Promise<QueryResponse<boolean>> => {
    const { batPower, batCapMin, timeout } = options;

    if (isNotInRange(batPower, -6000, 0)) {
      this.log.error('batPower must be between -6000 and 0');
      return INVALID_PARAMETER_RESPONSE;
    }

    if (isNotInRange(batCapMin, 10, 100)) {
      this.log.error('batCapMin must be between 10 and 100');
      return INVALID_PARAMETER_RESPONSE;
    }

    if (isNotInRange(timeout, 0, 80)) {
      this.log.error('timeout must be between 0 and 80');
      return INVALID_PARAMETER_RESPONSE;
    }

    const path = '/v1/hub/device/vpp/mode7';

    const params = {
      ...options,
      timeout: options.timeout * 60,
      deviceSn: device.serial,
    };

    return this.genericSetMode(7, path, params);
  };

  /**
   * Retrieves the user token from the server.
   * @returns {Promise<void>} A promise that resolves when the user token is retrieved successfully.
   */
  fetchUserToken = async (): Promise<QueryResponse<boolean>> => {
    const path = '/v1/user/token';

    const header = {
      'Content-Type': 'application/json',
      Accept: '*/*',
      'Access-Id': this.accessId,
      'Access-Secret': this.accessSecret,
    };

    const response = await this.performRequest<GetUserTokenResponse>(
      path,
      'get',
      undefined,
      header
    );
    const result = createQueryBooleanResponse(response);

    if (!result.success) {
      this.log.error('Failed to get query device', JSON.stringify(response));
      return result;
    }

    this.userToken = response!.data;
    return result;
  };

  private genericSetMode = async (
    mode: number,
    path: string,
    params: any
  ): Promise<QueryResponse<boolean>> => {
    const response = await this.performRequest<BaseResponse>(
      path,
      'post',
      params
    );

    const result = createQueryBooleanResponse(response);

    if (!result.success) {
      this.log.error(`Failed to setMode${mode}`, JSON.stringify(response));
      return result;
    }

    this.log.info(`setMode${mode} response: ${JSON.stringify(response)}`);
    result.data = true;
    return result;
  };

  /**
   * Retrieves a page of BlauHoff devices.
   *
   * @param page - The page number to retrieve.
   * @returns A promise that resolves to an array of BlauHoffDevice objects representing the devices on the page.
   */
  private queryDeviceListPage = async (
    page: number,
    pageSize: number
  ): Promise<GetDeviceListResponse | undefined> => {
    const path = '/v1/hub/device/info/list';

    const params = {
      pageSize,
      pageNum: page,
    };

    const data = await this.performRequest<GetDeviceListResponse>(
      path,
      'post',
      params
    );

    return data;
  };

  /**
   * Returns the authorization header for API requests.
   * @returns {Headers} The authorization header.
   */
  private authorizationHeader = () => {
    return {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: this.userToken,
    };
  };

  /**
   * Performs a request to the specified path using the specified method.
   * This can also mock a response, for testing purposes.
   *
   * @template Type - The type of the response data.
   * @param {string} path - The path to send the request to.
   * @param {'get' | 'post'} method - The HTTP method to use for the request.
   * @param {any} params - The parameters to include in the request.
   * @param {Type} errorValue - The value to return in case of an error.
   * @param {Headers} [headers] - The headers to include in the request.
   * @returns {Promise<Type>} - A promise that resolves to the response data.
   */
  performRequest = async <Type>(
    path: string,
    method: 'get' | 'post',
    params: any | undefined = undefined,
    headers?: any
  ): Promise<Type | undefined> => {
    this.log.info(
      `Performing request to ${path} with params: ${JSON.stringify(params)}`
    );
    const header = headers ?? this.authorizationHeader();

    const options = params
      ? {
          method,
          headers: header,
          body: JSON.stringify(params),
        }
      : {
          method,
          headers: header,
        };

    try {
      const response = await fetch(this.baseUrl + path, options);

      if (response === undefined || response.status !== 200) {
        this.log.error(`Response failed: ${response?.statusText}`);
        return undefined;
      }

      const data = (await response.json()) as BaseResponse;

      this.log.info(
        `Response for ${path} was ${JSON.stringify(data).length} bytes`
      );

      return data as any;
    } catch (error) {
      this.log.error(`Error performing request to ${path}: ${error}`);
      return undefined;
    }
  };
}
