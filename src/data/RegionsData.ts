import NetworkUtil from "../util/NetworkUtil";
import LatLng from "../model/LatLng";
import Region from "../model/region/Region";
import {JsonConvert} from "json2typescript";
import RegionResults from "../model/region/RegionResults";
import TripGoApi from "../api/TripGoApi";
import ModeIdentifier from "../model/region/ModeIdentifier";
import LocationUtil from "../util/LocationUtil";

class RegionsData {

    private regionsRequest: Promise<RegionResults>;
    private regions: Map<string, Region>;
    private regionList: Region[];
    private regionsPromise: Promise<Map<string, Region>>;
    private _modes: Map<string, ModeIdentifier> = new Map<string, ModeIdentifier>();
    private cachedRegion: Region;

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
            this.regionList = Array.from(this.regions.values());
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

    public getRegion(latLng: LatLng): Region | undefined {
        if (!this.regions) {
            return undefined;
        }
        const region = this.findRegionByLatLng(latLng, false);
        return region;
    }

    public requireRegions(): Promise<void> {
        return this.regionsPromise.then(() => {
            return Promise.resolve();
        })
    }

    /**
     * latLng.isNull() should be false
     */
    public getCloserRegionP(latLng: LatLng): Promise<Region> {
        return this.regionsPromise.then((regionsMap: Map<string, Region>) => {
            return this.findRegionByLatLng(latLng, true)!;
        });
    }

    /**
     * latLng.isNull() should be false
     */
    public getRegionP(latLng: LatLng): Promise<Region | undefined> {
        return this.regionsPromise.then((regionsMap: Map<string, Region>) => {
            const region = this.findRegionByLatLng(latLng, false);
            return region ? region : undefined;
        });
    }

    /**
     * If approximate === true result will not be undefined.
     */
    private findRegionByLatLng(latLng: LatLng, approximate?: boolean): Region | undefined {
        if (this.cachedRegion && this.cachedRegion.contains(latLng)) {
            return this.cachedRegion;
        }
        let closerRegion;
        for (const region of this.regionList) {
            if (!closerRegion || LocationUtil.distanceInMetres(latLng, region.bounds.getCenter())
                < LocationUtil.distanceInMetres(latLng, closerRegion.bounds.getCenter())) {
                closerRegion = region;
            }
            // console.log(JSON.stringify(latLng) + " to " + region.name + " " + JSON.stringify(region.bounds.getCenter()) + " " + ": " + LocationUtil.distanceInMetres(latLng, region.bounds.getCenter()));
            // console.log(JSON.stringify(latLng) + " to " + closerRegion.name + " " + JSON.stringify(closerRegion.bounds.getCenter()) + " " + ": " + LocationUtil.distanceInMetres(latLng, closerRegion.bounds.getCenter()));
            if (region.contains(latLng)) {
                this.cachedRegion = region;
                return region;
            }
        }
        return approximate ? closerRegion : undefined;
    }

    public getRegionByName(name: string): Region | undefined {
        return this.regions.get(name);
    }

    public getRegionByNameP(name: string): Promise<Region | undefined> {
        return this.regionsPromise.then((regionsMap: Map<string, Region>) => {
            return regionsMap.get(name);
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