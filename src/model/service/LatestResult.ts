import {JsonObject, JsonProperty} from "json2typescript";
import Service from "./Service";

@JsonObject
class LatestResult {
    @JsonProperty("services", [Service])
    public services: Service[] = [];
}

export default LatestResult;