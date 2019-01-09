import NetworkUtil from "../util/NetworkUtil";
import LatLng from "../model/LatLng";
import Region from "../model/region/Region";
import {JsonConvert} from "json2typescript";
import RegionResults from "../model/region/RegionResults";
import TripGoApi from "../api/TripGoApi";
import ModeIdentifier from "../model/region/ModeIdentifier";

class RegionsData {

    private regionsRequest: Promise<RegionResults>;
    private regions: Map<string, Region>;
    private regionsPromise: Promise<Map<string, Region>>;
    private _modes: Map<string, ModeIdentifier> = new Map<string, ModeIdentifier>();
    public static HARDCODED_REGION = "AU_NSW_Sydney";   // TODO: Remove hardcoded region.

    constructor() {
        const jsonConvert = new JsonConvert();
        this.regionsRequest = TripGoApi.apiCall("regions.json", NetworkUtil.MethodType.POST, { v: 2 })
            .then((regionResultsJson: any) => {
                return jsonConvert.deserialize(regionResultsJson, RegionResults) as RegionResults;
            });
        this.regionsPromise = this.regionsRequest.then((regionResults: RegionResults) => {
            this.regions = new Map<string, Region>();
            for (const region of regionResults.regions) {
                this.regions.set(region.name, region);
            }
            for (const modeKey of Object.keys(regionResults.modes)) {
                const modeIdentifier = jsonConvert.deserialize(regionResults.modes[modeKey], ModeIdentifier) as ModeIdentifier;
                modeIdentifier.identifier = modeKey;
                this._modes.set(modeKey, modeIdentifier);
            }
            return this.regions;
        });
    }

    private static _instance: RegionsData;

    public static get instance(): RegionsData {
        if (!this._instance) {
            this._instance = new RegionsData();
        }
        return this._instance;
    }

    public getRegion(latLng: LatLng): Region | null {
        if (!this.regions) {
            return null;
        }
        const region = this.regions.get(RegionsData.HARDCODED_REGION);
        return region ? region : Region.regionStub;
    }

    public getRegionP(latLng: LatLng): Promise<Region> {
        return this.regionsPromise.then((regionsMap: Map<string, Region>) => {
            const region = this.regions.get(RegionsData.HARDCODED_REGION);
            return region ? region : Region.regionStub;
        });
    }

    public getRegionByName(name: string): Region {
        const region = this.regions.get(name);
        return region ? region : Region.regionStub
    }

    public getRegionByNameP(name: string): Promise<Region> {
        return this.regionsPromise.then((regionsMap: Map<string, Region>) => {
            const region = regionsMap.get(name);
            return region ? region : Region.regionStub;
        });
    }

    public getModeIdentifierP(id: string): Promise<ModeIdentifier | undefined> {
        return this.regionsPromise.then(() => {
            const modeIdentifier = this.getModeIdentifier(id);
            return modeIdentifier;
        });
    }

    public getModeIdentifier(id: string): ModeIdentifier | undefined {
        return this._modes.get(id);
    }

}

export default RegionsData;