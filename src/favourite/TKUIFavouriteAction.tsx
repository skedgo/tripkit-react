import * as React from "react";
import {ReactComponent as IconAdd} from "../images/ic-favorite-outline.svg";
import {ReactComponent as IconRemove} from "../images/ic-favorite.svg";
import {Observable} from "rxjs";
import OptionsData from "../data/OptionsData";
import FavouritesData from "../data/FavouritesData";
import Options from "../model/Options";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import Favourite from "../model/favourite/Favourite";
import * as CSS from 'csstype';

interface IProps {
    favourite: Favourite;
    vertical?: boolean;
    style?: CSS.Properties;
}

class TKUIFavouriteAction extends React.Component<IProps, {}> {

    constructor(props: IProps) {
        super(props);
        FavouritesData.instance.addChangeListener(() => this.forceUpdate());
        this.onClick = this.onClick.bind(this);
    }

    private getTitle(): string {
        return this.exists() ? "Un-favourite" : "Favourite";
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
                favourite.options = Object.assign(new Options(),
                    FavouritesData.getFavOptionsPart(OptionsData.instance.get()));
            }
            FavouritesData.instance.add(favourite);
        }
    }

    get render(): () => JSX.Element {
        return () => <TKUIButton
            type={this.props.vertical ? TKUIButtonType.SECONDARY_VERTICAL : TKUIButtonType.SECONDARY}
            icon={this.renderIcon()}
            text={this.getTitle()}
            style={{minWidth: '90px', ...this.props.style}}
            onClick={this.onClick}
        />
    }

    private exists(): boolean {
        return FavouritesData.instance.has(this.props.favourite);
    }
}

export default TKUIFavouriteAction;