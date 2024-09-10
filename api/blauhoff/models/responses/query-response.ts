export interface QueryResponse<T> {
    data?: T
    success: boolean;
    code?: number;
}
