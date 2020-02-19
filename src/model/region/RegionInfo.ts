import {JsonObject, JsonProperty} from "json2typescript";
import ModeInfo from "../trip/ModeInfo";

@JsonObject
class RegionInfo {

    @JsonProperty("code", String)
    public code: string = "";

    @JsonProperty("streetBicyclePaths", Boolean)
    public streetBicyclePaths: boolean = false;

    @JsonProperty("streetWheelchairAccessibility", Boolean)
    public streetWheelchairAccessibility: boolean = false;

    @JsonProperty("transitBicycleAccessibility", Boolean)
    public transitBicycleAccessibility: boolean = false;

    @JsonProperty("transitConcessionPricing", Boolean)
    public transitConcessionPricing: boolean = false;

    @JsonProperty("transitWheelchairAccessibility", Boolean)
    public transitWheelchairAccessibility: boolean = false;

    @JsonProperty("transitModes", [ModeInfo])
    public transitModes: ModeInfo[] = [];

}

export default RegionInfo;