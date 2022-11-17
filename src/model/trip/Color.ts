import { JsonObject, JsonProperty } from "json2typescript";
import Util from "../../util/Util";

enum ColorKeys {
    red = "red",
    green = "green",
    blue = "blue"
}
export interface ColorI {
    [ColorKeys.red]: number;
    [ColorKeys.green]: number;
    [ColorKeys.blue]: number;
}
@JsonObject
class Color implements ColorI {

    @JsonProperty(ColorKeys.red, Number)
    public red: number = 0;
    @JsonProperty(ColorKeys.green, Number)
    public green: number = 0;
    @JsonProperty(ColorKeys.blue, Number)
    public blue: number = 0;    

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

    public static fromJSON(json: ColorI): Color {
        return Util.deserialize(json, Color);
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
        return parseInt((Color.cutHex(h)).substring(0, 2), 16);
    }

    private static hexToG(h: string): number {
        return parseInt((Color.cutHex(h)).substring(2, 4), 16);
    }

    private static hexToB(h: string): number {
        return parseInt((Color.cutHex(h)).substring(4, 6), 16);
    }

    private static cutHex(h: string): string {
        return (h.charAt(0) === '#') ? h.substring(1, 7) : h;
    }
}

export default Color;