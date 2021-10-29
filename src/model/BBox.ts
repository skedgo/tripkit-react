import LatLng from "./LatLng";

class BBox {
    private _ne: LatLng = LatLng.createLatLng(0, 0);
    private _sw: LatLng = LatLng.createLatLng(0, 0);

    public static createBBox(ne: LatLng, sw: LatLng): BBox {
        const instance: BBox = new BBox();
        instance._ne = ne;
        instance._sw = sw;
        return instance;
    }

    get ne(): LatLng {
        return this._ne;
    }

    get sw(): LatLng {
        return this._sw;
    }

    get minLat() {
        return Math.min(this.ne.lat, this.sw.lat);
    }

    get maxLat() {
        return Math.max(this.ne.lat, this.sw.lat);
    }

    get minLng() {
        return Math.min(this.ne.lng, this.sw.lng);
    }

    get maxLng() {
        return Math.max(this.ne.lng, this.sw.lng);
    }

    public getCenter(): LatLng {
        return LatLng.createLatLng((this.ne.lat + this.sw.lat)/2, (this.ne.lng + this.sw.lng)/2);
    }

}

export default BBox;