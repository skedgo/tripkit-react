import * as React from "react";
import "./FavouriteBtn.css"
import FavouritesData from "../data/FavouritesData";
import IconAdd from "-!svg-react-loader!../images/ic-star-outline.svg";
import IconRemove from "-!svg-react-loader!../images/ic-star-filled.svg";
import FavouriteTrip from "../model/FavouriteTrip";
import OptionsData from "../data/OptionsData";
import Options from "../model/Options";

interface IProps {
    favourite: FavouriteTrip | null;
}

class FavouriteBtn extends React.Component<IProps, {}> {

    constructor(props: IProps) {
        super(props);
    }

    public render(): React.ReactNode {
        const exists = this.props.favourite !== null && FavouritesData.instance.has(this.props.favourite);
        return (
            this.props.favourite !== null ?
                <button className="FavouriteBtn-main gl-link gl-flex gl-align-center"
                        aria-label={"Add to favourites"}
                        aria-pressed={exists}
                        onClick={() => {
                            if (this.props.favourite === null) {
                                return;
                            }
                            if (exists) {
                                FavouritesData.instance.remove(this.props.favourite);
                            } else {
                                this.props.favourite.options = Object.assign(new Options(),
                                    FavouritesData.getFavOptionsPart(OptionsData.instance.get()));
                                FavouritesData.instance.add(this.props.favourite);
                            }
                        }}>
                    {exists ?
                        <IconRemove className="FavouriteBtn-iconStar FavouriteBtn-iconStar-remove" aria-hidden={true}
                                    focusable="false"/> :
                        <IconAdd className="FavouriteBtn-iconStar FavouriteBtn-iconStar-add" aria-hidden={true}
                                 focusable="false"/>}
                    {exists ? "Remove favourite" : "Add to favourites"}
                </button>
                :
                null
        )
    }


    public componentDidMount(): void {
        FavouritesData.instance.addChangeListener(() => this.forceUpdate());
    }
}

export default FavouriteBtn;