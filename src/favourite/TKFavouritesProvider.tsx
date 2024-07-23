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

export interface IFavouritesContext {
    favouriteList: Favourite[];
    recentList: Favourite[];
    onAddFavourite: (value: Favourite) => void;
    onUpdateFavourite: (value: Favourite) => void;
    onRemoveFavourite: (value: Favourite) => void;
    onReorderFavourite: (from: number, to: number) => void;
    onAddRecent: (value: Favourite) => void;
    onRemoveRecent: (value: Favourite) => void;
}

export const TKFavouritesContext = React.createContext<IFavouritesContext>({
    favouriteList: [],
    recentList: [],
    onAddFavourite: (value: Favourite) => { },
    onUpdateFavourite: (value: Favourite) => { },
    onAddRecent: (value: Favourite) => { },
    onRemoveFavourite: (value: Favourite) => { },
    onRemoveRecent: (value: Favourite) => { },
    onReorderFavourite: (from: number, to: number) => { }
});

interface IProps {
    children: ReactNode
}

// TODO: do it with a custom converter of json2typescript.
function deserialize(itemJson: any): Favourite {
    return itemJson.type === "stop" ? Util.deserialize(itemJson, FavouriteStop) :
        itemJson.type === "location" ? Util.deserialize(itemJson, FavouriteLocation) :
            Util.deserialize(itemJson, FavouriteTrip)
}

const TKFavouritesProvider: React.FunctionComponent<IProps> = (props: IProps) => {
    const { children } = props;
    const [isLoading, setIsLoading] = useState<boolean>(true);  // May want to distinguish other statuses, as: UNSUPPORTED, REFRESHING, LOADING, AVAILABLE
    const [favourites, setFavourites] = useState<Favourite[]>([]);
    const [recents, setRecents] = useState<Favourite[]>(FavouritesData.recInstance.get());
    const { accountsSupported, status } = useContext(TKAccountContext);   // Notice this will just provide empty context if accounts is not supported.    
    async function requestFavourites() {
        if (status === SignInStatus.signedIn) {
            const data = await TripGoApi.apiCall("/data/user/favorite", "GET");
            const favouritesResult = data.result?.map(favJson => deserialize(favJson)) ?? [];   // Since if no favourites result property doesn't come. TODO: re-check
            favouritesResult.sort((a, b) => a.order - b.order);
            setFavourites(favouritesResult);
            setIsLoading(false);
            await Promise.all(favouritesResult.map(async fav => {
                if (!(fav instanceof FavouriteStop)) return;
                try {
                    const { stop: stopJson } = await TripGoApi.apiCallUrl(TripGoApi.getSatappUrl("locationInfo.json") + `?identifier=pt_pub|${fav.region}|${fav.stopCode}&region=${fav.region}`, "GET", undefined, true);
                    fav.stop = Util.deserialize(stopJson, StopLocation);
                    return;
                } catch (error) {
                    console.log(error);
                    return;
                }
            }));
            setFavourites([...favouritesResult]);
        } else {
            setFavourites([]);
        }
    }
    useEffect(() => {
        requestFavourites();
    }, [status]);

    async function addFavouriteHandler(value: Favourite) {
        value.order = favourites.length;
        value.uuid = uuidv4();
        const addedFav = deserialize(await TripGoApi.apiCall("/data/user/favorite", "POST", Util.serialize(value)));
        setFavourites([...favourites, addedFav]);
    }

    async function updateFavouriteHandler(value: Favourite) {
        const addedFav = deserialize(await TripGoApi.apiCall(`/data/user/favorite/${value.uuid}`, "PUT", Util.serialize(value)));
        const favouritesUpdate = [...favourites];
        // Add value instead of addedFav since it has the stop, for FavouriteStop/s.
        // TODO: consider calling fetching stops for favourites, to cache locationInfo request.
        favouritesUpdate.splice(favourites.findIndex(fav => fav.uuid === value.uuid), 1, value);
        setFavourites(favouritesUpdate);
    }

    async function removeFavouriteHandler(value: Favourite) {
        console.assert(favourites.indexOf(value) !== -1);
        await TripGoApi.apiCall(`/data/user/favorite/${value.uuid}`, "DELETE");
        const updatedFavourites = [...favourites];
        updatedFavourites.splice(favourites.indexOf(value), 1);
        setFavourites(updatedFavourites);
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
                favouriteList: favourites,
                recentList: recents,
                onAddFavourite: addFavouriteHandler,
                onUpdateFavourite: updateFavouriteHandler,
                onAddRecent: (value: Favourite) => { FavouritesData.recInstance.add(value) },
                onRemoveFavourite: removeFavouriteHandler,
                onRemoveRecent: (value: Favourite) => { FavouritesData.recInstance.remove(value) },
                onReorderFavourite: reorderFavouriteHandler
            }}>
            {children}
        </TKFavouritesContext.Provider>
    );
}

export default TKFavouritesProvider;