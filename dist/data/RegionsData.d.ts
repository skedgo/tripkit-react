import LatLng from "../model/LatLng";
import Region from "../model/region/Region";
import ModeIdentifier from "../model/region/ModeIdentifier";
declare class RegionsData {
    private regionsRequest;
    private regions;
    private regionList;
    private regionsPromise;
    private _modes;
    private cachedRegion;
    constructor();
    private static _instance;
    static readonly instance: RegionsData;
    hasRegions(): boolean;
    getRegion(latLng: LatLng): Region | undefined;
    getCloserRegion(latLng: LatLng): Region | undefined;
    requireRegions(): Promise<void>;
    /**
     * latLng.isNull() should be false
     */
    getCloserRegionP(latLng: LatLng): Promise<Region>;
    /**
     * latLng.isNull() should be false
     */
    getRegionP(latLng: LatLng): Promise<Region | undefined>;
    /**
     * If approximate === true result will not be undefined.
     */
    private findRegionByLatLng;
    getRegionByName(name: string): Region | undefined;
    getRegionByNameP(name: string): Promise<Region | undefined>;
    getModeIdentifierP(id: string): Promise<ModeIdentifier | undefined>;
    getModeIdentifier(id: string): ModeIdentifier | undefined;
}
export default RegionsData;
