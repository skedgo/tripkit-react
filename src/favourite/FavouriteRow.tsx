import * as React from "react";
import './FavouriteRow.css';
import FavouriteTrip from "../model/FavouriteTrip";
import IconAngleRight from "-!svg-react-loader!../images/ic-angle-right.svg";
import FavouriteBtn from "./FavouriteBtn";
import LocationUtil from "../util/LocationUtil";
import FavouriteOptions from "./FavouriteOptions";

interface IProps {
    favourite: FavouriteTrip;
    recent?: boolean;
    onClick?: () => void;
    onKeyDown?: (e: any) => void;
    onFocus?: (e: any) => void;
}

class FavouriteRow extends React.Component<IProps, {}> {

    private ref: any;

    constructor(props: IProps) {
        super(props);
    }

    public focus() {
        this.ref.focus();
    }

    public render(): React.ReactNode {
        const from = this.props.favourite.from;
        const to = this.props.favourite.to;
        return (
            <div className="FavouriteRow gl-flex gl-column"
                 tabIndex={0}
                 onFocus={this.props.onFocus}
                 onKeyDown={this.props.onKeyDown}
                 aria-label={"From " + LocationUtil.getMainText(from) + " to " + LocationUtil.getMainText(to)}
                 ref={el => this.ref = el}
            >
                <button className="FavouriteRow-summaryPanel gl-flex gl-align-center gl-space-between"
                        aria-label="Compute trips"
                        onClick={this.props.onClick}>
                    <div className="FavouriteRow-fromToPanel gl-flex gl-column">
                        <div className="FavouriteRow-addFirst gl-overflow-ellipsis">{LocationUtil.getMainText(from)}</div>
                        <div className="FavouriteRow-addSecond gl-overflow-ellipsis"
                             aria-hidden={true}>{LocationUtil.getSecondaryText(from)}</div>
                    </div>
                    <IconAngleRight className="FavouriteRow-iconAngle" aria-label="to" focusable="false"/>
                    <div className="FavouriteRow-fromToPanel gl-flex gl-column">
                        <div className="FavouriteRow-addFirst gl-overflow-ellipsis">{LocationUtil.getMainText(to)}</div>
                        <div className="FavouriteRow-addSecond gl-overflow-ellipsis"
                             aria-hidden={true}>{LocationUtil.getSecondaryText(to)}</div>
                    </div>
                </button>
                <div className="FavouriteRow-actionPanel gl-flex gl-space-between gl-align-center">
                    <FavouriteBtn favourite={this.props.favourite}/>
                    { this.props.favourite.options ?
                        <FavouriteOptions favourite={this.props.favourite}/> : null}
                </div>
            </div>
        );
    }

}

export default FavouriteRow;