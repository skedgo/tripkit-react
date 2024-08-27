import { JsonObject, JsonProperty } from "json2typescript";
import ModeLocation from "./location/ModeLocation";

@JsonObject
class StopLocation extends ModeLocation {
    @JsonProperty('code', String)
    private _code: string = '';
    @JsonProperty('popularity', Number)
    private _popularity: number = 0;
    @JsonProperty('wheelchairAccessible', Boolean, true)
    public readonly wheelchairAccessible: boolean | undefined = undefined;
    @JsonProperty('url', String, true)
    private _url: string | undefined = undefined;
    @JsonProperty('shortName', String, true)    // In api docs it's named "shortName"
    private _shortName: string | undefined = undefined;
    @JsonProperty('services', String, true)
    public services?: string = undefined;

    get code(): string {
        return this._code;
    }

    get popularity(): number {
        return this._popularity;
    }

    get url(): string | undefined {
        return this._url;
    }

    get shortName(): string | undefined {
        return this._shortName;
    }

    set shortName(value: string | undefined) {
        this._shortName = value;
    }
}

export default StopLocation;