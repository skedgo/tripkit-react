import LatLng from '../model/LatLng';
import Util from "../util/Util";
import {JsonObject, JsonProperty} from "json2typescript";
import CurrentLocationGeocoder from "../geocode/CurrentLocationGeocoder";
import RegionsData from "../data/RegionsData";

@JsonObject
class Location extends LatLng {
    // Use this property for serialization / deserialization to proper class. See LocationConverter.
    @JsonProperty('class', String, true)
    public class: string = 'Location';
    @JsonProperty('address', String, true)
    private _address: string | undefined = undefined;
    @JsonProperty('name', String, true)
    private _name: string = '';
    @JsonProperty('id', String, true)
    private _id: string = '';
    @JsonProperty('source', String, true)
    public source: string | undefined = undefined;
    public suggestion?: any;
    public hasDetail?: boolean;
    // Set as optional since sometimes doesn't come. In docs it says it's required. See comment below.
    @JsonProperty('timezone', String, true)
    private _timezone: string = "";
    // Workaround since Locations sometimes come with 'timeZone' instead of 'timezone'. Clean this when fixed.
    @JsonProperty('timeZone', String, true)
    public timeZone: string | undefined = undefined;

    public static create(latlng: LatLng, address: string, id: string, name: string, source?: string) {
        const instance: Location = Util.iAssign(new Location(), latlng);
        instance._address = address;
        instance._name = name;
        instance._id = id;
        instance.source = source;
        // TODO: timezone is required when coming from tripgo api endpoints. Ensure it's also properly set
        // when created client-side. Now it may be "". Check if it's initialized to avoid requesting regions
        // prematurely, before api key was set.
        const region = RegionsData.isInitialized() ? RegionsData.instance.getRegion(latlng) : undefined;
        instance._timezone = region ? region.timezone : "";
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

    get address(): string | undefined {
        return this._address;
    }

    set address(value: string | undefined) {
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

    get timezone(): string {
        return this.timeZone || this._timezone;
    }

    set timezone(value: string) {
        this._timezone = value;
    }

    public getDisplayString(): string {
        return this.name ? this.name :
            this.address ?
            (this.address.includes(', ') ? this.address.substr(0, this.address.indexOf(', ')) : this.address):
            this.getLatLngDisplayString();
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
                Util.iAssign(this as any, {source: undefined, suggestion: undefined, hasDetail: undefined, timezone: undefined})) ===
            JSON.stringify(Util.iAssign(other, {source: undefined, suggestion: undefined, hasDetail: undefined, timezone: undefined}));
    }
}

export default Location;