import LatLng from '../model/LatLng';
import Util from "../util/Util";
import {JsonObject, JsonProperty} from "json2typescript";
import CurrentLocationGeocoder from "../geocode/CurrentLocationGeocoder";

@JsonObject
class Location extends LatLng {
    // Use this property for serialization / deserialization to proper class. See LocationConverter.
    @JsonProperty('class', String, true)
    public class: string = 'Location';
    @JsonProperty('address', String, true)
    private _address: string = '';
    @JsonProperty('name', String, true)
    private _name: string = '';
    @JsonProperty('id', String, true)
    private _id: string = '';
    @JsonProperty('source', String, true)
    public source: string | undefined = undefined;
    public suggestion?: any;
    public hasDetail?: boolean;

    public static create(latlng: LatLng, address: string, id: string, name: string, source?: string) {
        const instance: Location = Util.iAssign(new Location(), latlng);
        instance._address = address;
        instance._name = name;
        instance._id = id;
        instance.source = source;
        return instance;
    }

    private static readonly currLocText = "My location";

    public static createCurrLoc() {
        return this.create(new LatLng(), this.currLocText, "", "", CurrentLocationGeocoder.SOURCE_ID);
    }

    private static readonly droppedPinText = "Location";

    public static createDroppedPin(latLng: LatLng) {
        return this.create(latLng, this.droppedPinText, "", "")
    }

    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor() {
        super();
    }

    public isResolved(): boolean {
        return !this.isNull();
    }

    public getKey(): string {
        return String(this.lat) + this.lng;
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

    public getDisplayString(): string {
        return this.name ? this.name : (this.address.includes(', ') ? this.address.substr(0, this.address.indexOf(', ')) : this.address);
    }

    public isCurrLoc(): boolean {
        return this.address === Location.currLocText;
    }

    public isDroppedPin(): boolean {
        return this.address === Location.droppedPinText;
    }

    public toJson(): object {
        return {
            lat: this.lat,
            lng: this.lng,
            address: this.address,
            name: this.name
        };
    }

    equals(other: any): boolean {
        return other &&
            JSON.stringify(
                Util.iAssign(this, {source: undefined, suggestion: undefined, hasDetail: undefined})) ===
            JSON.stringify(Util.iAssign(other, {source: undefined, suggestion: undefined, hasDetail: undefined}));
    }
}

export default Location;