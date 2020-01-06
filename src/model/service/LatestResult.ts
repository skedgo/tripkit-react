import {JsonObject, JsonProperty} from "json2typescript";
import RTServiceDepartureUpdate from "./RTServiceDepartureUpdate";

@JsonObject
class LatestResult {
    @JsonProperty("services", [RTServiceDepartureUpdate])
    public services: RTServiceDepartureUpdate[] = [];
}

export default LatestResult;