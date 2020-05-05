import React from "react";
import IGeocoder from "./IGeocoder";
import Location from "../model/Location";
import PeliasGeocoder from "./PeliasGeocoder";
import SkedgoGeocoder from "./SkedgoGeocoder";
import LocationUtil from "../util/LocationUtil";
import StopLocation from "../model/StopLocation";
import StaticGeocoder from "./StaticGeocoder";
import RegionsData from "../data/RegionsData";
import Util from "../util/Util";
import FavouritesData from "../data/FavouritesData";
import Favourite from "../model/favourite/Favourite";
import FavouriteStop from "../model/favourite/FavouriteStop";
import {ReactComponent as IconFavourite} from '../images/ic-fav-star.svg';
import {ReactComponent as IconCity} from '../images/location/ic-city.svg';
import {ReactComponent as IconClock} from '../images/ic-clock.svg';
import City from "../model/location/City";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import CurrentLocationGeocoder from "./CurrentLocationGeocoder";

class MultiGeocoderOptions {

    public static default(showCurrLoc: boolean = true, customGeocoders?: IGeocoder[]): MultiGeocoderOptions {

        const currLocGeocoder = new CurrentLocationGeocoder();

        const skedgoGeocoder = new SkedgoGeocoder();
        skedgoGeocoder.getOptions().resultsLimit = 2;

        const citiesSourceId = "CITIES";
        const citiesGeocoder = new StaticGeocoder(citiesSourceId);
        citiesGeocoder.getOptions().resultsLimit = 5;
        citiesGeocoder.getOptions().renderIcon = () => <IconCity/>;
        RegionsData.instance.requireRegions().then(() => {
            citiesGeocoder.setValues(RegionsData.instance.getCities()!
                .map((city: City) => Util.iAssign(city, {source: citiesSourceId})));
        });

        const favToLocations = (favourites: Favourite[], recent: boolean) => {
            const locations = favourites
                .map((favourite: Favourite) => Util.iAssign(
                    // TODO: for trips it's just adding to, see if should add also from.
                    favourite instanceof FavouriteStop ? favourite.stop : (favourite as FavouriteTrip).to,
                    { // To avoid mutating original location.
                        source: recent ? recentSourceId : favouritesSourceId
                    }));
            // TODO: remove redundant / analogous favourites, which may happen since they come
            // from different sources. Probably use the analogResults function below, but
            // before overriding source to that of Favourite / Recent.
            return Util.addAllNoRep(([] as Location[]), locations,
                (e1?: Location | null, e2?: Location | null) =>
                    e1 === undefined ? e2 === undefined :
                        e1 === null ? e2 === null : e1.equals(e2));
        };

        const recentSourceId = "RECENT";
        const recentGeocoder = new StaticGeocoder(recentSourceId, true);
        recentGeocoder.getOptions().resultsLimit = 3;
        recentGeocoder.getOptions().renderIcon =
            (location: Location) => {
                return FavouritesData.instance.getLocations()
                    .find((loc: Location) => location.equals(loc)) ? <IconFavourite/> : <IconClock/>;
            };
        const recLocations = favToLocations(FavouritesData.recInstance.get(), true);
        recentGeocoder.setValues(recLocations);
        FavouritesData.recInstance.addChangeListener((update: Favourite[]) =>
            recentGeocoder.setValues(favToLocations(update, true)));


        const favouritesSourceId = "FAVOURITES";
        const favouritesGeocoder = new StaticGeocoder(favouritesSourceId, true);
        favouritesGeocoder.getOptions().resultsLimit = 5;
        favouritesGeocoder.getOptions().renderIcon = () => <IconFavourite/>;
        const favLocations = favToLocations(FavouritesData.instance.get(), false);
        favouritesGeocoder.setValues(favLocations);
        FavouritesData.instance.addChangeListener((update: Favourite[]) =>
            favouritesGeocoder.setValues(favToLocations(update, false)));

        const geocoders: IGeocoder[] = (showCurrLoc ? [currLocGeocoder] : [] as IGeocoder[])
            .concat([recentGeocoder, favouritesGeocoder, skedgoGeocoder, citiesGeocoder])
            .concat(customGeocoders ? customGeocoders : []);
        const compare = (l1: Location, l2: Location, query: string) => {

            if (!query) {
                // Put current location at the top
                if (l1.source === currLocGeocoder.getSourceId()) {
                    return -1;
                } else if (l2.source === currLocGeocoder.getSourceId()) {
                    return 1;
                }
            }

            // Then recents
            if (l1.source === recentGeocoder.getSourceId()) {
                return -1;
            } else if (l2.source === recentGeocoder.getSourceId()) {
                return 1;
            }

            if (l1.source === SkedgoGeocoder.SOURCE_ID && l1 instanceof StopLocation && query === (l1 as StopLocation).code) {
                return -1;
            } else if (l2.source === SkedgoGeocoder.SOURCE_ID && l2 instanceof StopLocation && query === (l2 as StopLocation).code) {
                return 1
            }

            const relevanceDiff = LocationUtil.relevance(query, l2.address) - LocationUtil.relevance(query, l1.address);

            // Prioritize skedgo geocoder result if
            // - query has 3 or more characters, and
            // - query is related to "airport" or "stop", and
            // - relevance is not less than 0.1 from other source result
            if (query.length >= 3 &&
                (LocationUtil.relevance(query, "airport") >= .7 ||
                    LocationUtil.relevance(query, "stop") >= .7)) {
                if (l1.source === SkedgoGeocoder.SOURCE_ID && relevanceDiff <= 0.1) {
                    return -1;
                } else if (l2.source === SkedgoGeocoder.SOURCE_ID && relevanceDiff >= -0.1) {
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
            const relevance = Math.max(LocationUtil.relevance(r1.address, r2.address) , LocationUtil.relevance(r2.address, r1.address));
            const distanceInMetres = LocationUtil.distanceInMetres(r1, r2);
            if (r1.source !== r2.source) {
                Util.log(r1.address + " (" + r1.source + ") | " + r2.address + " (" + r2.source + ") dist: " + distanceInMetres + " relevance: " + relevance);
            }
            if (r1.source !== r2.source &&
                ((r1 instanceof StopLocation && r2 instanceof StopLocation) ? r1.equals(r2) :
                        relevance > .7 && (LocationUtil.distanceInMetres(r1, r2) < 100))) {
                return true;
            }
            return false;
        };
        return new MultiGeocoderOptions(geocoders, compare, analogResults);
    }

    public geocoders: IGeocoder[] = [];
    public compare: (l1: Location, l2: Location, query: string) => number;
    public analogResults: (r1: Location, r2: Location) => boolean;


    constructor(geocoders: IGeocoder[], compare: (l1: Location, l2: Location, query: string) => number, analogResults: (r1: Location, r2: Location) => boolean) {
        this.geocoders = geocoders;
        this.compare = compare;
        this.analogResults = analogResults;
    }

    public getGeocoderById(id: string): IGeocoder | undefined {
        return this.geocoders.find((geocoder: IGeocoder) => geocoder.getSourceId() === id);
    }
}

export default MultiGeocoderOptions;