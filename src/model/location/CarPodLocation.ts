import {JsonObject, JsonProperty} from "json2typescript";
import ModeLocation from "./ModeLocation";
import CarPodInfo from "./CarPodInfo";

@JsonObject
class CarPodLocation extends ModeLocation {
    @JsonProperty("carPod", CarPodInfo)
    public carPod: CarPodInfo = new CarPodInfo();
}

export default CarPodLocation;