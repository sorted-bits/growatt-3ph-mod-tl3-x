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

describe('bind-device', () => {
    test('Succesfully bind a device', async () => {
        const api = new BlauHoffAPI(new Logger());

        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
        );

        const response = await api.bindDevice('SHA602131202215005');

        expect(response.success).toStrictEqual(true);
    });

    test('Fail binding a device', async () => {
        const api = new BlauHoffAPI(new Logger());

        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(failObject)),
        );

        const response = await api.bindDevice('SHA602131202215005');

        expect(response.success).toStrictEqual(false);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
