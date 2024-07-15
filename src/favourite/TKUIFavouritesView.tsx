import React, { FunctionComponent, useContext } from "react";
import { CSSProps, overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUIFavouritesViewDefaultStyle } from "./TKUIFavouritesView.css";
import Favourite from "../model/favourite/Favourite";
import { CardPresentation, default as TKUICard } from "../card/TKUICard";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKFavouritesContext } from "./TKFavouritesProvider";
import TKUIFavouriteRow from "./TKUIFavouriteRow";
import TKUIButton, { TKUIButtonType } from "../buttons/TKUIButton";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";

export interface IClientProps extends IConsumedProps, TKUIWithStyle<IStyle, IProps> {
    title?: string;
    onFavouriteClicked?: (item: Favourite) => void;
    onRequestClose?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
}

interface IConsumedProps {
    favouriteList: Favourite[];
    recentList: Favourite[];
    onRemoveFavourite: (value: Favourite) => void;
}

export interface IStyle {
    main: CSSProps<IProps>;
    subHeader: CSSProps<IProps>;
    editBtn: CSSProps<IProps>;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIFavouritesViewProps = IProps;
export type TKUIFavouritesViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIFavouritesView {...props} />,
    styles: tKUIFavouritesViewDefaultStyle,
    classNamePrefix: "TKUIFavouritesView"
};

// function filter: (favouriteList: Favourite[], recentList: Favourite[]) => {
//     // Sort favourites based on recent list:
//     // - filter (in) those recent that are also favourites.
//     const sortedFavs = recentList.filter((recent: Favourite) => favouriteList.find((fav: Favourite) => fav.equals(recent)));
//     // - append the remaining favourites
//     return sortedFavs.concat(favouriteList.filter((fav: Favourite) => !sortedFavs.find((sfav: Favourite) => sfav.equals(fav))));
// }

const TKUIFavouritesView: FunctionComponent<IProps> = (props) => {
    const { classes, t, slideUpOptions = {}, title = t("Favourites"), injectedStyles, onRequestClose, onFavouriteClicked, favouriteList, onRemoveFavourite } = props;
    const [editing, setEditing] = React.useState<boolean>(false);
    return (
        <TKUICard
            title={title}
            presentation={CardPresentation.SLIDE_UP}
            renderSubHeader={() =>
                <div className={classes.subHeader}>
                    <TKUIButton text={editing ? t("Done") : t("edit")}
                        onClick={() => setEditing(!editing)}
                        type={TKUIButtonType.PRIMARY_LINK}
                        styles={{
                            main: overrideClass(injectedStyles.editBtn)
                        }}
                    />
                </div>}
            onRequestClose={onRequestClose}
            slideUpOptions={slideUpOptions}
        >
            <div className={classes.main}>
                {favouriteList.map((item, i) =>
                    <TKUIFavouriteRow
                        value={item}
                        onClick={() => onFavouriteClicked?.(item)}
                        onRemove={editing ? () => onRemoveFavourite?.(item) : undefined}
                        key={i}
                    />)}
            </div>
        </TKUICard>
    );
}


const Consumer: React.FunctionComponent<{ children: (props: IConsumedProps) => React.ReactNode }> = (props) => {
    const { favouriteList, recentList, onRemoveFavourite } = useContext(TKFavouritesContext);
    return <>{props.children!({ favouriteList, recentList, onRemoveFavourite })}</>;
};

export default connect((config: TKUIConfig) => config.TKUIFavouritesView, config, mapperFromFunction((clientProps: IClientProps) => clientProps));

export const TKUIFavouritesViewHelpers = {
    TKStateProps: Consumer,
    useTKStateProps: () => { }   // Hook version of TKStateProps, not defined for now.
}