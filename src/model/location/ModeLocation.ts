import {JsonObject, JsonProperty} from "json2typescript";
import Location from "../Location";
import ModeInfo from "../trip/ModeInfo";
import TKDefaultGeocoderNames from "../../geocode/TKDefaultGeocoderNames";

@JsonObject
class ModeLocation extends Location {

    @JsonProperty("modeInfo", ModeInfo)
    public modeInfo: ModeInfo = new ModeInfo();
    @JsonProperty('source', String, true)
    public source: string | undefined = TKDefaultGeocoderNames.skedgo;

    public getKey(): string {
        return this.id;
    }

}

export default ModeLocation;