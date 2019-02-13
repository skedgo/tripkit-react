import * as React from "react";
import Trip from "../model/trip/Trip";
import "./TripRow.css";
import {EventEmitter} from "fbemitter";
import TripGroup from "../model/trip/TripGroup";
import TripAltBtn from "./TripAltBtn";
import TripRowTime from "./TripRowTime";
import TripRowTrack from "./TripRowTrack";
import {default as TrackTransport, TrackTransportProps} from "./TrackTransport";

export interface IProps {
    value: Trip;
    className?: string;
    brief?: boolean;
    onClick?: () => void;
    onFocus?: () => void;
    onKeyDown?: (e: any) => void;
    eventBus?: EventEmitter;
}

interface IState {
    showDetails: boolean;
}

class TripRow extends React.Component<IProps, IState> {

    public static readonly TRIP_ALT_PICKED_EVENT = "onTripAltPicked";

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
                                this.props.eventBus.emit(TripRow.TRIP_ALT_PICKED_EVENT, this.props.value, value);
                            }
                        }}
                    />
                </div>
            </div>
        )
    }
}

export default TripRow;
export {IProps as TripRowProps};