import LatLng from '../model/LatLng';
import Util from "../util/Util";
import { JsonObject, JsonProperty } from "json2typescript";
import TKDefaultGeocoderNames from "../geocode/TKDefaultGeocoderNames";
import { TranslationFunction } from "../i18n/TKI18nProvider";

export interface PredictionSubstring {
    length: number;
    offset: number;
}
export interface AutocompleteStructuredFormatting {
    main_text: string;
    main_text_matched_substrings: PredictionSubstring[];
    secondary_text: string;
    secondary_text_matched_substrings?: PredictionSubstring[];
}
@JsonObject
class Location extends LatLng {
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
    public structured_formatting?: AutocompleteStructuredFormatting;
    public hasDetail?: boolean;
    // Set as optional since sometimes doesn't come. In docs it says it's required. See comment below.
    @JsonProperty('timezone', String, true)
    private _timezone: string = "";
    // Workaround since Locations sometimes come with 'timeZone' instead of 'timezone'. Clean this when fixed.
    @JsonProperty('timeZone', String, true)
    public timeZone: string | undefined = undefined;
    @JsonProperty('region', String, true)
    public region?: string = undefined;    // required according to docs, but some locations are created client side, so cannot ensure regions is set.    
    @JsonProperty('street', String, true)
    public street?: string = undefined;
    @JsonProperty('city', String, true)
    public city?: string = undefined;
    @JsonProperty('state', String, true)
    public state?: string = undefined;
    @JsonProperty('zip', String, true)
    public zip?: string = undefined;
    @JsonProperty("w3w", String, true)
    public readonly w3w?: string = undefined;
    @JsonProperty("w3wInfoURL", String, true)
    public readonly w3wInfoURL?: string = undefined;

    public static create(latlng: LatLng, address: string, id: string, name: string, source?: string) {
        const instance: Location = Util.iAssign(new Location(), latlng);
        instance._address = address;
        instance._name = name;
        instance._id = id;
        instance.source = source;
        // TODO: timezone is required when coming from tripgo api endpoints. Ensure it's also properly set
        // when created client-side. Now it may be "". Check if it's initialized to avoid requesting regions
        // prematurely, before api key was set.
        // TODO!: Refactor to avoid circular dependency. Add (preferably required) timezone paramenter to Location.create
        // and add a method LocationUtil.create that calculates timezone and returns Location.create.
        // It caused issues with styleguidist, but issues don't happen anymore.
        return instance;
    }

    private static readonly currLocText = "My location";

    public static createCurrLoc() {
        return this.create(new LatLng(), "", "", this.currLocText, TKDefaultGeocoderNames.geolocation);
    }

    private static readonly droppedPinId = "dropped";

    public static createDroppedPin(latLng: LatLng, t: TranslationFunction) {
        return this.create(latLng, t("Location"), this.droppedPinId, "")
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
        // if (!this.timeZone && !this._timezone) {
        //     const region = RegionsData.isInitialized() ? RegionsData.instance.getRegion(this) : undefined;
        //     this._timezone = region ? region.timezone : "";
        // }
        return this.timeZone || this._timezone;
    }

    set timezone(value: string) {
        this._timezone = value;
    }

    public getDisplayString(long: boolean = false): string {
        if (long) {
            const resultElems: string[] = [];
            this.name && resultElems.push(this.name);
            this.address && resultElems.push(this.address);
            if (resultElems.length === 0) {
                resultElems.push(this.getLatLngDisplayString());
            }
            return resultElems.join(', ');
        }
        return this.name ? this.name :
            this.address ?
                (this.address.includes(', ') ? this.address.substr(0, this.address.indexOf(', ')) : this.address) :
                this.getLatLngDisplayString();
    }

    public isCurrLoc(): boolean {
        return this.source === TKDefaultGeocoderNames.geolocation;
    }

    public isDroppedPin(): boolean {
        return this.id === Location.droppedPinId;
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
                Util.iAssign(this as any, { source: undefined, suggestion: undefined, hasDetail: undefined, timezone: undefined })) ===
            JSON.stringify(Util.iAssign(other, { source: undefined, suggestion: undefined, hasDetail: undefined, timezone: undefined }));
    }
}

export default Location;