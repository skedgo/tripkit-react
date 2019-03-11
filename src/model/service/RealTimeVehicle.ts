import {JsonObject, JsonProperty} from "json2typescript";
import VehicleLocation from "./VehicleLocation";
import VehicleComponent from "./VehicleComponent";

@JsonObject
class RealTimeVehicle {

    @JsonProperty("id")
    public id: string;
    @JsonProperty("lastUpdate")
    public lastUpdate: number;
    @JsonProperty("location", VehicleLocation)
    public location: VehicleLocation;
    @JsonProperty("components", [[VehicleComponent]])
    public components: VehicleComponent[][];
}

export default RealTimeVehicle;