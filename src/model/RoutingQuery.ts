import Location from "./Location";
import { Moment } from "moment-timezone";
import DateTimeUtil from "../util/DateTimeUtil";
import TKUserProfile, { WalkingSpeedConverter } from "./options/TKUserProfile";
import Environment from "../env/Environment";
import { i18n } from "../i18n/TKI18nConstants";
import TripGoApi from "../api/TripGoApi";

export enum TimePreference {
    NOW = "NOW",
    LEAVE = "LEAVE",
    ARRIVE = "ARRIVE"
}

// type URLQueryParam = "wp" | "tt";
type RoutingQueryAdditional = { [key: string]: string | string[] | boolean | number };

function minEncodeURIComponent(str: string): string {
    return str.replace(/#/g, "%23");
}

class RoutingQuery {

    private _from: Location | null;
    private _to: Location | null;
    private _timePref: TimePreference;
    private _time: Moment;
    public additional?: RoutingQueryAdditional;

    public static create(from: Location | null = null, to: Location | null = null, timePref: TimePreference = TimePreference.NOW, time: Moment = DateTimeUtil.getNow()) {
        const instance = new RoutingQuery();
        instance._from = from;
        instance._to = to;
        instance._timePref = timePref;
        instance._time = time;
        return instance;
    }

    public static buildAdditional(modes: string[], options: TKUserProfile): RoutingQueryAdditional {
        return ({
            modes,
            avoid: options.transportOptions.avoidTransports,    // Notice I include all avoid modes, even modes that are not present in the region.
            wp: options.weightingPrefs.toUrlParam(),
            tt: options.minimumTransferTime,
            ws: new WalkingSpeedConverter().serialize(options.walkingSpeed),
            cs: new WalkingSpeedConverter().serialize(options.cyclingSpeed),
            ...options.transitConcessionPricing && {
                conc: true
            },
            ...options.wheelchair && {
                wheelchair: true
            },
            unit: i18n.distanceUnit(),
            v: TripGoApi.apiVersion,
            ir: 1,
            includeStops: true,
            ...(Environment.isBeta() || Environment.isStaging()) && {
                bsb: true
            },
            groupDRT: false, // Default to false for now, then switch to true.
            ...options.routingQueryParams   // Profile params, have priority over the others
        });
    }

    public static locationMetadataString(location: Location): string {
        return location.address ?? "";
    }

    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor() {
        this._from = null;
        this._to = null;
        this._timePref = TimePreference.NOW;
        this._time = DateTimeUtil.getNow();
    }

    get from(): Location | null {
        return this._from;
    }

    set from(value: Location | null) {
        this._from = value;
    }

    get to(): Location | null {
        return this._to;
    }

    set to(value: Location | null) {
        this._to = value;
    }


    get timePref(): TimePreference {
        return this._timePref;
    }

    set timePref(value: TimePreference) {
        this._timePref = value;
    }

    get time(): Moment {
        return this._timePref === TimePreference.NOW || this._time === null ? DateTimeUtil.getNow() : this._time;
    }

    set time(value: Moment) {
        this._time = value;
    }

    public isComplete(checkResolved = false): boolean {
        return this.from !== null && (!checkResolved || this.from.isResolved()) &&
            this.to !== null && (!checkResolved || this.to.isResolved());
    }

    public getQueryUrl(modeSet: string[], options: TKUserProfile): string {
        if (this.from === null || this.to === null) {
            return "";
        }
        const additional = RoutingQuery.buildAdditional(modeSet, options);
        const additionalParams = Object.keys(additional).reduce((params, key) => {
            if (Array.isArray(additional[key])) {
                return params + (additional[key] as string[]).reduce((arrayParam, value) => arrayParam + '&' + key + '=' + value, "");
            } else {
                return params + '&' + key + '=' + additional[key];
            }
        }, "");
        // Try to apply the minimal encoding that is safe for the URL. Specially for the address (or user typed strings), that can contain special characters,
        // use encodeURIComponent (more aggressive encoding, intended for URI components). For the rest, use encodeURI (less aggressive encoding, intended for URIs,
        // so, e.g., don't escape commas).
        // See [encodeURI() vs. encodeURIComponent()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI#encodeuri_vs._encodeuricomponent)        
        return "routing.json" +
            `?from=(${this.from.lat},${this.from.lng})"${encodeURIComponent(RoutingQuery.locationMetadataString(this.from))}"` +
            `&to=(${this.to.lat},${this.to.lng})"${encodeURIComponent(RoutingQuery.locationMetadataString(this.to))}"` +
            `&${this.timePref === TimePreference.ARRIVE ? "arriveBefore" : "departAfter"}=${Math.floor(this.time.valueOf() / 1000)}` +
            encodeURI(additionalParams);
    }

    public isEmpty(): boolean {
        return this.from === null && this.to === null;
    }
}

export const RoutingQueryForDoc = (props: RoutingQuery) => null;
RoutingQueryForDoc.displayName = 'RoutingQuery';

export default RoutingQuery;