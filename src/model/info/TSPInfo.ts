import { Any, JsonConverter, JsonCustomConvert, JsonObject, JsonProperty } from "json2typescript";
import Util from "../../util/Util";

@JsonObject
export class TSPInfoMode {
    @JsonProperty("mode", String, true)
    public mode: string = "";
    @JsonProperty("numberOfServices", Number, true)
    public numberOfServices: number = 0;
    @JsonProperty("integrations", [String], true)
    private _integrations: string[] | undefined = undefined;

    get integrations(): string[] {
        if (!this._integrations) {
            this._integrations = ["routing"];
        }
        return this._integrations;
    }
}

type TSPInfoModes = {
    [key: string]: TSPInfoMode;
}

@JsonConverter
class TSPInfoModesConverter implements JsonCustomConvert<TSPInfoModes> {
    public serialize(tspInfoModes: TSPInfoModes): any {
        return Object.keys(tspInfoModes).reduce((result, key) => {
            result[key] = Util.serialize(tspInfoModes[key]);
            return result;
        }, {});
    }
    public deserialize(tspInfoModesJson: any): TSPInfoModes {
        return Object.keys(tspInfoModesJson).reduce((result, key) => {
            result[key] = Util.deserialize(tspInfoModesJson[key], TSPInfoMode);
            return result;
        }, {});
    }
}

@JsonObject
class TSPInfo {
    @JsonProperty("id", String, true)
    public id: string = "";
    @JsonProperty("name", String, true)
    public name: string = "";
    @JsonProperty("modes", TSPInfoModesConverter, true)
    public modesById: TSPInfoModes = {};

    private _modesList?: TSPInfoMode[];
    get modes(): TSPInfoMode[] {
        if (!this._modesList) {
            this._modesList = Object.values(this.modesById);
        }
        return this._modesList;
    }
    private _numberOfservices?: number;
    get numberOfServices(): number {
        if (this._numberOfservices === undefined) {
            this._numberOfservices = this.modes.reduce((acc, mode) => acc + mode.numberOfServices, 0);
        }
        return this._numberOfservices;
    }
    get integrations(): string[] {
        return Array.from(Object.values(this.modesById).reduce((acc, mode) => {
            mode.integrations.forEach(int => acc.add(int));
            return acc;
        }, new Set<string>()));
    }
}

export default TSPInfo;