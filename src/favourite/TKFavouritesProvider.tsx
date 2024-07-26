import React, { ReactNode, useContext, useEffect, useState } from "react";
import Favourite from "../model/favourite/Favourite";
import FavouritesData from "../data/FavouritesData";
import TripGoApi from "../api/TripGoApi";
import { SignInStatus, TKAccountContext } from "../account/TKAccountContext";
import FavouriteStop from "../model/favourite/FavouriteStop";
import Util from "../util/Util";
import FavouriteLocation from "../model/favourite/FavouriteLocation";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import { v4 as uuidv4 } from 'uuid';
import StopLocation from "../model/StopLocation";
import { moveFromTo } from "../util_components/TKUIReorderList";
import { EventEmitter, EventSubscription } from "fbemitter";

export interface IFavouritesContext {
    isLoadingFavourites: boolean;
    isSupportedFavourites: boolean;
    favouriteList: Favourite[];
    recentList: Favourite[];
    onAddFavourite: (value: Favourite) => void;
    onUpdateFavourite: (value: Favourite) => Promise<Favourite[]>;
    onRemoveFavourite: (value: Favourite) => void;
    onReorderFavourite: (from: number, to: number) => void;
    onAddRecent: (value: Favourite) => void;
    onRemoveRecent: (value: Favourite) => void;
    onRefreshFavourites: (props?: { silent?: boolean, refreshStops?: boolean }) => void;
}

export const TKFavouritesContext = React.createContext<IFavouritesContext>({
    isLoadingFavourites: false,
    isSupportedFavourites: false,
    favouriteList: [],
    recentList: [],
    onAddFavourite: (value: Favourite) => { },
    onUpdateFavourite: (value: Favourite) => { return Promise.resolve([]) },
    onAddRecent: (value: Favourite) => { },
    onRemoveFavourite: (value: Favourite) => { },
    onRemoveRecent: (value: Favourite) => { },
    onReorderFavourite: (from: number, to: number) => { },
    onRefreshFavourites: () => { }
});

interface IProps {
    children: ReactNode
}

// TODO: do it with a custom converter of json2typescript.
function deserialize(itemJson: any): Favourite {
    return itemJson.type === "stop" ? Util.deserialize(itemJson, FavouriteStop) :
        itemJson.type === "trip" ? Util.deserialize(itemJson, FavouriteTrip) :
            Util.deserialize(itemJson, FavouriteLocation);  // Home and work favs falls under FavouriteLocation.
}

const eventEmitter: EventEmitter = new EventEmitter();
function fireChangeEvent(update: Favourite[]) {
    staticFavouriteData.values = update;
    eventEmitter.emit('change', update);
}
export const staticFavouriteData: { values: Favourite[], addChangeListener: (callback: (update: Favourite[]) => void) => EventSubscription } = {
    values: [],
    addChangeListener(callback) {
        return eventEmitter.addListener('change', callback);
    }
};

const TKFavouritesProvider: React.FunctionComponent<IProps> = (props: IProps) => {
    const { children } = props;
    const { accountsSupported, status } = useContext(TKAccountContext);   // Notice this will just provide empty context if accounts is not supported.
    function isSupportedDefault({ signInStatus }: { signInStatus: SignInStatus }) {
        return signInStatus === SignInStatus.signedIn;
    }
    const [isLoading, setIsLoading] = useState<boolean>(true);  // May want to distinguish other statuses, as: UNSUPPORTED, REFRESHING, LOADING, AVAILABLE
    const [isSupported, setIsSupported] = useState<boolean>(isSupportedDefault({ signInStatus: status }));
    const [favourites, setFavourites] = useState<Favourite[]>([]);
    const [recents, setRecents] = useState<Favourite[]>(FavouritesData.recInstance.get());
    useEffect(() => {
        // if (process.env.NODE_ENV === "development") {   // TODO: remove
        refreshFavourites();
        // }
        const isSupportedFavourites = isSupportedDefault({ signInStatus: status });
        setIsSupported(isSupportedFavourites);
        let refreshInterval
        if (isSupportedFavourites) {
            refreshInterval = setInterval(() => refreshFavourites({ silent: true }), 24 * 60 * 60 * 1000);   // Once a day.
        }
        return () => {
            if (refreshInterval) {
                clearTimeout(refreshInterval);
            }
        }
    }, [status]);

    useEffect(() => {
        fireChangeEvent(favourites);
    }, [favourites])

    async function refreshFavourites({ silent, refreshStops }: { silent?: boolean, refreshStops?: boolean } = {}) {
        if (!silent) {
            setIsLoading(true);
            setFavourites([]);
        }
        if (status === SignInStatus.signedIn) {
            let favouritesResult: Favourite[];
            try {
                const data = await TripGoApi.apiCall("/data/user/favorite", "GET");
                favouritesResult = data.result?.map(favJson => deserialize(favJson)) ?? [];   // Since if no favourites result property doesn't come. TODO: re-check
                favouritesResult.sort((a, b) => a.order - b.order);
                setFavourites(favouritesResult);
                setIsLoading(false);
            } catch (e) {
                console.log(e);
                favouritesResult = [];
            }
            await Promise.all(favouritesResult.map(async fav => {
                if (!(fav instanceof FavouriteStop)) return;
                if (fav.stop && !refreshStops) return;
                try {
                    const { stop: stopJson } = await TripGoApi.fetchAPI(
                        TripGoApi.getSatappUrl("locationInfo.json") + `?identifier=pt_pub|${fav.region}|${fav.stopCode}&region=${fav.region}`,
                        {
                            method: "GET",
                            tkcache: true,
                            cacheRefreshCallback: (response: any) => {
                                fav.stop = Util.deserialize(response.stop, StopLocation);
                                setFavourites((favourites) => [...favourites]);
                            },
                            headers: {
                                "x-fetch-policy": refreshStops ? "cache-and-network" : "cache-first",
                                "x-cache-control": `max-age=${24 * 60 * 60}`,
                                "x-date": new Date().toUTCString()
                            }
                        }
                    );
                    if (stopJson) {
                        fav.stop = Util.deserialize(stopJson, StopLocation);
                        setFavourites(favourites => [...favourites]); // Update each fav stop immediatly when the request arrives, so those that hit caché are displayed immediatly in the UI.
                    }
                    return;
                } catch (error) {
                    console.log(error);
                    return;
                }
            }));
            setFavourites([...favouritesResult]);   // No longer necessary given setFavourites(favourites => [...favourites]) above.            
        } else {
            setFavourites([]);
        }
    }

    async function addFavouriteHandler(value: Favourite): Promise<Favourite[]> {
        value.order = favourites.length;
        value.uuid = uuidv4();
        const addedFav = deserialize(await TripGoApi.apiCall("/data/user/favorite", "POST", Util.serialize(value)));
        // Add value instead of addedFav since it has the stop, for FavouriteStop/s.
        // TODO: consider calling fetching stops for favourites, to cache locationInfo request.
        const update = [...favourites, value];
        setFavourites(update);
        return update;
    }

    async function updateFavouriteHandler(value: Favourite): Promise<Favourite[]> {
        const addedFav = deserialize(await TripGoApi.apiCall(`/data/user/favorite/${value.uuid}`, "PUT", Util.serialize(value)));
        const favouritesUpdate = [...favourites];
        // Add value instead of addedFav since it has the stop, for FavouriteStop/s.
        // TODO: consider calling fetching stops for favourites, to cache locationInfo request.
        favouritesUpdate.splice(favourites.findIndex(fav => fav.uuid === value.uuid), 1, value);
        setFavourites(favouritesUpdate);
        return favouritesUpdate;
    }

    async function removeFavouriteHandler(value: Favourite): Promise<Favourite[]> {
        console.assert(favourites.indexOf(value) !== -1);
        await TripGoApi.apiCall(`/data/user/favorite/${value.uuid}`, "DELETE");
        const updatedFavourites = [...favourites];
        updatedFavourites.splice(favourites.indexOf(value), 1);
        setFavourites(updatedFavourites);
        return updatedFavourites;
    }

    function reorderFavouriteHandler(from: number, to: number) {
        const reordered = moveFromTo([...favourites], from, to);
        reordered.forEach((fav, i) => {
            const update = fav.order !== i;
            fav.order = i;
            if (update) {
                TripGoApi.apiCall(`/data/user/favorite/${fav.uuid}`, "PUT", Util.serialize(fav));
            }
        });
        setFavourites(reordered);
    }

    useEffect(() => {
        // In case favourites are changed directly through FavouritesData. In the future probably the provider should be
        // the only way to update options, so next line will no longer be needed.
        // FavouritesData.instance.addChangeListener(setFavourites);        
        FavouritesData.recInstance.addChangeListener(setRecents);
    }, []);

    return (
        <TKFavouritesContext.Provider
            value={{
                isLoadingFavourites: isLoading,
                isSupportedFavourites: isSupported,
                favouriteList: favourites,
                recentList: recents,
                onAddFavourite: addFavouriteHandler,
                onUpdateFavourite: updateFavouriteHandler,
                onAddRecent: (value: Favourite) => { FavouritesData.recInstance.add(value) },
                onRemoveFavourite: removeFavouriteHandler,
                onRemoveRecent: (value: Favourite) => { FavouritesData.recInstance.remove(value) },
                onReorderFavourite: reorderFavouriteHandler,
                onRefreshFavourites: refreshFavourites
            }}>
            {children}
        </TKFavouritesContext.Provider>
    );
}

export default TKFavouritesProvider;