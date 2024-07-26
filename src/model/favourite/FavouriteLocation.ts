import { JsonObject, JsonProperty } from "json2typescript";
import Favourite from "./Favourite";
import Location from "../Location";
import { LocationConverter } from "../location/LocationConverter";
import { i18n } from "../../i18n/TKI18nConstants";
import LocationUtil from "../../util/LocationUtil";

@JsonObject
class FavouriteLocation extends Favourite {

    public static getDefaultName(location: Location): string {
        return LocationUtil.getMainText(location, i18n.t);
    }

    @JsonProperty('location', LocationConverter)
    public location: Location = new Location();

    public static create(location: Location, type: "location" | "home" | "work" = "location"): FavouriteLocation {
        const instance = new FavouriteLocation();
        instance.location = location;
        instance.name = LocationUtil.getMainText(location, i18n.t);
        instance.type = type;
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