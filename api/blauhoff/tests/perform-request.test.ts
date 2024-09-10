import fetch from 'node-fetch';

import { BlauHoffAPI } from '../blauhoff-api';
import { Logger } from '../../../helpers/log';

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

const successObject = {
    msg: 'OK',
    code: 200,
    t: 1684756685989,
    data: {
        bindedList: ['SHA602131202215005'],
        invalidList: [],
        notExistList: [],
    },
};

const failObject = {
    msg: 'ERROR',
    code: 401,
    t: 1684756685989,
};

describe('perform-request', () => {
    test('GET request with no params and no headers', async () => {
        const api = new BlauHoffAPI(new Logger());

        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
        );

        await api.performRequest('/test-path', 'get', {}, {});
        expect(fetch).toHaveBeenCalledWith(
            'https://api-vpp-au.weiheng-tech.com/api/vpp/test-path',
            { body: '{}', headers: {}, method: 'get' },
        );
    });

    test('GET request with params and no headers', async () => {
        const api = new BlauHoffAPI(new Logger());

        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
        );

        const parameters = {
            userId: 1,
            deviceSn: 'serial-number',
        };

        await api.performRequest('/test-path', 'get', parameters, {});
        expect(fetch).toHaveBeenCalledWith(
            'https://api-vpp-au.weiheng-tech.com/api/vpp/test-path',
            {
                body: JSON.stringify(parameters),
                headers: {},
                method: 'get',
            },
        );
    });

    test('GET request with params and custom headers', async () => {
        const api = new BlauHoffAPI(new Logger());

        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
        );

        const parameters = {
            userId: 1,
            deviceSn: 'serial-number',
        };

        const header = {
            accessId: 'access-id',
            accessSecret: 'access-secret',
        };

        await api.performRequest('/test-path', 'get', parameters, header);
        expect(fetch).toHaveBeenCalledWith(
            'https://api-vpp-au.weiheng-tech.com/api/vpp/test-path',
            {
                body: JSON.stringify(parameters),
                headers: header,
                method: 'get',
            },
        );
    });

    test('GET request with params and undefined header', async () => {
        const api = new BlauHoffAPI(new Logger());
        api.setUserToken('user-token');

        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
        );

        const parameters = {
            userId: 1,
            deviceSn: 'serial-number',
        };

        const expectedHeader = {
            'Content-Type': 'application/json',
            Accept: '*/*',
            Authorization: 'user-token',
        };

        await api.performRequest('/test-path', 'get', parameters);
        expect(fetch).toHaveBeenCalledWith(
            'https://api-vpp-au.weiheng-tech.com/api/vpp/test-path',
            {
                body: JSON.stringify(parameters),
                headers: expectedHeader,
                method: 'get',
            },
        );
    });

    test('failing get request, failed response', async () => {
        const api = new BlauHoffAPI(new Logger());

        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(undefined);

        const response = await api.performRequest('/test-path', 'get', {});
        expect(response).toStrictEqual(undefined);
    });

    test('failing get, error from server', async () => {
        const api = new BlauHoffAPI(new Logger());

        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(
            new Response(JSON.stringify(failObject)),
        );

        const response = await api.performRequest('/test-path', 'get', {});
        expect(response).toStrictEqual(undefined);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
