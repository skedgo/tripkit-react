import {JsonObject, JsonProperty} from "json2typescript";
import BikePodInfo from "./BikePodInfo";
import ModeLocation from "./ModeLocation";

@JsonObject
class BikePodLocation extends ModeLocation {

    @JsonProperty("bikePod", BikePodInfo)
    public bikePod: BikePodInfo = new BikePodInfo();

}

export default BikePodLocation;