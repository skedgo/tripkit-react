import ModeInfo from "../trip/ModeInfo";
import BikePodInfo from "./BikePodInfo";
import Location from "../Location";
declare class BikePodLocation extends Location {
    private _bikePod;
    private _modeInfo;
    readonly bikePod: BikePodInfo;
    readonly modeInfo: ModeInfo;
}
export default BikePodLocation;
