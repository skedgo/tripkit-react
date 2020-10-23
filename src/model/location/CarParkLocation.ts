import {JsonObject, JsonProperty} from "json2typescript";
import CarParkInfo from "./CarParkInfo";
import ModeLocation from "./ModeLocation";

@JsonObject
class CarParkLocation extends ModeLocation {

    @JsonProperty("carPark", CarParkInfo)
    public carPark: CarParkInfo = new CarParkInfo();

}

export default CarParkLocation;