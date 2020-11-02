import {JsonObject, JsonProperty} from "json2typescript";
import CompanyInfo from "./CompanyInfo";
import {OpeningHours} from "./CarParkInfo";
import DataSourceAttribution from "./DataSourceAttribution";

@JsonObject
class CarRentalInfo {
    @JsonProperty("identifier", String)
    public identifier: string = "";

    @JsonProperty("company", CompanyInfo)
    public company: CompanyInfo = new CompanyInfo();

    @JsonProperty("openingHours", OpeningHours, true)
    public openingHours?: OpeningHours = undefined;

    @JsonProperty("source", DataSourceAttribution, true)
    public source: DataSourceAttribution = new DataSourceAttribution();
}

export default CarRentalInfo;