import Location from "./Location";
import {Moment} from "moment-timezone";
import DateTimeUtil from "../util/DateTimeUtil";
import Options from "./Options";

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

    public getGoUrl(plannerUrl?: string): string {
        const goURL = (plannerUrl ? plannerUrl : "https://act.tripgo.com/?app=tripPlanner");
        if (this.from === null || this.to === null) {
            return goURL;
        }
        return goURL + (goURL.includes("?") ? "&" : "?") +
            "flat=" + this.from.lat + "&flng=" + this.from.lng +
            "&fname=" + (this.from.isCurrLoc() && !this.from.isResolved() ? "My location" : this.from.address) +
            (this.from.id ? "&fid=" + (this.from.id) : "") +
            (this.from.source ? "&fsrc=" + (this.from.source) : "") +
            "&tlat=" + this.to.lat + "&tlng=" + this.to.lng +
            "&tname=" + (this.to.isCurrLoc() && !this.to.isResolved() ? "My location" : this.to.address) +
            (this.to.id ? "&tid=" + (this.to.id) : "") +
            (this.to.source ? "&tsrc=" + (this.to.source) : "") +
            "&type=" + (this.timePref === TimePreference.NOW ? "0" : (this.timePref === TimePreference.LEAVE ? "1" : "2")) +
            "&time=" + Math.floor(this.time.valueOf() / 1000);
    }

    public getQueryUrl(modeSet: string[], options: Options): string {
        if (this.from === null || this.to === null) {
            return "";
        }
        let modeParams = "";
        for (const mode of modeSet) {
            modeParams += "&modes[]=" + mode;
        }
        // TODO: Model avoided modes
        // if (modeSet.indexOf("pt_pub") !== -1) {
        //     if (!options.isModeEnabled("pt_pub_bus")) {
        //         modeParams += "&avoidModes[]=" + "pt_pub_bus";
        //     }
        //     if (!options.isModeEnabled("pt_pub_tram")) {
        //         modeParams += "&avoidModes[]=" + "pt_pub_tram";
        //     }
        // }
        return "routing.json?" +
            "from=(" + this.from.lat + "," + this.from.lng + ")&to=(" + this.to.lat + "," + this.to.lng + ")&" +
            (this.timePref === TimePreference.ARRIVE ? "arriveBefore" : "departAfter") + "=" + Math.floor(this.time.valueOf()/1000) +
            modeParams +
            "&wp=" + options.weightingPrefs.toUrlParam() +
            "&tt=0&unit=auto&v=11&locale=en&ir=1&ws=1&cs=1&includeStops=true" +
            (options.wheelchair ? "&wheelchair=true" : "");
    }

    public isEmpty(): boolean {
        return this.from === null && this.to === null;
    }
}

export default RoutingQuery;