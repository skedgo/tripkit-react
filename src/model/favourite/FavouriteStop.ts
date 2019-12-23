import {JsonObject, JsonProperty} from "json2typescript";
import StopLocation from "../StopLocation";
import Favourite from "./Favourite";
import FavouriteTrip from "./FavouriteTrip";

@JsonObject
class FavouriteStop extends Favourite {

    @JsonProperty('stop', StopLocation)
    public stop: StopLocation = new StopLocation();

    public static create(stop: StopLocation): FavouriteStop {
        const instance = new FavouriteStop();
        instance.stop = stop;
        return instance;
    }

    equals(other: any): boolean {
        if (other === undefined || other === null || !(other instanceof FavouriteStop)) {
            return false;
        }
        return this.stop.equals(other.stop);
    }

}

export default FavouriteStop;