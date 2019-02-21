import * as React from "react";
import './FavouriteList.css';
import FavouriteTrip from "../model/FavouriteTrip";
import FavouriteRow from "./FavouriteRow";
import FavouritesData from "../data/FavouritesData";
import IconAddFav from "-!svg-react-loader!../images/ic-star-outline.svg";
import {EventSubscription} from "fbemitter";
import {FavouriteRowProps} from "./FavouriteRow";


interface IProps {
    recent?: boolean;
    title?: string;
    previewMax?: number;
    showMax?: number;
    hideWhenEmpty?: boolean;
    onValueClicked?: (value: FavouriteTrip) => void;
    className?: string;
    moreBtnClass?: string;
    renderFavourite?: <P extends FavouriteRowProps>(props: P) => JSX.Element;
}

interface IState {
    values: FavouriteTrip[];
    showAllClicked: boolean;
}

class FavouriteList extends React.Component<IProps, IState> {

    private data: FavouritesData;
    private favChangeSubscr: EventSubscription;
    private rowRefs: any[] = [];
    private focused: number = -1;

    constructor(props: IProps) {
        super(props);
        this.state = {
            values: [],
            showAllClicked: false
        };
        this.data = props.recent ? FavouritesData.recInstance : FavouritesData.instance;
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    private onKeyDown(e: any) {
        if (e.keyCode === 38 || e.keyCode === 40) {
            const nextIndex = this.nextIndex(this.focused, e.keyCode === 38);
            this.rowRefs[nextIndex].focus();
        }
    }

    private nextIndex(i: number, prev: boolean) {
        const displayN = this.getDisplayN();
        return (i + (prev ? -1 : 1) + displayN) % displayN;
    }

    public render(): React.ReactNode {
        const values = this.state.values;
        const showUpTo = this.getShowUpTo();
        const displayN = this.getDisplayN();
        const valueClickedHandler = this.props.onValueClicked;
        if (this.props.hideWhenEmpty && values.length === 0) {
            return null;
        }
        const renderFavourite = this.props.renderFavourite ? this.props.renderFavourite :
            <P extends FavouriteRowProps>(props: P) => {
                return <FavouriteRow {...props}/>
            };
        return (
            <div className={this.props.className}
                 tabIndex={this.props.title ? 0 : -1}
                 aria-label={this.props.title}
            >
                { this.props.title ?
                    <div className="FavouriteList-lastJourneyTitle gl-flex gl-justify-start gl-align-self-start">{this.props.title}</div> :
                    null
                }
                {
                    values.length === 0 ?
                        (!this.props.recent ?
                                <div className="FavouriteList-info-panel gl-flex gl-grow gl-align-center">
                                    <div className="FavouriteList-favourites-info">
                                        Use the Journey Planner to see your favourite journeys here, by clicking
                                        <IconAddFav className="gl-charSpace gl-charSpaceLeft" aria-hidden={true} focusable="false"/>
                                        to add to favourites.
                                    </div>
                                </div>
                                :
                                <div className="FavouriteList-info-panel gl-flex gl-grow gl-align-center">
                                    <div className="FavouriteList-favourites-info">
                                        Use the Journey Planner to see your recent journeys here.
                                    </div>
                                </div>
                        )
                        :
                        <div className="gl-flex gl-grow">
                            <div className="FavouriteList-container gl-flex gl-column gl-grow">
                                {this.state.values.slice(0, displayN).map(
                                    (favourite, i) => {
                                        return renderFavourite({
                                            key: favourite.getKey(),
                                            recent: this.props.recent,
                                            favourite: favourite,
                                            onClick: valueClickedHandler ? () => valueClickedHandler(favourite) : undefined,
                                            ref: (el: any) => this.rowRefs[i] = el,
                                            onFocus: () => this.focused = i,
                                            onKeyDown: this.onKeyDown
                                        });
                                    }
                                )
                                }
                                {this.props.previewMax &&
                                Math.min(values.length, showUpTo) > this.props.previewMax ?
                                    <button className={"gl-no-shrink" + (this.props.moreBtnClass ? " " + this.props.moreBtnClass : "")}
                                            onClick={() => this.setState({showAllClicked: !this.state.showAllClicked})}>
                                        {this.state.showAllClicked ? "Less" : "More"}
                                    </button> : null
                                }
                            </div>
                        </div>

                }
            </div>
        );
    }

    private getDisplayN() {
        return Math.min(this.getShowUpTo(), this.props.previewMax === undefined || this.state.showAllClicked ?
            this.state.values.length : Math.min(this.props.previewMax, this.state.values.length));
    }

    private getShowUpTo() {
        return this.props.showMax ? this.props.showMax : Number.MAX_VALUE;
    }

    public componentDidMount(): void {
        this.setState({values: this.data.get()});
        this.favChangeSubscr = this.data.addChangeListener((favourites: FavouriteTrip[]) => this.setState({
                values: favourites
            })
        );
    }

    public componentWillUnmount(): void {
        this.favChangeSubscr.remove();
    }
}

export default FavouriteList;
