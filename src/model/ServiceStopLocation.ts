import { Any, JsonObject, JsonProperty } from "json2typescript";
import DateTimeUtil from "../util/DateTimeUtil";
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
    @JsonProperty('arrival', Any, true)
    private _arrival: string | number | null = null;
    @JsonProperty('departure', Any, true)
    private _departure: string | number | null = null;
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

    get bearing(): number | undefined {
        return this._bearing;
    }

    /**
     * Convert ISO to seconds since epoch, since don't have the timezone here (for Segment.endTime we do the other way around).     
     */
    get arrival(): number | null {
        return this._arrival === null || typeof this._arrival === "number" ? (this._arrival as number | null) : DateTimeUtil.isoToSeconds(this._arrival);        
    }

    set arrival(value: number | null) {
        this._arrival = value;
    }    

    get departure(): number | null {
        return this._departure === null || typeof this._departure === "number" ? (this._departure as number | null) : DateTimeUtil.isoToSeconds(this._departure);        
    }

    set departure(value: number | null) {
        this._departure = value;
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