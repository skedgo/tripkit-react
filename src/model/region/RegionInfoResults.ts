import {JsonObject, JsonProperty} from "json2typescript";
import RegionInfo from "./RegionInfo";

@JsonObject
class RegionInfoResults {

    @JsonProperty("regions", [RegionInfo])
    public regions: RegionInfo[] = [];

}

export default RegionInfoResults;