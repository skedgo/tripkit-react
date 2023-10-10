import { JsonObject, JsonProperty } from "json2typescript";
import ModeLocation from "./ModeLocation";
import CarPodInfo from "./CarPodInfo";

@JsonObject
class CarPodLocation extends ModeLocation {
    @JsonProperty("carPod", CarPodInfo)
    public carPod: CarPodInfo = new CarPodInfo();

    get supportsVehicleAvailability(): boolean {
        return !!this.carPod.availabilityMode
        // && this.carPod.availabilityMode !== "NONE"   // Comment for now, since it comes as "NONE"
    }
}

export default CarPodLocation;