import fetch from 'node-fetch';

import { BlauHoffAPI } from '../blauhoff-api';
import { Logger } from '../../../helpers/log';

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

const successObject = {
    msg: 'OK',
    code: 200,
    t: 1684756685989,
    data: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9',
    success: true,
};

const failObject = {
    msg: 'ERROR',
    code: 401,
    t: 1684756685989,
};

describe('fetch-user-token', () => {
    test('headers are successfully set', async () => {
        const api = new BlauHoffAPI(new Logger());
        api.setAuthenticationInfo('mockedAccessId', 'mockedAccessSecret');

        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
        );

        await api.fetchUserToken();

        const expectedHeaders = {
            'Content-Type': 'application/json',
            'Access-Id': 'mockedAccessId',
            'Access-Secret': 'mockedAccessSecret',
            Accept: '*/*',
        };

        expect(fetch).toHaveBeenCalledWith(
            'https://api-vpp-au.weiheng-tech.com/api/vpp/v1/user/token',
            { headers: expectedHeaders, method: 'get' },
        );

        expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('succesfully get a user token', async () => {
        const api = new BlauHoffAPI(new Logger());
        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
        );

        const result = await api.fetchUserToken();

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(api.getUserToken()).toBe('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9');
        expect(result).toStrictEqual({
            code: 200,
            success: true,
            data: true,
        });
    });

    test('fail to get a user token', async () => {
        const api = new BlauHoffAPI(new Logger());
        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(failObject)),
        );

        const result = await api.fetchUserToken();

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(api.getUserToken()).toBe('');
        expect(result).toStrictEqual({
            code: 401,
            success: false,
            data: false,
        });
    });
});

afterEach(() => {
    jest.clearAllMocks();
});
