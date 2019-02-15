import Location from "./Location";
import {Moment} from "moment-timezone";
import DateTimeUtil from "../util/DateTimeUtil";
import Options from "./Options";
import OptionsData from "../data/OptionsData";
import RegionsData from "../data/RegionsData";
import Region from "./region/Region";
import OptionsView from "../options/OptionsView";
import ModeIdentifier from "./region/ModeIdentifier";
import GeocodingSource from "../location_box/GeocodingSource";
import SchoolGeocoder from "../location_box/SchoolGeocoder";

export enum TimePreference {
    NOW = "NOW",
    LEAVE = "LEAVE",
    ARRIVE = "ARRIVE"
}

class RoutingQuery {

    // public static TimePreference = TimePreference;

    private _from: Location | null;
    private _to: Location | null;
    private _timePref: TimePreference;
    private _time: Moment;
    private _options: Options;

    public static create(from: Location | null = null, to: Location | null = null, timePref: TimePreference = TimePreference.NOW, time: Moment = DateTimeUtil.getNow()) {
        const instance = new RoutingQuery();
        instance._from = from;
        instance._to = to;
        instance._timePref = timePref;
        instance._time = time;
        instance._options = OptionsData.instance.get();
        return instance;
    }

    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor() {
        this._from = null;
        this._to = null;
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

    get options(): Options {
        return this._options;
    }

    set options(value: Options) {
        this._options = value;
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

    public getQueryUrls(): Promise<string[]> {
        const referenceLatLng = this.from && this.from.isResolved() ? this.from : (this.to && this.to.isResolved() ? this.to : undefined);
        if (referenceLatLng) {
            return RegionsData.instance.getRegionP(referenceLatLng).then((region: Region) => {
                if (!region) {
                    Promise.reject("Query out of coverage.")
                }
                return SchoolGeocoder.instance.getSchoolsDataP().then(() => { // To be able to sync get schools in getQueryUrlsForRegion()
                    return this.getQueryUrlsForRegion(region);
                });
            })
        }
        return Promise.reject("Cannot get query urls for empty query.");
    }

    private getQueryUrlsForRegion(region?: Region) {
        const modes = region ? region.modes : [];
        const enabledModes = modes.filter((mode: string) =>
            (this.options.isModeEnabled(mode)
                || (mode === "wa_wal" && this.options.wheelchair)) &&  // send wa_wal as mode when wheelchair is true.
            !OptionsView.skipMode(mode) &&
            !(mode === "pt_pub" && !this.options.isModeEnabled("pt_pub_bus")
                && !this.options.isModeEnabled("pt_pub_tram"))
        );
        let busModesSet: string[] = [];
        if (enabledModes.indexOf(ModeIdentifier.PUBLIC_TRANSPORT_ID) !== -1 &&
            (this.from && this.from.source === GeocodingSource.ACT_SCHOOLS ||
                this.to && this.to.source === GeocodingSource.ACT_SCHOOLS)) {
            const busesFrom = this.from ? SchoolGeocoder.instance.getBusesForSchoolId(this.from.id, this.time.valueOf()) : [];
            const busesTo = this.to ? SchoolGeocoder.instance.getBusesForSchoolId(this.to.id, this.time.valueOf()) : [];
            const buses = (busesFrom ? busesFrom : []).concat(busesTo ? busesTo : []);
            busModesSet = buses.map((bus: string) => ModeIdentifier.SCHOOLBUS_ID + "_" + bus);
        }
        const modeSets = enabledModes.map((mode: string) => mode === ModeIdentifier.PUBLIC_TRANSPORT_ID ? [mode].concat(busModesSet) : [mode]);
        const multiModalSet: string[] = enabledModes.concat(busModesSet);
        // to filter out singleton multi-modal set and multi-modal set containing just PT and SCHOOLBUS.
        if (multiModalSet.length !== 1 && !multiModalSet.every((mode: string) =>
            mode === ModeIdentifier.PUBLIC_TRANSPORT_ID || mode.startsWith(ModeIdentifier.SCHOOLBUS_ID))) {
            modeSets.push(multiModalSet);
        }
        if (!region) {                      // Push empty set to put something if called with no region,
            modeSets.push([]);              // which happens when checking if same query on TripPlanner.componentDidMount
        }
        return modeSets.map((modeSet: string[]) => {
            return this.getQueryUrl(modeSet);
        });
    }

    // private getExpandedModes(region: Region): string[] {
    //     const expandedModes: string[] = [];
    //     for (const mode of region.modes) {
    //         if (mode === "pt_pub") {
    //             expandedModes.push("pt_pub_bus");
    //             expandedModes.push("pt_pub_lightRail");
    //         } else {
    //             expandedModes.push(mode);
    //         }
    //     }
    //     return expandedModes;
    // }

    public getQueryUrl(modeSet: string[]): string {
        if (this.from === null || this.to === null) {
            return "";
        }
        let modeParams = "";
        for (const mode of modeSet) {
            modeParams += "&modes[]=" + mode;
        }
        if (modeSet.indexOf("pt_pub") !== -1) {
            if (!this.options.isModeEnabled("pt_pub_bus")) {
                modeParams += "&avoidModes[]=" + "pt_pub_bus";
            }
            if (!this.options.isModeEnabled("pt_pub_tram")) {
                modeParams += "&avoidModes[]=" + "pt_pub_tram";
            }
        }
        return "routing.json?" +
            "from=(" + this.from.lat + "," + this.from.lng + ")&to=(" + this.to.lat + "," + this.to.lng + ")&" +
            (this.timePref === TimePreference.ARRIVE ? "arriveBefore" : "departAfter") + "=" + Math.floor(this.time.valueOf()/1000) +
            modeParams +
            "&wp=" + this.options.weightingPrefs.toUrlParam() +
            "&tt=0&unit=auto&v=11&locale=en&ir=1&ws=1&cs=1&includeStops=true" +
            (this.options.wheelchair ? "&wheelchair=true" : "");
    }

    public sameApiQueries(other: RoutingQuery): boolean {
        const referenceLatLng = this.from && this.from.isResolved() ? this.from :
            (this.to && this.to.isResolved() ? this.to : undefined);
        // Region can be undefined since we want to check if queries are the same even before regions arrive.
        const region = referenceLatLng ? RegionsData.instance.getRegion(referenceLatLng) : undefined;
        return JSON.stringify(this.getQueryUrlsForRegion(region)) === JSON.stringify(other.getQueryUrlsForRegion(region));
    }

    public isEmpty(): boolean {
        return this.from === null && this.to === null;
    }
}

export default RoutingQuery;