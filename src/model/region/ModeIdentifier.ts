import {JsonObject, JsonProperty} from "json2typescript";
import Color from "../trip/Color";

@JsonObject
class ModeIdentifier {
    @JsonProperty("title", String)
    private _title: string = "";
    @JsonProperty("color", Color, true)
    private _color: Color | null = null;
    @JsonProperty("icon", String, true)
    private _icon: string | null = null;

    private _identifier: string = "";

    public static readonly SCHOOLBUS_ID = "pt_ltd_SCHOOLBUS";
    public static readonly UBER_ID = "ps_tnc_UBER";
    public static readonly CAR_RENTAL_SW_ID = "me_car-r_SwiftFleet";
    public static readonly TAXI_ID = "ps_tax";
    public static readonly PUBLIC_TRANSPORT_ID = "pt_pub";
    public static readonly TRAM_ID = "pt_pub_tram";
    public static readonly WALK_ID = "wa_wal";

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    get color(): Color | null {
        return this._color;
    }

    set color(value: Color | null) {
        this._color = value;
    }

    get icon(): string | null {
        return this._icon;
    }

    set icon(value: string | null) {
        this._icon = value;
    }

    get identifier(): string {
        return this._identifier;
    }

    set identifier(value: string) {
        this._identifier = value;
    }
}

export default ModeIdentifier;