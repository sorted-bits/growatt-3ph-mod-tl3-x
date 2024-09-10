import { BlauHoffAPI } from '../blauhoff-api';
import { Logger } from '../../../helpers/log';

describe('set-authentication-info', () => {
    test('update', async () => {
        const api = new BlauHoffAPI(new Logger());
        api.setUserToken('test');

        api.setAuthenticationInfo('access-id', 'access-secret');

        const info = api.getAuthenticationInfo();

        expect(info.accessId).toStrictEqual('access-id');
        expect(info.accessSecret).toStrictEqual('access-secret');
        expect(api.getUserToken()).toStrictEqual('');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
