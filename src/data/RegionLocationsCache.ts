import LocationsResult from "../model/location/LocationsResult";
import {JsonConvert} from "json2typescript";

class RegionLocationsCache  {

    private inMemory: Map<string, LocationsResult>;
    private storageKey: string;

    constructor(regionCode: string) {
        this.storageKey = "LocationsCache_" + regionCode;
        this.inMemory = this.loadCacheLS() || new Map<string, LocationsResult>();
    }

    public get(cellId: string): LocationsResult | undefined {
        return this.inMemory.get(cellId);
    }

    public set(cellId: string, value: LocationsResult) {
        this.inMemory.set(cellId, value);
        this.saveCacheLS(this.inMemory);
    }

    private loadCacheLS(): Map<string, LocationsResult> | undefined {
        const cacheString = localStorage.getItem(this.storageKey);
        if (!cacheString) {
            return undefined;
        }
        try {
            const cacheObject = JSON.parse(cacheString);
            const jsonConvert: JsonConvert = new JsonConvert();
            return Object.keys(cacheObject)
                .reduce((acc: Map<string, LocationsResult>, key: string) => acc.set(key, jsonConvert.deserialize(cacheObject[key], LocationsResult)), new Map<string, LocationsResult>());
        } catch (e) {
            return undefined;
        }
    }

    private saveCacheLS(cache: Map<string, LocationsResult>) {
        const jsonConvert: JsonConvert = new JsonConvert();
        const object = Array.from(this.inMemory).reduce((obj, [key, value]) => (
            Object.assign(obj, { [key]: jsonConvert.serialize(value) })
        ), {});
        localStorage.setItem(this.storageKey, JSON.stringify(object));
    }

}

class LocationsCache {
    // region to cell to locResult caché;
    private cache: Map<string, RegionLocationsCache> = new Map<string, RegionLocationsCache>();

    public getRegionCache(region): RegionLocationsCache {
        let regionCache = this.cache.get(region);
        if (!regionCache) {
            regionCache = new RegionLocationsCache(region);
            this.cache.set(region, regionCache);
        }
        return regionCache;
    }

    public get(region: string, cellId: string): LocationsResult | undefined {
        return this.getRegionCache(region).get(cellId);
    }

    public set(region: string, cellId: string, data: LocationsResult) {
        this.getRegionCache(region).set(cellId, data);
    }
}

export default LocationsCache;