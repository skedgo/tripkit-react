import React from "react";
import IGeocoder from "./IGeocoder";
import Location from "../model/Location";
import SkedgoGeocoder from "./SkedgoGeocoder";
import LocationUtil from "../util/LocationUtil";
import StopLocation from "../model/StopLocation";
import StaticGeocoder from "./StaticGeocoder";
import RegionsData from "../data/RegionsData";
import Util from "../util/Util";
import FavouritesData from "../data/FavouritesData";
import Favourite from "../model/favourite/Favourite";
import FavouriteStop from "../model/favourite/FavouriteStop";
import { ReactComponent as IconFavourite } from '../images/ic-fav-star.svg';
import { ReactComponent as IconCity } from '../images/location/ic-city.svg';
import { ReactComponent as IconClock } from '../images/ic-clock.svg';
import City from "../model/location/City";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import CurrentLocationGeocoder from "./CurrentLocationGeocoder";
import TKDefaultGeocoderNames from "./TKDefaultGeocoderNames";
import LatLng from "../model/LatLng";
import TKMapViewport from "../map/TKMapViewport";
import Region from "../model/region/Region";
import FavouriteLocation from "../model/favourite/FavouriteLocation";

export const TKGeocodingOptionsForDoc = (props: Partial<TKGeocodingOptions>) => null;
TKGeocodingOptionsForDoc.displayName = 'TKGeocodingOptions';

interface TKGeocodingOptions {
    /**
     * Keys for default geocoders are: 'skedgo', 'cities', 'favourites', 'recent' and 'geolocation'.
     *
     * @ctype \[key: string\]: IGeocoder;
     * @default {skedgo, cities, favourites, recent, geolocation}
     */
    geocoders: {
        [key: string]: IGeocoder;
    };
    /** @ctype */
    compare: (l1: Location, l2: Location, query: string) => number;
    /** @ctype */
    analogResults: (r1: Location, r2: Location) => boolean;
    /** @ctype */
    compareAnalog: (l1: Location, l2: Location, query: string) => number;
    /** 
     * @ctype 
     * If specified and returs false, then the location is not included.
     * 
    */
    filter?: (l: Location, context: { query: string }) => boolean;
    maxResults?: number;
    /**
     * If true then the coverage bounds will be used to restrict geocoding results.
     * Otherwise, current region bounds are used.
     */
    restrictToCoverageBounds?: boolean;
    /**
     * Calculate coordinates to focus location search.
     * @ctype
     * @default The center of the main city of current region ({@link TKState#region})
     */
    getFocus?: (props: { selectedRegion?: Region, mapViewport?: TKMapViewport }) => LatLng | undefined;
    reverseGeocoderId?: string;
}

function getDefaultGeocodingOptions(): TKGeocodingOptions {
    const currLocGeocoder = new CurrentLocationGeocoder();

    const skedgoGeocoder = new SkedgoGeocoder({ resultsLimit: 2 });

    const citiesGeocoder = new StaticGeocoder({
        resultsLimit: 5,
        renderIcon: () => <IconCity />
    });
    RegionsData.instance.requireRegions().then(() => {
        citiesGeocoder.setValues(RegionsData.instance.getCities()!
            .map((city: City) => Util.iAssign(city, { source: TKDefaultGeocoderNames.cities })));
    });

    const favToLocations = (favourites: Favourite[], recent: boolean) => {
        const locations = favourites
            .map((favourite: Favourite) => Util.iAssign(
                // TODO: for trips it's just adding to, see if should add also from.
                favourite instanceof FavouriteStop && favourite.stop ? favourite.stop :
                    favourite instanceof FavouriteLocation ? favourite.location : (favourite as FavouriteTrip).endLocation,
                { // To avoid mutating original location.
                    source: recent ? TKDefaultGeocoderNames.recent : TKDefaultGeocoderNames.favourites
                }));
        // TODO: remove redundant / analogous favourites, which may happen since they come
        // from different sources. Probably use the analogResults function below, but
        // before overriding source to that of Favourite / Recent.
        return Util.addAllNoRep(([] as Location[]), locations,
            (e1?: Location | null, e2?: Location | null) =>
                e1 === undefined ? e2 === undefined :
                    e1 === null ? e2 === null : e1.equals(e2));
    };

    const recentGeocoder = new StaticGeocoder({
        emptyMatchAll: true,
        resultsLimit: 3,
        renderIcon: (location: Location) => FavouritesData.instance.getLocations()
            .find((loc: Location) => location.equals(loc)) ? <IconFavourite /> : <IconClock />
    });
    const recLocations = favToLocations(FavouritesData.recInstance.get(), true);
    recentGeocoder.setValues(recLocations);
    FavouritesData.recInstance.addChangeListener((update: Favourite[]) =>
        recentGeocoder.setValues(favToLocations(update, true)));

    const favouritesGeocoder = new StaticGeocoder({
        emptyMatchAll: true,
        resultsLimit: 5,
        renderIcon: () => <IconFavourite />
    });
    const favLocations = favToLocations(FavouritesData.instance.get(), false);
    favouritesGeocoder.setValues(favLocations);
    FavouritesData.instance.addChangeListener((update: Favourite[]) =>
        favouritesGeocoder.setValues(favToLocations(update, false)));

    const compare = (l1: Location, l2: Location, query: string) => {

        if (!query) {
            // Put current location at the top
            if (l1.source === TKDefaultGeocoderNames.geolocation) {
                return -1;
            } else if (l2.source === TKDefaultGeocoderNames.geolocation) {
                return 1;
            }
        }

        // Then recents
        if (l1.source === TKDefaultGeocoderNames.recent) {
            return -1;
        } else if (l2.source === TKDefaultGeocoderNames.recent) {
            return 1;
        }

        if (l1.source === TKDefaultGeocoderNames.skedgo) {
            return -1;
        } else if (l2.source === TKDefaultGeocoderNames.skedgo) {
            return 1
        }

        const relevanceDiff = LocationUtil.relevance(query, l2) - LocationUtil.relevance(query, l1);

        // Prioritize skedgo geocoder result if
        // - query has 3 or more characters, and
        // - query is related to "airport" or "stop", and
        // - relevance is not less than 0.1 from other source result
        if (query.length >= 3 &&
            (LocationUtil.relevanceStr(query, "airport") >= .7 ||
                LocationUtil.relevanceStr(query, "stop") >= .7)) {
            if (l1.source === TKDefaultGeocoderNames.skedgo && relevanceDiff <= 0.1) {
                return -1;
            } else if (l2.source === TKDefaultGeocoderNames.skedgo && relevanceDiff >= -0.1) {
                return 1
            }
        }

        if (relevanceDiff !== 0) {
            return relevanceDiff;
        }

        return 0;
    };

    // It's used to remove duplicates from different sources. We assume results returned
    // by each source is free of duplicates (is responsibility of the source to ensure that)
    const analogResults = (r1: Location, r2: Location) => {
        const relevance = Math.max(LocationUtil.relevanceStr(r1.address || "", r2.address || ""), LocationUtil.relevanceStr(r2.address || "", r1.address || ""));
        const distanceInMetres = LocationUtil.distanceInMetres(r1, r2);
        if (r1.source === r2.source) {
            return false;
        }
        Util.log(r1.address + " (" + r1.source + ") | " + r2.address + " (" + r2.source + ") dist: " + distanceInMetres + " relevance: " + relevance, null);
        if (r1 instanceof StopLocation && r2 instanceof StopLocation) {
            return r1.equals(r2);
        }
        return relevance > .7 && LocationUtil.distanceInMetres(r1, r2) < 100;
    }

    const compareAnalog = (l1: Location, l2: Location, query: string): -1 | 0 | 1 => {
        if (l1.source !== TKDefaultGeocoderNames.skedgo && l2.source === TKDefaultGeocoderNames.skedgo) {
            return LocationUtil.relevanceStr(query, l1.address ?? "") - LocationUtil.relevanceStr(query, l2.address ?? "") < 0.2 ? 1 : -1
        } else if (l1.source === TKDefaultGeocoderNames.skedgo && l2.source !== TKDefaultGeocoderNames.skedgo) {
            return LocationUtil.relevanceStr(query, l1.address ?? "") - LocationUtil.relevanceStr(query, l2.address ?? "") > -0.2 ? -1 : 1
        }
        return 0;
    }

    return {
        geocoders: {
            [TKDefaultGeocoderNames.geolocation]: currLocGeocoder,
            [TKDefaultGeocoderNames.recent]: recentGeocoder,
            [TKDefaultGeocoderNames.favourites]: favouritesGeocoder,
            [TKDefaultGeocoderNames.skedgo]: skedgoGeocoder,
            [TKDefaultGeocoderNames.cities]: citiesGeocoder
        },
        compare,
        analogResults,
        compareAnalog
    };
}

function getGeocodingOptions(configOptions?: Partial<TKGeocodingOptions> | ((defaultOptions: TKGeocodingOptions) => Partial<TKGeocodingOptions>)) {
    const defaultOptions = getDefaultGeocodingOptions();
    const configOptionsObj = Util.isFunction(configOptions) ?
        (configOptions as ((defaultOptions: TKGeocodingOptions) => Partial<TKGeocodingOptions>))(defaultOptions) :
        configOptions;
    return !configOptions ? defaultOptions : { ...defaultOptions, ...configOptionsObj };
}

export default TKGeocodingOptions;
export { getGeocodingOptions }