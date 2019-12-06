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
import FavouriteLocation from "../model/favourite/FavouriteLocation";
import CurrentLocationGeocoder from "./CurrentLocationGeocoder";

class MultiGeocoderOptions {

    public static default(showCurrLoc: boolean = true) {

        const currLocGeocoder = new CurrentLocationGeocoder();

        const peliasGeocoder = new PeliasGeocoder("https://api.geocode.earth/v1", "ge-63f76914953caba8");
        peliasGeocoder.getOptions().resultsLimit = 5;

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

        const recentSourceId = "RECENT";
        const recentGeocoder = new StaticGeocoder(recentSourceId, true);
        recentGeocoder.getOptions().resultsLimit = 3;
        recentGeocoder.getOptions().renderIcon =
            (location: Location) => {
                console.log("render item: ");
                console.log(location);
                return FavouritesData.instance.getLocations()
                    .find((loc: Location) => location.equals(loc)) ? <IconFavourite/> : <IconClock/>;
            };
        const favouritesSourceId = "FAVOURITES";
        const favToLocations = (favourites: Favourite[], recent: boolean) =>
            favourites.filter((favourite: Favourite) => !(favourite instanceof FavouriteTrip))
                .map((favourite: Favourite) => Util.iAssign(
                    favourite instanceof FavouriteStop ? favourite.stop : (favourite as FavouriteLocation).location,
                    { // To avoid mutating original location.
                        source: recent ? recentSourceId : favouritesSourceId
                    }));

        const recLocations = favToLocations(FavouritesData.recInstance.get(), true);
        recentGeocoder.setValues(recLocations);
        FavouritesData.recInstance.addChangeListener((update: Favourite[]) =>
            recentGeocoder.setValues(favToLocations(update, true)));

        const favouritesGeocoder = new StaticGeocoder(favouritesSourceId, true);
        favouritesGeocoder.getOptions().resultsLimit = 5;
        favouritesGeocoder.getOptions().renderIcon = () => <IconFavourite/>;
        const favLocations = favToLocations(FavouritesData.instance.get(), false);
        // TODO: override equals on FavouriteStop to ignore source on compare.
        favouritesGeocoder.setValues(favLocations);
        FavouritesData.instance.addChangeListener((update: Favourite[]) =>
            recentGeocoder.setValues(favToLocations(update, false)));

        const geocoders: IGeocoder[] = (showCurrLoc ? [currLocGeocoder] : [] as IGeocoder[]).concat([recentGeocoder, favouritesGeocoder, peliasGeocoder, skedgoGeocoder, citiesGeocoder]);
        const compare = (l1: Location, l2: Location, query: string) => {

            if (query === "") {
                if (l1.source === recentGeocoder.sourceId) {
                    return -1;
                } else if (l2.source === recentGeocoder.sourceId) {
                    return 1;
                }
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
        const analogResults = (r1: Location, r2: Location) => {
            const relevance = Math.max(LocationUtil.relevance(r1.address, r2.address) , LocationUtil.relevance(r2.address, r1.address));
            const distanceInMetres = LocationUtil.distanceInMetres(r1, r2);
            if (r1.source !== r2.source) {
                Util.log(r1.address + " (" + r1.source + ")" + " | " + r2.address + " (" + r2.source + ")" + " dist: " + distanceInMetres + " relevance: " + relevance);
            }
            if (r1.source !== r2.source && relevance > .7 && (LocationUtil.distanceInMetres(r1, r2) < 100)) {
                return true;
            }
            return false;
        };
        return new MultiGeocoderOptions(showCurrLoc, geocoders, compare, analogResults);
    }

    public showCurrLoc: boolean = false;
    public geocoders: IGeocoder[] = [];
    public compare: (l1: Location, l2: Location, query: string) => number;
    public analogResults: (r1: Location, r2: Location) => boolean;


    constructor(showCurrLoc: boolean, geocoders: IGeocoder[], compare: (l1: Location, l2: Location, query: string) => number, analogResults: (r1: Location, r2: Location) => boolean) {
        this.showCurrLoc = showCurrLoc;
        this.geocoders = geocoders;
        this.compare = compare;
        this.analogResults = analogResults;
    }

    public getGeocoderById(id: string): IGeocoder | undefined {
        return this.geocoders.find((geocoder: IGeocoder) => geocoder.getSourceId() === id);
    }
}

export default MultiGeocoderOptions;