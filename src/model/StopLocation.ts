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
    private _wheelchairAccessible: boolean | null = null;
    @JsonProperty('url', String, true)
    private _url: string | null = null;


    get code(): string {
        return this._code;
    }

    get popularity(): number {
        return this._popularity;
    }

    get modeInfo(): ModeInfo {
        return this._modeInfo;
    }

    get wheelchairAccessible(): boolean | null {
        return this._wheelchairAccessible;
    }

    get url(): string | null {
        return this._url;
    }
}

export default StopLocation;