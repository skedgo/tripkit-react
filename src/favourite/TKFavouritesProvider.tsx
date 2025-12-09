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
    onAddFavourite: (value: Favourite) => Promise<Favourite[]>;
    onUpdateFavourite: (value: Favourite) => Promise<Favourite[]>;
    onRemoveFavourite: (value: Favourite) => Promise<Favourite[]>;
    onReorderFavourite: (from: number, to: number) => void;
    onAddRecent: (value: Favourite) => void;
    onRemoveRecent: (value: Favourite) => void;
    onRefreshFavourites?: (props?: { silent?: boolean, shouldRefreshStops?: boolean }) => void;
}

export const TKFavouritesContext = React.createContext<IFavouritesContext>({
    isLoadingFavourites: false,
    isSupportedFavourites: false,
    favouriteList: [],
    recentList: [],
    onAddFavourite: (value: Favourite) => { return Promise.resolve([]) },
    onUpdateFavourite: (value: Favourite) => { return Promise.resolve([]) },
    onAddRecent: (value: Favourite) => { },
    onRemoveFavourite: (value: Favourite) => { return Promise.resolve([]) },
    onRemoveRecent: (value: Favourite) => { },
    onReorderFavourite: (from: number, to: number) => { }
});

interface IProps {
    children: ReactNode
}

// TODO: do it with a custom converter of json2typescript.
export function deserialize(itemJson: any): Favourite {
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

/**
 * Determines where favourites are stored.
 * - "local": only locally, on browser's local storage.
 * - "cloud": only on cloud, requiring user to be signed in.
 * - "local-and-cloud": local when user is not signed in, cloud when user is signed in.
 *    And on sign in, if no favorites in the cloud, migrates local favourites to the cloud.
 */
export type StorageType = "local" | "cloud" | "local-and-cloud";

// TODO: move this to TKUIConfig
let staticStorageType: StorageType | undefined = undefined; // To force this from outside.
export function setFavouritesStorageType(type: StorageType) {
    staticStorageType = type;
}

const TKFavouritesProvider: React.FunctionComponent<IProps> = (props: IProps) => {
    const { children } = props;
    const { accountsSupported, status } = useContext(TKAccountContext);   // Notice this will just provide empty context if accounts is not supported.
    function isSupportedDefault({ signInStatus }: { signInStatus: SignInStatus }) {
        return accountsSupported ? (storageType === 'cloud' ? signInStatus === SignInStatus.signedIn : true) : storageType === 'local';
    }
    const storageType: StorageType = staticStorageType ?? (accountsSupported ? "cloud" : "local");
    const [isLoading, setIsLoading] = useState<boolean>(storageType === "local" ? false : true);
    const [isSupported, setIsSupported] = useState<boolean>(isSupportedDefault({ signInStatus: status }));
    const isCurrentlyLocal = storageType === "local" || storageType === "local-and-cloud" && status !== SignInStatus.signedIn;
    const [favourites, setFavourites] = useState<Favourite[]>(isCurrentlyLocal ? FavouritesData.instance.get() : []);
    const [recents, setRecents] = useState<Favourite[]>(FavouritesData.recInstance.get());
    useEffect(() => {
        if (status === SignInStatus.signedOut) {
            setIsLoading(false);
        }
        if (isCurrentlyLocal) {
            return;
        }
        refreshFavourites({ justSignedIn: status === SignInStatus.signedIn });
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

    async function refreshFavourites({ silent, shouldRefreshStops, justSignedIn }: { silent?: boolean, shouldRefreshStops?: boolean, justSignedIn?: boolean } = {}) {
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
            await fetchStops(favouritesResult, shouldRefreshStops);
            setFavourites([...favouritesResult]);   // No longer necessary given setFavourites(favourites => [...favourites]) above.

            // If just signed in and no favourites, try to migrate local favourites.
            if (justSignedIn && favouritesResult.length === 0) {
                const localFavourites = FavouritesData.instance.get();
                if (localFavourites.length > 0) {
                    setIsLoading(true);
                    await Promise.all(localFavourites.map(async localFav => {
                        try {
                            await TripGoApi.apiCall("/data/user/favorite", "POST", Util.serialize(localFav));
                            FavouritesData.instance.remove(localFav);
                        } catch (e) {
                            console.log("Failed to migrate local favourite:", localFav);
                        }
                    }));
                    refreshFavourites();
                }
            }
        } else {
            setFavourites([]);
        }
    }

    async function fetchStops(favouritesResult: Favourite[], shouldRefreshStops: boolean | undefined) {
        await Promise.all(favouritesResult.map(async (fav) => {
            if (!(fav instanceof FavouriteStop)) return;
            if (fav.stop && !shouldRefreshStops) return;
            try {
                const stopId = `pt_pub|${fav.region}|${fav.stopCode}`;
                const { stop: stopJson } = await TripGoApi.fetchAPI(
                    TripGoApi.getSatappUrl("locationInfo.json") + `?identifier=${encodeURIComponent(stopId)}&region=${fav.region}`,
                    {
                        method: "GET",
                        tkcache: true,
                        cacheRefreshCallback: (response: any) => {
                            fav.stop = Util.deserialize(response.stop, StopLocation);
                            setFavourites((favourites) => [...favourites]);
                        },
                        headers: {
                            "x-fetch-policy": shouldRefreshStops ? "cache-and-network" : "cache-first",
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
    }

    async function addFavouriteHandler(value: Favourite): Promise<Favourite[]> {
        value.order = favourites.length;
        value.uuid = uuidv4();
        if (isCurrentlyLocal) {
            FavouritesData.instance.add(value);
            const update = FavouritesData.instance.get();
            setFavourites(update);
            return Promise.resolve(update);
        }
        const addedFav = deserialize(await TripGoApi.apiCall("/data/user/favorite", "POST", Util.serialize(value)));
        // Add value instead of addedFav since it has the stop, for FavouriteStop/s.
        // TODO: consider calling fetching stops for favourites, to cache locationInfo request.
        const update = [...favourites, value];
        setFavourites(update);
        return update;
    }

    async function updateFavouriteHandler(value: Favourite): Promise<Favourite[]> {
        if (isCurrentlyLocal) {
            const favouritesUpdate = [...favourites];
            favouritesUpdate.splice(favourites.findIndex(fav => fav.uuid === value.uuid), 1, value);
            FavouritesData.instance.save(favouritesUpdate);
            const update = FavouritesData.instance.get();
            setFavourites(update);
            return Promise.resolve(update);
        }
        const addedFav = deserialize(await TripGoApi.apiCall(`/data/user/favorite/${value.uuid}`, "PUT", Util.serialize(value)));
        const favouritesUpdate = [...favourites];
        // Add value instead of addedFav since it has the stop, for FavouriteStop/s.
        // TODO: consider calling fetching stops for favourites, to cache locationInfo request.
        favouritesUpdate.splice(favourites.findIndex(fav => fav.uuid === value.uuid), 1, value);
        setFavourites(favouritesUpdate);
        return favouritesUpdate;
    }

    async function removeFavouriteHandler(value: Favourite): Promise<Favourite[]> {
        if (isCurrentlyLocal) {
            FavouritesData.instance.remove(value);
            const update = FavouritesData.instance.get();
            setFavourites(update);
            return Promise.resolve(update);
        }
        console.assert(favourites.indexOf(value) !== -1);
        await TripGoApi.apiCall(`/data/user/favorite/${value.uuid}`, "DELETE");
        const updatedFavourites = [...favourites];
        updatedFavourites.splice(favourites.indexOf(value), 1);
        setFavourites(updatedFavourites);
        return updatedFavourites;
    }

    function reorderFavouriteHandler(from: number, to: number) {
        const reordered = moveFromTo([...favourites], from, to);
        if (isCurrentlyLocal) {
            reordered.forEach((fav, i) => fav.order = i);
            FavouritesData.instance.save(reordered);
            setFavourites(reordered);
            return;
        }
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
        if (isCurrentlyLocal) {
            //     FavouritesData.instance.addChangeListener(setFavourites);
            fetchStops(favourites, true);
        }
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
                onRefreshFavourites: isCurrentlyLocal ? undefined : refreshFavourites
            }}>
            {children}
        </TKFavouritesContext.Provider>
    );
}

export default TKFavouritesProvider;