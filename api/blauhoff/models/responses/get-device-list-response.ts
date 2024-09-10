import { BaseResponse } from './base.response';

export interface DeviceInformation {
    deviceSn: string;
    deviceModel: string;
    state: number;
    id: string
}

interface PagingInformation {
    totalPages: number;
    totalCount: number;
    data: DeviceInformation[];
}

export interface GetDeviceListResponse extends BaseResponse {
    data: PagingInformation
}
