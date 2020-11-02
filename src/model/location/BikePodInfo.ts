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

    @JsonProperty("lastUpdate", Number, true)
    public lastUpdate?: number = undefined;

    @JsonProperty("source", DataSourceAttribution, true)
    public source: DataSourceAttribution = new DataSourceAttribution();

    @JsonProperty("deepLink", String, true)
    public deepLink?: string = undefined;

    get availableSpaces(): number | undefined {
        return this.availableBikes !== undefined && this.totalSpaces !== undefined ?
            Math.max(this.totalSpaces - this.availableBikes, 0) : undefined;
    }
}

export default BikePodInfo;