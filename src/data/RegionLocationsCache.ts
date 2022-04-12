import LocationsResult from "../model/location/LocationsResult";
import { JsonConvert } from "json2typescript";
import DateTimeUtil from "../util/DateTimeUtil";

const lSPrefix = "LocationsCache_";
class RegionLocationsCache {

    private inMemory: Map<string, LocationsResult> = new Map<string, LocationsResult>();
    private storageKey: string;

    private readonly timeToLive = 7 * 24 * 60 * 60; // 7 days

    constructor(regionCode: string) {
        this.storageKey = lSPrefix + regionCode;
        this.loadCacheLS();
    }

    public purgeLS() {
        Array.from(this.inMemory.keys()).forEach(key => {
            if (Math.floor(DateTimeUtil.getNow().valueOf() / 1000) - this.inMemory.get(key)!.requestTime > this.timeToLive) {
                this.inMemory.delete(key);
            }
        });
        if (this.inMemory.size === 0) {
            localStorage.removeItem(this.storageKey);
        } else {
            this.saveCacheLS();
        }
    }

    public get(cellId: string): LocationsResult | undefined {
        return this.inMemory.get(cellId);
    }

    public set(cellId: string, value: LocationsResult) {
        this.inMemory.set(cellId, value);
        this.saveCacheLS();
    }

    private loadCacheLS() {
        const cacheString = localStorage.getItem(this.storageKey);
        if (cacheString) {
            try {
                const cacheObject = JSON.parse(cacheString);
                const jsonConvert: JsonConvert = new JsonConvert();
                this.inMemory = Object.keys(cacheObject)
                    .reduce((acc: Map<string, LocationsResult>, key: string) => acc.set(key, jsonConvert.deserialize(cacheObject[key], LocationsResult)), new Map<string, LocationsResult>());
            } catch (e) { }
        }
    }

    private saveCacheLS() {
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

    constructor() {
        LocationsCache.purgeLS();
    }

    private static purgeLS() {
        for (const key in localStorage) {
            if (key.startsWith(lSPrefix)) {
                const regionCache = new RegionLocationsCache(key.substring(lSPrefix.length));
                regionCache.purgeLS();
            }
        }
    }

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