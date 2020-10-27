import {JsonObject, JsonProperty} from "json2typescript";
import DataSourceAttribution from "./DataSourceAttribution";
import CompanyInfo from "./CompanyInfo";

@JsonObject
class BikePodInfo {

    @JsonProperty("identifier", String)
    public identifier: string = "";

    @JsonProperty("operator", CompanyInfo)
    public operator: CompanyInfo = new CompanyInfo();

    @JsonProperty("inService", Boolean, true)
    public inService?: boolean = undefined;

    @JsonProperty("totalSpaces", Number, true)
    public totalSpaces?: number = undefined;

    @JsonProperty("availableBikes", Number, true)
    public availableBikes?: number = undefined;

    @JsonProperty("lastUpdated", Number, true)
    public lastUpdated?: number = undefined;

    @JsonProperty("source", DataSourceAttribution, true)
    public source: DataSourceAttribution = new DataSourceAttribution();

    @JsonProperty("deepLink", String, true)
    public deepLink?: string = undefined;
}

export default BikePodInfo;