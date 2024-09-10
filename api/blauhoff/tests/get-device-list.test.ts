import fetch from 'node-fetch';

import { BlauHoffAPI } from '../blauhoff-api';
import { Logger } from '../../../helpers/log';
import { deviceList1, deviceList2, deviceList3 } from './helpers/device-lists';

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

const successObject = {
    msg: 'OK',
    code: 200,
    t: 1684756685989,
    data: {
        totalPages: 1,
        totalCount: 2,
        data: [
            {
                deviceSn: 'SHA602131202215005',
                deviceModel: 'SPHA6.0H-10.24kW',
                state: 0,
                id: '1678686019714682881',
            },
            {
                deviceSn: 'SHA602131202215004',
                deviceModel: 'SPHA6.0H-10.24kW',
                state: 0,
                id: '1678686019714682880',
            },
        ],
    },
    success: true,
};

const failObject = {
    msg: 'ERROR',
    code: 401,
    t: 1684756685989,
};

describe('get-device-list', () => {
    test('Fetch a single page of items', async () => {
        const api = new BlauHoffAPI(new Logger());
        api.setAuthenticationInfo('mockedAccessId', 'mockedAccessSecret');

        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
        );

        const response = await api.queryDeviceList();

        expect(response).toStrictEqual({
            success: true,
            code: 200,
            data: [
                {
                    serial: 'SHA602131202215005',
                    model: 'SPHA6.0H-10.24kW',
                    id: '1678686019714682881',
                },
                {
                    serial: 'SHA602131202215004',
                    model: 'SPHA6.0H-10.24kW',
                    id: '1678686019714682880',
                },
            ],
        });
    });

    test('Fetching multiple pages of items', async () => {
        const api = new BlauHoffAPI(new Logger());
        api.setAuthenticationInfo('mockedAccessId', 'mockedAccessSecret');

        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>)
            .mockResolvedValueOnce(new Response(JSON.stringify(deviceList1)))
            .mockResolvedValueOnce(new Response(JSON.stringify(deviceList2)))
            .mockResolvedValueOnce(new Response(JSON.stringify(deviceList3)));

        const response = await api.queryDeviceList(2);
        expect(response.data).toHaveLength(5);

        expect(response.data).toStrictEqual([
            {
                serial: 'SHA602131202215001',
                model: 'SPHA6.0H-10.12kW',
                id: '1',
            },
            {
                serial: 'SHA602131202215002',
                model: 'SPHA6.0H-10.24kW',
                id: '2',
            },
            {
                serial: 'SHA602131202215003',
                model: 'SPHA6.0H-10.16kW',
                id: '3',
            },
            {
                serial: 'SHA602131202215004',
                model: 'SPHA6.0H-10.18kW',
                id: '4',
            },
            {
                serial: 'SHA602131202215005',
                model: 'SPHA6.0H-10.20kW',
                id: '5',
            },
        ]);
    });

    test('Fail fetching items', async () => {
        const api = new BlauHoffAPI(new Logger());
        api.setAuthenticationInfo('mockedAccessId', 'mockedAccessSecret');

        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(failObject)),
        );

        const response = await api.queryDeviceList();

        expect(response).toStrictEqual({
            success: false,
            code: 401,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
