import * as React from "react";
import "./TripRow.css";
import TripGroup from "../model/trip/TripGroup";
import TripAltBtn from "./TripAltBtn";
import TripRowTime from "./TripRowTime";
import TripRowTrack from "./TripRowTrack";
import {default as TrackTransport, TrackTransportProps} from "./TrackTransport";
import {default as IProps, TRIP_ALT_PICKED_EVENT} from "./ITripRowProps";

interface IState {
    showDetails: boolean;
}

class TripRow extends React.Component<IProps, IState> {

    private ref: any;

    constructor(props: IProps) {
        super(props);
        this.state = {
            showDetails: false
        };
    }

    public focus() {
        this.ref.focus();
    }

    public render(): React.ReactNode {
        return (
            <div className={"TripRow" + (this.props.className ? " " + this.props.className : "")}
                 onClick={this.props.onClick}
                 tabIndex={0}
                 onFocus={this.props.onFocus}
                 onKeyDown={this.props.onKeyDown}
                 ref={el => this.ref = el}
            >
                <div className="TripRow-body">
                    <TripRowTime value={this.props.value} brief={this.props.brief}/>
                    <TripRowTrack value={this.props.value}
                                  renderTransport={(props: TrackTransportProps) => <TrackTransport {...props}/>}
                    />
                </div>
                <div className="TripRow-footer gl-flex gl-align-center gl-space-between">
                    <TripAltBtn
                        value={this.props.value as TripGroup}
                        onChange={(value: TripGroup) => {
                            if (this.props.eventBus) {
                                this.props.eventBus.emit(TRIP_ALT_PICKED_EVENT, this.props.value, value);
                            }
                        }}
                        renderTrip={<P extends IProps>(props: P) => <TripRow {...props}/>}
                    />
                </div>
            </div>
        )
    }
}

export default TripRow;