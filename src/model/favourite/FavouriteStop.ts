import { JsonObject, JsonProperty } from "json2typescript";
import StopLocation from "../StopLocation";
import Favourite from "./Favourite";

@JsonObject
class FavouriteStop extends Favourite {
    @JsonProperty('region', String, true)
    public region: string = "";
    @JsonProperty('stopCode', String, true)
    public stopCode: string = "";
    @JsonProperty('stopName', String, true)
    public stopName?: string = undefined;

    // Undefined means not loaded, null means loaded but not found
    public stop?: StopLocation | null = undefined;

    public static create(stop: StopLocation): FavouriteStop {
        const instance = new FavouriteStop();
        instance.stop = stop;
        instance.name = stop.shortName ?? stop.address ?? "";
        instance.region = stop.region ?? "";
        instance.stopCode = stop.code;
        instance.stopName = stop.name;
        instance.type = "stop";
        return instance;
    }

    equals(other: any): boolean {
        if (other === undefined || other === null || !(other instanceof FavouriteStop)) {
            return false;
        }
        return this.stopCode === other.stopCode;
    }

}

export default FavouriteStop;