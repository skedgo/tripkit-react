import * as React from "react";
import Trip from "../model/trip/Trip";
import Segment from "../model/trip/Segment";
import "./TripRow.css";
import TransportUtil from "./TransportUtil";
import IconAngleDown from "-!svg-react-loader!../images/ic-angle-down.svg";
import TripDetail from "./TripDetail";
import IconMap from "-!svg-react-loader!../images/ic-map-marked.svg";
import Constants from "../util/Constants";
import TripGroup from "../model/trip/TripGroup";
import PlannedTripsTracker from "../analytics/PlannedTripsTracker";
import TripAltBtn from "./TripAltBtn";
import TripRowTime from "./TripRowTime";
import TripRowTrack from "./TripRowTrack";
import {IProps} from "./TripRow";
import {TrackTransportProps} from "./TrackTransport";
import ACTTrackTransport from "./ACTTrackTransport";

interface IState {
    showDetails: boolean;
}

class ACTTripRow extends React.Component<IProps, IState> {

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

    private static includesSchoolSegment(trip: Trip): boolean {
        for (const segment of trip.segments) {
            if (segment.isSchoolbus()) {
                return true;
            }
        }
        return false;
    }

    private static includesNonTCSegment(trip: Trip): boolean {
        for (const segment of trip.segments) {
            if (segment.isNonTCService()) {
                return true;
            }
        }
        return false;
    }

    public render(): React.ReactNode {
        const lineColor = ACTTripRow.getRepresentativeColor(this.props.value);
        const topRightComponent = !this.props.brief ?
            <button onClick={() => this.setState(prevState => {
                // TODO: add event "details"
                const showDetails = !prevState.showDetails;
                if (showDetails) {
                    PlannedTripsTracker.instance.scheduleTrack(false);
                }
                return ({showDetails: showDetails});
            })}
                    aria-expanded={this.state.showDetails}
                    aria-label="Details"
                    tabIndex={0}
            >
                <IconAngleDown className={"TripRow-iconAngleDown" + (this.state.showDetails ? " gl-rotate180" : "")}
                               aria-hidden={true}
                               tabIndex={-1}
                               focusable="false"
                />
            </button> : null;
        const involvesMyWay = this.props.value.segments.find((segment: Segment) => segment.isMyWay()) !== undefined;
        const clickHandler = this.props.onClick;
        const includesSchoolSegment = ACTTripRow.includesSchoolSegment(this.props.value);
        const includesNonTCSegment = ACTTripRow.includesNonTCSegment(this.props.value);
        return (
            <div className={"TripRow" + (this.props.className ? " " + this.props.className : "")}
                 onClick={clickHandler}
                 tabIndex={0}
                 onFocus={this.props.onFocus}
                 onKeyDown={this.props.onKeyDown}
                 ref={el => this.ref = el}
            >
                <div style={{ borderLeft: "4px solid " + lineColor }}>
                    <div className="TripRow-body">
                        <div className="gl-flex gl-space-between">
                            <TripRowTime value={this.props.value}/>
                            {topRightComponent}
                        </div>
                        {includesSchoolSegment && <div className="text">This includes a school service</div>}
                        {includesNonTCSegment && <div className="text">This includes a non TC service</div>}
                        <TripRowTrack value={this.props.value}
                                      renderTransport={(props: TrackTransportProps) => <ACTTrackTransport {...props}/>}
                        />
                    </div>
                    <div className="TripRow-footer gl-flex gl-align-center gl-space-between">
                        <img src={Constants.absUrl("/images/modeicons/ic-myway.svg")}
                             alt="My way ticketing"
                             role="img"
                             style={{
                                 visibility: involvesMyWay ? "visible" : "hidden",
                                 width: "20px",
                                 height: "20px"
                             }}
                        />
                        <button className="TripRow-mapBtn gl-link gl-flex gl-align-center"
                                onClick={() => {
                                    if (this.props.eventBus) {
                                        this.props.eventBus.emit("onChangeView", "mapView");
                                    }
                                }}
                        >
                            <IconMap className="TripPlanner-iconMap gl-charSpace" focusable="false"/>
                            View on Map
                        </button>
                        <div className="gl-flex gl-align-center">
                            <TripAltBtn
                                value={this.props.value as TripGroup}
                                onChange={(value: TripGroup) => {
                                    if (this.props.eventBus) {
                                        this.props.eventBus.emit(ACTTripRow.TRIP_ALT_PICKED_EVENT, this.props.value, value);
                                    }
                                }}
                            />
                            {this.props.value.getBicycleAccessible() ?
                                <img src={Constants.absUrl("/images/modeicons/ic-bikeRack.svg")}
                                     alt="Bicycle accessible trip"
                                     role="img"
                                     className="TripRow-bikeRackIcon"
                                /> : null}
                            {this.props.value.getWheelchairAccessible() ?
                                <img src={Constants.absUrl("/images/modeicons/ic-wheelchair.svg")}
                                     alt="Wheelchair accessible trip"
                                     role="img"
                                /> : null }
                        </div>
                    </div>
                </div>
                {this.state.showDetails ?
                    <TripDetail value={this.props.value}/>
                    : null}
            </div>
        )
    }

    public static getRepresentativeColor(trip: Trip): string | null {
        const representativeSegment = ACTTripRow.getRepresentativeSegment(trip);
        const representativeColor = representativeSegment !== null &&
        representativeSegment.modeInfo !== null ? TransportUtil.getTransportColor(representativeSegment.modeInfo) : "black";
        return representativeColor !== null ? representativeColor : "black";
    }

    private static getRepresentativeSegment(trip: Trip): Segment | null {
        let representativeSegment = null;
        for (const segment of trip.segments) {
            if (segment.isSchoolbus()) {
                representativeSegment = segment;
                break;
            }
            if (representativeSegment === null || segment.getDuration() > representativeSegment.getDuration()) {
                representativeSegment = segment;
            }
        }
        return representativeSegment;
    }
}

export default ACTTripRow;
export {IProps as TripRowProps};