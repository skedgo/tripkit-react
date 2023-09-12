import {JsonObject, JsonProperty, Any} from "json2typescript";
import Color from "../trip/Color";

@JsonObject
export class AppInfo {
    @JsonProperty("name", String, true)
    public name?: string = undefined;

    @JsonProperty("appURLiOS", String, true)
    public appURLiOS?: string = undefined;

    @JsonProperty("appURLAndroid", String, true)
    public appURLAndroid?: string = undefined;

    @JsonProperty("deepLink", String, true)
    public deepLink?: string = undefined;
}

@JsonObject
class CompanyInfo {
    @JsonProperty("name", String)
    public name: string = "";

    @JsonProperty("phone", String, true)
    public phone?: string = undefined;

    @JsonProperty("website", String, true)
    public website?: string = undefined;

    @JsonProperty("remoteIcon", String, true)
    public remoteIcon?: string = undefined;

    @JsonProperty("remoteDarkIcon", String, true)
    public remoteDarkIcon?: string = undefined;

    @JsonProperty("color", Color, true)
    public color?: Color = undefined;

    @JsonProperty("appInfo", AppInfo, true)
    public appInfo?: AppInfo = undefined;
}

export default CompanyInfo;