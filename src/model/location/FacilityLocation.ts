import { JsonObject, JsonProperty } from "json2typescript";
import Util from "../../util/Util";
import ModeInfo from "../trip/ModeInfo";
import ModeLocation from "./ModeLocation";

@JsonObject
class FacilityLocation extends ModeLocation {

    // To override default value of modeInfo in superclass
    @JsonProperty("modeInfo", ModeInfo, true)
    public modeInfo: ModeInfo = Util.iAssign(new ModeInfo(), { localIcon: "water-fountain" });

    @JsonProperty("facilityType", String)
    public facilityType: 'MyWay-Retail-Agent' | 'Water-Fountain' | string = "";

}

export default FacilityLocation;