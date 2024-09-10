export const valueToTime = (value: any): string => {
    if (value === undefined || value === null) {
        return '00:00';
    }
    const valueString = value.toString();

    if (valueString.length === 0) {
        return '00:00';
    }

    if (valueString.length === 1) {
        return `00:0${value}`;
    }

    if (valueString.length === 2) {
        return `00:${value}`;
    }

    if (valueString.length === 3) {
        return `0${valueString[0]}:${valueString[1]}${valueString[2]}`;
    }

    if (valueString.length === 4) {
        return `${valueString[0]}${valueString[1]}:${valueString[2]}${valueString[3]}`;
    }

    return value;
};
