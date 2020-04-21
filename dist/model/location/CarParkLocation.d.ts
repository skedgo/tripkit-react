import ModeInfo from "../trip/ModeInfo";
import Location from "../Location";
import CarParkInfo from "./CarParkInfo";
declare class CarParkLocation extends Location {
    private _carPark;
    private _modeInfo;
    get carPark(): CarParkInfo;
    get modeInfo(): ModeInfo;
}
export default CarParkLocation;
