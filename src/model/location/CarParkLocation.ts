import {JsonObject, JsonProperty} from "json2typescript";
import ModeInfo from "../trip/ModeInfo";
import Location from "../Location";
import CarParkInfo from "./CarParkInfo";

@JsonObject
class CarParkLocation extends Location {

    @JsonProperty("carPark", CarParkInfo)
    private _carPark: CarParkInfo = new CarParkInfo();

    @JsonProperty("modeInfo", ModeInfo)
    private _modeInfo: ModeInfo = new ModeInfo();

    get carPark(): CarParkInfo {
        return this._carPark;
    }

    get modeInfo(): ModeInfo {
        return this._modeInfo;
    }
}

export default CarParkLocation;