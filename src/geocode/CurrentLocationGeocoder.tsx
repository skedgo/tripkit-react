import React from "react";
import IGeocoder from "./IGeocoder";
import GeocoderOptions from "./GeocoderOptions";
import {ReactComponent as IconCurrLoc} from '../images/location/ic-curr-loc.svg';
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import Location from "../model/Location";
import Util from "../util/Util";
import GeolocationData from "./GeolocationData";
import {ERROR_GEOLOC_INACCURATE, TKUserPosition} from "../util/GeolocationUtil";
import {TKError} from "../error/TKError";

class CurrentLocationGeocoder implements IGeocoder {

    public static readonly SOURCE_ID = "CURRENT";

    private options: GeocoderOptions;


    constructor() {
        this.options = new GeocoderOptions();
        this.options.renderIcon = () => <IconCurrLoc/>
    }

    geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void {
        callback(!query ? [Location.createCurrLoc()] : []);
    }

    getOptions(): GeocoderOptions {
        return this.options;
    }

    getSourceId(): string {
        return CurrentLocationGeocoder.SOURCE_ID;
    }

    resolve(unresolvedLocation: Location): Promise<Location> {
        return unresolvedLocation.isCurrLoc() ?
            GeolocationData.instance.requestCurrentLocation(false)
                .then((userPos: TKUserPosition) => {
                    if (userPos.accuracy && userPos.accuracy > 200) {
                        throw new TKError("Inaccurate geolocation.", ERROR_GEOLOC_INACCURATE);
                    }
                    return Util.iAssign(unresolvedLocation, userPos.latLng)
                }) :
            Promise.reject(new Error('CurrentLocationGeocoder unable to resolve ' + Util.stringify(unresolvedLocation)));
    }

    reverseGeocode(coord: LatLng, callback: (location: (Location | null)) => void): void {
    }



}

export default CurrentLocationGeocoder;