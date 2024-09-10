import { valueToTime } from '../time';

describe('valueToTime', () => {
    test('returns "00:00" when input is undefined or null', () => {
        expect(valueToTime(undefined)).toBe('00:00');
        expect(valueToTime(null)).toBe('00:00');
    });

    test('returns "00:00" when input is an empty string', () => {
        expect(valueToTime('')).toBe('00:00');
    });

    test('returns "00:0x" when input is a single digit number', () => {
        expect(valueToTime(1)).toBe('00:01');
        expect(valueToTime(9)).toBe('00:09');
    });

    test('returns "00:xx" when input is a two-digit number', () => {
        expect(valueToTime(10)).toBe('00:10');
        expect(valueToTime(35)).toBe('00:35');
    });

    test('returns "0x:yy" when input is a three-digit number', () => {
        expect(valueToTime(123)).toBe('01:23');
        expect(valueToTime(930)).toBe('09:30');
    });

    test('returns "xx:yy" when input is a four-digit number', () => {
        expect(valueToTime(1234)).toBe('12:34');
        expect(valueToTime(2359)).toBe('23:59');
    });

    test('returns input as is when input is a string with more than four characters', () => {
        expect(valueToTime('12345')).toBe('12345');
        expect(valueToTime('abcdef')).toBe('abcdef');
    });
});
