import * as React from "react";
import { ReactComponent as IconAdd } from "../images/ic-favorite-outline.svg";
import { ReactComponent as IconRemove } from "../images/ic-favorite.svg";
import OptionsData from "../data/OptionsData";
import FavouritesData from "../data/FavouritesData";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import TKUIButton, { TKUIButtonProps, TKUIButtonType } from "../buttons/TKUIButton";
import Favourite from "../model/favourite/Favourite";
import TKUserProfile from "../model/options/TKUserProfile";
import { TKI18nContextProps, TKI18nContext } from "../i18n/TKI18nProvider";
import { black, colorWithOpacity, TKUITheme } from "../jss/TKUITheme";
import { overrideClass } from "../jss/StyleHelper";
import { TKFavouritesContext } from "./TKFavouritesProvider";

interface IProps {
    favourite: Favourite;
    vertical?: boolean;
}

const TKUIFavouriteAction: React.FunctionComponent<IProps> = (props) => {

    const { favourite, vertical } = props;
    const { favouriteList, onAddFavourite, onRemoveFavourite } = React.useContext(TKFavouritesContext);

    function exists(): boolean {
        return favouriteList.some(fav => fav.equals(favourite));
    }

    function renderIcon(): JSX.Element {
        return exists() ? <IconRemove /> : <IconAdd />;
    }

    function onClick() {
        if (exists()) {
            onRemoveFavourite(favourite);
        } else {
            if (favourite instanceof FavouriteTrip) {
                favourite.options = Object.assign(new TKUserProfile(),
                    FavouritesData.getFavOptionsPart(OptionsData.instance.get()));
            }
            onAddFavourite(favourite);
        }
    }

    return <TKI18nContext.Consumer>
        {(i18nProps: TKI18nContextProps) =>
            <TKUIButton
                type={vertical ? TKUIButtonType.SECONDARY_VERTICAL : TKUIButtonType.SECONDARY}
                icon={renderIcon()}
                text={exists() ? i18nProps.t("Remove.from.favourites") : i18nProps.t("Add.to.favourites")}
                styles={(theme: TKUITheme) => ({
                    main: overrideClass({
                        minWidth: '90px'
                    }),
                    // Needed to do this until get working dynamic style refreshes (see StyleHelper.onRefreshStyles doc).
                    secondary: defaultStyle => ({
                        ...defaultStyle,
                        background: (props: TKUIButtonProps) => {
                            const exists = props.text === i18nProps.t("Remove.from.favourites");
                            return exists ? colorWithOpacity(theme.colorPrimary, .08) : 'none';
                        },
                        border: (props: TKUIButtonProps) => {
                            const exists = props.text === i18nProps.t("Remove.from.favourites");
                            return exists ? '2px solid ' + theme.colorPrimary : '2px solid ' + black(4, theme.isDark);
                        },
                        '& svg': {
                            color: (props: TKUIButtonProps) => {
                                const exists = props.text === i18nProps.t("Remove.from.favourites");
                                return exists ? theme.colorPrimary : black(1, theme.isDark);
                            },
                        },
                        '&:hover': {
                            ...defaultStyle['&:hover'] as any,  // Workaround until I support override (overrideClass / default => OverrideObject) of 2nd level styles.
                            borderColor: (props: TKUIButtonProps) => {
                                const exists = props.text === i18nProps.t("Remove.from.favourites");
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
                aria-pressed={exists()}
            />
        }
    </TKI18nContext.Consumer>
}

export default TKUIFavouriteAction;