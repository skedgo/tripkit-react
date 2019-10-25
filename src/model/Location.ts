import LatLng from '../model/LatLng';
import Util from "../util/Util";
import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
class Location extends LatLng {
    @JsonProperty('class', String, true)
    private _class: string = '';
    @JsonProperty('address', String, true)
    private _address: string = '';
    @JsonProperty('name', String, true)
    private _name: string = '';
    @JsonProperty('id', String, true)
    private _id: string = '';
    @JsonProperty('source', String, true)
    private _source: string | undefined = undefined;
    private _icon: string | undefined;
    private _suggestion?: any;

    public static create(latlng: LatLng, address: string, id: string, name: string, source?: string, icon?: string) {
        const instance: Location = Util.iAssign(new Location(), latlng);
        instance._address = address;
        instance._name = name;
        instance._id = id;
        instance._source = source;
        instance._icon = icon;
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

    public isResolved(): boolean {
        return !this.isNull();
    }

    public getKey(): string {
        return String(this.lat) + this.lng;
    }

    get class(): string {
        return this._class;
    }

    set class(value: string) {
        this._class = value;
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

    get source(): string | undefined {
        return this._source;
    }

    set source(value: string | undefined) {
        this._source = value;
    }

    get icon(): string | undefined {
        return this._icon;
    }

    set icon(value: string | undefined) {
        this._icon = value;
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