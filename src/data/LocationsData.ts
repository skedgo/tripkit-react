import LocationsResult from "../model/location/LocationsResult";
import TripGoApi from "../api/TripGoApi";
import NetworkUtil from "../util/NetworkUtil";
import {JsonConvert} from "json2typescript";
import {EventEmitter, EventSubscription} from "fbemitter";
import BBox from "../model/BBox";
import MapUtil from "../util/MapUtil";
import Util from "../util/Util";
import TKLocationInfo from "../model/location/TKLocationInfo";
import LatLng from "../model/LatLng";
import {default as LocationsCache} from "./RegionLocationsCache";

class LocationsData {

    public static cellsPerDegree = 75;
    private cache: LocationsCache = new LocationsCache();

    private static _instance: LocationsData;

    public static get instance(): LocationsData {
        if (!this._instance) {
            this._instance = new LocationsData();
        }
        return this._instance;
    }

    private eventEmitter: EventEmitter = new EventEmitter();

    public addChangeListener(callback: (locData: LocationsResult) => void): EventSubscription {
        return this.eventEmitter.addListener('change', callback);
    }

    private fireChangeEvent(locData: LocationsResult) {
        this.eventEmitter.emit('change', locData);
    }

    /*
     * Return locations for cells found in cache, and requests locations for the other cells + cells found but that do
     * not cover requested modes + cells found that are not fresh (the latter are requested specifying the hashcodes).
     */
    public getRequestLocations(region: string, level: 1 | 2, modes: string[], bounds?: BBox): LocationsResult {
        const cachedResults = new LocationsResult(level, modes);
        const cellIDs = level === 1 ? [region] : MapUtil.cellsForBounds(bounds!, LocationsData.cellsPerDegree);
        const requestCells: any[] = [];
        const refreshCells: {[key: string]: number} = {};
        for (const cellID of cellIDs) {
            const cellResults = this.cache.get(region, cellID);
            if (cellResults) {
                cachedResults.add(cellResults);
            }
            if (!cellResults ||
                (!modes.every((mode: string) => cellResults.modes.includes(mode)) || !cellResults.fresh) && !cellResults.requesting){
                if (!cellResults || !modes.every((mode: string) => cellResults.modes.includes(mode))) {
                    requestCells.push(cellID);
                } else { // !cellResults.fresh
                    refreshCells[cellID] = cellResults.hashCode;
                }
                // To register we are awaiting for cellIDs, avoiding requesting again the same cellID in the meanwhile.
                const waitingCellResults = cellResults || new LocationsResult(level);
                waitingCellResults.requesting = true;
                this.cache.set(region, cellID, waitingCellResults);
            }
        }
        if (requestCells.length !== 0 || !Util.isEmpty(refreshCells)) {
            const locationsReq = {
                region: region,
                level: level,
                cellIDs: level === 2 && requestCells.length !== 0 ? requestCells : undefined,
                cellIDHashCodes: !Util.isEmpty(refreshCells) ? refreshCells : undefined,
                cellsPerDegree: level === 2 ? 75 : undefined,
                modes: modes
            };

            TripGoApi.apiCall("locations.json", NetworkUtil.MethodType.POST, locationsReq)
                .then((groupsJson: any) => {
                    const groups: LocationsResult[] = groupsJson.groups.map((group: any) => Util.deserialize(group, LocationsResult));
                    const result = new LocationsResult(level, modes);
                    for (const group of groups) {
                        group.modes = modes;
                        group.fresh = true;
                        this.cache.set(region, group.key, group);
                        result.add(group);
                    }
                    for (const refreshed of Object.keys(refreshCells)) {
                        // Mark as refreshed all results in caché for which we requested a refresh (if they changend,
                        // and so came in the response, then they would be already marked as fresh by previous iteration,
                        // but this is necessary to mark as fresh the results that didn't change, and so didn't come in
                        // the response.
                        this.cache.get(region, refreshed)!.fresh = true;
                    }
                    // Refresh just if results came.
                    if (groups.length > 0) {
                        this.fireChangeEvent(result);
                    }
                })
                .catch((e) => console.log(e));
        }
        return cachedResults;
    }

    private locationInfoCache: Map<string, Promise<TKLocationInfo>> = new Map<string, Promise<TKLocationInfo>>();

    /**
     *
     * @param {LatLng | string} id
     * @param {string} region   required when the id is a string.
     * @returns {Promise<TKLocationInfo>}
     */
    public getLocationInfo(id: LatLng | string, region?: string): Promise<TKLocationInfo> {
        const cacheKey = id instanceof LatLng ? id.getKey() : id;
        const cachedResult = this.locationInfoCache.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        } else {
            const endpoint = "locationInfo.json?" +
                (id instanceof LatLng ? "lat=" + id.lat + "&lng=" + id.lng : "identifier=" + id) +
                (region ? '&region=' + region : "");
            const result = TripGoApi.apiCallT(endpoint, NetworkUtil.MethodType.GET, TKLocationInfo);
            this.locationInfoCache.set(cacheKey, result);
            return result;
        }
    }
}

export default LocationsData;