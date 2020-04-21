import LatLng from "../LatLng";
declare class Street {
    private _encodedWaypoints;
    /**
     * Missing when unknown.
     */
    private _safe;
    dismount: boolean;
    private _name;
    private _cyclingNetwork;
    private _metres;
    private _waypoints;
    get encodedWaypoints(): string;
    get safe(): boolean | null;
    get name(): string | null;
    get cyclingNetwork(): string | null;
    get metres(): number | null;
    get waypoints(): LatLng[] | null;
}
export default Street;
