import {JsonObject, JsonProperty} from "json2typescript";
import CompanyInfo from "./CompanyInfo";

@JsonObject
class VehicleInfo {
    @JsonProperty("batteryLevel", Number, true)
    public batteryLevel?: number = undefined;

    @JsonProperty("lastUpdate", Number, true)
    public lastUpdate?: number = undefined;

    @JsonProperty("operator", CompanyInfo)
    public operator: CompanyInfo = new CompanyInfo();
}

export default VehicleInfo;