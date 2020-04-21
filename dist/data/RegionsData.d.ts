import LatLng from "../model/LatLng";
import Region from "../model/region/Region";
import ModeIdentifier from "../model/region/ModeIdentifier";
import City from "../model/location/City";
import RegionInfo from "../model/region/RegionInfo";
import Segment from "../model/trip/Segment";
export declare class RegionsData {
    private regionsRequest;
    private regions?;
    private _regionList?;
    private regionsPromise;
    private _modes;
    private cachedRegion?;
    private regionInfosRequests;
    private regionInfos;
    constructor();
    private static _instance;
    static get instance(): RegionsData;
    static isInitialized(): boolean;
    hasRegions(): boolean;
    getCities(): City[] | undefined;
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
    getRegionList(): Region[] | undefined;
    getRegionInfoP(code: string): Promise<RegionInfo>;
    getRegionInfo(code: string): RegionInfo | undefined;
    /**
     * TODO: implement logic
     */
    getSegmentRegions(segment: Segment): [Region, Region];
}
export default RegionsData;
