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

export interface IFavouritesContext {
    favouriteList: Favourite[];
    recentList: Favourite[];
    onAddFavourite: (value: Favourite) => void;
    onAddRecent: (value: Favourite) => void;
    onRemoveFavourite: (value: Favourite) => void;
    onRemoveRecent: (value: Favourite) => void;
}

export const TKFavouritesContext = React.createContext<IFavouritesContext>({
    favouriteList: [],
    recentList: [],
    onAddFavourite: (value: Favourite) => { },
    onAddRecent: (value: Favourite) => { },
    onRemoveFavourite: (value: Favourite) => { },
    onRemoveRecent: (value: Favourite) => { }
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
    // const { userProfile } = useContext(OptionsContext);
    // console.log(userProfile.finishSignInStatusP);
    console.log(favourites);
    useEffect(() => {
        if (status === SignInStatus.signedIn) {
            TripGoApi.apiCall("/data/user/favorite", "GET").then((data) => {
                console.log(data);
                setFavourites(data.result.map(favJson => deserialize(favJson)));
                setIsLoading(false);
            });
        } else {
            setFavourites([]);
        }
    }, [status]);

    async function addFavouriteHandler(value: Favourite) {
        value.order = favourites.length;
        value.uuid = uuidv4();
        const addedFav = deserialize(await TripGoApi.apiCall("/data/user/favorite", "POST", Util.serialize(value)));
        setFavourites([...favourites, addedFav]);
    }

    async function removeFavouriteHandler(value: Favourite) {
        console.assert(favourites.indexOf(value) !== -1);
        await TripGoApi.apiCall(`/data/user/favorite/${value.uuid}`, "DELETE");
        const updatedFavourites = [...favourites];
        updatedFavourites.splice(favourites.indexOf(value), 1);
        setFavourites(updatedFavourites);
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
                onAddRecent: (value: Favourite) => { FavouritesData.recInstance.add(value) },
                onRemoveFavourite: removeFavouriteHandler,
                onRemoveRecent: (value: Favourite) => { FavouritesData.recInstance.remove(value) }
            }}>
            {children}
        </TKFavouritesContext.Provider>
    );
}

export default TKFavouritesProvider;