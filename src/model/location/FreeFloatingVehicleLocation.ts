import {JsonObject, JsonProperty} from "json2typescript";
import ModeLocation from "./ModeLocation";
import VehicleInfo from "./VehicleInfo";

@JsonObject
class FreeFloatingVehicleLocation extends ModeLocation {

    @JsonProperty("vehicle", VehicleInfo, true)
    public vehicle: VehicleInfo = new VehicleInfo();

}

export default FreeFloatingVehicleLocation;