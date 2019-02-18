import Location from "./Location";
import ModeInfo from "./trip/ModeInfo";
declare class StopLocation extends Location {
    private _code;
    private _popularity;
    private _modeInfo;
    private _wheelchairAccessible;
    private _url;
    readonly code: string;
    readonly popularity: number;
    readonly modeInfo: ModeInfo;
    readonly wheelchairAccessible: boolean | undefined;
    readonly url: string | undefined;
}
export default StopLocation;
