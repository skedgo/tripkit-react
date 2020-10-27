import {JsonObject, JsonProperty, Any} from "json2typescript";
import CompanyInfo from "./CompanyInfo";

@JsonObject
class DataSourceAttribution {
    @JsonProperty("provider", CompanyInfo)
    public provider: CompanyInfo = new CompanyInfo();

    @JsonProperty("disclaimer", String, true)
    public disclaimer?: string = undefined;
}

export default DataSourceAttribution;