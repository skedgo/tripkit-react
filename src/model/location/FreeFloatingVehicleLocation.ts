import {JsonObject, JsonProperty} from "json2typescript";
import ModeLocation from "./ModeLocation";
import FreeFloationVehicleInfo from "./VehicleInfo";

@JsonObject
class FreeFloatingVehicleLocation extends ModeLocation {

    @JsonProperty("vehicle", FreeFloationVehicleInfo)
    public vehicle: FreeFloationVehicleInfo = new FreeFloationVehicleInfo();

}

export default FreeFloatingVehicleLocation;