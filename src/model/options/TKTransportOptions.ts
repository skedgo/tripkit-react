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
    private transportToOption: Map<string, DisplayConf> = new Map<string, DisplayConf>([[ModeIdentifier.WHEELCHAIR_ID, DisplayConf.HIDDEN]]);

    @JsonProperty('avoidTransports', [String], true)
    private avoidTransports: string[] = [];

    public setTransportOption(mode: string, option: DisplayConf) {
        if (option === DisplayConf.NORMAL) {
            this.transportToOption.delete(mode);
        } else {
            this.transportToOption.set(mode, option);
        }
        // Walk and wheelchair modes mutual exclusively enabled
        if (mode === ModeIdentifier.WALK_ID && option === DisplayConf.NORMAL && this.isModeEnabled(ModeIdentifier.WHEELCHAIR_ID)) {
            this.setTransportOption(ModeIdentifier.WHEELCHAIR_ID, DisplayConf.HIDDEN)
        }
        if (mode === ModeIdentifier.WHEELCHAIR_ID && option === DisplayConf.NORMAL && this.isModeEnabled(ModeIdentifier.WALK_ID)) {
            this.setTransportOption(ModeIdentifier.WALK_ID, DisplayConf.HIDDEN)
        }
    }

    public getTransportOption(mode: string): DisplayConf {
        const option = this.transportToOption.get(mode);
        return option || DisplayConf.NORMAL;
    }

    public isModeEnabled(mode: string) {
        return this.getTransportOption(mode) !== DisplayConf.HIDDEN;
    }

    public setPreferredTransport(mode: string, enabled: boolean) {
        if (enabled) {
            if (this.avoidTransports.indexOf(mode) !== -1) { // remove from avoided list, if present
                this.avoidTransports.splice(this.avoidTransports.indexOf(mode), 1);
            }
        } else {
            if (this.avoidTransports.indexOf(mode) === -1) { // add to avoided list, if not present
                this.avoidTransports.push(mode);
            }
        }
    }

    public isPreferredTransport(mode: string): boolean {
        return this.avoidTransports.indexOf(mode) === -1;
    }

}

export default TKTransportOptions;