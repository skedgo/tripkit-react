import Location from "./Location";
import {JsonObject, JsonProperty} from "json2typescript";
import ModeInfo from "./trip/ModeInfo";

@JsonObject
class StopLocation extends Location {
    @JsonProperty('code', String)
    private _code: string = '';
    @JsonProperty('popularity', Number)
    private _popularity: number = 0;
    @JsonProperty('modeInfo', ModeInfo)
    private _modeInfo: ModeInfo = new ModeInfo();
    @JsonProperty('wheelchairAccessible', Boolean, true)
    private _wheelchairAccessible: boolean | undefined = undefined;
    @JsonProperty('url', String, true)
    private _url: string | undefined = undefined;
    @JsonProperty('shortName', String, true)    // In api docs it's named "shortName"
    private _shortName: string | undefined = undefined;


    get code(): string {
        return this._code;
    }

    get popularity(): number {
        return this._popularity;
    }

    get modeInfo(): ModeInfo {
        return this._modeInfo;
    }

    get wheelchairAccessible(): boolean | undefined {
        return this._wheelchairAccessible;
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