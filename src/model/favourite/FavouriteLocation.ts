import {JsonObject, JsonProperty} from "json2typescript";
import Favourite from "./Favourite";
import Location from "../Location";
import {LocationConverter} from "../location/LocationConverter";
import FavouriteStop from "./FavouriteStop";

@JsonObject
class FavouriteLocation extends Favourite {

    @JsonProperty('location', LocationConverter)
    public location: Location = new Location();

    public static create(location: Location): FavouriteLocation {
        const instance = new FavouriteLocation();
        instance.location = location;
        return instance;
    }

    equals(other: any): boolean {
        if (other === undefined || other === null || !(other instanceof FavouriteLocation)) {
            return false;
        }
        return this.location.equals(other.location);
    }

}

export default FavouriteLocation;