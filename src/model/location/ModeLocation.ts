import { JsonObject, JsonProperty } from "json2typescript";
import Location from "../Location";
import ModeInfo from "../trip/ModeInfo";
import TKDefaultGeocoderNames from "../../geocode/TKDefaultGeocoderNames";
import Util from "../../util/Util";

@JsonObject
class ModeLocation extends Location {

    @JsonProperty("modeInfo", ModeInfo, true)
    public modeInfo: ModeInfo = Util.iAssign(new ModeInfo(), { localIcon: "parking" });
    @JsonProperty('source', String, true)
    public source: string | undefined = TKDefaultGeocoderNames.skedgo;

    public getKey(): string {
        return this.id;
    }

}

export default ModeLocation;