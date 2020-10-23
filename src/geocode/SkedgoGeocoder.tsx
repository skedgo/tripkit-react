import React from "react";
import IGeocoder from "./IGeocoder";
import GeocoderOptions from "./GeocoderOptions";
import GeocodingCache from "./GeocodingCache";
import BBox from "../model/BBox";
import NetworkUtil from "../util/NetworkUtil";
import Location from "../model/Location";
import LatLng from "../model/LatLng";
import TripGoApi from "../api/TripGoApi";
import {LocationConverter} from "../model/location/LocationConverter";
import Util from "../util/Util";
import {tKUIColors} from "../jss/TKUITheme";
import StopLocation from "../model/StopLocation";
import StopIcon from "../map/StopIcon";
import {ReactComponent as IconPin} from '../images/ic-pin-start.svg';
import LocationsData from "../data/LocationsData";
import TKLocationInfo from "../model/location/TKLocationInfo";
import CarParkLocation from "../model/location/CarParkLocation";
import ModeInfo from "../model/trip/ModeInfo";

class SkedgoGeocoder implements IGeocoder {

    private options: GeocoderOptions;
    private cache: GeocodingCache;

    constructor() {
        this.options = new GeocoderOptions();
        this.options.renderIcon =
            (location: Location) => location instanceof StopLocation ?
                <StopIcon
                    stop={location as StopLocation}
                    style={{
                        width: undefined,
                        height: undefined,
                        background: tKUIColors.black1,
                    }}
                /> : <IconPin/>;
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
        }, 1500); // Tolerance

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
        // TODO: complete with the other kind of locations.
        return LocationsData.instance.getLocationInfo(unresolvedLocation.id).then((locInfo: TKLocationInfo) => {
            let resolvedLocation;
            console.log(locInfo);
            if (locInfo.stop) {
                resolvedLocation = locInfo.stop;
            } else if (locInfo.carPark) {
                // Need to do this since locInfo.carPark is not a CarParkLocation, but a CarParkInfo, which is
                // inconsistent with locations.json endpoint, returning a list of CarParkLocation.
                resolvedLocation = Util.iAssign(new CarParkLocation(), unresolvedLocation);
                resolvedLocation.name = locInfo.carPark.name;
                resolvedLocation.carPark = locInfo.carPark;
                resolvedLocation.modeInfo = Util.iAssign(new ModeInfo(), {localIcon: "parking"});
                // Need this to force TKUILocationBox to resolve the location.
                resolvedLocation.hasDetail = true;
                console.log(resolvedLocation);
            } else {
                return Promise.reject('SkedgoGeocoder was unable to resolve the location.')
            }
            return resolvedLocation;
        });
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