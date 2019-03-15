import {JsonObject, JsonProperty} from "json2typescript";
import VehicleLocation from "./VehicleLocation";
import VehicleComponent from "./VehicleComponent";

@JsonObject
class RealTimeVehicle {

    @JsonProperty("id")
    public id: string = "";
    @JsonProperty("lastUpdate")
    public lastUpdate: number = 0;
    @JsonProperty("location", VehicleLocation)
    public location: VehicleLocation = new VehicleLocation();
    @JsonProperty("components", [[VehicleComponent]], true)
    public components: VehicleComponent[][] | undefined = undefined;
}

export default RealTimeVehicle;