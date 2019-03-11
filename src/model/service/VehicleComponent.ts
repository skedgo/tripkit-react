import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
class VehicleComponent {

    @JsonProperty("occupancy", String, true)
    public occupancy: string | undefined;
    @JsonProperty("wifi", Boolean, true)
    public wifi: boolean | undefined = undefined;
    @JsonProperty("airConditioned", Boolean, true)
    public airConditioned: boolean | undefined = undefined;
    @JsonProperty("wheelchairAccessible", Boolean, true)
    public wheelchairAccessible: boolean | undefined = undefined;
    @JsonProperty("wheelchairSeats", Number, true)
    public wheelchairSeats: number | undefined;
    @JsonProperty("model", String, true)
    public model: string | undefined;

}

export default VehicleComponent;