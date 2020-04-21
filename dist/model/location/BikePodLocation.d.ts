import ModeInfo from "../trip/ModeInfo";
import BikePodInfo from "./BikePodInfo";
import Location from "../Location";
declare class BikePodLocation extends Location {
    private _bikePod;
    private _modeInfo;
    get bikePod(): BikePodInfo;
    get modeInfo(): ModeInfo;
}
export default BikePodLocation;
