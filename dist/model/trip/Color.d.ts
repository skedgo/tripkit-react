declare class Color {
    private _red;
    private _green;
    private _blue;
    get red(): number;
    set red(value: number);
    get green(): number;
    set green(value: number);
    get blue(): number;
    set blue(value: number);
    toRGB(): string;
    toHex(): string;
    private toHexString;
}
export default Color;
