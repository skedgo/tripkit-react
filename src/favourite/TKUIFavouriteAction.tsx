import * as React from "react";
import { ReactComponent as IconAdd } from "../images/ic-favorite-outline.svg";
import { ReactComponent as IconRemove } from "../images/ic-favorite.svg";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import TKUIButton, { TKUIButtonProps, TKUIButtonType } from "../buttons/TKUIButton";
import Favourite from "../model/favourite/Favourite";
import { TKI18nContext } from "../i18n/TKI18nProvider";
import { black, colorWithOpacity, TKUITheme } from "../jss/TKUITheme";
import { overrideClass } from "../jss/StyleHelper";
import { TKFavouritesContext } from "./TKFavouritesProvider";
import FavouriteStop from "../model/favourite/FavouriteStop";
import FavouriteLocation from "../model/favourite/FavouriteLocation";

interface IProps {
    favourite: Favourite;
    vertical?: boolean;
}

const TKUIFavouriteAction: React.FunctionComponent<IProps> = (props) => {

    const { favourite, vertical } = props;
    const { favouriteList, onAddFavourite, onRemoveFavourite } = React.useContext(TKFavouritesContext);
    const { t } = React.useContext(TKI18nContext);

    function exists(): Favourite | false {
        return favouriteList.find(fav => {
            if (favourite.type !== fav.type) {
                return false;
            }
            if (favourite instanceof FavouriteStop) {
                return favourite.stopCode === (fav as FavouriteStop).stopCode;
            }
            if (favourite instanceof FavouriteLocation) {
                return favourite.location.getKey() === (fav as FavouriteLocation).location.getKey();
            }
            if (favourite instanceof FavouriteTrip) {
                // TODO
                return false;
            }
        }) ?? false;
    }

    function renderIcon(): JSX.Element {
        return exists() ? <IconRemove /> : <IconAdd />;
    }

    function onClick() {
        const existingFav = exists();
        if (existingFav) {
            onRemoveFavourite(existingFav);
        } else {
            onAddFavourite(favourite);
        }
    }

    return (
        <TKUIButton
            type={vertical ? TKUIButtonType.SECONDARY_VERTICAL : TKUIButtonType.SECONDARY}
            icon={renderIcon()}
            text={exists() ? t("Remove.from.favourites") : t("Add.to.favourites")}
            styles={(theme: TKUITheme) => ({
                main: overrideClass({
                    minWidth: '90px'
                }),
                // Needed to do this until get working dynamic style refreshes (see StyleHelper.onRefreshStyles doc).
                secondary: defaultStyle => ({
                    ...defaultStyle,
                    background: (props: TKUIButtonProps) => {
                        const exists = props.text === t("Remove.from.favourites");
                        return exists ? colorWithOpacity(theme.colorPrimary, .08) : 'none';
                    },
                    border: (props: TKUIButtonProps) => {
                        const exists = props.text === t("Remove.from.favourites");
                        return exists ? '2px solid ' + theme.colorPrimary : '2px solid ' + black(4, theme.isDark);
                    },
                    '& svg': {
                        color: (props: TKUIButtonProps) => {
                            const exists = props.text === t("Remove.from.favourites");
                            return exists ? theme.colorPrimary : black(1, theme.isDark);
                        },
                    },
                    '&:hover': {
                        ...defaultStyle['&:hover'] as any,  // Workaround until I support override (overrideClass / default => OverrideObject) of 2nd level styles.
                        borderColor: (props: TKUIButtonProps) => {
                            const exists = props.text === t("Remove.from.favourites");
                            return exists ? colorWithOpacity(theme.colorPrimary, .3) : black(2, theme.isDark);
                        }
                    },
                    // '&:active': {
                    //     borderColor: colorWithOpacity(theme.colorPrimary, .12),
                    //     backgroundColor: colorWithOpacity(theme.colorPrimary, .08)
                    // }
                })
            })}
            onClick={onClick}
            role={"button"}
            aria-pressed={!!exists()}
        />
    );
}

export default TKUIFavouriteAction;