/**
 * Represents the options for Mode1.
 */
export interface Mode1 {
    /**
     * Maximum Percentage of Rated Power Feed to Grid.
     * Range: 0 to 100 (%)
     */
    maxFeedInLimit: number;
    /**
     * Battery Min Capacity
     * Range: 10 to 100 (%)
     */
    batCapMin: number;
}

/**
 * Represents the options for Mode2.
 */
export interface Mode2 {
    /**
     * Battery power. Positive values indicate discharge, negative values indicate charge.
     * Range: -6000 to 0 (W)
     */
    batPower: number;

    /**
     * Battery minimum capacity.
     * Range: 10 to 100 (%)
     */
    batCapMin: number;

    /**
     * The configuration will reset after a specified number of seconds.
     * Range: 0 to 5000 (s)
     */
    timeout: number;
}

/**
 * Represents the Mode3 options.
 */
export interface Mode3 {
    /**
     * Battery power. Positive -> Discharge, Negative -> Charge
     * Rangfe: 0 to 6000 (W)
     */
    batPower: number;
    /**
     * Battery minimum capacity.
     * Range: 10 to 100 (%)
     */
    batCapMin: number;
    /**
     * The configuration will reset after a specified number of seconds.
     * Range: 0 to 5000 (s)
     */
    timeout: number;
}

/**
 * Represents the Mode4 options.
 */
export interface Mode4 {
    /**
     * Maximum Percentage of Rated Power Feed to Grid
     * Range: 0 to 100 (%)
     */
    maxFeedInLimit: number;
    /**
     * Battery Min Capacity
     * Range: 10 to 100 (%)
     */
    batCapMin: number;
    /**
     * The configuration will reset after a specified number of seconds.
     * Range: 0 to 5000 (s)
     */
    timeout: number;
}

/**
 * Represents the Mode5 options.
 */
export interface Mode5 {
    /**
     * Maximum Percentage of Rated Power Feed to Grid.
     * Range: 0 to 100 (%)
     */
    maxFeedInLimit: number;
    /**
     * Battery Min Capacity
     * Range: 10 to 100 (%)
     */
    batCapMin: number;
    /**
     * The configuration will reset after a specified number of seconds.
     * Range: 0 to 5000 (s)
     */
    timeout: number;
}

/**
 * Represents the Mode6 options.
 */
export interface Mode6 {
    /**
     * Battery power. Positive -> Discharge, Negative -> Charge
     * Range: 0 to 6000 (W)
     */
    batPower: number;
    /**
     * Battery power ref, limit
     * Range: 0 to 6000 (W)
     */
    batPowerInvLimit: number;
    /**
     * Battery Min Capacity
     * Range: 10 to 100 (%)
     */
    batCapMin: number;
    /**
     * The configuration will reset after a specified number of seconds
     * Range: 0 to 5000 (s)
     */
    timeout: number;
}

/**
 * Represents the options for Mode7.
 */
export interface Mode7 {
    /**
     * Battery power. Positive values indicate discharge, negative values indicate charge.
     * Range: -6000 to 0 W.
     */
    batPower: number;

    /**
     * Battery minimum capacity.
     * Range: 10 to 100.
     */
    batCapMin: number;

    /**
     * The configuration will reset after a specified number of seconds.
     * Range: 0 to 5000 seconds.
     */
    timeout: number;
}
