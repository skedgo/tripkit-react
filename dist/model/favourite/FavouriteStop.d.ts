import StopLocation from "../StopLocation";
import Favourite from "./Favourite";
declare class FavouriteStop extends Favourite {
    stop: StopLocation;
    static create(stop: StopLocation): FavouriteStop;
    equals(other: any): boolean;
}
export default FavouriteStop;
