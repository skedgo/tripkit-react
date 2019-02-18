import LatLng from "../LatLng";
declare class Street {
    private _encodedWaypoints;
    /**
     * Missing when unknown.
     */
    private _safe;
    private _name;
    private _cyclingNetwork;
    private _metres;
    private _waypoints;
    readonly encodedWaypoints: string;
    readonly safe: boolean | null;
    readonly name: string | null;
    readonly cyclingNetwork: string | null;
    readonly metres: number | null;
    readonly waypoints: LatLng[] | null;
}
export default Street;
