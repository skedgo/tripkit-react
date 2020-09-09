import LocationsResult from "../model/location/LocationsResult";
import TripGoApi from "../api/TripGoApi";
import NetworkUtil from "../util/NetworkUtil";
import {JsonConvert} from "json2typescript";
import {EventEmitter, EventSubscription} from "fbemitter";
import BBox from "../model/BBox";
import MapUtil from "../util/MapUtil";
import ModeIdentifier from "../model/region/ModeIdentifier";
import Util from "../util/Util";
import TKLocationInfo from "../model/location/TKLocationInfo";
import LatLng from "../model/LatLng";

class LocationsData {

    public static cellsPerDegree = 75;
    private cellToLocResult: Map<string, LocationsResult> = new Map<string, LocationsResult>();

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
     * Return locations for cells found in cache, and requests locations for the other cells.
     */
    public getRequestLocations(region: string, level: 1 | 2, bounds?: BBox): LocationsResult {
        const cachedResults = new LocationsResult(level);
        const cellIDs = level === 1 ? [region] : MapUtil.cellsForBounds(bounds!, LocationsData.cellsPerDegree);
        const requestCells: any[] = [];
        for (const cellID of cellIDs) {
            const cellResults = this.cellToLocResult.get(cellID);
            if (cellResults) {
                cachedResults.add(cellResults);
            } else {
                requestCells.push(cellID);
                // To register we are awaiting for cellID stops, avoiding requesting again the same cellID in the meanwhile.
                this.cellToLocResult.set(cellID, new LocationsResult(level));
            }
        }
        if (requestCells.length !== 0) {
            const locationsReq = {
                region: region,
                level: level,
                cellIDs: level === 2 ? requestCells : undefined,
                cellsPerDegree: level === 2 ? 75 : undefined,
                modes: [ModeIdentifier.BICYCLE_ID, "cy_bic-s_ACT", ModeIdentifier.BICYCLE_SHARE_ID, ModeIdentifier.CAR_ID, ModeIdentifier.PUBLIC_TRANSPORT_ID]
            };

            TripGoApi.apiCall("locations.json", NetworkUtil.MethodType.POST, locationsReq)
                .then((groupsJson: any) => {
                    const groups: LocationsResult[] = groupsJson.groups.map((group: any) => Util.deserialize(group, LocationsResult));
                    const result = new LocationsResult(level);
                    for (const group of groups) {
                        this.cellToLocResult.set(group.key, group);
                        result.add(group);
                    }
                    this.fireChangeEvent(result);
                })
                .catch((e) => console.log(e));
        }
        return cachedResults;
    }

    private locationInfoCache: Map<string, Promise<TKLocationInfo>> = new Map<string, Promise<TKLocationInfo>>();

    public getLocationInfo(id: LatLng | string): Promise<TKLocationInfo> {
        const cacheKey = id instanceof LatLng ? id.getKey() : id;
        const cachedResult = this.locationInfoCache.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        } else {
            const endpoint = "locationInfo.json?" +
                (id instanceof LatLng ? "lat=" + id.lat + "&lng=" + id.lng : "identifier=" + id);
            const result = TripGoApi.apiCallT(endpoint, NetworkUtil.MethodType.GET, TKLocationInfo);
            this.locationInfoCache.set(cacheKey, result);
            return result;
        }
    }
}

export default LocationsData;