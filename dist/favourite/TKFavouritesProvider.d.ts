import * as React from "react";
import Favourite from "../model/favourite/Favourite";
export interface IFavouritesContext {
    favouriteList: Favourite[];
    recentList: Favourite[];
    onAddFavourite: (value: Favourite) => void;
    onAddRecent: (value: Favourite) => void;
    onRemoveFavourite: (value: Favourite) => void;
    onRemoveRecent: (value: Favourite) => void;
}
export declare const TKFavouritesContext: React.Context<IFavouritesContext>;
interface IState {
    favouriteList: Favourite[];
    recentList: Favourite[];
}
declare class TKFavouritesProvider extends React.Component<{}, IState> {
    constructor(props: {});
    render(): React.ReactNode;
}
export default TKFavouritesProvider;
