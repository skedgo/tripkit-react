import * as React from "react";
import Segment from "../model/trip/Segment";
import {TrackTransportProps} from "./TrackTransport";
import IconAngleRight from "-!svg-react-loader!../images/ic-angle-right.svg";
import Trip from "../model/trip/Trip";

export interface IProps {
    value: Trip;
    renderTransport: <P extends TrackTransportProps>(transportProps: P) => JSX.Element;
}

class TripRowTrack extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        let brief: boolean | undefined;
        const nOfSegments = this.props.value.segments.filter((segment: Segment) => segment.visibilityType === Segment.Visibility.IN_SUMMARY).length;
        if (nOfSegments > 5 || (nOfSegments > 3 && window.innerWidth <= 400)) {
            brief = true;
        } else if (nOfSegments < 5) {
            brief = false;
        }
        const TrackTransport = this.props.renderTransport;
        return (
            <div className="TripRow-trackPanel gl-flex gl-align-center">
                { this.props.value.segments.reduce((accum: any[], segment: Segment, i: number) => {
                        if (segment.visibilityType === Segment.Visibility.IN_SUMMARY) {
                            accum.push(<TrackTransport segment={segment} brief={brief} key={i}/>);
                            const last = segment.isLast(Segment.Visibility.IN_SUMMARY);
                            if (!last) {
                                accum.push(<IconAngleRight
                                    className={"TrackTransport-angleRight" + (brief === false ? " gl-charSpace gl-charSpaceLeft" : "")}
                                    role="img"  // Needed to be read by iOS VoiceOver
                                    aria-label=", then"
                                    focusable="false"
                                    key={i + "icAngleRight"}
                                />)
                            }
                        }
                        return accum;
                    },
                    [])
                }
            </div>
        );
    }
}

export default TripRowTrack;