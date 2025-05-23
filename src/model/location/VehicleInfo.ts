import { JsonObject, JsonProperty } from "json2typescript";
import CompanyInfo from "./CompanyInfo";
import VehicleTypeInfo from "./VehicleTypeInfo";

@JsonObject
class VehicleInfo {
    @JsonProperty("identifier", String, true)
    public identifier?: string = undefined;

    @JsonProperty("batteryLevel", Number, true)
    public batteryLevel?: number = undefined;

    @JsonProperty("lastUpdate", Number, true)
    public lastUpdate?: number = undefined;

    @JsonProperty("operator", CompanyInfo, true) // Required according to spec.
    public operator: CompanyInfo = new CompanyInfo();

    @JsonProperty("vehicleTypeInfo", VehicleTypeInfo, true) // Required according to spec.
    public vehicleTypeInfo: VehicleTypeInfo = new VehicleTypeInfo();

    @JsonProperty("name", String, true)
    public name?: string = undefined;
}

export default VehicleInfo;