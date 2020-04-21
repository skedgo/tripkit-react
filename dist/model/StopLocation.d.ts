import Location from "./Location";
import ModeInfo from "./trip/ModeInfo";
declare class StopLocation extends Location {
    private _code;
    private _popularity;
    private _modeInfo;
    readonly wheelchairAccessible: boolean | undefined;
    private _url;
    private _shortName;
    get code(): string;
    get popularity(): number;
    get modeInfo(): ModeInfo;
    get url(): string | undefined;
    get shortName(): string | undefined;
    set shortName(value: string | undefined);
    getKey(): string;
}
export default StopLocation;
