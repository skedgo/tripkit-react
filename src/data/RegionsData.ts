import NetworkUtil from "../util/NetworkUtil";
import LatLng from "../model/LatLng";
import Region from "../model/region/Region";
import RegionResults from "../model/region/RegionResults";
import TripGoApi from "../api/TripGoApi";
import ModeIdentifier from "../model/region/ModeIdentifier";
import LocationUtil from "../util/LocationUtil";
import City from "../model/location/City";
import RegionInfo from "../model/region/RegionInfo";
import RegionInfoResults from "../model/region/RegionInfoResults";
import Segment from "../model/trip/Segment";
import Util from "../util/Util";
import union from "@turf/union"
import intersect from "@turf/intersect";
import {polygon} from "@turf/helpers";
import LeafletUtil from "../util/LeafletUtil";
import BBox from "../model/BBox";

export class RegionsData {

    private regionsRequest: Promise<RegionResults>;
    private regions?: Map<string, Region>;
    private _regionList?: Region[];
    private regionsPromise: Promise<Map<string, Region>>;
    private _modes: Map<string, ModeIdentifier> = new Map<string, ModeIdentifier>();
    private cachedRegion?: Region;
    private regionInfosRequests: Map<string, Promise<RegionInfo>> = new Map<string, Promise<RegionInfo>>();
    private regionInfos: Map<string, RegionInfo> = new Map<string, RegionInfo>();
    private coverageGeoJson: any;
    private coverageBounds?: BBox | null;

    // Set this to hardcode regions json
    public static regionsJsonPromise: Promise<any> | undefined = undefined;
    public static regionsJsonFallback: any = undefined;

    constructor() {
        this.regionsRequest = (RegionsData.regionsJsonPromise !== undefined ? RegionsData.regionsJsonPromise :
            TripGoApi.apiCall("regions.json", NetworkUtil.MethodType.POST, { v: 2 }))
            .then((regionResultsJson: any) => {
                return Util.deserialize(regionResultsJson, RegionResults);
            }).catch((error) => {
                console.log("Error getting regions data.");
                if (RegionsData.regionsJsonFallback) {
                    console.log("Using fallback.");
                    return Promise.resolve(Util.deserialize(RegionsData.regionsJsonFallback, RegionResults))
                } else {
                    throw error;
                }
            });
        this.regionsPromise = this.regionsRequest.then((regionResults: RegionResults) => {
            this.regions = new Map<string, Region>();
            for (const region of regionResults.regions) {
                this.regions.set(region.name, region);
            }
            this._regionList = Array.from(this.regions.values());
            const modes: {[index: string]:any} = regionResults.modes;
            for (const modeKey of Object.keys(modes)) {
                const modeIdentifier = Util.deserialize(modes[modeKey], ModeIdentifier) as ModeIdentifier;
                modeIdentifier.identifier = modeKey;
                this._modes.set(modeKey, modeIdentifier);
            }
            return this.regions;
        });
    }

    private static _instance?: RegionsData;

    public static get instance(): RegionsData {
        if (!this._instance) {
            this._instance = new RegionsData();
        }
        return this._instance;
    }

    public static reset() {
        this._instance = undefined;
    }

    public static isInitialized(): boolean {
        return !!this._instance;
    }

    public hasRegions(): boolean {
        return this.regions !== undefined;
    }

    public getCities(): City[] | undefined {
        if (!this._regionList) {
            return undefined
        }
        return this._regionList.reduce((accum: City[], region: Region) => {
            return accum.concat(region.cities);
        }, [])
    }

    public getRegion(latLng: LatLng): Region | undefined {
        if (!this.regions) {
            return undefined;
        }
        const region = this.findRegionByLatLng(latLng, false);
        return region;
    }

    public getCloserRegion(latLng: LatLng): Region | undefined {
        if (!this.regions) {
            return undefined;
        }
        const region = this.findRegionByLatLng(latLng, true);
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
        for (const region of this._regionList!) {
            if (!closerRegion || LocationUtil.distanceInMetres(latLng, region.bounds.getCenter())
                < LocationUtil.distanceInMetres(latLng, closerRegion.bounds.getCenter())) {
                closerRegion = region;
            }
            if (region.contains(latLng)) {
                this.cachedRegion = region;
                return region;
            }
        }
        return approximate ? closerRegion : undefined;
    }

    public getRegionByName(name: string): Region | undefined {
        return this.regions!.get(name);
    }

    public getRegionByNameP(name: string): Promise<Region | undefined> {
        return this.regionsPromise.then((regionsMap: Map<string, Region>) => {
            return regionsMap.get(name);
        });
    }

    public getModeIdentifierP(id: string): Promise<ModeIdentifier | undefined> {
        return this.regionsPromise.then(() => {
            return this.getModeIdentifier(id);
        });
    }

    public getModeIdentifier(id: string): ModeIdentifier | undefined {
        return this._modes.get(id);
    }


    public getRegionList(): Region[] | undefined {
        return this._regionList;
    }

    public getRegionInfoP(code: string): Promise<RegionInfo> {
        if (!this.regionInfosRequests.get(code)) {
            const regionInfoRequest =
                TripGoApi.apiCallT("regionInfo.json",
                    NetworkUtil.MethodType.POST,
                    RegionInfoResults,
                    { region: code })
                    .then((regionInfoResult: RegionInfoResults) => {
                        const regionInfo = regionInfoResult.regions[0];
                        this.regionInfos.set(code, regionInfo);
                        return regionInfo;
                    });
            this.regionInfosRequests.set(code, regionInfoRequest);
        }
        return this.regionInfosRequests.get(code)!;
    }

    public getRegionInfo(code: string): RegionInfo | undefined {
        return this.regionInfos.get(code);
    }

    /**
     * TODO: implement logic
     */
    public getSegmentRegions(segment: Segment): [Region, Region] {
        return [this.getRegion(segment.from)!, this.getRegion(segment.to)!];
    }

    public getCoverageGeoJson() {
        if (!this.coverageGeoJson) {
            const world = [
                [-180.0, -90.0],
                [180.0, -90.0],
                [180.0, 90.0],
                [-180.0, 90.0],
                [-180.0, -90.0]
            ];
            const regions = this.getRegionList();
            if (!regions) {
                return undefined;
            }
            const polygons = regions.map(region => {
                const decoded = LeafletUtil.decodePolylineGeoJson(region.polygon);
                if (JSON.stringify(decoded[0]) !== JSON.stringify(decoded[decoded.length - 1])) {
                    decoded.push(decoded[0]);
                }
                return polygon([decoded]);
            });

            let result = polygons.slice();
            for (let i = 0; i < polygons.length; i++) {
                for (let j = i + 1; j < polygons.length; j++) {
                    if (intersect(polygons[i], polygons[j])) {
                        const unionPolygon = union(polygons[i], polygons[j]) as any;
                        // Don't replace polygons[j] by the union since we need to preserve the elements in common with
                        // result for this to work.
                        polygons[j].geometry.coordinates = unionPolygon.geometry.coordinates;
                        result = result.filter(polygon => polygon !== polygons[i]);
                        break;
                    }
                }
            }

            this.coverageGeoJson = {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        world,
                        ...result.map(polygon => polygon.geometry.coordinates[0])
                    ]
                ]
            }
        }
        return this.coverageGeoJson;
    }

    /**
     * Get the smaller bounds that contains the coverage.
     */
    public getCoverageBounds(): BBox | undefined {
        if (this.coverageBounds === null) {
            return undefined;
        }
        if (this.coverageBounds === undefined) {
            const coverageGeoJson = this.getCoverageGeoJson();
            const coveragePolygons = coverageGeoJson?.coordinates[0].slice(1);
            const pointsToCover = coveragePolygons?.reduce((polygon, pointsToCover) => pointsToCover.concat(polygon), []);
            this.coverageBounds = pointsToCover ?
                LeafletUtil.toBBox(LeafletUtil.boundsFromLatLngArray(pointsToCover
                    .map(coord => LatLng.createLatLng(coord[1], coord[0])))) :
                null;
        }
        return this.coverageBounds || undefined;
    }
}

export default RegionsData;