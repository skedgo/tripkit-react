import LatLng from "./LatLng";
declare class BBox {
    private _ne;
    private _sw;
    static createBBox(ne: LatLng, sw: LatLng): BBox;
    static createBBoxArray(latLngs: LatLng[]): BBox;
    get ne(): LatLng;
    get sw(): LatLng;
    get minLat(): number;
    get maxLat(): number;
    get minLng(): number;
    get maxLng(): number;
    getCenter(): LatLng;
}
export default BBox;
