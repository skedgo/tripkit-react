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
}

export default Color;