import BBox from "../BBox";
import LatLng from "../LatLng";
import City from "../location/City";
declare class Region {
    private _name;
    private _polygon;
    private _timezone;
    private _modes;
    private _cities;
    private _bounds;
    get name(): string;
    get polygon(): string;
    get timezone(): string;
    get modes(): string[];
    get cities(): City[];
    get bounds(): BBox;
    contains(latLng: LatLng): boolean;
}
export default Region;
