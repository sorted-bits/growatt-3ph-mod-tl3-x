/**
 * Represents the options for querying devices.
 */
export interface QueryDeviceOptions {
    /**
     * The start time of the query, in seconds since the epoch.
     */
    start: number;
    /**
     * The end time of the query, in seconds since the epoch.
     */
    end: number;
}
