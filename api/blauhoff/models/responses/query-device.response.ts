import { BaseResponse } from './base.response';

export interface Data {
    columns: string[];
    metadata: string[];
    rows: any[][];
}

export interface QueryDeviceResponse extends BaseResponse {
    success: boolean;
    data: Data
}
