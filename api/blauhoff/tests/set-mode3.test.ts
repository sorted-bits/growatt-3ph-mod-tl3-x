import fetch from 'node-fetch';

import { BlauHoffAPI } from '../blauhoff-api';
import { Logger } from '../../../helpers/log';
import { testDevice } from './helpers/test-device';

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

const successObject = {
    msg: 'OK',
    code: 200,
    t: 1684756685989,
};

const failObject = {
    msg: 'ERROR',
    code: 401,
    t: 1684756685989,
};

describe('setMode3', () => {
    test('with valid values', async () => {
        const api = new BlauHoffAPI(new Logger());
        api.setUserToken('user-token');
        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
        );

        const result = await api.setMode3(testDevice, {
            batPower: 2000,
            batCapMin: 10,
            timeout: 10,
        });

        const expectHeaders = {
            Accept: '*/*',
            Authorization: 'user-token',
            'Content-Type': 'application/json',
        };

        const expectedParams = JSON.stringify({
            batPower: 2000,
            batCapMin: 10,
            timeout: 600,
            deviceSn: testDevice.serial,
        });

        expect(fetch).toHaveBeenCalledWith(
            'https://api-vpp-au.weiheng-tech.com/api/vpp/v1/hub/device/vpp/mode3',
            { body: expectedParams, headers: expectHeaders, method: 'post' },
        );

        expect(result.success).toStrictEqual(true);
    });

    test('with invalid batteryPower', async () => {
        const api = new BlauHoffAPI(new Logger());
        api.setUserToken('user-token');
        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
        );

        const result = await api.setMode3(testDevice, {
            batPower: 8000,
            batCapMin: 10,
            timeout: 10,
        });

        expect(result.success).toStrictEqual(false);
        expect(result.code).toStrictEqual(410);
    });

    test('with invalid batCapMin', async () => {
        const api = new BlauHoffAPI(new Logger());
        api.setUserToken('user-token');
        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
        );

        const result = await api.setMode3(testDevice, {
            batPower: 2000,
            batCapMin: 0,
            timeout: 10,
        });

        expect(result.success).toStrictEqual(false);
        expect(result.code).toStrictEqual(410);
    });

    test('with invalid timeout', async () => {
        const api = new BlauHoffAPI(new Logger());
        api.setUserToken('user-token');
        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
        );

        const result = await api.setMode3(testDevice, {
            batPower: 2000,
            batCapMin: 10,
            timeout: 120,
        });

        expect(result.success).toStrictEqual(false);
        expect(result.code).toStrictEqual(410);
    });

    test('fails', async () => {
        const api = new BlauHoffAPI(new Logger());
        api.setUserToken('user-token');
        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(failObject)),
        );

        const result = await api.setMode3(testDevice, {
            batPower: 2000,
            batCapMin: 10,
            timeout: 10,
        });

        expect(result.success).toStrictEqual(false);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
