import {JsonObject, JsonProperty} from "json2typescript";
import StopLocation from "../StopLocation";

@JsonObject
class StopLocationParent extends StopLocation {

    @JsonProperty("children")
    public children: StopLocation[] = [];

    public getStopFromCode(code: string): StopLocation | undefined {
        if (this.code === code) {
            return this;
        }
        for (const child of this.children) {
            if (child.code === code) {
                return child;
            }
        }
        return undefined;
    }

}

export default StopLocationParent;