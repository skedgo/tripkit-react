declare class LatLng {
    protected _lat: number | undefined;
    protected _lng: number | undefined;
    static createLatLng(lat: number, lng: number): LatLng;
    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor();
    lat: number;
    lng: number;
    getKey(): string;
    /**
     * true just for Location instances that represent unresolved locations.
     */
    isNull(): boolean;
}
export default LatLng;
