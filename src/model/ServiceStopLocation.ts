import {JsonObject, JsonProperty} from "json2typescript";
import LatLng from "./LatLng";

@JsonObject
class ServiceStopLocation extends LatLng {
    @JsonProperty('code', String)
    private _code: string = '';
    @JsonProperty('name', String, true)
    public name: string = '';
    @JsonProperty('shortName', String, true)
    private _shortName: string | null = null;
    @JsonProperty('bearing', Number, true)
    private _bearing: number | undefined = undefined;
    @JsonProperty('arrival', Number, true)
    public arrival: number | null = null;
    @JsonProperty('departure', Number, true)
    public departure: number | null = null;
    @JsonProperty('relativeArrival', Number, true)
    private _relativeArrival: number | null = null;
    @JsonProperty('relativeDeparture', Number, true)
    private _relativeDeparture: number | null = null;
    @JsonProperty('wheelchairAccessible', Boolean, true)
    private _wheelchairAccessible: boolean | null = null;

    get code(): string {
        return this._code;
    }

    get shortName(): string | null {
        return this._shortName;
    }

    get bearing(): number | undefined{
        return this._bearing;
    }

    get relativeArrival(): number | null {
        return this._relativeArrival;
    }

    get relativeDeparture(): number | null {
        return this._relativeDeparture;
    }

    get wheelchairAccessible(): boolean | null {
        return this._wheelchairAccessible;
    }
}

export default ServiceStopLocation;