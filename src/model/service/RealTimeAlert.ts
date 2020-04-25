import {JsonObject, JsonProperty, JsonConverter, JsonCustomConvert} from "json2typescript";
import Location from "../Location";
import RealTimeAction from "./RealTimeAction";

export enum AlertSeverity {
    alert, warning, info
}

@JsonConverter
export class AlertSeverityConverter implements JsonCustomConvert<AlertSeverity> {
    public serialize(value: AlertSeverity): any { // Will not be used
        return AlertSeverity[value];
    }
    public deserialize(obj: any): AlertSeverity {
        return obj === "alert" ? AlertSeverity.alert : obj === "warning" ? AlertSeverity.warning : AlertSeverity.info;
    }
}

@JsonObject
class RealTimeAlert {

    @JsonProperty("title")
    public title: string = "";
    @JsonProperty("hashCode")
    public hashCode: number = -1;
    @JsonProperty("severity", AlertSeverityConverter)
    public severity: AlertSeverity = AlertSeverity.info;
    @JsonProperty("text", String, true)
    public text: string | undefined = undefined;
    @JsonProperty("url", String, true)
    public url: string | undefined = undefined;
    @JsonProperty("remoteIcon", String, true)
    public remoteIcon: string | undefined = undefined;
    @JsonProperty("location", Location, true)
    public location: Location | undefined = undefined;
    @JsonProperty("action", RealTimeAction, true)
    public action: RealTimeAction | undefined = undefined;

}

export default RealTimeAlert;