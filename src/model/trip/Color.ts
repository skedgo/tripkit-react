import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
class Color {

    @JsonProperty("red", Number)
    private _red: number = 0;
    @JsonProperty("green", Number)
    private _green: number = 0;
    @JsonProperty("blue", Number)
    private _blue: number = 0;

    get red(): number {
        return this._red;
    }

    set red(value: number) {
        this._red = value;
    }

    get green(): number {
        return this._green;
    }

    set green(value: number) {
        this._green = value;
    }

    get blue(): number {
        return this._blue;
    }

    set blue(value: number) {
        this._blue = value;
    }

    public toRGB(): string {
        return "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
    }

    public toRGBA(alpha: number = 1): string {
        return "rgba(" + this.red + "," + this.green + "," + this.blue + "," + alpha + ")";
    }

    public toHex(): string {
        return "#"
            + this.toHexString(this.red)
            + this.toHexString(this.green)
            + this.toHexString(this.blue);
    }

    private toHexString(rgb: number) {
        let hex = Number(rgb).toString(16);
        if (hex.length < 2) {
            hex = "0" + hex;
        }
        return hex;
    }

    public static createFromString(value: string): Color {
        if (value.startsWith("#"))
            return Color.createFromHex(value);
        else if (value.startsWith("rgb"))
            return Color.createFromRGB(value);
        return new Color();
    }

    public static createFromRGB(rgba: string): Color {
        rgba = rgba.substring(4, rgba.length - 1);
        const values: string[] = rgba.split(",");
        const color = new Color();
        color.red = parseInt(values[0]);
        color.green = parseInt(values[1]);
        color.blue = parseInt(values[2]);
        return color;
    }

    public static createFromHex(hex: string): Color {
        const color = new Color();
        color.red = Color.hexToR(hex);
        color.green = Color.hexToG(hex);
        color.blue = Color.hexToB(hex);
        return color;
    }

    private static hexToR(h: string): number {
        return parseInt((Color.cutHex(h)).substring(0,2), 16);
    }

    private static hexToG(h: string): number {
        return parseInt((Color.cutHex(h)).substring(2,4), 16);
    }

    private static hexToB(h: string): number {
        return parseInt((Color.cutHex(h)).substring(4,6), 16);
    }

    private static cutHex(h: string): string {
        return (h.charAt(0) === '#') ? h.substring(1, 7) : h;
    }
}

export default Color;