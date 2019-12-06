import {JsonObject, JsonProperty} from "json2typescript";
import StopLocation from "../StopLocation";
import Favourite from "./Favourite";

@JsonObject
class FavouriteStop extends Favourite {

    @JsonProperty('stop', StopLocation)
    public stop: StopLocation = new StopLocation();

    public static create(stop: StopLocation): FavouriteStop {
        const instance = new FavouriteStop();
        instance.stop = stop;
        return instance;
    }

}

export default FavouriteStop;