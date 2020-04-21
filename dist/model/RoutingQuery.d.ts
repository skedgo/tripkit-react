import Location from "./Location";
import { Moment } from "moment-timezone";
import TKUserProfile from "./options/TKUserProfile";
import RegionInfo from "./region/RegionInfo";
export declare enum TimePreference {
    NOW = "NOW",
    LEAVE = "LEAVE",
    ARRIVE = "ARRIVE"
}
declare class RoutingQuery {
    private _from;
    private _to;
    private _timePref;
    private _time;
    static create(from?: Location | null, to?: Location | null, timePref?: TimePreference, time?: Moment): RoutingQuery;
    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor();
    get from(): Location | null;
    set from(value: Location | null);
    get to(): Location | null;
    set to(value: Location | null);
    get timePref(): TimePreference;
    set timePref(value: TimePreference);
    get time(): Moment;
    set time(value: Moment);
    isComplete(checkResolved?: boolean): boolean;
    getQueryUrl(modeSet: string[], options: TKUserProfile, regionInfo?: RegionInfo): string;
    isEmpty(): boolean;
}
export default RoutingQuery;
