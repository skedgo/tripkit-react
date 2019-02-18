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
    readonly name: string;
    readonly polygon: string;
    readonly timezone: string;
    readonly modes: string[];
    readonly cities: City[];
    readonly bounds: BBox;
    contains(latLng: LatLng): boolean;
}
export default Region;
