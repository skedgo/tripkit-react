import {JsonObject, JsonProperty} from "json2typescript";

/**
 * General component description in JSDoc format. Markdown is *supported*.
 */
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
        return String(this.lat) + this.lng;
    }

    /**
     * true just for Location instances that represent unresolved locations.
     * @public
     */
    public isNull(): boolean {
        return !this._lat || !this._lng;
    }

    public getLatLngDisplayString(): string {
        return this.lat.toFixed(5) + ", " + this.lng.toFixed(5);
    }
}

export default LatLng;