import Location from "./Location";
import { Moment } from "moment-timezone";
import Options from "./Options";
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
    private _options;
    static create(from?: Location | null, to?: Location | null, timePref?: TimePreference, time?: Moment): RoutingQuery;
    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor();
    from: Location | null;
    to: Location | null;
    timePref: TimePreference;
    time: Moment;
    options: Options;
    isComplete(checkResolved?: boolean): boolean;
    getGoUrl(plannerUrl?: string): string;
    getQueryUrls(): Promise<string[]>;
    private getQueryUrlsForRegion;
    getQueryUrl(modeSet: string[]): string;
    sameApiQueries(other: RoutingQuery): boolean;
    isEmpty(): boolean;
}
export default RoutingQuery;
