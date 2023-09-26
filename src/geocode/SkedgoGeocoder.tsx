import React from "react";
import IGeocoder from "./IGeocoder";
import GeocoderOptions from "./GeocoderOptions";
import GeocodingCache from "./GeocodingCache";
import BBox from "../model/BBox";
import NetworkUtil from "../util/NetworkUtil";
import Location from "../model/Location";
import LatLng from "../model/LatLng";
import TripGoApi from "../api/TripGoApi";
import { LocationConverter } from "../model/location/LocationConverter";
import Util from "../util/Util";
import { tKUIColors } from "../jss/TKUITheme";
import StopLocation from "../model/StopLocation";
import TKUIModeLocationIcon from "../map/TKUIModeLocationIcon";
import { ReactComponent as IconPin } from '../images/ic-pin-start.svg';
import LocationsData from "../data/LocationsData";
import TKLocationInfo from "../model/location/TKLocationInfo";
import CarParkLocation from "../model/location/CarParkLocation";
import ModeInfo from "../model/trip/ModeInfo";
import BikePodLocation from "../model/location/BikePodLocation";
import RegionsData from "../data/RegionsData";
import Region from "../model/region/Region";
import CarPodLocation from "../model/location/CarPodLocation";

const defaultRenderIcon = (location: Location) =>
    location instanceof StopLocation ?
        <TKUIModeLocationIcon
            location={location as StopLocation}
            style={{
                width: undefined,
                height: undefined,
                background: tKUIColors.black1,
            }}
        /> :
        location instanceof CarPodLocation ?
            <TKUIModeLocationIcon
                location={location as CarPodLocation}
                style={{
                    width: undefined,
                    height: undefined,
                    background: tKUIColors.black1,
                }}
            /> : <IconPin />;
class SkedgoGeocoder implements IGeocoder {

    private options: GeocoderOptions;
    private cache: GeocodingCache;

    constructor(options: GeocoderOptions = {}) {
        this.options = options;
        if (!this.options.renderIcon) {
            this.options.renderIcon = defaultRenderIcon;
        }
        if (this.options.reverseGeocoding === undefined) {  // Default reverseGeocoding to true.
            this.options.reverseGeocoding = true;
        }
        this.cache = new GeocodingCache();
    }

    public getOptions(): GeocoderOptions {
        return this.options;
    }

    public geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void {
        if (!query || !autocomplete) {
            callback([]);
            return;
        }

        const center = focus ? focus : (bounds ? bounds.getCenter() : null);
        if (center !== null) {
            const cachedResults = this.cache.getResults(query, autocomplete, center);
            if (cachedResults !== null) {
                callback(cachedResults.slice(0, this.options.resultsLimit));
                return;
            }
        }

        const endpoint = "geocode.json?"
            + "q=" + query
            + "&allowGoogle=false"
            + (center ? "&near=" + "(" + center.lat + "," + center.lng + ")" : "")
            + (autocomplete ? "&a=true" : "");

        const results: Location[] = [];

        let timedOut = false;
        let resultsArrived = false;
        const timeoutId = setTimeout(() => {
            timedOut = true;
            if (!resultsArrived) {
                Util.log("query " + query + " timed out ");
                callback(results);
            }
        }, 3000); // Tolerance

        TripGoApi.apiCall(endpoint, NetworkUtil.MethodType.GET).then((json: any) => {
            if (timedOut) {
                return
            } else {
                clearTimeout(timeoutId);
            }
            resultsArrived = true;
            if (!json.choices) {
                callback(results);
                return
            }
            const jsonConvert = new LocationConverter();
            for (const locJson of json.choices) {
                const loc = jsonConvert.deserialize(locJson);
                results.push(loc);
            }
            if (center) {
                this.cache.addResults(query, autocomplete, center, results);
            }
            callback(results.slice(0, this.options.resultsLimit));
        }).catch(reason => {
            Util.log(endpoint + " failed. Reason: " + reason);
            callback([]);
        });
    }

    public resolve(unresolvedLocation: Location): Promise<Location> {
        return RegionsData.instance.getRegionP(unresolvedLocation).then((region?: Region) =>
            LocationsData.instance.getLocationInfo(unresolvedLocation.id, region && region.name)
                .then((locInfo: TKLocationInfo) => {
                    let resolvedLocation;
                    if (locInfo.stop) {
                        resolvedLocation = locInfo.stop;
                    } else if (locInfo.carPark) {
                        // Need to do this since locInfo.carPark is not a CarParkLocation, but a CarParkInfo, which is
                        // inconsistent with locations.json endpoint, returning a list of CarParkLocation.
                        resolvedLocation = Util.iAssign(new CarParkLocation(), unresolvedLocation);
                        resolvedLocation.name = locInfo.carPark.name;
                        resolvedLocation.carPark = locInfo.carPark;
                        resolvedLocation.modeInfo = Util.iAssign(new ModeInfo(), { localIcon: "parking" });
                        // Need this to force TKUILocationBox to resolve the location.
                        resolvedLocation.hasDetail = true;
                    } else if (locInfo.carRental) {
                        // Need to do this since locInfo.carPark is not a CarParkLocation, but a CarParkInfo, which is
                        // inconsistent with locations.json endpoint, returning a list of CarParkLocation.
                        resolvedLocation = Util.iAssign(new CarParkLocation(), unresolvedLocation);
                        resolvedLocation.name = locInfo.carRental.company.name;
                        resolvedLocation.carRental = locInfo.carRental;
                        resolvedLocation.modeInfo = Util.iAssign(new ModeInfo(), { localIcon: "car-share" });
                        // Need this to force TKUILocationBox to resolve the location.
                        resolvedLocation.hasDetail = true;
                    } else if (locInfo.carPod) {
                        // Need to do this since locInfo.carPark is not a CarParkLocation, but a CarParkInfo, which is
                        // inconsistent with locations.json endpoint, returning a list of CarParkLocation.
                        resolvedLocation = Util.iAssign(new CarPodLocation(), unresolvedLocation);
                        resolvedLocation.name = locInfo.carPod.operator.name;
                        resolvedLocation.carPod = locInfo.carPod;
                        const modeInfoId = locInfo.carPod.identifier.includes("|") ? locInfo.carPod.identifier.substring(0, locInfo.carPod.identifier.indexOf("|")) : locInfo.carPod.identifier;
                        resolvedLocation.modeInfo = Util.iAssign(new ModeInfo(),
                            {                                
                                identifier: modeInfoId,
                                alt: locInfo.carPod.operator.name,
                                localIcon: "car-share",
                                color: locInfo.carPod.operator.color
                            });
                        // Need this to force TKUILocationBox to resolve the location.
                        resolvedLocation.hasDetail = true;
                    } else if (locInfo.bikePod) {
                        resolvedLocation = Util.iAssign(new BikePodLocation(), unresolvedLocation);
                        resolvedLocation.name = locInfo.bikePod.operator.name;
                        resolvedLocation.bikePod = locInfo.bikePod;
                        resolvedLocation.modeInfo = Util.iAssign(new ModeInfo(), { localIcon: "bicycle-share" });
                        // Need this to force TKUILocationBox to resolve the location.
                        resolvedLocation.hasDetail = true;
                    } else if (unresolvedLocation.isResolved()) { // TODO: implement resolution for the other kind of locations.
                        resolvedLocation = unresolvedLocation;
                        resolvedLocation.hasDetail = true;
                    } else {
                        return Promise.reject('SkedgoGeocoder was unable to resolve the location.')
                    }
                    return resolvedLocation;
                }).catch((e) => {
                    if (unresolvedLocation.isResolved()) {
                        unresolvedLocation.hasDetail = true;
                        return unresolvedLocation;
                    } else {
                        throw e;
                    }
                }));
    }

    public reverseGeocode(coord: LatLng, callback: (location: (Location | null)) => void): void {
        const endpoint = "geocode.json?"
            + "q=" + coord.lat + "," + coord.lng
            + "&allowGoogle=false"
            + "&near=" + "(" + coord.lat + "," + coord.lng + ")";

        TripGoApi.apiCall(endpoint, NetworkUtil.MethodType.GET).then((json: any) => {
            if (!json.choices || json.choices.length === 0) {
                callback(null);
                return;
            }
            const jsonConvert = new LocationConverter();
            callback(jsonConvert.deserialize(json.choices[0]));
        }).catch(reason => {
            Util.log(endpoint + " failed. Reason: " + reason);
            callback(null);
        });
    }

}

export default SkedgoGeocoder;