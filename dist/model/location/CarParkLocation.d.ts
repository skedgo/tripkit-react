import ModeInfo from "../trip/ModeInfo";
import Location from "../Location";
import CarParkInfo from "./CarParkInfo";
declare class CarParkLocation extends Location {
    private _carPark;
    private _modeInfo;
    readonly carPark: CarParkInfo;
    readonly modeInfo: ModeInfo;
}
export default CarParkLocation;
