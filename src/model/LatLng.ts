import {JsonObject, JsonProperty} from "json2typescript";


@JsonObject
class LatLng {
    @JsonProperty('lat', Number)
    protected _lat: number = 0;
    @JsonProperty('lng', Number)
    protected _lng: number = 0;

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
        return this._lat;
    }

    set lat(value: number) {
        this._lat = value;
    }

    get lng(): number {
        return this._lng;
    }

    set lng(value: number) {
        this._lng = value;
    }

    public getKey(): string {
        return String(this.lat + this.lng);
    }
}

export default LatLng;