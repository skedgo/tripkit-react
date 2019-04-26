import Location from "./Location";
import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
class ServiceStopLocation extends Location {
    @JsonProperty('code', String)
    private _code: string = '';
    @JsonProperty('shortName', String, true)
    private _shortName: string | null = null;
    @JsonProperty('bearing', Number, true)
    private _bearing: number | null = null;
    @JsonProperty('arrival', Number, true)
    private _arrival: number | null = null;
    @JsonProperty('departure', Number, true)
    private _departure: number | null = null;
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

    get bearing(): number | null {
        return this._bearing;
    }

    get arrival(): number | null {
        return this._arrival;
    }

    get departure(): number | null {
        return this._departure;
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