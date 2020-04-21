declare class LatLng {
    protected _lat: number | undefined;
    protected _lng: number | undefined;
    static createLatLng(lat: number, lng: number): LatLng;
    get lat(): number;
    set lat(value: number);
    get lng(): number;
    set lng(value: number);
    getKey(): string;
    /**
     * true just for Location instances that represent unresolved locations.
     */
    isNull(): boolean;
}
export default LatLng;
