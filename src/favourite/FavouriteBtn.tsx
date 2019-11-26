import * as React from "react";
import "./FavouriteBtn.css"
import FavouritesData from "../data/FavouritesData";
import {ReactComponent as IconAdd} from "../images/ic-star-outline.svg";
import {ReactComponent as IconRemove} from "../images/ic-star-filled.svg";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import OptionsData from "../data/OptionsData";
import Options from "../model/Options";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";

interface IProps {
    favourite?: FavouriteTrip;
}

class FavouriteBtn extends React.Component<IProps, {}> {

    constructor(props: IProps) {
        super(props);
    }

    public render(): React.ReactNode {
        const exists = this.props.favourite && FavouritesData.instance.has(this.props.favourite);
        return (
            this.props.favourite ?
                <button className="FavouriteBtn-main gl-link gl-flex gl-align-center"
                        aria-label={"Add to favourites"}
                        aria-pressed={exists}
                        onClick={() => {
                            if (!this.props.favourite) {
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

const Connector: React.SFC<{children: (props: Partial<IProps>) => React.ReactNode}> = (props: {children: (props: Partial<IProps>) => React.ReactNode}) => {
    return (
        <RoutingResultsContext.Consumer>
            {(routingContext: IRoutingResultsContext) => {
                const favourite = routingContext.query.isComplete() ?
                    FavouriteTrip.create(routingContext.query.from!, routingContext.query.to!) : undefined;
                return props.children!({
                    favourite
                });
            }}
        </RoutingResultsContext.Consumer>
    );
};

export const TKUIFavQueryBtn = (props: {}) =>
    <Connector>
        {(cProps: Partial<IProps>) => <FavouriteBtn {...props} {...cProps}/>}
    </Connector>;

export default FavouriteBtn;