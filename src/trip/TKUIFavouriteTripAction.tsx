import * as React from "react";
import {ReactComponent as IconAdd} from "../images/ic-favorite-outline.svg";
import {ReactComponent as IconRemove} from "../images/ic-favorite.svg";
import {Observable} from "rxjs";
import OptionsData from "../data/OptionsData";
import FavouritesData from "../data/FavouritesData";
import Options from "../model/Options";
import FavouriteTrip from "../model/FavouriteTrip";
import TKUIAction from "../action/TKUIAction";
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";

class TKUIFavouriteTripAction implements TKUIAction {
    public handler: () => boolean;
    public actionUpdate: Observable<void>;

    private favourite: FavouriteTrip;
    private actionUpdateObserver?: any;

    constructor(favourite: FavouriteTrip) {
        this.favourite = favourite;
        this.handler = () => {
            if (this.exists()) {
                FavouritesData.instance.remove(this.favourite);
            } else {
                this.favourite.options = Object.assign(new Options(),
                    FavouritesData.getFavOptionsPart(OptionsData.instance.get()));
                FavouritesData.instance.add(this.favourite);
            }
            return true;
        };
        this.actionUpdate = new Observable<void>(subscriber => {
            this.actionUpdateObserver = subscriber;
        });
        FavouritesData.instance.addChangeListener(() => this.actionUpdateObserver && this.actionUpdateObserver.next());
    }

    get title(): string {
        return this.exists() ? "Un-favourite" : "Favourite";
    }

    get renderIcon(): () => JSX.Element {
        return this.exists() ? () => <IconRemove/> : () => <IconAdd/>;
    }

    get render(): () => JSX.Element {
        return () => <TKUIButton
            type={TKUIButtonType.SECONDARY_VERTICAL}
            icon={this.renderIcon()}
            text={this.title}
            style={{minWidth: '90px'}}
        />
    }

    private exists(): boolean {
        return FavouritesData.instance.has(this.favourite);
    }
}

export default TKUIFavouriteTripAction;