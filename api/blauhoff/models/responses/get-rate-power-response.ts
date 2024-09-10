import { BaseResponse } from './base.response';

export interface Rates {
    pvRatePower: number;
    gridRatePower: number;
    batteryRatePower: number;
    batteryCapacity: number;
}

export interface GetRatePowerResponse extends BaseResponse {
    data: Rates;
}
