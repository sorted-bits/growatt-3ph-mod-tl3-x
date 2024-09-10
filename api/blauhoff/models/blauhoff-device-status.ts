/**
 * Represents the status of a BlauHoff device.
 */
export interface BlauHoffDeviceStatus {
    /**
     * Field name for the value
     */
    name: string;
    /**
     * The data type of the value
     */
    dataType: string;
    /**
     * The value
     */
    value: string;
}
