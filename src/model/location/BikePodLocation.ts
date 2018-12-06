import {JsonObject, JsonProperty} from "json2typescript";
import ModeInfo from "../trip/ModeInfo";
import BikePodInfo from "./BikePodInfo";
import Location from "../Location";

@JsonObject
class BikePodLocation extends Location {

    @JsonProperty("bikePod", BikePodInfo)
    private _bikePod: BikePodInfo = new BikePodInfo();

    @JsonProperty("modeInfo", ModeInfo)
    private _modeInfo: ModeInfo = new ModeInfo();

    get bikePod(): BikePodInfo {
        return this._bikePod;
    }

    get modeInfo(): ModeInfo {
        return this._modeInfo;
    }
}

export default BikePodLocation;