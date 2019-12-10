import * as React from "react";
import Favourite from "../model/favourite/Favourite";
import FavouritesData from "../data/FavouritesData";

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
    onAddFavourite: (value: Favourite) => {},
    onAddRecent: (value: Favourite) => {},
    onRemoveFavourite: (value: Favourite) => {},
    onRemoveRecent: (value: Favourite) => {}
});

interface IState {
    favouriteList: Favourite[];
    recentList: Favourite[];
}

class TKFavouritesProvider extends React.Component<{}, IState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            favouriteList: FavouritesData.instance.get(),
            recentList: FavouritesData.recInstance.get()
        };
        // In case favourites are changed directly through FavouritesData. In the future probably the provider should be
        // the only way to update options, so next line will no longer be needed.
        FavouritesData.instance.addChangeListener((update: Favourite[]) => this.setState({favouriteList: update}));
        FavouritesData.recInstance.addChangeListener((update: Favourite[]) => this.setState({recentList: update}));
    }

    public render(): React.ReactNode {
        return (
            <TKFavouritesContext.Provider
                value={{
                    favouriteList: this.state.favouriteList,
                    recentList: this.state.recentList,
                    onAddFavourite: (value: Favourite) => {FavouritesData.instance.add(value)},
                    onAddRecent: (value: Favourite) => {FavouritesData.recInstance.add(value)},
                    onRemoveFavourite: (value: Favourite) => {FavouritesData.instance.remove(value)},
                    onRemoveRecent: (value: Favourite) => {FavouritesData.recInstance.remove(value)}
                }}>
                {this.props.children}
            </TKFavouritesContext.Provider>
        );
    }
}

export default TKFavouritesProvider;