import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
class VehicleLocation {

    @JsonProperty("lat")
    public lat: number;
    @JsonProperty("lng")
    public lng: number;
    @JsonProperty("bearing", Number, true)
    public bearing: number | undefined;

}

export default VehicleLocation;