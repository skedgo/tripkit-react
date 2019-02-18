import LatLng from "./LatLng";
declare class BBox {
    private _ne;
    private _sw;
    static createBBox(ne: LatLng, sw: LatLng): BBox;
    static createBBoxArray(latLngs: LatLng[]): BBox;
    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor();
    readonly ne: LatLng;
    readonly sw: LatLng;
    readonly minLat: number;
    readonly maxLat: number;
    readonly minLng: number;
    readonly maxLng: number;
    getCenter(): LatLng;
}
export default BBox;
