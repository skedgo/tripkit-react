import TripGroup from "../model/trip/TripGroup";
import * as React from "react";
import Tooltip from "rc-tooltip";
import TripAlternativesView from "./TripAlternativesView";
import ITripRowProps from "./ITripRowProps";

interface IProps {
    value: TripGroup;
    onChange: (value: TripGroup) => void;
    renderTrip: <P extends ITripRowProps>(tripRowProps: P) => JSX.Element;
}

class TripAltBtn extends React.Component<IProps, {}> {

    private altTripsRef: any;

    public render(): React.ReactNode {
        return this.props.value instanceof TripGroup && (this.props.value as TripGroup).trips.length > 1 &&
            <Tooltip placement="right"
                     overlay={
                         <TripAlternativesView value={this.props.value as TripGroup}
                                               onChange={this.props.onChange}
                                               renderTrip={this.props.renderTrip}
                                               ref={el => this.altTripsRef = el}
                         />
                     }
                     overlayClassName="app-style TripRow-altTooltip"
                     mouseEnterDelay={.5}
                     trigger={["click"]}
                     onVisibleChange={visible => {
                         setTimeout(() => {
                             if (visible) {
                                 this.altTripsRef.focus();
                             }
                         }, 500);
                     }}
            >
                <button className="gl-link gl-charSpace">
                    Alternatives
                </button>
            </Tooltip>;
    }
}

export default TripAltBtn;