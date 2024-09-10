import { BaseResponse } from './base.response';

interface Data {
    bindedList: string[];
    invalidList: string[];
    notExistList: string[];
}

export interface BindDeviceResponse extends BaseResponse {
    data: Data;
}
