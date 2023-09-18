import { Any, JsonObject, JsonProperty } from "json2typescript";
import ModeLocation from "./ModeLocation";
import CarPodInfo from "./CarPodInfo";

@JsonObject
export class NearbyPod {
    // @JsonProperty("carPod", CarPodInfo, true)
    @JsonProperty("carPod", Any, true)
    // public readonly carPod: CarPodInfo = new CarPodInfo();
    public readonly carPod: any = {};
    @JsonProperty("walkingDistance", Number, true)
    public readonly walkingDistance: number = 0;
}

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