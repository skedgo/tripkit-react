import {JsonObject, JsonProperty} from "json2typescript";


@JsonObject
class LatLng {
    @JsonProperty('lat', Number, true)
    protected _lat: number | undefined = undefined;
    @JsonProperty('lng', Number, true)
    protected _lng: number | undefined = undefined;

    public static createLatLng(lat: number, lng: number) {
        const instance: LatLng = new LatLng();
        instance._lat = lat;
        instance._lng = lng;
        return instance;
    }

    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor() {
        // Avoid empty error
    }

    get lat(): number {
        return this._lat ? this._lat : 0;
    }

    set lat(value: number) {
        this._lat = value;
    }

    get lng(): number {
        return this._lng ? this._lng : 0;
    }

    set lng(value: number) {
        this._lng = value;
    }

    public getKey(): string {
        return String(this.lat + this.lng);
    }

    /**
     * true just for Location instances that represent unresolved locations.
     */
    public isNull(): boolean {
        return !this._lat || !this._lng;
    }
}

export default LatLng;