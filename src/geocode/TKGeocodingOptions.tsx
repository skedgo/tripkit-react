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
import { staticFavouriteData } from "../favourite/TKFavouritesProvider";
import SchoolLocation from "../model/location/SchoolLocation";

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
            .filter(favourite => favourite instanceof FavouriteStop ? favourite.stop : true)    // Filter out uninstantiated favourite stops
            .map((favourite: Favourite) =>
                Util.iAssign(
                    // TODO: for trips it's just adding to, see if should add also from.
                    favourite instanceof FavouriteStop ? favourite.stop! :
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
    const favLocations = favToLocations(staticFavouriteData.values, false);
    favouritesGeocoder.setValues(favLocations);
    staticFavouriteData.addChangeListener((update: Favourite[]) =>
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
        if (l1.source === TKDefaultGeocoderNames.recent && l2.source !== TKDefaultGeocoderNames.recent) {
            return -1;
        } else if (l2.source === TKDefaultGeocoderNames.recent && l1.source !== TKDefaultGeocoderNames.recent) {
            return 1;
        }

        let relevanceL1 = LocationUtil.relevance(query, l1);
        let relevanceL2 = LocationUtil.relevance(query, l2);
        if (l1 instanceof SchoolLocation) {
            relevanceL1 += (1 - relevanceL1) * .5;
        }
        if (l2 instanceof SchoolLocation) {
            relevanceL2 += (1 - relevanceL2) * .5;
        }

        if (l1.source === TKDefaultGeocoderNames.skedgo) {
            relevanceL1 += (1 - relevanceL1) * .3;
        } else if (l2.source === TKDefaultGeocoderNames.skedgo) {
            relevanceL2 += (1 - relevanceL2) * .3;
        }

        const relevanceDiff = relevanceL2 - relevanceL1;
        return relevanceDiff;
    };

    // It's used to remove duplicates from different sources. We assume results returned
    // by each source is free of duplicates (is responsibility of the source to ensure that)
    const analogResults = (r1: Location, r2: Location) => {
        const r1DisplayString = (LocationUtil.getMainText(r1) + (LocationUtil.getSecondaryText(r1) ? ", " + LocationUtil.getSecondaryText(r1) : "")).toLowerCase();
        const r2DisplayString = (LocationUtil.getMainText(r2) + (LocationUtil.getSecondaryText(r2) ? ", " + LocationUtil.getSecondaryText(r2) : "")).toLowerCase();
        const r1MainString = LocationUtil.getMainText(r1).toLowerCase();
        const r2MainString = LocationUtil.getMainText(r2).toLowerCase();
        const mutualRelevance =
            (Math.max(
                LocationUtil.relevanceStr(r1DisplayString, r2DisplayString),
                LocationUtil.relevanceStr(r2DisplayString, r1DisplayString))
                +
                Math.max(LocationUtil.relevanceStr(r1MainString, r2MainString),
                    LocationUtil.relevanceStr(r2MainString, r1MainString))) / 2;
        const distanceInMetres = LocationUtil.distanceInMetres(r1, r2);
        if (r1.source === r2.source) {
            return false;
        }
        if ((r1 instanceof StopLocation && r2 instanceof StopLocation) || (r1 instanceof SchoolLocation && r2 instanceof SchoolLocation)) { // E.g. stop from skedgo geocoder vs stop from favourites.
            return r1.equals(r2);
        }
        if (mutualRelevance > .8 && distanceInMetres < 100 ||   // very similar and very close
            (r1 instanceof SchoolLocation || r2 instanceof SchoolLocation) && mutualRelevance > .6 && distanceInMetres < 300 || // rather similar and rather close, when one is a school
            (r1 instanceof SchoolLocation || r2 instanceof SchoolLocation) && mutualRelevance > .5 && distanceInMetres < 70) {  // a bit less similar but very close, when one is a school
            console.log("----- Analog -----");
            console.log(r1DisplayString, r1);
            console.log(r2DisplayString, r2);
            console.log("relevance", mutualRelevance, "distanceInMetres", distanceInMetres);
            return true;
        } else if ((r1 instanceof SchoolLocation || r2 instanceof SchoolLocation) && distanceInMetres < 300) {
            console.log("----- NOT Analog -----");
            console.log(r1DisplayString, r1);
            console.log(r2DisplayString, r2);
            console.log("relevance", mutualRelevance, "distanceInMetres", distanceInMetres);
            console.log("--------");
        }
        return false;
    }

    function compareAnalog(l1, l2, query): number {
        // Prioritize school locations over others when analog result found.
        if (l1 instanceof SchoolLocation && !(l2 instanceof SchoolLocation)) {
            return -1;
        }
        if (!(l1 instanceof SchoolLocation) && l2 instanceof SchoolLocation) {
            return 1;
        }
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