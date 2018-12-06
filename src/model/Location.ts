import LatLng from '../model/LatLng';
import Util from "../util/Util";
import {JsonObject, JsonProperty} from "json2typescript";
import GeocodingSource, {GeocodingSourceConverter} from "../location_box/GeocodingSource";

@JsonObject
class Location extends LatLng {
    @JsonProperty('address', String, true)
    private _address: string = '';
    @JsonProperty('name', String, true)
    private _name: string = '';
    @JsonProperty('id', String, true)
    private _id: string = '';
    @JsonProperty('source', GeocodingSourceConverter, true)
    private _source: GeocodingSource | undefined = undefined;
    private _suggestion?: any;

    public static create(latlng: LatLng, address: string, id: string, name: string, source?: GeocodingSource) {
        const instance: Location = Util.iAssign(new Location(), latlng);
        instance._address = address;
        instance._name = name;
        instance._id = id;
        instance._source = source;
        return instance;
    }

    private static readonly currLocText = "My location";

    public static createCurrLoc() {
        return this.create(new LatLng(), this.currLocText, "", "");
    }

    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor() {
        super();
    }

    public isResolved() {
        return this._lat !== 0 && this._lng !== 0;
    }

    public getKey(): string {
        return String(this.lat + this.lng);
    }

    get address(): string {
        return this._address;
    }

    set address(value: string) {
        this._address = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get source(): GeocodingSource | undefined {
        return this._source;
    }

    set source(value: GeocodingSource | undefined) {
        this._source = value;
    }

    get suggestion(): any {
        return this._suggestion;
    }

    set suggestion(value: any) {
        this._suggestion = value;
    }

    public getDisplayString(): string {
        return this.name ? this.name : (this.address.includes(', ') ? this.address.substr(0, this.address.indexOf(', ')) : this.address);
    }

    public isCurrLoc(): boolean {
        return this.address === Location.currLocText;
    }

    public toJson(): object {
        return {
            lat: this.lat,
            lng: this.lng,
            address: this.address,
            name: this.name
        };
    }
}

export default Location;