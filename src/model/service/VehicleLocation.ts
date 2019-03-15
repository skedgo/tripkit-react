import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
class VehicleLocation {

    @JsonProperty("lat")
    public lat: number = 0;
    @JsonProperty("lng")
    public lng: number = 0;
    @JsonProperty("bearing", Number, true)
    public bearing: number | undefined = undefined;

}

export default VehicleLocation;