import Favourite from "./Favourite";
import Location from "../Location";
declare class FavouriteLocation extends Favourite {
    location: Location;
    static create(location: Location): FavouriteLocation;
    equals(other: any): boolean;
}
export default FavouriteLocation;
