import * as React from "react";
import {ReactComponent as IconAdd} from "../images/ic-favorite-outline.svg";
import {ReactComponent as IconRemove} from "../images/ic-favorite.svg";
import OptionsData from "../data/OptionsData";
import FavouritesData from "../data/FavouritesData";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import Favourite from "../model/favourite/Favourite";
import TKUserProfile from "../model/options/TKUserProfile";
import {TKI18nContextProps, TKI18nContext} from "../i18n/TKI18nProvider";
import {colorWithOpacity, TKUITheme} from "../jss/TKUITheme";
import {overrideClass} from "../jss/StyleHelper";

interface IProps {
    favourite: Favourite;
    vertical?: boolean;
}

class TKUIFavouriteAction extends React.Component<IProps, {}> {

    constructor(props: IProps) {
        super(props);
        FavouritesData.instance.addChangeListener(() => this.forceUpdate());
        this.onClick = this.onClick.bind(this);
    }

    private renderIcon(): JSX.Element {
        return this.exists() ? <IconRemove/> : <IconAdd/>;
    }

    private onClick() {
        const favourite = this.props.favourite;
        if (this.exists()) {
            FavouritesData.instance.remove(favourite);
        } else {
            if (favourite instanceof FavouriteTrip) {
                favourite.options = Object.assign(new TKUserProfile(),
                    FavouritesData.getFavOptionsPart(OptionsData.instance.get()));
            }
            FavouritesData.instance.add(favourite);
        }
    }

    public render(): JSX.Element {
        return <TKI18nContext.Consumer>
            {(i18nProps: TKI18nContextProps) =>
                <TKUIButton
                    type={this.props.vertical ? TKUIButtonType.SECONDARY_VERTICAL : TKUIButtonType.SECONDARY}
                    icon={this.renderIcon()}
                    text={this.exists() ? i18nProps.t("Remove.from.favourites") : i18nProps.t("Add.to.favourites")}
                    styles={(theme: TKUITheme) => ({
                        main: overrideClass({
                            minWidth: '90px'
                        }),
                        ...this.exists() && {
                            secondary: overrideClass({
                                background: colorWithOpacity(theme.colorPrimary, .08),
                                border: '2px solid ' + theme.colorPrimary,
                                '& svg': {
                                    color: theme.colorPrimary
                                },
                                '&:hover': {
                                    borderColor: colorWithOpacity(theme.colorPrimary, .3)
                                },
                                '&:active': {
                                    borderColor: colorWithOpacity(theme.colorPrimary, .12),
                                    backgroundColor: colorWithOpacity(theme.colorPrimary, .08)
                                }
                            })
                        }
                    })}
                    onClick={this.onClick}
                />
            }
        </TKI18nContext.Consumer>
    }

    private exists(): boolean {
        return FavouritesData.instance.has(this.props.favourite);
    }
}

export default TKUIFavouriteAction;