export const isInRange = (value: number, min: number, max: number) => {
    return value >= min && value <= max;
};

export const isNotInRange = (value: number, min: number, max: number) => {
    return !isInRange(value, min, max);
};
