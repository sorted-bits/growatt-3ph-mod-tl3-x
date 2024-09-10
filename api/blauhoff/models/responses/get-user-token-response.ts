import { BaseResponse } from './base.response';

export interface GetUserTokenResponse extends BaseResponse {
    data: string;
    success: boolean;
}
