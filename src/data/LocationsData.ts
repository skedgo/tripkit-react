import LocationsResult from "../model/location/LocationsResult";
import TripGoApi from "../api/TripGoApi";
import NetworkUtil from "../util/NetworkUtil";
import { EventEmitter, EventSubscription } from "fbemitter";
import BBox from "../model/BBox";
import MapUtil from "../util/MapUtil";
import Util from "../util/Util";
import TKLocationInfo from "../model/location/TKLocationInfo";
import LatLng from "../model/LatLng";
import { default as LocationsCache } from "./RegionLocationsCache";
import DateTimeUtil from "../util/DateTimeUtil";

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

    /**
     * @deprecated
     * Return locations for cells found in cache, and requests locations for the other cells + cells found but that do
     * not cover requested modes + cells found that are not fresh (the latter are requested specifying the hashcodes).     
     */
    public getRequestLocations(region: string, level: 1 | 2, modes: string[], bounds?: BBox): LocationsResult {
        const { instant, remaining } = this.getRequestLocationsP(region, level, modes, bounds);
        // Refresh just if results came.                        
        remaining.then(result => result !== undefined && this.fireChangeEvent(result));
        return instant;
    }


    public getRequestLocationsP(region: string, level: 1 | 2, modes: string[], bounds?: BBox): { instant: LocationsResult; remaining: Promise<LocationsResult | undefined> } {
        const cachedResults = new LocationsResult(level, modes);
        const cellIDs = level === 1 ? [region] : MapUtil.cellsForBounds(bounds!, LocationsData.cellsPerDegree);
        const requestCells: any[] = [];
        const refreshCells: { [key: string]: number } = {};
        for (const cellID of cellIDs) {
            const cellResults = this.cache.get(region, cellID);
            if (cellResults) {
                cachedResults.add(cellResults);
            }
            if (!cellResults ||
                !modes.every((mode: string) => cellResults.modes.includes(mode)) ||
                ((Math.floor(DateTimeUtil.getNow().valueOf() / 1000) - cellResults.requestTime) > 300 && !cellResults.requesting)) {   // More than 5 minutes old.
                if (!cellResults || !modes.every((mode: string) => cellResults.modes.includes(mode))) {
                    requestCells.push(cellID);
                } else { // !cellResults.fresh
                    refreshCells[cellID] = cellResults.hashCode;
                }
                // To register we are awaiting for cellIDs, avoiding requesting again the same cellID in the meanwhile.
                const waitingCellResults = cellResults || new LocationsResult(level, modes);
                waitingCellResults.requesting = true;
                this.cache.set(region, cellID, waitingCellResults);
            }
        }
        let remaining = Promise.resolve(undefined) as Promise<LocationsResult | undefined>;
        if (requestCells.length !== 0 || !Util.isEmpty(refreshCells)) {
            const locationsReq = {
                region: region,
                level: level,
                cellIDs: level === 2 && requestCells.length !== 0 ? requestCells : undefined,
                cellIDHashCodes: !Util.isEmpty(refreshCells) ? refreshCells : undefined,
                cellsPerDegree: level === 2 ? 75 : undefined,
                modes: modes
            };

            remaining =
                TripGoApi.apiCall("locations.json", NetworkUtil.MethodType.POST, locationsReq)
                    .then((groupsJson: any) => {
                        const groups: LocationsResult[] = groupsJson.groups.map((group: any) => Util.deserialize(group, LocationsResult));
                        const result = new LocationsResult(level, modes);
                        for (const group of groups) {
                            group.modes = modes;
                            group.requestTime = Math.floor(DateTimeUtil.getNow().valueOf() / 1000);
                            this.cache.set(region, group.key, group);
                            result.add(group);
                        }
                        for (const refreshed of Object.keys(refreshCells)) {
                            // Mark as refreshed all results in caché for which we requested a refresh (if they changend,
                            // and so came in the response, then they would be already marked as fresh by previous iteration,
                            // but this is necessary to mark as fresh the results that didn't change, and so didn't come in
                            // the response.
                            const refreshedCell = this.cache.get(region, refreshed)!
                            refreshedCell.requestTime = Math.floor(DateTimeUtil.getNow().valueOf() / 1000);
                            this.cache.set(region, refreshed, refreshedCell);
                        }
                        return groups.length > 0 ? result : undefined;
                    })
                    .catch((e) => {
                        console.log(e);
                        return undefined;
                    });
        }
        return { instant: cachedResults, remaining };
    }

    public getLocationsForMode(region: string, mode: string): Promise<LocationsResult> {
        return TripGoApi.apiCall(`regions/${region}/locations?mode=${mode}`, NetworkUtil.MethodType.GET)
            .then((groupsJson: any) => {
                const result = new LocationsResult(2, [mode]);
                const groups: LocationsResult[] = Util.jsonConvert().deserializeArray(groupsJson.groups, LocationsResult);
                for (const group of groups) {
                    group.modes = [mode];
                    group.requestTime = Math.floor(DateTimeUtil.getNow().valueOf() / 1000);
                    this.cache.set(region, group.key, group);
                    result.add(group);
                }
                return result;
            });
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