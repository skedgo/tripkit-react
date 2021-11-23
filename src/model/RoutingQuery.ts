import Location from "./Location";
import {Moment} from "moment-timezone";
import DateTimeUtil from "../util/DateTimeUtil";
import TKUserProfile from "./options/TKUserProfile";
import RegionInfo from "./region/RegionInfo";
import ModeInfo from "./trip/ModeInfo";

export enum TimePreference {
    NOW = "NOW",
    LEAVE = "LEAVE",
    ARRIVE = "ARRIVE"
}

class RoutingQuery {

    private _from: Location | null;
    private _to: Location | null;
    private _timePref: TimePreference;
    private _time: Moment;

    public static create(from: Location | null = null, to: Location | null = null, timePref: TimePreference = TimePreference.NOW, time: Moment = DateTimeUtil.getNow()) {
        const instance = new RoutingQuery();
        instance._from = from;
        instance._to = to;
        instance._timePref = timePref;
        instance._time = time;
        return instance;
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

    public getQueryUrl(modeSet: string[], options: TKUserProfile, regionInfo?: RegionInfo): string {
        if (this.from === null || this.to === null) {
            return "";
        }
        let modeParams = "";
        for (const mode of modeSet) {
            modeParams += "&modes=" + mode;
        }
        // Notice I include all avoid modes, even modes that are not present in the region.
        let avoidModeParams = "";
        const avoidModes = options.transportOptions.avoidTransports;
        for (const avoidMode of avoidModes) {
            avoidModeParams += "&avoid=" + avoidMode;
        }
        const weightingPreferencesParam = "&wp=" + options.weightingPrefs.toUrlParam();
        const minTransferTimeParam = "&tt=" + options.minimumTransferTime;
        const walkingSpeedParam = "&ws=" + options.walkingSpeed;
        const cyclingSpeedParam = "&cs=" + options.cyclingSpeed;
        const concessionPricingParam = options.transitConcessionPricing ? "&conc=true" : ""; // API default: false
        const wheelchairParam = options.wheelchair ? "&wheelchair=true" : ""; // API default: false

        return "routing.json" +
            `?from=(${this.from.lat}, ${this.from.lng})"${this.from.address}"`+
            `&to=(${this.to.lat}, ${this.to.lng})"${this.to.address}"`+
            `&${this.timePref === TimePreference.ARRIVE ? "arriveBefore" : "departAfter"}=${Math.floor(this.time.valueOf() / 1000)}`+
            modeParams + avoidModeParams +
            weightingPreferencesParam +
            minTransferTimeParam +
            walkingSpeedParam + cyclingSpeedParam + concessionPricingParam +
            "&unit=auto&v=11&ir=1&includeStops=true" +
            wheelchairParam;
    }

    public isEmpty(): boolean {
        return this.from === null && this.to === null;
    }
}

export const RoutingQueryForDoc = (props: RoutingQuery) => null;
RoutingQueryForDoc.displayName = 'RoutingQuery';

export default RoutingQuery;