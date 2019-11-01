import ModeIdentifier from "../region/ModeIdentifier";
import {JsonObject, JsonProperty, JsonConverter, JsonCustomConvert} from "json2typescript";

export enum DisplayConf {
    NORMAL, BRIEF, HIDDEN
}

@JsonConverter
class TransportOptionMapConverter implements JsonCustomConvert<Map<ModeIdentifier, DisplayConf>> {
    public serialize(transOptionMap: Map<ModeIdentifier, DisplayConf>): any {
        return Array.from(transOptionMap.entries());
    }
    public deserialize(transOptionMapJson: any): Map<ModeIdentifier, DisplayConf> {
        return new Map<ModeIdentifier, DisplayConf>(transOptionMapJson);
    }
}

@JsonObject
class TKTransportOptions {

    @JsonProperty('transportToOption', TransportOptionMapConverter, true)
    private transportToOption: Map<string, DisplayConf> = new Map<string, DisplayConf>();

    public setTransportOption(mode: string, option: DisplayConf) {
        if (option === DisplayConf.NORMAL) {
            this.transportToOption.delete(mode);
        } else {
            this.transportToOption.set(mode, option);
        }
    }

    public getTransportOption(mode: string): DisplayConf {
        const option = this.transportToOption.get(mode);
        return option || DisplayConf.NORMAL;
    }

    public isModeEnabled(mode: string) {
        return this.getTransportOption(mode) !== DisplayConf.HIDDEN;
    }

}

export default TKTransportOptions;