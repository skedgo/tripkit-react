import * as React from "react";
import { ReactComponent as IconAdd } from "../images/ic-favorite-outline.svg";
import { ReactComponent as IconRemove } from "../images/ic-favorite.svg";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import TKUIButton, { TKUIButtonProps, TKUIButtonType } from "../buttons/TKUIButton";
import Favourite from "../model/favourite/Favourite";
import { TKI18nContext } from "../i18n/TKI18nProvider";
import { black, colorWithOpacity, TKUITheme } from "../jss/TKUITheme";
import { overrideClass, TKUIWithClasses, withStyles } from "../jss/StyleHelper";
import { TKFavouritesContext } from "./TKFavouritesProvider";
import FavouriteStop from "../model/favourite/FavouriteStop";
import FavouriteLocation from "../model/favourite/FavouriteLocation";
import Util from "../util/Util";
import { keyFramesStyles } from "../css/GenStyle.css";

interface IProps extends TKUIWithClasses<IStyle, IProps> {
    favourite: Favourite;
    vertical?: boolean;
}

type IStyle = ReturnType<typeof tKUIFavouriteActionJss>;

const tKUIFavouriteActionJss = (theme: TKUITheme) => ({
    loadingFav: {
        '& button > div': {
            color: 'transparent',
            background: `linear-gradient(100deg, ${colorWithOpacity(theme.colorPrimary, .10)} 30%, ${colorWithOpacity(theme.colorPrimary, .40)} 50%, ${colorWithOpacity(theme.colorPrimary, .10)} 70%)`,
            backgroundSize: '400%',
            animation: keyFramesStyles.keyframes.loadingFavourite + ' 1.2s ease-in-out infinite'
        }
    }
});

const TKUIFavouriteAction: React.FunctionComponent<IProps> = (props) => {

    const { favourite, vertical, classes } = props;
    const { favouriteList, onAddFavourite, onRemoveFavourite } = React.useContext(TKFavouritesContext);
    const [isWaiting, setIsWaiting] = React.useState<boolean>(false);
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
                return Util.deepEqualJSON(favourite.pattern, (fav as FavouriteTrip).pattern);
            }
        }) ?? false;
    }

    function renderIcon(): JSX.Element {
        return exists() ? <IconRemove /> : <IconAdd />;
    }

    async function onClick() {
        const existingFav = exists();
        setIsWaiting(true);
        if (existingFav) {
            await onRemoveFavourite(existingFav);
        } else {
            await onAddFavourite(favourite);
        }
        setIsWaiting(false);
    }

    return (
        <div className={isWaiting ? classes.loadingFav : undefined}>
            <TKUIButton
                type={vertical ? TKUIButtonType.SECONDARY_VERTICAL : TKUIButtonType.SECONDARY}
                icon={renderIcon()}
                text={exists() ? t("Remove.from.favourites") : t("Add.to.favourites")}
                styles={(theme: TKUITheme) => ({
                    main: overrideClass({
                        minWidth: '90px',
                        // ...loadingFav
                    }),
                    // Needed to do this until get working dynamic style refreshes (see StyleHelper.onRefreshStyles doc).
                    secondary: defaultStyle => ({
                        ...defaultStyle,
                        background: (props: TKUIButtonProps) => {
                            if (isWaiting) {
                                return `linear-gradient(100deg, ${colorWithOpacity(theme.colorPrimary, .10)} 30%, ${colorWithOpacity(theme.colorPrimary, .20)} 50%, ${colorWithOpacity(theme.colorPrimary, .10)} 70%)`;
                            }
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
                            ...defaultStyle['&:hover'] as any, // Workaround until I support override (overrideClass / default => OverrideObject) of 2nd level styles.
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
        </div>
    );
}

export default withStyles(TKUIFavouriteAction, tKUIFavouriteActionJss);